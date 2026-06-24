"""
core/engine.py — SignalHub Core
Scorer + Groq + Telegram. Importado por cada bot separadamente.
"""

import json
import logging
import re
from datetime import datetime, timedelta
from pathlib import Path

import httpx
import yaml


class RateLimiter:
    def __init__(self, max_por_hora: int):
        self.max = max_por_hora
        self._hist: list[datetime] = []

    def pode(self) -> bool:
        agora = datetime.now()
        self._hist = [t for t in self._hist if t > agora - timedelta(hours=1)]
        return len(self._hist) < self.max

    def registrar(self):
        self._hist.append(datetime.now())


_FALLBACK_PROMPT = (
    "Gere 3 respostas curtas em JSON: {{\"r1\":\"...\",\"r2\":\"...\",\"r3\":\"...\"}}. "
    "Tom profissional. Sem promessas de resultado."
)

# Marcadores típicos de pt-BR (alerta pós-revisão; não bloqueia envio)
_PT_BR_MARCADORES = (
    r"\bvocê\b",
    r"\bvoce\b",
    r"\bcontato\b",
    r"\baplicativo\b",
    r"\bprocon\b",
    r"\bcdc\b",
    r"\breclame aqui\b",
    r"\bnosso time\b",
    r"\bordenado\b",
    r"\bcarteira\b",
    r"\bcelular\b",
)


class SignalHubEngine:
    def __init__(self, config_path: Path, env: dict, log: logging.Logger):
        self.log = log
        self.env = env
        self.config_path = config_path
        self.cfg = yaml.safe_load(config_path.read_text(encoding="utf-8"))
        self._prompts = self._carregar_prompts()

        self.nicho_id = list(self.cfg["nichos"].keys())[0]
        self.nicho_cfg = self.cfg["nichos"][self.nicho_id]
        self.score_min = self.nicho_cfg.get("score_minimo", 7)
        self.rl = RateLimiter(int(env.get("MAX_ALERTAS_POR_HORA", 20)))
        self._seen_urls: set[str] = set()
        self._ultimo_aviso_pt_br: list[str] = []

    def _carregar_prompts(self) -> dict:
        path = self.config_path.parent / "prompts.yaml"
        if not path.exists():
            self.log.warning(f"prompts.yaml ausente em {path.parent} — usando fallback genérico")
            return {}
        return yaml.safe_load(path.read_text(encoding="utf-8")) or {}

    def score(self, texto: str) -> tuple[int, str]:
        t = texto.lower()
        bonus = 0
        for frase in self.cfg.get("intencao_alta", []):
            if frase in t:
                bonus = 2
                break

        best_score, best_grupo = 0, ""
        for gid, g in self.nicho_cfg.get("grupos", {}).items():
            peso = g.get("peso", 5)
            for kw in g.get("keywords", []):
                if kw.lower() in t:
                    s = min(peso + bonus, 10)
                    if s > best_score:
                        best_score, best_grupo = s, gid
        return best_score, best_grupo

    def _regras_setor(self, grupo_id: str) -> dict:
        leg = self.nicho_cfg.get("legal_pt") or {}
        setores = leg.get("setores") or {}
        geral = leg.get("geral") or {}
        setor = setores.get(grupo_id) or {}
        prazo = setor.get("prazo") or geral.get("prazo_resposta") or leg.get(
            "prazo_resposta", "15 dias úteis"
        )
        return {
            "prazo": prazo,
            "base_prazo": setor.get("base_prazo")
            or geral.get("base_prazo")
            or leg.get("base_prazo", "DL 156/2005 / Livro de Reclamações"),
            "nota_setor": (setor.get("nota_prazo") or "").strip(),
            "regulatorio": setor.get("regulatorio", ""),
            "detecao": leg.get(
                "instrucao_deteccao",
                "Adaptar o prazo e o órgão ao setor inferido do post; se ambíguo, usar regra geral e mencionar prudência.",
            ),
        }

    def _contexto_legal(self, grupo_id: str) -> str:
        leg = self.nicho_cfg.get("legal_pt") or {}
        if not leg:
            return ""
        grupo = self.nicho_cfg["grupos"][grupo_id]
        setor = self._regras_setor(grupo_id)
        precos = self.nicho_cfg.get("precos") or {}
        sug = grupo.get("plano_sugerido", "padrao")
        preco_map = {
            "essencial": precos.get("essencial"),
            "padrao": precos.get("padrao"),
            "completo": precos.get("completo"),
        }
        preco_sug = preco_map.get(sug, precos.get("padrao"))
        linhas = [
            setor["detecao"],
            f"Setor detectado (scoring): {grupo_id} — {grupo.get('nome', '')}",
            f"Prazo a usar na R2: {setor['prazo']} ({setor['base_prazo']})",
            f"Lei consumidor: {leg.get('lei_base', 'Lei n.º 24/96')}",
        ]
        if setor["regulatorio"]:
            linhas.append(f"Entidade reguladora/setorial: {setor['regulatorio']}")
        if setor["nota_setor"]:
            linhas.append(f"Nota setorial (incorporar na R2 com prudência): {setor['nota_setor']}")
        linhas.extend([
            f"Referência honorários consulta advocatícia: cerca de €{leg.get('consulta_advogado_eur', 48)}",
            f"Plano sugerido: {sug} — €{preco_sug}",
            f"ROI grupo: {grupo.get('roi_referencia', '').strip()}",
            f"Regra fontes: {leg.get('nota_fontes', 'Não citar bases de dados antes do pagamento.')}",
        ])
        roteiro = leg.get("roteiro_obrigatorio")
        if roteiro:
            linhas.append(f"Roteiro:\n{roteiro.strip()}")
        return "\n".join(linhas)

    def _contexto_comercial(self, grupo_id: str) -> str:
        grupo = self.nicho_cfg["grupos"][grupo_id]
        partes: list[str] = []
        legal = self._contexto_legal(grupo_id)
        if legal:
            partes.append(legal)
        if roi := grupo.get("roi_referencia"):
            partes.append(f"Referência casos semelhantes (informativo): {roi.strip()}")
        precos = self.nicho_cfg.get("precos") or {}
        if precos:
            e, p, c = precos.get("essencial"), precos.get("padrao"), precos.get("completo")
            sug = grupo.get("plano_sugerido", "padrao")
            partes.append(
                f"Planos: Essencial €{e} · Padrão €{p} · Completo €{c}. "
                f"Sugerido para este grupo: {sug}."
            )
            if tag := precos.get("tagline"):
                partes.append(str(tag))
        return "\n".join(partes) if partes else "Sem contexto comercial extra."

    def _fallback_respostas(self, grupo_id: str) -> list[str]:
        leg = self.nicho_cfg.get("legal_pt") or {}
        if not leg:
            cta = self.nicho_cfg.get("cta_link", "")
            return [
                "Olá — a sua situação merece ser analisada com calma.",
                "Há enquadramento legal aplicável; podemos orientar os próximos passos.",
                f"Solicite informação em {cta}.",
            ]
        grupo = self.nicho_cfg["grupos"][grupo_id]
        precos = self.nicho_cfg.get("precos") or {}
        sug = grupo.get("plano_sugerido", "padrao")
        preco = precos.get(sug, precos.get("padrao", 39))
        setor = self._regras_setor(grupo_id)
        prazo = setor["prazo"]
        lei = leg.get("lei_base", "Lei n.º 24/96")
        consulta = leg.get("consulta_advogado_eur", 48)
        roi = (grupo.get("roi_referencia") or "valores variáveis").strip().replace("\n", " ")
        link = self.nicho_cfg.get("cta_link", "")
        marca = self.nicho_cfg.get("marca") or self.nicho_cfg.get("nome", "")
        nota_setor = f" {setor['nota_setor']}" if setor["nota_setor"] else ""
        return [
            f"Olá — obrigado por partilhar a sua questão. Compreendemos a frustração e "
            f"trataremos o seu caso com a atenção que merece.",
            f"Em {lei}, após reclamação formal (ex.: Livro de Reclamações), o fornecedor "
            f"deve responder em até {prazo} ({setor['base_prazo']}).{nota_setor} "
            f"Se esse prazo já passou, pode procurar apoio jurídico; consultas costumam rondar "
            f"os €{consulta}. Em casos semelhantes analisados, {roi} — referência informativa.",
            f"A {marca} prepara relatório documental reservado (plano sugerido: €{preco}, "
            f"valor confirmado por escrito). Avalie com o advogado que escolher. "
            f"Referências completas após contratação: {link}",
        ]

    def _usar_revisao_groq(self) -> bool:
        if not self.nicho_cfg.get("legal_pt"):
            return False
        if self.env.get("GROQ_REVISAO", "1").strip().lower() in ("0", "false", "nao", "não"):
            return False
        return bool(self._prompts.get("groq_revisao_template"))

    def _detectar_pt_br(self, respostas: list[str]) -> list[str]:
        texto = " ".join(respostas).lower()
        return [p for p in _PT_BR_MARCADORES if re.search(p, texto, re.I)]

    def _parse_respostas_json(self, raw: str) -> list[str]:
        raw = re.sub(r"```json|```", "", raw).strip()
        if not raw:
            raise ValueError("resposta Groq vazia")
        try:
            p = json.loads(raw)
        except json.JSONDecodeError:
            m = re.search(r'\{[^{}]*"r1"\s*:', raw, re.DOTALL)
            if not m:
                m = re.search(r"\{.*\}", raw, re.DOTALL)
            if not m:
                raise ValueError(f"JSON invalido na resposta Groq: {raw[:120]!r}")
            p = json.loads(m.group(0))
        return [p.get("r1", ""), p.get("r2", ""), p.get("r3", "")]

    async def _groq_completion(
        self,
        system: str,
        user: str,
        *,
        max_tokens: int = 450,
        temperature: float = 0.7,
    ) -> str:
        model = self.env.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        async with httpx.AsyncClient(timeout=35) as c:
            r = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.env['GROQ_API_KEY']}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                },
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"].strip()

    async def _revisar_respostas_pt(
        self, rascunho: list[str], texto_post: str, grupo_id: str
    ) -> list[str]:
        tpl = self._prompts.get("groq_revisao_template", "")
        leg = self.nicho_cfg.get("legal_pt") or {}
        gloss = "\n".join(f"- {g}" for g in (leg.get("glossario_pt_pt") or []))
        fmt = {
            "marca": self.nicho_cfg.get("marca") or self.nicho_cfg.get("nome", ""),
            "glossario_pt_pt": gloss or "(ver regras no prompt)",
            "r1": rascunho[0],
            "r2": rascunho[1],
            "r3": rascunho[2],
        }
        try:
            system = tpl.format(**fmt)
        except KeyError:
            system = tpl
        user = f'Post original: "{texto_post[:500]}"\nRascunho a rever (JSON).'
        try:
            raw = await self._groq_completion(system, user, temperature=0.3)
            revisado = self._parse_respostas_json(raw)
            self.log.info("Groq revisão pt-PT concluída")
            return revisado
        except Exception as e:
            self.log.error(f"Groq revisão falhou: {e} — mantém rascunho")
            return rascunho

    async def gerar_respostas(self, texto: str, grupo_id: str) -> list[str]:
        grupo = self.nicho_cfg["grupos"][grupo_id]
        nicho_nome = self.nicho_cfg["nome"]
        grupo_nome = grupo["nome"]
        cta_link = self.nicho_cfg.get("cta_link", "")
        cta_txt = self.nicho_cfg.get("cta_texto", "")

        template = self._prompts.get("groq_system_template", _FALLBACK_PROMPT)
        leg = self.nicho_cfg.get("legal_pt") or {}
        precos = self.nicho_cfg.get("precos") or {}
        sug = grupo.get("plano_sugerido", "padrao")
        preco_sug = precos.get(sug, precos.get("padrao", ""))
        setor = self._regras_setor(grupo_id)
        fmt = {
            "nicho_nome": nicho_nome,
            "grupo_nome": grupo_nome,
            "cta_txt": cta_txt,
            "cta_link": cta_link,
            "contexto_comercial": self._contexto_comercial(grupo_id),
            "lei_base": leg.get("lei_base", "Lei n.º 24/96"),
            "prazo_resposta": setor["prazo"],
            "base_prazo": setor["base_prazo"],
            "nota_setor": setor["nota_setor"] or "Regra geral do Livro de Reclamações.",
            "consulta_advogado_eur": leg.get("consulta_advogado_eur", 48),
            "preco_sugerido": preco_sug,
        }
        try:
            system = template.format(**fmt)
        except KeyError as err:
            self.log.warning(f"Prompt placeholder ausente: {err}")
            system = template.format(
                nicho_nome=nicho_nome,
                grupo_nome=grupo_nome,
                cta_txt=cta_txt,
                cta_link=cta_link,
                contexto_comercial=self._contexto_comercial(grupo_id),
                lei_base=fmt["lei_base"],
                prazo_resposta=fmt["prazo_resposta"],
                base_prazo=fmt["base_prazo"],
                consulta_advogado_eur=fmt["consulta_advogado_eur"],
                preco_sugerido=fmt["preco_sugerido"],
                nota_setor=fmt["nota_setor"],
            )

        try:
            user_msg = (
                f'Post: "{texto[:500]}"\n'
                "Responda APENAS um objeto JSON com as chaves r1, r2 e r3 (strings). "
                "Sem texto antes ou depois. Sem markdown."
            )
            raw = await self._groq_completion(
                system, user_msg, max_tokens=400, temperature=0.5
            )
            rascunho = self._parse_respostas_json(raw)
            if self._usar_revisao_groq():
                return await self._revisar_respostas_pt(rascunho, texto, grupo_id)
            return rascunho
        except Exception as e:
            self.log.error(f"Groq erro: {e}")
            return self._fallback_respostas(grupo_id)

    async def enviar_alerta(
        self,
        texto: str,
        link: str,
        autor: str,
        grupo_id: str,
        score: int,
        respostas: list[str],
        *,
        fonte: str = "",
        dork_id: str = "",
    ) -> bool:
        token = self.env.get("TELEGRAM_BOT_TOKEN", "")
        chat_id = self.env.get("TELEGRAM_CHAT_ID", "")

        if not token or not chat_id:
            self.log.error("BOT_TOKEN ou CHAT_ID ausente no .env")
            return False

        grupo_nome = self.nicho_cfg["grupos"][grupo_id]["nome"]
        emoji = self.nicho_cfg.get("emoji", "📌")
        nicho_nome = self.nicho_cfg.get("marca") or self.nicho_cfg["nome"]

        citacao = texto[:200].replace("<", "&lt;").replace(">", "&gt;")
        if len(texto) > 200:
            citacao += "..."

        r1, r2, r3 = respostas
        origem = fonte or "web"
        if dork_id:
            origem = f"{origem} · {dork_id}"

        msg = (
            f"{emoji} <b>{nicho_nome}</b>\n"
            f"📂 {grupo_nome} — Score: <b>{score}/10</b>\n"
            f"🔍 {origem}\n"
            f"👤 {autor}\n"
            "━━━━━━━━━━━━━━━━━━\n"
            f'<i>"{citacao}"</i>\n'
            "━━━━━━━━━━━━━━━━━━\n\n"
            f"<b>R1 — Acolhimento:</b>\n{r1}\n\n"
            f"<b>R2 — Enquadramento legal:</b>\n{r2}\n\n"
            f"<b>R3 — Relatório reservado:</b>\n{r3}\n\n"
            f"🔗 <a href='{link}'>Ver post original</a>"
        )

        precos = self.nicho_cfg.get("precos")
        if precos:
            e, p, c = precos.get("essencial"), precos.get("padrao"), precos.get("completo")
            grupo = self.nicho_cfg["grupos"][grupo_id]
            sug = grupo.get("plano_sugerido", "padrao")
            labels = {"essencial": "Essencial", "padrao": "Padrão", "completo": "Completo"}
            sug_label = labels.get(sug, sug)
            dominio = self.nicho_cfg.get("dominio", "")
            link = self.nicho_cfg.get("cta_link", "")
            dom_txt = f" · <a href='{link}'>{dominio}</a>" if dominio and link else ""
            msg += (
                f"\n\n💶 <b>{nicho_nome}</b>{dom_txt}\n"
                f"{precos.get('tagline', '')}\n"
                f"Essencial <b>€{e}</b> · Padrão <b>€{p}</b> · Completo <b>€{c}</b>\n"
                f"↳ Sugerido: <b>{sug_label}</b> · {precos.get('nota', '')}"
            )

        if self._ultimo_aviso_pt_br:
            msg += (
                "\n\n⚠️ <i>Revisar linguagem: possível pt-BR detectado "
                f"({len(self._ultimo_aviso_pt_br)} indício(s))</i>"
            )

        empresa = self.nicho_cfg.get("empresa") or {}
        if empresa.get("operador") or empresa.get("atuacao"):
            atuacao = empresa.get("atuacao", "Pesquisa jurídica documental")
            juris = empresa.get("jurisdicao", "RGPD · Portugal")
            msg += f"\n\n<i>{atuacao} · {juris}</i>"

        kb = {
            "inline_keyboard": [[
                {"text": "✅ R1", "callback_data": f"r1|{link[:50]}"},
                {"text": "✅ R2", "callback_data": f"r2|{link[:50]}"},
                {"text": "✅ R3", "callback_data": f"r3|{link[:50]}"},
                {"text": "🗑 Descartar", "callback_data": f"drop|{link[:50]}"},
            ]]
        }

        try:
            async with httpx.AsyncClient(timeout=15) as c:
                r = await c.post(
                    f"https://api.telegram.org/bot{token}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": msg,
                        "parse_mode": "HTML",
                        "disable_web_page_preview": True,
                        "reply_markup": kb,
                    },
                )
                if r.status_code != 200:
                    self.log.error(f"Telegram {r.status_code}: {r.text}")
                    return False
                return True
        except Exception as e:
            self.log.error(f"Telegram exc: {e}")
            return False

    def ja_viu(self, url: str) -> bool:
        return url in self._seen_urls

    def marcar_visto(self, url: str) -> None:
        self._seen_urls.add(url)

    async def processar(self, post: dict, *, dry_run: bool = False) -> bool:
        if self.ja_viu(post["link"]):
            return False

        score, grupo_id = self.score(post["texto"])
        if score < self.score_min or not grupo_id:
            self.log.debug(f"score={score} ignorado: {post['texto'][:60]}")
            self.marcar_visto(post["link"])
            return False

        if not self.rl.pode():
            self.log.warning("Rate limit — alerta suprimido")
            return False

        self.log.info(f"Qualificado score={score} grupo={grupo_id}")
        respostas = await self.gerar_respostas(post["texto"], grupo_id)
        self._ultimo_aviso_pt_br = self._detectar_pt_br(respostas)
        if self._ultimo_aviso_pt_br:
            self.log.warning(f"Possível pt-BR após revisão: {self._ultimo_aviso_pt_br}")

        if dry_run:
            self.log.info(f"[DRY] {post['link']}")
            return True

        ok = await self.enviar_alerta(
            post["texto"], post["link"], post["autor"],
            grupo_id, score, respostas,
            fonte=post.get("fonte", ""),
            dork_id=post.get("dork_id", ""),
        )
        self.marcar_visto(post["link"])
        if ok:
            self.rl.registrar()
        return ok

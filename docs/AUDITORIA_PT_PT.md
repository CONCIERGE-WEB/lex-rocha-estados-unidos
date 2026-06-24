# Auditoria Portugal — pt-PT, domínio e pipeline Groq

**Data:** 2026-06-04  
**Canónico:** `https://www.direitosconsumidor.com`  
**Marca:** Direitos do Consumidor

---

## Domínio — está certo em pt-PT?

| Item | Estado |
|------|--------|
| Nome em português de Portugal | **Sim** — «direitos do consumidor» é frase natural em PT |
| Extensão `.com` | Aceite; compensar com Search Console → Portugal |
| `pesquisalegal.pt` / `.com` | **Descontinuado** no código activo |
| `*.vercel.app` | Apenas staging — não face pública |

**Veredito domínio:** `direitosconsumidor.com` está **correcto** para SEO e confiança com orçamento limitado.

---

## Pipeline Groq (implementado)

| Passo | Agente | Ficheiro |
|-------|--------|----------|
| 1 | Redator | `prompts.yaml` → `groq_system_template` |
| 2 | Revisor pt-PT | `prompts.yaml` → `groq_revisao_template` |
| Controlo | `GROQ_REVISAO=1` em `portugal/.env` | |

Se a revisão falhar, mantém-se o rascunho. Telegram avisa se ainda detectar marcas pt-BR.

---

## Correcções aplicadas nesta auditoria

| Ficheiro | Problema | Acção |
|----------|----------|--------|
| `lex-rocha-pt/README.md` | pesquisalegal.pt | → direitosconsumidor.com |
| `DEPLOY_PT.md` | domínio antigo | actualizado |
| `CONFIDENCIAL.md` | marca/domínio antigos | actualizado |
| `conectar_portugal.py` | pesquisalegal | actualizado |
| `cookie-banner.tsx` | storage key antiga | actualizado |
| `copy-pt.ts` | DGSI no hero (alertas não citam) | suavizado |
| `keywords.yaml` | glossário pt-PT | adicionado |
| `engine.py` | só 1 passagem Groq | 2 passagens + detector pt-BR |

---

## O que permanece pt-BR / Brasil (intencional)

| Área | Motivo |
|------|--------|
| `lex/` + `zairyx/` bots | Mercado Brasil — não alterar |
| Rodapé | Marca institucional — sem nome pessoal nem CNPJ |
| `legal-rgpd.ts` transferência BR | Transparência RGPD |

---

## Checklist operacional

- [ ] Registar `direitosconsumidor.com`
- [ ] E-mail `contacto@` e `privacidade@` no domínio
- [ ] `GROQ_REVISAO=1` em `portugal/.env`
- [ ] Revisão humana final antes de colar (Telegram)

---

## Testes automáticos

`pytest` — inclui setor ANACOM, domínio, fallback pt-PT, placeholders revisão.

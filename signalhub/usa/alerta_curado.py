"""
SignalHub USA — curated alerts from the local bank (no free-form R2 LLM).

Legacy BR category ids may still appear as aliases; prefer US statute ids.
Never use CNJ TPU codes or Brazilian tribunal dockets here.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse, urlunparse

HUB_ROOT = Path(__file__).resolve().parent
BANCO_DIR = HUB_ROOT.parent / "site" / "src" / "lib" / "pipeline-confiavel" / "banco"
DEDUP_PATH = HUB_ROOT / "logs" / "alertas-dedup.json"

R3_DIVULGACAO_COMERCIAL = (
    "Judicial Intelligence | Tiago A. Rocha is a paid documentary legal research service "
    "for situations like this. If you want, https://www.judicialintelligence.com/request"
)

R1_ACOLHIMENTO = (
    "I understand how frustrating this consumer dispute can feel — you are not alone."
)

# US-first rules; legacy BR slug kept only as alias target via categorias.ts on site.
REGRAS_CATEGORIA: list[tuple[str, list[str]]] = [
    (
        "fcra_credit_reporting",
        [
            "credit report",
            "fcra",
            "equifax",
            "experian",
            "transunion",
            "inaccurate file",
            "consumer reporting",
        ],
    ),
    (
        "fdcpa_debt_collection",
        [
            "debt collector",
            "fdcpa",
            "collection call",
            "harassing collection",
            "debt collection",
        ],
    ),
    (
        "tcpa_robocalls",
        ["robocall", "tcpa", "autodialer", "spam text", "unsolicited text"],
    ),
    (
        "dot_flights_baggage",
        [
            "flight delay",
            "airline",
            "baggage",
            "cancelled flight",
            "denied boarding",
            "dot ",
        ],
    ),
    (
        "lemon_law_warranty",
        ["lemon law", "warranty", "defective vehicle", "magnuson-moss"],
    ),
    (
        "udap_deceptive_practices",
        ["junk fee", "deceptive", "unfair practice", "udap", "false advertising"],
    ),
    (
        "health_plan_denial",
        ["claim denied", "erisa", "health insurance denial", "coverage denied"],
    ),
]


def _norm_url(url: str) -> str:
    try:
        p = urlparse(url.strip())
        return urlunparse((p.scheme, p.netloc, p.path.rstrip("/"), "", "", "")).lower()
    except Exception:
        return url.strip().lower()


def classificar_categoria(texto: str) -> str | None:
    t = texto.lower()
    melhor: tuple[str, int] | None = None
    for cat, termos in REGRAS_CATEGORIA:
        hits = sum(1 for term in termos if term in t)
        if hits == 0:
            continue
        if melhor is None or hits > melhor[1]:
            melhor = (cat, hits)
    return melhor[0] if melhor else None


def carregar_banco(categoria: str) -> dict[str, Any]:
    path = BANCO_DIR / f"{categoria}.json"
    if not path.is_file():
        raise FileNotFoundError(f"Banco ausente: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def montar_r2(banco: dict[str, Any]) -> str:
    return " ".join(f["texto_resumido"] for f in banco.get("fundamentos_legais", []))


def carregar_dedup(path: Path = DEDUP_PATH) -> list[dict[str, str]]:
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def registrar_dedup(url: str, historico: list[dict[str, str]] | None = None, path: Path = DEDUP_PATH) -> list[dict[str, str]]:
    hist = list(historico if historico is not None else carregar_dedup(path))
    hist.append({"url": url, "alertadoEm": datetime.now(timezone.utc).isoformat()})
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(hist, ensure_ascii=False, indent=2), encoding="utf-8")
    return hist


def url_ja_alertada(url: str, historico: list[dict[str, str]], janela_dias: int, agora: datetime | None = None) -> bool:
    agora = agora or datetime.now(timezone.utc)
    alvo = _norm_url(url)
    for h in historico:
        if _norm_url(h.get("url", "")) != alvo:
            continue
        try:
            alertado = datetime.fromisoformat(h["alertadoEm"].replace("Z", "+00:00"))
        except Exception:
            continue
        dias = (agora - alertado).total_seconds() / 86400
        if dias <= janela_dias:
            return True
    return False


def post_recente(publicado_em: str, max_dias: int, agora: datetime | None = None) -> bool:
    agora = agora or datetime.now(timezone.utc)
    try:
        pub = datetime.fromisoformat(publicado_em.replace("Z", "+00:00"))
    except Exception:
        return False
    dias = (agora - pub).total_seconds() / 86400
    return 0 <= dias <= max_dias


def montar_alerta(
    *,
    url: str,
    texto: str,
    publicado_em: str,
    historico: list[dict[str, str]] | None = None,
    recencia_max_dias: int | None = None,
    dedup_janela_dias: int | None = None,
) -> dict[str, Any]:
    recencia = recencia_max_dias if recencia_max_dias is not None else int(os.getenv("SIGNALHUB_RECENCIA_MAX_DIAS", "21"))
    dedup = dedup_janela_dias if dedup_janela_dias is not None else int(os.getenv("SIGNALHUB_DEDUP_JANELA_DIAS", "30"))
    hist = historico if historico is not None else carregar_dedup()

    categoria = classificar_categoria(texto)
    if not categoria:
        return {"status": "suprimido", "motivo": "categoria_nao_mapeada", "detalhe": "Sem categoria"}

    try:
        banco = carregar_banco(categoria)
    except FileNotFoundError as e:
        return {"status": "suprimido", "motivo": "categoria_nao_mapeada", "detalhe": str(e)}

    if not banco.get("citacoes_conferidas"):
        return {
            "status": "suprimido",
            "motivo": "citacoes_nao_conferidas",
            "detalhe": f"Categoria {categoria} com citacoes_conferidas=false",
        }


    if not post_recente(publicado_em, recencia):
        return {"status": "suprimido", "motivo": "post_antigo", "detalhe": f"Fora de {recencia} dias"}

    if url_ja_alertada(url, hist, dedup):
        return {"status": "suprimido", "motivo": "url_duplicada", "detalhe": "URL já alertada"}

    r2 = montar_r2(banco)
    return {
        "status": "ok",
        "categoria": categoria,
        "r1": R1_ACOLHIMENTO,
        "r2": r2,
        "r3": R3_DIVULGACAO_COMERCIAL,
    }

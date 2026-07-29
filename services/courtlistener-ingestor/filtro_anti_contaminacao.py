"""Anti-contamination barrier for U.S. CourtListener category pools.

SECURITY (clone from BR Lex Rocha):
  Never import CNJ TPU codes (4838/4839 SFH, 10423–10427, 4829 aviation SGT).
  U.S. ingest uses CourtListener English queries + lexical/MiniLM anchors only.

This module rejects cross-category pollution, especially:
  - mortgage / housing finance language inside airline (DOT) pools
  - airline language inside FCRA / FDCPA pools when clearly mortgage-only
"""
from __future__ import annotations

import re
import unicodedata
from typing import Any

_MORTGAGE_BAN = re.compile(
    r"\bmortgage\b|\bhousing\s+loan\b|\bforeclosure\b|deed\s+of\s+trust|"
    r"\bfannie\s+mae\b|\bfreddie\s+mac\b|\bhud[- ]?1\b|"
    r"sistema\s+financeiro\s+da\s+habita|\bSFH\b|\bmutu[aá]rio\b",
    re.IGNORECASE,
)

_AIRLINE_BAN = re.compile(
    r"\bairline\b|\bair\s+carrier\b|\bflight\s+delay\b|\bbaggage\b|"
    r"\btarmac\b|\bdenied\s+boarding\b|\bDOT\b.*\bpassenger\b",
    re.IGNORECASE,
)

# Categories that must never keep mortgage/housing hits.
_CATS_ANTI_MORTGAGE = frozenset(
    {
        "dot_flights_baggage",
        "fcra_credit_reporting",
        "fdcpa_debt_collection",
        "tcpa_robocalls",
    }
)

# Airline-specific: also require at least one aviation cue when text is long.
_AIR_INCLUDE = re.compile(
    r"\bairline\b|\bair\s+carrier\b|\bflight\b|\bbaggage\b|\bcancellation\b|"
    r"\bdelay\b|\btarmac\b|\bboarding\b|\bDOT\b|\bDepartment\s+of\s+Transportation\b",
    re.IGNORECASE,
)


def _norm(texto: str) -> str:
    nfkd = unicodedata.normalize("NFKD", texto or "")
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()


def texto_hit(hit: dict[str, Any]) -> str:
    parts = [
        str(hit.get("case_name") or ""),
        str(hit.get("snippet") or ""),
        str(hit.get("citation") or ""),
    ]
    return " ".join(p for p in parts if p).strip()


def aceitar_hit_categoria(hit: dict[str, Any], categoria: str) -> tuple[bool, str]:
    """Return (ok, reason). Ban mortgage contamination and BR SFH leftovers."""
    texto = texto_hit(hit)
    if not texto:
        return False, "sem_texto"
    if _MORTGAGE_BAN.search(texto):
        if categoria in _CATS_ANTI_MORTGAGE or categoria == "dot_flights_baggage":
            return False, "banido_mortgage_ou_sfh"
    if categoria == "dot_flights_baggage":
        if not _AIR_INCLUDE.search(texto):
            return False, "sem_sinal_aviacao"
    if categoria in {"fcra_credit_reporting", "fdcpa_debt_collection"}:
        # Pure airline opinion must not land in credit/debt pools.
        if _AIR_INCLUDE.search(texto) and not re.search(
            r"credit\s+report|debt\s+collect|FCRA|FDCPA|consumer\s+reporting",
            texto,
            re.IGNORECASE,
        ):
            return False, "banido_airline_em_credito_divida"
    return True, "ok"


def filtrar_anti_contaminacao(
    hits: list[dict[str, Any]],
    categoria: str,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    kept: list[dict[str, Any]] = []
    rejeitados: dict[str, int] = {}
    for hit in hits:
        ok, motivo = aceitar_hit_categoria(hit, categoria)
        if ok:
            kept.append(hit)
        else:
            rejeitados[motivo] = rejeitados.get(motivo, 0) + 1
    return kept, {
        "entrada": len(hits),
        "saida": len(kept),
        "rejeitados": rejeitados,
    }

"""Priorização de ingestão CourtListener — pools leves primeiro.

TCPA e FDCPA nos estados foco (CA, NY, TX, FL, IL + Federal US).
Não inventa casos: só ordena o plano e mescla hits reais por cluster_id/URL.
"""
from __future__ import annotations

from typing import Any

# Thin pools — federal statutes; local court scoping still coherent.
CATEGORIAS_PRIORIDADE_LEVE: tuple[str, ...] = (
    "tcpa_robocalls",
    "fdcpa_debt_collection",
)

# Launch focus (matches STATES_SEED_PRIORITY without forcing only these forever).
STATES_FOCO: tuple[str, ...] = ("US", "CA", "NY", "TX", "FL", "IL")

# Meta operacional: ≥ N unique opinions in a focus cell → "pronto" enough to ease.
META_ITENS_CELULA = 5


def ordenar_categorias(categorias: list[str], *, prioridade_leve: bool = True) -> list[str]:
    """Put TCPA/FDCPA first when present; preserve relative order otherwise."""
    if not prioridade_leve:
        return list(categorias)
    leve = [c for c in CATEGORIAS_PRIORIDADE_LEVE if c in categorias]
    resto = [c for c in categorias if c not in CATEGORIAS_PRIORIDADE_LEVE]
    return leve + resto


def ordenar_estados(states: list[str], *, prioridade_leve: bool = True) -> list[str]:
    """Focus jurisdictions first when boosting thin categories."""
    if not prioridade_leve:
        return list(states)
    foco = [s for s in STATES_FOCO if s in states]
    resto = [s for s in states if s not in STATES_FOCO]
    return foco + resto


def plano_prioridade_leve(
    *,
    categorias_disponiveis: list[str] | None = None,
) -> list[tuple[str, str]]:
    """Ordered (categoria, state) pairs for the thin-pool boost."""
    cats = list(CATEGORIAS_PRIORIDADE_LEVE)
    if categorias_disponiveis is not None:
        cats = [c for c in cats if c in categorias_disponiveis]
    return [(cat, st) for cat in cats for st in STATES_FOCO]


def chave_item(item: dict[str, Any]) -> str:
    cid = item.get("cluster_id")
    if cid is not None and str(cid).strip() != "":
        return f"cluster:{cid}"
    url = (item.get("absolute_url") or "").strip()
    if url:
        return f"url:{url}"
    name = (item.get("case_name") or "").strip().lower()
    return f"name:{name}"


def mesclar_itens(
    existentes: list[dict[str, Any]],
    novos: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Deduplicate by cluster_id / URL — keep first occurrence (prefer existing)."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in list(existentes) + list(novos):
        if not isinstance(item, dict):
            continue
        k = chave_item(item)
        if not k or k in ("cluster:", "url:", "name:"):
            continue
        if k in seen:
            continue
        seen.add(k)
        out.append(item)
    return out


def carregar_itens_existentes(path_text: str | None) -> list[dict[str, Any]]:
    """Parse corpus JSON text → itens list (empty on missing/invalid)."""
    if not path_text:
        return []
    try:
        import json

        data = json.loads(path_text)
        itens = data.get("itens") or []
        return [i for i in itens if isinstance(i, dict)]
    except Exception:
        return []

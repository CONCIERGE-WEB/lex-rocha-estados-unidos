"""Deterministic relevance filter for CourtListener hits and SignalHub leads.

Prefers MiniLM (`sentence-transformers` / all-MiniLM-L6-v2) when installed.
Falls back to lexical scoring against English anchors — still no generative LLM.

Canonical audit file: anchors-en.json (generated from ancoras_en.py).
"""
from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from ancoras_en import (
    ANCORAS_DOR_LEAD,
    ANCORAS_PRECEDENTE,
    KEYWORDS_BOOST,
    LIMIAR_PADRAO,
)
from filtro_anti_contaminacao import filtrar_anti_contaminacao  # noqa: E402

_TOKEN = re.compile(r"[a-z0-9]+")
_ANCHORS_JSON = Path(__file__).resolve().parent / "anchors-en.json"


@lru_cache(maxsize=1)
def _ancoras_carregadas() -> dict[str, Any]:
    """Prefer anchors-en.json when present so audit file and runtime stay aligned."""
    if _ANCHORS_JSON.is_file():
        try:
            data = json.loads(_ANCHORS_JSON.read_text(encoding="utf-8"))
            prec = data.get("precedente") or {}
            dor = data.get("dor_lead") or {}
            boost = data.get("keywords_boost") or {}
            if prec and dor:
                return {
                    "precedente": {k: list(v) for k, v in prec.items()},
                    "dor_lead": {k: list(v) for k, v in dor.items()},
                    "keywords_boost": {
                        k: tuple(v) if isinstance(v, list) else tuple(v)
                        for k, v in boost.items()
                    },
                    "limiar": float(data.get("limiar_padrao", LIMIAR_PADRAO)),
                    "fonte": "anchors-en.json",
                }
        except Exception as exc:  # noqa: BLE001
            print(f"[anchors] JSON load failed ({exc}) — using ancoras_en.py")
    return {
        "precedente": ANCORAS_PRECEDENTE,
        "dor_lead": ANCORAS_DOR_LEAD,
        "keywords_boost": KEYWORDS_BOOST,
        "limiar": LIMIAR_PADRAO,
        "fonte": "ancoras_en.py",
    }


def _tokens(text: str) -> set[str]:
    return set(_TOKEN.findall((text or "").lower()))


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    if inter == 0:
        return 0.0
    return inter / len(a | b)


def _containment(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    smaller, larger = (a, b) if len(a) <= len(b) else (b, a)
    return len(smaller & larger) / len(smaller)


def _texto_hit(hit: dict[str, Any]) -> str:
    parts = [
        str(hit.get("case_name") or ""),
        str(hit.get("snippet") or ""),
        str(hit.get("citation") or ""),
    ]
    return " ".join(p for p in parts if p).strip()


@lru_cache(maxsize=1)
def _modelo_minilm():
    if os.environ.get("COURT_LISTENER_SKIP_MINILM", "").strip().lower() in {
        "1",
        "true",
        "yes",
    }:
        return None
    try:
        from sentence_transformers import SentenceTransformer  # type: ignore
    except ImportError:
        return None
    name = os.environ.get("COURT_LISTENER_MINILM_MODEL", "all-MiniLM-L6-v2")
    try:
        return SentenceTransformer(name)
    except Exception as exc:  # noqa: BLE001
        print(f"[minilm] load failed ({exc}) — using lexical fallback")
        return None


def minilm_disponivel() -> bool:
    return _modelo_minilm() is not None


def score_lexical(texto: str, categoria: str, *, modo: str = "precedente") -> float:
    if not texto:
        return 0.0
    bag = _ancoras_carregadas()
    ancoras = (
        bag["dor_lead"].get(categoria)
        if modo == "dor_lead"
        else bag["precedente"].get(categoria)
    ) or []
    low = texto.lower()
    t = _tokens(texto)
    best = 0.0
    for a in ancoras:
        at = _tokens(a)
        best = max(best, _jaccard(t, at), _containment(t, at))
    for kw in bag["keywords_boost"].get(categoria, ()):
        if kw in low:
            best = max(best, 0.55)
            break
    return best


def score_minilm(
    texto: str,
    categoria: str,
    *,
    modo: str = "precedente",
) -> float | None:
    model = _modelo_minilm()
    if model is None:
        return None
    bag = _ancoras_carregadas()
    ancoras = (
        bag["dor_lead"].get(categoria)
        if modo == "dor_lead"
        else bag["precedente"].get(categoria)
    ) or []
    if not ancoras or not texto:
        return 0.0
    try:
        from sentence_transformers import util  # type: ignore

        emb_t = model.encode(texto, convert_to_tensor=True, normalize_embeddings=True)
        emb_a = model.encode(ancoras, convert_to_tensor=True, normalize_embeddings=True)
        sims = util.cos_sim(emb_t, emb_a)
        return float(sims.max().item())
    except Exception as exc:  # noqa: BLE001
        print(f"[minilm] score failed ({exc}) — lexical fallback")
        return None


def score_relevancia(
    texto: str,
    categoria: str,
    *,
    modo: str = "precedente",
) -> tuple[float, str]:
    """Hybrid score: max(MiniLM, lexical) so short CourtListener snippets are not wiped."""
    lex = score_lexical(texto, categoria, modo=modo)
    mini = score_minilm(texto, categoria, modo=modo)
    if mini is None:
        return lex, "lexical"
    if mini >= lex:
        return mini, "minilm"
    return lex, "lexical"


def classificar_lead(
    texto: str,
    limiar: float | None = None,
) -> dict[str, Any]:
    """Score a SignalHub / dork snippet against pain anchors; pick best category."""
    bag = _ancoras_carregadas()
    thr = float(
        os.environ.get(
            "COURT_LISTENER_LIMIAR",
            limiar if limiar is not None else bag["limiar"],
        )
    )
    best_cat = ""
    best_score = 0.0
    best_method = "none"
    for cat in bag["dor_lead"]:
        score, method = score_relevancia(texto, cat, modo="dor_lead")
        if score > best_score:
            best_score, best_cat, best_method = score, cat, method
    quente = bool(best_cat) and best_score >= thr
    return {
        "quente": quente,
        "categoria": best_cat or None,
        "score": round(best_score, 4),
        "method": best_method,
        "limiar": thr,
        "anchors_fonte": bag["fonte"],
    }


def filtrar_hits(
    hits: list[dict[str, Any]],
    categoria: str,
    limiar: float | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    bag = _ancoras_carregadas()
    thr = LIMIAR_PADRAO if limiar is None else limiar
    thr = float(os.environ.get("COURT_LISTENER_LIMIAR", thr if limiar is not None else bag["limiar"]))
    # Barrier 1: reject mortgage/SFH (and cross-category) pollution before scoring.
    limpos, anti = filtrar_anti_contaminacao(hits, categoria)
    kept: list[dict[str, Any]] = []
    methods: dict[str, int] = {}
    for hit in limpos:
        score, method = score_relevancia(_texto_hit(hit), categoria, modo="precedente")
        methods[method] = methods.get(method, 0) + 1
        if score >= thr:
            row = dict(hit)
            row["_score"] = round(score, 4)
            row["_score_method"] = method
            kept.append(row)
    return kept, {
        "limiar": thr,
        "entrada": len(hits),
        "saida": len(kept),
        "metodos": methods,
        "anchors_fonte": bag["fonte"],
        "anti_contaminacao": anti,
    }


def limpar_meta_score(itens: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for it in itens:
        row = {k: v for k, v in it.items() if not k.startswith("_")}
        if "_score" in it:
            row["relevance_score"] = it["_score"]
            row["relevance_method"] = it.get("_score_method")
        out.append(row)
    return out

"""Unit tests — priorização TCPA/FDCPA (sem rede)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DIR))

from priorizacao import (  # noqa: E402
    CATEGORIAS_PRIORIDADE_LEVE,
    STATES_FOCO,
    chave_item,
    mesclar_itens,
    ordenar_categorias,
    ordenar_estados,
    plano_prioridade_leve,
)


def test_ordenar_categorias_leve_primeiro() -> None:
    cats = [
        "dot_flights_baggage",
        "fdcpa_debt_collection",
        "health_plan_denial",
        "tcpa_robocalls",
    ]
    ordered = ordenar_categorias(cats, prioridade_leve=True)
    assert ordered[:2] == ["tcpa_robocalls", "fdcpa_debt_collection"]
    assert "dot_flights_baggage" in ordered


def test_ordenar_estados_foco_primeiro() -> None:
    states = ["WY", "CA", "OH", "NY", "US"]
    ordered = ordenar_estados(states, prioridade_leve=True)
    assert ordered[0] == "US"
    assert ordered[1] == "CA"
    assert ordered[2] == "NY"
    assert "WY" in ordered


def test_plano_prioridade_leve_pares() -> None:
    plano = plano_prioridade_leve()
    assert len(plano) == len(CATEGORIAS_PRIORIDADE_LEVE) * len(STATES_FOCO)
    assert plano[0] == ("tcpa_robocalls", "US")
    assert ("fdcpa_debt_collection", "IL") in plano


def test_mesclar_dedup_cluster() -> None:
    a = [{"cluster_id": 1, "case_name": "A", "absolute_url": "https://x/1"}]
    b = [
        {"cluster_id": 1, "case_name": "A-dup", "absolute_url": "https://x/1"},
        {"cluster_id": 2, "case_name": "B", "absolute_url": "https://x/2"},
    ]
    m = mesclar_itens(a, b)
    assert len(m) == 2
    assert m[0]["case_name"] == "A"
    assert m[1]["cluster_id"] == 2


def test_chave_item() -> None:
    assert chave_item({"cluster_id": 99}) == "cluster:99"
    assert chave_item({"absolute_url": "https://a"}).startswith("url:")


def test_gravar_merge_roundtrip(tmp_path: Path | None = None) -> None:
    """Smoke: merge then serialize looks like corpus itens."""
    existentes = [{"cluster_id": 10, "absolute_url": "https://cl/10", "case_name": "Old"}]
    novos = [{"cluster_id": 11, "absolute_url": "https://cl/11", "case_name": "New"}]
    merged = mesclar_itens(existentes, novos)
    body = {"itens": merged, "total": len(merged)}
    raw = json.dumps(body)
    assert "Old" in raw and "New" in raw


if __name__ == "__main__":
    test_ordenar_categorias_leve_primeiro()
    test_ordenar_estados_foco_primeiro()
    test_plano_prioridade_leve_pares()
    test_mesclar_dedup_cluster()
    test_chave_item()
    test_gravar_merge_roundtrip()
    print("OK priorizacao tests")

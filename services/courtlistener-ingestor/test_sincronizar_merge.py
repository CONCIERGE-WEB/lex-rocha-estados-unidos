"""Camada integração — sincronizar_celula com merge (HTTP mock, sem API real)."""
from __future__ import annotations

import json
import sys
from pathlib import Path
from unittest.mock import patch

DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DIR))

import motor_courtlistener_local as motor  # noqa: E402


def _fake_hit(cluster_id: int, name: str) -> dict:
    return {
        "caseName": name,
        "absolute_url": f"/opinion/{cluster_id}/{name.lower().replace(' ', '-')}/",
        "cluster_id": cluster_id,
        "court_id": "cand",
        "dateFiled": "2020-01-15",
        "snippet": "TCPA autodialer statutory damages",
        "citation": [],
    }


def test_merge_escreve_corpus(tmp_path: Path) -> None:
    cat = "tcpa_robocalls"
    st = "CA"
    # Point GRANTED at temp
    motor.GRANTED = tmp_path

    existing = {
        "categoria": cat,
        "state": st,
        "total": 1,
        "status": "parcial",
        "itens": [
            {
                "state": st,
                "case_name": "Old TCPA Case",
                "cluster_id": 100,
                "absolute_url": "https://www.courtlistener.com/opinion/100/old/",
                "fonte": "courtlistener",
            }
        ],
    }
    path = tmp_path / cat / st / "corpus.json"
    path.parent.mkdir(parents=True)
    path.write_text(json.dumps(existing), encoding="utf-8")

    fake_rows = [_fake_hit(100, "Old TCPA Case"), _fake_hit(200, "New TCPA Case")]

    with patch.object(motor, "buscar_opinioes", return_value=fake_rows):
        with patch.object(motor, "filtrar_hits", None):
            result = motor.sincronizar_celula(
                categoria=cat,
                state=st,
                page_size=20,
                max_pages=1,
                dry_run=False,
                notify=False,
                sem_filtro=True,
                merge=True,
                court_scope=True,
            )

    assert result["total"] == 2
    assert result["status"] == "parcial"
    written = json.loads(path.read_text(encoding="utf-8"))
    assert written["total"] == 2
    ids = {i["cluster_id"] for i in written["itens"]}
    assert ids == {100, 200}
    assert written.get("origem") == "courtlistener_state_merged"
    print("OK merge integration")


if __name__ == "__main__":
    from tempfile import TemporaryDirectory

    with TemporaryDirectory() as d:
        test_merge_escreve_corpus(Path(d))

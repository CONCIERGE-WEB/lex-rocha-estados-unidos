"""Export canonical anchors-en.json from ancoras_en.py (audit trail).

Usage:
  python exportar_anchors_en.py
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from ancoras_en import (
    ANCORAS_DOR_LEAD,
    ANCORAS_PRECEDENTE,
    KEYWORDS_BOOST,
    LIMIAR_PADRAO,
)

OUT = Path(__file__).resolve().parent / "anchors-en.json"


def main() -> int:
    payload = {
        "schema": "judicial-intelligence.anchors-en.v1",
        "model_default": "all-MiniLM-L6-v2",
        "limiar_padrao": LIMIAR_PADRAO,
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source_module": "ancoras_en.py",
        "precedente": ANCORAS_PRECEDENTE,
        "dor_lead": ANCORAS_DOR_LEAD,
        "keywords_boost": {k: list(v) for k, v in KEYWORDS_BOOST.items()},
    }
    OUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    cats = len(payload["precedente"])
    n_prec = sum(len(v) for v in payload["precedente"].values())
    n_lead = sum(len(v) for v in payload["dor_lead"].values())
    print(f"[ok] wrote {OUT.name} categories={cats} precedente={n_prec} dor_lead={n_lead}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

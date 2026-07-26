"""Optional MiniLM / lexical gate for SignalHub US dork leads.

Uses the same anchors as courtlistener-ingestor (anchors-en.json / ancoras_en.py).
Set SIGNALHUB_SKIP_MINILM=1 to bypass (keyword score only).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

_INGESTOR = Path(__file__).resolve().parents[2] / "services" / "courtlistener-ingestor"
if _INGESTOR.is_dir() and str(_INGESTOR) not in sys.path:
    sys.path.insert(0, str(_INGESTOR))


def lead_quente(texto: str, limiar: float | None = None) -> dict[str, Any]:
    if os.environ.get("SIGNALHUB_SKIP_MINILM", "").strip().lower() in {
        "1",
        "true",
        "yes",
    }:
        return {
            "quente": True,
            "skipped": True,
            "categoria": None,
            "score": None,
            "method": "bypass",
        }
    try:
        from filtro_vetorial import classificar_lead  # type: ignore
    except ImportError as exc:
        return {
            "quente": True,
            "skipped": True,
            "categoria": None,
            "score": None,
            "method": f"import_failed:{exc}",
        }
    return classificar_lead(texto, limiar=limiar)

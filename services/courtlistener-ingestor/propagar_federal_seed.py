"""Propagate Federal US corpus into all non-US jurisdiction cells.

Does NOT invent cases — copies already-synced CourtListener hits from US/
into every state, DC, and territory with an explicit federal_seed note.

Usage:
  python propagar_federal_seed.py
  python propagar_federal_seed.py --force
  python propagar_federal_seed.py --only-empty
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from jurisdictions_us import JURISDICTIONS_FULL

DIR = Path(__file__).resolve().parent
GRANTED = DIR.parents[1] / "site" / "report-models" / "granted"

CATEGORIAS = [
    "fcra_credit_reporting",
    "fdcpa_debt_collection",
    "tcpa_robocalls",
    "lemon_law_warranty",
    "udap_deceptive_practices",
    "dot_flights_baggage",
    "health_plan_denial",
]


def _utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite jurisdiction cells even if they already have items",
    )
    parser.add_argument(
        "--only-empty",
        action="store_true",
        help="Only write cells with zero items (never overwrite non-empty)",
    )
    args = parser.parse_args()

    targets = [j for j in JURISDICTIONS_FULL if j != "US"]
    written = 0
    skipped = 0

    for cat in CATEGORIAS:
        src = GRANTED / cat / "US" / "corpus.json"
        if not src.is_file():
            print(f"[skip] missing federal {cat}/US")
            skipped += 1
            continue
        fed = json.loads(src.read_text(encoding="utf-8"))
        itens_fed = fed.get("itens") or []
        if not itens_fed:
            print(f"[skip] empty federal {cat}/US")
            skipped += 1
            continue

        for st in targets:
            dest = GRANTED / cat / st / "corpus.json"
            if dest.is_file() and not args.force:
                try:
                    cur = json.loads(dest.read_text(encoding="utf-8"))
                    has = bool(cur.get("itens"))
                    if args.only_empty and has:
                        skipped += 1
                        continue
                    if has and cur.get("origem") != "federal_seed":
                        skipped += 1
                        continue
                    if has and not args.only_empty and cur.get("origem") == "federal_seed":
                        pass  # refresh seed
                    elif has:
                        skipped += 1
                        continue
                except Exception:
                    pass

            itens = []
            for it in itens_fed:
                row = dict(it)
                row["state"] = st
                row["seed_from"] = "US"
                itens.append(row)

            status = "parcial" if itens else "aguardando_corpus"
            if len(itens) >= 5:
                status = "pronto"

            body = {
                "categoria": cat,
                "state": st,
                "geradoEm": _utcnow(),
                "total": len(itens),
                "status": status,
                "origem": "federal_seed",
                "nota": (
                    "Seeded from Federal (US) CourtListener hits already synced — "
                    "not invented. Covers 50 states, DC, and U.S. territories until "
                    "jurisdiction-scoped API sync is available."
                ),
                "itens": itens,
            }
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(
                json.dumps(body, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            written += 1
            print(f"[ok] {cat}/{st} <- US ({len(itens)} items)")

    print(f"done written={written} skipped={skipped} targets={len(targets)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Re-apply lexical/MiniLM filter to existing corpus.json files (no API calls).

Usage:
  set PYTHONIOENCODING=utf-8
  python refiltrar_local.py
  python refiltrar_local.py --include-seed
  python refiltrar_local.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DIR))

from filtro_vetorial import filtrar_hits, limpar_meta_score, minilm_disponivel  # noqa: E402

GRANTED = DIR.parents[1] / "site" / "report-models" / "granted"


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--include-seed",
        action="store_true",
        help="Also refilter federal_seed cells (default: skip)",
    )
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    print(f"[refilter] minilm={'yes' if minilm_disponivel() else 'no (lexical)'}")
    changed = 0
    scanned = 0
    for path in sorted(GRANTED.glob("*/*/corpus.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        itens = data.get("itens") or []
        if not itens:
            continue
        if data.get("origem") == "federal_seed" and not args.include_seed:
            continue
        scanned += 1
        cat = data.get("categoria") or path.parent.parent.name
        kept, meta = filtrar_hits(itens, cat)
        kept = limpar_meta_score(kept)
        if len(kept) == len(itens):
            continue
        st = data.get("state") or path.parent.name
        print(
            f"[refilter] {cat}/{st}: {meta['entrada']}->{meta['saida']} "
            f"methods={meta.get('metodos')}"
        )
        if args.dry_run:
            continue
        data["itens"] = kept
        data["total"] = len(kept)
        data["status"] = (
            "pronto" if len(kept) >= 5 else ("parcial" if kept else "aguardando_corpus")
        )
        data["filtro"] = {
            "limiar": meta["limiar"],
            "metodos": meta.get("metodos"),
            "anchors_fonte": meta.get("anchors_fonte"),
            "minilm": minilm_disponivel(),
        }
        data["nota"] = (
            (data.get("nota") or "")
            + f" | Re-filtered locally {meta['entrada']}->{meta['saida']}."
        ).strip(" |")
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed += 1
    print(f"done scanned={scanned} changed={changed} dry_run={args.dry_run}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Overnight / budgeted CourtListener fill respecting FLP v4.4 quotas.

Official defaults (authenticated free account, rolling windows):
  5 / minute · 50 / hour · 125 / day
  Source: https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview

Strategy:
  1) Skip cells that already have itens (unless --force)
  2) Prefer state-scoped court= filters when state != US
  3) Pause ~75s between requests to stay under 50/hour
  4) Stop when daily budget exhausted (default 40 remaining calls)

Usage:
  set PYTHONIOENCODING=utf-8
  python encher_pools_noturno.py --max-requests=40 --max-pages=1
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DIR))

from courts_seed import COURTS_POR_STATE  # noqa: E402
from filtro_vetorial import filtrar_hits, limpar_meta_score  # noqa: E402
from motor_courtlistener_local import (  # noqa: E402
    CATEGORIAS,
    _token,
    gravar_corpus,
    mapear_hit,
    caminho_corpus,
)

# Stay under 50/hour with margin (3600/50 = 72s)
PAUSE_ENTRE_REQUESTS = float(os.environ.get("COURT_LISTENER_PAUSE_SEG", "75"))


def _celula_preenchida(cat: str, state: str) -> bool:
    p = caminho_corpus(cat, state)
    if not p.is_file():
        return False
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
        itens = d.get("itens") or []
        if not itens:
            return False
        # Allow overnight job to upgrade federal_seed → state-scoped
        if d.get("origem") == "federal_seed":
            return False
        return True
    except Exception:
        return False


def _query_com_courts(base_q: str, state: str) -> tuple[str, list[str] | None]:
    courts = COURTS_POR_STATE.get(state.upper())
    if not courts:
        return base_q, None
    # Search API accepts repeated court params via urlencode doseq — handled below
    return base_q, list(courts)


def buscar_com_courts(
    *,
    query: str,
    courts: list[str] | None,
    page_size: int,
    max_pages: int,
    token: str,
) -> list[dict]:
    """Like buscar_opinioes but with optional court filters (one request per page)."""
    import urllib.parse
    import urllib.error
    import urllib.request
    from motor_courtlistener_local import _base_url, _http_get_json

    pairs: list[tuple[str, str]] = [
        ("q", query),
        ("type", "o"),
        ("order_by", "score desc"),
        ("page_size", str(page_size)),
    ]
    if courts:
        for c in courts:
            pairs.append(("court", c))
    params = urllib.parse.urlencode(pairs)
    url: str | None = f"{_base_url()}/search/?{params}"
    hits: list[dict] = []
    page = 0
    while url and page < max_pages:
        page += 1
        print(f"[night] page {page}: {url[:140]}...")
        data = None
        for attempt in range(1, 6):
            try:
                data = _http_get_json(url, token)
                break
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", errors="replace")[:300]
                if e.code == 429:
                    wait = 60 * attempt
                    print(f"[night] 429 — sleep {wait}s")
                    time.sleep(wait)
                    continue
                raise RuntimeError(f"HTTP {e.code}: {body}") from e
        if data is None:
            raise RuntimeError("rate limit persisted")
        hits.extend(data.get("results") or [])
        nxt = data.get("next")
        url = nxt if isinstance(nxt, str) and nxt.strip() else None
        if url:
            time.sleep(PAUSE_ENTRE_REQUESTS)
    return hits


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-requests", type=int, default=40)
    parser.add_argument("--max-pages", type=int, default=1)
    parser.add_argument("--page-size", type=int, default=15)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--states", default="CA,NY,TX,FL,IL")
    parser.add_argument("--categorias", default="all")
    parser.add_argument("--no-filter", action="store_true")
    args = parser.parse_args()

    cats = (
        list(CATEGORIAS.keys())
        if args.categorias == "all"
        else [c.strip() for c in args.categorias.split(",") if c.strip()]
    )
    states = [s.strip().upper() for s in args.states.split(",") if s.strip()]
    token = _token()
    used = 0
    done = 0

    print(
        f"[night] budget={args.max_requests} pause={PAUSE_ENTRE_REQUESTS}s "
        f"token={'yes' if token else 'no'}"
    )

    for cat in cats:
        for st in states:
            if used >= args.max_requests:
                print("[night] daily budget reached — stop")
                return 0
            if not args.force and _celula_preenchida(cat, st):
                print(f"[skip] {cat}/{st} already filled")
                continue

            q, courts = _query_com_courts(CATEGORIAS[cat], st)
            try:
                # Each call may use up to max_pages requests
                raw = buscar_com_courts(
                    query=q,
                    courts=courts,
                    page_size=args.page_size,
                    max_pages=args.max_pages,
                    token=token,
                )
                used += max(args.max_pages, 1)
            except Exception as exc:  # noqa: BLE001
                print(f"[erro] {cat}/{st}: {exc}", file=sys.stderr)
                time.sleep(PAUSE_ENTRE_REQUESTS)
                continue

            itens = []
            seen: set[str] = set()
            for row in raw:
                mapped = mapear_hit(row, st)
                if not mapped:
                    continue
                key = mapped["absolute_url"]
                if key in seen:
                    continue
                seen.add(key)
                itens.append(mapped)

            if not args.no_filter and filtrar_hits is not None:
                itens, meta = filtrar_hits(itens, cat)
                itens = limpar_meta_score(itens)
                print(f"[filtro] {cat}/{st}: {meta['entrada']}->{meta['saida']}")

            # Keep prior corpus if localized query/filter returned nothing
            if not itens:
                prior = caminho_corpus(cat, st)
                if prior.is_file():
                    try:
                        prev = json.loads(prior.read_text(encoding="utf-8"))
                        if prev.get("itens"):
                            print(
                                f"[keep] {cat}/{st} — API/filter empty, preserving prior corpus"
                            )
                            time.sleep(PAUSE_ENTRE_REQUESTS)
                            continue
                    except Exception:
                        pass

            path = gravar_corpus(categoria=cat, state=st, itens=itens, dry_run=False)
            # Mark localized sync
            try:
                body = json.loads(Path(path).read_text(encoding="utf-8"))
                body["origem"] = "courtlistener_state"
                body.pop("seed_from", None)
                Path(path).write_text(
                    json.dumps(body, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8",
                )
            except Exception:
                pass
            done += 1
            time.sleep(PAUSE_ENTRE_REQUESTS)

    print(f"[night] finished cells={done} requests~={used}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

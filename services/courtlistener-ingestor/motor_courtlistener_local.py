"""CourtListener local ingest motor (U.S.) — deterministic, no LLM.

Mirrors the BR DataJud motor role: fetch public opinions → write
`site/report-models/granted/<categoria>/<STATE>/corpus.json` → notify ops.

Usage (from repo root or this directory):
  set COURTLISTENER_API_TOKEN=...
  python motor_courtlistener_local.py --categoria=fcra_credit_reporting --state=US
  python motor_courtlistener_local.py --categoria=all --state=US --max-pages=3
  python motor_courtlistener_local.py --loop   # continuous (INTERVALO_SEG)

Env (Free Law Project REST v4.4 quotas — rolling windows):
  COURTLISTENER_API_TOKEN   recommended (Token auth); anonymous works but same low caps
  Default caps: 5/min · 50/hour · 125/day (membership raises these)
  COURTLISTENER_BASE_URL    default https://www.courtlistener.com/api/rest/v4
  SLACK_WEBHOOK_CORPUS      optional Incoming Webhook (or SLACK_WEBHOOK_NOVOS_CASOS)
  SIGNALHUB_CAPTACAO_URL    optional POST hook for the capture bot
  COURT_LISTENER_INTERVALO_SEG  loop sleep (default 600)
  COURT_LISTENER_SKIP_MINILM / COURT_LISTENER_LIMIAR  filter knobs
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DIR = Path(__file__).resolve().parent
REPO = DIR.parents[1]
SITE = REPO / "site"
GRANTED = SITE / "report-models" / "granted"


def _carregar_dotenv() -> None:
    """Load KEY=VAL from repo/site .env.local and local .env.

    Empty shell vars must not block file values (common on Windows).
    """
    for path in (REPO / ".env.local", SITE / ".env.local", DIR / ".env"):
        if not path.is_file():
            continue
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key and (key not in os.environ or not str(os.environ.get(key, "")).strip()):
                os.environ[key] = val


_carregar_dotenv()

try:
    from filtro_vetorial import filtrar_hits, limpar_meta_score
except ImportError:  # pragma: no cover
    filtrar_hits = None  # type: ignore
    limpar_meta_score = None  # type: ignore


# Top-conversion U.S. categories (must match site/src/lib/pipeline-confiavel/categorias.ts)
CATEGORIAS: dict[str, str] = {
    "fcra_credit_reporting": (
        '"Fair Credit Reporting Act" OR FCRA '
        "(credit report OR consumer reporting) damages"
    ),
    "fdcpa_debt_collection": (
        '"Fair Debt Collection Practices Act" OR FDCPA '
        "(debt collector OR collection) damages"
    ),
    "tcpa_robocalls": (
        '"Telephone Consumer Protection Act" OR TCPA '
        '(robocall OR autodialer OR "text message") damages'
    ),
    "lemon_law_warranty": (
        '("lemon law" OR "Magnuson-Moss") '
        "(warranty OR defect OR vehicle OR automobile) consumer"
    ),
    "udap_deceptive_practices": (
        '(UDAP OR "unfair and deceptive" OR "unfair or deceptive" OR "junk fee") '
        "(consumer OR FTC) damages"
    ),
    "dot_flights_baggage": (
        '(airline OR "air carrier") (baggage OR delay OR cancellation) '
        '(DOT OR "Department of Transportation")'
    ),
    "health_plan_denial": (
        '(ERISA OR "health insurance" OR "bad faith") '
        '(denial OR "claim denied" OR coverage) benefits'
    ),
}

from jurisdictions_us import JURISDICTIONS_FULL, STATES_SEED_PRIORITY

# Legacy alias — priority launch set
STATES_SEED = STATES_SEED_PRIORITY
DEFAULT_PAGE_SIZE = 20
INTERVALO = int(os.environ.get("COURT_LISTENER_INTERVALO_SEG", "600"))


def _utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _token() -> str:
    return (
        os.environ.get("COURTLISTENER_API_TOKEN", "").strip()
        or os.environ.get("COURTLISTENER_TOKEN", "").strip()
    )


def _base_url() -> str:
    return os.environ.get(
        "COURTLISTENER_BASE_URL",
        "https://www.courtlistener.com/api/rest/v4",
    ).rstrip("/")


def _http_get_json(url: str, token: str) -> dict[str, Any]:
    headers = {
        "Accept": "application/json",
        "User-Agent": "JudicialIntelligence-US-CourtListenerIngestor/1.0",
    }
    if token:
        headers["Authorization"] = f"Token {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=60) as res:
        return json.loads(res.read().decode("utf-8"))


def buscar_opinioes(
    *,
    query: str,
    page_size: int,
    max_pages: int,
    token: str,
) -> list[dict[str, Any]]:
    """Paginate CourtListener /search/ until max_pages or no next link."""
    params = urllib.parse.urlencode(
        {
            "q": query,
            "type": "o",
            "order_by": "score desc",
            "page_size": str(page_size),
        }
    )
    url: str | None = f"{_base_url()}/search/?{params}"
    hits: list[dict[str, Any]] = []
    page = 0
    while url and page < max_pages:
        page += 1
        print(f"[courtlistener] page {page}: {url[:120]}...")
        data = None
        for attempt in range(1, 6):
            try:
                data = _http_get_json(url, token)
                break
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", errors="replace")[:300]
                if e.code == 429:
                    wait = 45 * attempt
                    print(f"[courtlistener] 429 rate limit — sleep {wait}s (try {attempt}/5)")
                    time.sleep(wait)
                    continue
                raise RuntimeError(f"CourtListener HTTP {e.code}: {body}") from e
        if data is None:
            raise RuntimeError("CourtListener rate limit persisted after retries")
        results = data.get("results") or []
        if not isinstance(results, list):
            break
        hits.extend(results)
        next_url = data.get("next")
        url = next_url if isinstance(next_url, str) and next_url.strip() else None
        if url:
            # Anonymous API ≈ 5 req/min; authenticated is higher.
            pause = 13.0 if not token else 0.5
            time.sleep(pause)
    return hits


def mapear_hit(row: dict[str, Any], state: str) -> dict[str, Any] | None:
    case_name = (row.get("caseName") or row.get("case_name") or "").strip()
    path = row.get("absolute_url") or row.get("absoluteUrl") or ""
    if not case_name or not path:
        return None
    absolute_url = (
        path
        if str(path).startswith("http")
        else f"https://www.courtlistener.com{path if str(path).startswith('/') else '/' + path}"
    )
    cluster_raw = row.get("cluster_id") if row.get("cluster_id") is not None else row.get("id")
    cluster_id: int | None
    if isinstance(cluster_raw, int):
        cluster_id = cluster_raw
    elif str(cluster_raw or "").isdigit():
        cluster_id = int(str(cluster_raw))
    else:
        cluster_id = None
    snippet = row.get("snippet")
    if snippet:
        snippet = re.sub(r"<[^>]+>", "", str(snippet)).strip()
    citation = row.get("citation")
    if isinstance(citation, list):
        citation = citation[0] if citation else None
    return {
        "state": state.upper(),
        "court_id": row.get("court_id") or row.get("court") or None,
        "case_name": case_name,
        "cluster_id": cluster_id,
        "absolute_url": absolute_url,
        "date_filed": row.get("dateFiled") or row.get("date_filed") or None,
        "snippet": snippet or None,
        "citation": citation,
        "fonte": "courtlistener",
    }



def caminho_corpus(categoria: str, state: str) -> Path:
    return GRANTED / categoria / state.upper() / "corpus.json"


def gravar_corpus(
    *,
    categoria: str,
    state: str,
    itens: list[dict[str, Any]],
    dry_run: bool = False,
) -> Path:
    """Write corpus.json. Empty API → status aguardando_corpus (never invent)."""
    path = caminho_corpus(categoria, state)
    status = "parcial" if itens else "aguardando_corpus"
    if len(itens) >= 5:
        status = "pronto"
    body = {
        "categoria": categoria,
        "state": state.upper(),
        "geradoEm": _utcnow(),
        "total": len(itens),
        "status": status,
        "nota": (
            "Written by motor_courtlistener_local.py — deterministic CourtListener hits only. "
            "No invented cases."
        ),
        "itens": itens,
    }
    if dry_run:
        print(f"[dry-run] would write {path} total={len(itens)} status={status}")
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(body, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[ok] wrote {path} total={len(itens)} status={status}")
    return path


def notificar_pacote(
    *,
    categoria: str,
    state: str,
    total: int,
    status: str,
) -> None:
    """Fire Slack Incoming Webhook and/or SignalHub capture URL — no PII / case names."""
    text = (
        "*Corpus ingest — CourtListener*\n\n"
        f"*Category:* `{categoria}`\n"
        f"*State:* `{state.upper()}`\n"
        f"*Items saved:* {total}\n"
        f"*Status:* {status}\n"
        f"*Source:* motor_courtlistener_local.py\n\n"
        "_Deterministic JSON write — no LLM in the ingest path._"
    )
    payload = json.dumps({"text": text}).encode("utf-8")

    slack = (
        os.environ.get("SLACK_WEBHOOK_CORPUS", "").strip()
        or os.environ.get("SLACK_WEBHOOK_NOVOS_CASOS", "").strip()
    )
    if slack:
        try:
            req = urllib.request.Request(
                slack,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=8) as res:
                print(f"[slack] notified status={res.status}")
        except Exception as exc:  # noqa: BLE001 — ops must not crash ingest
            print(f"[slack] notify failed: {exc}", file=sys.stderr)

    signalhub = os.environ.get("SIGNALHUB_CAPTACAO_URL", "").strip()
    if signalhub:
        body = json.dumps(
            {
                "evento": "corpus_ingest_ok",
                "categoria": categoria,
                "state": state.upper(),
                "total": total,
                "status": status,
                "fonte": "courtlistener-ingestor",
                "em": _utcnow(),
            }
        ).encode("utf-8")
        try:
            req = urllib.request.Request(
                signalhub,
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=8) as res:
                print(f"[signalhub] captacao status={res.status}")
        except Exception as exc:  # noqa: BLE001
            print(f"[signalhub] captacao failed: {exc}", file=sys.stderr)


def sincronizar_celula(
    *,
    categoria: str,
    state: str,
    page_size: int,
    max_pages: int,
    dry_run: bool,
    notify: bool,
    sem_filtro: bool = False,
) -> dict[str, Any]:
    if categoria not in CATEGORIAS:
        raise ValueError(f"Unknown category: {categoria}")
    token = _token()
    if not token:
        print("[aviso] COURTLISTENER_API_TOKEN ausente — tentando API pública sem Token")
    raw = buscar_opinioes(
        query=CATEGORIAS[categoria],
        page_size=page_size,
        max_pages=max_pages,
        token=token,
    )
    itens: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in raw:
        mapped = mapear_hit(row, state)
        if not mapped:
            continue
        key = mapped["absolute_url"]
        if key in seen:
            continue
        seen.add(key)
        itens.append(mapped)

    filtro_meta: dict[str, Any] | None = None
    if not sem_filtro and filtrar_hits is not None:
        itens, filtro_meta = filtrar_hits(itens, categoria)
        itens = limpar_meta_score(itens) if limpar_meta_score else itens
        print(
            f"[filtro] {categoria}/{state}: "
            f"{filtro_meta['entrada']}->{filtro_meta['saida']} "
            f"(limiar={filtro_meta['limiar']}, {filtro_meta['metodos']})"
        )

    path = gravar_corpus(
        categoria=categoria, state=state, itens=itens, dry_run=dry_run
    )
    status = "parcial" if itens else "aguardando_corpus"
    if len(itens) >= 5:
        status = "pronto"
    if notify and not dry_run and itens:
        notificar_pacote(
            categoria=categoria, state=state, total=len(itens), status=status
        )
    return {
        "categoria": categoria,
        "state": state.upper(),
        "total": len(itens),
        "status": status,
        "path": str(path),
        "filtro": filtro_meta,
    }


def ciclo(
    *,
    categorias: list[str],
    states: list[str],
    page_size: int,
    max_pages: int,
    dry_run: bool,
    notify: bool,
    sem_filtro: bool = False,
) -> None:
    for cat in categorias:
        for st in states:
            try:
                sincronizar_celula(
                    categoria=cat,
                    state=st,
                    page_size=page_size,
                    max_pages=max_pages,
                    dry_run=dry_run,
                    notify=notify,
                    sem_filtro=sem_filtro,
                )
            except Exception as exc:  # noqa: BLE001 — keep loop alive
                print(f"[erro] {cat}/{st}: {exc}", file=sys.stderr)
            # Space cells under FLP free-tier hour budget (~50/hr)
            gap = float(os.environ.get("COURT_LISTENER_PAUSE_SEG", "75" if not _token() else "15"))
            time.sleep(gap)


def main() -> int:
    parser = argparse.ArgumentParser(description="CourtListener → corpus.json motor")
    parser.add_argument("--categoria", default="fcra_credit_reporting")
    parser.add_argument("--state", default="US")
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE)
    parser.add_argument("--max-pages", type=int, default=2)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-notify", action="store_true")
    parser.add_argument("--sem-filtro", action="store_true", help="Skip MiniLM/lexical filter")
    parser.add_argument("--loop", action="store_true", help="Run forever with INTERVALO")
    parser.add_argument(
        "--all-states-seed",
        action="store_true",
        help="Sync priority STATES_SEED (US,CA,NY,TX,FL,IL)",
    )
    parser.add_argument(
        "--all-jurisdictions",
        action="store_true",
        help="Sync full matrix: Federal + 50 states + DC + territories",
    )
    args = parser.parse_args()

    if args.categoria == "all":
        cats = list(CATEGORIAS.keys())
    else:
        cats = [args.categoria]

    if args.all_jurisdictions:
        states = list(JURISDICTIONS_FULL)
    elif args.all_states_seed:
        states = list(STATES_SEED)
    else:
        states = [args.state.upper()]
    notify = not args.no_notify

    def once() -> None:
        ciclo(
            categorias=cats,
            states=states,
            page_size=args.page_size,
            max_pages=args.max_pages,
            dry_run=args.dry_run,
            notify=notify,
            sem_filtro=args.sem_filtro,
        )

    if args.loop:
        print(f"[motor] loop every {INTERVALO}s — Ctrl+C to stop")
        while True:
            once()
            time.sleep(INTERVALO)
    else:
        once()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

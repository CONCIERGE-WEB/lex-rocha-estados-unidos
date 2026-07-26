"""Notify Slack / SignalHub after corpus writes, or gate hot U.S. leads.

Corpus cell:
  python notificar_captacao.py --categoria=fcra_credit_reporting --state=US --total=12 --status=parcial

Lead gate (MiniLM / lexical against dor_lead anchors):
  python notificar_captacao.py --lead --texto "Equifax won't fix my credit report after dispute"
  python notificar_captacao.py --lead --texto "..." --notify-slack
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from filtro_vetorial import classificar_lead, minilm_disponivel  # noqa: E402
from motor_courtlistener_local import notificar_pacote  # noqa: E402


def _slack_webhook() -> str:
    return (
        os.environ.get("SLACK_WEBHOOK_NOVOS_CASOS", "").strip()
        or os.environ.get("SLACK_WEBHOOK_CORPUS", "").strip()
    )


def _post_slack(text: str) -> bool:
    url = _slack_webhook()
    if not url:
        print("[slack] webhook not set (SLACK_WEBHOOK_NOVOS_CASOS)", file=sys.stderr)
        return False
    payload = json.dumps({"text": text}).encode("utf-8")
    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            print(f"[slack] novos-casos status={res.status}")
            return True
    except Exception as exc:  # noqa: BLE001
        print(f"[slack] failed: {exc}", file=sys.stderr)
        return False


def _cmd_lead(args: argparse.Namespace) -> int:
    texto = (args.texto or "").strip()
    if not texto:
        print("[erro] --texto required with --lead", file=sys.stderr)
        return 2
    meta = classificar_lead(texto, limiar=args.limiar)
    meta["minilm"] = minilm_disponivel()
    print(json.dumps(meta, ensure_ascii=False, indent=2))
    if not meta["quente"]:
        print("[gate] cold lead — no Slack notify")
        return 1
    if args.notify_slack:
        msg = (
            "*Hot lead — SignalHub US*\n\n"
            f"*Category:* `{meta['categoria']}`\n"
            f"*Score:* {meta['score']} ({meta['method']})\n"
            f"*Threshold:* {meta['limiar']}\n"
            f"*MiniLM:* {'yes' if meta['minilm'] else 'no (lexical)'}\n\n"
            f"> {texto[:500]}"
        )
        _post_slack(msg)
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--lead", action="store_true", help="Classify a lead snippet")
    p.add_argument("--texto", default="", help="Lead / dork text to score")
    p.add_argument("--limiar", type=float, default=None)
    p.add_argument(
        "--notify-slack",
        action="store_true",
        help="Post to #novos-casos-us webhook only if hot",
    )
    p.add_argument("--categoria", default="")
    p.add_argument("--state", default="")
    p.add_argument("--total", type=int, default=0)
    p.add_argument("--status", default="parcial")
    args = p.parse_args()

    if args.lead:
        return _cmd_lead(args)

    if not args.categoria or not args.state:
        print("[erro] --categoria and --state required (or use --lead)", file=sys.stderr)
        return 2
    notificar_pacote(
        categoria=args.categoria,
        state=args.state,
        total=args.total,
        status=args.status,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

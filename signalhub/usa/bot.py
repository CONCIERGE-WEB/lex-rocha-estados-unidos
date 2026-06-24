#!/usr/bin/env python3
"""
usa/bot.py — Judicial Intelligence Signal Hub (U.S. consumer rights)
  python usa/bot.py detectar   # capture CHAT_ID
  python usa/bot.py teste      # mock + dry-run
  python usa/bot.py teste-live # mock + send Telegram
  python usa/bot.py scan       # dork scan (no alerts)
  python usa/bot.py            # production (dorks + multi-source)
"""

import asyncio
import logging
import os
import re
import sys
import time
from pathlib import Path

import httpx
from dotenv import dotenv_values

sys.path.insert(0, str(Path(__file__).parent.parent))
from core.engine import SignalHubEngine
from core.sources import DorkScanner
from core.telegram_listener import TelegramListener

BOT_DIR = Path(__file__).parent
ROOT_DIR = BOT_DIR.parent
CONFIG_PATH = ROOT_DIR / "config" / "usa" / "keywords.yaml"
DORKS_PATH = ROOT_DIR / "config" / "usa" / "dorks.yaml"
ENV_PATH = BOT_DIR / ".env"
LOG_PATH = ROOT_DIR / "logs" / "usa.log"

LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [LEX-US] %(levelname)s %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
    ],
)
log = logging.getLogger("lexusbot")

env = {**os.environ, **dotenv_values(ENV_PATH)}
engine = SignalHubEngine(CONFIG_PATH, env, log)

POSTS_MOCK = [
    {
        "autor": "Mike R.",
        "texto": "Verizon raised my bill mid-contract. Can I cancel without a penalty?",
        "link": "https://reddit.com/r/verizon/mock-us-001",
    },
    {
        "autor": "Sarah L.",
        "texto": "Amazon refund denied after defective product — how do I escalate formally?",
        "link": "https://reddit.com/r/amazon/mock-us-002",
    },
    {
        "autor": "Tom A.",
        "texto": "Best pizza in Brooklyn?",
        "link": "https://reddit.com/r/Brooklyn/mock-us-003",
    },
]


async def detectar_chat_id():
    token = env.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        log.error("TELEGRAM_BOT_TOKEN missing in usa/.env")
        return

    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(f"https://api.telegram.org/bot{token}/getMe")
        user = r.json().get("result", {}).get("username", "?")

    log.info(f"Bot: @{user} — https://t.me/{user}")
    log.info("Send /start on Telegram now (90s)...")

    offset = 0
    deadline = time.time() + 90

    async with httpx.AsyncClient(timeout=15) as c:
        while time.time() < deadline:
            try:
                r = await c.get(
                    f"https://api.telegram.org/bot{token}/getUpdates",
                    params={"offset": offset, "timeout": 5},
                )
                for upd in r.json().get("result", []):
                    offset = upd["update_id"] + 1
                    chat_id = upd.get("message", {}).get("chat", {}).get("id")
                    if chat_id:
                        txt = ENV_PATH.read_text(encoding="utf-8")
                        if "TELEGRAM_CHAT_ID=" in txt:
                            txt = re.sub(
                                r"TELEGRAM_CHAT_ID=.*",
                                f"TELEGRAM_CHAT_ID={chat_id}",
                                txt,
                            )
                        else:
                            txt += f"\nTELEGRAM_CHAT_ID={chat_id}\n"
                        ENV_PATH.write_text(txt, encoding="utf-8")
                        env["TELEGRAM_CHAT_ID"] = str(chat_id)
                        log.info(f"usa/.env → TELEGRAM_CHAT_ID={chat_id}")
                        await c.post(
                            f"https://api.telegram.org/bot{token}/sendMessage",
                            json={
                                "chat_id": chat_id,
                                "text": (
                                    "🇺🇸 Judicial Intelligence connected!\n"
                                    "Consumer rights research\n"
                                    "judicialintelligence.com · reserved service"
                                ),
                            },
                        )
                        return chat_id
            except Exception as e:
                log.error(f"Polling: {e}")
            await asyncio.sleep(2)

    bot_user = env.get("TELEGRAM_BOT_USERNAME", "notificacoes_servico_bot").lstrip("@")
    log.warning(f"Timeout — send /start at https://t.me/{bot_user}")


def _scanner() -> DorkScanner:
    return DorkScanner(DORKS_PATH)


async def scan_loop():
    interval = int(env.get("SCAN_INTERVAL_SECONDS", 300))
    scanner = _scanner()
    log.info(f"LexBot US production — multi-source dorks every {interval}s")

    while True:
        posts = await scanner.scan()
        log.info(f"Scan: {len(posts)} opportunities")
        for post in posts:
            await engine.processar(post)
            await asyncio.sleep(0.5)
        await asyncio.sleep(interval)


async def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"

    if cmd == "detectar":
        await detectar_chat_id()
    elif cmd == "teste":
        log.info("Mock test — dry-run (no Telegram)")
        for post in POSTS_MOCK:
            await engine.processar(post, dry_run=True)
    elif cmd == "teste-live":
        if not env.get("TELEGRAM_CHAT_ID"):
            log.error("Set TELEGRAM_CHAT_ID (run: python usa/bot.py detectar)")
            return
        log.info("Mock test — sends Telegram")
        for post in POSTS_MOCK:
            await engine.processar(post)
    elif cmd in ("scan", "dork", "dorks"):
        posts = await _scanner().scan()
        log.info(f"Dork scan: {len(posts)} results (no alerts)")
        for p in posts[:10]:
            s, g = engine.score(p["texto"])
            canal = p.get("canal", "")
            log.info(
                f"  [{p.get('fonte','?')}{'/' + canal if canal else ''}] "
                f"score={s} grupo={g} | {p['texto'][:70]}"
            )
    elif cmd == "comandos":
        if not env.get("TELEGRAM_CHAT_ID"):
            log.error("TELEGRAM_CHAT_ID empty. Run: python usa/bot.py detectar")
            return
        await TelegramListener(env, log).loop()
    else:
        if not env.get("TELEGRAM_CHAT_ID"):
            log.error("TELEGRAM_CHAT_ID empty. Run: python usa/bot.py detectar")
            return
        listener = TelegramListener(env, log)
        await asyncio.gather(scan_loop(), listener.loop())


if __name__ == "__main__":
    asyncio.run(main())

#!/usr/bin/env python3
"""Conecta apenas o bot Lex Portugal ao Telegram."""

from __future__ import annotations

import asyncio
import re
import sys
import time
import webbrowser
from pathlib import Path

import httpx
from dotenv import dotenv_values

ROOT = Path(__file__).parent.parent
PT_ENV = ROOT / "portugal" / ".env"
def _bot_url() -> str:
    env = dotenv_values(PT_ENV)
    user = (env.get("TELEGRAM_BOT_USERNAME") or "notificacoes_servico_bot").lstrip("@")
    return f"https://t.me/{user}?start=conectar"


def salvar_chat_id(env_path: Path, chat_id: int) -> None:
    txt = env_path.read_text(encoding="utf-8")
    if "TELEGRAM_CHAT_ID=" in txt:
        txt = re.sub(r"TELEGRAM_CHAT_ID=.*", f"TELEGRAM_CHAT_ID={chat_id}", txt)
    else:
        txt += f"\nTELEGRAM_CHAT_ID={chat_id}\n"
    env_path.write_text(txt, encoding="utf-8")


async def capturar(token: str, segundos: int = 120) -> int | None:
    print(f"\n[Portugal] Aguardando /start por {segundos}s...")
    offset = 0
    fim = time.time() + segundos
    async with httpx.AsyncClient(timeout=20) as c:
        while time.time() < fim:
            try:
                r = await c.get(
                    f"https://api.telegram.org/bot{token}/getUpdates",
                    params={"offset": offset, "timeout": 8},
                )
                for upd in r.json().get("result", []):
                    offset = upd["update_id"] + 1
                    msg = upd.get("message") or {}
                    chat = msg.get("chat", {})
                    cid = chat.get("id")
                    if cid:
                        await c.post(
                            f"https://api.telegram.org/bot{token}/sendMessage",
                            json={
                                "chat_id": cid,
                                "text": (
                                    "🇵🇹 Direitos do Consumidor conectado.\n"
                                    "direitosconsumidor.com · revisão pt-PT activa"
                                ),
                            },
                        )
                        return int(cid)
            except Exception as e:
                print(f"  aviso: {e}")
            await asyncio.sleep(1)
    return None


async def main() -> None:
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 60)
    print("  Lex Portugal — Conectar Telegram")
    print("=" * 60)
    url = _bot_url()
    webbrowser.open(url)
    print(f"\nAbra {url} e envie /start\n")

    env = dotenv_values(PT_ENV)
    token = env.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        print("ERRO: TELEGRAM_BOT_TOKEN ausente em portugal/.env")
        sys.exit(1)

    cid = await capturar(token)
    if not cid:
        print("Timeout. Tente novamente.")
        sys.exit(1)

    salvar_chat_id(PT_ENV, cid)
    print(f"OK → TELEGRAM_CHAT_ID={cid}")
    print("Próximo: python portugal/bot.py teste-live")


if __name__ == "__main__":
    asyncio.run(main())

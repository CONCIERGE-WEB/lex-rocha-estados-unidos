"""
Comandos Telegram do operador (agenda, status, pagamento) — corre em paralelo com o dorking.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class TelegramListener:
    def __init__(self, env: dict[str, str], log: logging.Logger) -> None:
        self.env = env
        self.log = log
        self.token = env.get("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = str(env.get("TELEGRAM_CHAT_ID", ""))
        self.offset = 0
        self._agenda_local = env.get("AGENDA_DISPONIVEL", "true").lower() != "false"

    def _supabase_cfg(self) -> tuple[str, str] | None:
        url = self.env.get("SUPABASE_URL") or self.env.get("NEXT_PUBLIC_SUPABASE_URL", "")
        key = self.env.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if url and key:
            return url.rstrip("/"), key
        return None

    async def _set_agenda(self, disponivel: bool) -> bool:
        self._agenda_local = disponivel
        cfg = self._supabase_cfg()
        if not cfg:
            return True
        url, key = cfg
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                r = await c.patch(
                    f"{url}/rest/v1/operador_config?id=eq.1",
                    headers={
                        "apikey": key,
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={"agenda_disponivel": disponivel},
                )
                return r.status_code in (200, 204)
        except Exception as e:
            self.log.error(f"Supabase agenda: {e}")
            return False

    async def _get_agenda(self) -> bool:
        cfg = self._supabase_cfg()
        if cfg:
            url, key = cfg
            try:
                async with httpx.AsyncClient(timeout=10) as c:
                    r = await c.get(
                        f"{url}/rest/v1/operador_config?id=eq.1&select=agenda_disponivel",
                        headers={"apikey": key, "Authorization": f"Bearer {key}"},
                    )
                    if r.status_code == 200:
                        rows = r.json()
                        if rows:
                            return bool(rows[0].get("agenda_disponivel", True))
            except Exception as e:
                self.log.error(f"Supabase leitura agenda: {e}")
        return self._agenda_local

    async def _reply(self, chat_id: int | str, text: str) -> None:
        if not self.token:
            return
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(
                f"https://api.telegram.org/bot{self.token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            )

    async def _alerta_pagamento(self, partes: list[str]) -> str:
        nome = partes[0] if partes else "Cliente"
        plano = partes[1] if len(partes) > 1 else "—"
        valor = partes[2] if len(partes) > 2 else "—"
        msg = (
            f"✅ <b>Pagamento aprovado</b>\n"
            f"👤 {nome}\n📋 Plano: {plano}\n💶 Valor: €{valor}\n\n"
            f"<i>Confirme ao cliente e agende entrega.</i>"
        )
        if self.token and self.chat_id:
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(
                    f"https://api.telegram.org/bot{self.token}/sendMessage",
                    json={
                        "chat_id": self.chat_id,
                        "text": msg,
                        "parse_mode": "HTML",
                    },
                )
        return "Alerta de pagamento enviado."

    async def _handle_command(self, text: str, chat_id: int | str) -> str | None:
        if str(chat_id) != self.chat_id:
            return None

        cmd = text.strip().lower()
        if cmd in ("/agenda on", "/agenda aberta", "/agenda abrir"):
            await self._set_agenda(True)
            return "🟢 Agenda <b>aberta</b> — o site mostra disponibilidade."

        if cmd in ("/agenda off", "/agenda fechada", "/agenda fechar"):
            await self._set_agenda(False)
            return "🟡 Agenda <b>fechada</b> — clientes podem contactar na mesma."

        if cmd == "/status":
            agenda = await self._get_agenda()
            estado = "aberta" if agenda else "fechada"
            return (
                f"📡 <b>LexBot PT — status</b>\n"
                f"• Dorking: activo\n"
                f"• Agenda: {estado}\n"
                f"• Alertas site/WhatsApp: Telegram\n\n"
                f"Comandos: /agenda on · /agenda off · /pago Nome|Plano|Valor"
            )

        if cmd.startswith("/pago"):
            partes = [p.strip() for p in text.split(maxsplit=1)[1].split("|")] if " " in text else []
            if len(partes) < 2:
                return "Uso: /pago Nome|Plano|Valor  (ex: /pago Maria|Padrão|39)"
            return await self._alerta_pagamento(partes)

        if cmd in ("/ajuda", "/help", "/start"):
            return (
                "<b>Comandos do operador</b>\n"
                "/agenda on — marcar disponível\n"
                "/agenda off — marcar indisponível\n"
                "/status — estado do sistema\n"
                "/pago Nome|Plano|Valor — alerta pagamento aprovado"
            )

        return None

    async def poll_once(self) -> None:
        if not self.token:
            return
        params: dict[str, Any] = {"timeout": 25, "allowed_updates": ["message"]}
        if self.offset:
            params["offset"] = self.offset

        try:
            async with httpx.AsyncClient(timeout=35) as c:
                r = await c.get(
                    f"https://api.telegram.org/bot{self.token}/getUpdates",
                    params=params,
                )
                if r.status_code != 200:
                    return
                data = r.json()
                for upd in data.get("result", []):
                    self.offset = upd["update_id"] + 1
                    msg = upd.get("message") or {}
                    text = msg.get("text", "")
                    chat_id = msg.get("chat", {}).get("id")
                    if not text or not chat_id:
                        continue
                    resposta = await self._handle_command(text, chat_id)
                    if resposta:
                        await self._reply(chat_id, resposta)
        except Exception as e:
            self.log.debug(f"Telegram poll: {e}")

    async def loop(self) -> None:
        self.log.info("Listener Telegram activo (/agenda, /status, /pago)")
        import asyncio

        while True:
            await self.poll_once()
            await asyncio.sleep(1)

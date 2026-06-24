"""Executa Google Dorks via DuckDuckGo (sem API paga)."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

logger = logging.getLogger(__name__)


def _search_sync(query: str, max_results: int) -> list[dict[str, str]]:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        logger.error("Instale: pip install duckduckgo-search")
        return []

    posts: list[dict[str, str]] = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                href = r.get("href") or r.get("link") or ""
                body = r.get("body") or r.get("snippet") or ""
                title = r.get("title") or ""
                if not href:
                    continue
                posts.append({
                    "autor": "web",
                    "texto": f"{title}\n{body}".strip(),
                    "link": href,
                    "fonte": "dork:duckduckgo",
                    "dork_query": query[:120],
                })
    except Exception as e:
        logger.warning(f"Dork DDG falhou [{query[:50]}...]: {e}")
    return posts


async def run_dorks(
    dorks: list[dict[str, Any]],
    max_per_dork: int = 8,
    delay_sec: float = 3.0,
) -> list[dict]:
    all_posts: list[dict] = []
    seen: set[str] = set()

    for i, dork in enumerate(dorks):
        q = dork.get("query", "")
        if not q:
            continue
        logger.info(f"Dork [{i+1}/{len(dorks)}]: {q[:70]}...")
        batch = await asyncio.to_thread(_search_sync, q, max_per_dork)
        for p in batch:
            if p["link"] not in seen:
                seen.add(p["link"])
                p["dork_id"] = dork.get("id", f"dork_{i}")
                if dork.get("canal"):
                    p["canal"] = dork["canal"]
                if dork.get("grupo"):
                    p["grupo_hint"] = dork["grupo"]
                all_posts.append(p)
        if i < len(dorks) - 1:
            await asyncio.sleep(delay_sec)

    logger.info(f"DuckDuckGo dorks: {len(all_posts)} resultados unicos")
    return all_posts

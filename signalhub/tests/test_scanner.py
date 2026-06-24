"""Testes do DorkScanner (sem chamadas de rede reais)."""

from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
import yaml

from core.sources.scanner import DorkScanner

ROOT = Path(__file__).parent.parent


@pytest.fixture
def pt_dorks_path(tmp_path):
    cfg = yaml.safe_load(
        (ROOT / "config" / "portugal" / "dorks.yaml.example").read_text(encoding="utf-8")
    )
    cfg["dorks"] = cfg["dorks"][:1]
    cfg["fontes"] = ["duckduckgo", "reddit"]
    p = tmp_path / "dorks.yaml"
    p.write_text(yaml.dump(cfg), encoding="utf-8")
    return p


@pytest.mark.asyncio
async def test_scanner_merge_dedup(pt_dorks_path):
    scanner = DorkScanner(pt_dorks_path)
    fake_ddg = [
        {"autor": "web", "texto": "MEO fidelização", "link": "https://a.com/1", "fonte": "dork:duckduckgo"},
    ]
    fake_reddit = [
        {"autor": "u/x", "texto": "outro", "link": "https://a.com/1", "fonte": "reddit:r/portugal"},
        {"autor": "u/y", "texto": "CTT atraso", "link": "https://b.com/2", "fonte": "reddit:r/portugal"},
    ]

    with (
        patch("core.sources.scanner.run_dorks", new_callable=AsyncMock, return_value=fake_ddg),
        patch("core.sources.scanner.RedditSource") as mock_reddit_cls,
    ):
        mock_reddit_cls.return_value.fetch = AsyncMock(return_value=fake_reddit)
        posts = await scanner.scan()

    assert len(posts) == 2


def test_dorks_yaml_example_valid():
    path = ROOT / "config" / "portugal" / "dorks.yaml.example"
    cfg = yaml.safe_load(path.read_text(encoding="utf-8"))
    assert "dorks" in cfg
    assert "fontes" in cfg
    assert cfg["meta"].get("portal_queixa") == "desactivado_ate_nipc"
    for d in cfg["dorks"]:
        assert "query" in d
        assert "id" in d

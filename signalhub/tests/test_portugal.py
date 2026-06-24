"""Testes do tenant Portugal (Direitos do Consumidor)."""

import logging
from pathlib import Path

import pytest
import yaml

from core.engine import SignalHubEngine

ROOT = Path(__file__).parent.parent
CFG = ROOT / "config" / "portugal"
FIXTURE = ROOT / "tests" / "fixtures" / "keywords_portugal.yaml"


@pytest.fixture
def pt_engine():
    env = {"GROQ_API_KEY": "x", "MAX_ALERTAS_POR_HORA": "50", "GROQ_REVISAO": "1"}
    kw = ROOT / "config" / "portugal" / "keywords.yaml"
    if not kw.exists():
        kw = FIXTURE
    log = logging.getLogger("test")
    engine = SignalHubEngine(kw, env, log)
    if not (ROOT / "config" / "portugal" / "prompts.yaml").exists():
        engine._prompts = yaml.safe_load(
            (ROOT / "tests" / "fixtures" / "prompts.yaml").read_text(encoding="utf-8")
        )
    return engine


def test_pt_score_telecom(pt_engine):
    s, g = pt_engine.score("MEO fidelização cancelar contrato")
    assert s >= 7
    assert g == "pt_telecom"


def test_pt_contexto_comercial(pt_engine):
    ctx = pt_engine._contexto_comercial("pt_telecom")
    assert "15 dias úteis" in ctx
    assert "ANACOM" in ctx
    assert "€39" in ctx or "padrao" in ctx.lower()
    assert "pt_telecom" in ctx


def test_pt_regras_setor_telecom(pt_engine):
    s = pt_engine._regras_setor("pt_telecom")
    assert s["prazo"] == "15 dias úteis"
    assert s["regulatorio"] == "ANACOM"
    assert "LCE" in s["nota_setor"] or "ANACOM" in s["nota_setor"]


def test_pt_fallback_roteiro(pt_engine):
    r1, r2, r3 = pt_engine._fallback_respostas("pt_telecom")
    assert r1.lower().startswith("olá")
    assert "24/96" in r2 or "24" in r2
    assert "15 dias" in r2
    assert "ANACOM" in r2
    assert "48" in r2
    assert "direitosconsumidor" in r3.lower()
    assert "dgsi" not in r3.lower()


def test_pt_revisao_habilitada(pt_engine):
    assert pt_engine._usar_revisao_groq() is True


def test_pt_detecta_voce(pt_engine):
    hits = pt_engine._detectar_pt_br(["Olá", "Você tem direito", "ok"])
    assert hits


def test_pt_prompt_template_placeholders(pt_engine):
    prompts_path = CFG / "prompts.yaml"
    if not prompts_path.exists():
        prompts = pt_engine._prompts
    else:
        prompts = yaml.safe_load(prompts_path.read_text(encoding="utf-8"))
    tpl = prompts["groq_system_template"]
    for key in (
        "nicho_nome",
        "grupo_nome",
        "cta_txt",
        "cta_link",
        "contexto_comercial",
        "lei_base",
        "prazo_resposta",
        "preco_sugerido",
        "nota_setor",
    ):
        assert "{" + key + "}" in tpl
    assert "groq_revisao_template" in prompts
    assert "{r1}" in prompts["groq_revisao_template"]


def test_pt_keywords_domain_and_empresa():
    kw_path = CFG / "keywords.yaml"
    if not kw_path.exists():
        pytest.skip("keywords.yaml local ausente")
    cfg = yaml.safe_load(kw_path.read_text(encoding="utf-8"))
    nicho = cfg["nichos"]["lex_portugal"]
    assert "direitosconsumidor.com" in nicho["cta_link"]
    assert "jurisdicao" in nicho["empresa"] or "forma" in nicho["empresa"]
    assert "cnpj" not in nicho["empresa"]
    assert "Tecnologia" not in str(nicho)
    assert "pesquisa jurídica" in nicho["empresa"]["atuacao"].lower()


def test_pt_dorks_example_valid():
    path = CFG / "dorks.yaml.example"
    cfg = yaml.safe_load(path.read_text(encoding="utf-8"))
    assert cfg["meta"]["tenant"] == "lex_portugal"
    assert cfg["meta"].get("versao") == "2.1"
    assert cfg["meta"].get("portal_queixa") == "desactivado_ate_nipc"
    assert len(cfg["dorks"]) >= 45
    canais = {d["canal"] for d in cfg["dorks"] if d.get("canal")}
    assert "portal_queixa" not in canais
    assert len(canais) >= 9
    assert "portugal" in cfg["reddit"]["subreddits"]


def test_pt_score_cancelamento(pt_engine):
    s, g = pt_engine.score("como cancelar contrato fidelização MEO")
    assert s >= 7
    assert g in ("pt_cancelamento", "pt_telecom")

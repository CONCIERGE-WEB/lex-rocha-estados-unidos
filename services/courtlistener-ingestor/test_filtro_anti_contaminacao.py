"""Tests for U.S. anti-contamination barrier (no BR TPU / SFH / mortgage in flights)."""
from __future__ import annotations

import unittest

from filtro_anti_contaminacao import aceitar_hit_categoria, filtrar_anti_contaminacao


class TestFiltroAntiContaminacao(unittest.TestCase):
    def test_rejeita_mortgage_em_voo(self):
        ok, motivo = aceitar_hit_categoria(
            {
                "case_name": "Smith v. Bank — mortgage foreclosure",
                "snippet": "Deed of trust and housing loan dispute",
            },
            "dot_flights_baggage",
        )
        self.assertFalse(ok)
        self.assertTrue("mortgage" in motivo or "sfh" in motivo)

    def test_rejeita_sfh_legado_br(self):
        ok, motivo = aceitar_hit_categoria(
            {
                "case_name": "Consumidor v. CEF",
                "snippet": "Sistema Financeiro da Habitação SFH mutuário",
            },
            "dot_flights_baggage",
        )
        self.assertFalse(ok)

    def test_aceita_airline_delay(self):
        ok, motivo = aceitar_hit_categoria(
            {
                "case_name": "Passenger v. Airline",
                "snippet": "Flight delay and baggage liability under DOT rules",
            },
            "dot_flights_baggage",
        )
        self.assertTrue(ok)
        self.assertEqual(motivo, "ok")

    def test_filtrar_lote(self):
        hits = [
            {"case_name": "A v. Airline", "snippet": "baggage delay DOT"},
            {"case_name": "B v. Bank", "snippet": "mortgage foreclosure"},
        ]
        kept, meta = filtrar_anti_contaminacao(hits, "dot_flights_baggage")
        self.assertEqual(meta["entrada"], 2)
        self.assertEqual(meta["saida"], 1)
        self.assertEqual(len(kept), 1)


if __name__ == "__main__":
    unittest.main()

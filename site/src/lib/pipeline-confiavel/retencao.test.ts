import { describe, expect, it } from "vitest";

import {
  carregarPoliticaRetencao,
  registrarPedidoExclusaoAntecipada,
  selecionarParaExpurgo,
} from "@/lib/pipeline-confiavel/retencao";

describe("pipeline-confiavel/retencao", () => {
  it("usa defaults configuráveis e seleciona registros expirados", () => {
    const politica = carregarPoliticaRetencao({} as NodeJS.ProcessEnv);
    expect(politica.diasDadosFormulario).toBeGreaterThan(0);

    const agora = new Date("2026-07-03T00:00:00.000Z");
    const selecionados = selecionarParaExpurgo({
      politica: { diasDadosFormulario: 30, diasRelatorios: 30 },
      agora,
      registros: [
        {
          id: "a",
          tipo: "formulario",
          criadoEm: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "b",
          tipo: "formulario",
          criadoEm: "2026-07-01T00:00:00.000Z",
        },
      ],
    });
    expect(selecionados.map((s) => s.id)).toEqual(["a"]);
  });

  it("registra pedido de exclusão antecipada LGPD", () => {
    const p = registrarPedidoExclusaoAntecipada("titular-1");
    expect(p.motivo).toBe("direito_lgpd_art18");
  });
});

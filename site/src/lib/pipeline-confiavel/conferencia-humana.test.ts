import { describe, expect, it } from "vitest";

import {
  categoriaProntaParaProducao,
  listarPendentesConferenciaHumana,
  VARIAVEIS_ESTRUTURADAS_POR_CATEGORIA,
} from "@/lib/pipeline-confiavel/conferencia-humana";

describe("pipeline-confiavel/conferencia-humana", () => {
  it("includes FCRA dispute tip (30 days)", () => {
    const pendentes = listarPendentesConferenciaHumana(["negativacao_indevida"]);
    const jur = pendentes.find((p) => p.id === "jur_001");
    expect(jur?.dica).toMatch(/30 days/i);
    expect(jur?.resultado_resumido).toMatch(/30 days/i);
  });

  it("lista os 4 itens pendentes de cobranca_indevida", () => {
    const pendentes = listarPendentesConferenciaHumana(["cobranca_indevida"]);
    expect(pendentes).toHaveLength(4);
    const ids = pendentes.map((p) => p.id).sort();
    expect(ids).toEqual(
      [
        "jur_sum_297",
        "jur_tema_929",
        "jur_tjdft_2021349",
        "jur_tjdft_2031528",
      ].sort()
    );
    for (const p of pendentes) {
      expect(p.status_verificacao).not.toBe("CONFIRMADO");
      expect(p.link_e_fonte_primaria).toBe(true);
      expect(p.instrucao).toMatch(/inteiro teor|full text/i);
    }
  });

  it("categoria 2 não está pronta para produção", () => {
    const r = categoriaProntaParaProducao("cobranca_indevida");
    expect(r.pronta).toBe(false);
    expect(r.pendentes).toBe(4);
  });

  it("documenta pagou_valor_cobrado como variável estruturada", () => {
    const vars = VARIAVEIS_ESTRUTURADAS_POR_CATEGORIA.cobranca_indevida;
    expect(vars.some((v) => v.campo === "pagou_valor_cobrado")).toBe(true);
  });
});

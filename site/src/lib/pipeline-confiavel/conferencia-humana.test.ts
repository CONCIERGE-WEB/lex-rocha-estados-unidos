import { describe, expect, it } from "vitest";

import {
  categoriaProntaParaProducao,
  listarPendentesConferenciaHumana,
  VARIAVEIS_ESTRUTURADAS_POR_CATEGORIA,
} from "@/lib/pipeline-confiavel/conferencia-humana";

describe("pipeline-confiavel/conferencia-humana", () => {
  it("inclui dica da Súmula 548 (5 dias úteis)", () => {
    const pendentes = listarPendentesConferenciaHumana(["negativacao_indevida"]);
    const s548 = pendentes.find((p) => p.id === "jur_001");
    expect(s548?.dica).toMatch(/úteis/i);
    expect(s548?.resultado_resumido).toMatch(/úteis/i);
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
      expect(p.instrucao).toMatch(/inteiro teor/i);
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

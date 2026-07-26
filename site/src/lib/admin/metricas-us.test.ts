import { describe, expect, it } from "vitest";

import { carregarMatrizCorpusAdmin } from "@/lib/admin/corpus-matriz-admin";
import { calcularMetricasFinanceirasUs } from "@/lib/admin/metricas-us";
import { mockPagamentosMes } from "@/lib/admin/mock-local";

describe("admin/metricas-us", () => {
  it("computes USD MRR, ticket, LTV from $49/$79/$119 mock sales", () => {
    const m = calcularMetricasFinanceirasUs(mockPagamentosMes());
    expect(m.precosBase.essencial).toBe(49);
    expect(m.precosBase.padrao).toBe(79);
    expect(m.precosBase.completo).toBe(119);
    expect(m.pagosCount).toBe(4);
    expect(m.receitaMes).toBe(49 + 79 + 119 + 79);
    expect(m.mrr).toBe(m.receitaMes);
    expect(m.ticketMedio).toBeCloseTo(m.receitaMes / 4, 2);
    expect(m.ltv).toBe(Math.round(m.ticketMedio * 1.15 * 100) / 100);
  });
});

describe("admin/corpus-matriz-admin", () => {
  it("reads 30 CourtListener seed cells (States, not UFs)", () => {
    const m = carregarMatrizCorpusAdmin();
    expect(m.totais.cells).toBe(30);
    expect(m.states).toEqual(["US", "CA", "NY", "TX", "FL", "IL"]);
    expect(m.fonte).toBe("report-models/granted");
    expect(m.cells.every((c) => c.jurisdictionLabel.length > 0)).toBe(true);
    expect(m.cells.some((c) => c.state === "US")).toBe(true);
    expect(m.totais.aguardando + m.totais.parcial + m.totais.pronto + m.totais.ausente).toBe(
      30
    );
  });
});

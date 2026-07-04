import { describe, expect, it } from "vitest";

import { gerarCsvIr, totalRecebido, type LinhaIr } from "./export-ir";

describe("gerarCsvIr", () => {
  it("inclui BOM e cabeçalho", () => {
    const csv = gerarCsvIr([]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain(
      "Data;Valor (BRL);Forma de pagamento;Status;Relatorio ID;NFS-e numero"
    );
  });

  it("formata data (DD/MM/AAAA) e valor (vírgula decimal)", () => {
    const csv = gerarCsvIr([
      {
        data: "2026-03-15T10:00:00.000Z",
        valor: 149.9,
        forma: "pix",
        status: "pago",
        relatorioId: "abc",
        nfseNumero: "123",
      },
    ]);
    expect(csv).toContain("15/03/2026;149,90;pix;pago;abc;123");
  });

  it("escapa separador e aspas no padrão CSV", () => {
    const csv = gerarCsvIr([
      {
        data: "2026-01-01T00:00:00.000Z",
        valor: 10,
        forma: 'cartão; "visa"',
        status: "pago",
        relatorioId: "x",
        nfseNumero: null,
      },
    ]);
    expect(csv).toContain('"cartão; ""visa"""');
    expect(csv).toContain(";10,00;");
  });

  it("trata nfseNumero ausente como vazio", () => {
    const csv = gerarCsvIr([
      {
        data: "2026-02-10T00:00:00.000Z",
        valor: 50,
        forma: null,
        status: "pendente",
        relatorioId: "y",
      },
    ]);
    expect(csv).toContain("10/02/2026;50,00;;pendente;y;");
  });
});

describe("totalRecebido", () => {
  it("soma apenas pagamentos pagos", () => {
    const linhas: LinhaIr[] = [
      { data: "2026-01-01", valor: 100, forma: null, status: "pago", relatorioId: "a" },
      { data: "2026-01-02", valor: 50, forma: null, status: "pendente", relatorioId: "b" },
      { data: "2026-01-03", valor: 25.5, forma: null, status: "pago", relatorioId: "c" },
    ];
    expect(totalRecebido(linhas)).toBe(125.5);
  });
});

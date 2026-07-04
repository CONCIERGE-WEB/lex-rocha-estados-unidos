import { describe, expect, it } from "vitest";

import {
  carregarBancoPrecedentes,
  limparCacheBancoPrecedentes,
} from "@/lib/pipeline-confiavel/banco/loader";

async function fetchTexto(url: string): Promise<{ status: number; texto: string }> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (compatible; LexRocha-Pipeline/1.0)",
    },
    redirect: "follow",
  });
  const texto = await response.text();
  return { status: response.status, texto };
}

describe("pipeline-confiavel/banco links oficiais (HTTP)", () => {
  it("FCRA foundation (consumerfinance.gov): HTTP 200 and relevant content", async () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    const fl = entrada.fundamentos_legais[0];
    expect(fl.link_oficial).toBeTruthy();
    const { status, texto } = await fetchTexto(fl.link_oficial!);
    expect(status).toBe(200);
    const lower = texto.toLowerCase();
    expect(
      lower.includes("credit") ||
        lower.includes("fcra") ||
        lower.includes("1681")
    ).toBe(true);
  }, 25_000);

  it("FCRA precedent link: HTTP 200+content or 403 with human verification pending", async () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    const jur = entrada.jurisprudencia.find((j) => j.id === "jur_001");
    expect(jur).toBeTruthy();
    expect(jur!.verificado_por.length).toBeGreaterThan(0);
    expect(jur!.data_verificacao_link).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const { status, texto } = await fetchTexto(jur!.link_oficial);
    if (status === 200) {
      const lower = texto.toLowerCase();
      expect(
        lower.includes("credit") ||
          lower.includes("fcra") ||
          lower.includes("reporting")
      ).toBe(true);
    } else {
      expect([401, 403]).toContain(status);
      expect(jur!.verificado_por).toBeTruthy();
      expect(jur!.resultado_resumido.toLowerCase()).toMatch(/fcra|dispute|30 days/);
    }
  }, 25_000);
});

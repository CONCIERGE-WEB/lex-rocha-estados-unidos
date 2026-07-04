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
  it("fundamentos CDC (Planalto): HTTP 200 e conteúdo condizente", async () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    const fl = entrada.fundamentos_legais[0];
    expect(fl.link_oficial).toBeTruthy();
    const { status, texto } = await fetchTexto(fl.link_oficial!);
    expect(status).toBe(200);
    const lower = texto.toLowerCase();
    expect(lower.includes("8078") || lower.includes("consumidor")).toBe(true);
  }, 25_000);

  it("Súmula 548/STJ: verifica link oficial (200+conteúdo ou 403 com verificação humana)", async () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    const jur = entrada.jurisprudencia.find(
      (j) => j.numero_processo === "Súmula 548/STJ"
    );
    expect(jur).toBeTruthy();
    expect(jur!.verificado_por.length).toBeGreaterThan(0);
    expect(jur!.data_verificacao_link).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const { status, texto } = await fetchTexto(jur!.link_oficial);
    // Evidência programática do status real da fonte
    // STJ/SCON frequentemente responde 403 a clientes automatizados.
    if (status === 200) {
      const lower = texto.toLowerCase();
      expect(
        lower.includes("súmula") ||
          lower.includes("sumula") ||
          lower.includes("548") ||
          lower.includes("stj")
      ).toBe(true);
    } else {
      expect([401, 403]).toContain(status);
      // Bloqueio técnico compensado por verificação humana registrada no banco
      expect(jur!.verificado_por).toBeTruthy();
      expect(jur!.resultado_resumido.toLowerCase()).toMatch(/cadastro|inadimpl|exclus/);
    }
  }, 25_000);
});

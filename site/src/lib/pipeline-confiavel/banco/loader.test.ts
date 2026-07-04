import { describe, expect, it } from "vitest";

import {
  carregarBancoPrecedentes,
  limparCacheBancoPrecedentes,
  numerosProcessoDoBanco,
  urlsAutorizadasDoBanco,
} from "@/lib/pipeline-confiavel/banco/loader";

describe("pipeline-confiavel/banco/loader", () => {
  it("carrega negativacao_indevida com fundamentos e jurisprudencia", () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    expect(entrada.categoria).toBe("negativacao_indevida");
    expect(entrada.fundamentos_legais.length).toBeGreaterThan(0);
    expect(entrada.jurisprudencia.length).toBeGreaterThan(0);
    expect(entrada.texto_molde).toContain("{{nome_cliente}}");
    expect(urlsAutorizadasDoBanco(entrada).length).toBeGreaterThan(0);
    expect(numerosProcessoDoBanco(entrada)).toContain(
      "Gorman v. Wolpoff & Abramson, 854 F. Supp. 914"
    );
  });
});

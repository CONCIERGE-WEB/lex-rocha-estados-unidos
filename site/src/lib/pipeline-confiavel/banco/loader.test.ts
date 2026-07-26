import { describe, expect, it } from "vitest";

import {
  carregarBancoPrecedentes,
  limparCacheBancoPrecedentes,
  numerosProcessoDoBanco,
  urlsAutorizadasDoBanco,
} from "@/lib/pipeline-confiavel/banco/loader";

describe("pipeline-confiavel/banco/loader", () => {
  it("carrega FCRA via stem legado negativacao_indevida", () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    expect(entrada.categoria).toBe("fcra_credit_reporting");
    expect(entrada.fundamentos_legais.length).toBeGreaterThan(0);
    expect(entrada.jurisprudencia.length).toBeGreaterThan(0);
    expect(entrada.texto_molde).toContain("{{nome_cliente}}");
    expect(urlsAutorizadasDoBanco(entrada).length).toBeGreaterThan(0);
    expect(numerosProcessoDoBanco(entrada)).toContain(
      "Gorman v. Wolpoff & Abramson, 854 F. Supp. 914"
    );
  });
});

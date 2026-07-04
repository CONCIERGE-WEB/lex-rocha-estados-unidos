import { describe, expect, it } from "vitest";

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { limparCacheBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { interpolarRelatorioNegativacao } from "@/lib/pipeline-confiavel/interpolacao";
import {
  EXPRESSOES_PROIBIDAS_ROTA_A,
  lintarIndividualizacao,
} from "@/lib/pipeline-confiavel/lexico-rota-a";

describe("pipeline-confiavel/lexico-rota-a (Route A — en-US)", () => {
  it("blocks forbidden individualized legal phrasing in English", () => {
    expect(EXPRESSOES_PROIBIDAS_ROTA_A.length).toBeGreaterThan(10);
    const frases = [
      "in your case the court will",
      "your case qualifies under",
      "you're entitled to damages",
      "you have a right to sue",
      "we recommend that you file",
      "we advise you to contact",
      "our recommendation is to sue",
      "this is legal advice",
      "our legal opinion is",
      "applicable to your case",
      "in your specific case",
      "you will win this dispute",
      "probability of winning is high",
      "chances of winning are good",
      "expected outcome is favorable",
      "likely outcome in your case",
      "unauthorized practice of law",
    ];
    for (const frase of frases) {
      const r = lintarIndividualizacao(frase);
      expect(r.status, frase).toBe("fail");
      expect(r.ocorrencias.length).toBeGreaterThan(0);
    }
  });

  it("allows standard negated legal-advice disclaimers", () => {
    const disclaimers = [
      "This report does not constitute legal advice.",
      "This is not legal advice about your situation.",
      "The content is not legal advice and does not guarantee outcomes.",
      "We do not provide legal advice on individual cases.",
    ];
    for (const frase of disclaimers) {
      expect(lintarIndividualizacao(frase).status, frase).toBe("pass");
    }
    expect(lintarIndividualizacao("You should rely on our legal advice for your case.").status).toBe(
      "fail"
    );
  });

  it("interpolated Route A report passes the linter", () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    const texto = interpolarRelatorioNegativacao({
      entradaBanco: entrada,
      ambiente: "teste",
      dados: {
        nome_cliente: "Jane Doe",
        empresa_reclamada: "Company X",
        data_negativacao: "2025-03-10",
        valor_negativado_centavos: 5000,
        ja_tentou_resolver_diretamente: false,
        possui_comprovante_quitacao: false,
      },
    });
    const r = lintarIndividualizacao(texto);
    expect(r.status).toBe("pass");
    expect(texto.toLowerCase()).toContain("category");
    expect(texto.toLowerCase()).toContain("sources for verification");
  });
});

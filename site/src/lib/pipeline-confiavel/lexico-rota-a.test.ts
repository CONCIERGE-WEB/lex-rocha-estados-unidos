import { describe, expect, it } from "vitest";

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { limparCacheBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { interpolarRelatorioNegativacao } from "@/lib/pipeline-confiavel/interpolacao";
import {
  EXPRESSOES_PROIBIDAS_ROTA_A,
  lintarIndividualizacao,
} from "@/lib/pipeline-confiavel/lexico-rota-a";

describe("pipeline-confiavel/lexico-rota-a (Rota A)", () => {
  it("bloqueia cada expressão proibida da tabela", () => {
    expect(EXPRESSOES_PROIBIDAS_ROTA_A.length).toBeGreaterThan(10);
    const frases = [
      "o seu caso se enquadra em negativação",
      "você tem direito a indenização",
      "no seu caso o tribunal",
      "recomendamos que você procure",
      "aconselhamos a ação",
      "nossa orientação é",
      "o fundamento do seu caso é o art. 42",
      "aplicável ao seu caso",
      "este parecer recomenda",
      "consultoria jurídica gratuita",
      "assessoria jurídica online",
      "orientação jurídica personalizada",
      "você vai ganhar a ação",
      "sua chance é de 80%",
      "probabilidade de ganhar é alta",
      "resultado esperado favorável",
    ];
    for (const frase of frases) {
      const r = lintarIndividualizacao(frase);
      expect(r.status, frase).toBe("fail");
      expect(r.ocorrencias.length).toBeGreaterThan(0);
    }
  });

  it("relatório interpolado Rota A passa no linter", () => {
    limparCacheBancoPrecedentes();
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    const texto = interpolarRelatorioNegativacao({
      entradaBanco: entrada,
      ambiente: "teste",
      dados: {
        nome_cliente: "Maria Silva",
        empresa_reclamada: "Empresa X",
        data_negativacao: "2025-03-10",
        valor_negativado_centavos: 5000,
        ja_tentou_resolver_diretamente: false,
        possui_comprovante_quitacao: false,
      },
    });
    const r = lintarIndividualizacao(texto);
    expect(r.status).toBe("pass");
    expect(texto.toLowerCase()).toContain("categoria");
    expect(texto.toLowerCase()).toContain("fontes para conferência");
    expect(texto.toLowerCase()).toContain("panorama estatístico");
  });
});

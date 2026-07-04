import { describe, expect, it } from "vitest";

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import {
  BancoCitacoesNaoConferidasError,
  PROMPT_SISTEMA_INTERPOLACAO_RESTRITO,
  interpolarRelatorioNegativacao,
  textoReescritoRespeitaFonte,
} from "@/lib/pipeline-confiavel/interpolacao";

describe("pipeline-confiavel/interpolacao", () => {
  const entrada = carregarBancoPrecedentes("negativacao_indevida");

  it("interpola apenas dados do formulário e do banco (ambiente teste)", () => {
    const texto = interpolarRelatorioNegativacao({
      entradaBanco: entrada,
      ambiente: "teste",
      dados: {
        nome_cliente: "Maria Silva",
        empresa_reclamada: "Empresa X",
        data_negativacao: "2025-03-10",
        valor_negativado_centavos: 15000,
        ja_tentou_resolver_diretamente: true,
        canal_tentativa: "procon",
        possui_comprovante_quitacao: true,
      },
    });
    expect(texto).toContain("Maria Silva");
    expect(texto).toContain("Empresa X");
    expect(texto).toContain("Gorman v. Wolpoff");
    expect(texto).toContain("consumerfinance.gov");
    expect(texto).toContain("vigentes em 2026-07-03");
    expect(texto).not.toContain("{{");
    expect(PROMPT_SISTEMA_INTERPOLACAO_RESTRITO).toMatch(/category/i);
    expect(PROMPT_SISTEMA_INTERPOLACAO_RESTRITO).toMatch(/unauthorized practice of law/i);
  });

  it("produção recusa categoria com citacoes_conferidas false", () => {
    expect(entrada.citacoes_conferidas).toBe(false);
    expect(() =>
      interpolarRelatorioNegativacao({
        entradaBanco: entrada,
        ambiente: "producao",
        dados: {
          nome_cliente: "Maria Silva",
          empresa_reclamada: "Empresa X",
          data_negativacao: "2025-03-10",
          valor_negativado_centavos: 1000,
          ja_tentou_resolver_diretamente: false,
          possui_comprovante_quitacao: false,
        },
      })
    ).toThrow(BancoCitacoesNaoConferidasError);
  });


  it("bloqueia reescrito que inventa URL ou processo", () => {
    const original = interpolarRelatorioNegativacao({
      entradaBanco: entrada,
      ambiente: "teste",
      dados: {
        nome_cliente: "Maria Silva",
        empresa_reclamada: "Empresa X",
        data_negativacao: "2025-03-10",
        valor_negativado_centavos: 1000,
        ja_tentou_resolver_diretamente: false,
        possui_comprovante_quitacao: false,
      },
    });
    const inventado =
      original + "\nVer também https://exemplo-inventado.invalid/proc/999";
    const r = textoReescritoRespeitaFonte(original, inventado);
    expect(r.ok).toBe(false);
  });
});

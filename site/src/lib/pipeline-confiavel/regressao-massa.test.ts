import { describe, expect, it } from "vitest";

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { CATEGORIAS_PIPELINE } from "@/lib/pipeline-confiavel/categorias";
import {
  interpolarRelatorioCobranca,
  interpolarRelatorioNegativacao,
} from "@/lib/pipeline-confiavel/interpolacao";
import { lintarIndividualizacao } from "@/lib/pipeline-confiavel/lexico-rota-a";
import { verificarRascunhoContraBanco } from "@/lib/pipeline-confiavel/verificacao";

/**
 * Suite de regressão em massa (critério de aceitação).
 * Gera N rascunhos sintéticos e exige que o Módulo 4 nunca passe
 * com citação divergente do banco.
 */
describe("pipeline-confiavel/regressao-massa", () => {
  it("100 rascunhos sintéticos: nenhum passa com citação inventada", () => {
    const categoriasComBanco = CATEGORIAS_PIPELINE.filter((c) => {
      try {
        carregarBancoPrecedentes(c);
        return true;
      } catch {
        return false;
      }
    });

    expect(categoriasComBanco.length).toBeGreaterThan(0);

    let gerados = 0;
    for (let i = 0; i < 100; i++) {
      const categoria = categoriasComBanco[i % categoriasComBanco.length];
      const entrada = carregarBancoPrecedentes(categoria);
      const rascunho =
        categoria === "negativacao_indevida"
          ? interpolarRelatorioNegativacao({
              entradaBanco: entrada,
              dados: {
                nome_cliente: `Cliente Teste ${i}`,
                empresa_reclamada: `Empresa ${i % 17}`,
                data_negativacao: `2025-${String((i % 9) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
                valor_negativado_centavos: 1000 + i * 37,
                ja_tentou_resolver_diretamente: i % 2 === 0,
                canal_tentativa: i % 2 === 0 ? "procon" : undefined,
                possui_comprovante_quitacao: i % 3 === 0,
              },
              ambiente: "teste",
            })
          : interpolarRelatorioCobranca({
              entradaBanco: entrada,
              dados: {
                nome_cliente: `Cliente Teste ${i}`,
                empresa_reclamada: `Empresa ${i % 17}`,
                data_cobranca: `2025-${String((i % 9) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
                valor_cobrado_centavos: 1000 + i * 37,
                tipo_cobranca: "cartao",
                pagou_valor_cobrado: i % 2 === 0,
                ja_tentou_resolver_diretamente: i % 2 === 0,
                canal_tentativa: i % 2 === 0 ? "procon" : undefined,
              },
              ambiente: "teste",
            });

      // Injeta citação inventada em 10% dos casos — deve falhar
      const contaminado =
        i % 10 === 0
          ? `${rascunho}\nProcesso inventado 9999999-99.9999.9.99.9999 no TJXX. https://falso.example/${i}`
          : rascunho;

      const v = verificarRascunhoContraBanco({
        rascunho: contaminado,
        entradaBanco: entrada,
      });

      if (i % 10 === 0) {
        expect(v.status).toBe("fail");
      } else {
        expect(v.status).toBe("pass");
        expect(lintarIndividualizacao(rascunho).status).toBe("pass");
      }
      gerados += 1;
    }

    expect(gerados).toBe(100);
  });
});

import { describe, expect, it } from "vitest";

import { limparCacheBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { gerarRascunhoVerificadoNegativacao } from "@/lib/pipeline-confiavel/orquestracao";

describe("pipeline-confiavel/orquestracao", () => {
  it("gera rascunho, passa verificação e entra na fila rápida", () => {
    limparCacheBancoPrecedentes();

    const r = gerarRascunhoVerificadoNegativacao({
      id: "rel-teste-1",
      dados: {
        nome_cliente: "Maria Silva",
        empresa_reclamada: "Empresa X",
        data_negativacao: "2025-03-10",
        valor_negativado_centavos: 9900,
        ja_tentou_resolver_diretamente: true,
        canal_tentativa: "consumidor.gov",
        possui_comprovante_quitacao: true,
      },
    });
    expect(r.linter.status).toBe("pass");
    expect(r.verificacao.status).toBe("pass");
    expect(r.itemFila.fila).toBe("rapida");
    expect(r.rascunho.toLowerCase()).toContain("síntese informativa");
    expect(r.rascunho.toLowerCase()).toContain("categoria");
    expect(r.rascunho.toLowerCase()).not.toContain("seu caso");
  });
});


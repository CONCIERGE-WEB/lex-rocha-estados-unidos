import { describe, expect, it } from "vitest";

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { interpolarRelatorioNegativacao } from "@/lib/pipeline-confiavel/interpolacao";
import { verificarRascunhoContraBanco } from "@/lib/pipeline-confiavel/verificacao";

describe("pipeline-confiavel/verificacao (Módulo 4)", () => {
  const entrada = carregarBancoPrecedentes("negativacao_indevida");

  it("passa rascunho interpolado apenas com fontes do banco", () => {
    const rascunho = interpolarRelatorioNegativacao({
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
    const r = verificarRascunhoContraBanco({ rascunho, entradaBanco: entrada });
    expect(r.status).toBe("pass");
    expect(r.motivosFalha).toHaveLength(0);
  });

  it("bloqueia número de processo fabricado", () => {
    const rascunho = "Ver processo 0000000-00.0000.0.00.0000 no STJ.";
    const r = verificarRascunhoContraBanco({ rascunho, entradaBanco: entrada });
    expect(r.status).toBe("fail");
    expect(r.motivosFalha.some((m) => m.includes("0000000-00.0000.0.00.0000"))).toBe(
      true
    );
  });

  it("bloqueia tribunal fabricado fora do banco", () => {
    const rascunho = "Decisão do TJSP sobre o tema.";
    const r = verificarRascunhoContraBanco({ rascunho, entradaBanco: entrada });
    expect(r.status).toBe("fail");
    expect(r.motivosFalha.some((m) => m.includes("TJSP"))).toBe(true);
  });

  it("bloqueia link fabricado deliberadamente", () => {
    const rascunho = "Fonte: https://tribunal-falso.example/proc/1";
    const r = verificarRascunhoContraBanco({ rascunho, entradaBanco: entrada });
    expect(r.status).toBe("fail");
    expect(
      r.motivosFalha.some((m) => m.includes("tribunal-falso.example"))
    ).toBe(true);
  });
});


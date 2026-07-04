import { describe, expect, it } from "vitest";

import {
  podeAvancarParaPagamento,
  registrarAceiteDados,
} from "@/lib/pipeline-confiavel/confirmacao";

describe("pipeline-confiavel/confirmacao (Módulo 7)", () => {
  it("registra aceite com timestamp", () => {
    const reg = registrarAceiteDados({
      solicitacaoId: "sol-1",
      categoria: "negativacao_indevida",
      resumoCampos: { empresa_reclamada: "X" },
      confirmado: true,
    });
    expect(reg.textoAceite).toMatch(/Confirmo que os dados/);
    expect(reg.confirmadoEm).toBeTruthy();
    expect(podeAvancarParaPagamento(reg)).toBe(true);
  });

  it("sem aceite não avança para pagamento", () => {
    expect(podeAvancarParaPagamento(null)).toBe(false);
  });
});

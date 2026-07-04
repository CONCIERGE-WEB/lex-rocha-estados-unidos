import { describe, expect, it } from "vitest";

import {
  ChecklistIncompletoError,
  aplicarAcaoRevisor,
  checklistEnquadramentoVazio,
  checklistPermiteAprovacao,
  filtrarFilaExcecao,
  filtrarFilaRapida,
  montarItemFilaRevisao,
} from "@/lib/pipeline-confiavel/fila-revisao";
import type { ResultadoVerificacaoDeterministica } from "@/lib/pipeline-confiavel/verificacao";

const pass: ResultadoVerificacaoDeterministica = {
  status: "pass",
  itens: [],
  motivosFalha: [],
  verificadoEm: "2026-07-03T12:00:00.000Z",
};

const fail: ResultadoVerificacaoDeterministica = {
  status: "fail",
  itens: [{ tipo: "url", valor: "https://x", status: "falha" }],
  motivosFalha: ["URL não consta"],
  verificadoEm: "2026-07-03T12:00:00.000Z",
};

describe("pipeline-confiavel/fila-revisao (Módulo 6)", () => {
  it("fail nunca entra na fila rápida", () => {
    const item = montarItemFilaRevisao({
      id: "1",
      categoria: "negativacao_indevida",
      verificacao: fail,
      rascunho: "x",
      camposCliente: {},
    });
    expect(item.fila).toBe("excecao");
    expect(filtrarFilaRapida([item])).toHaveLength(0);
    expect(filtrarFilaExcecao([item])).toHaveLength(1);
  });

  it("aprovação sem checklist completo é bloqueada", () => {
    const item = montarItemFilaRevisao({
      id: "2",
      categoria: "negativacao_indevida",
      verificacao: pass,
      rascunho: "ok",
      camposCliente: { nome_cliente: "Maria" },
    });
    expect(checklistPermiteAprovacao(checklistEnquadramentoVazio())).toBe(
      false
    );
    expect(() => aplicarAcaoRevisor(item, "aprovar")).toThrow(
      ChecklistIncompletoError
    );

    const completo = {
      fatos_correspondem_categoria: true,
      fundamentos_analogos: true,
      sem_elemento_omitido: true,
    };
    expect(checklistPermiteAprovacao(completo)).toBe(true);
    const aprovado = aplicarAcaoRevisor(item, "aprovar", completo);
    expect(aprovado.checklist).toEqual(completo);
  });
});

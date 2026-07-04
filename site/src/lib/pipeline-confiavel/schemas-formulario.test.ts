import { describe, expect, it } from "vitest";

import { parseWizardSolicitacao } from "@/lib/pipeline-confiavel/schemas-formulario";

const baseContato = {
  nome_cliente: "Maria Silva",
  cpf_cliente: "529.982.247-25",
  email_cliente: "maria@example.com",
  consentimento_lgpd: true as const,
};

describe("pipeline-confiavel/schemas-formulario", () => {
  it("aceita negativacao_indevida válida", () => {
    const r = parseWizardSolicitacao({
      categoria: "negativacao_indevida",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "200,00",
      ja_tentou_resolver_diretamente: true,
      canal_tentativa: "consumidor.gov",
      possui_comprovante_quitacao: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.valor_negativado_centavos).toBe(20000);
    }
  });

  it("rejeita CPF inválido", () => {
    const r = parseWizardSolicitacao({
      categoria: "negativacao_indevida",
      ...baseContato,
      cpf_cliente: "111.111.111-11",
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "50,00",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejeita valor negativo e data futura", () => {
    const rValor = parseWizardSolicitacao({
      categoria: "negativacao_indevida",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "-10",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: false,
    });
    expect(rValor.success).toBe(false);

    const rData = parseWizardSolicitacao({
      categoria: "negativacao_indevida",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2099-01-01",
      valor_negativado_centavos: "10,00",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: false,
    });
    expect(rData.success).toBe(false);
  });

  it("exige canal quando tentou resolver", () => {
    const r = parseWizardSolicitacao({
      categoria: "negativacao_indevida",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "50,00",
      ja_tentou_resolver_diretamente: true,
      possui_comprovante_quitacao: false,
    });
    expect(r.success).toBe(false);
  });
});

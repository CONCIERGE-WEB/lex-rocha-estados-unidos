import { describe, expect, it } from "vitest";

import { parseWizardSolicitacao } from "@/lib/pipeline-confiavel/schemas-formulario";

const baseContato = {
  nome_cliente: "Maria Silva",
  email_cliente: "maria@example.com",
  state_us: "CA",
  consentimento_privacidade: true as const,
};

describe("pipeline-confiavel/schemas-formulario", () => {
  it("aceita fcra_credit_reporting válido (e alias legado)", () => {
    const r = parseWizardSolicitacao({
      categoria: "negativacao_indevida",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "200.00",
      ja_tentou_resolver_diretamente: true,
      canal_tentativa: "cfpb",
      possui_comprovante_quitacao: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.categoria).toBe("fcra_credit_reporting");
      expect(r.data.valor_negativado_centavos).toBe(20000);
    }
  });

  it("rejeita state inválido", () => {
    const r = parseWizardSolicitacao({
      categoria: "fcra_credit_reporting",
      ...baseContato,
      state_us: "XX",
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "50.00",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejeita valor negativo e data futura", () => {
    const rValor = parseWizardSolicitacao({
      categoria: "fcra_credit_reporting",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "-10",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: false,
    });
    expect(rValor.success).toBe(false);

    const rData = parseWizardSolicitacao({
      categoria: "fcra_credit_reporting",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2099-01-01",
      valor_negativado_centavos: "10.00",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: false,
    });
    expect(rData.success).toBe(false);
  });

  it("exige canal quando tentou resolver", () => {
    const r = parseWizardSolicitacao({
      categoria: "fcra_credit_reporting",
      ...baseContato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "50.00",
      ja_tentou_resolver_diretamente: true,
      possui_comprovante_quitacao: false,
    });
    expect(r.success).toBe(false);
  });
});

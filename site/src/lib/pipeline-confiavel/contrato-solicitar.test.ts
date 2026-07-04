import { describe, expect, it } from "vitest";

import { processarPayloadSolicitarPipeline } from "@/lib/pipeline-confiavel/contrato-solicitar";
import { gerarRascunhoVerificadoCategoria } from "@/lib/pipeline-confiavel/orquestracao";

const contato = {
  nome_cliente: "Maria Silva",
  cpf_cliente: "529.982.247-25",
  email_cliente: "maria@example.com",
  consentimento_lgpd: true as const,
};

describe("pipeline-confiavel/contrato-solicitar", () => {
  it("processa negativacao e produz narrativa estruturada", () => {
    const r = processarPayloadSolicitarPipeline({
      categoria: "negativacao_indevida",
      ...contato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "200,00",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.categoria_id).toBe("negativacao_indevida");
      expect(r.descricao).toContain("Categoria:");
      expect(r.descricao).not.toMatch(/texto livre longo/i);
    }
  });

  it("processa cobranca_indevida (categoria 2)", () => {
    const r = processarPayloadSolicitarPipeline({
      categoria: "cobranca_indevida",
      ...contato,
      empresa_reclamada: "Banco Y",
      data_cobranca: "2025-04-01",
      valor_cobrado_centavos: "99,90",
      tipo_cobranca: "cartao",
      pagou_valor_cobrado: true,
      ja_tentou_resolver_diretamente: true,
      canal_tentativa: "consumidor.gov",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.area).toContain("Cobrança");
      expect(r.estruturado.flags.pagou_valor_cobrado).toBe("sim");
    }
  });

  it("gera rascunho Rota A para cobranca sem individualização", () => {
    const r = gerarRascunhoVerificadoCategoria({
      id: "rel-cob-1",
      categoria: "cobranca_indevida",
      dados: {
        nome_cliente: "Maria Silva",
        empresa_reclamada: "Banco Y",
        data_cobranca: "2025-04-01",
        valor_cobrado_centavos: 9990,
        tipo_cobranca: "cartao",
        pagou_valor_cobrado: true,
        ja_tentou_resolver_diretamente: false,
      },
    });
    expect(r.linter.status).toBe("pass");
    expect(r.verificacao.status).toBe("pass");
    expect(r.rascunho).toContain("Tema 929");
    expect(r.rascunho).toContain("0730531-13.2024.8.07.0003");
    expect(r.rascunho.toLowerCase()).not.toContain("seu caso");
    expect(r.entradaBanco.citacoes_conferidas).toBe(false);
  });
});

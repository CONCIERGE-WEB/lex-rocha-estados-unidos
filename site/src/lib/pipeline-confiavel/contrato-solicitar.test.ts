import { describe, expect, it } from "vitest";

import { processarPayloadSolicitarPipeline } from "@/lib/pipeline-confiavel/contrato-solicitar";
import { gerarRascunhoVerificadoCategoria } from "@/lib/pipeline-confiavel/orquestracao";

const contato = {
  nome_cliente: "Maria Silva",
  email_cliente: "maria@example.com",
  state_us: "NY",
  consentimento_privacidade: true as const,
};

describe("pipeline-confiavel/contrato-solicitar", () => {
  it("processa FCRA (alias legado) e produz narrativa estruturada", () => {
    const r = processarPayloadSolicitarPipeline({
      categoria: "negativacao_indevida",
      ...contato,
      empresa_reclamada: "Empresa X",
      data_negativacao: "2025-03-10",
      valor_negativado_centavos: "200.00",
      ja_tentou_resolver_diretamente: false,
      possui_comprovante_quitacao: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.categoria_id).toBe("fcra_credit_reporting");
      expect(r.descricao).toContain("Category:");
      expect(r.state_us).toBe("NY");
      expect(r.descricao).not.toMatch(/texto livre longo/i);
    }
  });

  it("processa fdcpa_debt_collection (categoria 2)", () => {
    const r = processarPayloadSolicitarPipeline({
      categoria: "cobranca_indevida",
      ...contato,
      empresa_reclamada: "Banco Y",
      data_cobranca: "2025-04-01",
      valor_cobrado_centavos: "99.90",
      tipo_cobranca: "cartao",
      pagou_valor_cobrado: true,
      ja_tentou_resolver_diretamente: true,
      canal_tentativa: "cfpb",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.categoria_id).toBe("fdcpa_debt_collection");
      expect(r.area).toContain("FDCPA");
      expect(r.estruturado.flags.pagou_valor_cobrado).toBe("yes");
    }
  });

  it("gera rascunho Rota A para cobrança sem individualização", () => {
    const r = gerarRascunhoVerificadoCategoria({
      id: "rel-cob-1",
      categoria: "fdcpa_debt_collection",
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
    expect(r.rascunho).toContain("CFPB v. Wells Fargo");
    expect(r.rascunho).toContain("1:24-cv-01234");
    expect(r.rascunho.toLowerCase()).not.toContain("your case");
    expect(r.entradaBanco.citacoes_conferidas).toBe(false);
  });
});

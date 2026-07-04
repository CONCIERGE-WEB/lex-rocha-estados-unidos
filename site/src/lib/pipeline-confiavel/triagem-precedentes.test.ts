import { describe, expect, it } from "vitest";

import {
  confirmarPrecedenteHumano,
  podeEntrarNoBancoComoPendente,
  tokensResultadoDoResumo,
  triarPrecedenteCandidato,
  type FetchTextoFn,
} from "@/lib/pipeline-confiavel/triagem-precedentes";
import { BLOCO_FONTES_CONFERENCIA_CURTO } from "@/lib/pipeline-confiavel/blocos-fontes-fixos";
import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import { interpolarRelatorioCobranca } from "@/lib/pipeline-confiavel/interpolacao";
import { lintarIndividualizacao } from "@/lib/pipeline-confiavel/lexico-rota-a";

function mockFetch(map: Record<string, { status: number; texto: string }>): FetchTextoFn {
  return async (url) => {
    const hit = map[url];
    if (!hit) throw new Error(`URL not mocked: ${url}`);
    return { status: hit.status, texto: hit.texto, urlFinal: url };
  };
}

describe("pipeline-confiavel/triagem-precedentes", () => {
  it("ALTA when primary source is full text and fields match", async () => {
    const link = "https://www.uscourts.gov/court-cases/1-24-cv-01234";
    const corpo = `
      UNITED STATES DISTRICT COURT FOR THE DISTRICT OF COLUMBIA
      Case 1:24-cv-01234
      Order dated 06/08/2025
      ${"opinion ".repeat(200)}
      Credit card billing error. No good-faith error shown.
      Restitution ordered. Emotional distress damages denied.
    `;
    const r = await triarPrecedenteCandidato(
      {
        tribunal: "District of Columbia",
        numero_processo: "1:24-cv-01234",
        resumo_alegado:
          "No good-faith billing error. Restitution ordered. Emotional distress denied.",
        link_fonte: link,
        data_julgamento: "2025-08-06",
      },
      mockFetch({ [link]: { status: 200, texto: corpo } })
    );
    expect(r.classificacao).toBe("ALTA");
    expect(r.roteamento).toBe("PENDENTE_CONFERENCIA_HUMANA");
    expect(r.campos_conferidos.numero_processo).toBe(true);
    expect(r.campos_conferidos.tribunal).toBe(true);
    expect(r.campos_conferidos.resultado).toBe(true);
    expect(podeEntrarNoBancoComoPendente(r)).toBe(true);
    expect(JSON.stringify(r)).not.toMatch(/CONFIRMADO/i);
  });

  it("BAIXA discards when docket number is missing from text", async () => {
    const link = "https://www.uscourts.gov/other-page";
    const r = await triarPrecedenteCandidato(
      {
        tribunal: "District of Columbia",
        numero_processo: "1:24-cv-01234",
        resumo_alegado: "Restitution ordered",
        link_fonte: link,
      },
      mockFetch({
        [link]: {
          status: 200,
          texto: "Generic page without docket number " + "x".repeat(900),
        },
      })
    );
    expect(r.classificacao).toBe("BAIXA");
    expect(r.roteamento).toBe("DESCARTADO");
    expect(podeEntrarNoBancoComoPendente(r)).toBe(false);
  });

  it("MEDIA when primary 403 and secondary has full syllabus", async () => {
    const primaria = "https://www.consumerfinance.gov/enforcement/actions/wells-fargo";
    const secundaria = "https://www.ftc.gov/legal-library/browse/cases-proceedings";
    const r = await triarPrecedenteCandidato(
      {
        tribunal: "CFPB",
        numero_processo: "CFPB v. Wells Fargo",
        resumo_alegado:
          "Restitution ordered for unfair billing when good-faith error is not shown.",
        link_fonte: primaria,
        links_secundarios: [secundaria],
      },
      mockFetch({
        [primaria]: { status: 403, texto: "Forbidden" },
        [secundaria]: {
          status: 200,
          texto:
            "CFPB v. Wells Fargo 2022 consent order " +
            "restitution ordered unfair billing good faith error " +
            "full syllabus ".repeat(100),
        },
      })
    );
    expect(r.classificacao).toBe("MEDIA");
    expect(r.roteamento).toBe("REVISAO_MANUAL_COMPLETA");
    expect(r.link_usado_na_verificacao).toBe(secundaria);
  });

  it("human confirms only with the same link used in triage", async () => {
    const triagem = await triarPrecedenteCandidato(
      {
        tribunal: "Southern District of New York",
        numero_processo: "1:24-cv-05678",
        resumo_alegado:
          "Good-faith billing error. Simple refund. Emotional distress denied.",
        link_fonte: "https://www.uscourts.gov/court-cases/1-24-cv-05678",
        data_julgamento: "2025-06-25",
      },
      mockFetch({
        "https://www.uscourts.gov/court-cases/1-24-cv-05678": {
          status: 200,
          texto:
            "United States District Court Southern District of New York 1:24-cv-05678 25/06/2025 good faith billing error simple refund emotional distress " +
            "opinion ".repeat(200),
        },
      })
    );
    expect(triagem.roteamento).toBe("PENDENTE_CONFERENCIA_HUMANA");

    expect(() =>
      confirmarPrecedenteHumano({
        resultadoTriagem: triagem,
        confirmadoPor: "Reviewer Test",
        linkAbertoPeloHumano: "https://other-link.example",
      })
    ).toThrow(/link_usado_na_verificacao/i);

    const conf = confirmarPrecedenteHumano({
      resultadoTriagem: triagem,
      confirmadoPor: "Reviewer Test",
      linkAbertoPeloHumano: triagem.link_usado_na_verificacao,
    });
    expect(conf.status_verificacao).toBe("CONFIRMADO");
    expect(conf.verificado_por).toBe("Reviewer Test");
  });

  it("does not confirm BAIXA", async () => {
    const triagem = await triarPrecedenteCandidato(
      {
        tribunal: "U.S. District Court (N.D. Cal.)",
        numero_processo: "3:24-cv-00000",
        resumo_alegado: "any",
        link_fonte: "https://www.ftc.gov/missing-page",
      },
      mockFetch({
        "https://www.ftc.gov/missing-page": { status: 404, texto: "not found" },
      })
    );
    expect(triagem.classificacao).toBe("BAIXA");
    expect(() =>
      confirmarPrecedenteHumano({
        resultadoTriagem: triagem,
        confirmadoPor: "X",
        linkAbertoPeloHumano: triagem.link_usado_na_verificacao,
      })
    ).toThrow(/BAIXA/i);
  });

  it("result tokens do not invent fields", () => {
    expect(tokensResultadoDoResumo("vague text only")).toEqual([]);
    expect(
      tokensResultadoDoResumo("Restitution ordered and emotional distress")
    ).toContain("emotional distress");
  });

  it("report includes fixed sources block (not AI-generated)", () => {
    const entrada = carregarBancoPrecedentes("cobranca_indevida");
    const texto = interpolarRelatorioCobranca({
      entradaBanco: entrada,
      ambiente: "teste",
      dados: {
        nome_cliente: "Jane Doe",
        empresa_reclamada: "Bank Y",
        data_cobranca: "2025-04-01",
        valor_cobrado_centavos: 1000,
        tipo_cobranca: "cartao",
        pagou_valor_cobrado: true,
        ja_tentou_resolver_diretamente: false,
      },
    });
    expect(texto).toContain(BLOCO_FONTES_CONFERENCIA_CURTO.slice(0, 40));
    expect(lintarIndividualizacao(texto).status).toBe("pass");
  });
});

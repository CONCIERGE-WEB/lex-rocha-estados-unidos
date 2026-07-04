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
    if (!hit) throw new Error(`URL não mockada: ${url}`);
    return { status: hit.status, texto: hit.texto, urlFinal: url };
  };
}

describe("pipeline-confiavel/triagem-precedentes", () => {
  it("ALTA quando fonte primária integral e campos batem", async () => {
    const link = "https://www.tjdft.jus.br/processo/0730531-13.2024.8.07.0003";
    const corpo = `
      TRIBUNAL DE JUSTIÇA DO DISTRITO FEDERAL E TERRITÓRIOS - TJDFT
      Processo 0730531-13.2024.8.07.0003
      Julgamento em 06/08/2025
      ${"ementa ".repeat(200)}
      Cartão de crédito consignado. Cobrança indevida sem engano justificável.
      Repetição em dobro determinada. Dano moral não configurado.
    `;
    const r = await triarPrecedenteCandidato(
      {
        tribunal: "TJDFT",
        numero_processo: "0730531-13.2024.8.07.0003",
        resumo_alegado:
          "Cobrança indevida sem engano justificável. Repetição em dobro. Dano moral não configurado.",
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

  it("BAIXA descarta quando processo não aparece no texto", async () => {
    const link = "https://www.tjdft.jus.br/outra-pagina";
    const r = await triarPrecedenteCandidato(
      {
        tribunal: "TJDFT",
        numero_processo: "0730531-13.2024.8.07.0003",
        resumo_alegado: "Repetição em dobro",
        link_fonte: link,
      },
      mockFetch({
        [link]: {
          status: 200,
          texto: "Página genérica sem o número do processo " + "x".repeat(900),
        },
      })
    );
    expect(r.classificacao).toBe("BAIXA");
    expect(r.roteamento).toBe("DESCARTADO");
    expect(podeEntrarNoBancoComoPendente(r)).toBe(false);
  });

  it("MEDIA quando primária 403 e secundária traz ementa", async () => {
    const primaria = "https://scon.stj.jus.br/SCON/sumstj/";
    const secundaria = "https://www.stj.jus.br/noticia-tema-929";
    const r = await triarPrecedenteCandidato(
      {
        tribunal: "STJ",
        numero_processo: "EAREsp 600.663/RS",
        resumo_alegado:
          "Repetição em dobro do art. 42 quando cobrança indevida, salvo engano justificável.",
        link_fonte: primaria,
        links_secundarios: [secundaria],
      },
      mockFetch({
        [primaria]: { status: 403, texto: "Forbidden" },
        [secundaria]: {
          status: 200,
          texto:
            "STJ Corte Especial EAREsp 600.663/RS Tema 929 " +
            "repeticao em dobro cobranca indevida engano justificavel " +
            "ementa completa ".repeat(100),
        },
      })

    );
    expect(r.classificacao).toBe("MEDIA");
    expect(r.roteamento).toBe("REVISAO_MANUAL_COMPLETA");
    expect(r.link_usado_na_verificacao).toBe(secundaria);
  });

  it("humano confirma só com o mesmo link da triagem", async () => {
    const triagem = await triarPrecedenteCandidato(
      {
        tribunal: "TJDFT",
        numero_processo: "0707004-14.2024.8.07.0009",
        resumo_alegado:
          "Engano justificavel. Restituicao simples. Dano moral afastado.",
        link_fonte: "https://www.tjdft.jus.br/proc/0707004",
        data_julgamento: "2025-06-25",
      },
      mockFetch({
        "https://www.tjdft.jus.br/proc/0707004": {
          status: 200,
          texto:
            "TJDFT 0707004-14.2024.8.07.0009 25/06/2025 engano justificavel restituicao simples dano moral " +
            "ementa ".repeat(200),
        },
      })
    );
    expect(triagem.roteamento).toBe("PENDENTE_CONFERENCIA_HUMANA");

    expect(() =>
      confirmarPrecedenteHumano({
        resultadoTriagem: triagem,
        confirmadoPor: "Revisor Teste",
        linkAbertoPeloHumano: "https://outro-link.example",
      })
    ).toThrow(/link_usado_na_verificacao/i);

    const conf = confirmarPrecedenteHumano({
      resultadoTriagem: triagem,
      confirmadoPor: "Revisor Teste",
      linkAbertoPeloHumano: triagem.link_usado_na_verificacao,
    });
    expect(conf.status_verificacao).toBe("CONFIRMADO");
    expect(conf.verificado_por).toBe("Revisor Teste");
  });

  it("não confirma BAIXA", async () => {
    const triagem = await triarPrecedenteCandidato(
      {
        tribunal: "TJSP",
        numero_processo: "0000000-00.0000.0.00.0000",
        resumo_alegado: "qualquer",
        link_fonte: "https://www.tjsp.jus.br/x",
      },
      mockFetch({
        "https://www.tjsp.jus.br/x": { status: 404, texto: "not found" },
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

  it("tokens de resultado não inventam campos", () => {
    expect(tokensResultadoDoResumo("só texto vago")).toEqual([]);
    expect(
      tokensResultadoDoResumo("Repetição em dobro e dano moral")
    ).toContain("dano moral");
  });

  it("relatório inclui bloco fixo de fontes (não gerado por IA)", () => {
    const entrada = carregarBancoPrecedentes("cobranca_indevida");
    const texto = interpolarRelatorioCobranca({
      entradaBanco: entrada,
      ambiente: "teste",
      dados: {
        nome_cliente: "Maria Silva",
        empresa_reclamada: "Banco Y",
        data_cobranca: "2025-04-01",
        valor_cobrado_centavos: 1000,
        tipo_cobranca: "cartao",
        pagou_valor_cobrado: true,
        ja_tentou_resolver_diretamente: false,
      },
    });
    expect(texto).toContain(BLOCO_FONTES_CONFERENCIA_CURTO.slice(0, 40));
    expect(texto).toContain("inteiro teor");
    expect(lintarIndividualizacao(texto).status).toBe("pass");
  });
});

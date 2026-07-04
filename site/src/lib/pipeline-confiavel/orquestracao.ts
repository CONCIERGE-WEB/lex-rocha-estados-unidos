import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import type { CategoriaComBancoMvp } from "@/lib/pipeline-confiavel/categorias";
import { montarItemFilaRevisao } from "@/lib/pipeline-confiavel/fila-revisao";
import {
  interpolarRelatorioCobranca,
  interpolarRelatorioNegativacao,
  type DadosCobrancaInterpolacao,
  type DadosNegativacaoInterpolacao,
} from "@/lib/pipeline-confiavel/interpolacao";
import {
  lintarIndividualizacao,
  type ResultadoLinterIndividualizacao,
} from "@/lib/pipeline-confiavel/lexico-rota-a";
import {
  verificarRascunhoContraBanco,
  type ResultadoVerificacaoDeterministica,
} from "@/lib/pipeline-confiavel/verificacao";

export type ResultadoPipelineRotaA = {
  rascunho: string;
  verificacao: ResultadoVerificacaoDeterministica;
  linter: ResultadoLinterIndividualizacao;
  itemFila: ReturnType<typeof montarItemFilaRevisao>;
  entradaBanco: ReturnType<typeof carregarBancoPrecedentes>;
};

function combinarVerificacoes(
  linter: ResultadoLinterIndividualizacao,
  citacao: ResultadoVerificacaoDeterministica
): ResultadoVerificacaoDeterministica {
  if (linter.status === "fail") {
    return {
      status: "fail",
      itens: linter.ocorrencias.map((o) => ({
        tipo: "tribunal" as const,
        valor: o.trecho,
        status: "falha" as const,
      })),
      motivosFalha: linter.ocorrencias.map(
        (o) => `Individualização indevida (Rota A): "${o.trecho}" [${o.id}]`
      ),
      verificadoEm: citacao.verificadoEm,
    };
  }
  return citacao;
}

export function gerarRascunhoVerificadoNegativacao(params: {
  id: string;
  dados: DadosNegativacaoInterpolacao & Record<string, unknown>;
}): ResultadoPipelineRotaA {
  return gerarRascunhoVerificadoCategoria({
    id: params.id,
    categoria: "negativacao_indevida",
    dados: params.dados,
  });
}

export function gerarRascunhoVerificadoCategoria(params: {
  id: string;
  categoria: CategoriaComBancoMvp;
  dados: Record<string, unknown>;
}): ResultadoPipelineRotaA {
  const entradaBanco = carregarBancoPrecedentes(params.categoria);

  let rascunho: string;
  if (params.categoria === "negativacao_indevida") {
    rascunho = interpolarRelatorioNegativacao({
      entradaBanco,
      dados: params.dados as unknown as DadosNegativacaoInterpolacao,
      ambiente: "teste",
    });
  } else {
    rascunho = interpolarRelatorioCobranca({
      entradaBanco,
      dados: params.dados as unknown as DadosCobrancaInterpolacao,
      ambiente: "teste",
    });
  }

  const linter = lintarIndividualizacao(rascunho);
  const citacao = verificarRascunhoContraBanco({ rascunho, entradaBanco });
  const verificacao = combinarVerificacoes(linter, citacao);

  const itemFila = montarItemFilaRevisao({
    id: params.id,
    categoria: params.categoria,
    verificacao,
    rascunho,
    camposCliente: params.dados,
  });

  return { rascunho, verificacao, linter, itemFila, entradaBanco };
}

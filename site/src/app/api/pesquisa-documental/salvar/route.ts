import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  assertCitacoesRelatorioValidas,
  montarPacotePesquisaDocumentalBasico,
  RetrievalError,
} from "@/lib/pesquisa-documental/retrieval";
import {
  garantirCodigoUnico,
  inferirFaixaPorValor,
  proximaPrevisao,
} from "@/lib/pedidos/fila-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { salvarRelatorioSchema } from "@/lib/validations/pesquisa-documental";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const dados = salvarRelatorioSchema.parse(body);

    const supabase = createAdminClient();

    const pacote = montarPacotePesquisaDocumentalBasico({
      precedentesTexto: dados.precedentes,
      fundamentosIds: dados.fundamentos,
    });

    const status = dados.status ?? "gerado";

    if (status === "gerado") {
      assertCitacoesRelatorioValidas({
        conteudoRelatorio: dados.conteudoGerado,
        urlsAutorizadas: pacote.urlsAutorizadas,
      });
    }

    const valorCobrado =
      dados.valorCobrado ??
      (pacote.plano.tipo === "cobranca" ? pacote.plano.valor : 0);

    const t = dados.triagem;
    const urgencia =
      t.classificacao_interna.grau_urgencia === "VERMELHO" ||
      t.classificacao_interna.grau_urgencia === "AMARELO";
    const faixaValorMap = {
      BAIXO_VALOR: { min: 1000, max: 5000 },
      MEDIO_VALOR: { min: 5001, max: 15000 },
      ALTO_VALOR: { min: 15001, max: 50000 },
      INDETERMINADO: { min: null, max: null },
    } as const;
    const faixa = faixaValorMap[t.analise_fatores.faixa_estimada_causa];
    const codigo =
      status === "gerado" ? await garantirCodigoUnico("relatorios_pesquisa") : null;
    const faixaRelatorio = inferirFaixaPorValor(valorCobrado);
    const previsao =
      status === "gerado" ? await proximaPrevisao(faixaRelatorio) : null;

    const { data: relatorio, error: errRelatorio } = await supabase
      .from("relatorios_pesquisa")
      .insert({
        referencia_interna: dados.referenciaInterna ?? null,
        nome_cliente: dados.referenciaInterna ?? null,
        area: dados.area,
        fatos: dados.fatos,
        precedentes: dados.precedentes,
        fundamentos: dados.fundamentos,
        valor_estimado: valorCobrado,
        valor_cobrado: status === "gerado" ? valorCobrado : null,
        observacoes: dados.observacoes ?? null,
        complexidade: t.analise_fatores.complexidade,
        valor_estimado_min: faixa.min,
        valor_estimado_max: faixa.max,
        urgente: urgencia,
        motivo_urgencia:
          t.classificacao_interna.grau_urgencia === "VERMELHO"
            ? "Prioridade vermelha na triagem interna"
            : t.classificacao_interna.grau_urgencia === "AMARELO"
              ? "Prioridade amarela na triagem interna"
              : null,
        via_sugerida: t.analise_fatores.via_sugerida_referencia_interna,
        prazo_prescricional_anos: t.analise_fatores.risco_prescricao_evidente ? 1 : null,
        conteudo_gerado: dados.conteudoGerado,
        modelo_ia: dados.modeloIa,
        status,
        codigo_acompanhamento: codigo,
        previsao_entrega: previsao?.toISOString() ?? null,
        fila_status: status === "gerado" ? "aguardando_pagamento" : "rascunho",
      })
      .select("id, numero_sequencial")
      .single();

    if (errRelatorio || !relatorio) {
      console.error("[pesquisa-documental/salvar]", errRelatorio);
      return NextResponse.json(
        {
          erro:
            "Não foi possível salvar no Supabase. Execute as migrations 003 e 004 no painel SQL.",
        },
        { status: 500 }
      );
    }

    await supabase.from("pagamentos_pesquisa").insert({
      relatorio_id: relatorio.id,
      valor: valorCobrado,
      forma_pagamento: dados.formaPagamento ?? "pendente",
      status: "pendente",
    });

    await supabase.from("log_ia").insert({
      relatorio_id: relatorio.id,
      api_usada: "claude",
      modelo: dados.modeloIa,
      tokens_entrada: dados.tokensEntrada ?? null,
      tokens_saida: dados.tokensSaida ?? null,
    });

    return NextResponse.json({
      id: relatorio.id,
      numeroSequencial: relatorio.numero_sequencial,
      valorSugerido: valorCobrado,
      codigoAcompanhamento: codigo,
      previsaoEntrega: previsao?.toISOString() ?? null,
      triagem: t,
    });
  } catch (error) {
    console.error("[pesquisa-documental/salvar]", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ erro: "Dados inválidos para salvamento." }, { status: 400 });
    }

    if (error instanceof RetrievalError) {
      return NextResponse.json({ erro: error.message, codigo: error.codigo }, { status: 400 });
    }

    return NextResponse.json({ erro: "Erro ao salvar relatório." }, { status: 500 });
  }
}

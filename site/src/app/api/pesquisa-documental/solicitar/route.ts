import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  alertarFundadorNovaSolicitacao,
  emailClienteSolicitacaoRecebida,
} from "@/lib/email/resend";
import { mensagemErroRegistro } from "@/lib/api/erro-registro";
import { processarPayloadSolicitarPipeline } from "@/lib/pipeline-confiavel/contrato-solicitar";
import { garantirCodigoUnico, snapshotFila } from "@/lib/pedidos/fila-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { solicitacaoPesquisaSchema } from "@/lib/validations/solicitacao";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const supabase = createAdminClient();

    const usaPipeline =
      typeof body === "object" &&
      body !== null &&
      "categoria" in body &&
      typeof (body as { categoria?: unknown }).categoria === "string";

    let nome: string;
    let email: string;
    let telefone: string | null;
    let area: string;
    let descricao: string;
    let categoriaPipeline: string | null = null;

    if (usaPipeline) {
      const r = processarPayloadSolicitarPipeline(body);
      if (!r.ok) {
        return NextResponse.json({ erro: r.erro }, { status: 400 });
      }
      nome = r.nome;
      email = r.email;
      telefone = r.telefone ?? null;
      area = r.area;
      descricao = r.descricao;
      categoriaPipeline = r.categoria_id;
    } else {
      const dados = solicitacaoPesquisaSchema.parse(body);
      nome = dados.nome;
      email = dados.email;
      telefone = dados.telefone ?? null;
      area = dados.area;
      descricao = dados.descricao;
    }

    const [{ posicaoFila, previsao }, codigo] = await Promise.all([
      snapshotFila("padrao"),
      garantirCodigoUnico("solicitacoes_pesquisa"),
    ]);

    const { data, error } = await supabase
      .from("solicitacoes_pesquisa")
      .insert({
        nome,
        email,
        telefone,
        area,
        descricao,
        status: "nova",
        fila_status: "recebido",
        codigo_acompanhamento: codigo,
        previsao_entrega: previsao.toISOString(),
        faixa_relatorio: "padrao",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[pesquisa-documental/solicitar]", error);
      return NextResponse.json(
        {
          erro: mensagemErroRegistro(
            "Falha ao registrar solicitação",
            error?.message,
            "Não foi possível registrar a solicitação. Verifique a conexão com o banco ou contate o suporte."
          ),
          codigoErro: process.env.NODE_ENV === "development" ? error?.code : undefined,
        },
        { status: 500 }
      );
    }

    void Promise.allSettled([
      alertarFundadorNovaSolicitacao({
        nome,
        email,
        area: categoriaPipeline
          ? `${area} [${categoriaPipeline}]`
          : area,
        codigo,
        previsao,
      }),
      emailClienteSolicitacaoRecebida({
        nome,
        email,
        codigo,
        previsao,
      }),
    ]);

    return NextResponse.json({
      id: data.id,
      ok: true,
      codigoAcompanhamento: codigo,
      previsaoEntrega: previsao.toISOString(),
      posicaoFila,
      categoriaPipeline,
    });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { erro: e.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }
    console.error("[pesquisa-documental/solicitar]", e);
    return NextResponse.json(
      { erro: "Erro interno ao processar solicitação." },
      { status: 500 }
    );
  }
}

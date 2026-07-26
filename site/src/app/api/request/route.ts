import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  alertarFundadorNovaSolicitacao,
  emailClienteSolicitacaoRecebida,
} from "@/lib/email/resend";
import { mensagemErroRegistro } from "@/lib/api/erro-registro";
import { notificarSlackNovaSolicitacao } from "@/lib/ops/slack-notificar";
import { processarPayloadRequestPipeline } from "@/lib/pipeline-confiavel/contrato-request";
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
    let stateUs: string | null = null;
    let plano: string | null = "padrao";

    if (usaPipeline) {
      const r = processarPayloadRequestPipeline(body);
      if (!r.ok) {
        return NextResponse.json({ erro: r.erro }, { status: 400 });
      }
      nome = r.nome;
      email = r.email;
      telefone = r.telefone ?? null;
      area = r.area;
      descricao = r.descricao;
      categoriaPipeline = r.categoria_id;
      stateUs = r.state_us;
      if (
        typeof body === "object" &&
        body !== null &&
        "faixa_relatorio" in body &&
        typeof (body as { faixa_relatorio?: unknown }).faixa_relatorio === "string"
      ) {
        plano = (body as { faixa_relatorio: string }).faixa_relatorio;
      }
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
        faixa_relatorio: plano ?? "padrao",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[api/request]", error);
      return NextResponse.json(
        {
          erro: mensagemErroRegistro(
            "Failed to register request",
            error?.message,
            "Could not register the request. Check the database connection or contact support."
          ),
          codigoErro:
            process.env.NODE_ENV === "development" ? error?.code : undefined,
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
      notificarSlackNovaSolicitacao({
        codigo,
        previsao,
        nome,
        categoria: categoriaPipeline,
        state: stateUs,
        plano,
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
        { erro: e.issues[0]?.message ?? "Invalid data." },
        { status: 400 }
      );
    }
    console.error("[api/request]", e);
    return NextResponse.json(
      { erro: "Internal error processing the request." },
      { status: 500 }
    );
  }
}

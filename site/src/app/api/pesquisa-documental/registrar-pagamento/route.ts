import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  alertarFundadorPagamentoConfirmado,
  emailClientePedidoNaFila,
} from "@/lib/email/resend";
import { entrarNaFilaAposPagamento } from "@/lib/pedidos/fila-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrarPagamentoSchema } from "@/lib/validations/pesquisa-documental";
import { avisarPagamentoCheckoutWhatsApp } from "@/lib/whatsapp/sender";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const dados = registrarPagamentoSchema.parse(body);

    const supabase = createAdminClient();

    await supabase
      .from("relatorios_pesquisa")
      .update({ valor_cobrado: dados.valorCobrado })
      .eq("id", dados.relatorioId);

    const { error } = await supabase
      .from("pagamentos_pesquisa")
      .update({
        valor: dados.valorCobrado,
        status: dados.statusPagamento,
        forma_pagamento: dados.formaPagamento,
      })
      .eq("relatorio_id", dados.relatorioId);

    if (error) {
      console.error("[pesquisa-documental/registrar-pagamento]", error);
      return NextResponse.json({ erro: "Não foi possível registrar o pagamento." }, { status: 500 });
    }

    if (dados.statusPagamento === "pago") {
      const fila = await entrarNaFilaAposPagamento({
        relatorioId: dados.relatorioId,
        valor: dados.valorCobrado,
      });

      void avisarPagamentoCheckoutWhatsApp({
        referencia: fila.referencia,
        valor: dados.valorCobrado,
        codigo: fila.codigo,
      });

      await alertarFundadorPagamentoConfirmado({
        referencia: fila.referencia,
        valor: dados.valorCobrado,
        codigo: fila.codigo,
      });

      if (fila.email) {
        await emailClientePedidoNaFila({
          email: fila.email,
          nome: fila.nome,
          codigo: fila.codigo,
          previsao: fila.previsao,
          referencia: fila.referencia,
        });
      }

      return NextResponse.json({
        ok: true,
        codigoAcompanhamento: fila.codigo,
        previsaoEntrega: fila.previsao.toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ erro: "Dados de pagamento inválidos." }, { status: 400 });
    }
    return NextResponse.json({ erro: "Erro ao registrar pagamento." }, { status: 500 });
  }
}

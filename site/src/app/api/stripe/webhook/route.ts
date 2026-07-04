import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  alertarFundadorPagamentoConfirmado,
  emailClientePedidoNaFila,
} from "@/lib/email/resend";
import { entrarNaFilaAposPagamento } from "@/lib/pedidos/fila-service";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  avisarPagamentoCheckoutWhatsApp,
  linkFallbackWhatsAppPagamento,
} from "@/lib/whatsapp/sender";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ erro: "Webhook não configurado." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ erro: "Assinatura ausente." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] assinatura inválida", error);
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const relatorioId = session.metadata?.relatorio_id;

    if (relatorioId && session.payment_status === "paid") {
      const supabase = createAdminClient();
      const valorPago =
        session.amount_total != null ? session.amount_total / 100 : 0;

      await supabase
        .from("relatorios_pesquisa")
        .update({ valor_cobrado: valorPago })
        .eq("id", relatorioId);

      await supabase
        .from("pagamentos_pesquisa")
        .update({
          status: "pago",
          forma_pagamento: "link",
          stripe_session_id: session.id,
          valor: valorPago,
        })
        .eq("relatorio_id", relatorioId);

      const fila = await entrarNaFilaAposPagamento({
        relatorioId,
        valor: valorPago,
        emailCliente: session.customer_email ?? session.customer_details?.email ?? undefined,
      });

      void avisarPagamentoCheckoutWhatsApp({
        referencia: fila.referencia,
        valor: valorPago,
        codigo: fila.codigo,
      });

      await Promise.all([
        alertarFundadorPagamentoConfirmado({
          referencia: fila.referencia,
          valor: valorPago,
          codigo: fila.codigo,
          clienteEmail: fila.email,
        }),
        fila.email
          ? emailClientePedidoNaFila({
              email: fila.email,
              nome: fila.nome,
              codigo: fila.codigo,
              previsao: fila.previsao,
              referencia: fila.referencia,
            })
          : Promise.resolve(false),
      ]);

      console.info(
        "[stripe/webhook] fallback whatsapp link",
        linkFallbackWhatsAppPagamento({
          referencia: fila.referencia,
          valor: valorPago,
          codigo: fila.codigo,
        })
      );
    }
  }

  return NextResponse.json({ received: true });
}

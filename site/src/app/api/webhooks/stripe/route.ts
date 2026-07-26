import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { emitirNfse, focusNfeConfigurado } from "@/lib/focus-nfe";
import { gerarRelatorioPedido } from "@/lib/relatorio/gerar-us";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/** Internal Brazilian NFS-e — never used for U.S. market checkout */
function nfseAutomaticaInterna(): boolean {
  return process.env.FOCUS_NFE_AUTO === "true";
}

function isUsMarket(meta: Record<string, string>, currency: string): boolean {
  return meta.mercado === "us" || currency === "usd";
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const stripeId = session.id;
  if (!stripeId) {
    return NextResponse.json({ error: "Session missing ID" }, { status: 400 });
  }

  const meta = session.metadata ?? {};
  const email =
    session.customer_details?.email ?? session.customer_email ?? meta.email ?? null;
  const valor = (session.amount_total ?? 0) / 100;
  const moeda = session.currency ?? "usd";
  const plano = meta.plano_nome ?? meta.plano_id ?? null;
  const nomeCliente = session.customer_details?.name || null;
  const zipCliente = meta.zip?.trim() || meta.nif?.trim() || null;
  const mercadoUs = isUsMarket(meta, moeda);
  const categoryLabel = meta.category_label?.trim() || meta.category_id?.trim() || null;

  const supabase = getSupabase();

  const { data: existente } = await supabase
    .from("pagamentos")
    .select("id")
    .eq("stripe_payment_id", stripeId)
    .maybeSingle();

  if (existente) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { data: pagamento, error: insertErr } = await supabase
    .from("pagamentos")
    .insert({
      stripe_payment_id: stripeId,
      nome_cliente: nomeCliente,
      email_cliente: email,
      cpf_cliente: null,
      nif_cliente: zipCliente,
      plano,
      valor,
      moeda,
      quer_nfse: false,
    })
    .select("id")
    .single();

  if (insertErr || !pagamento) {
    console.error("Supabase insert:", insertErr);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }

  const pedidoId = meta.pedido_id?.trim() || null;
  const trackingCode = meta.tracking_code?.trim() || null;
  let descricaoCaso: string | null = null;
  let codeForReport = trackingCode || null;
  if (pedidoId) {
    const { data: pedido } = await supabase
      .from("pedidos_pendentes")
      .select("descricao_caso, tracking_code")
      .eq("id", pedidoId)
      .maybeSingle();
    descricaoCaso = pedido?.descricao_caso ?? null;
    if (!codeForReport) codeForReport = pedido?.tracking_code ?? null;
  }

  const { data: relatorio, error: relErr } = await supabase
    .from("relatorios_pedido")
    .insert({
      pagamento_id: pagamento.id,
      pedido_id: pedidoId,
      stripe_payment_id: stripeId,
      nome_cliente: nomeCliente,
      email_cliente: email,
      plano,
      descricao_caso: categoryLabel
        ? `[Category: ${categoryLabel}]\n${descricaoCaso ?? ""}`.trim()
        : descricaoCaso,
      tracking_code: codeForReport,
      status: "a_gerar",
    })
    .select("id")
    .single();

  if (relErr || !relatorio) {
    console.error("relatorios_pedido insert:", relErr);
  } else {
    try {
      await gerarRelatorioPedido(relatorio.id);
    } catch (e) {
      console.error("Report generation:", e);
    }
  }

  // Skip Brazilian NFS-e for U.S. market; optional internal MEI flow only otherwise
  if (!mercadoUs && nfseAutomaticaInterna() && email && nomeCliente && focusNfeConfigurado()) {
    try {
      const nfse = await emitirNfse({
        nomeCompleto: nomeCliente,
        email,
        valorServicos: valor,
        referencia: stripeId,
        nifTomador: zipCliente,
      });

      await supabase
        .from("pagamentos")
        .update({
          nfse_emitida: Boolean(nfse.numero || nfse.focoId),
          nfse_numero: nfse.numero,
          nfse_pdf_url: nfse.pdfUrl,
          nfse_foco_id: nfse.focoId,
          nfse_erro: null,
        })
        .eq("id", pagamento.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal tax invoice error";
      console.error("Focus NFe (internal):", msg);
      await supabase
        .from("pagamentos")
        .update({ nfse_erro: msg })
        .eq("id", pagamento.id);
    }
  }

  return NextResponse.json({ received: true });
}

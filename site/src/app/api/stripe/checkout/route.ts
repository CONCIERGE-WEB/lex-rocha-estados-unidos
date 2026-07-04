import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { SITE } from "@/lib/constants/site";
import { getStripe, stripeConfigurado } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeCheckoutSchema } from "@/lib/validations/solicitacao";

export const runtime = "nodejs";

const WORKSPACE_COOKIE = "lex_workspace";

function autorizadoWorkspace(): boolean {
  const secret = process.env.WORKSPACE_SECRET;
  if (!secret) return true;
  const cookie = cookies().get(WORKSPACE_COOKIE)?.value;
  return cookie === secret;
}

export async function POST(request: Request) {
  if (!autorizadoWorkspace()) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  if (!stripeConfigurado()) {
    return NextResponse.json(
      { erro: "Stripe não configurado. Defina STRIPE_SECRET_KEY no ambiente." },
      { status: 503 }
    );
  }

  try {
    const body: unknown = await request.json();
    const dados = stripeCheckoutSchema.parse(body);
    const supabase = createAdminClient();

    const { data: relatorio, error: errRelatorio } = await supabase
      .from("relatorios_pesquisa")
      .select("id, numero_sequencial, referencia_interna")
      .eq("id", dados.relatorioId)
      .single();

    if (errRelatorio || !relatorio) {
      return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? SITE.url).replace(/\/$/, "");
    const stripe = getStripe();
    const valorCentavos = Math.round(dados.valorCobrado * 100);
    const referencia =
      relatorio.referencia_interna ?? `Relatório #${relatorio.numero_sequencial}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
      payment_method_types: ["card", "pix"],
      customer_email: dados.emailCliente,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: valorCentavos,
            product_data: {
              name: "Pesquisa de Jurisprudência — Lex Rocha",
              description: referencia,
            },
          },
        },
      ],
      metadata: {
        relatorio_id: dados.relatorioId,
        origem: "lex_rocha_workspace",
      },
      success_url: `${baseUrl}/pesquisa-documental?pagamento=sucesso&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pesquisa-documental?pagamento=cancelado`,
    });

    await supabase
      .from("pagamentos_pesquisa")
      .update({
        forma_pagamento: "link",
        stripe_session_id: session.id,
      })
      .eq("relatorio_id", dados.relatorioId);

    if (!session.url) {
      return NextResponse.json({ erro: "Stripe não retornou URL de checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[stripe/checkout]", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ erro: "Dados inválidos para checkout." }, { status: 400 });
    }

    return NextResponse.json({ erro: "Erro ao criar sessão de pagamento." }, { status: 500 });
  }
}

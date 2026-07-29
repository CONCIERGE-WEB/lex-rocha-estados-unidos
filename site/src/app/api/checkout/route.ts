import { NextResponse } from "next/server";

import { PLANOS } from "@/lib/constants/empresa";
import {
  checkoutLocalStoreEnabled,
  localInsertPedido,
} from "@/lib/checkout/local-store";
import {
  CATEGORIA_LABELS,
  normalizarCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import { getStripe, stripeConfigurado } from "@/lib/stripe";
import { appBaseUrl, tierDoPlano } from "@/lib/stripe/checkout-meta";
import { getSupabase } from "@/lib/supabase";
import { generateTrackingCode } from "@/lib/tracking-code";
import { apenasDigitosZip, zipValido } from "@/lib/zip";

export const runtime = "nodejs";

type Body = {
  planoId?: string;
  /** Alias API: basic | pro | enterprise mapped via planoId */
  tier?: string;
  zip?: string;
  aceiteContrato?: boolean;
  descricaoCaso?: string;
  areaCaso?: string;
  /** Canonical US category id (e.g. dot_flights_baggage) or short alias */
  categoryId?: string;
  category?: string;
  categoria?: string;
  userEmail?: string;
  email?: string;
  triagem?: {
    planoId?: string;
    confianca?: string;
    casoFavoravel?: boolean;
    justificativa?: string;
  };
};

function emailValido(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  try {
    if (!stripeConfigurado()) {
      return NextResponse.json(
        { error: "Stripe is not configured (STRIPE_SECRET_KEY)." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as Body;
    const planoId = body.planoId?.trim();
    const zip = body.zip ? apenasDigitosZip(body.zip) : "";

    const plano = PLANOS.find((p) => p.id === planoId);
    if (!plano) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const tier = tierDoPlano(plano.id);
    if (!tier) {
      return NextResponse.json({ error: "Invalid plan tier." }, { status: 400 });
    }

    if (!body.aceiteContrato) {
      return NextResponse.json(
        {
          error:
            "You must agree to begin your personalized report immediately after payment.",
        },
        { status: 400 }
      );
    }

    if (zip && !zipValido(zip)) {
      return NextResponse.json({ error: "Invalid ZIP code." }, { status: 400 });
    }

    const descricao = body.descricaoCaso?.trim() ?? "";
    if (descricao.length < 80) {
      return NextResponse.json(
        {
          error:
            "Describe your case with at least 80 characters so we can prepare your report.",
        },
        { status: 400 }
      );
    }
    if (descricao.length > 8000) {
      return NextResponse.json(
        { error: "Description too long (max 8000 characters)." },
        { status: 400 }
      );
    }

    const userEmailRaw =
      body.userEmail?.trim() || body.email?.trim() || "";
    const userEmail = userEmailRaw.toLowerCase();
    if (userEmail && !emailValido(userEmail)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const useLocal = checkoutLocalStoreEnabled();
    const tri = body.triagem;
    const trackingCode = generateTrackingCode();
    const categoryRaw =
      body.categoryId?.trim() ||
      body.category?.trim() ||
      body.categoria?.trim() ||
      body.areaCaso?.trim() ||
      "";
    const categoryId = normalizarCategoriaPipeline(categoryRaw);
    const categoryLabel = categoryId ? CATEGORIA_LABELS[categoryId] : null;
    const areaCaso = categoryLabel || body.areaCaso?.trim() || null;

    const pedidoRow = {
      plano_id: plano.id,
      plano_nome: plano.nome,
      nif: zip || null,
      descricao_caso: descricao,
      area_caso: areaCaso,
      plano_recomendado: tri?.planoId || plano.id,
      triagem_confianca: tri?.confianca || null,
      triagem_favoravel: tri?.casoFavoravel ?? null,
      triagem_justificativa: tri?.justificativa?.trim() || null,
      tracking_code: trackingCode,
    };

    let pedidoId: string;
    if (useLocal) {
      pedidoId = localInsertPedido(pedidoRow).id;
    } else {
      const supabase = getSupabase();
      const { data: pedido, error: pedidoErr } = await supabase
        .from("pedidos_pendentes")
        .insert(pedidoRow)
        .select("id")
        .single();

      if (pedidoErr || !pedido) {
        console.error("pedidos_pendentes:", pedidoErr);
        return NextResponse.json(
          { error: "Could not register your order." },
          { status: 500 }
        );
      }
      pedidoId = pedido.id;
    }

    const baseUrl = appBaseUrl();
    const stripe = getStripe();
    const cancelCategory = categoryId
      ? encodeURIComponent(categoryId)
      : "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(userEmail ? { customer_email: userEmail } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plano.preco * 100,
            product_data: {
              name: `${plano.nome} — Consumer rights research report`,
              description: categoryLabel
                ? `${plano.descricao} · Category: ${categoryLabel}`
                : plano.descricao,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: categoryId
        ? `${baseUrl}/request?category=${cancelCategory}`
        : `${baseUrl}/request`,
      metadata: {
        plano_id: plano.id,
        plano_nome: plano.nome,
        tier,
        zip: zip || "",
        pedido_id: pedidoId,
        tracking_code: trackingCode,
        aceite_contrato: "true",
        mercado: "us",
        ...(userEmail ? { user_email: userEmail, email: userEmail } : {}),
        ...(categoryId
          ? {
              category: categoryId,
              category_id: categoryId,
              category_label: categoryLabel ?? categoryId,
            }
          : {}),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create Stripe session." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      tier,
      category: categoryId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

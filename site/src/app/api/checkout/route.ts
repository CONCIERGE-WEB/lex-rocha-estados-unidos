import { NextResponse } from "next/server";

import { EMPRESA, PLANOS } from "@/lib/constants/empresa";
import {
  CATEGORIA_LABELS,
  normalizarCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import { generateTrackingCode } from "@/lib/tracking-code";
import { apenasDigitosZip, zipValido } from "@/lib/zip";

export const runtime = "nodejs";

type Body = {
  planoId?: string;
  zip?: string;
  aceiteContrato?: boolean;
  descricaoCaso?: string;
  areaCaso?: string;
  /** Canonical US category id (e.g. fcra_credit_reporting) or short alias */
  categoryId?: string;
  categoria?: string;
  triagem?: {
    planoId?: string;
    confianca?: string;
    casoFavoravel?: boolean;
    justificativa?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const planoId = body.planoId?.trim();
    const zip = body.zip ? apenasDigitosZip(body.zip) : "";

    const plano = PLANOS.find((p) => p.id === planoId);
    if (!plano) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    if (!body.aceiteContrato) {
      return NextResponse.json(
        { error: "You must agree to begin your personalized report immediately after payment." },
        { status: 400 }
      );
    }

    if (zip && !zipValido(zip)) {
      return NextResponse.json({ error: "Invalid ZIP code." }, { status: 400 });
    }

    const descricao = body.descricaoCaso?.trim() ?? "";
    if (descricao.length < 80) {
      return NextResponse.json(
        { error: "Describe your case with at least 80 characters so we can prepare your report." },
        { status: 400 }
      );
    }
    if (descricao.length > 8000) {
      return NextResponse.json({ error: "Description too long (max 8000 characters)." }, { status: 400 });
    }

    const supabase = getSupabase();
    const tri = body.triagem;
    const trackingCode = generateTrackingCode();
    const categoryRaw = body.categoryId?.trim() || body.categoria?.trim() || body.areaCaso?.trim() || "";
    const categoryId = normalizarCategoriaPipeline(categoryRaw);
    const categoryLabel = categoryId ? CATEGORIA_LABELS[categoryId] : null;
    const areaCaso =
      categoryLabel || body.areaCaso?.trim() || null;

    const { data: pedido, error: pedidoErr } = await supabase
      .from("pedidos_pendentes")
      .insert({
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
      })
      .select("id")
      .single();

    if (pedidoErr || !pedido) {
      console.error("pedidos_pendentes:", pedidoErr);
      return NextResponse.json({ error: "Could not register your order." }, { status: 500 });
    }

    const baseUrl = EMPRESA.url.replace(/\/$/, "");
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
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
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?plano=${encodeURIComponent(plano.id)}${
        categoryId ? `&categoria=${encodeURIComponent(categoryId)}` : ""
      }`,
      metadata: {
        plano_id: plano.id,
        plano_nome: plano.nome,
        zip: zip || "",
        pedido_id: pedido.id,
        tracking_code: trackingCode,
        aceite_contrato: "true",
        mercado: "us",
        ...(categoryId
          ? {
              category_id: categoryId,
              category_label: categoryLabel ?? categoryId,
            }
          : {}),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create Stripe session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

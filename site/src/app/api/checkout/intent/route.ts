import { NextResponse } from "next/server";

import { stripeLinkPlano } from "@/lib/constants/pagamentos";
import { PLANOS } from "@/lib/constants/empresa";
import { ipDoPedido } from "@/lib/ip-cliente";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const PLANOS_VALIDOS = new Set<string>(PLANOS.map((p) => p.id));

type Body = {
  plano?: string;
  termosAceites?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const plano = body.plano?.trim() ?? "";

    if (!PLANOS_VALIDOS.has(plano)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    if (!body.termosAceites) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy." },
        { status: 400 }
      );
    }

    const stripeUrl = stripeLinkPlano(plano);
    if (!stripeUrl) {
      return NextResponse.json(
        { error: "Payment link not configured for this plan." },
        { status: 500 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("checkout_intent").insert({
      plano,
      quer_nfse: false,
      email_nfse: null,
      termos_aceites: true,
      aceite_ip: ipDoPedido(request),
    });

    if (error) {
      console.error("checkout_intent:", error);
      return NextResponse.json({ error: "Could not record checkout intent." }, { status: 500 });
    }

    return NextResponse.json({ url: stripeUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

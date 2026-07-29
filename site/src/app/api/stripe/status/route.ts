import { NextResponse } from "next/server";

import { stripeConfigurado, stripeModo } from "@/lib/stripe";

export const runtime = "nodejs";

/** Health do módulo Stripe (local/test) — sem secrets. */
export async function GET() {
  const modo = stripeModo();
  return NextResponse.json({
    configured: stripeConfigurado(),
    mode: modo,
    webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || null,
    ok: modo === "test" || modo === "live",
  });
}

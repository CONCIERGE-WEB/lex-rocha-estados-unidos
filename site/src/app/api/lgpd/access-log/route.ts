import { NextResponse } from "next/server";

import { sha256Hex } from "@/lib/lgpd/hash";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function autorizado(request: Request): boolean {
  const chave =
    process.env.INTERNAL_LOG_SECRET ??
    process.env.WORKSPACE_SECRET ??
    "";
  if (!chave) return false;
  return request.headers.get("x-internal-log") === chave;
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      rota?: string;
      metodo?: string;
      statusCode?: number;
    };

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const supabase = createAdminClient();
    const { error } = await supabase.from("access_log").insert({
      ip_hash: await sha256Hex(ip),
      user_agent_hash: await sha256Hex(userAgent),
      rota: body.rota ?? null,
      metodo: body.metodo ?? null,
      status_code: body.statusCode ?? null,
    });

    if (error) {
      console.error("[lgpd/access-log]", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { VERSAO_POLITICA_PRIVACIDADE } from "@/lib/constants/lgpd";
import { sha256Hex } from "@/lib/lgpd/hash";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const consentSchema = z.object({
  sessionId: z.string().min(8),
  cookiesAnaliticos: z.boolean(),
  origem: z.enum(["banner", "configuracoes", "api"]).default("banner"),
  revogacao: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const dados = consentSchema.parse(body);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const ipHash = await sha256Hex(ip);
    const userAgentHash = await sha256Hex(userAgent);

    const supabase = createAdminClient();

    const { error } = await supabase.from("consent_log").insert({
      session_id: dados.sessionId,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      versao_politica: VERSAO_POLITICA_PRIVACIDADE,
      cookies_necessarios: true,
      cookies_analiticos: dados.revogacao ? false : dados.cookiesAnaliticos,
      data_revogacao: dados.revogacao ? new Date().toISOString() : null,
      origem: dados.origem,
    });

    if (error) {
      console.error("[lgpd/consent]", error);
      return NextResponse.json(
        { erro: "Não foi possível registrar o consentimento. Execute a migration 005." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Dados de consentimento inválidos." }, { status: 400 });
  }
}

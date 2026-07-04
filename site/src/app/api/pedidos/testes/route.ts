import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripeConfigurado } from "@/lib/stripe/client";
import { calcularPrevisaoEntrega } from "@/lib/pedidos/previsao-entrega";
import { contarFilaAtiva } from "@/lib/pedidos/fila-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { diagnosticoWhatsAppCheckout } from "@/lib/whatsapp/sender";

export const runtime = "nodejs";

const WORKSPACE_COOKIE = "lex_workspace";
const CHECK_TIMEOUT_MS = 8000;

async function comTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout em ${label}`)), CHECK_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function autorizado(): boolean {
  const secret = process.env.WORKSPACE_SECRET;
  if (!secret) return true;
  return cookies().get(WORKSPACE_COOKIE)?.value === secret;
}

/** Diagnóstico rápido de integrações (workspace). */
export async function GET() {
  if (!autorizado()) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; detalhe: string }> = {};

  checks.anthropic = {
    ok: Boolean(process.env.ANTHROPIC_API_KEY),
    detalhe: process.env.ANTHROPIC_API_KEY ? "Chave definida" : "ANTHROPIC_API_KEY ausente",
  };
  checks.groq = {
    ok: Boolean(process.env.GROQ_API_KEY),
    detalhe: process.env.GROQ_API_KEY ? "Chave definida" : "GROQ_API_KEY ausente",
  };
  checks.stripe = {
    ok: stripeConfigurado(),
    detalhe: stripeConfigurado()
      ? process.env.STRIPE_WEBHOOK_SECRET
        ? "Stripe + webhook secret OK"
        : "Stripe OK — STRIPE_WEBHOOK_SECRET ausente"
      : "STRIPE_SECRET_KEY ausente",
  };
  checks.resend = {
    ok: Boolean(process.env.RESEND_API_KEY),
    detalhe: process.env.RESEND_API_KEY
      ? "Resend configurado (e-mails ativos)"
      : "RESEND_API_KEY ausente — alertas só no painel",
  };
  checks.whatsappCheckout = diagnosticoWhatsAppCheckout();
  checks.supabase = {
    ok: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    detalhe: "Variáveis Supabase",
  };

  let filaAtiva = 0;
  let tabelasOk = true;

  try {
    const supabase = createAdminClient();
    filaAtiva = await comTimeout(contarFilaAtiva(), "contarFilaAtiva");

    const [{ error: errSol }, { error: errRel }] = await comTimeout(
      Promise.all([
        supabase.from("solicitacoes_pesquisa").select("id").limit(1),
        supabase.from("relatorios_pesquisa").select("codigo_acompanhamento").limit(1),
      ]),
      "validação de tabelas Supabase"
    );

    if (errSol || errRel) {
      tabelasOk = false;
      checks.migrations = {
        ok: false,
        detalhe: `Execute migrations 006 e 007. ${errRel?.message ?? errSol?.message}`,
      };
    } else {
      checks.migrations = { ok: true, detalhe: "Tabelas acessíveis" };
    }
  } catch (e) {
    tabelasOk = false;
    checks.migrations = {
      ok: false,
      detalhe: e instanceof Error ? e.message : "Erro Supabase",
    };
  }

  const previsaoExemplo = calcularPrevisaoEntrega({
    posicaoNaFila: filaAtiva + 1,
    faixa: "padrao",
  });

  const todosOk = Object.values(checks).every((c) => c.ok) && tabelasOk;

  return NextResponse.json({
    ok: todosOk,
    filaAtiva,
    previsaoProximoPedidoPadrao: previsaoExemplo.toISOString(),
    checks,
  });
}

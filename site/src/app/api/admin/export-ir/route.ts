import { gerarCsvIr, type LinhaIr } from "@/lib/admin/export-ir";
import { adminAutenticado } from "@/lib/security/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function json(corpo: unknown, status: number): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: Request) {
  if (!(await adminAutenticado(request))) {
    return json({ erro: "Não autorizado." }, 401);
  }

  const url = new URL(request.url);
  const ano = Number(url.searchParams.get("ano")) || new Date().getFullYear();
  const mesParam = url.searchParams.get("mes");
  const mes = mesParam ? Number(mesParam) : null;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return json({ erro: "Supabase não configurado." }, 500);
  }

  const inicio =
    mes != null ? new Date(Date.UTC(ano, mes - 1, 1)) : new Date(Date.UTC(ano, 0, 1));
  const fim =
    mes != null ? new Date(Date.UTC(ano, mes, 1)) : new Date(Date.UTC(ano + 1, 0, 1));

  const { data, error } = await supabase
    .from("pagamentos_pesquisa")
    .select("id, relatorio_id, valor, forma_pagamento, status, created_at")
    .gte("created_at", inicio.toISOString())
    .lt("created_at", fim.toISOString())
    .order("created_at", { ascending: true });

  if (error) return json({ erro: error.message }, 500);

  const pagamentos = data ?? [];

  const ids = Array.from(
    new Set(pagamentos.map((p) => p.relatorio_id).filter(Boolean))
  );
  const nfsePorRelatorio = new Map<string, string | null>();
  if (ids.length) {
    const { data: rels } = await supabase
      .from("relatorios_pesquisa")
      .select("id, nfse_numero")
      .in("id", ids);
    for (const r of rels ?? []) {
      nfsePorRelatorio.set(r.id, r.nfse_numero ?? null);
    }
  }

  const linhas: LinhaIr[] = pagamentos.map((p) => ({
    data: p.created_at,
    valor: Number(p.valor ?? 0),
    forma: p.forma_pagamento,
    status: p.status,
    relatorioId: p.relatorio_id,
    nfseNumero: nfsePorRelatorio.get(p.relatorio_id) ?? null,
  }));

  const csv = gerarCsvIr(linhas);
  const sufixo = mes != null ? `${ano}-${String(mes).padStart(2, "0")}` : `${ano}`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lex-rocha-ir-${sufixo}.csv"`,
    },
  });
}

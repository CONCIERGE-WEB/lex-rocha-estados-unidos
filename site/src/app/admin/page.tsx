import Link from "next/link";

import { formatarBRL } from "@/lib/admin/format";
import { infoFilaStatus } from "@/lib/admin/status";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Kpis = {
  totalRelatorios: number;
  porStatus: Record<string, number>;
  aguardando: number;
  emProducao: number;
  receitaMes: number;
  solicitacoesAbertas: number;
};

async function carregarKpis(): Promise<Kpis | null> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
  const inicioProx = new Date(agora.getFullYear(), agora.getMonth() + 1, 1).toISOString();

  const [relatorios, pagamentos, solicitacoes] = await Promise.all([
    supabase.from("relatorios_pesquisa").select("fila_status"),
    supabase
      .from("pagamentos_pesquisa")
      .select("valor, status, created_at")
      .eq("status", "pago")
      .gte("created_at", inicioMes)
      .lt("created_at", inicioProx),
    supabase
      .from("solicitacoes_pesquisa")
      .select("id", { count: "exact", head: true })
      .not("status", "in", '("concluida","cancelada","arquivada")'),
  ]);

  const porStatus: Record<string, number> = {};
  for (const r of relatorios.data ?? []) {
    porStatus[r.fila_status] = (porStatus[r.fila_status] ?? 0) + 1;
  }

  const receitaMes = (pagamentos.data ?? []).reduce(
    (soma, p) => soma + Number(p.valor ?? 0),
    0
  );

  return {
    totalRelatorios: relatorios.data?.length ?? 0,
    porStatus,
    aguardando: porStatus["aguardando_pagamento"] ?? 0,
    emProducao: porStatus["em_producao"] ?? 0,
    receitaMes,
    solicitacoesAbertas: solicitacoes.count ?? 0,
  };
}

function CardKpi({ titulo, valor, href }: { titulo: string; valor: string; href?: string }) {
  const conteudo = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{valor}</p>
    </div>
  );
  return href ? <Link href={href}>{conteudo}</Link> : conteudo;
}

export default async function AdminHome() {
  const kpis = await carregarKpis();

  if (!kpis) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-xl font-semibold text-slate-900">Painel administrativo</h1>
        <p className="mt-2 text-sm text-red-700">
          Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Painel administrativo</h1>
      <p className="mt-1 text-sm text-slate-500">Visão geral da operação.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardKpi
          titulo="Receita do mês"
          valor={formatarBRL(kpis.receitaMes)}
          href="/admin/financeiro"
        />
        <CardKpi
          titulo="Aguardando pagamento"
          valor={String(kpis.aguardando)}
          href="/admin/relatorios?fila_status=aguardando_pagamento"
        />
        <CardKpi
          titulo="Em produção"
          valor={String(kpis.emProducao)}
          href="/admin/relatorios?fila_status=em_producao"
        />
        <CardKpi
          titulo="Solicitações abertas"
          valor={String(kpis.solicitacoesAbertas)}
          href="/admin/solicitacoes"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800">
          Relatórios por status ({kpis.totalRelatorios} no total)
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(kpis.porStatus)
            .sort((a, b) => b[1] - a[1])
            .map(([status, qtd]) => {
              const info = infoFilaStatus(status);
              return (
                <Link
                  key={status}
                  href={`/admin/relatorios?fila_status=${status}`}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${info.cls}`}
                >
                  {info.label}
                  <span className="rounded-full bg-white/60 px-1.5 text-xs">{qtd}</span>
                </Link>
              );
            })}
          {kpis.totalRelatorios === 0 ? (
            <p className="text-sm text-slate-500">Nenhum relatório ainda.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

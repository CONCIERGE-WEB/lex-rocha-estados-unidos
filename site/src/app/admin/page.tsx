import Link from "next/link";

import { carregarMatrizCorpusAdmin } from "@/lib/admin/corpus-matriz-admin";
import {
  calcularMetricasFinanceirasUs,
  rotulosPlanosUsd,
} from "@/lib/admin/metricas-us";
import {
  adminUsarMockLocal,
  mockKpisOperacao,
  mockPagamentosMes,
} from "@/lib/admin/mock-local";
import { formatarUSD } from "@/lib/admin/format";
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
  fonte: "supabase" | "mock_local";
  pagamentosMes: { valor: number; status: string; plano?: string | null }[];
};

async function carregarKpis(): Promise<Kpis> {
  if (adminUsarMockLocal()) {
    const mock = mockKpisOperacao();
    return {
      ...mock,
      pagamentosMes: mockPagamentosMes(),
    };
  }

  try {
    const supabase = createAdminClient();
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
    const inicioProx = new Date(agora.getFullYear(), agora.getMonth() + 1, 1).toISOString();

    const [relatorios, pagamentos, solicitacoes] = await Promise.all([
      supabase.from("relatorios_pesquisa").select("fila_status"),
      supabase
        .from("pagamentos_pesquisa")
        .select("valor, status, created_at")
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

    const rows = (pagamentos.data ?? []).map((p) => ({
      valor: Number(p.valor ?? 0),
      status: String(p.status ?? ""),
    }));

    const receitaMes = rows
      .filter((p) => p.status === "pago")
      .reduce((soma, p) => soma + p.valor, 0);

    return {
      totalRelatorios: relatorios.data?.length ?? 0,
      porStatus,
      aguardando: porStatus["aguardando_pagamento"] ?? 0,
      emProducao: porStatus["em_producao"] ?? 0,
      receitaMes,
      solicitacoesAbertas: solicitacoes.count ?? 0,
      fonte: "supabase",
      pagamentosMes: rows,
    };
  } catch {
    const mock = mockKpisOperacao();
    return { ...mock, pagamentosMes: mockPagamentosMes() };
  }
}

function CardKpi({
  titulo,
  valor,
  href,
  hint,
}: {
  titulo: string;
  valor: string;
  href?: string;
  hint?: string;
}) {
  const conteudo = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{valor}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{conteudo}</Link> : conteudo;
}

export default async function AdminHome() {
  const kpis = await carregarKpis();
  const metricas = calcularMetricasFinanceirasUs(kpis.pagamentosMes);
  const matriz = carregarMatrizCorpusAdmin();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        U.S. operations · {rotulosPlanosUsd()}
        {kpis.fonte === "mock_local" ? (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            local mock (no SignalHub / prod DB)
          </span>
        ) : null}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardKpi
          titulo="Month revenue (USD)"
          valor={formatarUSD(kpis.receitaMes)}
          href="/admin/financeiro"
        />
        <CardKpi
          titulo="MRR (run-rate)"
          valor={formatarUSD(metricas.mrr)}
          href="/admin/financeiro"
          hint="Paid revenue this calendar month"
        />
        <CardKpi
          titulo="Avg ticket"
          valor={formatarUSD(metricas.ticketMedio)}
          href="/admin/financeiro"
          hint="Base plans $49 / $79 / $119"
        />
        <CardKpi
          titulo="LTV (est.)"
          valor={formatarUSD(metricas.ltv)}
          href="/admin/financeiro"
          hint="Ticket × 1.15 repeat factor"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardKpi
          titulo="Awaiting payment"
          valor={String(kpis.aguardando)}
          href="/admin/relatorios?fila_status=aguardando_pagamento"
        />
        <CardKpi
          titulo="In production"
          valor={String(kpis.emProducao)}
          href="/admin/relatorios?fila_status=em_producao"
        />
        <CardKpi
          titulo="Open requests"
          valor={String(kpis.solicitacoesAbertas)}
          href="/admin/solicitacoes"
        />
        <CardKpi
          titulo="Corpus cells with items"
          valor={`${matriz.totais.comItens}/${matriz.totais.cells}`}
          href="/admin/corpus"
          hint="CourtListener · States matrix"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800">
          Reports by status ({kpis.totalRelatorios} total)
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
            <p className="text-sm text-slate-500">No reports yet.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            CourtListener corpus · States & jurisdictions
          </h2>
          <Link
            href="/admin/corpus"
            className="text-sm font-medium text-slate-900 underline underline-offset-4"
          >
            Open matrix
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {matriz.totais.cells} cells · awaiting {matriz.totais.aguardando} ·
          partial {matriz.totais.parcial} · ready {matriz.totais.pronto} · with
          items {matriz.totais.comItens}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Source: {matriz.fonte} · API token{" "}
          {matriz.courtListenerToken ? "configured" : "not set (local-safe)"}
        </p>
      </div>
    </main>
  );
}

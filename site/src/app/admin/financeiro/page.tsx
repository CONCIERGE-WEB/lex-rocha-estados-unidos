import Link from "next/link";

import {
  calcularMetricasFinanceirasUs,
  rotulosPlanosUsd,
} from "@/lib/admin/metricas-us";
import {
  adminUsarMockLocal,
  mockPagamentosMes,
  type MockPagamento,
} from "@/lib/admin/mock-local";
import { formatarUSD, formatarDataHora } from "@/lib/admin/format";
import { infoPagamentoStatus } from "@/lib/admin/status";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Pagamento = {
  id: string;
  relatorio_id: string;
  valor: number;
  forma_pagamento: string | null;
  status: string;
  created_at: string;
  plano?: string | null;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function carregar(
  ano: number,
  mes: number
): Promise<{
  pagamentos: Pagamento[];
  receita: number;
  pendente: number;
  fonte: "supabase" | "mock_local";
}> {
  if (adminUsarMockLocal()) {
    const pagamentos = mockPagamentosMes() as MockPagamento[];
    const receita = pagamentos
      .filter((p) => p.status === "pago")
      .reduce((s, p) => s + p.valor, 0);
    const pendente = pagamentos
      .filter((p) => p.status === "pendente")
      .reduce((s, p) => s + p.valor, 0);
    return { pagamentos, receita, pendente, fonte: "mock_local" };
  }

  try {
    const supabase = createAdminClient();
    const inicio = new Date(ano, mes - 1, 1).toISOString();
    const fim = new Date(ano, mes, 1).toISOString();

    const { data } = await supabase
      .from("pagamentos_pesquisa")
      .select("id, relatorio_id, valor, forma_pagamento, status, created_at")
      .gte("created_at", inicio)
      .lt("created_at", fim)
      .order("created_at", { ascending: false });

    const pagamentos = (data ?? []) as Pagamento[];
    const receita = pagamentos
      .filter((p) => p.status === "pago")
      .reduce((s, p) => s + Number(p.valor ?? 0), 0);
    const pendente = pagamentos
      .filter((p) => p.status === "pendente")
      .reduce((s, p) => s + Number(p.valor ?? 0), 0);

    return { pagamentos, receita, pendente, fonte: "supabase" };
  } catch {
    const pagamentos = mockPagamentosMes() as MockPagamento[];
    return {
      pagamentos,
      receita: pagamentos
        .filter((p) => p.status === "pago")
        .reduce((s, p) => s + p.valor, 0),
      pendente: pagamentos
        .filter((p) => p.status === "pendente")
        .reduce((s, p) => s + p.valor, 0),
      fonte: "mock_local",
    };
  }
}

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams?: Promise<{ ano?: string; mes?: string }> | { ano?: string; mes?: string };
}) {
  const sp = await Promise.resolve(searchParams);
  const agora = new Date();
  const ano = Number(sp?.ano) || agora.getFullYear();
  const mes = Number(sp?.mes) || agora.getMonth() + 1;

  const resultado = await carregar(ano, mes);
  const metricas = calcularMetricasFinanceirasUs(resultado.pagamentos);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Revenue (USD)</h1>
          <p className="mt-1 text-sm text-slate-500">
            {MONTHS[mes - 1]} {ano} · {rotulosPlanosUsd()}
            {resultado.fonte === "mock_local" ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                local mock
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/admin/export-ir?ano=${ano}&mes=${mes}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Export month (CSV)
          </a>
          <a
            href={`/api/admin/export-ir?ano=${ano}`}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Export year {ano} (CSV)
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {MONTHS.map((nome, i) => (
          <Link
            key={nome}
            href={`/admin/financeiro?ano=${ano}&mes=${i + 1}`}
            className={
              mes === i + 1
                ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            }
          >
            {nome.slice(0, 3)}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Revenue (paid)
          </p>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            {formatarUSD(resultado.receita)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {formatarUSD(resultado.pendente)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Transactions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {resultado.pagamentos.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            MRR (run-rate)
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatarUSD(metricas.mrr)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Avg ticket
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatarUSD(metricas.ticketMedio)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            LTV (est.)
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatarUSD(metricas.ltv)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Mix: E {metricas.mixPlanos.essencial} · S {metricas.mixPlanos.padrao} ·
            P {metricas.mixPlanos.completo}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Amount (USD)</th>
              <th className="px-4 py-3 font-semibold">Method</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Report</th>
            </tr>
          </thead>
          <tbody>
            {resultado.pagamentos.map((p) => {
              const ip = infoPagamentoStatus(p.status);
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatarDataHora(p.created_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{formatarUSD(p.valor)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.forma_pagamento ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ip.cls}`}
                    >
                      {ip.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.relatorio_id.startsWith("mock-") ? (
                      <span className="text-slate-400">mock</span>
                    ) : (
                      <Link
                        href={`/admin/relatorios/${p.relatorio_id}`}
                        className="font-medium text-slate-900 underline underline-offset-4"
                      >
                        Open
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {resultado.pagamentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No payments this month.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

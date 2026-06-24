"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminNav } from "@/components/admin-nav";
import type { PagamentoRow } from "@/lib/supabase";

type Totais = {
  registos: number;
  valor: number;
};

function apiError(data: { error?: string; erro?: string }): string {
  return data.error ?? data.erro ?? "Failed to load data.";
}

export default function AdminFinanceiroPage() {
  const agora = new Date();
  const [mes, setMes] = useState(String(agora.getMonth() + 1));
  const [ano, setAno] = useState(String(agora.getFullYear()));
  const [pagamentos, setPagamentos] = useState<PagamentoRow[]>([]);
  const [totais, setTotais] = useState<Totais | null>(null);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    setACarregar(true);
    setErro("");
    try {
      const params = new URLSearchParams({ mes, ano });
      const res = await fetch(`/api/admin/financeiro?${params}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string; erro?: string };
        setErro(apiError(data));
        return;
      }
      const data = (await res.json()) as { pagamentos: PagamentoRow[]; totais: Totais };
      setPagamentos(data.pagamentos);
      setTotais(data.totais);
    } catch {
      setErro("Network error.");
    } finally {
      setACarregar(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const exportarReceita = () => {
    window.location.href = `/api/admin/export-ir?ano=${encodeURIComponent(ano)}`;
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">Revenue</h1>
      <p className="mt-2 text-lg text-slate-600">Stripe payments (USD)</p>
      <AdminNav actual="financeiro" />

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="filtro-mes" className="block text-sm font-semibold text-ink">
            Month
          </label>
          <select
            id="filtro-mes"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="mt-1 rounded-lg border-2 border-slate-300 px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-ano" className="block text-sm font-semibold text-ink">
            Year
          </label>
          <input
            id="filtro-ano"
            type="number"
            min={2020}
            max={2100}
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="mt-1 w-28 rounded-lg border-2 border-slate-300 px-3 py-2"
          />
        </div>
        <button type="button" onClick={carregar} className="btn-secondary">
          Refresh
        </button>
        <button type="button" onClick={exportarReceita} className="btn-primary">
          Export revenue (CSV)
        </button>
      </div>

      {totais ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Total in period</p>
            <p className="mt-2 font-display text-3xl font-semibold text-action">
              ${totais.valor.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Payments</p>
            <p className="mt-2 text-3xl font-bold text-ink">{totais.registos}</p>
          </div>
        </div>
      ) : null}

      {erro ? <p className="mt-6 text-red-700">{erro}</p> : null}
      {aCarregar ? <p className="mt-6 text-slate-600">Loading…</p> : null}

      <div className="mt-8 overflow-x-auto rounded-xl border-2 border-slate-200">
        <table className="min-w-full text-left text-base">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">ZIP</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Stripe ID</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p) => (
              <tr key={p.id} className="border-t border-slate-200">
                <td className="whitespace-nowrap px-4 py-3">{p.created_at.slice(0, 10)}</td>
                <td className="px-4 py-3">{p.nome_cliente ?? "—"}</td>
                <td className="px-4 py-3">{p.email_cliente ?? "—"}</td>
                <td className="px-4 py-3">{p.nif_cliente ?? "—"}</td>
                <td className="px-4 py-3">{p.plano ?? "—"}</td>
                <td className="px-4 py-3">${Number(p.valor).toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-sm">{p.stripe_payment_id}</td>
              </tr>
            ))}
            {!aCarregar && pagamentos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No payments in this period.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

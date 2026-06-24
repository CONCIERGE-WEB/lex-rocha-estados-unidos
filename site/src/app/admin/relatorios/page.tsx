"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminNav } from "@/components/admin-nav";
import type { RelatorioPedidoRow, RelatorioStatus } from "@/lib/supabase";

const STATUS_LABEL: Record<RelatorioStatus, string> = {
  a_gerar: "⏳ Generating",
  revisao: "🟡 Pending review",
  aprovado: "🔵 In review",
  enviado: "✅ Sent",
  erro: "❌ Error",
};

const STATUS_COR: Record<RelatorioStatus, string> = {
  a_gerar: "bg-amber-50 text-amber-900",
  revisao: "bg-amber-100 text-amber-950",
  aprovado: "bg-blue-100 text-blue-900",
  enviado: "bg-emerald-100 text-emerald-900",
  erro: "bg-red-100 text-red-900",
};

function apiError(data: { error?: string; erro?: string }): string {
  return data.error ?? data.erro ?? "Failed to load.";
}

export default function AdminRelatoriosPage() {
  const [relatorios, setRelatorios] = useState<RelatorioPedidoRow[]>([]);
  const [filtro, setFiltro] = useState("");
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    setACarregar(true);
    setErro("");
    try {
      const params = filtro ? `?status=${encodeURIComponent(filtro)}` : "";
      const res = await fetch(`/api/admin/relatorios${params}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string; erro?: string };
        setErro(apiError(data));
        return;
      }
      const data = (await res.json()) as { relatorios: RelatorioPedidoRow[] };
      setRelatorios(data.relatorios);
    } catch {
      setErro("Network error.");
    } finally {
      setACarregar(false);
    }
  }, [filtro]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">Reports</h1>
      <p className="mt-2 text-lg text-slate-600">
        Generated automatically after payment — review and send to the client
      </p>
      <AdminNav actual="relatorios" />

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="filtro-status" className="block text-sm font-semibold text-ink">
            Status
          </label>
          <select
            id="filtro-status"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="mt-1 rounded-lg border-2 border-slate-300 px-3 py-2"
          >
            <option value="">All</option>
            <option value="revisao">Pending review</option>
            <option value="aprovado">In review</option>
            <option value="a_gerar">Generating</option>
            <option value="enviado">Sent</option>
            <option value="erro">Errors</option>
          </select>
        </div>
        <button type="button" onClick={carregar} className="btn-secondary">
          Refresh
        </button>
      </div>

      {erro ? <p className="mt-6 text-red-700">{erro}</p> : null}
      {aCarregar ? <p className="mt-6 text-slate-600">Loading…</p> : null}

      <div className="mt-8 overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
        <table className="min-w-full text-left text-base">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.map((r) => (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="whitespace-nowrap px-4 py-3">{r.created_at.slice(0, 10)}</td>
                <td className="px-4 py-3">{r.nome_cliente ?? "—"}</td>
                <td className="px-4 py-3 text-sm">{r.email_cliente ?? "—"}</td>
                <td className="px-4 py-3">{r.plano ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COR[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/relatorios/${r.id}`}
                    className="font-semibold text-trust underline underline-offset-4"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!aCarregar && relatorios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No reports match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

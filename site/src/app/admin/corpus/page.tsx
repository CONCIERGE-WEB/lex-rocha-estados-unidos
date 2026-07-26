import Link from "next/link";

import { carregarMatrizCorpusAdmin } from "@/lib/admin/corpus-matriz-admin";

export const dynamic = "force-dynamic";

function statusClass(status: string): string {
  switch (status) {
    case "pronto":
      return "bg-green-100 text-green-900";
    case "parcial":
      return "bg-amber-100 text-amber-950";
    case "aguardando_corpus":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-red-100 text-red-900";
  }
}

export default function AdminCorpusPage() {
  const matriz = carregarMatrizCorpusAdmin();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Corpus matrix (CourtListener)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {matriz.totais.cells} seed cells · States{" "}
            {matriz.states.join(", ")} · Jurisdictions / Federal courts — not
            DataJud UFs.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Cells</p>
          <p className="mt-1 text-xl font-semibold">{matriz.totais.cells}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Awaiting</p>
          <p className="mt-1 text-xl font-semibold">{matriz.totais.aguardando}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Partial</p>
          <p className="mt-1 text-xl font-semibold">{matriz.totais.parcial}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Ready</p>
          <p className="mt-1 text-xl font-semibold">{matriz.totais.pronto}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">With items</p>
          <p className="mt-1 text-xl font-semibold">{matriz.totais.comItens}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Source folder: <code>{matriz.fonte}</code> · CourtListener token{" "}
        {matriz.courtListenerToken
          ? "configured"
          : "not set (cells stay empty — no invented cases)"}
        . Sync: <code>npm run corpus:sync</code>
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">State</th>
              <th className="px-4 py-3 font-semibold">Jurisdiction</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Items</th>
            </tr>
          </thead>
          <tbody>
            {matriz.cells.map((c) => (
              <tr
                key={`${c.categoria}-${c.state}`}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3 text-slate-800">
                  <span className="font-medium">{c.categoriaLabel}</span>
                  <div className="text-xs text-slate-500">{c.categoria}</div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-700">{c.state}</td>
                <td className="px-4 py-3 text-slate-600">{c.jurisdictionLabel}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(c.status)}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-800">{c.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

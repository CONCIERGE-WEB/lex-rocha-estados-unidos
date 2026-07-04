import Link from "next/link";

import { formatarBRL, formatarData } from "@/lib/admin/format";
import { FILA_STATUS_OPCOES, infoFilaStatus } from "@/lib/admin/status";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Linha = {
  id: string;
  numero_sequencial: number;
  referencia_interna: string | null;
  nome_cliente: string | null;
  area: string;
  valor_cobrado: number | null;
  valor_estimado: number | null;
  fila_status: string;
  created_at: string;
};

async function carregar(filtro: string | null): Promise<Linha[] | null> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }

  let query = supabase
    .from("relatorios_pesquisa")
    .select(
      "id, numero_sequencial, referencia_interna, nome_cliente, area, valor_cobrado, valor_estimado, fila_status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filtro) query = query.eq("fila_status", filtro);

  const { data } = await query;
  return (data ?? []) as Linha[];
}

export default async function AdminRelatoriosPage({
  searchParams,
}: {
  searchParams?: { fila_status?: string };
}) {
  const filtro = searchParams?.fila_status ?? null;
  const linhas = await carregar(filtro);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Relatórios</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pesquisas documentais geradas — gestão de fila e entrega.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/relatorios"
          className={
            !filtro
              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          }
        >
          Todos
        </Link>
        {FILA_STATUS_OPCOES.map((s) => (
          <Link
            key={s}
            href={`/admin/relatorios?fila_status=${s}`}
            className={
              filtro === s
                ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            }
          >
            {infoFilaStatus(s).label}
          </Link>
        ))}
      </div>

      {linhas === null ? (
        <p className="mt-6 text-sm text-red-700">Supabase não configurado.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Ref.</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Área</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((r) => {
                const info = infoFilaStatus(r.fila_status);
                return (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatarData(r.created_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.referencia_interna ?? `#${r.numero_sequencial}`}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.nome_cliente ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.area}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatarBRL(r.valor_cobrado ?? r.valor_estimado)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${info.cls}`}
                      >
                        {info.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/relatorios/${r.id}`}
                        className="font-medium text-slate-900 underline underline-offset-4"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {linhas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Nenhum relatório neste filtro.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

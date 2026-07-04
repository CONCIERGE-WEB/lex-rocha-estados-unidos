import { formatarData } from "@/lib/admin/format";
import { infoFilaStatus } from "@/lib/admin/status";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Linha = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  area: string;
  descricao: string;
  status: string;
  fila_status: string;
  codigo_acompanhamento: string | null;
  created_at: string;
};

async function carregar(): Promise<Linha[] | null> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }
  const { data } = await supabase
    .from("solicitacoes_pesquisa")
    .select(
      "id, nome, email, telefone, area, descricao, status, fila_status, codigo_acompanhamento, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Linha[];
}

export default async function AdminSolicitacoesPage() {
  const linhas = await carregar();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Solicitações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pedidos recebidos pelo formulário público (leads).
      </p>

      {linhas === null ? (
        <p className="mt-6 text-sm text-red-700">Supabase não configurado.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Contato</th>
                <th className="px-4 py-3 font-semibold">Área</th>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((s) => {
                const info = infoFilaStatus(s.fila_status);
                return (
                  <tr key={s.id} className="border-t border-slate-100 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatarData(s.created_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {s.nome}
                      <p className="mt-1 max-w-md text-xs text-slate-500">{s.descricao}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{s.email}</p>
                      {s.telefone ? <p className="text-xs text-slate-400">{s.telefone}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.area}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.codigo_acompanhamento ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${info.cls}`}
                      >
                        {info.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {linhas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Nenhuma solicitação ainda.
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

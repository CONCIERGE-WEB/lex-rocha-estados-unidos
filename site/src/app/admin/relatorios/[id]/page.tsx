import Link from "next/link";
import { notFound } from "next/navigation";

import { RelatorioAcoes } from "@/components/admin/relatorio-acoes";
import { formatarBRL, formatarData, formatarDataHora } from "@/lib/admin/format";
import { infoFilaStatus, infoPagamentoStatus } from "@/lib/admin/status";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function Campo({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{valor || "—"}</p>
    </div>
  );
}

export default async function AdminRelatorioDetalhe({
  params,
}: {
  params: { id: string };
}) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-red-700">Supabase não configurado.</p>
      </main>
    );
  }

  const { data: rel } = await supabase
    .from("relatorios_pesquisa")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!rel) notFound();

  const [{ data: pagamentos }, solicitacao] = await Promise.all([
    supabase
      .from("pagamentos_pesquisa")
      .select("*")
      .eq("relatorio_id", rel.id)
      .order("created_at", { ascending: false }),
    rel.solicitacao_id
      ? supabase
          .from("solicitacoes_pesquisa")
          .select("email, nome, telefone")
          .eq("id", rel.solicitacao_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const emailSugerido = solicitacao.data?.email ?? null;
  const info = infoFilaStatus(rel.fila_status);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/admin/relatorios"
        className="text-sm text-slate-500 underline underline-offset-4"
      >
        ← Voltar
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">
          {rel.referencia_interna ?? `Relatório #${rel.numero_sequencial}`}
        </h1>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${info.cls}`}
        >
          {info.label}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Cliente" valor={rel.nome_cliente} />
              <Campo label="Área" valor={rel.area} />
              <Campo label="Criado em" valor={formatarData(rel.created_at)} />
              <Campo label="Código acompanhamento" valor={rel.codigo_acompanhamento} />
              <Campo
                label="Valor cobrado"
                valor={formatarBRL(rel.valor_cobrado ?? rel.valor_estimado)}
              />
              <Campo
                label="Previsão de entrega"
                valor={formatarData(rel.previsao_entrega)}
              />
              <Campo label="Complexidade" valor={rel.complexidade} />
              <Campo label="Urgente" valor={rel.urgente ? "Sim" : "Não"} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Fatos</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{rel.fatos}</p>
          </section>

          {rel.precedentes ? (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-800">Precedentes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {rel.precedentes}
              </p>
            </section>
          ) : null}

          {rel.conteudo_gerado ? (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-800">Conteúdo gerado</h2>
              <p className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700">
                {rel.conteudo_gerado}
              </p>
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Pagamentos</h2>
            <div className="mt-3 space-y-2">
              {(pagamentos ?? []).map((p) => {
                const ip = infoPagamentoStatus(p.status);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-700">{formatarBRL(p.valor)}</span>
                    <span className="text-slate-500">{p.forma_pagamento ?? "—"}</span>
                    <span className="text-slate-400">{formatarDataHora(p.created_at)}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${ip.cls}`}
                    >
                      {ip.label}
                    </span>
                  </div>
                );
              })}
              {(pagamentos ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum pagamento registrado.</p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <RelatorioAcoes
            relatorioId={rel.id}
            filaStatusInicial={rel.fila_status}
            valorCobradoInicial={rel.valor_cobrado ?? rel.valor_estimado}
            emailSugerido={emailSugerido}
          />
        </div>
      </div>
    </main>
  );
}

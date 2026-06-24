"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminNav } from "@/components/admin-nav";
import type { RelatorioPedidoRow } from "@/lib/supabase";

function apiError(data: { error?: string; erro?: string }, fallback: string): string {
  return data.error ?? data.erro ?? fallback;
}

export default function AdminRelatorioDetalhePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [relatorio, setRelatorio] = useState<RelatorioPedidoRow | null>(null);
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [aRegenerar, setARegenerar] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setACarregar(true);
    setErro("");
    try {
      const res = await fetch(`/api/admin/relatorios/${id}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string; erro?: string };
        setErro(apiError(data, "Failed to load."));
        return;
      }
      const data = (await res.json()) as { relatorio: RelatorioPedidoRow };
      setRelatorio(data.relatorio);
      setConteudo(data.relatorio.conteudo_editado ?? data.relatorio.conteudo_rascunho ?? "");
    } catch {
      setErro("Network error.");
    } finally {
      setACarregar(false);
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const guardar = async () => {
    setAGuardar(true);
    setErro("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/relatorios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudoEditado: conteudo }),
      });
      const data = (await res.json()) as { relatorio?: RelatorioPedidoRow; error?: string; erro?: string };
      if (!res.ok) {
        setErro(apiError(data, "Failed to save."));
        return;
      }
      if (data.relatorio) setRelatorio(data.relatorio);
      setMsg("Changes saved.");
    } catch {
      setErro("Network error.");
    } finally {
      setAGuardar(false);
    }
  };

  const enviar = async () => {
    if (!confirm("Send this report to the client by email?")) return;
    setAEnviar(true);
    setErro("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/relatorios/${id}/enviar`, { method: "POST" });
      const data = (await res.json()) as { relatorio?: RelatorioPedidoRow; error?: string; erro?: string };
      if (!res.ok) {
        setErro(apiError(data, "Failed to send."));
        return;
      }
      if (data.relatorio) setRelatorio(data.relatorio);
      setMsg("Report sent to the client by email.");
    } catch {
      setErro("Network error.");
    } finally {
      setAEnviar(false);
    }
  };

  const regenerar = async () => {
    if (!confirm("Regenerate the report with AI? Current text will be replaced.")) return;
    setARegenerar(true);
    setErro("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/relatorios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "regenerar" }),
      });
      const data = (await res.json()) as { relatorio?: RelatorioPedidoRow; error?: string; erro?: string };
      if (!res.ok) {
        setErro(apiError(data, "Failed to regenerate."));
        return;
      }
      if (data.relatorio) {
        setRelatorio(data.relatorio);
        setConteudo(
          data.relatorio.conteudo_editado ?? data.relatorio.conteudo_rascunho ?? ""
        );
      }
      setMsg("Report regenerated.");
    } catch {
      setErro("Network error.");
    } finally {
      setARegenerar(false);
    }
  };

  const enviado = relatorio?.status === "enviado";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/admin/relatorios" className="text-trust underline underline-offset-4">
        ← Back to list
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-ink">Report review</h1>
      <AdminNav actual="relatorios" />

      {aCarregar ? <p className="mt-6 text-slate-600">Loading…</p> : null}
      {erro ? <p className="mt-6 text-red-700">{erro}</p> : null}
      {msg ? <p className="mt-6 text-emerald-800">{msg}</p> : null}

      {relatorio ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
            <dl className="grid gap-3 text-base md:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Client</dt>
                <dd>{relatorio.nome_cliente ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Email</dt>
                <dd>{relatorio.email_cliente ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Plan</dt>
                <dd>{relatorio.plano ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Status</dt>
                <dd>{relatorio.status}</dd>
              </div>
            </dl>
            {relatorio.erro_geracao ? (
              <p className="mt-4 text-red-700">Generation error: {relatorio.erro_geracao}</p>
            ) : null}
            {relatorio.erro_envio ? (
              <p className="mt-4 text-red-700">Send error: {relatorio.erro_envio}</p>
            ) : null}
          </div>

          <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-ink">Case description (client)</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">{relatorio.descricao_caso}</p>
          </div>

          <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-ink">Report — edit before sending</h2>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              disabled={enviado}
              rows={24}
              className="mt-4 w-full rounded-lg border-2 border-slate-300 p-4 font-mono text-sm leading-relaxed disabled:bg-slate-100"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={guardar}
                disabled={enviado || aGuardar}
                className="btn-secondary disabled:opacity-60"
              >
                {aGuardar ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={regenerar}
                disabled={enviado || aRegenerar}
                className="btn-secondary disabled:opacity-60"
              >
                {aRegenerar ? "Regenerating…" : "Regenerate with AI"}
              </button>
              <button
                type="button"
                onClick={enviar}
                disabled={enviado || aEnviar || !conteudo.trim()}
                className="btn-primary disabled:opacity-60"
              >
                {aEnviar ? "Sending…" : enviado ? "Already sent" : "Approve and send to client"}
              </button>
            </div>
            {relatorio.enviado_em ? (
              <p className="mt-4 text-sm text-slate-500">
                Sent on {new Date(relatorio.enviado_em).toLocaleString("en-US")}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

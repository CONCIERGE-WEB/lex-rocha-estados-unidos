"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FILA_STATUS_OPCOES, infoFilaStatus } from "@/lib/admin/status";

type Props = {
  relatorioId: string;
  filaStatusInicial: string;
  valorCobradoInicial: number | null;
  emailSugerido: string | null;
};

export function RelatorioAcoes({
  relatorioId,
  filaStatusInicial,
  valorCobradoInicial,
  emailSugerido,
}: Props) {
  const router = useRouter();
  const [filaStatus, setFilaStatus] = useState(filaStatusInicial);
  const [valor, setValor] = useState(
    valorCobradoInicial != null ? String(valorCobradoInicial) : ""
  );
  const [email, setEmail] = useState(emailSugerido ?? "");
  const [carregando, setCarregando] = useState<"salvar" | "enviar" | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null
  );

  async function salvar() {
    setCarregando("salvar");
    setMensagem(null);
    try {
      const res = await fetch(`/api/admin/relatorios/${relatorioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fila_status: filaStatus,
          valor_cobrado: valor.trim() === "" ? null : Number(valor),
        }),
      });
      const data = (await res.json()) as { erro?: string };
      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: data.erro ?? "Falha ao salvar." });
        return;
      }
      setMensagem({ tipo: "ok", texto: "Alterações salvas." });
      router.refresh();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de rede." });
    } finally {
      setCarregando(null);
    }
  }

  async function enviar() {
    if (!email.trim()) {
      setMensagem({ tipo: "erro", texto: "Informe o e-mail do cliente." });
      return;
    }
    setCarregando("enviar");
    setMensagem(null);
    try {
      const res = await fetch(`/api/admin/relatorios/${relatorioId}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { erro?: string };
      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: data.erro ?? "Falha ao enviar." });
        return;
      }
      setMensagem({ tipo: "ok", texto: "E-mail enviado e pedido marcado como entregue." });
      router.refresh();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de rede." });
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-800">Ações</h2>

      <div className="space-y-1">
        <label htmlFor="fila-status" className="block text-xs font-medium text-slate-500">
          Status da fila
        </label>
        <select
          id="fila-status"
          value={filaStatus}
          onChange={(e) => setFilaStatus(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {FILA_STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>
              {infoFilaStatus(s).label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="valor" className="block text-xs font-medium text-slate-500">
          Valor cobrado (R$)
        </label>
        <input
          id="valor"
          type="number"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex.: 79"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={salvar}
        disabled={carregando !== null}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {carregando === "salvar" ? "Salvando…" : "Salvar alterações"}
      </button>

      <hr className="border-slate-200" />

      <div className="space-y-1">
        <label htmlFor="email-envio" className="block text-xs font-medium text-slate-500">
          E-mail do cliente (notificação de relatório pronto)
        </label>
        <input
          id="email-envio"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cliente@exemplo.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={enviar}
        disabled={carregando !== null}
        className="w-full rounded-lg border border-slate-900 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
      >
        {carregando === "enviar" ? "Enviando…" : "Notificar cliente e marcar entregue"}
      </button>

      {mensagem ? (
        <p
          className={
            mensagem.tipo === "ok"
              ? "text-sm font-medium text-green-700"
              : "text-sm font-medium text-red-700"
          }
        >
          {mensagem.texto}
        </p>
      ) : null}
    </div>
  );
}

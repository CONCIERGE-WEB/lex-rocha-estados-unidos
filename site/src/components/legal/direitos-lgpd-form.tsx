"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DPO } from "@/lib/constants/lgpd";

const tipos = [
  { value: "acesso", label: "Acesso aos dados" },
  { value: "correcao", label: "Correção" },
  { value: "eliminacao", label: "Eliminação" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "revogacao", label: "Revogação de consentimento" },
] as const;

export function DireitosLgpdForm() {
  const [tipo, setTipo] = useState<(typeof tipos)[number]["value"]>("acesso");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    setOk(false);

    try {
      const res = await fetch("/api/lgpd/direitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, email, descricao }),
      });
      const json = (await res.json()) as { erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Falha ao enviar.");
      setOk(true);
      setDescricao("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div id="direitos-lgpd" className="not-prose space-y-4 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Exercer seus direitos (LGPD)</h2>
      <p className="text-sm text-muted-foreground">
        Ou envie e-mail para{" "}
        <a href={`mailto:${DPO.email}?subject=Direitos%20LGPD`}>{DPO.email}</a>.
        Resposta em até {DPO.prazoRespostaDias} dias.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Tipo de solicitação</span>
          <select
            className="w-full rounded-md border border-input px-3 py-2"
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value as (typeof tipos)[number]["value"])
            }
          >
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Seu e-mail</span>
          <input
            type="email"
            required
            className="w-full rounded-md border border-input px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Descrição</span>
          <textarea
            required
            minLength={10}
            className="min-h-[80px] w-full rounded-md border border-input px-3 py-2"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar solicitação"}
        </Button>
      </form>
      {ok && <p className="text-sm text-green-800">Solicitação registrada com sucesso.</p>}
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAPACIDADE_OPERACIONAL } from "@/lib/pedidos/capacidade";
import { SITE } from "@/lib/constants/site";
import { mensagemNovaSolicitacao, montarLinkWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";

type Capacidade = {
  filaAtiva: number;
  maxRelatoriosPorDia: number;
  horasUteisPorDia: number;
  diasParaEsvaziarFila: number;
  filaAlta: boolean;
  mensagemCapacidade: string;
};

type ItemSolicitacao = {
  id: string;
  nome: string;
  email: string;
  area: string;
  fila_status: string;
  codigo_acompanhamento: string | null;
  previsao_entrega: string | null;
};

type ItemRelatorio = {
  id: string;
  referencia_interna: string | null;
  numero_sequencial: number;
  area: string;
  fila_status: string;
  codigo_acompanhamento: string | null;
  previsao_entrega: string | null;
  valor_cobrado: number | null;
};

const STATUS_OPCOES = [
  { value: "recebido", label: "Recebido" },
  { value: "orcamento", label: "Orçamento" },
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "na_fila", label: "Na fila" },
  { value: "em_producao", label: "Em produção" },
  { value: "pronto", label: "Pronto" },
  { value: "entregue", label: "Entregue" },
];

export function FilaPedidosWorkspace() {
  const [capacidade, setCapacidade] = useState<Capacidade | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<ItemSolicitacao[]>([]);
  const [relatorios, setRelatorios] = useState<ItemRelatorio[]>([]);
  const [testes, setTestes] = useState<Record<string, { ok: boolean; detalhe: string }> | null>(
    null
  );
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setErro(null);
    setCarregando(true);
    try {
      const [filaRes, testesRes] = await Promise.all([
        fetch("/api/pedidos/fila"),
        fetch("/api/pedidos/testes"),
      ]);
      const filaJson = (await filaRes.json()) as {
        capacidade?: Capacidade;
        solicitacoes?: ItemSolicitacao[];
        relatorios?: ItemRelatorio[];
        erro?: string;
      };
      if (!filaRes.ok) throw new Error(filaJson.erro ?? "Falha ao carregar fila.");

      setCapacidade(filaJson.capacidade ?? null);
      setSolicitacoes(filaJson.solicitacoes ?? []);
      setRelatorios(filaJson.relatorios ?? []);

      if (testesRes.ok) {
        const t = (await testesRes.json()) as { checks?: Record<string, { ok: boolean; detalhe: string }> };
        setTestes(t.checks ?? null);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function atualizarStatus(
    tipo: "solicitacao" | "relatorio",
    id: string,
    filaStatus: string
  ) {
    const res = await fetch("/api/pedidos/fila", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, id, filaStatus }),
    });
    if (!res.ok) {
      const json = (await res.json()) as { erro?: string };
      setErro(json.erro ?? "Falha ao atualizar.");
      return;
    }
    await carregar();
  }

  function formatarPrevisao(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-4 md:px-8">
        <Link href="/pesquisa-documental" className="text-sm text-primary hover:underline">
          ← Workspace
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold">Fila de pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Capacidade de referência: até {CAPACIDADE_OPERACIONAL.maxRelatoriosPorDia} relatórios/dia
          ({CAPACIDADE_OPERACIONAL.horasUteisPorDia}h úteis).
        </p>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {capacidade && (
          <Card className={capacidade.filaAlta ? "border-amber-400 bg-amber-50/50" : ""}>
            <CardContent className="pt-6 text-sm">
              <p className="font-medium">{capacidade.mensagemCapacidade}</p>
              <p className="mt-1 text-muted-foreground">
                Fila ativa: {capacidade.filaAtiva} · Esvaziar em ~{capacidade.diasParaEsvaziarFila}{" "}
                dia(s) úteis
              </p>
            </CardContent>
          </Card>
        )}

        {testes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diagnóstico de integrações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              {Object.entries(testes).map(([chave, val]) => (
                <p key={chave} className={val.ok ? "text-green-800" : "text-destructive"}>
                  {val.ok ? "✓" : "✗"} {chave}: {val.detalhe}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {erro && (
          <Card className="border-destructive/40">
            <CardContent className="pt-6 text-sm text-destructive">{erro}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Solicitações públicas</CardTitle>
            <Button variant="outline" size="sm" onClick={() => carregar()} disabled={carregando}>
              Atualizar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {solicitacoes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma solicitação na fila.</p>
            )}
            {solicitacoes.map((s) => (
              <div key={s.id} className="rounded-lg border p-4 text-sm">
                <p className="font-medium">{s.nome}</p>
                <p className="text-muted-foreground">{s.email} · {s.area}</p>
                <p>Previsão: {formatarPrevisao(s.previsao_entrega)}</p>
                <div className="flex flex-wrap gap-3">
                  {s.codigo_acompanhamento && (
                    <Link
                      href={`/acompanhar/${s.codigo_acompanhamento}`}
                      className="text-primary underline"
                      target="_blank"
                    >
                      Ver web — {s.codigo_acompanhamento}
                    </Link>
                  )}
                  {whatsappConfigurado() && (
                    <a
                      href={montarLinkWhatsApp(
                        mensagemNovaSolicitacao({
                          nome: s.nome,
                          email: s.email,
                          area: s.area,
                          codigo: s.codigo_acompanhamento ?? "—",
                        })
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] underline"
                    >
                      WhatsApp cliente
                    </a>
                  )}
                </div>
                <select
                  className="mt-2 w-full rounded border px-2 py-1"
                  value={s.fila_status}
                  onChange={(e) => atualizarStatus("solicitacao", s.id, e.target.value)}
                >
                  {STATUS_OPCOES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatórios em produção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {relatorios.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum relatório na fila.</p>
            )}
            {relatorios.map((r) => (
              <div key={r.id} className="rounded-lg border p-4 text-sm">
                <p className="font-medium">
                  {r.referencia_interna ?? `#${r.numero_sequencial}`} · {r.area}
                </p>
                <p>
                  R$ {r.valor_cobrado ?? "—"} · Previsão: {formatarPrevisao(r.previsao_entrega)}
                </p>
                {r.codigo_acompanhamento && (
                  <Link
                    href={`/acompanhar/${r.codigo_acompanhamento}`}
                    className="text-primary underline"
                    target="_blank"
                  >
                    Ver web — {r.codigo_acompanhamento}
                  </Link>
                )}
                <select
                  className="mt-2 w-full rounded border px-2 py-1"
                  value={r.fila_status}
                  onChange={(e) => atualizarStatus("relatorio", r.id, e.target.value)}
                >
                  {STATUS_OPCOES.filter((o) =>
                    ["aguardando_pagamento", "na_fila", "em_producao", "pronto", "entregue"].includes(
                      o.value
                    )
                  ).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Alertas de pagamento vão para {SITE.email} quando Resend estiver configurado.
        </p>
      </main>
    </div>
  );
}

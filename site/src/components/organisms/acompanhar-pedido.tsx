"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusPedido = {
  codigo: string;
  tipo: string;
  nome?: string;
  referencia?: string;
  area?: string;
  status: string;
  statusLabel: string;
  previsaoFormatada: string | null;
};

export function AcompanharPedido({ codigoInicial = "" }: { codigoInicial?: string }) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedido, setPedido] = useState<StatusPedido | null>(null);

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    setErro(null);
    setPedido(null);
    setCarregando(true);

    try {
      const res = await fetch(
        `/api/pedidos/acompanhar?codigo=${encodeURIComponent(codigo.trim())}`,
        { signal: AbortSignal.timeout(15_000) }
      );
      const json = (await res.json()) as StatusPedido & { erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Pedido não encontrado.");
      setPedido(json);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao consultar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consultar pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={buscar} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 uppercase tracking-widest"
              placeholder="Código (ex.: AB12CD34)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              maxLength={12}
            />
            <Button type="submit" disabled={carregando || codigo.trim().length < 6}>
              {carregando ? "Buscando…" : "Ver status"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {erro && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">{erro}</CardContent>
        </Card>
      )}

      {pedido && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">{pedido.statusLabel}</CardTitle>
            <p className="text-sm text-muted-foreground">Código: {pedido.codigo}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {pedido.nome && <p>Nome: {pedido.nome}</p>}
            {pedido.referencia && <p>Referência: {pedido.referencia}</p>}
            {pedido.area && <p>Área: {pedido.area}</p>}
            {pedido.previsaoFormatada && (
              <p className="font-medium text-primary">
                Previsão: {pedido.previsaoFormatada}
              </p>
            )}
            <p className="pt-2 text-xs text-muted-foreground">
              A previsão é estimada com base na fila atual e pode ser ajustada após o
              orçamento. Você receberá e-mail quando houver atualização.
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/solicitar" className="text-primary underline">
          Fazer nova solicitação
        </Link>
      </p>
    </div>
  );
}

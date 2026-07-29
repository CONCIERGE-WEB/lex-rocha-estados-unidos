/**
 * File-backed checkout store for local Stripe test (no remote Supabase).
 * Enabled only when CHECKOUT_LOCAL_STORE=true or ADMIN_LOCAL_MOCK=true.
 * Never invents court cases — only stores order / payment / report queue rows.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export type LocalPedido = {
  id: string;
  plano_id: string;
  plano_nome: string;
  nif: string | null;
  descricao_caso: string;
  area_caso: string | null;
  plano_recomendado: string | null;
  triagem_confianca: string | null;
  triagem_favoravel: boolean | null;
  triagem_justificativa: string | null;
  tracking_code: string;
  created_at: string;
};

export type LocalPagamento = {
  id: string;
  stripe_payment_id: string;
  nome_cliente: string | null;
  email_cliente: string | null;
  nif_cliente: string | null;
  plano: string | null;
  valor: number;
  moeda: string;
  created_at: string;
};

export type LocalRelatorio = {
  id: string;
  pagamento_id: string;
  pedido_id: string | null;
  stripe_payment_id: string;
  nome_cliente: string | null;
  email_cliente: string | null;
  plano: string | null;
  descricao_caso: string | null;
  tracking_code: string | null;
  status: "a_gerar" | "revisao" | "aprovado" | "enviado" | "erro";
  created_at: string;
};

type Store = {
  pedidos: LocalPedido[];
  pagamentos: LocalPagamento[];
  relatorios: LocalRelatorio[];
};

function rootDir(): string {
  return join(process.cwd(), "data", "local-checkout");
}

function storePath(): string {
  return join(rootDir(), "store.json");
}

export function checkoutLocalStoreEnabled(): boolean {
  return (
    process.env.CHECKOUT_LOCAL_STORE === "true" ||
    process.env.ADMIN_LOCAL_MOCK === "true"
  );
}

function emptyStore(): Store {
  return { pedidos: [], pagamentos: [], relatorios: [] };
}

function readStore(): Store {
  const path = storePath();
  if (!existsSync(path)) return emptyStore();
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as Store;
    return {
      pedidos: Array.isArray(raw.pedidos) ? raw.pedidos : [],
      pagamentos: Array.isArray(raw.pagamentos) ? raw.pagamentos : [],
      relatorios: Array.isArray(raw.relatorios) ? raw.relatorios : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store): void {
  const dir = rootDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath(), JSON.stringify(store, null, 2), "utf8");
}

export function localInsertPedido(
  row: Omit<LocalPedido, "id" | "created_at">
): LocalPedido {
  const store = readStore();
  const pedido: LocalPedido = {
    ...row,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.pedidos.push(pedido);
  writeStore(store);
  return pedido;
}

export function localGetPedido(id: string): LocalPedido | null {
  return readStore().pedidos.find((p) => p.id === id) ?? null;
}

export function localFindPagamentoByStripeId(
  stripeId: string
): LocalPagamento | null {
  return (
    readStore().pagamentos.find((p) => p.stripe_payment_id === stripeId) ?? null
  );
}

export function localInsertPagamento(
  row: Omit<LocalPagamento, "id" | "created_at">
): LocalPagamento {
  const store = readStore();
  const pagamento: LocalPagamento = {
    ...row,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.pagamentos.push(pagamento);
  writeStore(store);
  return pagamento;
}

export function localInsertRelatorio(
  row: Omit<LocalRelatorio, "id" | "created_at">
): LocalRelatorio {
  const store = readStore();
  const relatorio: LocalRelatorio = {
    ...row,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.relatorios.push(relatorio);
  writeStore(store);
  return relatorio;
}

export function localListRelatorios(): LocalRelatorio[] {
  return readStore().relatorios;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type RelatorioStatus = "a_gerar" | "revisao" | "aprovado" | "enviado" | "erro";

export type RelatorioPedidoRow = {
  id: string;
  created_at: string;
  updated_at: string;
  pagamento_id: string | null;
  pedido_id: string | null;
  stripe_payment_id: string | null;
  nome_cliente: string | null;
  email_cliente: string | null;
  plano: string | null;
  descricao_caso: string | null;
  conteudo_rascunho: string | null;
  conteudo_editado: string | null;
  status: RelatorioStatus;
  erro_geracao: string | null;
  modelo_ia: string | null;
  enviado_em: string | null;
  erro_envio: string | null;
  tracking_code: string | null;
};

export type CheckoutIntentRow = {
  id: string;
  plano: string;
  quer_nfse: boolean;
  email_nfse: string | null;
  termos_aceites: boolean;
  aceite_ip: string | null;
  criado_em: string;
};

export type PagamentoRow = {
  id: string;
  created_at: string;
  stripe_payment_id: string;
  nome_cliente: string | null;
  email_cliente: string | null;
  cpf_cliente: string | null;
  nif_cliente: string | null;
  plano: string | null;
  valor: number;
  moeda: string | null;
  quer_nfse: boolean;
  nfse_emitida: boolean;
  nfse_numero: string | null;
  nfse_pdf_url: string | null;
  nfse_foco_id: string | null;
  nfse_erro: string | null;
};

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
  }
  _client = createClient(url, key);
  return _client;
}

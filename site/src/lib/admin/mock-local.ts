/**
 * Local admin mock — localhost:3010 without production Supabase / SignalHub BR.
 * Enable with ADMIN_LOCAL_MOCK=true, or auto when service role is missing.
 */

import { PLANOS_USD } from "@/lib/admin/metricas-us";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function adminUsarMockLocal(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (env.ADMIN_LOCAL_MOCK === "true") return true;
  if (env.ADMIN_LOCAL_MOCK === "false") return false;
  if (!isSupabaseConfigured()) return true;
  if (!env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return true;
  return false;
}

export type MockPagamento = {
  id: string;
  relatorio_id: string;
  valor: number;
  forma_pagamento: string;
  status: string;
  created_at: string;
  plano: string;
};

/** Deterministic seed sales for the current calendar month (USD). */
export function mockPagamentosMes(agora = new Date()): MockPagamento[] {
  const y = agora.getFullYear();
  const m = agora.getMonth();
  const iso = (day: number, h = 14) =>
    new Date(y, m, day, h, 0, 0).toISOString();

  return [
    {
      id: "mock-pay-essencial-1",
      relatorio_id: "mock-rel-1",
      valor: PLANOS_USD.essencial,
      forma_pagamento: "card",
      status: "pago",
      created_at: iso(3),
      plano: "essencial",
    },
    {
      id: "mock-pay-padrao-1",
      relatorio_id: "mock-rel-2",
      valor: PLANOS_USD.padrao,
      forma_pagamento: "card",
      status: "pago",
      created_at: iso(8),
      plano: "padrao",
    },
    {
      id: "mock-pay-premium-1",
      relatorio_id: "mock-rel-3",
      valor: PLANOS_USD.completo,
      forma_pagamento: "card",
      status: "pago",
      created_at: iso(12),
      plano: "completo",
    },
    {
      id: "mock-pay-padrao-2",
      relatorio_id: "mock-rel-4",
      valor: PLANOS_USD.padrao,
      forma_pagamento: "card",
      status: "pago",
      created_at: iso(18),
      plano: "padrao",
    },
    {
      id: "mock-pay-pendente-1",
      relatorio_id: "mock-rel-5",
      valor: PLANOS_USD.padrao,
      forma_pagamento: "card",
      status: "pendente",
      created_at: iso(22),
      plano: "padrao",
    },
  ];
}

export type MockKpis = {
  totalRelatorios: number;
  porStatus: Record<string, number>;
  aguardando: number;
  emProducao: number;
  receitaMes: number;
  solicitacoesAbertas: number;
  fonte: "mock_local";
};

export function mockKpisOperacao(agora = new Date()): MockKpis {
  const pagos = mockPagamentosMes(agora).filter((p) => p.status === "pago");
  const receitaMes = pagos.reduce((s, p) => s + p.valor, 0);
  return {
    totalRelatorios: 5,
    porStatus: {
      aguardando_pagamento: 1,
      em_producao: 2,
      entregue: 2,
    },
    aguardando: 1,
    emProducao: 2,
    receitaMes,
    solicitacoesAbertas: 3,
    fonte: "mock_local",
  };
}

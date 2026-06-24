-- Pedidos e relatórios documentais (fluxo pós-pagamento Stripe)

CREATE TABLE IF NOT EXISTS pedidos_pendentes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  plano_id text NOT NULL,
  plano_nome text NOT NULL,
  nif text,
  descricao_caso text NOT NULL
);

CREATE TABLE IF NOT EXISTS relatorios_pedido (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  pagamento_id uuid REFERENCES pagamentos(id) ON DELETE SET NULL,
  pedido_id uuid REFERENCES pedidos_pendentes(id) ON DELETE SET NULL,
  stripe_payment_id text,
  nome_cliente text,
  email_cliente text,
  plano text,
  descricao_caso text,
  conteudo_rascunho text,
  conteudo_editado text,
  status text DEFAULT 'a_gerar' NOT NULL,
  erro_geracao text,
  modelo_ia text,
  enviado_em timestamptz,
  erro_envio text,
  CONSTRAINT relatorios_pedido_status_check CHECK (
    status IN ('a_gerar', 'revisao', 'aprovado', 'enviado', 'erro')
  )
);

CREATE INDEX IF NOT EXISTS relatorios_pedido_status_idx ON relatorios_pedido (status);
CREATE INDEX IF NOT EXISTS relatorios_pedido_created_idx ON relatorios_pedido (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS relatorios_pedido_pagamento_uidx ON relatorios_pedido (pagamento_id)
  WHERE pagamento_id IS NOT NULL;

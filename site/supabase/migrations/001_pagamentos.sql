-- Pagamentos Stripe + NFS-e (MEI Brasil)
-- Executar no Supabase SQL Editor (região EU recomendada para RGPD do site PT)

CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  stripe_payment_id text UNIQUE NOT NULL,
  nome_cliente text,
  email_cliente text,
  cpf_cliente text,          -- reservado backoffice MEI (nunca recolhido no site PT)
  nif_cliente text,          -- NIF português opcional no checkout
  plano text,
  valor numeric(10, 2) NOT NULL,
  moeda text DEFAULT 'eur',
  quer_nfse boolean DEFAULT false NOT NULL,
  nfse_emitida boolean DEFAULT false NOT NULL,
  nfse_numero text,
  nfse_pdf_url text,
  nfse_foco_id text,
  nfse_erro text
);

CREATE INDEX IF NOT EXISTS pagamentos_created_at_idx ON pagamentos (created_at DESC);
CREATE INDEX IF NOT EXISTS pagamentos_quer_nfse_idx ON pagamentos (quer_nfse) WHERE quer_nfse = true;

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Sem políticas públicas: acesso apenas via service_role (API server-side)

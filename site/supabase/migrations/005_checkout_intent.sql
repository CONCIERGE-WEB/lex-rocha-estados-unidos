-- Intenção de checkout (página intermédia antes do Stripe Payment Link)

CREATE TABLE IF NOT EXISTS checkout_intent (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plano text NOT NULL,
  quer_nfse boolean DEFAULT false NOT NULL,
  email_nfse text,
  termos_aceites boolean DEFAULT false NOT NULL,
  aceite_ip text,
  criado_em timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS checkout_intent_criado_idx ON checkout_intent (criado_em DESC);

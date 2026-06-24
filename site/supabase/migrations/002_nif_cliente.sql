-- Só necessário se já executou 001_pagamentos.sql ANTES de existir a coluna nif_cliente.
-- Instalação nova: execute APENAS 001_pagamentos.sql (já inclui nif_cliente).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pagamentos'
  ) THEN
    RAISE EXCEPTION
      'A tabela "pagamentos" não existe. Execute primeiro o ficheiro 001_pagamentos.sql no SQL Editor do Supabase.';
  END IF;

  ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS nif_cliente text;
END $$;

-- Campos de triagem IA nos pedidos

ALTER TABLE pedidos_pendentes
  ADD COLUMN IF NOT EXISTS area_caso text,
  ADD COLUMN IF NOT EXISTS plano_recomendado text,
  ADD COLUMN IF NOT EXISTS triagem_confianca text,
  ADD COLUMN IF NOT EXISTS triagem_favoravel boolean,
  ADD COLUMN IF NOT EXISTS triagem_justificativa text;

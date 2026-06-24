-- Order tracking codes (customer-facing, like LexRocha acompanhar)

ALTER TABLE pedidos_pendentes
  ADD COLUMN IF NOT EXISTS tracking_code text;

ALTER TABLE relatorios_pedido
  ADD COLUMN IF NOT EXISTS tracking_code text;

CREATE UNIQUE INDEX IF NOT EXISTS pedidos_tracking_code_uidx
  ON pedidos_pendentes (tracking_code)
  WHERE tracking_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS relatorios_tracking_code_idx
  ON relatorios_pedido (tracking_code)
  WHERE tracking_code IS NOT NULL;

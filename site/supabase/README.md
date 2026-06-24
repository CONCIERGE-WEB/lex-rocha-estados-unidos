# Supabase — migrations

Execute no [SQL Editor](https://supabase.com/dashboard) do projeto EU, **por ordem**:

| # | Ficheiro | O que cria |
|---|----------|------------|
| 1 | `001_pagamentos.sql` | Tabela `pagamentos` |
| 2 | `003_relatorios_pedido.sql` | `pedidos_pendentes` + `relatorios_pedido` (dashboard admin) |
| 3 | `004_triagem_campos.sql` | Campos de triagem IA em `pedidos_pendentes` |
| 4 | `005_checkout_intent.sql` | Tabela `checkout_intent` (página antes do Stripe) |

**Não execute** `002_nif_cliente.sql` em instalação nova — `nif_cliente` já está na `001`.

**Só execute** `002_nif_cliente.sql` se a tabela `pagamentos` existir **sem** a coluna `nif_cliente`.

## Verificar se falta alguma migration

No SQL Editor:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pagamentos', 'pedidos_pendentes', 'relatorios_pedido', 'checkout_intent');
```

Deve devolver **4 linhas**. Se faltar alguma, execute o ficheiro correspondente acima.

## Fluxo pós-pagamento

1. Webhook Stripe grava `pagamentos` e cria linha em `relatorios_pedido` (status `a_gerar`)
2. IA gera `conteudo_rascunho` → status `revisao`
3. Admin revê em `/admin/relatorios` → edita → **Aprovar e enviar ao cliente**
4. Status `enviado` + email via Resend

## Variáveis (Vercel / `.env.local`)

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROQ_API_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Direitos do Consumidor <contato.lexrocha@gmail.com>
ADMIN_EMAIL=contato.lexrocha@gmail.com
```

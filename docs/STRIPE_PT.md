# Stripe — mercado português (estratégia impecável)

## Conta Stripe recomendada

| Modelo | Quando usar |
|--------|-------------|
| **Stripe Payments Europe, Ltd.** | Padrão para vender a consumidores na UE/PT |
| Conta internacional + faturação UE | Se o titular opera fora do EEE mas vende a clientes PT |

Configurar em [dashboard.stripe.com](https://dashboard.stripe.com):
- País de negócio e moeda de liquidação adequados
- **Payment methods** → Cartões, **MB Way** (Portugal), Multibanco quando disponível
- Opcional UE: iDEAL (NL), Sofort (DE) — `STRIPE_ENABLE_IDEAL` / `STRIPE_ENABLE_SOFORT`

## Transparência no site (sem CNPJ BR)

Rodapé e checkout usam:

> Plataforma operada e processada globalmente via Stripe. Suporte e conformidade com o Direito do Consumidor de Portugal.

## Planos (EUR)

| ID | Nome | Preço |
|----|------|-------|
| `basico` | Básico — Relatório Simples | €29 |
| `recomendado` | Recomendado — Relatório Detalhado | €39 |
| `premium` | Premium — Relatório + Minuta | €59 |

## Variáveis

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_ENABLE_MBWAY=true
STRIPE_ENABLE_IDEAL=false
STRIPE_ENABLE_SOFORT=false
```

## Webhook

`https://www.direitosconsumidor.com/api/stripe/webhook`  
Evento: `checkout.session.completed`

## Locale

Stripe Checkout usa `locale: "pt"` (interface em português). Metadata inclui `pt-PT` para relatórios internos.

## Direito de livre resolução

Texto legal em `site/src/lib/constants/legal-consumidor.ts` e `/termos`.

## Ficheiros no projeto

```
site/src/lib/stripe/checkout.ts    → criarCheckoutSession()
site/src/app/api/checkout/route.ts
site/src/components/pedido-relatorio-form.tsx
site/src/components/stripe-trust-badge.tsx
```

# Project Structure — Judicial Intelligence (U.S.)

## Product

**Judicial Intelligence** — consumer rights research platform for the United States market.

| Folder | Role |
|--------|------|
| `Judicial Intelligence/site/` | **Canonical** — Next.js site, Vercel deploy |
| `Judicial Intelligence/signalhub/` | Telegram bot + U.S. dorks + Groq |

Adapted from `pt-consumidores` using the same architecture:

- Public site with free triage + paid report
- Signal Hub for Reddit/BBB dork scanning
- Groq AI for triage and report generation
- Stripe checkout in USD
- Supabase for orders and admin

---

## What runs where

```
Production (Vercel)
  └── Judicial Intelligence/site/  →  www.judicialintelligence.com

Local development
  └── .\INICIAR.ps1
        ├── npm run dev :3010     ← site
        └── signalhub/usa/bot.py  ← Telegram bot + dork scan
```

---

## U.S. vs Portugal differences

| Aspect | Portugal (`pt-consumidores`) | U.S. (`Judicial Intelligence`) |
|--------|------------------------------|--------------------------------|
| Language | pt-PT | en-US |
| Currency | EUR (€29/39/59) | USD ($29/39/59) |
| Legal refs | Lei 24/96, RGPD, CNPD | FTC Act, CCPA, state UDAP |
| Signal Hub | `signalhub/portugal/` | `signalhub/usa/` |
| Reddit | r/portugal, r/financaspessoaispt | r/legaladvice, r/ConsumerAdvice |
| Complaints | Portal da Queixa, Livro Reclamações | BBB, FTC, state AG |

---

## Environment variables

| Variable | Where |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_*` | Admin OAuth + middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Server APIs (webhook, reports) |
| `GROQ_API_KEY` | Triage + report generation |
| `STRIPE_*` | Checkout USD |
| `TELEGRAM_*` | Signal Hub alerts |

See `site/.env.example` and `.env.local.example` for full list.

---

## Recommended workflow

1. Develop / commit in **`Judicial Intelligence/`**
2. Configure `.env.local` at root → `.\scripts\sincronizar-env.ps1`
3. Local: `.\INICIAR.ps1 -Instalar` then `.\INICIAR.ps1`
4. Deploy site to Vercel (root directory: `site`)

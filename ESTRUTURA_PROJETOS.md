# Project Structure — Judicial Intelligence (U.S.)

**Path:** `E:\01_Projetos\04-judicial-intelligence`  
**GitHub:** [TiagoIA-UX/lex-rocha-estados-unidos](https://github.com/TiagoIA-UX/lex-rocha-estados-unidos)  
**Template:** `E:\01_Projetos\07-lex-rocha-template`

## Product

**Judicial Intelligence** — consumer rights research platform for the United States market.

| Folder | Role |
|--------|------|
| `site/` | **Canonical** — Next.js site, Vercel deploy |
| `signalhub/usa/` | Telegram bot + U.S. dorks + Groq |

Adapted from `08-lex-rocha-portugal` using the same architecture:

- Public site with free triage + paid report
- Signal Hub for Reddit/BBB dork scanning
- Groq AI for triage and report generation
- Stripe checkout in USD
- Supabase for orders and admin

---

## What runs where

```
Production (Vercel)
  └── site/  →  www.judicialintelligence.com

Local development
  └── .\lexrocha-us.ps1
        ├── npm run dev :3010     ← site
        └── signalhub/usa/bot.py  ← Telegram bot + dork scan
```

---

## U.S. vs Portugal differences

| Aspect | Portugal (`08-lex-rocha-portugal`) | U.S. (`04-judicial-intelligence`) |
|--------|------------------------------------|-----------------------------------|
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

1. Develop / commit in **`04-judicial-intelligence/`**
2. Configure `.env.local` at root
3. Local: `.\lexrocha-us.ps1 -Instalar` then `.\lexrocha-us.ps1`
4. Deploy site to Vercel (root directory: `site`)

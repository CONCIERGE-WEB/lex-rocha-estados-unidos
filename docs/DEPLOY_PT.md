# Deploy Portugal — Vercel + Supabase

## Domínio

| Item | Valor |
|------|--------|
| Marca pública | **Direitos do Consumidor** |
| Domínio canónico | **direitosconsumidor.com** (ver `DOMINIO_PT.md`) |
| Site | pasta `lex-rocha-pt/` |
| CTA SignalHub | `https://www.direitosconsumidor.com` |

## Vercel — pode contratar?

**Sim.** Plano Hobby (grátis) ou Pro para produção:

1. Importar repositório → root directory: `lex-rocha-pt`
2. Framework: Next.js
3. Domínio: `direitosconsumidor.com` + redirect `www`
4. Variáveis (quando houver formulário/Stripe): só em Environment Variables — nunca no Git

## Supabase — região para Portugal

**Sim.** Criar projeto novo (clone BR, não misturar):

| Região recomendada | Código | Latência PT |
|--------------------|--------|-------------|
| **West EU (Ireland)** | `eu-west-1` | Boa (padrão UE) |
| Central EU (Frankfurt) | `eu-central-1` | Alternativa |

Passos:

1. [supabase.com](https://supabase.com) → New project → região **Europe**
2. Copiar `SUPABASE_URL`, `anon key`, `service_role` para `lex-rocha-pt/.env.local` (gitignored)
3. Migrations: copiar de Lex-Rocha BR quando existir e adaptar locale PT

**Nota:** Rodapé institucional sem dados pessoais — marca Direitos do Consumidor + Stripe + RGPD. NIPC português quando houver entidade registada em PT.

## Clone vs editar Lex BR

| Abordagem | Decisão |
|-----------|---------|
| Editar Lex-Rocha BR em PT | ❌ Mistura mercados e template futuro |
| **Clone `lex-rocha-pt`** | ✅ Isolado, vendável depois como template |

## Checklist pós-deploy

- [ ] DNS `direitosconsumidor.com` → Vercel
- [ ] HTTPS ativo
- [ ] Rodapé institucional (marca + Stripe + links RGPD)
- [ ] `signalhub_v2/config/portugal/keywords.yaml` → `cta_link` = site live
- [ ] E-mail `contacto@direitosconsumidor.com` (Zoho/Google Workspace)
- [ ] Teste `python portugal/bot.py teste-live`

## Versão

1.0.0 — 2026-06-04

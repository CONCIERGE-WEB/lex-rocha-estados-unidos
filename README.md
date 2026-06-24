# Judicial Intelligence — U.S. Consumer Rights

**Repository:** [github.com/TiagoIA-UX/judicial-intelligence](https://github.com/TiagoIA-UX/judicial-intelligence)

Dedicated repository for the **United States** market: public site + Signal Hub bot.

| Folder | Contents |
|--------|----------|
| `site/` | Next.js 14 — [judicialintelligence.com](https://www.judicialintelligence.com) |
| `signalhub/` | Telegram bot + dorks + Groq (U.S. consumer focus) |
| `docs/` | Deploy, BBB/FTC strategy, response templates |

## Quick start (single script)

```powershell
cd "E:\.projetos\Judicial Intelligence"

# First time: install + start site + bot
.\INICIAR.ps1 -Instalar

# Daily use
.\INICIAR.ps1

# Stop site + bot
.\INICIAR.ps1 -Parar
```

| Command | What it does |
|---------|--------------|
| `.\INICIAR.ps1` | Site at http://localhost:3010 + dorking bot |
| `.\INICIAR.ps1 -ApenasSite` | Site only |
| `.\INICIAR.ps1 -ApenasBot` | Bot only |
| `.\INICIAR.ps1 -Producao` | Site with build + start (local) |

## Credentials (`.env.local`)

| File | Purpose |
|------|---------|
| `.env.local` at **root** | Master — Telegram, Groq, Supabase, VPS |
| `site/.env.local` | Site / Vercel |
| `signalhub/usa/.env` | Bot |

```powershell
copy .env.local.example .env.local
# edit .env.local
.\scripts\sincronizar-env.ps1
```

## Architecture

| Component | Where it runs |
|-----------|---------------|
| **Site** | Vercel (`site/`) |
| **WhatsApp contact** | Site → **Telegram** alert on your phone |
| **Database** | Supabase (open/closed schedule) |
| **Local bot** | `.\INICIAR.ps1` (dorking + `/agenda` commands) |
| **24/7 bot** | Linux VPS with systemd (`lexbot-us`) |

## Site deploy (Vercel — team-zairyx)

Project: [vercel.com/team-zairyx/judicial-intelligence](https://vercel.com/team-zairyx/judicial-intelligence)

### Required (fixes “No Next.js version detected”)

1. **Settings → General → Root Directory → `site` → Save**
2. **Clear overrides:** leave Build / Install / Output as **default** (empty) when Root Directory is `site`
3. Paste env vars from `.env.local` (see `.\scripts\vercel-env.ps1`)
4. **Redeploy** (disable “Use existing Build Cache”)

Or run (with [Vercel token](https://vercel.com/account/tokens) for team-zairyx):

```powershell
$env:VERCEL_TOKEN = "..."
.\scripts\configurar-vercel-root.ps1
```

Then import repo if needed:

1. GitHub: `TiagoIA-UX/judicial-intelligence`
2. **Root Directory:** `site`
3. Framework: Next.js (auto from `site/package.json`)
4. Domain: `judicialintelligence.com`

## Bot 24/7 deploy (VPS)

```powershell
# 1. Add to .env.local:
#    VPS_SSH_HOST=123.45.67.89
#    VPS_SSH_USER=root

# 2. Prepare (validate credentials)
.\scripts\DEPLOY_VPS.ps1

# 3. Upload configs + install service
.\scripts\DEPLOY_VPS.ps1 -Enviar -Instalar
```

On the VPS, the `lexbot-us` service restarts automatically on failure.

```bash
sudo systemctl status lexbot-us
tail -f /opt/judicial-intelligence/signalhub/logs/usa.log
```

## Manual installation (alternative)

```powershell
.\INSTALAR.ps1
cd signalhub
.\.venv\Scripts\Activate.ps1
python usa\bot.py detectar
python usa\bot.py teste-live
```

## U.S. market adaptation

Same strategy as the Portuguese version (`pt-consumidores`), adapted for Americans:

- **Language:** American English throughout site and AI prompts
- **Legal framework:** FTC Act, state UDAP statutes, CCPA where applicable
- **Signal sources:** Reddit (r/legaladvice, r/ConsumerAdvice), BBB, Trustpilot
- **Pricing:** USD ($29 / $39 / $59)
- **Complaint channels:** BBB, FTC, state Attorney General (not Portal da Queixa)

## Operator

Judicial Intelligence · U.S. Consumer Rights

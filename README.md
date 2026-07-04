> **© 2026 Tiago Aureliano da Rocha — Lex Rocha, prestação de serviços (CNPJ 61.699.939/0001-80).**  
> Todos os direitos reservados. Software proprietário — ver [LICENSE](./LICENSE).  
> Produto: **Judicial Intelligence** · Repositório: `TiagoIA-UX`

# Judicial Intelligence — U.S. Consumer Rights

**Repository:** [github.com/TiagoIA-UX/lex-rocha-estados-unidos](https://github.com/TiagoIA-UX/lex-rocha-estados-unidos)

Dedicated repository for the **United States** market: public site + Signal Hub bot.

| Field | Value |
|-------|--------|
| **Local folder** | `E:\01_Projetos\04-judicial-intelligence` |
| **GitHub** | [TiagoIA-UX/lex-rocha-estados-unidos](https://github.com/TiagoIA-UX/lex-rocha-estados-unidos) |
| **Template** | `E:\01_Projetos\07-lex-rocha-template` |

| Folder | Contents |
|--------|----------|
| `site/` | Next.js 14 — [judicialintelligence.com](https://www.judicialintelligence.com) |
| `signalhub/` | Telegram bot + dorks + Groq (U.S. consumer focus) |
| `docs/` | Deploy, BBB/FTC strategy, response templates |

## Quick start (single script)

```powershell
cd "E:\01_Projetos\04-judicial-intelligence"

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
```

## Product family

| Market | Local | GitHub |
|--------|-------|--------|
| U.S. | `04-judicial-intelligence` | `lex-rocha-estados-unidos` |
| Template | `07-lex-rocha-template` | `lex-rocha-template` |
| Portugal | `08-lex-rocha-portugal` | `lex-rocha-portugal` |
| Brazil | `09-lex-rocha-brasil` | `lex-rocha-brasil` |

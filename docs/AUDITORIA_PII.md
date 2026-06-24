# Auditoria PII — Direitos do Consumidor

Última revisão: junho 2026

## Objectivo

Garantir que **nenhum dado pessoal identificável (PII)** do operador aparece no site público, prompts, ou documentação partilhada.

## ✅ Limpo (site público)

| Área | Estado |
|------|--------|
| Rodapé / termos / privacidade | Só marca **Direitos do Consumidor** |
| E-mails | `contacto@` e `privacidade@direitosconsumidor.com` |
| Formulários | Sem nome pessoal; alertas via Telegram institucional |
| `empresa.ts` | `responsavelRgpd` genérico, sem `titular` pessoal |

## ✅ Corrigido nesta revisão

| Ficheiro | Alteração |
|----------|-----------|
| `private/prompts/portugal-groq.ip.yaml` | Removido CNPJ do prompt Groq |
| `signalhub/scripts/conectar_portugal.py` | Bot via `TELEGRAM_BOT_USERNAME` |
| `signalhub/portugal/bot.py` | Timeout aponta para bot configurado |
| `docs/DEPLOY_PT.md`, `DOMINIO_PT.md`, etc. | Textos desactualizados (MEI/CNPJ) |

## ⚠️ Atenção — fora do código

### Histórico Git

Os commits anteriores contêm autor e e-mail no metadata:

```
Tiago Rocha | Desenvolvedor com IA <globemarket7@gmail.com>
```

**Não alteramos automaticamente** (requer `git filter-repo` / reescrita de histórico).

Para commits futuros, configure localmente:

```powershell
git config user.name "Direitos do Consumidor"
git config user.email "contacto@direitosconsumidor.com"
```

### GitHub

URLs de clone usam `TiagoIA-UX/pt-consumidores` — username GitHub, não exposto no site.

### Ficheiros gitignored (rever manualmente)

| Ficheiro | Risco |
|----------|-------|
| `.env.local` | Tokens, chaves API |
| `signalhub/portugal/.env` | Telegram, Groq |
| `signalhub/config/portugal/*.yaml` | Prompts proprietários |
| `private/` | IP e prompts |

Nunca commitar estes ficheiros.

## Checklist periódica

```powershell
# Procurar vestígios no repo (exclui node_modules)
rg -i "tiago|aureliano|cnpj|61\.699|omago|globemarket" --glob "!node_modules" --glob "!.git"
```

- [ ] Site em produção sem nome pessoal no HTML
- [ ] Vercel env vars sem e-mails pessoais
- [ ] Bot Telegram = `@notificacoes_servico_bot`
- [ ] Stripe Dashboard em nome da marca / entidade comercial

## Contactos institucionais (padrão)

| Função | E-mail |
|--------|--------|
| Apoio geral | contacto@direitosconsumidor.com |
| RGPD / privacidade | privacidade@direitosconsumidor.com |

Não usar e-mails pessoais (`tiago@`, `globemarket@`, etc.) em formulários ou Vercel.

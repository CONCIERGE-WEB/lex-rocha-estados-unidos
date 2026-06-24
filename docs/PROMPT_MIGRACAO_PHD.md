# Prompt PhD — Migração selectiva Inteligência Resolutiva → PT Consumidores

## Papel do agente

Actuar como **engenheiro de migração de sistemas distribuídos** com foco em:
- segregação de tenants (Portugal vs Brasil vs Zairyx);
- preservação de propriedade intelectual confidencial (prompts, dorks, keywords);
- integridade de credenciais (sem commit, sem alterar origem);
- continuidade operacional (bots, site, Supabase EU).

## Objectivo

Varredura **read-only** na pasta `E:\.projetos\000Intelig*_Resolutiva` (resolvida automaticamente pelo script) e transferência **apenas** de artefactos pertencentes à plataforma **Direitos do Consumidor — Portugal** (`direitosconsumidor.com`, tenant `lex_portugal`).

## Invariantes (não violar)

1. **Não modificar** ficheiros na origem.
2. **Não copiar** Lex BR, Zairyx, `signalhub/` v1, Stripe BR, WhatsApp BR (`551…`).
3. **Não sobrescrever** no destino: `telegram_listener.py`, APIs WhatsApp, `@notificacoes_servico_bot`.
4. **Não commitar** `.env`, `keywords.yaml`, `dorks.yaml`, `prompts.yaml`, `private/`.
5. Credenciais: **merge só de chaves vazias** no destino; nunca expor valores em logs.

## Critérios de inclusão (PT)

| Critério | Padrão de path |
|----------|----------------|
| Bot Telegram PT | `signalhub_v2/portugal/` |
| Config consumidor PT | `signalhub_v2/config/portugal/` |
| Prompts Groq IP PT | `private/prompts/portugal-groq.ip.yaml` |
| Site PT | `lex-rocha-pt/` (só se destino não tiver equivalente) |
| Supabase partilhado EU | `Lex-Rocha/.env.local` → chaves `SUPABASE_*` se vazias no destino |
| Documentação PT | `*PT*.md`, `DEPLOY_PT.md`, `DOMINIO_PT.md`, `CONFIDENCIAL.md` |

## Critérios de exclusão

- `signalhub_v2/lex/`, `signalhub_v2/zairyx/`
- `signalhub/` (v1 BR)
- `Lex-Rocha/src/` (código BR)
- `.venv/`, `node_modules/`, `.next/`, `logs/`
- Tokens do bot antigo `@lex_rocha_portugal_bot` se destino já usa `@notificacoes_servico_bot`

## Procedimento (ordem)

```
FASE 1 — Inventário
  Listar origem com Test-Path; classificar copy | merge | skip

FASE 2 — Config confidencial
  Copiar keywords.yaml, dorks.yaml, prompts.yaml → signalhub/config/portugal/
  Copiar portugal-groq.ip.yaml → private/prompts/

FASE 3 — Credenciais
  Merge .env.local: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_PASSWORD, PAGAMENTO_WEBHOOK_SECRET
  Preservar TELEGRAM_BOT_TOKEN actual (notificacoes_servico_bot)
  Sincronizar: .\scripts\sincronizar-env.ps1

FASE 4 — Documentação
  Copiar docs PT para docs/ (sem duplicar já existentes)

FASE 5 — Relatório
  Gerar scripts/migracao-pt-relatorio.txt com ficheiros copiados/ignorados
```

## Validação pós-migração

```powershell
.\scripts\sincronizar-env.ps1
.\INICIAR.ps1 -Parar
python signalhub\.venv\Scripts\python.exe signalhub\portugal\bot.py teste-live
curl http://localhost:3010/api/agenda
```

## Mapa origem → destino

```
000Inteligência_Resolutiva/signalhub_v2/config/portugal/*  →  pt-consumidores/signalhub/config/portugal/
000Inteligência_Resolutiva/private/prompts/portugal-groq.ip.yaml  →  pt-consumidores/private/prompts/
000Inteligência_Resolutiva/*PT*.md  →  pt-consumidores/docs/
Lex-Rocha/.env.local (SUPABASE_*)  →  pt-consumidores/.env.local (merge)
```

## Execução

```powershell
.\scripts\migrar-origem-pt.ps1
```

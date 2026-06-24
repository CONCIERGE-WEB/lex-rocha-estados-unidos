# WhatsApp + alertas Telegram + agenda

## Canal WhatsApp em Portugal

Para serviços documentais a consumidores (plataforma institucional):

| Canal | Uso em PT | Este projeto |
|-------|-----------|--------------|
| **Telefone** | ~51% preferência oficial (atendimento) | — |
| **E-mail** | ~30% | Formulário + mailto |
| **WhatsApp** | Muito usado na prática para contacto rápido, dúvidas e pagamento informal | **Canal principal no site** |
| **Chat web** | ~18% | Formulário com alerta Telegram |

O WhatsApp não substitui e-mail para prova formal (gov.pt recomenda e-mail com aviso de leitura em conflitos), mas é o canal mais ágil para o cliente combinar análise e pagamento — especialmente fora do horário de escritório.

## Arquitectura

```
Cliente (site Vercel)
  → WhatsApp (wa.me) ou formulário
  → API /api/whatsapp/intent ou /api/contacto
  → Telegram no telemóvel do operador
  → Operador responde WhatsApp em qualquer horário

Robô dorking (VPS/PC 24/7)
  → Varredura fóruns + alertas Telegram
  → Listener /agenda /status /pago
```

## Variáveis (Vercel + .env.local)

| Variável | Onde | Função |
|----------|------|--------|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Site | Número wa.me (ex: 351912345678) |
| `TELEGRAM_BOT_TOKEN` | Site (server) | Alertas contacto/pagamento |
| `TELEGRAM_CHAT_ID` | Site (server) | Seu chat no Telegram |
| `WHATSAPP_VERIFY_TOKEN` | Site | Webhook Meta (opcional) |
| `WHATSAPP_ACCESS_TOKEN` | Site | API Meta (opcional) |
| `PAGAMENTO_WEBHOOK_SECRET` | Site | Proteger `/api/pagamento` e `/api/agenda` |
| `AGENDA_DISPONIVEL` | Site | Fallback se Supabase ausente (`true`/`false`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Site + bot | Estado da agenda |

Depois de editar `.env.local` na raiz:

```powershell
.\scripts\sincronizar-env.ps1
```

## Alertas automáticos

1. **Cliente clica WhatsApp** → alerta `💬 Cliente a abrir WhatsApp`
2. **Formulário do site** → alerta `📩 Novo contacto`
3. **Mensagem WhatsApp Business API** (webhook) → alerta `📱 Mensagem recebida`
4. **Pagamento aprovado** → `POST /api/pagamento` ou comando Telegram `/pago`

## Comandos Telegram (robô 24/7)

Com o bot em produção (`python portugal/bot.py`):

| Comando | Efeito |
|---------|--------|
| `/agenda on` | Marca agenda aberta (site + Supabase) |
| `/agenda off` | Marca agenda fechada |
| `/status` | Estado dorking + agenda |
| `/pago Maria\|Padrão\|39` | Alerta pagamento aprovado |

## Webhook WhatsApp Business (opcional)

Para alertas quando o cliente **escreve primeiro** (sem clicar no site):

1. [Meta for Developers](https://developers.facebook.com/) → WhatsApp Cloud API
2. Webhook URL: `https://www.direitosconsumidor.com/api/whatsapp/webhook`
3. Verify token = `WHATSAPP_VERIFY_TOKEN`
4. Subscrever `messages`

Sem API Meta, o alerta dispara quando o cliente **clica no botão WhatsApp** do site (intent).

## Pagamento aprovado (manual)

```powershell
curl -X POST https://www.direitosconsumidor.com/api/pagamento `
  -H "Content-Type: application/json" `
  -H "x-pagamento-secret: SEU_SECRET" `
  -d '{"nome":"Maria","plano":"Padrão","valor":39}'
```

Ou no Telegram: `/pago Maria|Padrão|39`

## Supabase agenda

Executar `site/supabase/schema.sql` no SQL Editor do Supabase.

## Testar localmente

```powershell
.\INICIAR.ps1
# Site: http://localhost:3010/contacto
# Bot: janela Robo Dorking (dorking + comandos /status)
```

Teste alerta:

```powershell
curl -X POST http://localhost:3010/api/whatsapp/intent -H "Content-Type: application/json" -d "{\"plano\":\"Padrão\"}"
```

# Erros comuns na instalação

## Arranque com um script (`lexrocha-us.ps1`)

```powershell
cd e:\.projetos\pt-consumidores
.\lexrocha-us.ps1 -Instalar   # primeira vez
.\lexrocha-us.ps1             # site + robô
.\lexrocha-us.ps1 -Parar      # parar tudo
```

## Deploy 24/7 no VPS

```powershell
# Em .env.local: VPS_SSH_HOST e VPS_SSH_USER
.\scripts\DEPLOY_VPS.ps1 -Enviar -Instalar
```

Ver `docs/DEPLOY.md` para comandos no servidor.

## `cd signalhub` — caminho não existe

O script `INSTALAR.ps1` **já termina dentro de** `signalhub`. Não volte a fazer `cd signalhub`.

```powershell
cd e:\.projetos\pt-consumidores\signalhub
.\.venv\Scripts\Activate.ps1
python portugal\bot.py detectar
```

## Onde ficam as credenciais

| Ficheiro | Uso |
|----------|-----|
| **`.env.local`** (raiz `pt-consumidores`) | Master — todas as chaves num sítio |
| **`site/.env.local`** | Next.js / Vercel / Supabase |
| **`signalhub/portugal/.env`** | Bot Telegram + Groq |

Depois de editar o master na raiz:

```powershell
cd e:\.projetos\pt-consumidores
.\scripts\sincronizar-env.ps1
```

## `TELEGRAM_BOT_TOKEN ausente`

Edite `signalhub\portugal\.env` ou copie do projeto antigo:

```powershell
copy "e:\.projetos\000Inteligência_Resolutiva\signalhub_v2\portugal\.env" "e:\.projetos\pt-consumidores\signalhub\portugal\.env"
```

## `INSTALAR.ps1` falha com `&&`

Versão antiga do script. Actualize o repositório ou use o `INSTALAR.ps1` corrigido (sem `&&` nas mensagens).

## Site sem CSS (página branca)

```powershell
cd e:\.projetos\pt-consumidores\site
npm run dev:fresh
```

No browser: **Ctrl+F5**.

## Groq `Expecting value`

- Confirme `GROQ_API_KEY` no `.env`
- Confirme `prompts.yaml` com `groq_revisao_template` (corra `INSTALAR.ps1` de novo)
- Teste: `python portugal\bot.py teste` (usa fallback se Groq falhar)

## Ambiente Python

Sempre use o venv criado pelo instalador:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

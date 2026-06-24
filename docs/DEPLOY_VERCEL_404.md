# Erro 404 NOT_FOUND na Vercel

Mensagem típica:

```text
404: NOT_FOUND
Code: NOT_FOUND
```

## Causa mais comum (este repositório)

O projeto **pt-consumidores** é um monorepo:

```text
pt-consumidores/
  site/          ← Next.js (é isto que a Vercel deve publicar)
  signalhub/     ← robô Python (não vai para a Vercel)
```

Se a Vercel importou a **raiz** do repo sem apontar para `site/`, o deploy não serve páginas → **404**.

## Correção (recomendada)

1. [vercel.com](https://vercel.com) → projeto **pt-consumidores**
2. **Settings** → **General** → **Root Directory**
3. Clique **Edit** → escreva: `site`
4. **Save**
5. **Deployments** → último deploy → **⋯** → **Redeploy**

## Variáveis de ambiente (Settings → Environment Variables)

Copie de `site/.env.local` (local):

| Nome | Obrigatório para site estático actual |
|------|----------------------------------------|
| `NEXT_PUBLIC_APP_URL` | Recomendado (`https://www.direitosconsumidor.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Quando ligar formulário/BD |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Idem |

O robô Telegram **não** usa a Vercel — fica no VPS/PC (`signalhub/portugal/.env`).

## Domínio personalizado

1. **Settings** → **Domains** → `direitosconsumidor.com` e `www.direitosconsumidor.com`
2. No registrador do domínio, DNS conforme a Vercel indica (geralmente CNAME `www` → `cname.vercel-dns.com`)
3. Aguarde propagação (minutos a algumas horas)

## Testar build local antes do deploy

```powershell
cd e:\.projetos\pt-consumidores\site
npm run build
npm run start
# http://localhost:3000
```

## URL errada

- URL do robô/signalhub → não existe na Vercel
- Preview antigo apagado → gere novo deploy após corrigir Root Directory

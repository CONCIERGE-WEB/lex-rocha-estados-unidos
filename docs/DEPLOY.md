# Deploy — PT Consumidores

## Vercel (site)

| Campo | Valor |
|-------|--------|
| Repositório | `pt-consumidores` (GitHub) |
| Root Directory | **`site`** (obrigatório — senão 404 NOT_FOUND) |
| Build | `npm run build` |
| Domínio | `www.direitosconsumidor.com` |

## VPS (robô 24/7)

O robô **não** corre na Vercel. Para alertas Telegram contínuos, use um VPS Linux com **systemd** (restart automático).

### Preparar a partir do Windows

```powershell
cd E:\.projetos\pt-consumidores

# Adicione ao .env.local:
# VPS_SSH_HOST=123.45.67.89
# VPS_SSH_USER=root

.\scripts\DEPLOY_VPS.ps1                              # valida + gera comandos
.\scripts\DEPLOY_VPS.ps1 -Enviar -Instalar            # envia configs + instala systemd
# ou com IP explicito:
.\scripts\DEPLOY_VPS.ps1 -VpsHost IP -VpsUser root -Enviar -Instalar
```

O script prepara o VPS (clone do repo + pastas), envia `.env` e configs, e instala o serviço `lexbot-pt`.

### Instalar no VPS (Ubuntu/Debian)

```bash
# Primeira vez
sudo apt update && sudo apt install -y git python3 python3-venv
sudo git clone https://github.com/TiagoIA-UX/pt-consumidores.git /opt/pt-consumidores

# Copiar .env e configs do PC (ver DEPLOY_VPS.ps1)
# Depois, no VPS:
cd /opt/pt-consumidores
sudo bash scripts/deploy-vps.sh
```

O script `deploy-vps.sh` cria o serviço `lexbot-pt`, activa no boot e reinicia em caso de falha.

### Comandos úteis no VPS

```bash
sudo systemctl status lexbot-pt      # estado
sudo systemctl restart lexbot-pt     # reiniciar
sudo systemctl stop lexbot-pt          # parar
tail -f /opt/pt-consumidores/signalhub/logs/portugal.log
```

### Arranque manual (sem systemd)

```bash
cd /opt/pt-consumidores/signalhub
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
nohup python portugal/bot.py >> logs/portugal.log 2>&1 &
```

## Checklist

- [ ] DNS → Vercel
- [ ] `keywords.yaml` → `cta_link` = site em produção
- [ ] E-mails `contacto@` e `privacidade@` no domínio
- [ ] Bot: `python portugal/bot.py teste-live`

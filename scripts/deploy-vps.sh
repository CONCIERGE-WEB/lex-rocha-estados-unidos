#!/usr/bin/env bash
# Deploy 24/7 do robo dorking (Signal Hub U.S.) num VPS Linux com systemd.
#
# Uso (no VPS, como root ou com sudo):
#   cd /opt/judicial-intelligence && sudo bash scripts/deploy-vps.sh
#
# Pre-requisitos no VPS:
#   - Ubuntu/Debian com python3, python3-venv, git
#   - Ficheiro signalhub/usa/.env com TELEGRAM, GROQ, etc.
#   - Ficheiros signalhub/config/usa/*.yaml (keywords, dorks, prompts)

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/TiagoIA-UX/lex-rocha-estados-unidos.git}"
INSTALL_DIR="${INSTALL_DIR:-/opt/judicial-intelligence}"
SERVICE_NAME="lexbot-us"
SERVICE_USER="${SERVICE_USER:-lexbot}"
HUB_DIR="$INSTALL_DIR/signalhub"
VENV_PY="$HUB_DIR/.venv/bin/python"
BOT_PY="$HUB_DIR/usa/bot.py"
LOG_DIR="$HUB_DIR/logs"

log() { echo "[deploy-vps] $*"; }
die() { echo "[deploy-vps] ERRO: $*" >&2; exit 1; }

require_root() {
    if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
        die "Execute com sudo: sudo bash scripts/deploy-vps.sh"
    fi
}

install_packages() {
    if command -v apt-get >/dev/null 2>&1; then
        log "A instalar pacotes (apt)..."
        apt-get update -qq
        DEBIAN_FRONTEND=noninteractive apt-get install -y -qq python3 python3-venv python3-pip git
    else
        log "Aviso: apt-get nao encontrado - confirme python3 e git manualmente."
    fi
}

ensure_user() {
    if ! id "$SERVICE_USER" &>/dev/null; then
        log "A criar utilizador $SERVICE_USER..."
        useradd --system --home-dir "$INSTALL_DIR" --shell /usr/sbin/nologin "$SERVICE_USER"
    fi
}

clone_or_update() {
    if [[ -d "$INSTALL_DIR/.git" ]]; then
        log "A actualizar repositorio em $INSTALL_DIR..."
        git -C "$INSTALL_DIR" pull --ff-only
    else
        log "A clonar repositorio para $INSTALL_DIR..."
        git clone "$REPO_URL" "$INSTALL_DIR"
    fi
}

setup_python() {
    log "A configurar ambiente Python..."
    cd "$HUB_DIR"
    if [[ ! -x "$VENV_PY" ]]; then
        python3 -m venv .venv
    fi
    "$VENV_PY" -m pip install -q --upgrade pip
    "$VENV_PY" -m pip install -q -r requirements.txt
    mkdir -p "$LOG_DIR"
}

ensure_configs() {
    local cfg="$HUB_DIR/config/usa"
    for f in dorks.yaml keywords.yaml prompts.yaml; do
        if [[ ! -f "$cfg/$f" && -f "$cfg/$f.example" ]]; then
            cp "$cfg/$f.example" "$cfg/$f"
            log "Criado: config/usa/$f (a partir do example)"
        fi
    done
    if [[ ! -f "$HUB_DIR/usa/.env" ]]; then
        if [[ -f "$HUB_DIR/usa/.env.example" ]]; then
            cp "$HUB_DIR/usa/.env.example" "$HUB_DIR/usa/.env"
        fi
        die "Edite $HUB_DIR/usa/.env com TELEGRAM_BOT_TOKEN, GROQ_API_KEY e TELEGRAM_CHAT_ID"
    fi
    grep -q 'TELEGRAM_BOT_TOKEN=.\+' "$HUB_DIR/usa/.env" || die "TELEGRAM_BOT_TOKEN vazio em usa/.env"
    grep -q 'GROQ_API_KEY=.\+' "$HUB_DIR/usa/.env" || die "GROQ_API_KEY vazio em usa/.env"
}

install_systemd() {
    log "A instalar servico systemd $SERVICE_NAME..."
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Judicial Intelligence U.S. - dorking + Telegram alerts
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${HUB_DIR}
Environment=PYTHONIOENCODING=utf-8
EnvironmentFile=${HUB_DIR}/usa/.env
ExecStart=${VENV_PY} ${BOT_PY}
Restart=always
RestartSec=15
StandardOutput=append:${LOG_DIR}/usa.log
StandardError=append:${LOG_DIR}/usa.log

[Install]
WantedBy=multi-user.target
EOF

    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    systemctl restart "$SERVICE_NAME"
}

show_status() {
    echo ""
    log "Deploy concluido."
    echo "  Servico:  systemctl status $SERVICE_NAME"
    echo "  Logs:     tail -f $LOG_DIR/usa.log"
    echo "  Parar:    sudo systemctl stop $SERVICE_NAME"
    echo "  Reiniciar: sudo systemctl restart $SERVICE_NAME"
    echo ""
    systemctl --no-pager status "$SERVICE_NAME" || true
}

main() {
    require_root
    install_packages
    ensure_user
    clone_or_update
    setup_python
    ensure_configs
    install_systemd
    show_status
}

main "$@"

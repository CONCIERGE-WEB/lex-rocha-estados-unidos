# Deploy 24/7 do robo dorking num VPS Linux (systemd) — Judicial Intelligence (U.S.)
#
# Uso:
#   .\scripts\DEPLOY_VPS.ps1
#   .\scripts\DEPLOY_VPS.ps1 -VpsHost 123.45.67.89 -VpsUser root
#   .\scripts\DEPLOY_VPS.ps1 -VpsHost 123.45.67.89 -VpsUser root -Enviar
#   .\scripts\DEPLOY_VPS.ps1 -VpsHost 123.45.67.89 -VpsUser root -Enviar -Instalar
#
param(
    [string]$VpsHost,
    [string]$VpsUser,
    [switch]$Enviar,
    [switch]$Instalar
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$hub = Join-Path $root "signalhub"
$envBot = Join-Path $hub "usa\.env"
$cfgDir = Join-Path $hub "config\usa"
$masterEnv = Join-Path $root ".env.local"
$installDir = "/opt/judicial-intelligence"
$comandosFile = Join-Path $PSScriptRoot ".vps-deploy-comandos.ps1"

function Read-MasterVar($key) {
    if (-not (Test-Path $masterEnv)) { return $null }
    foreach ($line in Get-Content $masterEnv -Encoding UTF8) {
        $t = $line.Trim()
        if ($t -match "^$([regex]::Escape($key))=(.*)$") {
            $v = $Matches[1].Trim()
            if ($v) { return $v }
        }
    }
    return $null
}

function Test-EnvFilled($path, $key) {
    if (-not (Test-Path $path)) { return $false }
    foreach ($line in Get-Content $path -Encoding UTF8) {
        $t = $line.Trim()
        if ($t -match "^$([regex]::Escape($key))=(.+)$") {
            return [bool]($Matches[1].Trim())
        }
    }
    return $false
}

function Ensure-Prereqs {
    $missing = @()
    if (-not (Test-EnvFilled $envBot "TELEGRAM_BOT_TOKEN")) { $missing += "TELEGRAM_BOT_TOKEN" }
    if (-not (Test-EnvFilled $envBot "GROQ_API_KEY")) { $missing += "GROQ_API_KEY" }
    if (-not (Test-EnvFilled $envBot "TELEGRAM_CHAT_ID")) { $missing += "TELEGRAM_CHAT_ID" }

    if ($missing.Count -gt 0) {
        Write-Host "Faltam credenciais em signalhub\usa\.env:" -ForegroundColor Yellow
        $missing | ForEach-Object { Write-Host "  - $_" }
        Write-Host "Corra: .\scripts\sincronizar-env.ps1" -ForegroundColor Yellow
        exit 1
    }

    foreach ($f in @("keywords.yaml", "dorks.yaml", "prompts.yaml")) {
        if (-not (Test-Path (Join-Path $cfgDir $f))) {
            Write-Host "Falta config\usa\$f - corra .\lexrocha-us.ps1 -Instalar" -ForegroundColor Yellow
            exit 1
        }
    }
}

if (-not $VpsHost) { $VpsHost = Read-MasterVar "VPS_SSH_HOST" }
if (-not $VpsUser) { $VpsUser = Read-MasterVar "VPS_SSH_USER" }
if (-not $VpsUser) { $VpsUser = "root" }

Write-Host ""
Write-Host "=== Deploy VPS 24/7 - Judicial Intelligence (U.S.) ===" -ForegroundColor Cyan
Ensure-Prereqs
Write-Host "Credenciais e configs OK." -ForegroundColor Green

$target = if ($VpsHost) { "${VpsUser}@${VpsHost}" } else { "USER@VPS_IP" }
$remoteBase = "${installDir}/signalhub"

$scpEnv = "scp `"$envBot`" ${target}:${remoteBase}/usa/.env"
$scpKw = "scp `"$(Join-Path $cfgDir 'keywords.yaml')`" ${target}:${remoteBase}/config/usa/"
$scpDk = "scp `"$(Join-Path $cfgDir 'dorks.yaml')`" ${target}:${remoteBase}/config/usa/"
$scpPr = "scp `"$(Join-Path $cfgDir 'prompts.yaml')`" ${target}:${remoteBase}/config/usa/"
$sshInstall = "ssh ${target} `"cd ${installDir} && sudo bash scripts/deploy-vps.sh`""
$sshStatus = "ssh ${target} `"sudo systemctl status lexbot-us`""
$sshLogs = "ssh ${target} `"tail -n 30 ${remoteBase}/logs/usa.log`""

$bootstrapOneLine = "set -e; if [ ! -d '$installDir/.git' ]; then sudo mkdir -p '$installDir'; sudo git clone https://github.com/TiagoIA-UX/lex-rocha-estados-unidos.git '$installDir'; fi; sudo mkdir -p '$remoteBase/usa' '$remoteBase/config/usa' '$remoteBase/logs'"

$scriptContent = @"
# Gerado por DEPLOY_VPS.ps1 - comandos para deploy do robo 24/7 (U.S.)
`$ErrorActionPreference = 'Stop'
Set-Location '$root'

Write-Host 'A preparar VPS...' -ForegroundColor Cyan
ssh $target '$bootstrapOneLine'

Write-Host 'A enviar .env e configs...' -ForegroundColor Cyan
$scpEnv
$scpKw
$scpDk
$scpPr

Write-Host 'A instalar servico systemd no VPS...' -ForegroundColor Cyan
$sshInstall

Write-Host 'Estado do servico:' -ForegroundColor Cyan
$sshStatus

Write-Host 'Ultimas linhas do log:' -ForegroundColor Cyan
$sshLogs
"@

$scriptContent | Set-Content $comandosFile -Encoding UTF8
Write-Host "Comandos gravados em: scripts\.vps-deploy-comandos.ps1" -ForegroundColor DarkGray
Write-Host ""

if (-not $VpsHost) {
    Write-Host "=== Configure o VPS em .env.local ===" -ForegroundColor Yellow
    Write-Host @"
# Adicione ao .env.local (raiz):
VPS_SSH_HOST=123.45.67.89
VPS_SSH_USER=root
"@
    Write-Host "=== Ou passe parametros ===" -ForegroundColor Yellow
    Write-Host "  .\scripts\DEPLOY_VPS.ps1 -VpsHost IP -VpsUser root -Enviar -Instalar"
    Write-Host ""
    Write-Host "=== Comandos manuais (substitua USER@VPS_IP) ===" -ForegroundColor Cyan
    Write-Host $scpEnv
    Write-Host $scpKw
    Write-Host $scpDk
    Write-Host $scpPr
    Write-Host ""
    Write-Host "ssh USER@VPS_IP"
    Write-Host "cd $installDir"
    Write-Host "sudo bash scripts/deploy-vps.sh"
    Write-Host ""
    Write-Host "sudo systemctl status lexbot-us"
    Write-Host "tail -f ${remoteBase}/logs/usa.log"
    exit 0
}

Write-Host "Alvo: $target" -ForegroundColor Green
Write-Host ""

if (-not $Enviar) {
    Write-Host "Modo preparacao (sem envio). Para enviar e instalar:" -ForegroundColor Yellow
    Write-Host "  .\scripts\DEPLOY_VPS.ps1 -VpsHost $VpsHost -VpsUser $VpsUser -Enviar -Instalar"
    Write-Host ""
    Write-Host "Ou execute o ficheiro gerado:" -ForegroundColor Yellow
    Write-Host "  .\scripts\.vps-deploy-comandos.ps1"
    exit 0
}

if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: scp nao encontrado. Instale OpenSSH Client (Windows)." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: ssh nao encontrado. Instale OpenSSH Client (Windows)." -ForegroundColor Red
    exit 1
}

Write-Host "=== Passo 0: Preparar VPS (repo + pastas) ===" -ForegroundColor Cyan
$bootstrap = @"
set -e
if [ ! -d '$installDir/.git' ]; then
  sudo mkdir -p '$installDir'
  sudo git clone https://github.com/TiagoIA-UX/lex-rocha-estados-unidos.git '$installDir'
fi
sudo mkdir -p '$remoteBase/usa' '$remoteBase/config/usa' '$remoteBase/logs'
sudo chown -R `$(whoami):`$(whoami) '$installDir' 2>/dev/null || true
"@
$bootstrap | ssh $target "bash -s"
Write-Host "VPS preparado." -ForegroundColor Green

Write-Host ""
Write-Host "=== Passo 1: Enviar ficheiros ===" -ForegroundColor Cyan
Invoke-Expression $scpEnv
Invoke-Expression $scpKw
Invoke-Expression $scpDk
Invoke-Expression $scpPr
Write-Host "Ficheiros enviados." -ForegroundColor Green

if ($Instalar) {
    Write-Host ""
    Write-Host "=== Passo 2: Instalar servico 24/7 ===" -ForegroundColor Cyan
    Invoke-Expression $sshInstall
    Write-Host ""
    Write-Host "=== Passo 3: Verificar ===" -ForegroundColor Cyan
    Invoke-Expression $sshStatus
    Write-Host ""
    Invoke-Expression $sshLogs
} else {
    Write-Host ""
    Write-Host "Ficheiros no VPS. Para instalar o servico:" -ForegroundColor Yellow
    Write-Host "  .\scripts\DEPLOY_VPS.ps1 -VpsHost $VpsHost -VpsUser $VpsUser -Instalar"
    Write-Host "  # ou: ssh $target `"cd $installDir && sudo bash scripts/deploy-vps.sh`""
}

Write-Host ""
Write-Host "Robo 24/7: systemd lexbot-us (restart automatico)." -ForegroundColor Green
Write-Host "Site: Vercel (deploy separado)." -ForegroundColor DarkGray

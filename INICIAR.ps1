# INICIAR.ps1 - Site (Next.js) + Signal Hub bot in one command
#
# Usage:
#   .\INICIAR.ps1                  # site dev + production bot
#   .\INICIAR.ps1 -Instalar        # install dependencies then start all
#   .\INICIAR.ps1 -ApenasSite      # site only
#   .\INICIAR.ps1 -ApenasBot       # bot only
#   .\INICIAR.ps1 -Producao        # site production mode (build + start)
#   .\INICIAR.ps1 -Parar           # stop processes started by this script
#
param(
    [switch]$Instalar,
    [switch]$ApenasSite,
    [switch]$ApenasBot,
    [switch]$Producao,
    [switch]$Parar
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$runtimeDir = Join-Path $root ".runtime"
$pidFile = Join-Path $runtimeDir "iniciar.json"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "=== $msg ===" -ForegroundColor Cyan
}

function Stop-Stack {
    if (-not (Test-Path $pidFile)) {
        Write-Host "No registered processes (.runtime/iniciar.json missing)." -ForegroundColor Yellow
        return
    }
    $data = Get-Content $pidFile -Raw | ConvertFrom-Json
    foreach ($entry in @($data.site, $data.bot)) {
        if (-not $entry) { continue }
        $proc = Get-Process -Id $entry.pid -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $entry.pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped: $($entry.nome) (PID $($entry.pid))" -ForegroundColor Green
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    Write-Host "Judicial Intelligence stack stopped."
}

function Test-EnvValue($path, $key) {
    if (-not (Test-Path $path)) { return $false }
    foreach ($line in Get-Content $path -Encoding UTF8) {
        $t = $line.Trim()
        if ($t.StartsWith("#") -or -not $t) { continue }
        if ($t -match "^$([regex]::Escape($key))=(.+)$") {
            return [bool]($Matches[1].Trim())
        }
    }
    return $false
}

function Ensure-Prereqs {
    $siteDir = Join-Path $root "site"
    $hubDir = Join-Path $root "signalhub"
    $venvPy = Join-Path $hubDir ".venv\Scripts\python.exe"

    if (-not (Test-Path (Join-Path $siteDir "node_modules"))) {
        throw "Site missing node_modules. Run: .\INICIAR.ps1 -Instalar"
    }
    if (-not (Test-Path $venvPy)) {
        throw "Bot missing Python environment. Run: .\INICIAR.ps1 -Instalar"
    }
    if (-not (Test-Path (Join-Path $hubDir "config\usa\keywords.yaml"))) {
        throw "Missing signalhub\config\usa\keywords.yaml. Run: .\INICIAR.ps1 -Instalar"
    }
}

function Sync-Env {
    $master = Join-Path $root ".env.local"
    $sync = Join-Path $root "scripts\sincronizar-env.ps1"
    if ((Test-Path $master) -and (Test-Path $sync)) {
        & $sync
    } elseif (-not (Test-Path $master)) {
        Write-Host "Warning: root .env.local missing - use .env.local.example as template." -ForegroundColor Yellow
    }
}

function Start-SiteProcess {
    $siteDir = Join-Path $root "site"
    $siteEnv = Join-Path $siteDir ".env.local"
    if (-not (Test-Path $siteEnv)) {
        Write-Host "Warning: site\.env.local missing - Supabase/Vercel may not connect locally." -ForegroundColor Yellow
    }

    $cmd = if ($Producao) {
        "Set-Location '$siteDir'; npm run build; if (`$LASTEXITCODE -ne 0) { exit `$LASTEXITCODE }; npm run start"
    } else {
        "Set-Location '$siteDir'; npm run dev"
    }

    $proc = Start-Process powershell -PassThru -WindowStyle Normal -ArgumentList @(
        "-NoExit",
        "-Command",
        "`$Host.UI.RawUI.WindowTitle = `"Judicial Intelligence - Site`"; $cmd"
    )
    return @{ nome = "Site Next.js"; pid = $proc.Id; url = "http://localhost:3010" }
}

function Start-BotProcess {
    $hubDir = Join-Path $root "signalhub"
    $venvPy = Join-Path $hubDir ".venv\Scripts\python.exe"
    $botEnv = Join-Path $hubDir "usa\.env"

    if (-not (Test-Path $botEnv)) {
        throw "Missing signalhub\usa\.env. Run .\INICIAR.ps1 -Instalar or .\scripts\sincronizar-env.ps1"
    }
    if (-not (Test-EnvValue $botEnv "TELEGRAM_BOT_TOKEN")) {
        throw "TELEGRAM_BOT_TOKEN empty in signalhub\usa\.env"
    }
    if (-not (Test-EnvValue $botEnv "GROQ_API_KEY")) {
        throw "GROQ_API_KEY empty in signalhub\usa\.env"
    }
    if (-not (Test-EnvValue $botEnv "TELEGRAM_CHAT_ID")) {
        Write-Host "Warning: TELEGRAM_CHAT_ID empty - bot will not send alerts until configured." -ForegroundColor Yellow
        Write-Host "  cd signalhub; .\.venv\Scripts\python.exe usa\bot.py detectar" -ForegroundColor DarkGray
    }

    New-Item -ItemType Directory -Force -Path (Join-Path $hubDir "logs") | Out-Null

    $cmd = "Set-Location '$hubDir'; & '$venvPy' usa\bot.py"

    $proc = Start-Process powershell -PassThru -WindowStyle Normal -ArgumentList @(
        "-NoExit",
        "-Command",
        "`$Host.UI.RawUI.WindowTitle = `"Judicial Intelligence - Signal Hub`"; $cmd"
    )
    return @{ nome = "Signal Hub bot"; pid = $proc.Id; log = "signalhub\logs\usa.log" }
}

# --- main ---

if ($Parar) {
    Stop-Stack
    exit 0
}

if ($Instalar) {
    Write-Step "Installation"
    & (Join-Path $root "INSTALAR.ps1")
}

if (Test-Path $pidFile) {
    Write-Host "Previous processes detected - stopping before restart..." -ForegroundColor Yellow
    Stop-Stack
}

Write-Step "Judicial Intelligence - starting"
Ensure-Prereqs
Sync-Env

$startSite = -not $ApenasBot
$startBot = -not $ApenasSite

$state = @{
    site = $null
    bot = $null
    iniciadoEm = (Get-Date).ToString("o")
}

if ($startSite) {
    $siteMode = if ($Producao) { "local production" } else { "development" }
    Write-Host "Starting site ($siteMode)..."
    $state.site = Start-SiteProcess
}

if ($startBot) {
    Write-Host "Starting Signal Hub bot (continuous loop)..."
    $state.bot = Start-BotProcess
}

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
$state | ConvertTo-Json -Depth 3 | Set-Content $pidFile -Encoding UTF8

Write-Step "Running"
if ($state.site) {
    Write-Host "  Site:     $($state.site.url)" -ForegroundColor Green
    Write-Host "  Window:   Judicial Intelligence - Site (PID $($state.site.pid))"
}
if ($state.bot) {
    Write-Host "  Bot:      dork scan + Telegram alerts" -ForegroundColor Green
    Write-Host "  Log:      $($state.bot.log)"
    Write-Host "  Window:   Judicial Intelligence - Signal Hub (PID $($state.bot.pid))"
}
Write-Host ""
Write-Host "  Supabase: cloud - no local start needed" -ForegroundColor DarkGray
Write-Host "  Vercel:   separate deploy for production site" -ForegroundColor DarkGray
Write-Host "  VPS 24/7: .\scripts\DEPLOY_VPS.ps1 (continuous bot in production)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "To stop everything: .\INICIAR.ps1 -Parar" -ForegroundColor Yellow

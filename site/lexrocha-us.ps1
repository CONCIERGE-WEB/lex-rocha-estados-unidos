#Requires -Version 5.1
<#
.SYNOPSIS
  Inicia o ecossistema Portugal completo: site + SignalHub-PT.

.EXAMPLE
  .\lexrocha-us.ps1
  Site http://localhost:3010 + bot Telegram em janela separada
#>
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Hub = Join-Path $Root "signalhub-pt"
$SiteUrl = "http://localhost:3010"
$SitePort = 3010

function Ensure-NodeModules {
    if (-not (Test-Path (Join-Path $Root "node_modules"))) {
        Write-Host "A instalar dependencias npm..." -ForegroundColor Yellow
        Push-Location $Root
        try { npm install } finally { Pop-Location }
    }
}

function Test-SignalHubPT {
    $envFile = Join-Path $Hub ".env"
    $kw = Join-Path $Hub "config\keywords.yaml"
    $vr = Join-Path $Hub "config\varredura.yaml"
    if (-not (Test-Path $envFile)) {
        Write-Host "AVISO: Copie signalhub-pt\.env.example para signalhub-pt\.env" -ForegroundColor Yellow
        return $false
    }
    if (-not (Test-Path $kw)) {
        Write-Host "AVISO: Falta signalhub-pt\config\keywords.yaml" -ForegroundColor Yellow
        return $false
    }
    if (-not (Test-Path $vr)) {
        Write-Host "AVISO: Falta signalhub-pt\config\varredura.yaml" -ForegroundColor Yellow
        return $false
    }
    return $true
}

function Start-SignalHubPT {
    $title = "SignalHub-PT"
    $cmd = "Set-Location -LiteralPath '$Root'; python signalhub-pt\hub.py"
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "[Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8; `$Host.UI.RawUI.WindowTitle = '$title'; $cmd"
    ) | Out-Null
    Write-Host "SignalHub-PT: janela separada (varredura + Telegram)" -ForegroundColor Green
}

Write-Host ""
Write-Host " Direitos do Consumidor — Portugal (site + bot)" -ForegroundColor Cyan
Write-Host " Site:  $SiteUrl"
Write-Host " Bot:   SignalHub-PT (pt-PT)"
Write-Host ""

Ensure-NodeModules

if (Test-SignalHubPT) {
    Start-SignalHubPT
} else {
    Write-Host "Bot nao iniciado — corrija a configuracao acima." -ForegroundColor Yellow
}

$nextDir = Join-Path $Root ".next"
if (Test-Path $nextDir) {
    Remove-Item $nextDir -Recurse -Force
}

Start-Process $SiteUrl | Out-Null
Write-Host "Site: a iniciar nesta janela (Ctrl+C para parar o site; feche a outra janela para o bot)" -ForegroundColor DarkGray
Write-Host ""

Set-Location $Root
npm run dev

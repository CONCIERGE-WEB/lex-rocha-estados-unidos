# Motor CourtListener (tribunais EUA) em janela PowerShell visivel.
# Prioriza TCPA + FDCPA nos 5 estados foco, depois ciclo geral.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\iniciar-motor-courtlistener.ps1
# Versao: 2026-07-26-b

$ErrorActionPreference = "Continue"
$Root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { "C:\01_Projetos\04-LexRocha-EUA" }
$Dir = Join-Path $Root "services\courtlistener-ingestor"
$venvPy = Join-Path $Dir ".venv\Scripts\python.exe"
$logDir = Join-Path $Dir "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

try { $host.UI.RawUI.WindowTitle = "Lex Rocha EUA - CourtListener" } catch {}

if (-not (Test-Path $venvPy)) {
    Write-Host "Falta venv. Rode: py -3.12 -m venv services\courtlistener-ingestor\.venv" -ForegroundColor Red
    pause
    exit 1
}

$envLocal = Join-Path $Root ".env.local"
$tokenOk = $false
if (Test-Path $envLocal) {
    $line = Select-String -Path $envLocal -Pattern '^COURTLISTENER_API_TOKEN=' | Select-Object -First 1
    if ($line) {
        $val = ($line.Line -split '=', 2)[1].Trim().Trim([char]34).Trim([char]39)
        $tokenOk = -not [string]::IsNullOrWhiteSpace($val)
    }
}
if (-not $tokenOk) {
    Write-Host "COURTLISTENER_API_TOKEN vazio em .env.local" -ForegroundColor Red
    pause
    exit 1
}

# Evita duas janelas do mesmo motor
$outros = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessId -ne $PID -and
    $_.CommandLine -and
    ($_.CommandLine -like "*iniciar-motor-courtlistener.ps1*")
})
if ($outros.Count -gt 0) {
    Write-Host ("JA em loop PIDs=" + (($outros | ForEach-Object { $_.ProcessId }) -join ",")) -ForegroundColor Yellow
    pause
    exit 0
}

# Encerra instancia anterior oculta (python direto)
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and ($_.CommandLine -match "motor_courtlistener_local")
} | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

Write-Host "=== Lex Rocha EUA - Motor CourtListener ===" -ForegroundColor Cyan
Write-Host "Python: $venvPy"
Write-Host "Pasta:  $Dir"
Write-Host "Modo:   1) prioridade-leve TCPA/FDCPA  2) ciclo all + seed"
Write-Host "Ctrl+C encerra esta janela."
Write-Host ""

Set-Location $Dir
while ($true) {
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] === BOOST TCPA + FDCPA (foco US/CA/NY/TX/FL/IL) ===" -ForegroundColor Yellow
    & $venvPy -u motor_courtlistener_local.py `
        --prioridade-leve `
        --max-pages=3 `
        --no-notify

    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] === CICLO GERAL (all + seed, TCPA/FDCPA ja no topo) ===" -ForegroundColor Cyan
    & $venvPy -u motor_courtlistener_local.py `
        --categoria=all `
        --all-states-seed `
        --max-pages=2 `
        --merge `
        --no-notify

    Write-Host "Aguardando 600s ate o proximo ciclo completo..."
    Start-Sleep -Seconds 600
}

Write-Host ""
Write-Host "Motor encerrou. Pressione Enter para fechar." -ForegroundColor Yellow
pause

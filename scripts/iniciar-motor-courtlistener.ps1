# Sobe o motor CourtListener (tribunais EUA) com token do .env.local.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\iniciar-motor-courtlistener.ps1

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
$Dir = Join-Path $Root "services\courtlistener-ingestor"
$venvPy = Join-Path $Dir ".venv\Scripts\python.exe"
$logDir = Join-Path $Dir "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

if (-not (Test-Path $venvPy)) {
    Write-Host "Falta venv. Rode: py -3.12 -m venv services\courtlistener-ingestor\.venv" -ForegroundColor Red
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
    exit 1
}

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and ($_.CommandLine -match "motor_courtlistener_local")
} | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

$outLog = Join-Path $logDir "motor_courtlistener_loop.out.log"
$errLog = Join-Path $logDir "motor_courtlistener_loop.err.log"
$p = Start-Process -FilePath $venvPy -ArgumentList @(
    "-u", "motor_courtlistener_local.py",
    "--categoria=all",
    "--all-states-seed",
    "--max-pages=2",
    "--no-notify",
    "--loop"
) -WorkingDirectory $Dir -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden

Write-Host "CourtListener motor PID=$($p.Id) (token do .env.local). Log: $outLog" -ForegroundColor Green

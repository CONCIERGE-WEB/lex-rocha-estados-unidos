# First-time local setup — Judicial Intelligence (U.S.)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Copy-IfMissing($src, $dst, $label) {
    if ((Test-Path $src) -and -not (Test-Path $dst)) {
        Copy-Item $src $dst
        Write-Host "Created: $label"
    }
}

Write-Host ""
Write-Host "=== Site (Next.js) ===" -ForegroundColor Cyan
Set-Location "$root\site"
if (-not (Test-Path node_modules)) {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}

Write-Host ""
Write-Host "=== Signal Hub (Python) ===" -ForegroundColor Cyan
Set-Location "$root\signalhub"

$cfg = "$root\signalhub\config\usa"
foreach ($f in @("dorks.yaml", "keywords.yaml", "prompts.yaml")) {
    $example = "$cfg\$f.example"
    if ((Test-Path $example) -and -not (Test-Path "$cfg\$f")) {
        Copy-IfMissing $example "$cfg\$f" "config\usa\$f"
    }
}

$envFile = "$root\signalhub\usa\.env"
$envExample = "$root\signalhub\usa\.env.example"
if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "Created: usa\.env"
}

New-Item -ItemType Directory -Force -Path "$root\signalhub\logs" | Out-Null

$venvPython = "$root\signalhub\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "Creating Python virtual environment..."
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw "python -m venv failed. Install Python 3.11 or higher." }
}
& $venvPython -m pip install -q -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw "pip install failed" }

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Site:"
Write-Host "  cd $root\site"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Bot:"
Write-Host "  cd $root\signalhub"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host "  python usa\bot.py detectar"
Write-Host "  python usa\bot.py teste-live"
Write-Host ""

$sync = Join-Path $root "scripts\sincronizar-env.ps1"
if ((Test-Path "$root\.env.local") -and (Test-Path $sync)) {
    & $sync
}

Set-Location $root

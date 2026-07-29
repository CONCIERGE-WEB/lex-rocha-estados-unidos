# Valida Stripe Checkout local (modo teste) — sem expor secrets.
# Uso (na pasta site/):
#   powershell -ExecutionPolicy Bypass -File ..\scripts\validar-stripe-local.ps1
# Webhook local (outro terminal):
#   stripe listen --forward-to localhost:3010/api/webhooks/stripe
# Depois cole o whsec_... em site/.env.local como STRIPE_WEBHOOK_SECRET

$ErrorActionPreference = "Continue"
$Site = if ($PSScriptRoot) {
  Join-Path (Split-Path -Parent $PSScriptRoot) "site"
} else {
  "C:\01_Projetos\04-LexRocha-EUA\site"
}
Set-Location $Site

$envFile = Join-Path $Site ".env.local"
if (-not (Test-Path $envFile)) {
  Write-Host "Falta site/.env.local" -ForegroundColor Red
  exit 1
}

function Get-EnvVal([string]$key) {
  $line = Select-String -Path $envFile -Pattern "^$key=" | Select-Object -First 1
  if (-not $line) { return "" }
  return ($line.Line -split "=", 2)[1].Trim().Trim([char]34).Trim([char]39)
}

$sk = Get-EnvVal "STRIPE_SECRET_KEY"
$pk = Get-EnvVal "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
$wh = Get-EnvVal "STRIPE_WEBHOOK_SECRET"
$app = Get-EnvVal "NEXT_PUBLIC_APP_URL"

Write-Host "=== Stripe local check ===" -ForegroundColor Cyan
if ($app) {
  Write-Host "APP_URL: $app"
} else {
  Write-Host "APP_URL: vazio (fallback localhost:3010)"
}

if ($sk -match "^sk_test_") {
  Write-Host "STRIPE_SECRET_KEY: sk_test_ OK" -ForegroundColor Green
} elseif ($sk -match "^sk_live_") {
  Write-Host "STRIPE_SECRET_KEY: LIVE - pare. Use sk_test_ para validacao local." -ForegroundColor Red
  exit 1
} else {
  Write-Host "STRIPE_SECRET_KEY ausente ou invalida" -ForegroundColor Red
  exit 1
}

if ($pk -match "^pk_test_") {
  Write-Host "PUBLISHABLE: pk_test_ OK" -ForegroundColor Green
} else {
  Write-Host "PUBLISHABLE: esperado pk_test_..." -ForegroundColor Yellow
}

if ($wh -match "^whsec_") {
  Write-Host "WEBHOOK_SECRET: whsec_ OK" -ForegroundColor Green
} else {
  Write-Host "WEBHOOK_SECRET vazio - rode stripe listen e cole whsec_ no .env.local" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Esteira sugerida DOT / Health Denial:" -ForegroundColor Cyan
Write-Host "  1. npm run dev"
Write-Host "  2. stripe listen --forward-to localhost:3010/api/webhooks/stripe"
Write-Host "  3. Abrir /request?category=dot_flights_baggage"
Write-Host "  4. Cartao teste 4242 4242 4242 4242"
Write-Host "  5. Confirmar /dashboard?session_id=... e fila relatorios_pedido"

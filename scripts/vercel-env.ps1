# Print env var names to paste in Vercel (team-zairyx → judicial-intelligence → Settings → Environment Variables)
# Root Directory must be: site
# Usage: .\scripts\vercel-env.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$master = Join-Path $root ".env.local"

if (-not (Test-Path $master)) {
    Write-Host "Missing .env.local — copy .env.local.example and run .\scripts\sincronizar-env.ps1"
    exit 1
}

$keys = @(
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "GROQ_API_KEY",
    "GROQ_MODEL",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "ADMIN_EMAIL",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "NEXT_PUBLIC_WHATSAPP_NUMBER",
    "NEXT_PUBLIC_WHATSAPP_URL",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "WHATSAPP_VERIFY_TOKEN",
    "PAGAMENTO_WEBHOOK_SECRET",
    "AGENDA_DISPONIVEL",
    "FOCUS_NFE_AUTO"
)

Write-Host ""
Write-Host "=== Vercel env (team-zairyx / judicial-intelligence) ===" -ForegroundColor Cyan
Write-Host "Project: https://vercel.com/team-zairyx/judicial-intelligence" -ForegroundColor DarkGray
Write-Host "Root Directory: site" -ForegroundColor Yellow
Write-Host ""

$vars = @{}
Get-Content $master -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    if ($line -match '^([^=]+)=(.*)$') {
        $vars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

foreach ($k in $keys) {
    $v = $vars[$k]
    if (-not $v) {
        Write-Host "[MISSING] $k" -ForegroundColor Yellow
    } else {
        $masked = if ($v.Length -gt 8) { $v.Substring(0, 4) + "…" + $v.Substring($v.Length - 4) } else { "****" }
        Write-Host "[OK] $k = $masked" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Copy values from .env.local into Vercel dashboard (Production + Preview)." -ForegroundColor Cyan

# Set Vercel Root Directory to "site" for judicial-intelligence (team-zairyx)
#
# 1. Create token: https://vercel.com/account/tokens (team-zairyx scope)
# 2. Run:
#    $env:VERCEL_TOKEN = "your_token"
#    .\scripts\configurar-vercel-root.ps1
#
# Or set manually: Project → Settings → General → Root Directory → site → Save → Redeploy

param(
    [string]$ProjectName = "judicial-intelligence",
    [string]$TeamSlug = "team-zairyx",
    [string]$RootDirectory = "site"
)

$ErrorActionPreference = "Stop"
$token = $env:VERCEL_TOKEN
if (-not $token) {
    Write-Host "Set VERCEL_TOKEN (Vercel account token for team-zairyx)." -ForegroundColor Yellow
    Write-Host "https://vercel.com/account/tokens"
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Fetching team id for $TeamSlug..." -ForegroundColor Cyan
$teams = Invoke-RestMethod -Uri "https://api.vercel.com/v2/teams" -Headers $headers
$team = $teams.teams | Where-Object { $_.slug -eq $TeamSlug -or $_.name -eq $TeamSlug } | Select-Object -First 1
if (-not $team) {
    Write-Host "Team '$TeamSlug' not found. Available:" -ForegroundColor Yellow
    $teams.teams | ForEach-Object { Write-Host "  - $($_.slug) ($($_.name))" }
    exit 1
}

$teamParam = "?teamId=$($team.id)"
Write-Host "Fetching project $ProjectName..." -ForegroundColor Cyan
$project = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$ProjectName$teamParam" -Headers $headers

Write-Host "Current rootDirectory: '$($project.rootDirectory)'" -ForegroundColor DarkGray

$body = @{ rootDirectory = $RootDirectory } | ConvertTo-Json
$updated = Invoke-RestMethod -Method PATCH -Uri "https://api.vercel.com/v9/projects/$($project.id)$teamParam" -Headers $headers -Body $body

Write-Host "OK: rootDirectory = '$($updated.rootDirectory)'" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Vercel dashboard → Deployments → Redeploy (without build cache)." -ForegroundColor Cyan
Write-Host "https://vercel.com/$TeamSlug/$ProjectName/settings/general" -ForegroundColor DarkGray

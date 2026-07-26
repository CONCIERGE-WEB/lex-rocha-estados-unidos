# Migracao selectiva: 000Inteligencia_Resolutiva -> pt-consumidores
# Read-only na origem. So artefactos PT (Direitos do Consumidor).
# Ver docs/PROMPT_MIGRACAO_PHD.md

$ErrorActionPreference = "Stop"
$destino = Split-Path $PSScriptRoot -Parent
$origem = (Get-ChildItem "E:\.projetos" -Directory | Where-Object { $_.Name -like "000Intelig*_Resolutiva" } | Select-Object -First 1).FullName
$relatorio = Join-Path $PSScriptRoot "migracao-pt-relatorio.txt"
$log = [System.Collections.Generic.List[string]]::new()

function Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    $script:log.Add($line)
    Write-Host $line
}

function Copy-IfExists($srcRel, $dstRel, [switch]$Force) {
    $src = Join-Path $origem $srcRel
    $dst = Join-Path $destino $dstRel
    if (-not (Test-Path $src)) {
        Log "SKIP (ausente): $srcRel"
        return
    }
    $dir = Split-Path $dst -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    if ((Test-Path $dst) -and -not $Force) {
        Log "SKIP (ja existe): $dstRel"
        return
    }
    Copy-Item $src $dst -Force
    Log "COPY: $srcRel -> $dstRel"
}

function Merge-EnvKeys($srcFile, $dstFile, [string[]]$Keys, [string[]]$NeverOverwrite) {
    if (-not (Test-Path $srcFile)) {
        Log "SKIP env merge (ausente): $srcFile"
        return
    }
    if (-not (Test-Path $dstFile)) {
        Copy-Item $srcFile $dstFile
        Log "COPY env completo: $dstFile"
        return
    }

    $dstLines = Get-Content $dstFile -Encoding UTF8
    $dstMap = @{}
    foreach ($line in $dstLines) {
        if ($line -match '^([^#=][^=]*)=(.*)$') {
            $dstMap[$Matches[1].Trim()] = $Matches[2].Trim()
        }
    }

    $merged = 0
    foreach ($line in Get-Content $srcFile -Encoding UTF8) {
        if ($line -notmatch '^([^#=][^=]*)=(.*)$') { continue }
        $key = $Matches[1].Trim()
        $val = $Matches[2].Trim()
        if ($Keys -and $Keys -notcontains $key) { continue }
        if ($NeverOverwrite -contains $key) { continue }
        if ($dstMap.ContainsKey($key) -and $dstMap[$key]) { continue }
        if (-not $val) { continue }
        $dstMap[$key] = $val
        $merged++
        Log "MERGE env: $key (preenchido no destino)"
    }

    if ($merged -eq 0) {
        Log "MERGE env: nada novo em $dstFile"
        return
    }

    $out = [System.Collections.Generic.List[string]]::new()
    $seen = @{}
    foreach ($line in $dstLines) {
        if ($line -match '^([^#=][^=]*)=(.*)$') {
            $k = $Matches[1].Trim()
            $seen[$k] = $true
            $out.Add("$k=$($dstMap[$k])")
        } else {
            $out.Add($line)
        }
    }
    foreach ($k in $dstMap.Keys) {
        if (-not $seen.ContainsKey($k)) {
            $out.Add("$k=$($dstMap[$k])")
        }
    }
    $out | Set-Content $dstFile -Encoding UTF8
}

if (-not (Test-Path $origem)) {
    Write-Host "ERRO: Origem nao encontrada: $origem" -ForegroundColor Red
    exit 1
}

Log "=== Migracao PT Consumidores (PhD) ==="
Log "Origem:  $origem"
Log "Destino: $destino"

# FASE 2 — Config confidencial PT
Copy-IfExists "signalhub_v2\config\portugal\keywords.yaml" "signalhub\config\portugal\keywords.yaml" -Force
Copy-IfExists "signalhub_v2\config\portugal\dorks.yaml" "signalhub\config\portugal\dorks.yaml" -Force
Copy-IfExists "signalhub_v2\config\portugal\prompts.yaml" "signalhub\config\portugal\prompts.yaml" -Force
Copy-IfExists "private\prompts\portugal-groq.ip.yaml" "private\prompts\portugal-groq.ip.yaml"

# FASE 4 — Documentacao PT
$docs = @(
    @("DEPLOY_PT.md", "docs\DEPLOY_PT.md"),
    @("DOMINIO_PT.md", "docs\DOMINIO_PT.md"),
    @("AUDITORIA_PT_PT.md", "docs\AUDITORIA_PT_PT.md"),
    @("PLANOS_LEX_PORTUGAL.md", "docs\PLANOS_LEX_PORTUGAL.md"),
    @("CONFIDENCIAL.md", "docs\CONFIDENCIAL.md")
)
foreach ($d in $docs) {
    Copy-IfExists $d[0] $d[1]
}

# Atalhos uteis (opcional)
Copy-IfExists "signalhub_v2\CONECTAR_PORTUGAL.bat" "signalhub\CONECTAR_PORTUGAL.bat"
Copy-IfExists "lex-rocha-pt\COMO_EXECUTAR_PT.md" "site\COMO_EXECUTAR_PT.md"
Copy-IfExists "lex-rocha-pt\lexrocha-us.bat" "site\lexrocha-us.bat"

# FASE 3 — Credenciais (merge chaves vazias; preservar bot novo)
$neverBot = @("TELEGRAM_BOT_TOKEN", "TELEGRAM_BOT_USERNAME")
$supabaseKeys = @(
    "SUPABASE_PROJECT_REF", "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_DB_PASSWORD"
)
$botKeys = @(
    "GROQ_API_KEY", "GROQ_MODEL", "GROQ_REVISAO",
    "TELEGRAM_CHAT_ID", "REDDIT_SUBREDDITS", "REDDIT_LIMIT",
    "SCAN_INTERVAL_SECONDS", "MAX_ALERTAS_POR_HORA"
)

$dstEnv = Join-Path $destino ".env.local"
Merge-EnvKeys (Join-Path $origem "Lex-Rocha\.env.local") $dstEnv $supabaseKeys $neverBot
Merge-EnvKeys (Join-Path $origem "signalhub_v2\portugal\.env") $dstEnv $botKeys $neverBot

# Gerar PAGAMENTO_WEBHOOK_SECRET se vazio
$envLines = Get-Content $dstEnv -Encoding UTF8
$hasSecret = $false
foreach ($line in $envLines) {
    if ($line -match '^PAGAMENTO_WEBHOOK_SECRET=(.+)$' -and $Matches[1].Trim()) { $hasSecret = $true }
}
if (-not $hasSecret) {
    $secret = [guid]::NewGuid().ToString("N")
    Add-Content $dstEnv "PAGAMENTO_WEBHOOK_SECRET=$secret" -Encoding UTF8
    Log "GERADO: PAGAMENTO_WEBHOOK_SECRET"
}

# Sincronizar destinos derivados
$sync = Join-Path $destino "scripts\sincronizar-env.ps1"
if (Test-Path $sync) {
    & $sync
    Log "EXEC: sincronizar-env.ps1"
}

Log "=== Concluido ==="
$log | Set-Content $relatorio -Encoding UTF8
Write-Host ""
Write-Host "Relatorio: scripts\migracao-pt-relatorio.txt" -ForegroundColor Green

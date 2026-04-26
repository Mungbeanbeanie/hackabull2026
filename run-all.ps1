param(
  [int]$BackendPort = 8080,
  [int]$FrontendPort = 3000,
  [switch]$SkipInstall,
  [switch]$NoNewWindow
)

$ErrorActionPreference = "Stop"

function Write-Info([string]$msg) { Write-Host "[run-all] $msg" -ForegroundColor Cyan }
function Write-Warn([string]$msg) { Write-Host "[run-all] $msg" -ForegroundColor Yellow }
function Write-Err([string]$msg) { Write-Host "[run-all] $msg" -ForegroundColor Red }

function Assert-Cmd([string]$name, [string]$installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command '$name'. $installHint"
  }
}

function Import-DotEnv([string]$path) {
  if (-not (Test-Path $path)) {
    Write-Warn "No .env found at $path (continuing)."
    return
  }

  Write-Info "Loading env from $path"
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0) { return }
    if ($line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    [Environment]::SetEnvironmentVariable($key, $val, "Process")
  }
}

function Invoke-IfMissingDeps {
  if ($SkipInstall) { return }

  $frontendNodeModules = Join-Path $PSScriptRoot "frontend\deskApp\node_modules"
  if (-not (Test-Path $frontendNodeModules)) {
    Write-Info "Installing frontend deps (npm install)"
    Push-Location (Join-Path $PSScriptRoot "frontend\deskApp")
    try { npm install } finally { Pop-Location }
  }
}

function Wait-ForHttp([string]$url, [int]$timeoutSec = 45) {
  $deadline = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
      # Treat 2xx/3xx as "up"; 4xx means the service is responding with an error.
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 400) { return $true }
    } catch {
      Start-Sleep -Milliseconds 350
    }
  }
  return $false
}

function Start-Proc([string]$name, [string]$workingDir, [string]$filePath, [string[]]$args) {
  Write-Info "Starting $name"
  if ($NoNewWindow) {
    return Start-Process -FilePath $filePath -ArgumentList $args -WorkingDirectory $workingDir -PassThru -NoNewWindow
  }
  return Start-Process -FilePath $filePath -ArgumentList $args -WorkingDirectory $workingDir -PassThru
}

try {
  Assert-Cmd "node" "Install Node.js 18+ from https://nodejs.org/ (then reopen your terminal)."
  Assert-Cmd "npm" "Install Node.js 18+ from https://nodejs.org/ (includes npm)."
  Assert-Cmd "java" "Install Java 17+ (Temurin recommended) from https://adoptium.net/ and ensure 'java' is on PATH."
  Assert-Cmd "mvn" "Install Maven 3.8+ from https://maven.apache.org/download.cgi and ensure 'mvn' is on PATH."

  Import-DotEnv (Join-Path $PSScriptRoot "backend\java-chassis\.env")
  [Environment]::SetEnvironmentVariable("PORT", "$BackendPort", "Process")

  Invoke-IfMissingDeps

  $backendDir = Join-Path $PSScriptRoot "backend\java-chassis"
  $frontendDir = Join-Path $PSScriptRoot "frontend\deskApp"

  $backend = Start-Proc "backend" $backendDir "mvn" @("exec:java")
  if (-not (Wait-ForHttp "http://localhost:$BackendPort/health" 60)) {
    Write-Warn "Backend did not become healthy at /health within timeout."
  } else {
    Write-Info "Backend healthy on http://localhost:$BackendPort"
  }

  $env:NEXT_PUBLIC_BACKEND_URL = "http://localhost:$BackendPort"
  $frontend = Start-Proc "frontend" $frontendDir "npm" @("run", "dev", "--", "-p", "$FrontendPort")
  if (-not (Wait-ForHttp "http://localhost:$FrontendPort" 60)) {
    Write-Warn "Frontend did not respond within timeout."
  } else {
    Write-Info "Frontend up on http://localhost:$FrontendPort"
  }

  Write-Info "Press Ctrl+C to stop both."

  $cancelled = $false
  $handler = {
    param($sender, $eventArgs)
    $eventArgs.Cancel = $true
    $script:cancelled = $true
  }
  [Console]::CancelKeyPress += $handler
  try {
    while (-not $cancelled) {
      if ($backend.HasExited) { Write-Err "Backend exited (code $($backend.ExitCode))."; break }
      if ($frontend.HasExited) { Write-Err "Frontend exited (code $($frontend.ExitCode))."; break }
      Start-Sleep -Milliseconds 500
    }
  } finally {
    [Console]::CancelKeyPress -= $handler
  }

} catch {
  Write-Err $_.Exception.Message
} finally {
  Write-Info "Stopping processes..."
  if ($frontend -and -not $frontend.HasExited) {
    try { Stop-Process -Id $frontend.Id -Force } catch {}
  }
  if ($backend -and -not $backend.HasExited) {
    try { Stop-Process -Id $backend.Id -Force } catch {}
  }
  Write-Info "Done."
}


# EventFlow – Windows bootstrap script
# Usage: .\scripts\bootstrap-local.ps1
#   Override: $env:TOMCAT_HOME, $env:EVENTFLOW_CONFIG_FILE, $env:SKIP_SEED, $env:SKIP_REDEPLOY

param(
    [string]$TomcatHome       = $(if ($env:TOMCAT_HOME)           { $env:TOMCAT_HOME           } else { "D:\apache-tomcat-10.1.54-windows-x64\apache-tomcat-10.1.54" }),
    [string]$ConfigFile       = $(if ($env:EVENTFLOW_CONFIG_FILE) { $env:EVENTFLOW_CONFIG_FILE } else { "$env:USERPROFILE\.config\eventflow\eventflow.properties" }),
    [switch]$SkipSeed         = ($env:SKIP_SEED -eq "1"),
    [switch]$SkipRedeploy     = ($env:SKIP_REDEPLOY -eq "1")
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

# ── Validate config file ──
if (-not (Test-Path $ConfigFile)) {
    Write-Host "ERROR: Missing external config file: $ConfigFile" -ForegroundColor Red
    Write-Host "Set `$env:EVENTFLOW_CONFIG_FILE or create the file at the above path." -ForegroundColor Yellow
    exit 1
}

# ── Step 1: Seed database ──
if (-not $SkipSeed) {
    Write-Host "`n=== Seeding local database ===" -ForegroundColor Cyan
    & "$RootDir\scripts\seed-local-db.ps1"
    if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
    Write-Host "Skipping database seed (SkipSeed)." -ForegroundColor DarkGray
}

# ── Step 2: Package WAR ──
Write-Host "`n=== Packaging application ===" -ForegroundColor Cyan
Push-Location $RootDir
& .\mvnw.cmd -q -DskipTests package
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Maven build failed." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "WAR ready: $RootDir\target\event-flow.war" -ForegroundColor Green

# ── Step 3: Redeploy to Tomcat ──
if ($SkipRedeploy) {
    Write-Host "Skipping Tomcat redeploy (SkipRedeploy)." -ForegroundColor DarkGray
    exit 0
}

if (-not (Test-Path "$TomcatHome\webapps")) {
    Write-Host "ERROR: Tomcat home not found at $TomcatHome" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Redeploying WAR to Tomcat ===" -ForegroundColor Cyan

# Stop Tomcat if running
$catalinaBat = "$TomcatHome\bin\catalina.bat"
if (Test-Path $catalinaBat) {
    Write-Host "  Stopping Tomcat..." -ForegroundColor Yellow
    & $catalinaBat stop 2>$null
    Start-Sleep -Seconds 3
}

# Clean old deployment
$webappsDir = "$TomcatHome\webapps"
if (Test-Path "$webappsDir\event-flow")     { Remove-Item -Recurse -Force "$webappsDir\event-flow" }
if (Test-Path "$webappsDir\event-flow.war") { Remove-Item -Force "$webappsDir\event-flow.war" }

$workDir = "$TomcatHome\work\Catalina\localhost"
if (Test-Path $workDir) {
    Get-ChildItem $workDir -Filter "event-flow*" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

$tempDir = "$TomcatHome\temp"
if (Test-Path $tempDir) {
    Get-ChildItem $tempDir | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy new WAR
Copy-Item "$RootDir\target\event-flow.war" "$webappsDir\event-flow.war"
Write-Host "  WAR deployed." -ForegroundColor Green

# Set env var and start Tomcat
$env:EVENTFLOW_CONFIG_FILE = $ConfigFile
Write-Host "  Starting Tomcat with EVENTFLOW_CONFIG_FILE=$ConfigFile" -ForegroundColor Yellow
& $catalinaBat start

Write-Host "`n=== Bootstrap complete ===" -ForegroundColor Green
Write-Host "Wait for Tomcat to start, then visit:" -ForegroundColor Cyan
Write-Host "  http://localhost:8080/event-flow/login.jsp" -ForegroundColor White

# EventFlow – Windows database seed script
# Usage: .\scripts\seed-local-db.ps1
#   Override with env vars: $env:MYSQL_BIN, $env:DB_HOST, $env:DB_PORT, $env:DB_NAME, $env:DB_USER, $env:DB_PASSWORD

param(
    [string]$MysqlBin  = $(if ($env:MYSQL_BIN)  { $env:MYSQL_BIN  } else { "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" }),
    [string]$DbHost    = $(if ($env:DB_HOST)     { $env:DB_HOST    } else { "localhost" }),
    [string]$DbPort    = $(if ($env:DB_PORT)     { $env:DB_PORT    } else { "3306" }),
    [string]$DbName    = $(if ($env:DB_NAME)     { $env:DB_NAME    } else { "eventflow" }),
    [string]$DbUser    = $(if ($env:DB_USER)     { $env:DB_USER    } else { "root" }),
    [string]$DbSecret  = $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD} else { "2592" })
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

$SqlFiles = @(
    "$RootDir\src\main\resources\db\migration\V1__create_base_schema.sql",
    "$RootDir\src\main\resources\db\migration\V2__seed_auth_password_hashes.sql",
    "$RootDir\src\main\resources\db\migration\V3__add_task_required_skills.sql",
    "$RootDir\src\main\resources\db\migration\V4__add_student_recommendation_snapshots.sql",
    "$RootDir\src\main\resources\db\seed\V1__seed_preview_data.sql"
)

Write-Host "Seeding EventFlow database '$DbName' on ${DbHost}:${DbPort} as ${DbUser}" -ForegroundColor Cyan

foreach ($sqlFile in $SqlFiles) {
    if (-not (Test-Path $sqlFile)) {
        Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
        exit 1
    }
    $fileName = Split-Path -Leaf $sqlFile
    Write-Host "  Applying $fileName ..." -ForegroundColor Yellow
    & $MysqlBin --host=$DbHost --port=$DbPort --user=$DbUser --password=$DbSecret $DbName -e "source $sqlFile"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to apply $fileName" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Seed completed successfully." -ForegroundColor Green

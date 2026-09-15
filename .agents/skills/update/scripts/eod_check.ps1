# EOD Health & Quality Verification Script (PowerShell)
# DSA Tracker Pro - Pre-Departure Checklist

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 DSA TRACKER PRO - EOD PRE-DEPARTURE VERIFICATION" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Prisma Schema Synchronization Check
Write-Host "`n[1/5] Checking Prisma Schema Synchronization..." -ForegroundColor Yellow
Push-Location $WorkspaceRoot
try {
    npm run check:prisma-sync
    Write-Host "  -> Prisma schemas are 100% synchronized!" -ForegroundColor Green
} catch {
    Write-Host "  -> Prisma Schema Synchronization FAILED!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 2. Typecheck Backend & Frontend
Write-Host "`n[2/5] Running TypeScript Typechecks (Backend & Frontend)..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\backend"
try {
    npx tsc --noEmit
    Write-Host "  -> Backend TypeScript clean (0 errors)!" -ForegroundColor Green
} catch {
    Write-Host "  -> Backend Typecheck FAILED!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Push-Location "$WorkspaceRoot\frontend"
try {
    npx tsc --noEmit
    Write-Host "  -> Frontend TypeScript clean (0 errors)!" -ForegroundColor Green
} catch {
    Write-Host "  -> Frontend Typecheck FAILED!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 3. Backend Tests
Write-Host "`n[3/5] Running Backend Tests..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\backend"
try {
    npm test
    Write-Host "  -> Backend tests PASSED!" -ForegroundColor Green
} catch {
    Write-Host "  -> Backend tests FAILED!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 4. Frontend Tests
Write-Host "`n[4/5] Running Frontend Tests..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\frontend"
try {
    npm test
    Write-Host "  -> Frontend tests PASSED!" -ForegroundColor Green
} catch {
    Write-Host "  -> Frontend tests FAILED!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 5. Git Status Overview
Write-Host "`n[5/5] Checking Git Status..." -ForegroundColor Yellow
Push-Location $WorkspaceRoot
git status -s
Pop-Location

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "✅ ALL EOD PRE-FLIGHT CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
exit 0

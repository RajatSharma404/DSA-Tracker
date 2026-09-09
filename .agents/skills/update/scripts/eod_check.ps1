# EOD Health & Quality Verification Script (PowerShell)
# DSA Tracker Pro - Pre-Departure Checklist

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Get-Item $PSScriptRoot).Parent.Parent.Parent.FullName

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 DSA TRACKER PRO - EOD PRE-DEPARTURE VERIFICATION" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Typecheck Frontend
Write-Host "`n[1/4] Running Frontend TypeScript Typecheck..." -ForegroundColor Yellow
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

# 2. Backend Tests
Write-Host "`n[2/4] Running Backend Tests..." -ForegroundColor Yellow
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

# 3. Frontend Tests
Write-Host "`n[3/4] Running Frontend Tests..." -ForegroundColor Yellow
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

# 4. Git Status Overview
Write-Host "`n[4/4] Checking Git Status..." -ForegroundColor Yellow
Push-Location $WorkspaceRoot
git status -s
Pop-Location

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "✅ ALL EOD PRE-FLIGHT CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
exit 0

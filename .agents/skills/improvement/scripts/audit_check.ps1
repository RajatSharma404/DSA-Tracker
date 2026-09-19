# Project Health & Audit Automation Script
# DSA Tracker Pro - /improvement Protocol

$ErrorActionPreference = "Continue"
$WorkspaceRoot = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path
Push-Location $WorkspaceRoot

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Running Full-Stack Code Audit Helper      " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Prisma Parity
Write-Host "`n[1/5] Checking Prisma Schema Parity..." -ForegroundColor Yellow
$prismaCheck = node -e "const fs=require('fs'); const b=fs.readFileSync('backend/prisma/schema.prisma','utf8'); const f=fs.readFileSync('frontend/prisma/schema.prisma','utf8'); if (b!==f) { process.exit(1); } else { process.exit(0); }"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [PASS] Prisma schemas synchronized." -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Prisma schemas out of sync!" -ForegroundColor Red
}

# 2. Backend TypeScript
Write-Host "`n[2/5] Running Backend TypeScript Typecheck..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\backend"
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [PASS] Backend TypeScript: 0 errors." -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Backend TypeScript errors detected!" -ForegroundColor Red
}
Pop-Location

# 3. Frontend TypeScript
Write-Host "`n[3/5] Running Frontend TypeScript Typecheck..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\frontend"
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [PASS] Frontend TypeScript: 0 errors." -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Frontend TypeScript errors detected!" -ForegroundColor Red
}
Pop-Location

# 4. ESLint Check
Write-Host "`n[4/5] Running Frontend ESLint..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\frontend"
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [PASS] ESLint: Clean pass." -ForegroundColor Green
} else {
    Write-Host "  [WARN] ESLint warnings or errors detected." -ForegroundColor DarkYellow
}
Pop-Location

# 5. Secret Leak Check
Write-Host "`n[5/5] Checking for Leaked Secrets in Git Tracking..." -ForegroundColor Yellow
$gitStatus = git status -s
$leaked = $gitStatus | Select-String -Pattern "\.env$"
if ($leaked) {
    Write-Host "  [ALERT] .env file found in git status!" -ForegroundColor Red
} else {
    Write-Host "  [PASS] No tracked .env files detected." -ForegroundColor Green
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "   Audit Pre-flight Check Complete!          " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Pop-Location

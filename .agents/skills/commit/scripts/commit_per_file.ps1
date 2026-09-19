# Atomic Per-File Commit Script (PowerShell)
# DSA Tracker Pro - /commit Protocol

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path
Push-Location $WorkspaceRoot

$commits = @(
    @{ File = "docker-compose.yml"; Message = "chore(docker): add redis container service and enforce required env variable syntax" },
    @{ File = "backend/package.json"; Message = "chore(backend): update dependencies and security overrides for axios, nodemailer and qs" },
    @{ File = "backend/package-lock.json"; Message = "chore(backend): lock updated dependencies and security override packages" },
    @{ File = "backend/middlewares/auth.ts"; Message = "security(auth): add cache invalidation hook and make login email notification non-blocking" },
    @{ File = "backend/middlewares/rateLimiter.ts"; Message = "security(rate-limit): export aiRateLimiter for Gemini AI endpoints" },
    @{ File = "backend/services/emailService.ts"; Message = "security(email): remove hardcoded email address and use configurable environment variables" },
    @{ File = "backend/services/geminiService.ts"; Message = "security(ai): add prompt sanitization, length limits and instruction injection delimiters" },
    @{ File = "backend/routes/admin.routes.ts"; Message = "security(admin): redact leetcode session tokens from user list and role update endpoints" },
    @{ File = "backend/routes/ai.routes.ts"; Message = "security(ai): attach aiRateLimiter middleware to AI generation endpoints" },
    @{ File = "backend/routes/extension.routes.ts"; Message = "feat(extension): support bearer token auth and prioritize blind index session hash lookup" },
    @{ File = "backend/routes/misc.routes.ts"; Message = "security(export): sanitize CSV cells against formula injection attacks" },
    @{ File = "backend/routes/notes.routes.ts"; Message = "security(notes): enforce maximum length cap on problem notes content" },
    @{ File = "backend/routes/solutions.routes.ts"; Message = "security(solutions): add size limits to user code and explanation payloads" },
    @{ File = "backend/app.ts"; Message = "feat(api): mount general rate limiter and install Express 5 centralized error handling" },
    @{ File = "extension/background.js"; Message = "feat(extension): attach stored bearer token when syncing LeetCode submissions to backend" },
    @{ File = "frontend/package.json"; Message = "chore(frontend): add dompurify dependency and update security lockfile overrides" },
    @{ File = "frontend/package-lock.json"; Message = "chore(frontend): lock dompurify dependency and security patches" },
    @{ File = "frontend/src/lib/sanitize.ts"; Message = "feat(security): add DOMPurify HTML sanitization helper function" },
    @{ File = "frontend/src/app/(dashboard)/problems/[problemId]/page.tsx"; Message = "security(problems): sanitize problem description HTML before rendering" },
    @{ File = "frontend/src/app/(dashboard)/city/[levelId]/page.tsx"; Message = "security(city): sanitize metaverse city description HTML before rendering" },
    @{ File = "frontend/src/app/(dashboard)/challenge/[id]/page.tsx"; Message = "security(challenge): sanitize PvP challenge description HTML before rendering" },
    @{ File = "README.md"; Message = "docs(readme): update test metrics to 305 passing tests across 55 test suites" },
    @{ File = "docs/DAILY_LOG.md"; Message = "docs(log): add 2026-09-15 developer daily log entry detailing security audit remediations" },
    @{ File = ".agents/skills/update/scripts/eod_check.ps1"; Message = "fix(automation): fix workspace root traversal and add prisma check to eod_check.ps1" },
    @{ File = ".agents/skills/update/scripts/eod_check.sh"; Message = "fix(automation): fix workspace root traversal and add prisma check to eod_check.sh" },
    @{ File = ".agents/skills/update/SKILL.md"; Message = "docs(skills): upgrade update skill runbook with 7-stage quality pre-departure checks" },
    @{ File = ".agents/rules/commit-trigger.md"; Message = "feat(rules): add commit-trigger rule for single-word /commit command" },
    @{ File = ".agents/skills/commit/SKILL.md"; Message = "feat(skills): add commit skill for atomic per-file commit and push protocol" },
    @{ File = "AGENTS.md"; Message = "docs(agents): register /commit command in project agent directives" }
)

$currentBranch = (git branch --show-current).Trim()
if (-not $currentBranch) { $currentBranch = "main" }
Write-Host "Active branch: $currentBranch" -ForegroundColor Cyan
Write-Host "Starting atomic per-file commit and push cycle..." -ForegroundColor Cyan

$count = 0
foreach ($item in $commits) {
    $file = $item.File
    $msg = $item.Message

    if (Test-Path $file) {
        $status = git status --porcelain $file
        if ($status) {
            $count++
            Write-Host "[$count] Committing and pushing $file..." -ForegroundColor Yellow
            git add $file
            git commit -m $msg
            git push origin $currentBranch
        } else {
            Write-Host "Skipping $file (no changes detected)." -ForegroundColor DarkGray
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

# Any leftover untracked or modified files
$remaining = git status --porcelain
if ($remaining) {
    Write-Host "`nCommitting and pushing remaining changes individually..." -ForegroundColor Yellow
    $lines = $remaining -split "`n" | Where-Object { $_.Trim().Length -gt 3 }
    foreach ($line in $lines) {
        $relFile = $line.Substring(3).Trim()
        if (Test-Path $relFile) {
            $count++
            Write-Host "[$count] Committing and pushing leftover $relFile..." -ForegroundColor Yellow
            git add $relFile
            git commit -m "chore: update $relFile"
            git push origin $currentBranch
        }
    }
}

# Check that script file itself gets committed if newly created
$scriptPath = ".agents/skills/commit/scripts/commit_per_file.ps1"
$scriptStatus = git status --porcelain $scriptPath
if ($scriptStatus) {
    $count++
    Write-Host "[$count] Committing and pushing script $scriptPath..." -ForegroundColor Yellow
    git add $scriptPath
    git commit -m "feat(skills): add atomic commit PowerShell script helper"
    git push origin $currentBranch
}

Write-Host "`nAll $count files committed and pushed individually!" -ForegroundColor Green
Write-Host "Checking git status..."
git status -s
Pop-Location

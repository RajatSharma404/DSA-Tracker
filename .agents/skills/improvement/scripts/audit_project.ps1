# Automated Project Architecture & Code Improvement Scanner (PowerShell)
# DSA Tracker Pro - Comprehensive Health & Optimization Audit

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = (Resolve-Path "$ScriptDir\..\..\..\..").Path

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 DSA TRACKER PRO - IMPROVEMENT SCANNER (POWERSHELL)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Push-Location $WorkspaceRoot
try {
    node "$ScriptDir\audit_project.mjs"
} finally {
    Pop-Location
}

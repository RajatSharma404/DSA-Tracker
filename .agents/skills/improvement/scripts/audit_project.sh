#!/usr/bin/env bash
# Automated Project Architecture & Code Improvement Scanner (Bash)
# DSA Tracker Pro - Comprehensive Health & Optimization Audit

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo -e "\033[1;36m====================================================\033[0m"
echo -e "\033[1;36m🚀 DSA TRACKER PRO - IMPROVEMENT SCANNER (BASH)\033[0m"
echo -e "\033[1;36m====================================================\033[0m"

cd "$WORKSPACE_ROOT"
node "$SCRIPT_DIR/audit_project.mjs"

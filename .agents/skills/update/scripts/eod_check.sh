#!/usr/bin/env bash
# EOD Health & Quality Verification Script (Bash)
# DSA Tracker Pro - Pre-Departure Checklist

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo -e "\033[1;36m====================================================\033[0m"
echo -e "\033[1;36m🚀 DSA TRACKER PRO - EOD PRE-DEPARTURE VERIFICATION\033[0m"
echo -e "\033[1;36m====================================================\033[0m"

# 1. Typecheck Frontend
echo -e "\n\033[1;33m[1/4] Running Frontend TypeScript Typecheck...\033[0m"
cd "$WORKSPACE_ROOT/frontend"
npx tsc --noEmit
echo -e "\033[1;32m  -> Frontend TypeScript clean (0 errors)!\033[0m"

# 2. Backend Tests
echo -e "\n\033[1;33m[2/4] Running Backend Tests...\033[0m"
cd "$WORKSPACE_ROOT/backend"
npm test
echo -e "\033[1;32m  -> Backend tests PASSED!\033[0m"

# 3. Frontend Tests
echo -e "\n\033[1;33m[3/4] Running Frontend Tests...\033[0m"
cd "$WORKSPACE_ROOT/frontend"
npm test
echo -e "\033[1;32m  -> Frontend tests PASSED!\033[0m"

# 4. Git Status Overview
echo -e "\n\033[1;33m[4/4] Checking Git Status...\033[0m"
cd "$WORKSPACE_ROOT"
git status -s

echo -e "\n\033[1;32m====================================================\033[0m"
echo -e "\033[1;32m✅ ALL EOD PRE-FLIGHT CHECKS PASSED SUCCESSFULLY!\033[0m"
echo -e "\033[1;32m====================================================\033[0m"
exit 0

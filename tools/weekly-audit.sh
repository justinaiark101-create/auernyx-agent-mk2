#!/bin/bash

# Log file path with current date and short SHA
LOG_FILE=logs/audit/weekly-audit_2026-02-19_593a5a2.txt

# Print START header
echo "START of Weekly Audit" | tee -a $LOG_FILE

# Fail-closed if auernyx.js is missing
if [ ! -f dist/clients/cli/auernyx.js ]; then
    echo "Error: dist/clients/cli/auernyx.js is missing. Failing..." | tee -a $LOG_FILE
    exit 1
fi

# Existing steps
python ci_gate.py | tee -a $LOG_FILE
npm run verify | tee -a $LOG_FILE
node dist/clients/cli/auernyx.js memory --reason "weekly audit" --no-daemon | tee -a $LOG_FILE
git log --since "7 days ago" --name-status | tee -a $LOG_FILE

# Print PASS footer
echo "PASS" | tee -a $LOG_FILE

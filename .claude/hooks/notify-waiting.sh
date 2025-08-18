#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Read JSON input from Claude Code
input_json=$(cat)

# Extract message using jq (install with: brew install jq)
message=$(echo "$input_json" | jq -r '.message // ""')
session_id=$(echo "$input_json" | jq -r '.session_id // ""')

# Check if Claude is waiting for input
if [[ "$message" == *"waiting for your input"* ]]; then
    # Send macOS notification using osascript
    osascript -e 'display notification "Claude needs your input" with title "Claude Code" subtitle "Awaiting response" sound name "Ping"'
    
    # Alternative: Use terminal-notifier if installed
    if command -v terminal-notifier >/dev/null 2>&1; then
        terminal-notifier -title "Claude Code" -subtitle "Awaiting Input" \
            -message "Claude is waiting for your response" \
            -sound "default" \
            -activate "com.anthropic.claudedesktop"
    fi
    
    # Log the event
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Input needed - Session: $session_id" >> ~/.claude/notification.log
fi

exit 0
#!/bin/bash

# Configuration
PROJECT_DIR="/Users/vikas/msteamMAGIC"
LOG_FILE="$PROJECT_DIR/scripts/backup/backup.log"

# Add standard paths for Mac (Homebrew, NVM, etc.)
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# If using NVM, try to load it (optional but keeps it robust)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to project directory
cd "$PROJECT_DIR"

echo "------------------------------------------" >> "$LOG_FILE"
echo "📅 Backup started at: $(date)" >> "$LOG_FILE"

# Run the backup script using npm
# Sourcing .env is usually handled by the node script itself, 
# but we ensure node and npm are available.
npm run db:backup >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backup process finished successfully." >> "$LOG_FILE"
else
    echo "❌ Backup process failed. Check the logs above." >> "$LOG_FILE"
fi

echo "🕒 Finished at: $(date)" >> "$LOG_FILE"
echo "------------------------------------------" >> "$LOG_FILE"

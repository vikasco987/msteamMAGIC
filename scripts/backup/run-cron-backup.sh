#!/bin/bash

# Configuration - Auto detect project directory
# This makes it work in production where the path might not be /Users/vikas/
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"
LOG_FILE="$PROJECT_DIR/scripts/backup/backup.log"

# Add standard paths for Mac/Linux (Homebrew, NVM, etc.)
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# If using NVM, try to load it
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to project directory
cd "$PROJECT_DIR"

echo "------------------------------------------" >> "$LOG_FILE"
echo "📅 Backup started at: $(date)" >> "$LOG_FILE"
echo "📂 Project Dir: $PROJECT_DIR" >> "$LOG_FILE"
echo "👤 User: $(whoami)" >> "$LOG_FILE"

# Run the backup script using npm
npm run db:backup >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backup process finished successfully." >> "$LOG_FILE"
else
    echo "❌ Backup process failed. Check the logs above." >> "$LOG_FILE"
fi

echo "🕒 Finished at: $(date)" >> "$LOG_FILE"
echo "------------------------------------------" >> "$LOG_FILE"

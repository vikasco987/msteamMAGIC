#!/bin/bash

# Configuration
PROJECT_DIR="/Users/vikas/msteamMAGIC"
LOG_FILE="$PROJECT_DIR/scripts/backup/backup.log"

# Navigate to project directory
cd "$PROJECT_DIR"

echo "------------------------------------------" >> "$LOG_FILE"
echo "📅 Backup started at: $(date)" >> "$LOG_FILE"

# Check if mongodump is in PATH
if ! command -v mongodump &> /dev/null
then
    echo "❌ ERROR: mongodump could not be found. Please install MongoDB Database Tools." >> "$LOG_FILE"
    exit 1
fi

# Run the backup script
npm run db:backup >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backup process finished successfully." >> "$LOG_FILE"
else
    echo "❌ Backup process failed. Check the logs above." >> "$LOG_FILE"
fi

echo "🕒 Finished at: $(date)" >> "$LOG_FILE"
echo "------------------------------------------" >> "$LOG_FILE"

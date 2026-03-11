const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { exec } = require('child_process');
const fs = require('fs');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { streamingProgress } = require("@aws-sdk/lib-storage");

// Configuration
const MONGODB_URI = process.env.DATABASE_URL;
const S3_BUCKET_NAME = process.env.AWS_S3_BACKUP_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const RESTORE_DIR = path.join(__dirname, 'temp-restore');

// Initialize S3 Client
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

async function runRestore() {
    console.log('🔄 Starting Kravy POS Database Restore Process...');

    if (!MONGODB_URI) {
        console.error('❌ Error: DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    // 1. List backups from S3
    console.log('🔍 Fetching available backups from S3...');
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: 'backups/',
        });

        const response = await s3Client.send(listCommand);
        
        if (!response.Contents || response.Contents.length === 0) {
            console.log('⚠️ No backups found in the bucket.');
            return;
        }

        // Sort by last modified (latest first)
        const backups = response.Contents.sort((a, b) => b.LastModified - a.LastModified);
        const latestBackup = backups[0];

        console.log(`📦 Latest backup found: ${latestBackup.Key} (Modified: ${latestBackup.LastModified})`);

        // 2. Download the backup
        if (!fs.existsSync(RESTORE_DIR)) {
            fs.mkdirSync(RESTORE_DIR, { recursive: true });
        }

        const filename = path.basename(latestBackup.Key);
        const localFilePath = path.join(RESTORE_DIR, filename);

        console.log(`📡 Downloading ${filename}...`);
        
        const getCommand = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: latestBackup.Key,
        });

        const { Body } = await s3Client.send(getCommand);
        const writer = fs.createWriteStream(localFilePath);
        
        // Body is a ReadableStream in Node.js
        await new Promise((resolve, reject) => {
            Body.pipe(writer);
            Body.on('error', reject);
            writer.on('finish', resolve);
        });

        console.log('✅ Download complete.');

        // 3. Run mongorestore
        console.log('🛡️ Restoring database (This will overwrite existing data)...');
        
        // Try to find mongorestore if not in PATH
        let restoreBin = 'mongorestore';
        const commonPaths = ['/usr/local/bin/mongorestore', '/opt/homebrew/bin/mongorestore'];
        for (const p of commonPaths) {
            if (fs.existsSync(p)) {
                restoreBin = p;
                break;
            }
        }

        // Using --drop to clear existing collections before restore
        const restoreCommand = `${restoreBin} --uri="${MONGODB_URI}" --archive="${localFilePath}" --gzip --drop`;

        exec(restoreCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ mongorestore error: ${error.message}`);
                return;
            }
            console.log('✨ Database restored successfully!');
            
            // 4. Cleanup
            fs.unlinkSync(localFilePath);
            console.log('🧹 Local temporary file cleaned up.');
            console.log('🏁 Restore process completed.');
        });

    } catch (err) {
        console.error('❌ Error during restore process:', err);
    }
}

runRestore();

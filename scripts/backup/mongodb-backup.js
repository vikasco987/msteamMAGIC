const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { exec } = require('child_process');
const fs = require('fs');
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.DATABASE_URL;
const S3_BUCKET_NAME = process.env.AWS_S3_BACKUP_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const BACKUP_DIR = path.join(__dirname, 'temp-backups');

// Initialize S3 Client
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

async function runBackup() {
    console.log('🚀 Starting Kravy POS Ultimate Backup...');

    if (!MONGODB_URI) {
        console.error('❌ Error: DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    if (!S3_BUCKET_NAME) {
        console.error('❌ Error: AWS_S3_BACKUP_BUCKET is not defined in .env');
        process.exit(1);
    }

    // 1. Create local temp directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // 2. Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `kravy-pos-backup-${timestamp}.gz`;
    const localFilePath = path.join(BACKUP_DIR, filename);

    // 3. Run mongodump
    // Try to find mongodump if not in PATH
    let mongodumpPath = 'mongodump';
    const commonPaths = ['/usr/local/bin/mongodump', '/opt/homebrew/bin/mongodump'];
    for (const p of commonPaths) {
        if (fs.existsSync(p)) {
            mongodumpPath = p;
            break;
        }
    }

    console.log(`📦 Generating backup: ${filename}...`);

    // Using --archive to create a single compressed file
    const dumpCommand = `${mongodumpPath} --uri="${MONGODB_URI}" --archive="${localFilePath}" --gzip`;

    exec(dumpCommand, async (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ mongodump error: ${error.message}`);
            return;
        }
        
        console.log('✅ Local backup created successfully.');
        console.log(`📤 Uploading to S3 bucket: ${S3_BUCKET_NAME}...`);

        // 4. Upload to S3
        try {
            const fileStream = fs.createReadStream(localFilePath);
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: S3_BUCKET_NAME,
                    Key: `backups/${filename}`,
                    Body: fileStream,
                },
            });

            await upload.done();
            console.log(`✨ Backup uploaded successfully to cloud: ${filename}`);

            // 5. Store Metadata in MongoDB
            try {
                const client = new MongoClient(MONGODB_URI);
                await client.connect();
                const db = client.db(); // Uses the DB name from the URI
                const stats = fs.statSync(localFilePath);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

                await db.collection('Backup').insertOne({
                    fileName: filename,
                    date: new Date(),
                    sizeMB: parseFloat(sizeMB),
                    status: "success",
                    s3Url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/backups/${filename}`,
                    createdAt: new Date()
                });
                console.log('📝 Backup metadata saved to database.');
                await client.close();
            } catch (mongoError) {
                console.error('⚠️ Could not save metadata to database:', mongoError.message);
            }

            // 6. Cleanup local file
            fs.unlinkSync(localFilePath);
            console.log('🧹 Local temporary file cleaned up.');
            
            console.log('🏁 Backup process completed successfully!');
        } catch (uploadError) {
            console.error('❌ S3 Upload Error:', uploadError);
            // Optional: Log failure to DB
            try {
                const client = new MongoClient(MONGODB_URI);
                await client.connect();
                const db = client.db();
                await db.collection('Backup').insertOne({
                    fileName: filename,
                    date: new Date(),
                    sizeMB: 0,
                    status: "failed",
                    error: uploadError.message,
                    createdAt: new Date()
                });
                await client.close();
            } catch (e) {}
        }
    });
}

runBackup();

const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { MongoClient, BSON } = require('mongodb');
const { EJSON } = BSON;

// Configuration
const MONGODB_URI = process.env.DATABASE_URL;
const S3_BUCKET_NAME = process.env.AWS_S3_BACKUP_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const BACKUP_DIR = process.env.NODE_ENV === 'production' 
    ? '/tmp/temp-backups' 
    : path.join(__dirname, 'temp-backups');

// Initialize S3 Client
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

async function runBackup() {
    console.log('🚀 Starting Kravy POS Pure-JS Backup...');

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
    const filename = `kravy-pos-backup-${timestamp}.json.gz`;
    const localFilePath = path.join(BACKUP_DIR, filename);

    console.log(`📦 Generating backup: ${filename}...`);

    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db();

        // 3. Create GZIP stream
        const fileWriter = fs.createWriteStream(localFilePath);
        const gzip = zlib.createGzip();
        gzip.pipe(fileWriter);

        // 4. Fetch all collections and dump as NDJSON
        const collections = await db.listCollections().toArray();
        for (const colInfo of collections) {
            // Optional: Skip system views or purely transient collections if needed
            if (colInfo.name.startsWith('system.')) continue;
            
            console.log(`   - Dumping collection: ${colInfo.name}...`);
            const col = db.collection(colInfo.name);
            const cursor = col.find({});
            
            for await (const doc of cursor) {
                const line = { __collection__: colInfo.name, doc: doc };
                gzip.write(EJSON.stringify(line) + '\n');
            }
        }

        // Close stream cleanly
        await new Promise((resolve, reject) => {
            fileWriter.on('finish', resolve);
            fileWriter.on('error', reject);
            gzip.end();
        });

        console.log('✅ Local JSON archive created successfully.');
        console.log(`📤 Uploading to S3 bucket: ${S3_BUCKET_NAME}...`);

        // 5. Upload to S3
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

        // 6. Store Metadata in MongoDB
        try {
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
        } catch (mongoError) {
            console.error('⚠️ Could not save metadata to database:', mongoError.message);
        }

        // 7. Cleanup local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log('🧹 Local temporary file cleaned up.');
        console.log('🏁 Backup process completed successfully!');

    } catch (error) {
        console.error(`❌ Backup Process Error: ${error.message}`);
        console.error(error);
        if (client) {
             try {
                const db = client.db();
                await db.collection('Backup').insertOne({
                    fileName: filename,
                    date: new Date(),
                    sizeMB: 0,
                    status: "failed",
                    error: error.message,
                    createdAt: new Date()
                });
             } catch(e) {}
        }
        process.exit(1);
    } finally {
        if (client) await client.close();
    }
}

runBackup();

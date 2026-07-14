import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getDb, saveDb } from './db';
import { SystemSettings } from '../types';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Cloudflare R2 credentials
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || '';
const r2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// Initialize S3Client pointing to Cloudflare R2 endpoint
const s3Client = r2AccessKeyId && r2SecretAccessKey && r2Endpoint
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    })
  : null;

// Helper to ensure uploads folder exists for local file fallback
function ensureUploadsDirectory() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export async function getStorageStatus(): Promise<SystemSettings> {
  const db = await getDb();
  return db.settings;
}

export async function setStorageUsage(bytes: number): Promise<SystemSettings> {
  const db = await getDb();
  db.settings.storageUsageBytes = bytes;
  
  // Disable uploads if we exceed 9.5 GB
  const LIMIT_9_5_GB = 9.5 * 1024 * 1024 * 1024;
  db.settings.uploadsDisabled = bytes >= LIMIT_9_5_GB;
  
  await saveDb(db);
  return db.settings;
}

export async function uploadFile(
  file: File
): Promise<{ filename: string; url: string; size: number }> {
  const db = await getDb();
  
  const fileBytes = file.size;
  const currentUsage = db.settings.storageUsageBytes;
  const LIMIT_9_5_GB = 9.5 * 1024 * 1024 * 1024;
  
  // Block if storage has reached limits
  if (currentUsage >= LIMIT_9_5_GB || currentUsage + fileBytes >= LIMIT_9_5_GB) {
    throw new Error('Upload disabled: Cloudflare R2 storage has reached its 9.5 GB limit.');
  }

  // File validation
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF and Image files (JPG, PNG, GIF) are allowed.');
  }

  // Generate randomized filename to avoid collisions and obscure patient identities
  const fileExtension = path.extname(file.name) || '.pdf';
  const randomId = crypto.randomUUID();
  const cleanName = `${randomId}${fileExtension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // --- CASE A: CLOUDFLARE R2 LIVE CLOUD UPLOAD ---
  if (s3Client && r2BucketName && r2PublicUrl) {
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: r2BucketName,
        Key: cleanName,
        Body: buffer,
        ContentType: file.type,
      }));

      // Update storage usage counter in database
      const newUsage = currentUsage + fileBytes;
      db.settings.storageUsageBytes = newUsage;
      db.settings.uploadsDisabled = newUsage >= LIMIT_9_5_GB;
      await saveDb(db);

      const cleanedPublicUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;

      return {
        filename: file.name,
        url: `${cleanedPublicUrl}/${cleanName}`,
        size: fileBytes,
      };
    } catch (err) {
      console.error('Cloudflare R2 upload failed, falling back to local storage:', err);
    }
  }

  // --- CASE B: LOCAL FS FALLBACK ---
  ensureUploadsDirectory();
  const filePath = path.join(UPLOADS_DIR, cleanName);
  fs.writeFileSync(filePath, buffer);

  // Update storage usage counter
  const newUsage = currentUsage + fileBytes;
  db.settings.storageUsageBytes = newUsage;
  db.settings.uploadsDisabled = newUsage >= LIMIT_9_5_GB;
  await saveDb(db);

  return {
    filename: file.name,
    url: `/uploads/${cleanName}`,
    size: fileBytes,
  };
}

export async function deleteFile(cleanName: string, sizeBytes: number): Promise<void> {
  // Extract file key if the full URL is passed
  const fileKey = cleanName.includes('/') ? cleanName.split('/').pop() || cleanName : cleanName;

  // --- CASE A: CLOUDFLARE R2 LIVE DELETION ---
  if (s3Client && r2BucketName) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: fileKey,
      }));
    } catch (err) {
      console.error(`Failed to delete object from Cloudflare R2 bucket: ${fileKey}`, err);
    }
  } else {
    // --- CASE B: LOCAL FS FALLBACK DELETION ---
    const filePath = path.join(UPLOADS_DIR, fileKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete physical file: ${filePath}`, err);
      }
    }
  }

  // Re-adjust storage count in database
  const db = await getDb();
  const newUsage = Math.max(0, db.settings.storageUsageBytes - sizeBytes);
  db.settings.storageUsageBytes = newUsage;
  
  const LIMIT_9_5_GB = 9.5 * 1024 * 1024 * 1024;
  db.settings.uploadsDisabled = newUsage >= LIMIT_9_5_GB;
  await saveDb(db);
}

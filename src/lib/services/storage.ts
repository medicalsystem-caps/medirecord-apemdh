import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getDb, saveDb, supabase } from './db';
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

// Dynamically calculate actual storage usage in bytes (R2 cloud or local filesystem)
export async function calculateActualStorageUsage(): Promise<number> {
  // --- CASE A: CLOUDFLARE R2 ---
  if (s3Client && r2BucketName) {
    try {
      let totalSize = 0;
      let isTruncated = true;
      let continuationToken: string | undefined = undefined;

      while (isTruncated) {
        const response: any = await s3Client.send(new ListObjectsV2Command({
          Bucket: r2BucketName,
          ContinuationToken: continuationToken,
        }));

        if (response.Contents) {
          for (const item of response.Contents) {
            totalSize += item.Size || 0;
          }
        }

        isTruncated = !!response.IsTruncated;
        continuationToken = response.NextContinuationToken;
      }
      return totalSize;
    } catch (err) {
      console.error('Failed to list objects in Cloudflare R2 bucket:', err);
    }
  }

  // --- CASE B: LOCAL FS FALLBACK ---
  try {
    ensureUploadsDirectory();
    const files = fs.readdirSync(UPLOADS_DIR);
    let totalSize = 0;
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    return totalSize;
  } catch (err) {
    console.error('Failed to calculate local folder storage size:', err);
    return 0;
  }
}

// Fetch the list of actual files (R2 cloud or local filesystem)
export async function getStorageFiles(): Promise<{ name: string; size: number; mimeType: string; uploadedAt: string; url: string }[]> {
  // --- CASE A: CLOUDFLARE R2 ---
  if (s3Client && r2BucketName) {
    try {
      const response = await s3Client.send(new ListObjectsV2Command({
        Bucket: r2BucketName,
      }));

      if (!response.Contents) return [];

      const cleanedPublicUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;

      return response.Contents.map((item) => {
        const key = item.Key || 'unknown_file';
        return {
          name: key,
          size: item.Size || 0,
          mimeType: key.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          uploadedAt: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
          url: `${cleanedPublicUrl}/${key}`,
        };
      });
    } catch (err) {
      console.error('Failed to list R2 files:', err);
    }
  }

  // --- CASE B: LOCAL FS FALLBACK ---
  try {
    ensureUploadsDirectory();
    const files = fs.readdirSync(UPLOADS_DIR);
    return files.map((file) => {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        mimeType: file.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        uploadedAt: stats.mtime.toISOString(),
        url: `/uploads/${file}`,
      };
    });
  } catch (err) {
    console.error('Failed to read local files list:', err);
    return [];
  }
}

export async function getStorageStatus(): Promise<SystemSettings> {
  const actualUsageBytes = await calculateActualStorageUsage();
  const db = await getDb();
  
  db.settings.storageUsageBytes = actualUsageBytes;
  
  // Disable uploads if we exceed 9.5 GB
  const LIMIT_9_5_GB = 9.5 * 1024 * 1024 * 1024;
  db.settings.uploadsDisabled = actualUsageBytes >= LIMIT_9_5_GB;
  
  await saveDb(db);
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
  const actualUsage = await calculateActualStorageUsage();
  const fileBytes = file.size;
  const LIMIT_9_5_GB = 9.5 * 1024 * 1024 * 1024;
  
  // Block if storage has reached limits
  if (actualUsage >= LIMIT_9_5_GB || actualUsage + fileBytes >= LIMIT_9_5_GB) {
    throw new Error('Upload disabled: Cloudflare R2 storage has reached its 9.5 GB limit.');
  }

  // File validation
  const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File is too large. Maximum allowed size is 4.5 MB. (Provided: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  }

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

      const cleanedPublicUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;

      // Update storage status cache
      await getStorageStatus();

      return {
        filename: file.name,
        url: `${cleanedPublicUrl}/${cleanName}`,
        size: fileBytes,
      };
    } catch (err) {
      console.error('Cloudflare R2 upload failed, falling back to other storage options:', err);
    }
  }

  // --- CASE B: SUPABASE STORAGE CLOUD UPLOAD FALLBACK (For Vercel persistence if R2 fails or is unset) ---
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from('documents').upload(cleanName, buffer, {
        contentType: file.type,
        upsert: true,
      });

      if (!error) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(cleanName);

        if (urlData?.publicUrl) {
          // Update storage status cache
          await getStorageStatus();

          return {
            filename: file.name,
            url: urlData.publicUrl,
            size: fileBytes,
          };
        }
      } else {
        console.error('Supabase storage upload error:', error);
      }
    } catch (err) {
      console.error('Supabase storage upload fallback failed:', err);
    }
  }

  // --- CASE C: LOCAL FS FALLBACK ---
  ensureUploadsDirectory();
  const filePath = path.join(UPLOADS_DIR, cleanName);
  fs.writeFileSync(filePath, buffer);

  // Update storage status cache
  await getStorageStatus();

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
  }

  // --- CASE B: SUPABASE STORAGE CLOUD FALLBACK DELETION ---
  if (supabase) {
    try {
      await supabase.storage.from('documents').remove([fileKey]);
    } catch (err) {
      console.error(`Failed to delete object from Supabase Storage: ${fileKey}`, err);
    }
  }

  // --- CASE C: LOCAL FS FALLBACK DELETION ---
  const filePath = path.join(UPLOADS_DIR, fileKey);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to delete physical file: ${filePath}`, err);
    }
  }

  // Update storage status cache
  await getStorageStatus();
}

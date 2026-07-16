import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb, saveDb, supabase } from './db';
import { SystemSettings } from '../types';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper to ensure uploads folder exists for local file fallback
function ensureUploadsDirectory() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Dynamically calculate actual storage usage in bytes from Supabase storage or local fallback
export async function calculateActualStorageUsage(): Promise<number> {
  // Try Supabase Storage first
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from('documents').list('', {
        limit: 1000,
      });

      if (data && !error) {
        return data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
      }
    } catch (err) {
      console.error('Failed to calculate Supabase storage size:', err);
    }
  }

  // Local FS fallback
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

// Fetch the list of actual files from Supabase storage or local fallback
export async function getStorageFiles(): Promise<{ name: string; size: number; mimeType: string; uploadedAt: string; url: string }[]> {
  const supabaseClient = supabase;
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage.from('documents').list('', {
        limit: 1000,
      });

      if (data && !error) {
        return data.map((item) => {
          const { data: urlData } = supabaseClient.storage.from('documents').getPublicUrl(item.name);
          return {
            name: item.name,
            size: item.metadata?.size || 0,
            mimeType: item.metadata?.mimetype || (item.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
            uploadedAt: item.created_at || new Date().toISOString(),
            url: urlData?.publicUrl || '',
          };
        });
      }
    } catch (err) {
      console.error('Failed to list Supabase files:', err);
    }
  }

  // Local FS fallback
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
    throw new Error('Upload disabled: Supabase storage has reached its 9.5 GB limit.');
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

  // --- CASE A: SUPABASE CLOUD UPLOAD ---
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
      console.error('Supabase storage upload failed:', err);
    }
  }

  // --- CASE B: LOCAL FS FALLBACK ---
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
  const fileKey = cleanName.includes('/') ? cleanName.split('/').pop() || cleanName : cleanName;

  // --- CASE A: SUPABASE DELETION ---
  if (supabase) {
    try {
      await supabase.storage.from('documents').remove([fileKey]);
    } catch (err) {
      console.error(`Failed to delete object from Supabase Storage: ${fileKey}`, err);
    }
  }

  // --- CASE B: LOCAL FS FALLBACK DELETION ---
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

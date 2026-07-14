'use server';

import { getStorageStatus, setStorageUsage } from '@/lib/services/storage';
import { getDb, saveDb } from '@/lib/services/db';
import { SystemSettings } from '@/lib/types';
import { getCurrentUser } from '@/lib/services/auth';
import { logAuditEvent } from '@/lib/services/auth';

export async function getStorageStatusAction(): Promise<SystemSettings> {
  return await getStorageStatus();
}

export async function setStorageUsageAction(bytes: number): Promise<SystemSettings> {
  const adminUser = await getCurrentUser();
  if (!adminUser || adminUser.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  
  const status = await setStorageUsage(bytes);
  
  // Convert bytes to GB for readable description
  const gbUsed = (bytes / (1024 * 1024 * 1024)).toFixed(2);
  await logAuditEvent(
    adminUser.id,
    adminUser.email,
    adminUser.role,
    'USER_EDIT',
    `Simulated R2 storage usage updated to ${gbUsed} GB`
  );
  
  return status;
}

export async function getR2FilesAction(): Promise<{ name: string; size: number; mimeType: string; uploadedAt: string }[]> {
  const db = await getDb();
  // Generate random list of files for monitoring dashboard based on records
  const files: { name: string; size: number; mimeType: string; uploadedAt: string }[] = [];
  
  db.birth_records.forEach(r => {
    r.supportingDocuments.forEach(doc => {
      files.push({
        name: doc,
        size: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
        mimeType: doc.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        uploadedAt: r.createdAt
      });
    });
  });

  db.death_records.forEach(r => {
    r.supportingDocuments.forEach(doc => {
      files.push({
        name: doc,
        size: Math.floor(Math.random() * 2000000) + 500000,
        mimeType: doc.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        uploadedAt: r.createdAt
      });
    });
  });

  return files;
}

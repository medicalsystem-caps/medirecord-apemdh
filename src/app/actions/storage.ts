'use server';

import { getStorageStatus, setStorageUsage, getStorageFiles } from '@/lib/services/storage';
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

export async function getR2FilesAction(): Promise<{ name: string; size: number; mimeType: string; uploadedAt: string; url: string }[]> {
  return await getStorageFiles();
}

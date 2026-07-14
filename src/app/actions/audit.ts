'use server';

import { getDb } from '@/lib/services/db';
import { getCurrentUser } from '@/lib/services/auth';
import { AuditLog } from '@/lib/types';

export async function getAuditLogsAction(
  search?: string,
  actionFilter?: string
): Promise<AuditLog[]> {
  const adminUser = await getCurrentUser();
  if (!adminUser || adminUser.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const db = await getDb();
  let logs = db.audit_logs;

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (log) =>
        log.userEmail.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
    );
  }

  // Action filter
  if (actionFilter && actionFilter !== 'ALL') {
    logs = logs.filter((log) => log.action === actionFilter);
  }

  return logs;
}

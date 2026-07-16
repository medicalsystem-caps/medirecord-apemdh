'use server';

import { getDb } from '@/lib/services/db';
import { getCurrentUser } from '@/lib/services/auth';
import { getStorageStatus } from '@/lib/services/storage';

export async function getDashboardStatsAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const db = await getDb();
  const births = db.birth_records;
  const deaths = db.death_records;
  const auditLogs = db.audit_logs;

  // Counts
  const totalBirths = births.length;
  const totalDeaths = deaths.length;
  
  const pendingBirths = births.filter(
    (b) => b.status !== 'SUBMITTED_LCR' && b.status !== 'ARCHIVED'
  ).length;
  const pendingDeaths = deaths.filter(
    (d) => d.status !== 'SUBMITTED_LCR' && d.status !== 'ARCHIVED'
  ).length;
  const totalPending = pendingBirths + pendingDeaths;

  const approvedBirths = births.filter(
    (b) => b.status === 'SUBMITTED_LCR' || b.status === 'ARCHIVED'
  ).length;
  const approvedDeaths = deaths.filter(
    (d) => d.status === 'SUBMITTED_LCR' || d.status === 'ARCHIVED'
  ).length;
  const totalApproved = approvedBirths + approvedDeaths;

  const archivedBirths = births.filter((b) => b.status === 'ARCHIVED').length;
  const archivedDeaths = deaths.filter((d) => d.status === 'ARCHIVED').length;
  const totalArchived = archivedBirths + archivedDeaths;

  // Recent activity (last 7 logs)
  const recentActivities = auditLogs.slice(0, 7).map((log) => ({
    id: log.id,
    userEmail: log.userEmail,
    userRole: log.userRole,
    action: log.action,
    description: log.description,
    timestamp: log.timestamp,
  }));

  // Monthly statistics compilation (e.g. for January to December 2026)
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const monthlyData = months.map((month, index) => {
    const monthNum = index + 2; // Feb is 2, Jul is 7
    const birthCount = births.filter(b => {
      const date = new Date(b.createdAt);
      return date.getMonth() + 1 === monthNum && date.getFullYear() === 2026;
    }).length;

    const deathCount = deaths.filter(d => {
      const date = new Date(d.createdAt);
      return date.getMonth() + 1 === monthNum && date.getFullYear() === 2026;
    }).length;

    return {
      name: month,
      Births: birthCount,
      Deaths: deathCount,
    };
  });

  const storageSettings = await getStorageStatus();

  return {
    stats: {
      totalBirths,
      totalDeaths,
      totalPending,
      totalApproved,
      totalArchived,
    },
    monthlyData,
    recentActivities,
    storage: storageSettings,
  };
}

export async function getNavbarNotificationsAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const db = await getDb();
  const notifications: { id: string; type: 'warning' | 'info' | 'danger'; message: string; link: string }[] = [];

  // 1. Storage Capacity Alerts
  const actualUsage = db.settings.storageUsageBytes;
  const maxBytes = db.settings.maxStorageBytes;
  const percentage = (actualUsage / maxBytes) * 100;
  if (percentage >= 95) {
    notifications.push({
      id: 'notif_storage_limit',
      type: 'danger',
      message: `Uploads disabled: Supabase cloud storage is full (${percentage.toFixed(1)}%).`,
      link: '/dashboard/storage',
    });
  } else if (percentage >= 90) {
    notifications.push({
      id: 'notif_storage_severe',
      type: 'warning',
      message: `Severe warning: Supabase cloud storage is at ${percentage.toFixed(1)}%.`,
      link: '/dashboard/storage',
    });
  } else if (percentage >= 80) {
    notifications.push({
      id: 'notif_storage_high',
      type: 'info',
      message: `Warning: Supabase cloud storage is at ${percentage.toFixed(1)}%.`,
      link: '/dashboard/storage',
    });
  }

  // 2. Duplicate Records Alerts
  const duplicateBirths = db.birth_records.filter(r => r.duplicateStatus === 'POTENTIAL_DUPLICATE');
  const duplicateDeaths = db.death_records.filter(r => r.duplicateStatus === 'POTENTIAL_DUPLICATE');
  
  duplicateBirths.forEach(b => {
    notifications.push({
      id: `notif_dup_birth_${b.id}`,
      type: 'danger',
      message: `Potential duplicate birth record: ${b.childName} (Cert #${b.certificateNumber})`,
      link: `/dashboard/birth?search=${encodeURIComponent(b.certificateNumber)}`,
    });
  });

  duplicateDeaths.forEach(d => {
    notifications.push({
      id: `notif_dup_death_${d.id}`,
      type: 'danger',
      message: `Potential duplicate death record: ${d.deceasedName} (Cert #${d.certificateNumber})`,
      link: `/dashboard/death?search=${encodeURIComponent(d.certificateNumber)}`,
    });
  });

  // 3. User Specific Pending Action Alerts
  if (currentUser.role === 'PHYSICIAN') {
    const pendingCertBirths = db.birth_records.filter(r => r.status === 'PENDING_CERTIFICATION').length;
    const pendingCertDeaths = db.death_records.filter(r => r.status === 'PENDING_CERTIFICATION').length;
    
    if (pendingCertBirths > 0) {
      notifications.push({
        id: 'notif_phys_birth',
        type: 'info',
        message: `You have ${pendingCertBirths} birth records awaiting medical certification.`,
        link: '/dashboard/birth?status=PENDING_CERTIFICATION',
      });
    }
    if (pendingCertDeaths > 0) {
      notifications.push({
        id: 'notif_phys_death',
        type: 'info',
        message: `You have ${pendingCertDeaths} death records awaiting medical certification.`,
        link: '/dashboard/death?status=PENDING_CERTIFICATION',
      });
    }
  } else if (currentUser.role === 'MRO') {
    const pendingVerifyBirths = db.birth_records.filter(r => r.status === 'PENDING_VERIFICATION').length;
    const pendingVerifyDeaths = db.death_records.filter(r => r.status === 'PENDING_VERIFICATION').length;

    if (pendingVerifyBirths > 0) {
      notifications.push({
        id: 'notif_mro_birth',
        type: 'info',
        message: `You have ${pendingVerifyBirths} birth records awaiting document verification.`,
        link: '/dashboard/birth?status=PENDING_VERIFICATION',
      });
    }
    if (pendingVerifyDeaths > 0) {
      notifications.push({
        id: 'notif_mro_death',
        type: 'info',
        message: `You have ${pendingVerifyDeaths} death records awaiting document verification.`,
        link: '/dashboard/death?status=PENDING_VERIFICATION',
      });
    }
  } else if (currentUser.role === 'CRO') {
    const pendingApproveBirths = db.birth_records.filter(r => r.status === 'PENDING_APPROVAL').length;
    const pendingApproveDeaths = db.death_records.filter(r => r.status === 'PENDING_APPROVAL').length;

    if (pendingApproveBirths > 0) {
      notifications.push({
        id: 'notif_cro_birth',
        type: 'info',
        message: `You have ${pendingApproveBirths} birth records awaiting registry approval.`,
        link: '/dashboard/birth?status=PENDING_APPROVAL',
      });
    }
    if (pendingApproveDeaths > 0) {
      notifications.push({
        id: 'notif_cro_death',
        type: 'info',
        message: `You have ${pendingApproveDeaths} death records awaiting registry approval.`,
        link: '/dashboard/death?status=PENDING_APPROVAL',
      });
    }
  } else if (currentUser.role === 'LCR') {
    const pendingLCRBirths = db.birth_records.filter(r => r.status === 'SUBMITTED_LCR').length;
    const pendingLCRDeaths = db.death_records.filter(r => r.status === 'SUBMITTED_LCR').length;

    if (pendingLCRBirths > 0) {
      notifications.push({
        id: 'notif_lcr_birth',
        type: 'info',
        message: `You have ${pendingLCRBirths} birth records awaiting final LCR submission.`,
        link: '/dashboard/birth?status=SUBMITTED_LCR',
      });
    }
    if (pendingLCRDeaths > 0) {
      notifications.push({
        id: 'notif_lcr_death',
        type: 'info',
        message: `You have ${pendingLCRDeaths} death records awaiting final LCR submission.`,
        link: '/dashboard/death?status=SUBMITTED_LCR',
      });
    }
  }

  return notifications;
}

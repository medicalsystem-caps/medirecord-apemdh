export type UserRole = 'ADMIN' | 'MRO' | 'PHYSICIAN' | 'CRO' | 'LCR';

export type UserStatus = 'ACTIVE' | 'DEACTIVATED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword?: boolean;
  createdAt: string;
}

export type RecordStatus =
  | 'DRAFT'
  | 'PENDING_CERTIFICATION'
  | 'PENDING_VERIFICATION'
  | 'PENDING_APPROVAL'
  | 'SUBMITTED_LCR'
  | 'ARCHIVED';

export interface BirthRecord {
  id: string;
  certificateNumber: string;
  childName: string;
  childGender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  birthTime: string;
  placeOfBirth: string;
  motherName: string;
  fatherName: string;
  status: RecordStatus;
  certifiedBy?: string; // Physician name/ID
  certifiedAt?: string;
  verifiedBy?: string; // MRO name/ID
  verifiedAt?: string;
  approvedBy?: string; // CRO name/ID
  approvedAt?: string;
  submittedBy?: string; // LCR name/ID
  submittedAt?: string;
  archivedAt?: string;
  supportingDocuments: string[]; // filenames/URLs
  duplicateStatus: 'UNIQUE' | 'POTENTIAL_DUPLICATE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeathRecord {
  id: string;
  certificateNumber: string;
  deceasedName: string;
  deceasedAge: number;
  deceasedGender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfDeath: string;
  placeOfDeath: string;
  causeOfDeath: string;
  icd10Code: string;
  status: RecordStatus;
  certifiedBy?: string;
  certifiedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedBy?: string;
  submittedAt?: string;
  archivedAt?: string;
  supportingDocuments: string[];
  duplicateStatus: 'UNIQUE' | 'POTENTIAL_DUPLICATE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'RECORD_CREATE'
    | 'RECORD_UPDATE'
    | 'RECORD_CERTIFY'
    | 'RECORD_VERIFY'
    | 'RECORD_APPROVE'
    | 'RECORD_SUBMIT'
    | 'RECORD_ARCHIVE'
    | 'FILE_UPLOAD'
    | 'FILE_DOWNLOAD'
    | 'PASSWORD_CHANGE'
    | 'USER_CREATE'
    | 'USER_EDIT'
    | 'USER_STATUS_CHANGE'
    | 'PASSWORD_RESET';
  description: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  storageUsageBytes: number; // Cloudflare R2 usage mock
  maxStorageBytes: number;   // 10 GB limit (10 * 1024 * 1024 * 1024)
  uploadsDisabled: boolean;
}

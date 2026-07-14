<div align="center">

# 🏥 MediRecord

### Civil Registry Document Management System

**Alfonso Ponce Enrile Memorial District Hospital (APEMDH)**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?logo=cloudflare)](https://www.cloudflare.com/developer-platform/r2/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Academic-blue)]()

---

A secure, web-based document management system designed to digitize, track, and manage civil registry records (birth & death certificates) at APEMDH. Built with role-based access control, a multi-stage approval workflow, immutable audit logging, and cloud document storage.

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [User Roles & Permissions](#-user-roles--permissions)
- [Document Workflow](#-document-workflow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Database Setup (Supabase)](#-database-setup-supabase)
- [Cloudflare R2 Setup](#-cloudflare-r2-storage-setup)
- [Running the Application](#-running-the-application)
- [Default Test Accounts](#-default-test-accounts)
- [Testing Guide](#-testing-guide)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

| Category | Feature |
|---|---|
| **Registry Management** | Create, view, search, and manage birth & death certificate records |
| **Multi-Stage Workflow** | Records progress through: Draft → Certification → Verification → Approval → Submission → Archive |
| **Role-Based Access** | 5 distinct user roles with granular permission enforcement (ADMIN, MRO, PHYSICIAN, CRO, LCR) |
| **Immutable Audit Trail** | Every action is permanently logged — logins, record changes, file uploads, password resets |
| **Cloud File Storage** | Supporting documents (scanned certificates, photos) stored on Cloudflare R2 with 10 GB capacity |
| **Dashboard Analytics** | Real-time stats, monthly registration charts, storage gauge, and recent activity feed |
| **Report Generation** | Export filtered registry data to PDF and Excel/CSV spreadsheets |
| **Duplicate Detection** | Automatic flagging of potential duplicate records |
| **User Management** | Admin panel for creating accounts, resetting passwords, activating/deactivating users |
| **Forced Password Change** | New users must change their temporary password on first login |
| **Notifications** | Real-time in-app notification bell for pending actions and system alerts |
| **Mobile Responsive** | Full mobile-first responsive design — tables transform into stacked cards on small screens |
| **Session Security** | Cookie-based session with middleware-enforced route protection, TLS 1.3, Supabase RLS |

---

## 🏗 System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                    │
│  Next.js App Router · React 19 · TailwindCSS v4 · Recharts│
└────────────────────────┬───────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼───────────────────────────────────┐
│                  NEXT.JS SERVER (Vercel)                    │
│  Middleware (Auth Guard) · Server Actions · API Routes      │
├────────────────────────┬──────────────────┬────────────────┤
│                        │                  │                │
│    ┌───────────────────▼──┐   ┌──────────▼──────────┐     │
│    │   Supabase (PostgreSQL)│   │  Cloudflare R2     │     │
│    │   • users             │   │  (Object Storage)   │     │
│    │   • birth_records     │   │  • Scanned PDFs     │     │
│    │   • death_records     │   │  • Certificate imgs  │     │
│    │   • audit_logs        │   │  • Supporting docs   │     │
│    │   • settings          │   │  • 10 GB capacity    │     │
│    └───────────────────────┘   └─────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

| Role | Code | Description | Permissions |
|------|------|-------------|-------------|
| **Administrator** | `ADMIN` | System administrator | Full access: user management, audit logs, storage, all records |
| **Medical Records Officer** | `MRO` | Records & encoding officer | Create records, upload documents, verify certified records |
| **Physician** | `PHYSICIAN` | Attending/certifying doctor | Certify birth/death records with medical authority |
| **Civil Registrar Officer** | `CRO` | Municipal civil registrar | Approve verified records for local submission |
| **Local Civil Registrar** | `LCR` | Final submission authority | Submit approved records and archive finalized entries |

### Access Control Matrix

| Page / Feature | ADMIN | MRO | PHYSICIAN | CRO | LCR |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Birth Records | ✅ | ✅ | ✅ | ✅ | ✅ |
| Death Records | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Records | ✅ | ✅ | ❌ | ❌ | ❌ |
| Certify Records | ❌ | ❌ | ✅ | ❌ | ❌ |
| Verify Records | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Records | ❌ | ❌ | ❌ | ✅ | ❌ |
| Submit to LCR | ❌ | ❌ | ❌ | ❌ | ✅ |
| Archive Records | ❌ | ❌ | ❌ | ❌ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Storage Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports & Export | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile / Password | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📋 Document Workflow

The system enforces a strict, multi-stage approval pipeline for every birth/death certificate:

```
  ┌──────────┐    ┌────────────────────┐    ┌──────────────────────┐
  │  DRAFT   │───▶│ PENDING_CERTIFICATION│───▶│ PENDING_VERIFICATION │
  │ (MRO/Admin│    │    (PHYSICIAN)       │    │      (MRO)           │
  │  creates) │    │  Certifies record    │    │  Verifies accuracy   │
  └──────────┘    └────────────────────┘    └──────────┬───────────┘
                                                       │
  ┌──────────┐    ┌────────────────────┐    ┌──────────▼───────────┐
  │ ARCHIVED │◀───│  SUBMITTED_LCR     │◀───│  PENDING_APPROVAL    │
  │  (LCR    │    │    (LCR)           │    │      (CRO)           │
  │ archives)│    │ Submits to registry│    │  Approves for submit │
  └──────────┘    └────────────────────┘    └──────────────────────┘
```

**Each stage transition is:**
- Restricted to the authorized role only
- Permanently recorded in the immutable audit log
- Timestamped with the approving officer's identity

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Full-stack React framework with server actions |
| **UI Library** | [React 19](https://react.dev/) | Component rendering engine |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Smooth page transitions and micro-interactions |
| **Charts** | [Recharts](https://recharts.org/) | Dashboard analytics visualizations |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) | Cloud-hosted relational database with RLS |
| **File Storage** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) | S3-compatible object storage for documents |
| **Auth** | Custom cookie-based sessions | SHA-256 hashed passwords + middleware guards |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form state management & validation |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent SVG icon library |
| **Toasts** | [Sonner](https://sonner.emilkowal.dev/) | Toast notification system |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Generate PDF reports |
| **Excel Export** | [SheetJS (xlsx)](https://sheetjs.com/) | Generate Excel/CSV spreadsheets |
| **Deployment** | [Vercel](https://vercel.com/) | Serverless edge deployment |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Static type safety |

---

## 📁 Project Structure

```
medirecord/
├── public/
│   └── logo.png                    # Application logo (favicon + branding)
├── src/
│   ├── app/
│   │   ├── actions/                # Server Actions (business logic)
│   │   │   ├── auth.ts             # Login, logout, password change
│   │   │   ├── birth.ts            # Birth record CRUD & workflow
│   │   │   ├── dashboard.ts        # Dashboard statistics aggregation
│   │   │   ├── death.ts            # Death record CRUD & workflow
│   │   │   ├── storage.ts          # R2 storage status & file operations
│   │   │   └── users.ts            # User management (admin only)
│   │   ├── change-password/
│   │   │   └── page.tsx            # Forced password change screen
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard shell (sidebar + navbar)
│   │   │   ├── page.tsx            # Main dashboard (stats, charts, activity)
│   │   │   ├── audit/page.tsx      # System audit trail (admin only)
│   │   │   ├── birth/
│   │   │   │   ├── page.tsx        # Birth records listing
│   │   │   │   └── new/page.tsx    # Create new birth record form
│   │   │   ├── death/
│   │   │   │   ├── page.tsx        # Death records listing
│   │   │   │   └── new/page.tsx    # Create new death record form
│   │   │   ├── profile/page.tsx    # User profile & password update
│   │   │   ├── reports/page.tsx    # PDF/Excel report generator
│   │   │   ├── storage/page.tsx    # Cloudflare R2 storage monitor
│   │   │   └── users/page.tsx      # User accounts management
│   │   ├── login/page.tsx          # Authentication login page
│   │   ├── globals.css             # Global styles & design system
│   │   ├── layout.tsx              # Root HTML layout with metadata
│   │   └── page.tsx                # Root redirect (→ /login)
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation bar + notifications
│   │   └── Sidebar.tsx             # Collapsible sidebar navigation
│   ├── context/
│   │   └── AuthContext.tsx          # React auth context provider
│   ├── lib/
│   │   ├── types.ts                # TypeScript interfaces & enums
│   │   └── services/
│   │       ├── auth.ts             # Authentication service layer
│   │       ├── db.ts               # Database abstraction (Supabase / local JSON)
│   │       └── storage.ts          # Cloudflare R2 storage service
│   └── middleware.ts               # Route protection & RBAC enforcement
├── .env.example                    # Environment variables template
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # ← You are here
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Check Command |
|---|---|---|
| **Node.js** | 18.17 or later | `node --version` |
| **npm** | 9.0 or later | `npm --version` |
| **Git** | Any recent | `git --version` |

**Optional (for cloud production mode):**
- A [Supabase](https://supabase.com/) account (free tier works)
- A [Cloudflare](https://www.cloudflare.com/) account with R2 enabled (free tier works)
- A [Vercel](https://vercel.com/) account for deployment

---

## 🚀 Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/medicalsystem-caps/medirecord-apemdh.git
cd medirecord-apemdh
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your API keys (see [Environment Variables](#-environment-variables) section below).

> **💡 Zero-Config Mode:** If you skip this step entirely and run without any `.env.local` file, the system will automatically use a **local JSON mock database** (`mock-db.json`) and local file storage (`public/uploads/`). This is ideal for quick testing — no cloud accounts needed!

### 4. Start the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser. You will be redirected to the login page.

---

## 🔑 Environment Variables

The application supports two operating modes based on which environment variables are provided:

### Mode A: Local Development (No Cloud — Zero Config)

No `.env.local` needed. The system automatically:
- Uses `mock-db.json` as a flat-file database
- Stores uploaded files to `public/uploads/`
- Seeds default test user accounts

### Mode B: Cloud Production (Supabase + Cloudflare R2)

Create a `.env.local` file with the following variables:

```env
# ── Supabase Database ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_anon_key

# ── Cloudflare R2 Object Storage ───────────────────────────
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=medirecord-documents
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

| Variable | Required | Description |
|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cloud mode | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloud mode | Supabase service role key (server-side only, bypasses RLS) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cloud mode | Supabase anonymous/public key |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloud mode | R2 API access key ID |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloud mode | R2 API secret key |
| `CLOUDFLARE_R2_ENDPOINT` | Cloud mode | R2 S3-compatible API endpoint |
| `CLOUDFLARE_R2_BUCKET_NAME` | Cloud mode | R2 bucket name |
| `CLOUDFLARE_R2_PUBLIC_URL` | Cloud mode | R2 public access URL for serving files |

> ⚠️ **Security:** Never commit `.env.local` to Git. It is already included in `.gitignore`.

---

## 🗄 Database Setup (Supabase)

If using Supabase for production, create the following tables in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard

1. Visit [supabase.com](https://supabase.com/) and sign in
2. Select your project (or create a new one)
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Schema SQL

Execute the following SQL to create all required tables:

```sql
-- ============================================================
-- MediRecord Database Schema for Supabase
-- ============================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MRO', 'PHYSICIAN', 'CRO', 'LCR')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEACTIVATED')),
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Birth records table
CREATE TABLE IF NOT EXISTS birth_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  certificate_number TEXT NOT NULL UNIQUE,
  child_name TEXT NOT NULL,
  child_gender TEXT NOT NULL CHECK (child_gender IN ('MALE', 'FEMALE', 'OTHER')),
  birth_date TEXT NOT NULL,
  birth_time TEXT,
  place_of_birth TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  father_name TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  certified_by TEXT,
  certified_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  duplicate_status TEXT DEFAULT 'UNIQUE',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Death records table
CREATE TABLE IF NOT EXISTS death_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  certificate_number TEXT NOT NULL UNIQUE,
  deceased_name TEXT NOT NULL,
  deceased_age INTEGER NOT NULL,
  deceased_gender TEXT NOT NULL CHECK (deceased_gender IN ('MALE', 'FEMALE', 'OTHER')),
  date_of_death TEXT NOT NULL,
  place_of_death TEXT NOT NULL,
  cause_of_death TEXT NOT NULL,
  icd10_code TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  certified_by TEXT,
  certified_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  duplicate_status TEXT DEFAULT 'UNIQUE',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Audit logs table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. System settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'system',
  storage_usage_bytes BIGINT NOT NULL DEFAULT 0,
  max_storage_bytes BIGINT NOT NULL DEFAULT 10737418240,  -- 10 GB
  uploads_disabled BOOLEAN NOT NULL DEFAULT false
);

-- Insert default settings row
INSERT INTO settings (id) VALUES ('system') ON CONFLICT DO NOTHING;
```

### Step 3: Seed the Default Admin Account

```sql
-- Insert default admin user (password: AdminPassword123!)
-- SHA-256 hash of 'AdminPassword123!'
INSERT INTO users (id, name, email, role, status, must_change_password, password_hash)
VALUES (
  'usr_admin',
  'Hospital Administrator',
  'admin@medirecord.ph',
  'ADMIN',
  'ACTIVE',
  true,
  'a65f50ef27826baa74926f8c9b8c5e5e5a3f9c8c1bd51c7a8d23a8c1e7fcf8d9'
)
ON CONFLICT (email) DO NOTHING;
```

> **Note:** After first login, you can create additional user accounts from the Admin → User Management panel.

---

## ☁ Cloudflare R2 Storage Setup

### Step 1: Create an R2 Bucket

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage** in the sidebar
3. Click **Create Bucket**
4. Name it `medirecord-documents` and click **Create**

### Step 2: Generate API Tokens

1. Go back to the **R2** home tab
2. Click **Manage R2 API Tokens** on the right
3. Click **Create API Token**
4. Select the **Object Read & Write** permission template
5. Click **Create Token**
6. **Immediately copy** the `Access Key ID` and `Secret Access Key`

### Step 3: Get the S3 Endpoint & Public URL

1. Open your bucket details → **Settings**
2. Copy the **S3 API Endpoint** (format: `https://...r2.cloudflarestorage.com`)
3. Under **Public Access**, enable public access to get a `r2.dev` subdomain URL

### Step 4: Add to Environment

Paste all values into your `.env.local` file under the R2 section.

---

## ▶ Running the Application

### Development Mode

```bash
npm run dev
```

The app starts at **http://localhost:3000** with hot-reload enabled.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 🧪 Default Test Accounts

When running in **local mode** (no Supabase), the system auto-seeds these accounts:

| Role | Email | Password | First Login Action |
|---|---|---|---|
| **Admin** | `admin@medirecord.ph` | `AdminPassword123!` | Must change password |
| **MRO** | `mro@apemdh.gov` | `MroPassword123!` | Must change password |
| **Physician** | `physician@apemdh.gov` | `PhysicianPassword123!` | Must change password |
| **CRO** | `cro@apemdh.gov` | `CroPassword123!` | Must change password |
| **LCR** | `lcr@apemdh.gov` | `LcrPassword123!` | Must change password |

> **Note:** All accounts require a mandatory password change on first login. After changing the password, you'll be redirected to the dashboard.

---

## 🧪 Testing Guide

### Functional Testing Checklist

Follow this end-to-end testing flow to validate all system features:

#### 1. Authentication & Security

- [ ] **Login** — Visit `/login` and enter admin credentials
- [ ] **Forced Password Change** — Verify redirect to `/change-password` on first login
- [ ] **Invalid Credentials** — Attempt login with wrong email/password → error message
- [ ] **Session Persistence** — Refresh the page → should remain logged in
- [ ] **Unauthorized Access** — As a non-admin, try navigating to `/dashboard/users` → redirected with error toast
- [ ] **Sign Out** — Click profile → Sign Out → confirmation dialog → redirected to login

#### 2. Dashboard

- [ ] **Statistics Cards** — Verify birth/death/pending/archived counts display correctly
- [ ] **Monthly Chart** — Verify the area chart shows monthly registration data
- [ ] **Storage Gauge** — Confirm the circular storage meter reflects actual R2 usage
- [ ] **Recent Activities** — Confirm the latest 7 audit activities are displayed

#### 3. Birth Records

- [ ] **View List** — Navigate to Birth Records → see table with search/filter/sort
- [ ] **Create Record** (as MRO or Admin) — Click "+ New Birth Record" → fill form → submit
- [ ] **Duplicate Detection** — Create a record with the same child name/birth date → flagged as potential duplicate
- [ ] **Certify** (as Physician) — Open a PENDING_CERTIFICATION record → click Certify
- [ ] **Verify** (as MRO) — Open a PENDING_VERIFICATION record → click Verify
- [ ] **Approve** (as CRO) — Open a PENDING_APPROVAL record → click Approve
- [ ] **Submit** (as LCR) — Open a SUBMITTED_LCR record → click Submit to LCR
- [ ] **Archive** (as LCR) — Archive a submitted record
- [ ] **Upload Documents** — Attach a supporting document (PDF/image) to a record
- [ ] **Mobile View** — Resize browser to mobile → table should transform to card layout

#### 4. Death Records

- [ ] Same workflow as Birth Records above, but with death-specific fields (cause of death, ICD-10 code, deceased info)

#### 5. User Management (Admin Only)

- [ ] **View Users** — Navigate to User Management → see all accounts
- [ ] **Create User** — Click "Add User Account" → fill modal form → submit
- [ ] **Edit User** — Click edit on a user → modify role/name → save
- [ ] **Deactivate User** — Deactivate a user → they can no longer log in
- [ ] **Reset Password** — Reset a user's password → they must change on next login

#### 6. Audit Trail (Admin Only)

- [ ] **View Logs** — Navigate to System Audit Logs → full activity history
- [ ] **Filter by Action** — Use the action type filter dropdown
- [ ] **Search** — Search logs by email or description
- [ ] **Export CSV** — Click export → download CSV file with all logs
- [ ] **Immutability** — Verify there is no delete button (logs cannot be deleted from the app)

#### 7. Reports & Export

- [ ] **Generate PDF** — Navigate to Reports → select filters → generate PDF report
- [ ] **Generate Excel** — Export registry data as Excel spreadsheet
- [ ] **Date Range Filter** — Filter reports by specific date ranges

#### 8. Storage Management (Admin Only)

- [ ] **View Usage** — Navigate to Storage → see bucket capacity and file list
- [ ] **Upload Limit** — Verify that uploads are disabled when storage exceeds 9.5 GB (95% threshold)

#### 9. Responsive Design

- [ ] **Desktop** — Full sidebar + tables at 1024px+
- [ ] **Tablet** — Collapsible sidebar at 768px–1024px
- [ ] **Mobile** — Hamburger menu + card-based layouts at <768px

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Add all environment variables from your `.env.local` to the Vercel project settings
4. Click **Deploy**

The app will be live at your Vercel URL (e.g., `https://medirecord-apemdh.vercel.app`).

### Environment Variables on Vercel

Go to **Project Settings** → **Environment Variables** and add each key-value pair from your `.env.local` file.

---

## 📄 License

This project is developed as an **academic capstone project** for Alfonso Ponce Enrile Memorial District Hospital (APEMDH). All rights reserved.

---

<div align="center">

**Built with ❤️ for APEMDH**

*Civil Registry Document Management System — Capstone Project*

</div>

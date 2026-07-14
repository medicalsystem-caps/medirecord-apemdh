import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/auth';
import {
  ShieldCheck,
  FileText,
  Activity,
  HardDrive,
  Users,
  ChevronRight,
  ArrowRight,
  Layers,
  FileCheck,
  Building
} from 'lucide-react';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 bg-dot-pattern selection:bg-teal-500 selection:text-white">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-transparent/45 backdrop-blur-md border-b border-slate-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MediRecord Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">MediRecord</span>
              <span className="text-[9px] text-teal-600 font-semibold tracking-wider uppercase mt-0.5">APEMDH Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500">
            <a href="#hero" className="hover:text-teal-700 transition-colors">Overview</a>
            <a href="#about" className="hover:text-teal-700 transition-colors">About APEMDH</a>
            <a href="#features" className="hover:text-teal-700 transition-colors">Key Features</a>
            <a href="#security" className="hover:text-teal-700 transition-colors">System Security</a>
          </nav>

          {/* Dynamic Action Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="btn-primary text-xs !py-1.5 px-4 flex items-center gap-1.5 hover:shadow-lg transition-all"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-primary text-xs !py-1.5 px-5 flex items-center gap-1.5 hover:shadow-lg transition-all"
              >
                Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero / Overview Section */}
      <section id="hero" className="relative py-20 lg:py-28 overflow-hidden">
        {/* Abstract decorative blobs */}
        <div
          className="absolute -top-12 -left-12 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            {/* Tagline */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-extrabold uppercase tracking-wider text-teal-700 mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Hospital Registry Management
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              APEMDH Civil Registry <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600">
                Document Management
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
              A comprehensive system custom-designed for Alfonso Ponce Enrile Memorial District Hospital. 
              Enables secure record collation, medically certified approvals, and seamless submission 
              pipelines for birth and death registry documents.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="btn-primary px-6 py-3 font-bold flex items-center gap-2 text-sm shadow-md hover:shadow-lg transition-all"
              >
                {user ? "Access Dashboard" : "Sign In to Portal"}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#about"
                className="btn-secondary px-6 py-3 font-semibold flex items-center gap-1.5 text-sm hover:bg-slate-50 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-16 bg-white border-y border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-700/5 to-cyan-500/5 rounded-3xl -rotate-2 scale-105" />
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-sm relative overflow-hidden space-y-6">
                <div className="h-2.5 bg-gradient-to-r from-teal-600 to-cyan-500 absolute top-0 inset-x-0" />
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-50 rounded-2xl text-teal-700 shrink-0">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">APEMDH</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital Care &amp; Service</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Alfonso Ponce Enrile Memorial District Hospital plays a vital role in providing healthcare services and managing official civil records for the community.
                </p>
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Compliance</span>
                    <span className="text-xs font-bold text-teal-700 mt-1 block">RA 10173 Protected</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Storage Limit</span>
                    <span className="text-xs font-bold text-teal-700 mt-1 block">10 GB Secure R2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">Institutional Core</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Empowering Healthcare Records with Integrity &amp; Transparency
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                The MediRecord system was initiated to address physical documentation issues and replace outdated registry logging with a cloud-resilient, role-restricted dashboard. By standardizing registry input, the hospital prevents identity errors, guards medical verification steps, and maintains precise audit compliance logs.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Legal & HIPAA/DPA Compliance",
                    desc: "Enforces mandatory password resets, session auto-logouts, and restricted data layers matching the Data Privacy Act of 2012 guidelines."
                  },
                  {
                    title: "Dual Birth & Death Tracking",
                    desc: "Structured schemas and strict workflows distinguish and validate birth records and death certificates separately with zero duplication overlap."
                  },
                  {
                    title: "Permanent Accountability",
                    desc: "An immutable audit trail keeps permanent administrative logs detailing creating, editing, certifying, verifying, and exporting files."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5">
                    <div className="h-5 w-5 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">Features &amp; Modules</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Workflow Architecture</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every birth and death certificate goes through a secure multi-stage pipeline, managed and verified by specific hospital personnel.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "1. Registry Data Entry",
                desc: "Medical Records Officers (MRO) encode certificate details and upload scanned supporting papers to Cloudflare R2.",
                icon: FileText,
                color: "text-blue-600 bg-blue-50 border-blue-100/50"
              },
              {
                title: "2. Attending Certification",
                desc: "Authorized attending Physicians certify the medical aspects and cause of birth/death parameters for safety validation.",
                icon: FileCheck,
                color: "text-amber-600 bg-amber-50 border-amber-100/50"
              },
              {
                title: "3. Civil Registrar Approval",
                desc: "The Civil Registrar Officer (CRO) conducts checks to review details before releasing certificates to municipal structures.",
                icon: Layers,
                color: "text-indigo-600 bg-indigo-50 border-indigo-100/50"
              },
              {
                title: "4. Archiving & Logging",
                desc: "The Local Civil Registrar (LCR) records submissions and locks entries to archive files permanently. Logs are untamperable.",
                icon: HardDrive,
                color: "text-teal-600 bg-teal-50 border-teal-100/50"
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white border ${card.color} p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl shrink-0 inline-block bg-white shadow-xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-xs">{card.title}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Security & Framework Section */}
      <section id="security" className="py-16 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background mesh */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-teal-700/20 rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-1 bg-teal-800/80 border border-teal-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
              Technical Safety Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Protected by Modern Cloud Standards</h2>
            <p className="text-teal-100/80 text-xs sm:text-sm leading-relaxed">
              MediRecord protects sensitive medical data by utilizing a decoupled server architecture. All file uploads are sent to private Cloudflare R2 buckets, database updates are regulated by Supabase Row-Level Security policies, and sessions are encrypted using base64 HTTP cookies with strict server-side route guards.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-1">
                <span className="text-[10px] text-teal-300 font-bold uppercase block tracking-widest">Database</span>
                <span className="text-xs font-semibold block text-white">PostgreSQL &amp; Supabase</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-teal-300 font-bold uppercase block tracking-widest">Network Encryption</span>
                <span className="text-xs font-semibold block text-white">TLS 1.3 Secure Layer</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-teal-300 font-bold uppercase block tracking-widest">Audit Trails</span>
                <span className="text-xs font-semibold block text-white">Non-Delete Table Policy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
            {/* Column 1: Hospital Name & Address */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="MediRecord Logo" className="h-8 w-auto object-contain brightness-0 invert" />
                <span className="text-sm font-extrabold text-white tracking-tight">MediRecord</span>
              </div>
              <p className="text-[11px] leading-relaxed max-w-sm">
                Alfonso Ponce Enrile Memorial District Hospital (APEMDH) <br />
                Gonzaga, Cagayan Valley, Philippines
              </p>
            </div>

            {/* Column 2: System Links */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Registry Portal</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <Link href="/login" className="hover:text-teal-400 transition-colors">Portal Login</Link>
                </li>
                <li>
                  <a href="#about" className="hover:text-teal-400 transition-colors">Hospital About</a>
                </li>
                <li>
                  <a href="#features" className="hover:text-teal-400 transition-colors">Features List</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact/Support */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Support Contact</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>APEMDH IT Administration</li>
                <li>Email: medicalsystem976@gmail.com</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
            <span>
              &copy; {new Date().getFullYear()} APEMDH MediRecord. All Rights Reserved.
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                DPA (RA 10173) Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

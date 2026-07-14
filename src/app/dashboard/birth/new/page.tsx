'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createBirthRecordAction, checkDuplicateBirthAction } from '@/app/actions/birth';
import { Baby, ArrowLeft, ShieldCheck, ShieldAlert, HeartPulse, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewBirthRecordPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form Fields
  const [childName, setChildName] = useState('');
  const [childGender, setChildGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('Alfonso Ponce Enrile Memorial District Hospital');
  const [motherName, setMotherName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [notes, setNotes] = useState('');

  // Duplicate check status
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateNum, setDuplicateNum] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Trigger duplicate check on blur of key fields
  const performDuplicateCheck = async () => {
    if (!childName || !motherName || !birthDate) return;
    
    try {
      setCheckingDuplicate(true);
      const res = await checkDuplicateBirthAction(childName, motherName, birthDate);
      setIsDuplicate(res.isDuplicate);
      if (res.isDuplicate && res.duplicateRecord) {
        setDuplicateNum(res.duplicateRecord.certificateNumber);
        toast.warning(`Warning: A duplicate record was detected (${res.duplicateRecord.certificateNumber}).`);
      } else {
        setDuplicateNum('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleBlur = () => {
    performDuplicateCheck();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !birthDate || !birthTime || !placeOfBirth || !motherName) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await createBirthRecordAction({
        childName,
        childGender,
        birthDate,
        birthTime,
        placeOfBirth,
        motherName,
        fatherName,
        notes,
      });

      toast.success('Birth certificate draft saved successfully.');
      router.push('/dashboard/birth');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create birth record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview generated certificate number
  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const previewCertNum = `BR-${todayStr}-XXXX`;

  // Enforce access control
  if (user?.role !== 'MRO' && user?.role !== 'ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-sm flex flex-col gap-3">
        <span className="font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Restrained
        </span>
        <p>Only Medical Records Officers (MRO) and Hospital Administrators are authorized to draft birth records.</p>
        <Link href="/dashboard" className="text-teal-700 font-bold underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/birth" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs text-slate-500 font-semibold">Back to Registry</span>
      </div>

      {/* Header */}
      <div className="pb-2">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Register Birth Certificate</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Create a new patient entry. The certificate number will be generated automatically upon drafting.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 bg-teal-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-teal-800 flex items-center gap-1.5">
            <Baby className="h-4 w-4" />
            Registry Number Allocation
          </span>
          <span className="font-bold text-slate-500 bg-white border px-2 py-0.5 rounded-md">{previewCertNum}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Child details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Child Demographics</h3>
            
            <div className="grid sm:grid-cols-3 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Child's Full Name *</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g. Angelo Garcia Cruz"
                  className="input-field"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Gender *</label>
                <select
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value as any)}
                  className="input-field"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Birth Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Date of Birth *</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  onBlur={handleBlur}
                  className="input-field"
                  required
                />
              </div>

              {/* Birth Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Time of Birth *</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Place of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Place of Birth *</label>
                <input
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  placeholder="Hospital Ward / Room #"
                  className="input-field"
                  required
                />
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Parents details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Parents Association</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Mother Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Mother's Full Maiden Name *</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g. Elena Garcia Cruz"
                  className="input-field"
                  required
                />
              </div>

              {/* Father Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Father's Full Name</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Roberto Solis Cruz"
                  className="input-field"
                />
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Clinical Remarks / Registry Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State any remarks like birth weight, attendees, delivery complexity..."
              rows={3}
              className="input-field resize-none py-3"
            />
          </div>

          {/* Duplicate Check Indicator */}
          {checkingDuplicate ? (
            <div className="text-xs text-slate-400 animate-pulse">Running live background duplicate registry check...</div>
          ) : isDuplicate ? (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex gap-2 items-start animate-shake">
              <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Potential Duplicate Block Alert!</span>
                <p className="opacity-90 mt-0.5">
                  A certificate with the exact same details (Child: <span className="font-bold">{childName}</span>, Mother: <span className="font-bold">{motherName}</span>, Date: <span className="font-bold">{birthDate}</span>) is already registered under certificate <span className="font-bold">{duplicateNum}</span>. Saving will flag this entry for mandatory admin review.
                </p>
              </div>
            </div>
          ) : childName && motherName && birthDate ? (
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-800 text-xs flex gap-2 items-start">
              <ShieldCheck className="h-4.5 w-4.5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Unique Entry Verified</span>
                <p className="opacity-90 mt-0.5">No matching active records found. This entry is clear for drafting.</p>
              </div>
            </div>
          ) : null}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/dashboard/birth" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving Draft...' : 'Save Draft Record'}
            </button>
          </div>

        </form>

      </motion.div>

    </div>
  );
}

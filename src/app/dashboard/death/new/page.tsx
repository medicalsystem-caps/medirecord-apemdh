'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createDeathRecordAction, checkDuplicateDeathAction } from '@/app/actions/death';
import { HeartOff, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewDeathRecordPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form Fields
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedAge, setDeceasedAge] = useState('');
  const [deceasedGender, setDeceasedGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [placeOfDeath, setPlaceOfDeath] = useState('Alfonso Ponce Enrile Memorial District Hospital');
  const [notes, setNotes] = useState('');

  // Duplicate Check Status
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateNum, setDuplicateNum] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const performDuplicateCheck = async () => {
    if (!deceasedName || !dateOfDeath) return;

    try {
      setCheckingDuplicate(true);
      const res = await checkDuplicateDeathAction(deceasedName, dateOfDeath);
      setIsDuplicate(res.isDuplicate);
      if (res.isDuplicate && res.duplicateRecord) {
        setDuplicateNum(res.duplicateRecord.certificateNumber);
        toast.warning(`Warning: A duplicate death entry was detected (${res.duplicateRecord.certificateNumber}).`);
      } else {
        setDuplicateNum('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleBlur = () => {
    performDuplicateCheck();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deceasedName || !deceasedAge || !dateOfDeath || !placeOfDeath) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const ageNum = parseInt(deceasedAge, 10);
    if (isNaN(ageNum) || ageNum < 0) {
      toast.error('Please enter a valid age.');
      return;
    }

    try {
      setSubmitting(true);
      await createDeathRecordAction({
        deceasedName,
        deceasedAge: ageNum,
        deceasedGender,
        dateOfDeath,
        placeOfDeath,
        notes,
      });

      toast.success('Death certificate draft saved successfully.');
      router.push('/dashboard/death');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create death record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview generated certificate number
  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const previewCertNum = `DR-${todayStr}-XXXX`;

  // Enforce access control
  if (user?.role !== 'MRO' && user?.role !== 'ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-sm flex flex-col gap-3">
        <span className="font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Restrained
        </span>
        <p>Only Medical Records Officers (MRO) and Hospital Administrators are authorized to draft death records.</p>
        <Link href="/dashboard" className="text-teal-700 font-bold underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/death" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs text-slate-500 font-semibold">Back to Registry</span>
      </div>

      {/* Header */}
      <div className="pb-2">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Register Death Certificate</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Create a new patient death entry. The certificate number will be generated automatically, and cause-of-death parameters will be certified by the attending physician.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 bg-teal-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-teal-800 flex items-center gap-1.5">
            <HeartOff className="h-4 w-4" />
            Registry Number Allocation
          </span>
          <span className="font-bold text-slate-500 bg-white border px-2 py-0.5 rounded-md">{previewCertNum}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Demographics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Deceased Demographics</h3>
            
            <div className="grid sm:grid-cols-3 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Deceased Full Name *</label>
                <input
                  type="text"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g. Gregorio Aglipay Aquino"
                  className="input-field"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Gender *</label>
                <select
                  value={deceasedGender}
                  onChange={(e) => setDeceasedGender(e.target.value as any)}
                  className="input-field"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Age *</label>
                <input
                  type="number"
                  value={deceasedAge}
                  onChange={(e) => setDeceasedAge(e.target.value)}
                  placeholder="Age in years"
                  className="input-field"
                  required
                  min={0}
                />
              </div>

              {/* Date of Death */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Date of Death *</label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  onBlur={handleBlur}
                  className="input-field"
                  required
                />
              </div>

              {/* Place of Death */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Place of Death *</label>
                <input
                  type="text"
                  value={placeOfDeath}
                  onChange={(e) => setPlaceOfDeath(e.target.value)}
                  placeholder="Hospital Ward / ICU Ward"
                  className="input-field"
                  required
                />
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Clinical Remarks / Registry Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State any remarks like attending physician, witness credentials, clinical remarks..."
              rows={3}
              className="input-field resize-none py-3"
            />
          </div>

          {/* Duplicate check banners */}
          {checkingDuplicate ? (
            <div className="text-xs text-slate-400 animate-pulse">Running live background duplicate registry check...</div>
          ) : isDuplicate ? (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex gap-2 items-start animate-shake">
              <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Potential Duplicate Block Alert!</span>
                <p className="opacity-90 mt-0.5">
                  A certificate with the exact same details (Deceased: <span className="font-bold">{deceasedName}</span>, Date of Death: <span className="font-bold">{dateOfDeath}</span>) is already registered under certificate <span className="font-bold">{duplicateNum}</span>. Saving will flag this entry for mandatory admin review.
                </p>
              </div>
            </div>
          ) : deceasedName && dateOfDeath ? (
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
            <Link href="/dashboard/death" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary bg-rose-700 hover:bg-rose-800 font-bold focus:ring-rose-500"
            >
              {submitting ? 'Saving Draft...' : 'Save Draft Record'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}

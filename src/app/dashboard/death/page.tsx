'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getDeathRecordsAction,
  submitDeathToPhysicianAction,
  certifyDeathRecordAction,
  verifyDeathRecordAction,
  approveDeathRecordAction,
  finalizeLCRDeathAction,
  searchICD10Action,
  uploadDeathFileAction,
} from '@/app/actions/death';
import { DeathRecord, RecordStatus } from '@/lib/types';
import {
  Search,
  Plus,
  Filter,
  Eye,
  FileBadge,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Download,
  Calendar,
  X,
  FileCheck,
  MapPin,
  HeartOff,
  Stethoscope,
  Archive,
  UploadCloud,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DeathRegistryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DeathRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<DeathRecord | null>(null);

  // Physician Certification form inputs
  const [causeInput, setCauseInput] = useState('');
  const [icd10Input, setIcd10Input] = useState('');
  const [icdSuggestions, setIcdSuggestions] = useState<{ code: string; diagnosis: string }[]>([]);

  // File upload state for MRO verification
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await getDeathRecordsAction(search, statusFilter);
      setRecords(res);
    } catch (err) {
      toast.error('Failed to retrieve death records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleAction = async (actionFn: (id: string) => Promise<DeathRecord>, successMsg: string) => {
    if (!selectedRecord) return;
    try {
      setLoading(true);
      const updated = await actionFn(selectedRecord.id);
      setSelectedRecord(updated);
      toast.success(successMsg);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Workflow transition failed.');
    } finally {
      setLoading(false);
    }
  };

  // Search ICD-10 suggestions live
  useEffect(() => {
    const fetchICD = async () => {
      if (!icd10Input && !causeInput) {
        setIcdSuggestions([]);
        return;
      }
      try {
        const query = icd10Input || causeInput;
        const res = await searchICD10Action(query);
        setIcdSuggestions(res);
      } catch (e) {}
    };

    fetchICD();
  }, [icd10Input, causeInput]);

  const handlePhysicianCertify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!causeInput || !icd10Input) {
      toast.error('Please provide both the Cause of Death and ICD-10 code.');
      return;
    }

    try {
      setLoading(true);
      const updated = await certifyDeathRecordAction(selectedRecord.id, causeInput, icd10Input);
      setSelectedRecord(updated);
      setCauseInput('');
      setIcd10Input('');
      setIcdSuggestions([]);
      toast.success('Cause of death certified successfully. Dispatched back to MRO.');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Certification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRecord) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size exceeds the 4MB Vercel upload limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingDoc(true);
      const updated = await uploadDeathFileAction(selectedRecord.id, formData);
      setSelectedRecord(updated);
      toast.success('Supporting document uploaded successfully to secure repository.');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'File upload failed.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleVerifyComplete = async () => {
    if (!selectedRecord) return;
    if (selectedRecord.supportingDocuments.length === 0) {
      toast.error('Please upload at least one supporting document (e.g. valid ID, death affidavit) before completing verification.');
      return;
    }

    try {
      setLoading(true);
      const updated = await verifyDeathRecordAction(selectedRecord.id, []);
      setSelectedRecord(updated);
      toast.success('Record verified successfully and submitted for CRO review.');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectIcdSuggestion = (item: { code: string; diagnosis: string }) => {
    setIcd10Input(item.code);
    setCauseInput(item.diagnosis);
    setIcdSuggestions([]);
  };

  // Status Badge styles helper
  const getStatusBadge = (status: RecordStatus) => {
    const mappings = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
      PENDING_CERTIFICATION: 'bg-blue-50 text-blue-700 border-blue-200',
      PENDING_VERIFICATION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
      SUBMITTED_LCR: 'bg-purple-50 text-purple-700 border-purple-200',
      ARCHIVED: 'bg-green-50 text-green-700 border-green-200',
    };
    const labels = {
      DRAFT: 'Draft',
      PENDING_CERTIFICATION: 'Pending MD Cert',
      PENDING_VERIFICATION: 'Pending MRO Verify',
      PENDING_APPROVAL: 'Pending CRO Approve',
      SUBMITTED_LCR: 'Submitted LCR',
      ARCHIVED: 'Registry Archived',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${mappings[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">APEMDH Civil Registry</span>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">Death Certificate Registry</h1>
        </div>

        {/* Create button visible only for MRO and ADMIN */}
        {(user?.role === 'MRO' || user?.role === 'ADMIN') && (
          <Link href="/dashboard/death/new" className="btn-primary bg-rose-700 hover:bg-rose-800 focus:ring-rose-500">
            <Plus className="h-4 w-4" />
            <span>New Death Record</span>
          </Link>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by deceased, cause, ICD-10 or certificate..."
            className="input-field input-field-icon-left"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Dropdown status filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Workflow Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_CERTIFICATION">Pending MD Cert</option>
            <option value="PENDING_VERIFICATION">Pending MRO Verify</option>
            <option value="PENDING_APPROVAL">Pending CRO Approve</option>
            <option value="SUBMITTED_LCR">Submitted to LCR</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Querying death records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <HeartOff className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No Death Certificates Found</p>
            <p className="text-xs text-slate-400">Modify your filters or draft a new record to start.</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Certificate #</th>
                <th className="py-3 px-4">Deceased Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Date of Death</th>
                <th className="py-3 px-4">Cause / ICD-10</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all duration-100">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{r.certificateNumber}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{r.deceasedName}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{r.deceasedAge} yrs / {r.deceasedGender}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{r.dateOfDeath}</td>
                  <td className="py-3.5 px-4">
                    {r.causeOfDeath ? (
                      <div>
                        <span className="font-semibold text-slate-700 block">{r.causeOfDeath}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">ICD-10: {r.icd10Code}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not Certified Yet</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedRecord(r);
                        setCauseInput('');
                        setIcd10Input('');
                      }}
                      className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 hover:border-teal-500 hover:text-teal-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {records.map((r) => (
            <div key={r.id} className="p-4 space-y-3 text-xs bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-slate-800 text-[10px] block">Cert #: {r.certificateNumber}</span>
                  <span className="font-bold text-slate-800 text-sm block mt-0.5">{r.deceasedName}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{r.deceasedAge} yrs / {r.deceasedGender}</span>
                </div>
                {getStatusBadge(r.status)}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg space-y-1.5 text-[10px] text-slate-500 font-medium">
                <div className="flex justify-between">
                  <span>Date of Death:</span>
                  <strong className="text-slate-700">{r.dateOfDeath}</strong>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span>Cause of Death:</span>
                  <div className="text-right">
                    {r.causeOfDeath ? (
                      <>
                        <strong className="text-slate-700 block">{r.causeOfDeath}</strong>
                        <span className="text-[8px] font-bold text-slate-400 bg-slate-200 px-1 py-0.2 rounded inline-block mt-0.5">ICD-10: {r.icd10Code}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Not Certified Yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-1 flex">
                <button
                  onClick={() => {
                    setSelectedRecord(r);
                    setCauseInput('');
                    setIcd10Input('');
                  }}
                  className="btn-secondary py-2 px-3 text-[10px] inline-flex items-center gap-1.5 flex-1 justify-center hover:border-teal-500 hover:text-teal-700 shadow-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>

      {/* Slide-Over Details Panel */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="fixed inset-0 bg-slate-900 z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileBadge className="h-5 w-5 text-rose-700" />
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Registry Details</h3>
                      <span className="text-[10px] text-slate-400 font-bold">{selectedRecord.certificateNumber}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Duplicate Alert */}
                {selectedRecord.duplicateStatus === 'POTENTIAL_DUPLICATE' && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl space-y-1 text-red-800">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                      Potential Duplicate Found
                    </span>
                    <p className="text-[10px] opacity-90 leading-normal">
                      A record with this deceased name and date of death already exists in the APEMDH database. Confirm spelling and date parameters to protect database completeness.
                    </p>
                  </div>
                )}

                {/* Registry Form Information */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Deceased Full Name</span>
                    <span className="font-bold text-slate-800 block text-sm mt-0.5">{selectedRecord.deceasedName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Deceased Age / Gender</span>
                    <span className="font-bold text-slate-800 block text-sm mt-0.5">{selectedRecord.deceasedAge} yrs ({selectedRecord.deceasedGender})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Date of Death</span>
                    <span className="font-bold text-slate-700 block mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {selectedRecord.dateOfDeath}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Place of Death</span>
                    <span className="font-bold text-slate-700 block mt-0.5 flex items-center gap-0.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {selectedRecord.placeOfDeath}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Medical Certification Diagnosis details */}
                <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Medical Cause of Death</span>
                  {selectedRecord.causeOfDeath ? (
                    <div className="mt-1 space-y-2">
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block">Cause of Death Certificate:</span>
                        <span className="text-sm font-bold text-slate-800 block mt-0.5 leading-tight">{selectedRecord.causeOfDeath}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block">WHO Classification Code (ICD-10):</span>
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200 rounded inline-block mt-0.5">{selectedRecord.icd10Code}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs mt-1 font-semibold italic">
                      <Stethoscope className="h-4 w-4 shrink-0 text-slate-300" />
                      <span>Pending diagnosis certification from attending physician.</span>
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* File Attachments */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Supporting Documents</h4>
                  {selectedRecord.supportingDocuments.length === 0 ? (
                    <span className="text-xs text-slate-400 italic block">No files uploaded.</span>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedRecord.supportingDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 bg-slate-50/50 rounded-lg text-xs font-semibold">
                          <span className="text-slate-600 truncate max-w-[200px]">{doc}</span>
                          <button
                            onClick={() => toast.success(`Simulating secure download for: ${doc}`)}
                            className="text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Verification Timeline */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Workflow Verification Audit</h4>
                  
                  <div className="relative border-l-2 border-teal-100 pl-4 space-y-4 text-xs ml-2">
                    
                    {/* Created */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0 h-3 w-3 rounded-full bg-teal-500 ring-4 ring-white" />
                      <div>
                        <span className="font-bold text-slate-700 block">Record Initiated (Draft)</span>
                        <span className="text-[10px] text-slate-400">{new Date(selectedRecord.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Certified */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 h-3 w-3 rounded-full ring-4 ring-white ${selectedRecord.certifiedBy ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      <div>
                        <span className="font-bold text-slate-700 block">Cause of Death Certified</span>
                        {selectedRecord.certifiedBy ? (
                          <>
                            <span className="text-slate-500 block">Attending MD: {selectedRecord.certifiedBy}</span>
                            <span className="text-[10px] text-slate-400">{new Date(selectedRecord.certifiedAt!).toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic block">Awaiting Cause of Death Diagnosis</span>
                        )}
                      </div>
                    </div>

                    {/* Verified */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 h-3 w-3 rounded-full ring-4 ring-white ${selectedRecord.verifiedBy ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      <div>
                        <span className="font-bold text-slate-700 block">Completeness Verified & Files Uploaded</span>
                        {selectedRecord.verifiedBy ? (
                          <>
                            <span className="text-slate-500 block">Verified by MRO: {selectedRecord.verifiedBy}</span>
                            <span className="text-[10px] text-slate-400">{new Date(selectedRecord.verifiedAt!).toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic block">Awaiting MRO Verification</span>
                        )}
                      </div>
                    </div>

                    {/* Approved */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 h-3 w-3 rounded-full ring-4 ring-white ${selectedRecord.approvedBy ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      <div>
                        <span className="font-bold text-slate-700 block">CRO Reviewed & Approved</span>
                        {selectedRecord.approvedBy ? (
                          <>
                            <span className="text-slate-500 block">Approved by CRO: {selectedRecord.approvedBy}</span>
                            <span className="text-[10px] text-slate-400">{new Date(selectedRecord.approvedAt!).toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic block">Awaiting CRO Approval</span>
                        )}
                      </div>
                    </div>

                    {/* Final Registry LCR */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 h-3 w-3 rounded-full ring-4 ring-white ${selectedRecord.submittedBy ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      <div>
                        <span className="font-bold text-slate-700 block">Local Civil Registry Finalized (Archived)</span>
                        {selectedRecord.submittedBy ? (
                          <>
                            <span className="text-slate-500 block">Finalized by LCR: {selectedRecord.submittedBy}</span>
                            <span className="text-[10px] text-slate-400">{new Date(selectedRecord.submittedAt!).toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic block">Awaiting LCR Archival</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Action Operations Area */}
              <div className="border-t border-slate-100 pt-4 mt-6">
                
                {/* MRO submit to physician */}
                {selectedRecord.status === 'DRAFT' && (user?.role === 'MRO' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => handleAction(submitDeathToPhysicianAction, 'Record submitted to physician for diagnosis certification.')}
                    className="btn-primary w-full py-2.5 bg-rose-700 hover:bg-rose-800 flex items-center justify-center gap-2"
                  >
                    <span>Submit to Physician for Medical Cert</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {/* Physician certify details form */}
                {selectedRecord.status === 'PENDING_CERTIFICATION' && (user?.role === 'PHYSICIAN' || user?.role === 'ADMIN') && (
                  <form onSubmit={handlePhysicianCertify} className="space-y-3 relative">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">Attending Cause of Death Certificate *</label>
                      <input
                        type="text"
                        value={causeInput}
                        onChange={(e) => setCauseInput(e.target.value)}
                        placeholder="e.g. Acute Myocardial Infarction"
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-xs font-semibold text-slate-600 block">WHO Classification Code (ICD-10) *</label>
                      <input
                        type="text"
                        value={icd10Input}
                        onChange={(e) => setIcd10Input(e.target.value)}
                        placeholder="e.g. I21.9"
                        className="input-field"
                        required
                      />

                      {/* Suggestions list */}
                      {icdSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 text-xs">
                          {icdSuggestions.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => selectIcdSuggestion(item)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 block font-semibold"
                            >
                              <span className="text-rose-700 font-bold block">{item.code}</span>
                              <span className="text-slate-500 block text-[10px] mt-0.5">{item.diagnosis}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center gap-2"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Certify & Submit to Records Officer</span>
                    </button>
                  </form>
                )}

                {/* MRO Upload files and Complete verification */}
                {selectedRecord.status === 'PENDING_VERIFICATION' && (user?.role === 'MRO' || user?.role === 'ADMIN') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Upload Supporting File *</label>
                      <label className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploadingDoc}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <UploadCloud className="h-7 w-7 text-slate-400" />
                        <span className="text-xs text-slate-600 font-bold">
                          {uploadingDoc ? 'Uploading to secure repository...' : 'Select File (PDF, PNG, JPG)'}
                        </span>
                        <span className="text-[10px] text-slate-400">Up to 4MB file allocation</span>
                      </label>
                    </div>

                    <button
                      onClick={handleVerifyComplete}
                      disabled={loading || uploadingDoc}
                      className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Complete Verification & Submit to CRO</span>
                    </button>
                  </div>
                )}

                {/* CRO Approve */}
                {selectedRecord.status === 'PENDING_APPROVAL' && (user?.role === 'CRO' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => handleAction(approveDeathRecordAction, 'Death certificate approved and dispatched to Local Civil Registrar.')}
                    className="btn-primary w-full py-2.5 bg-purple-700 hover:bg-purple-800 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Approve & Submit to Local Registrar</span>
                  </button>
                )}

                {/* LCR final archiving */}
                {selectedRecord.status === 'SUBMITTED_LCR' && (user?.role === 'LCR' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => handleAction(finalizeLCRDeathAction, 'Civil registry finalized and record locked in Archives.')}
                    className="btn-primary w-full py-2.5 bg-green-700 hover:bg-green-800 flex items-center justify-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Finalize, Register & Archive Record</span>
                  </button>
                )}

                {/* Status Help */}
                {selectedRecord.status !== 'ARCHIVED' && (
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Current stage requires action from authorized {
                      selectedRecord.status === 'DRAFT' ? 'MRO' :
                      selectedRecord.status === 'PENDING_CERTIFICATION' ? 'Physician' :
                      selectedRecord.status === 'PENDING_VERIFICATION' ? 'MRO' :
                      selectedRecord.status === 'PENDING_APPROVAL' ? 'CRO' : 'LCR'
                    } personnel.
                  </p>
                )}

                {selectedRecord.status === 'ARCHIVED' && (
                  <div className="p-2.5 bg-green-50 border border-green-100 rounded-xl text-center text-[10px] text-green-800 font-semibold">
                    This civil registry document is fully finalized and archived. No further actions required.
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

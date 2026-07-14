'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStorageStatusAction, getR2FilesAction } from '@/app/actions/storage';
import { SystemSettings } from '@/lib/types';
import {
  HardDrive,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldAlert,
  Server,
  FileCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StorageManagementPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SystemSettings | null>(null);
  const [files, setFiles] = useState<{ name: string; size: number; mimeType: string; uploadedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  


  const fetchStorageData = async () => {
    try {
      setLoading(true);
      const storageStatus = await getStorageStatusAction();
      const R2files = await getR2FilesAction();
      setStatus(storageStatus);
      setFiles(R2files);
    } catch (e) {
      toast.error('Failed to load storage allocations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Enforce access control
  if (user?.role !== 'ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-sm flex flex-col gap-3">
        <span className="font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Restrained
        </span>
        <p>This module contains secure storage metrics and configuration rules, and is restricted to Hospital Administrators only.</p>
        <Link href="/dashboard" className="text-teal-700 font-bold underline">Return to Dashboard</Link>
      </div>
    );
  }

  if (loading || !status) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading Cloudflare R2 metrics...</span>
        </div>
      </div>
    );
  }

  const usagePercentage = (status.storageUsageBytes / status.maxStorageBytes) * 100;
  const usageGB = (status.storageUsageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const maxGB = (status.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">Cloud Infrastructure</span>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">Cloudflare R2 Storage Monitor</h1>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left column: Storage Simulator & thresholds */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Main allocation card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Server className="h-4.5 w-4.5 text-slate-400" />
              <span>Allocation status</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>R2 Storage Capacity Usage</span>
                <span>{usagePercentage.toFixed(1)}% ({usageGB} GB / {maxGB} GB)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    usagePercentage >= 95 ? 'bg-red-600 animate-pulse' :
                    usagePercentage >= 90 ? 'bg-amber-500 animate-pulse' :
                    usagePercentage >= 80 ? 'bg-blue-500' : 'bg-teal-600'
                  }`} 
                  style={{ width: `${Math.min(100, usagePercentage)}%` }} 
                />
              </div>
            </div>

            {/* Simulated settings warning panels */}
            <div className="space-y-2">
              {usagePercentage >= 95 ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex gap-2.5 items-start">
                  <AlertOctagon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">UPLOAD RESTRICTION TRIGGERED (95%+)</span>
                    <p className="opacity-90 mt-0.5">R2 storage safety limit reached (9.5 GB limit). The document upload API has been disabled. MROs cannot upload files until space is freed or storage limit adjusted.</p>
                  </div>
                </div>
              ) : usagePercentage >= 90 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex gap-2.5 items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">SEVERE CAPACITY WARNING (90%+)</span>
                    <p className="opacity-90 mt-0.5">Hospital capacity warning alert dispatched. Administrators are notified that storage is near full. Upload restrictions will apply at 9.5 GB.</p>
                  </div>
                </div>
              ) : usagePercentage >= 80 ? (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex gap-2.5 items-start">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">CAPACITY WARNING ALERT (80%+)</span>
                    <p className="opacity-90 mt-0.5">Visual notification indicators activated. System logs show storage allocation is entering high capacity.</p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex gap-2.5 items-start">
                  <FileCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">R2 Storage Healthy</span>
                    <p className="opacity-90 mt-0.5">All cloud backup routines are operating normally. Space limits are within default compliance guidelines.</p>
                  </div>
                </div>
              )}
            </div>
          </div>



        </div>

        {/* Right column: Mock uploads listing */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Layers className="h-4.5 w-4.5 text-slate-400" />
              <span>Registered Attachments</span>
            </div>
            <span className="font-bold text-xs text-slate-500 bg-slate-50 border px-2 py-0.5 rounded-full">{files.length} Files</span>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {files.length === 0 ? (
              <span className="text-xs text-slate-400 italic block text-center py-10">No certificates files verified in system yet.</span>
            ) : (
              files.map((file, idx) => (
                <div key={idx} className="p-3 border border-slate-100 rounded-xl space-y-1.5 text-xs hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-bold text-slate-700 truncate max-w-[170px]" title={file.name}>{file.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium">{file.mimeType}</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

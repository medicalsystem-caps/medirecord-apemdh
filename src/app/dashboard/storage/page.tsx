'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getR2FilesAction } from '@/app/actions/storage';
import {
  ShieldAlert,
  Calendar,
  Layers,
  Download,
  Eye,
  X,
  Search,
  FileText,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StorageManagementPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<{ name: string; size: number; mimeType: string; uploadedAt: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null);

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      const R2files = await getR2FilesAction();
      setFiles(R2files);
    } catch (e) {
      toast.error('Failed to load registered files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
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

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Retrieving registered documents...</span>
        </div>
      </div>
    );
  }

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">Secure Vault</span>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">Registered Attachments & Files</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Layers className="h-4.5 w-4.5 text-slate-400" />
            <span>Files Registry ({filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''})</span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredFiles.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-2">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <span className="text-xs text-slate-400 italic block">No attachments matched your query.</span>
            </div>
          ) : (
            filteredFiles.map((file, idx) => (
              <div key={idx} className="p-4 border border-slate-100 bg-slate-50/25 rounded-2xl flex flex-col justify-between hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200 group">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-bold text-slate-700 truncate text-xs break-all" title={file.name}>{file.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-white px-2 py-0.5 border rounded-md">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5 text-teal-600" />
                      {file.mimeType}
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 mt-4 border-t border-slate-100/60 justify-end">
                  <button
                    onClick={() => setPreviewFile({ name: file.name, url: file.url })}
                    className="text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-bold text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer font-bold text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-up">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">Document Viewer</span>
                <h3 className="text-sm font-bold text-slate-800 truncate max-w-[500px]" title={previewFile.name}>{previewFile.name}</h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 flex items-center justify-center min-h-[400px]">
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(previewFile.url) || /\.(jpg|jpeg|png|gif|webp)$/i.test(previewFile.name) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-xs"
                />
              ) : (
                <iframe
                  src={`${previewFile.url}#toolbar=0`}
                  className="w-full h-[65vh] border-0 rounded-xl shadow-xs bg-white"
                  title={previewFile.name}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setPreviewFile(null)}
                className="btn-secondary text-xs !py-1.5 px-4"
              >
                Close
              </button>
              <a
                href={previewFile.url}
                download={previewFile.name}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs !py-1.5 px-4"
              >
                Download File
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

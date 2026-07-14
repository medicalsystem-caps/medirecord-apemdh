'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuditLogsAction } from '@/app/actions/audit';
import { AuditLog } from '@/lib/types';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogsAction(search, actionFilter);
      setLogs(res);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, actionFilter]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No logs available to export.');
      return;
    }

    try {
      // Build CSV content
      const headers = ['Log ID', 'User Email', 'User Role', 'Action Type', 'Description', 'IP Address', 'Timestamp'];
      const rows = logs.map((log) => [
        log.id,
        log.userEmail,
        log.userRole,
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.ipAddress || '127.0.0.1',
        log.timestamp,
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `medirecord_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Audit trail downloaded successfully as CSV.');
    } catch (err) {
      toast.error('Failed to compile CSV file.');
    }
  };

  // Enforce access control
  if (user?.role !== 'ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-sm flex flex-col gap-3">
        <span className="font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Restrained
        </span>
        <p>This module contains secure HIPAA-audited system logs and is restricted to Hospital Administrators only.</p>
        <Link href="/dashboard" className="text-teal-700 font-bold underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">System Transparency</span>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">Secure System Audit Trail</h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by email, message, or IP..."
            className="input-field input-field-icon-left"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Action Types</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="RECORD_CREATE">RECORD_CREATE</option>
            <option value="RECORD_UPDATE">RECORD_UPDATE</option>
            <option value="RECORD_CERTIFY">RECORD_CERTIFY</option>
            <option value="RECORD_VERIFY">RECORD_VERIFY</option>
            <option value="RECORD_APPROVE">RECORD_APPROVE</option>
            <option value="RECORD_SUBMIT">RECORD_SUBMIT</option>
            <option value="FILE_UPLOAD">FILE_UPLOAD</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
            <option value="USER_CREATE">USER_CREATE</option>
            <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
          </select>
        </div>

      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Querying security records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <History className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No Audit Logs Found</p>
            <p className="text-xs text-slate-400">Modify your filters or queries to check older dates.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Operator Info</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Detailed Description</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  let actionBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (log.action.includes('CREATE')) actionBadge = 'bg-green-50 text-green-700 border-green-200';
                  else if (log.action.includes('APPROVE') || log.action.includes('SUBMIT') || log.action.includes('CERTIFY') || log.action.includes('VERIFY')) actionBadge = 'bg-teal-50 text-teal-700 border-teal-200';
                  else if (log.action.includes('LOGIN')) actionBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  else if (log.action.includes('RESET') || log.action.includes('CHANGE')) actionBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{log.userEmail}</span>
                        <span className="text-[9px] text-slate-400 block font-semibold">{log.userRole}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-bold ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 max-w-xs md:max-w-sm truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

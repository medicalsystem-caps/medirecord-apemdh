'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { changePasswordAction } from '@/app/actions/auth';
import { HeartPulse, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const { user, refreshUser, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const result = await changePasswordAction(undefined, newPassword);
      if (result.success) {
        toast.success('Password updated successfully. Access granted.');
        // Refresh session context to clear mustChangePassword flag
        await refreshUser();
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to change password.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-teal-50/50 via-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-teal-900/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-700" />
        
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="MediRecord Logo" className="h-12 w-auto object-contain" />
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Security Portal</span>
            <h2 className="text-sm font-bold text-slate-800">Mandatory Password Change</h2>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs space-y-1">
          <p className="font-semibold">First-Time Sign In Detected</p>
          <p className="opacity-90">To comply with the Data Privacy Act of 2012 (RA 10173), you are required to change your temporary password before accessing patient registries.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">Logged in as:</span>
            <span className="text-xs font-bold text-slate-800 block">{user?.name} ({user?.email})</span>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">New Secure Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="input-field input-field-icons-both"
                required
                disabled={loading}
              />
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="input-field input-field-icons-both"
                required
                disabled={loading}
              />
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center font-bold text-sm"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Password & Continue'
              )}
            </button>
            
            <button
              type="button"
              onClick={logout}
              className="btn-secondary w-full py-2 flex items-center justify-center text-xs font-semibold text-slate-500"
            >
              Cancel & Log Out
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-2 text-center text-[10px] text-slate-400">
          <div className="flex justify-center items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-slate-400" />
            <span>Passes complexity requirements</span>
          </div>
          <span className="uppercase tracking-widest block font-medium">Secured APEMDH Civil Registry</span>
        </div>
      </motion.div>
    </div>
  );
}

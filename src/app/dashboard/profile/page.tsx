'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { changePasswordAction } from '@/app/actions/auth';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Calendar,
  Lock,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  
  // Form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleNameMapping = {
    ADMIN: 'Hospital Administrator',
    MRO: 'Medical Records Officer (MRO)',
    PHYSICIAN: 'Hospital Attending Physician',
    CRO: 'Civil Registry Officer (CRO)',
    LCR: 'Local Civil Registrar (LCR)',
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const result = await changePasswordAction(oldPassword, newPassword);
      if (result.success) {
        toast.success('Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">User Center</span>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">Account Profile Settings</h1>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left column: User profile card */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-sm mb-3 ${
              user.role === 'ADMIN' ? 'bg-red-600' :
              user.role === 'PHYSICIAN' ? 'bg-emerald-600' :
              user.role === 'MRO' ? 'bg-blue-600' :
              user.role === 'CRO' ? 'bg-purple-600' : 'bg-amber-600'
            }`}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h2 className="font-bold text-slate-800 text-base leading-tight">{user.name}</h2>
            <span className="text-xs text-slate-400 mt-1">{user.email}</span>
          </div>

          <div className="space-y-3.5 text-xs font-semibold">
            
            {/* Role details */}
            <div className="flex items-start gap-2.5">
              <Shield className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-medium">Registry Role</span>
                <span className="text-slate-700 block mt-0.5">{roleNameMapping[user.role]}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2.5">
              <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-medium">Email Identity</span>
                <span className="text-slate-700 block mt-0.5">{user.email}</span>
              </div>
            </div>

            {/* Account created */}
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-medium">Registered Since</span>
                <span className="text-slate-700 block mt-0.5">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Password update */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
            <Lock className="h-4.5 w-4.5 text-slate-400" />
            <span>Update login password</span>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs font-semibold">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-slate-600 block">Current Password *</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input-field input-field-icons-both"
                  required
                  disabled={loading}
                />
                <KeyRound className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-slate-600 block">New Secure Password *</label>
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-slate-600 block">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype secure password"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center font-bold"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Password Settings'
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}

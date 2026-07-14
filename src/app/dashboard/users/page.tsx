'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getUsersAction,
  createUserAction,
  toggleUserStatusAction,
  resetUserPasswordAction,
} from '@/app/actions/users';
import { User, UserRole } from '@/lib/types';
import {
  Users,
  Plus,
  KeyRound,
  ShieldAlert,
  Search,
  UserCheck,
  UserX,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('MRO');

  // Displaying temporary password
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsersAction();
      setUsers(res);
    } catch (e) {
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await createUserAction({
        name: newName,
        email: newEmail,
        role: newRole,
      });

      // Captured temporary password from custom metadata field
      if ((res as any).notes) {
        setTempPassword((res as any).notes);
      }
      
      toast.success('User account created successfully.');
      setNewName('');
      setNewEmail('');
      setNewRole('MRO');
      setCreateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user.');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      setLoading(true);
      const res = await toggleUserStatusAction(userId);
      toast.success(`Account status updated to ${res.status}.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password? They will be forced to change it on their next login.')) {
      return;
    }

    try {
      setLoading(true);
      const tempPass = await resetUserPasswordAction(userId);
      setTempPassword(tempPass);
      toast.success('Password reset completed.');
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Password copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Enforce access control
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-sm flex flex-col gap-3">
        <span className="font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Restrained
        </span>
        <p>This module contains administrative user directories and is restricted to Hospital Administrators only.</p>
        <Link href="/dashboard" className="text-teal-700 font-bold underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">Hospital Directory</span>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5 font-sans">User Management</h1>
        </div>
        <button
          onClick={() => {
            setCreateModalOpen(true);
            setTempPassword(null);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Temporary Password Notice Modal */}
      <AnimatePresence>
        {tempPassword && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setTempPassword(null)}
              className="fixed inset-0 bg-slate-900 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto h-fit w-full max-w-md bg-white border border-slate-200 p-6 rounded-3xl z-50 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <KeyRound className="h-4.5 w-4.5" />
                  <span>Copy Temporary Password</span>
                </div>
                <button onClick={() => setTempPassword(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  A temporary password has been allocated for this user. Copy it now and share it securely. The user is required to reset it upon their first sign in.
                </p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="font-mono font-bold text-sm text-slate-800 select-all flex-1 tracking-wider">{tempPassword}</span>
                  <button
                    onClick={() => copyToClipboard(tempPassword)}
                    className="p-2 hover:bg-white text-slate-500 rounded-lg border border-slate-200 hover:text-teal-700 transition-colors shadow-xs"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => setTempPassword(null)}
                    className="btn-primary bg-amber-600 hover:bg-amber-700 border-none"
                  >
                    Close & Finish
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or role..."
            className="input-field input-field-icon-left"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Querying user accounts...</span>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Authorized Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Password State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all duration-100">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{u.name}</span>
                    <span className="text-[10px] text-slate-400 block">{u.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-700">{u.role}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.status === 'ACTIVE'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.mustChangePassword ? (
                      <span className="text-amber-600 font-semibold block">Must Reset Password</span>
                    ) : (
                      <span className="text-slate-400 block">Verified / Secure</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {/* Password Reset */}
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      className="btn-secondary py-1 px-2 text-[10px] inline-flex items-center gap-1.5 hover:border-amber-500 hover:text-amber-700"
                      title="Force Temporary Password Reset"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Reset</span>
                    </button>

                    {/* Deactivate/Activate toggle */}
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`btn-secondary py-1 px-2 text-[10px] inline-flex items-center gap-1.5 ${
                          u.status === 'ACTIVE'
                            ? 'hover:border-red-500 hover:text-red-700'
                            : 'hover:border-green-500 hover:text-green-700'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <span className="text-xs text-slate-400 italic block text-center py-10">No users found.</span>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 space-y-3 text-xs bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{u.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{u.email}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    u.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {u.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg">
                  <span>Role: <strong className="text-slate-700">{u.role}</strong></span>
                  <span>
                    {u.mustChangePassword ? (
                      <span className="text-amber-600 font-semibold">Must Reset Password</span>
                    ) : (
                      <span className="text-slate-400">Verified / Secure</span>
                    )}
                  </span>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => handleResetPassword(u.id)}
                    className="btn-secondary py-1.5 px-3 text-[10px] inline-flex items-center gap-1.5 flex-1 justify-center hover:border-amber-500 hover:text-amber-700 shadow-xs"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Reset Password</span>
                  </button>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`btn-secondary py-1.5 px-3 text-[10px] inline-flex items-center gap-1.5 flex-1 justify-center shadow-xs ${
                        u.status === 'ACTIVE'
                          ? 'hover:border-red-500 hover:text-red-700'
                          : 'hover:border-green-500 hover:text-green-700'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="fixed inset-0 bg-slate-900 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto h-fit w-full max-w-md bg-white border border-slate-200 p-6 rounded-3xl z-50 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-700" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
                  <Users className="h-4.5 w-4.5" />
                  <span>Create User Account</span>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Full Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="input-field"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Email Address *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. mro@apemdh.gov"
                    className="input-field"
                    required
                  />
                </div>

                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Registry Access Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="input-field"
                  >
                    <option value="MRO">Medical Records Officer (MRO)</option>
                    <option value="PHYSICIAN">Physician (Attending Medical Cert)</option>
                    <option value="CRO">Civil Registry Officer (CRO)</option>
                    <option value="LCR">Local Civil Registrar (LCR)</option>
                    <option value="ADMIN">Hospital Administrator (ADMIN)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Account
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

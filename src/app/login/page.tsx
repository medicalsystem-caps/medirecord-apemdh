'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HeartPulse, KeyRound, Mail, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const loginError = await login(email, password);
    if (loginError) {
      setError(loginError);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-radial from-teal-50/50 via-slate-50 to-slate-100 p-4">
      
      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-teal-900/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-700" />
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-teal-700 text-white rounded-2xl shadow-md mb-3">
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-teal-800 tracking-widest uppercase">APEMDH Civil Registry Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">MediRecord</h1>
          <p className="text-slate-500 text-xs mt-1.5 max-w-xs">
            Enter your credentials to securely manage civil registry documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs flex items-start gap-2 animate-shake">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@apemdh.gov"
                className="input-field input-field-icon-left"
                required
                disabled={loading}
              />
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field input-field-icons-both"
                required
                disabled={loading}
              />
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center font-bold text-sm tracking-wide"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-medium">
            Authorized Personnel Only
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-medium mt-1">
            Secured with TLS 1.3 & RLS Policies
          </span>
        </div>
      </motion.div>
      
    </div>
  );
}

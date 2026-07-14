'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, ShieldAlert, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4 bg-slate-900"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(240, 253, 250, 0.75), rgba(248, 250, 252, 0.85)), url("/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)', transform: 'translate(-40%, -40%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #5eead4 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }}
      />

      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-white/80 rounded-3xl p-7 md:p-9 shadow-2xl shadow-teal-900/10 relative overflow-hidden"
      >
        {/* Top accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500" />

        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="mb-4 p-2 bg-teal-50 rounded-2xl ring-4 ring-teal-100/60">
            <img src="/logo.png" alt="MediRecord Logo" className="h-16 w-auto object-contain" />
          </div>
          <span className="text-[10px] font-bold text-teal-700 tracking-widest uppercase bg-teal-50 px-3 py-1 rounded-full">
            APEMDH Civil Registry Portal
          </span>
          <p className="text-slate-500 text-xs mt-3 max-w-xs leading-relaxed">
            Enter your credentials to securely manage civil registry documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-shake"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-[9px] text-slate-400 uppercase tracking-widest font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-500 shrink-0" />
          <span>Authorized Personnel Only · TLS 1.3 &amp; RLS Secured</span>
        </div>
      </motion.div>
    </div>
  );
}

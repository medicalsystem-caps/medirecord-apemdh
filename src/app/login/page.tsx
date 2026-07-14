'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HeartPulse, KeyRound, Mail, ShieldAlert, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-teal-50/50 via-slate-50 to-slate-100 p-4 md:p-8">
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Hospital Info & Credentials Quick Fill */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-700 text-white rounded-xl shadow-md">
              <HeartPulse className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">APEMDH Civil Registry Portal</span>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none mt-1">MediRecord</h1>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-sm md:text-base max-w-lg">
            A secure, web-based civil registry document management platform for Alfonso Ponce Enrile Memorial District Hospital. Developed to digitize, verify, approve, and securely archive birth and death certificates.
          </p>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Review Credentials (APEMDH Roles)</span>
            </div>
            
            <p className="text-xs text-slate-500">Click any role to auto-fill credentials (forces a mandatory password change on first login):</p>
            
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@medirecord.ph', 'AdminPassword123!')}
                className="text-left px-3 py-2 border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 rounded-lg text-xs transition-all duration-150 group"
              >
                <span className="font-bold text-slate-700 block group-hover:text-teal-800">Hospital Administrator</span>
                <span className="text-slate-500 block">admin@medirecord.ph</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('mro@apemdh.gov', 'MroPassword123!')}
                className="text-left px-3 py-2 border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 rounded-lg text-xs transition-all duration-150 group"
              >
                <span className="font-bold text-slate-700 block group-hover:text-teal-800">Medical Records Officer</span>
                <span className="text-slate-500 block">mro@apemdh.gov</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('physician@apemdh.gov', 'PhysicianPassword123!')}
                className="text-left px-3 py-2 border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 rounded-lg text-xs transition-all duration-150 group"
              >
                <span className="font-bold text-slate-700 block group-hover:text-teal-800">Hospital Physician</span>
                <span className="text-slate-500 block">physician@apemdh.gov</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('cro@apemdh.gov', 'CroPassword123!')}
                className="text-left px-3 py-2 border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 rounded-lg text-xs transition-all duration-150 group"
              >
                <span className="font-bold text-slate-700 block group-hover:text-teal-800">Civil Registry Officer</span>
                <span className="text-slate-500 block">cro@apemdh.gov</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('lcr@apemdh.gov', 'LcrPassword123!')}
                className="text-left px-3 py-2 border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 rounded-lg text-xs transition-all duration-150 group sm:col-span-2"
              >
                <span className="font-bold text-slate-700 block group-hover:text-teal-800">Local Civil Registrar (LCR)</span>
                <span className="text-slate-500 block text-center sm:text-left">lcr@apemdh.gov</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-teal-900/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-700" />
          
          <h2 className="text-xl font-bold text-slate-800">Secure Portal Access</h2>
          <p className="text-slate-500 text-xs mt-1">Please enter your credentials to authenticate.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div className="mt-6 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Secured with TLS 1.3 & RLS Policies</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

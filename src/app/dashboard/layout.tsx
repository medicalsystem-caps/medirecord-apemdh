'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Validating secure session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Collapsible Sidebar (Desktop) / Sliding Sidebar (Mobile) */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} className="hidden md:flex" />

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Sidebar container */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:hidden`}>
        <Sidebar collapsed={false} setCollapsed={() => {}} className="flex" />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pl-0 ${
        collapsed ? 'md:pl-[4.5rem]' : 'md:pl-64'
      }`}
      >
        {/* Top Navbar */}
        <Navbar collapsed={collapsed} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dynamic Inner Page */}
        <main className="flex-1 p-4 md:p-6 mt-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

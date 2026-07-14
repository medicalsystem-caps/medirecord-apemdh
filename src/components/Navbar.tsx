'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStorageStatusAction } from '@/app/actions/storage';
import { Menu, Bell, ShieldAlert, HardDrive, Info, AlertTriangle, AlertOctagon, LogOut } from 'lucide-react';
import { SystemSettings } from '@/lib/types';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
}

export default function Navbar({ sidebarOpen, setSidebarOpen, collapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const [storage, setStorage] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const res = await getStorageStatusAction();
        setStorage(res);
      } catch (err) {
        console.error('Failed to load storage status in navbar', err);
      }
    };

    fetchStorage();
    // Poll storage status every 10 seconds to keep usage bar in sync
    const interval = setInterval(fetchStorage, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const usageBytes = storage?.storageUsageBytes || 0;
  const maxBytes = storage?.maxStorageBytes || (10 * 1024 * 1024 * 1024);
  const usagePercentage = (usageBytes / maxBytes) * 100;
  const usageGB = (usageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const maxGB = (maxBytes / (1024 * 1024 * 1024)).toFixed(2);

  // Status flags
  const is80Percent = usagePercentage >= 80;
  const is90Percent = usagePercentage >= 90;
  const is95Percent = usagePercentage >= 95; // 9.5 GB limit

  // Color mapping based on usage
  let barColor = 'bg-teal-600';
  let badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
  let storageIcon = <Info className="h-3 w-3 text-teal-600" />;
  let storageLabel = 'R2 Normal';

  if (is95Percent) {
    barColor = 'bg-red-600 animate-pulse';
    badgeColor = 'bg-red-50 text-red-800 border-red-200 animate-pulse';
    storageIcon = <AlertOctagon className="h-3.5 w-3.5 text-red-600" />;
    storageLabel = 'Uploads Disabled (95%+)';
  } else if (is90Percent) {
    barColor = 'bg-amber-500 animate-pulse';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    storageIcon = <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
    storageLabel = 'R2 Severe Warning (90%+)';
  } else if (is80Percent) {
    barColor = 'bg-blue-500';
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
    storageIcon = <Info className="h-3.5 w-3.5 text-blue-600" />;
    storageLabel = 'R2 High Usage (80%+)';
  }

  return (
    <header className={`h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 fixed top-0 right-0 left-0 z-20 transition-all duration-300 ${
      collapsed ? 'md:left-[4.5rem]' : 'md:left-64'
    }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden sm:block">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Gonzaga, Cagayan</span>
          <h2 className="text-sm font-bold text-slate-700 leading-tight">Alfonso Ponce Enrile Memorial District Hospital</h2>
        </div>
        <div className="sm:hidden">
          <h2 className="text-sm font-bold text-slate-700">APEMDH</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Cloudflare R2 Storage Monitor bar */}
        <div className="hidden lg:flex flex-col w-56 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-slate-400" />
              R2 Cloud Storage
            </span>
            <span className="font-bold text-slate-700">{usagePercentage.toFixed(1)}% ({usageGB} GB)</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(100, usagePercentage)}%` }} />
          </div>
        </div>

        {/* Warning Indicator Badge */}
        {(is80Percent || is90Percent || is95Percent) && (
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border rounded-lg ${badgeColor}`}>
            {storageIcon}
            <span>{storageLabel}</span>
          </div>
        )}

        {/* Info indicator for screen reader */}
        <span className="sr-only">Storage limit {usageGB} GB of {maxGB} GB</span>

        {/* Notifications Mock */}
        <div className="relative">
          <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-teal-600 rounded-full ring-2 ring-white" />
          </button>
        </div>

        {/* Border delimiter */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Logged in User Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name}</span>
            <span className="text-[10px] text-slate-400 block font-semibold leading-none mt-0.5">{user.role}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}

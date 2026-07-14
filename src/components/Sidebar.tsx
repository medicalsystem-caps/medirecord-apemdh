'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Baby,
  FileText,
  Users,
  HardDrive,
  History,
  BarChart3,
  Settings,
  LogOut,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  className?: string;
}

export default function Sidebar({ collapsed, setCollapsed, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleNameMapping = {
    ADMIN: 'Administrator',
    MRO: 'Records Officer',
    PHYSICIAN: 'Hospital Physician',
    CRO: 'Registry Officer',
    LCR: 'Civil Registrar',
  };

  const roleColorMapping = {
    ADMIN: 'bg-red-50 text-red-700 border-red-200',
    MRO: 'bg-blue-50 text-blue-700 border-blue-200',
    PHYSICIAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CRO: 'bg-purple-50 text-purple-700 border-purple-200',
    LCR: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  // Define navigation items and which roles can access them
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MRO', 'PHYSICIAN', 'CRO', 'LCR'],
    },
    {
      title: 'Birth Certificates',
      href: '/dashboard/birth',
      icon: Baby,
      roles: ['ADMIN', 'MRO', 'PHYSICIAN', 'CRO', 'LCR'],
    },
    {
      title: 'Death Certificates',
      href: '/dashboard/death',
      icon: FileText,
      roles: ['ADMIN', 'MRO', 'PHYSICIAN', 'CRO', 'LCR'],
    },
    {
      title: 'Reports & Analytics',
      href: '/dashboard/reports',
      icon: BarChart3,
      roles: ['ADMIN', 'MRO', 'PHYSICIAN', 'CRO', 'LCR'],
    },
    {
      title: 'User Management',
      href: '/dashboard/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      title: 'Storage Monitor',
      href: '/dashboard/storage',
      icon: HardDrive,
      roles: ['ADMIN'],
    },
    {
      title: 'System Audit Logs',
      href: '/dashboard/audit',
      icon: History,
      roles: ['ADMIN'],
    },
    {
      title: 'Profile Settings',
      href: '/dashboard/profile',
      icon: Settings,
      roles: ['ADMIN', 'MRO', 'PHYSICIAN', 'CRO', 'LCR'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <motion.aside
      animate={{ width: collapsed ? '4.5rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 shrink-0 select-none shadow-sm shadow-slate-100 ${className || ''}`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img src="/logo.png" alt="MediRecord Logo" className="h-8 w-8 object-contain shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="font-extrabold text-slate-800 tracking-tight text-base"
            >
              MediRecord
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg hidden md:block"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User Information */}
      <div className="p-4 border-b border-slate-100 flex flex-col items-center">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${
          user.role === 'ADMIN' ? 'bg-red-600' :
          user.role === 'PHYSICIAN' ? 'bg-emerald-600' :
          user.role === 'MRO' ? 'bg-blue-600' :
          user.role === 'CRO' ? 'bg-purple-600' : 'bg-amber-600'
        }`}>
          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center w-full overflow-hidden"
          >
            <h3 className="font-bold text-slate-800 text-sm truncate leading-tight">{user.name}</h3>
            <span className="text-[10px] text-slate-400 block truncate mb-1.5">{user.email}</span>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColorMapping[user.role]}`}>
              {roleNameMapping[user.role]}
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allowedNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                isActive
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'}`} />
              
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {item.title}
                </motion.span>
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap shadow-md">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50/50 transition-all duration-150 group relative"
        >
          <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600 shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Sign Out
            </motion.span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap shadow-md">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

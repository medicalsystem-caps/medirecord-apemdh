'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getNavbarNotificationsAction } from '@/app/actions/dashboard';
import { Menu, Bell, ShieldAlert, LogOut, CheckCircle, X, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { SystemSettings } from '@/lib/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
}

export default function Navbar({ sidebarOpen, setSidebarOpen, collapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<{ id: string; type: 'warning' | 'info' | 'danger'; message: string; link: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const fetchNavbarData = async () => {
    try {
      const notifs = await getNavbarNotificationsAction();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load navbar metrics:', err);
    }
  };

  useEffect(() => {
    fetchNavbarData();
    // Poll navbar alerts and storage status every 10 seconds to keep widgets in sync
    const interval = setInterval(fetchNavbarData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

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

        {/* Notifications Dropdown Panel */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
          
          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Backdrop handler to close on click outside */}
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-4 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alert Notifications</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{notifications.length} Alerts</span>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                        <CheckCircle className="h-8 w-8 text-teal-600 mx-auto opacity-70 mb-1" />
                        <p className="font-bold text-slate-600">All Systems Clear</p>
                        <p className="text-[10px] opacity-80">No security or storage issues detected.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        let NotifIcon = Info;
                        let textClass = 'text-blue-700';
                        let bgClass = 'bg-blue-50/50 border-blue-100';
                        if (notif.type === 'danger') {
                          NotifIcon = AlertOctagon;
                          textClass = 'text-red-700';
                          bgClass = 'bg-red-50/50 border-red-100';
                        } else if (notif.type === 'warning') {
                          NotifIcon = AlertTriangle;
                          textClass = 'text-amber-700';
                          bgClass = 'bg-amber-50/50 border-amber-100';
                        }
                        
                        return (
                          <Link 
                            href={notif.link} 
                            key={notif.id}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex gap-2.5 p-2.5 border rounded-xl hover:shadow-xs transition-shadow block text-[11px] font-medium leading-normal ${bgClass} ${textClass}`}
                          >
                            <NotifIcon className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{notif.message}</span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
            onClick={() => setShowSignOutConfirm(true)}
            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOutConfirm(false)}
              className="fixed inset-0 bg-slate-900 z-50"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto h-fit w-full max-w-sm bg-white border border-slate-200 p-6 rounded-3xl z-[60] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
              
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <LogOut className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-slate-800 text-sm">Confirm Sign Out</h3>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to end your current session and sign out of the system? Any unsaved edits will be discarded.
                </p>
                
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={logout}
                    className="btn-primary bg-red-600 hover:bg-red-700 border-none text-white font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

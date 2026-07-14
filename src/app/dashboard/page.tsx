'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDashboardStatsAction } from '@/app/actions/dashboard';
import { useAuth } from '@/context/AuthContext';
import {
  Baby,
  FileText,
  FileClock,
  Archive,
  HardDrive,
  Activity,
  UserCheck,
  PlusCircle,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    totalBirths: number;
    totalDeaths: number;
    totalPending: number;
    totalApproved: number;
    totalArchived: number;
  };
  monthlyData: any[];
  recentActivities: any[];
  storage: {
    storageUsageBytes: number;
    maxStorageBytes: number;
    uploadsDisabled: boolean;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show warning toast if redirected with unauthorized flag
    const err = searchParams.get('error');
    if (err === 'unauthorized') {
      toast.error('Access Denied: You do not have permission to view that resource.');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await getDashboardStatsAction();
        setData(stats);
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Assembling registry metrics...</span>
        </div>
      </div>
    );
  }

  const { stats, monthlyData, recentActivities, storage } = data;
  const storageGB = (storage.storageUsageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const storageMaxGB = (storage.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const storagePercentage = (storage.storageUsageBytes / storage.maxStorageBytes) * 100;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">APEMDH Civil Registry Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Birth Records',
            value: stats.totalBirths,
            desc: 'Birth certificates cataloged',
            icon: Baby,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            title: 'Total Death Records',
            value: stats.totalDeaths,
            desc: 'Death certificates cataloged',
            icon: FileText,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
          {
            title: 'Pending Action',
            value: stats.totalPending,
            desc: 'Requires review / signatures',
            icon: FileClock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            title: 'Archived Documents',
            value: stats.totalArchived,
            desc: 'Locked and fully submitted',
            icon: Archive,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
          },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              key={m.title}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex items-start justify-between group"
            >
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">{m.title}</span>
                <span className="text-2xl font-black text-slate-800 block group-hover:scale-105 transition-transform origin-left">{m.value}</span>
                <span className="text-[10px] text-slate-500 block">{m.desc}</span>
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${m.bg} ${m.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Storage Row */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Registration Counts chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Registrations</h3>
              <p className="text-[10px] text-slate-400">Registry submissions comparison (Last 6 Months)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Births
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Deaths
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBirth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeath" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Births" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBirth)" />
                <Area type="monotone" dataKey="Deaths" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDeath)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cloudflare R2 Storage Stats */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Cloudflare R2 Storage</h3>
            <p className="text-[10px] text-slate-400">Total hospital supporting attachment allocation</p>
          </div>

          {/* Circle Gauge */}
          <div className="flex justify-center py-2 relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="54" className="stroke-slate-100" strokeWidth="8" fill="transparent" />
              <circle cx="64" cy="64" r="54" 
                className={`transition-all duration-500 ease-out ${
                  storagePercentage >= 95 ? 'stroke-red-600' :
                  storagePercentage >= 90 ? 'stroke-amber-500' :
                  storagePercentage >= 80 ? 'stroke-blue-500' : 'stroke-teal-600'
                }`}
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - Math.min(100, storagePercentage) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-800">{storagePercentage.toFixed(1)}%</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{storageGB} GB Used</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
              <span className="text-slate-500 font-medium">Free Capacity:</span>
              <span className="font-bold text-slate-800">{(storage.maxStorageBytes / (1024 * 1024 * 1024) - parseFloat(storageGB)).toFixed(2)} GB</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Provision:</span>
              <span className="font-bold text-slate-800">{storageMaxGB} GB</span>
            </div>

            {storagePercentage >= 95 ? (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-800 font-semibold flex gap-1.5 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>Uploads are disabled automatically as storage has reached the 9.5 GB safety limit.</span>
              </div>
            ) : storagePercentage >= 90 ? (
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800 font-semibold flex gap-1.5 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <span>R2 threshold critical (&gt;90%). Please archive or download older files.</span>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Recent Activities Row */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Recent Audit Activities</h3>
          <p className="text-[10px] text-slate-400">Latest administrative and registry workflow tracking</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">User / Role</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Activity Description</th>
                <th className="pb-3 pr-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (act.action.includes('CREATE')) badgeColor = 'bg-green-50 text-green-700 border-green-200';
                else if (act.action.includes('APPROVE') || act.action.includes('SUBMIT')) badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
                else if (act.action.includes('LOGIN')) badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                else if (act.action.includes('RESET') || act.action.includes('CHANGE')) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={act.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-slate-800 block">{act.userEmail}</span>
                      <span className="text-[10px] text-slate-400 block">{act.userRole}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-bold ${badgeColor}`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-600">{act.description}</td>
                    <td className="py-3 pr-2 text-right text-slate-400 font-medium">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import AttendanceTable from "../../../components/AttendanceTable";
import {
  Zap,
  Skull,
  TrendingUp,
  AlertCircle,
  Activity,
  BarChart3,
  Clock,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from "next/link";

interface Bottleneck {
  status: string;
  avgDays: number;
}

interface TaskAudit {
  id: string;
  title: string;
  shopName: string;
  staleHours: number;
}

export default function TishPage() {
  const [bottleneckData, setBottleneckData] = useState<Bottleneck[]>([]);
  const [staleTasks, setStaleTasks] = useState<TaskAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch("/api/tasks/audit");
        if (res.ok) {
          const data = await res.json();
          setBottleneckData(data.bottleneckData || []);
          setStaleTasks(data.staleTasks || []);
        }
      } catch (err) {
        console.error("Fetch audit error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-indigo-600" size={32} />
            Tish Command Center
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 opacity-70">Unified Administrative Oversight</p>
        </div>

        <Link
          href="/activities/report"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-black transition-all"
        >
          <Activity size={18} />
          Detailed Lifecycle Trails
        </Link>
      </header>

      {/* Intelligence Section (New Updates) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bottleneck Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="text-indigo-500" size={20} />
                Bottleneck Analysis
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status Wait Time Trends</p>
            </div>
          </div>

          <div className="h-[200px] w-full">
            {loading ? (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Calculating Metrics...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottleneckData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="status"
                    type="category"
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '12px' }}
                  />
                  <Bar dataKey="avgDays" radius={[0, 8, 8, 0]} barSize={20}>
                    {bottleneckData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Red Zone Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Skull size={100} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-lg font-black flex items-center gap-2 text-rose-500">
                <AlertCircle size={20} />
                Red Zone
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tasks Stale {'>'} 48h</p>
            </div>

            <div className="flex-1 space-y-3">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)
              ) : staleTasks.length > 0 ? (
                staleTasks.slice(0, 5).map((task, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black truncate">{task.title}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{task.shopName}</p>
                    </div>
                    <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded ml-2">{task.staleHours}h</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Zap size={24} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-[10px] font-black">Velocity is Optimal</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Existing Attendance Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Attendance Log</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time presence monitoring</p>
          </div>
        </div>
        <div className="p-4">
          <AttendanceTable />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
    Clock,
    User,
    History,
    AlertCircle,
    Timer,
    UserPlus,
    ChevronDown,
    ChevronUp,
    Search,
    BarChart3,
    Zap,
    Skull,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatusLog {
    status: string;
    enterTime: string;
    exitTime: string | null;
    durationMs: number;
}

interface ReassignmentLog {
    time: string;
    content: string;
    author: string;
}

interface TaskAudit {
    id: string;
    title: string;
    shopName: string;
    createdAt: string;
    lastActivityAt: string;
    createdByName: string;
    currentStatus: string;
    statusHistory: StatusLog[];
    reassignments: ReassignmentLog[];
    totalActivities: number;
    isStale: boolean;
    staleHours: number;
}

interface Bottleneck {
    status: string;
    avgDays: number;
}

export default function DeepAnalysisPage() {
    const [auditData, setAuditData] = useState<TaskAudit[]>([]);
    const [bottleneckData, setBottleneckData] = useState<Bottleneck[]>([]);
    const [staleTasks, setStaleTasks] = useState<TaskAudit[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await fetch("/api/tasks/audit");
                const data = await res.json();

                if (res.ok) {
                    setAuditData(data.auditData || []);
                    setBottleneckData(data.bottleneckData || []);
                    setStaleTasks(data.staleTasks || []);
                    if (data.auditData?.length === 0) {
                        setError("No task data found. Try creating or updating some tasks first.");
                    }
                } else {
                    setError(data.error || "Failed to fetch audit data");
                    toast.error(data.error || "Access Denied");
                }
            } catch (err) {
                console.error("Fetch audit error:", err);
                setError("Network error: Could not reach the audit server.");
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, []);

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("todo")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (s.includes("progress")) return "bg-amber-100 text-amber-700 border-amber-200";
        if (s.includes("done")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

    const filteredData = auditData.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.createdByName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-slate-900 text-white rounded-[20px] shadow-2xl">
                                <Zap size={24} className="fill-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tish Intel <span className="text-indigo-600">Report</span></h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] opacity-70">Intelligence & Lifecycle Audit</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks, shops, or creators..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {error && (
                    <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-[32px] flex items-center gap-4 text-rose-700">
                        <AlertCircle className="shrink-0" />
                        <div>
                            <p className="font-bold">System Insight</p>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Aggregating Intelligence</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Parsing lifecycle logs and identifying bottlenecks...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Top Analytics Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Bottleneck Analysis Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                            <TrendingUp className="text-indigo-500" size={20} />
                                            Bottleneck Analysis
                                        </h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Average Wait Time by Status</p>
                                    </div>
                                </div>

                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={bottleneckData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="status"
                                                type="category"
                                                tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                                width={100}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                                formatter={(value) => [`${value} Days`, 'Average Wait']}
                                            />
                                            <Bar dataKey="avgDays" radius={[0, 10, 10, 0]} barSize={24}>
                                                {bottleneckData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Red Zone (Stale Tasks) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-4 bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Skull size={120} />
                                </div>
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-black flex items-center gap-2 text-rose-500">
                                            <AlertCircle size={20} />
                                            The Red Zone
                                        </h2>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Silent Tasks {'>'} 48 Hours</p>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {staleTasks.length > 0 ? (
                                            staleTasks.map((task, i) => (
                                                <div key={i} className="group p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-black truncate max-w-[150px]">{task.title}</span>
                                                        <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded uppercase">{task.staleHours}h Still</span>
                                                    </div>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{task.shopName}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                                    <Zap size={20} />
                                                </div>
                                                <p className="text-xs font-black">Zero Stagnation</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Excellent task velocity maintained.</p>
                                            </div>
                                        )}
                                    </div>

                                    {staleTasks.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{staleTasks.length} CRITICAL BLOCKS DETECTED</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Audit Feed */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-6 px-4">Detailed Lifecycle Trails</h2>
                            {filteredData.map((task) => (
                                <motion.div
                                    layout
                                    key={task.id}
                                    className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-100 transition-all"
                                >
                                    <div
                                        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="shrink-0 w-12 h-12 bg-slate-50 rounded-[18px] flex items-center justify-center border border-slate-100 font-black text-slate-400 transition-transform group-hover:scale-110">
                                                {task.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 leading-tight mb-0.5">{task.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} className="text-indigo-400" /> {task.createdByName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-indigo-400" /> {format(new Date(task.createdAt), "dd MMM")}
                                                    </span>
                                                    {task.shopName !== "N/A" && (
                                                        <span className="text-indigo-600 font-black">
                                                            {task.shopName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(task.currentStatus)}`}>
                                                {task.currentStatus}
                                            </div>
                                            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                {expandedTaskId === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedTaskId === task.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-50 bg-slate-50/30"
                                            >
                                                <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-12">
                                                    {/* Timeline of Status */}
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                                            <History size={14} className="text-indigo-500" /> Movement History
                                                        </h4>
                                                        <div className="space-y-8 relative">
                                                            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200" />
                                                            {task.statusHistory.map((log, i) => (
                                                                <div key={i} className="relative pl-12">
                                                                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-[14px] flex items-center justify-center z-10 shadow-sm border ${getStatusColor(log.status)}`}>
                                                                        <Timer size={16} />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center gap-3 mb-1">
                                                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.status}</span>
                                                                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                                                                {formatDuration(log.durationMs)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            {format(new Date(log.enterTime), "dd MMM, HH:mm")}
                                                                            {log.exitTime && ` → ${format(new Date(log.exitTime), "dd MMM, HH:mm")}`}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Stats & Ownership */}
                                                    <div className="space-y-8">
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                                <UserPlus size={14} className="text-indigo-500" /> Ownership Audit
                                                            </h4>
                                                            {task.reassignments.length > 0 ? (
                                                                <div className="space-y-4">
                                                                    {task.reassignments.map((re, i) => (
                                                                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                                                                            <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                                                                                <UserPlus size={14} />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className="text-xs font-bold text-slate-700 leading-tight mb-2">{re.content}</p>
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{re.author}</span>
                                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDistanceToNow(new Date(re.time))} ago</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="p-8 text-center bg-white/50 border border-dashed border-slate-200 rounded-[24px]">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Static Ownership Pattern</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                                                            <div className="absolute -bottom-4 -right-4 text-white opacity-[0.03] scale-150 rotate-12">
                                                                <Zap size={100} fill="currentColor" />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-400">Task Performance</h5>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-white/5 p-3 rounded-2xl">
                                                                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Total Logs</div>
                                                                        <div className="text-lg font-black">{task.totalActivities}</div>
                                                                    </div>
                                                                    <div className="bg-white/5 p-3 rounded-2xl">
                                                                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Last Action</div>
                                                                        <div className="text-lg font-black">{formatDistanceToNow(new Date(task.lastActivityAt))}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

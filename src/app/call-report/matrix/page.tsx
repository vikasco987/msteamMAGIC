"use client";

import React, { useEffect, useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { 
    Activity, 
    Calendar, 
    Download, 
    Database, 
    ArrowLeft, 
    TrendingUp, 
    Users, 
    Target,
    Zap,
    Shield,
    Award
} from "lucide-react";
import toast from "react-hot-toast";

export default function GrandMatrixPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [matrixData, setMatrixData] = useState<any[]>([]);

    const fetchMatrix = async (targetDate: Date) => {
        setLoading(true);
        try {
            const dateStr = format(targetDate, "yyyy-MM-dd");
            const res = await fetch(`/api/call-report/matrix?start=${dateStr}&end=${dateStr}&range=CUSTOM`);
            const json = await res.json();
            
            if (res.ok) {
                // 🛡️ FILTER: Remove users with ALL ZEROS
                const activeOnes = json.report.filter((u: any) => 
                    u.untouched > 0 || u.pending > 0 || u.reachout > 0 || u.connected > 0 || 
                    u.newReachout > 0 || u.newConnected > 0 || u.followupCalls > 0 || 
                    u.onboarding > 0 || u.sales > 0 || u.todo > 0 || u.progress > 0
                );
                setMatrixData(activeOnes);
            }
        } catch (error) { 
            toast.error("Failed to sync matrix core"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchMatrix(date);
    }, [date]);

    const downloadCSV = () => {
        if (!matrixData || matrixData.length === 0) return;
        const headers = ["Row", "Staff Identity", "Untouched", "Pending F/U", "Created", "Reachout", "Calls Conn", "New Reach", "New Conn", "F/U Calls", "F/U Conn", "Today ONB", "Today Sales"];
        const rows = matrixData.map((u, i) => [
            i + 1, u.name, u.untouched, u.pending, u.created, u.reachout, 
            u.connected, u.newReachout, u.newConnected, u.followupCalls, u.followupConnected, 
            u.onboarding, u.sales
        ]);
        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Master_Performance_${format(date, "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Exported!");
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* Header Control Bar */}
            <div className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => window.history.back()}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <Shield size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Master Intelligence Matrix</h1>
                                <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Real-time Performance Monitoring
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                        <button onClick={() => setDate(subDays(date, 1))} className="p-2.5 hover:bg-white/10 rounded-xl transition-all font-black text-slate-400 hover:text-white opacity-60 hover:opacity-100">
                             ←
                        </button>
                        <div className="flex items-center gap-3 px-6 py-1 border-x border-white/5">
                            <Calendar size={14} className="text-indigo-400" />
                            <span className="text-sm font-black text-white tracking-widest uppercase">{format(date, "MMMM dd, yyyy")}</span>
                        </div>
                        <button onClick={() => setDate(addDays(date, 1))} className="p-2.5 hover:bg-white/10 rounded-xl transition-all font-black text-slate-400 hover:text-white opacity-60 hover:opacity-100">
                             →
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={downloadCSV}
                            className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Download size={14} /> Export Report
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-10">
                {/* Visual Shards (Mini Stats) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Outreach</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                            {matrixData.reduce((acc, u) => acc + u.reachout, 0)}
                        </h2>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Engaged Staff</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums">{matrixData.length}</h2>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Target size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Connected Leads</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                            {matrixData.reduce((acc, u) => acc + u.connected, 0)}
                        </h2>
                    </div>
                    <div className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Award size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Efficiency Index</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                            {Math.round((matrixData.reduce((acc, u) => acc + u.connected, 0) / matrixData.reduce((acc, u) => acc + u.reachout, 0)) * 100) || 0}%
                        </h2>
                    </div>
                </div>

                {/* The Grand Matrix Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl relative shadow-black/50">
                    {loading && (
                        <div className="absolute inset-0 z-20 bg-[#0a0c10]/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Decrypting Shards...</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-8 py-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 w-16">No.</th>
                                    <th className="px-8 py-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 sticky left-0 z-10 bg-[#12141a]">Staff Member</th>
                                    
                                    {/* PILLAR HEADERS */}
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-b border-white/5 bg-rose-500/5">Untouched</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-b border-white/5 bg-rose-500/5">Pending F/U</th>
                                    
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] border-b border-white/5 bg-sky-500/5">Forms Filled</th>

                                    <th className="px-6 py-8 text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">Created</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">Reachout</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">Conn.</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">New Reach</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">New Conn</th>
                                    
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border-b border-white/5 bg-amber-500/5">F/U Calls</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border-b border-white/5 bg-amber-500/5">F/U Conn</th>
                                    
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] border-b border-white/5 bg-indigo-500/5">Sales</th>
                                    <th className="px-6 py-8 text-center text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] border-b border-white/5 bg-indigo-500/5">Onb.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {matrixData.map((user, idx) => (
                                    <tr key={user.userId} className="group hover:bg-white/[0.04] transition-all duration-300">
                                        {/* 1. Row Number */}
                                        <td className="px-8 py-6 text-xs font-black text-slate-600 tabular-nums">
                                            {String(idx + 1).padStart(2, '0')}
                                        </td>
                                        {/* 2. Staff Identity */}
                                        <td className="px-8 py-6 sticky left-0 z-10 bg-[#0c0e14] group-hover:bg-[#15171d] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-white tracking-tight uppercase text-xs">{user.name}</div>
                                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] mt-0.5">Active Operator</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PILLAR DATA */}
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-black text-rose-500 tabular-nums">{user.untouched}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center border-r border-white/5">
                                            <span className="text-xs font-black text-rose-400 opacity-60 tabular-nums">{user.pending}</span>
                                        </td>

                                        <td className="px-6 py-6 text-center bg-sky-500/5">
                                            <span className="text-xs font-black text-sky-400 tabular-nums">{user.submissionsFilled}</span>
                                        </td>

                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-black text-slate-500 tabular-nums">{user.created}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-black text-white tabular-nums">{user.reachout}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center bg-emerald-500/5">
                                            <span className="text-xs font-black text-emerald-400 tabular-nums">{user.connected}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-black text-slate-500 tabular-nums">{user.newReachout}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center border-r border-white/5 bg-emerald-500/5">
                                            <span className="text-xs font-black text-emerald-500 tabular-nums">{user.newConnected}</span>
                                        </td>

                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-black text-slate-500 tabular-nums">{user.followupCalls}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center border-r border-white/5 bg-amber-500/5">
                                            <span className="text-xs font-black text-amber-500 tabular-nums">{user.followupConnected}</span>
                                        </td>

                                        <td className="px-6 py-6 text-center bg-indigo-500/5">
                                            <span className="text-xs font-black text-white tabular-nums">{user.sales}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-black text-indigo-400 tabular-nums">{user.onboarding}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

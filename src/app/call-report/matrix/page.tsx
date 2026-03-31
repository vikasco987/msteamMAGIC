"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO, addDays, subDays } from "date-fns";
import { 
    Download, 
    TrendingUp, 
    Zap, 
    Target, 
    Award, 
    User, 
    MessageSquare,
    Layers,
    Calendar,
    ChevronDown,
    Activity,
    Info,
    ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

type MatrixUser = {
    userId: string;
    name: string;
    email: string;
    untouched: number;
    pending: number;
    submissionsFilled: number;
    created: number;
    reachout: number;
    connected: number;
    newReachout: number;
    newConnected: number;
    followupCalls: number;
    followupConnected: number;
    todayOnb: number;
    sales: number;
    totalSales: number;
    todo: number;
    progress: number;
    paymentPending: number;
    receivedAmount: number;
};

export default function GrandMatrixPage() {
    const [date, setDate] = useState(new Date());
    const [matrixData, setMatrixData] = useState<MatrixUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"MASTER" | "DEEP_DIVE">("MASTER");
    const [auditData, setAuditData] = useState<any[]>([]);
    const [showBacklogBreakdown, setShowBacklogBreakdown] = useState(false);

    const fetchMatrix = async () => {
        setLoading(true);
        try {
            const range = viewMode === "DEEP_DIVE" ? "WEEK" : "TODAY";
            const res = await fetch(`/api/call-report/matrix?start=${format(date, 'yyyy-MM-dd')}&end=${format(date, 'yyyy-MM-dd')}&range=${range}`);
            const json = await res.json();
            if (res.ok) {
                if (viewMode === "MASTER") {
                    setMatrixData(json.report);
                } else {
                    setAuditData(json.report);
                }
            } else {
                toast.error("Failed to fetch matrix pulse");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatrix();
    }, [date, viewMode]);

    const downloadCSV = () => {
        const headers = [
            "Rank", "Staff Member", "Untouched", "Pending F/U", "Forms Filled", "Created", 
            "Total Reachout", "Total Conn", "New Reachout", "New Conn", "F/U Calls", "F/U Conn", 
            "Today ONB", "Sales Today", "MTD Sales (Amt)", "MTD Received (Amt)", "MTD Pending (Amt)", "To-Do Task", "Progress Task"
        ];
        const rows = matrixData.map((u, i) => [
            i + 1, u.name, u.untouched, u.pending, u.submissionsFilled, u.created,
            u.reachout, u.connected, u.newReachout, u.newConnected, u.followupCalls, u.followupConnected,
            u.todayOnb, u.sales, u.totalSales, u.receivedAmount, u.paymentPending, u.todo, u.progress
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `matrix_report_${format(new Date(), 'yyyy_MM_dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Header: Cyber Audit Protocol */}
            <div className="border-b border-white/5 bg-[#12141a]/80 backdrop-blur-3xl sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-indigo-600/20 rotate-3">
                            <Layers className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Grand Matrix</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Team Intelligence Engine • Full Shard Visibility</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                            <button onClick={() => setDate(subDays(date, 1))} className="p-2.5 hover:bg-white/10 rounded-xl transition-all font-black text-slate-400 hover:text-white opacity-60 hover:opacity-100">←</button>
                            <div className="px-6 py-2 flex items-center gap-2 border-x border-white/5 min-w-[180px] justify-center">
                                <Calendar size={14} className="text-indigo-500" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">{format(date, "MMM dd, yyyy")}</span>
                            </div>
                            <button onClick={() => setDate(addDays(date, 1))} className="p-2.5 hover:bg-white/10 rounded-xl transition-all font-black text-slate-400 hover:text-white opacity-60 hover:opacity-100">→</button>
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            <button 
                                onClick={() => setViewMode("MASTER")}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "MASTER" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"}`}
                            >
                                Master Hub
                            </button>
                            <button 
                                onClick={() => setViewMode("DEEP_DIVE")}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "DEEP_DIVE" ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-white"}`}
                            >
                                Deep Audit
                            </button>
                        </div>
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

            <main className="max-w-[1600px] mx-auto p-4 pt-12 min-w-full">
                <div className="bg-white/[0.02] border border-white/5 rounded-[48px] shadow-2xl relative shadow-black/50 overflow-hidden min-h-[600px]">
                    {loading && (
                        <div className="absolute inset-0 z-20 bg-[#0a0c10]/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Decrypting Matrix Shards...</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto relative">
                        <table className="w-full border-collapse min-w-[2800px]">
                            {viewMode === "MASTER" ? (
                                <>
                                    <thead>
                                        <tr className="bg-white/5 text-center">
                                            <th className="px-6 py-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 w-16">No.</th>
                                            <th className="px-8 py-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 sticky left-0 z-10 bg-[#12141a]">Staff Member</th>
                                            
                                            {/* 🛡️ IMAGE SYNC: RED SHARDS */}
                                            <th onClick={() => setShowBacklogBreakdown(true)} className="px-4 py-8 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-b border-white/5 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-all">Untouched LEAD</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-b border-white/5 bg-rose-500/5">Followups Pending</th>
                                            
                                            {/* 🛡️ IMAGE SYNC: GREEN SHARDS */}
                                            <th className="px-4 py-8 text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] border-b border-white/5 bg-sky-500/5">Today Form Careted</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">Total Call Reachout</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">Total Call Connected</th>
                                            
                                            <th className="px-4 py-8 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">New Call Reachout</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">New Call Connected</th>
                                            
                                            <th className="px-4 py-8 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border-b border-white/5 bg-amber-500/5">Followups Calls</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border-b border-white/5 bg-amber-500/5">Followups Call Conn.</th>
                                            
                                            {/* 🛡️ NEW SHARDS */}
                                            <th className="px-4 py-8 text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] border-b border-white/5 bg-teal-500/5">Today ONB</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] border-b border-white/5 bg-teal-500/5">Today Sales</th>
                                            
                                            {/* 🛡️ FINANCIAL PROTOCOL (STAYING) */}
                                            <th className="px-4 py-8 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/5">MTD Total Sales (Amt)</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-b border-white/5 bg-emerald-500/10">MTD Total Recv</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] border-b border-white/5 bg-rose-500/5">MTD Payment Pend</th>
                                            
                                            {/* 🛡️ ORANGE SHARDS (CAPACITY) */}
                                            <th className="px-4 py-8 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] border-b border-white/5 bg-orange-500/5">To-Do</th>
                                            <th className="px-4 py-8 text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-b border-white/5 bg-orange-500/5">Progress</th>
                                            
                                            <th className="px-6 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pr-12">View</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {matrixData.map((user, idx) => (
                                            <tr key={user.userId} className="group hover:bg-white/[0.04] transition-all">
                                                <td className="px-6 py-6 text-xs font-black text-slate-600 tabular-nums">{idx + 1}</td>
                                                <td className="px-8 py-6 sticky left-0 z-10 bg-[#0c0e14] group-hover:bg-[#15171d] font-black text-white text-xs border-r border-white/5">{user.name}</td>
                                                
                                                <td className="px-4 py-6 text-center text-rose-500 font-black tabular-nums">{user.untouched}</td>
                                                <td className="px-4 py-6 text-center text-rose-400 opacity-60 font-black tabular-nums">{user.pending}</td>
                                                
                                                <td className="px-4 py-6 text-center text-sky-400 font-black tabular-nums">{user.submissionsFilled}</td>
                                                <td className="px-4 py-6 text-center text-white font-black tabular-nums">{user.reachout}</td>
                                                <td className="px-4 py-6 text-center text-emerald-400 font-black tabular-nums">{user.connected}</td>
                                                
                                                <td className="px-4 py-6 text-center text-slate-500 font-black tabular-nums">{user.newReachout}</td>
                                                <td className="px-4 py-6 text-center text-emerald-500 font-black tabular-nums">{user.newConnected}</td>
                                                
                                                <td className="px-4 py-6 text-center text-slate-500 font-black tabular-nums">{user.followupCalls}</td>
                                                <td className="px-4 py-6 text-center text-amber-500 font-black tabular-nums">{user.followupConnected}</td>
                                                
                                                <td className="px-4 py-6 text-center text-teal-400 font-black tabular-nums">{user.todayOnb}</td>
                                                <td className="px-4 py-6 text-center text-teal-400 font-black tabular-nums">{user.sales}</td>
                                                
                                                <td className="px-4 py-6 text-center text-emerald-400 font-black tabular-nums">₹{user.totalSales.toLocaleString()}</td>
                                                <td className="px-4 py-6 text-center text-emerald-600 font-black tabular-nums bg-emerald-500/5">₹{user.receivedAmount.toLocaleString()}</td>
                                                <td className="px-4 py-6 text-center text-rose-400 font-black tabular-nums">₹{user.paymentPending.toLocaleString()}</td>
                                                
                                                <td className="px-4 py-6 text-center text-orange-400 font-black tabular-nums bg-orange-500/5">{user.todo}</td>
                                                <td className="px-4 py-6 text-center text-orange-500 font-black tabular-nums bg-orange-500/5">{user.progress}</td>
                                                
                                                <td className="px-6 py-6 text-right pr-12">
                                                    <button 
                                                        onClick={() => window.open(`/call-report/details?userId=${user.userId}&date=${format(date, 'yyyy-MM-dd')}&name=${encodeURIComponent(user.name)}&type=ALL`, '_blank')}
                                                        className="p-3 bg-white/5 hover:bg-indigo-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-xl active:scale-95 group-hover:translate-x-1"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            ) : (
                                <>
                                    {/* DEEP DIVE VIEW */}
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-8 py-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 w-16 sticky left-0 z-20 bg-[#12141a]">No.</th>
                                            <th className="px-8 py-8 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 sticky left-0 z-20 bg-[#12141a] min-w-[200px]">Staff Member</th>
                                            {auditData[0]?.stats.map((s: any) => (
                                                <th key={s.date} className="px-6 py-8 text-center border-b border-white/5 bg-white/[0.02]">
                                                    <div className="text-[10px] font-black text-slate-500 uppercase mb-1">{format(parseISO(s.date), "EEE")}</div>
                                                    <div className="text-[10px] font-black text-white uppercase">{format(parseISO(s.date), "MMM dd")}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {auditData.map((user, idx) => (
                                            <tr key={user.userId} className="group hover:bg-white/[0.04]">
                                                <td className="px-8 py-10 text-xs font-black text-slate-600 sticky left-0 z-10 bg-[#0c0e14]">{idx + 1}</td>
                                                <td className="px-8 py-10 sticky left-0 z-10 bg-[#0c0e14] font-black text-white text-sm border-r border-white/10">{user.name}</td>
                                                {user.stats.map((day: any) => (
                                                    <td key={day.date} className="px-6 py-10 text-center min-w-[150px] border-r border-white/5">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase">Input</span>
                                                                <span className="text-lg font-black text-white">{day.total}</span>
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-[9px] font-black text-rose-500 uppercase">BACKLOG</span>
                                                                <span className={`text-lg font-black ${day.untouched > 0 ? "text-rose-500" : "text-emerald-500/30"}`}>{day.untouched}</span>
                                                            </div>
                                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                                                                <div className="h-full bg-emerald-500" style={{ width: `${day.total > 0 ? ((day.total-day.untouched)/day.total)*100 : 0}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { PieChart, PhoneCall, Calendar, Activity } from "lucide-react";
import toast from "react-hot-toast";

type UserReport = {
    userId: string;
    name: string;
    email: string;
    callCount: number;
    connectedCount: number;
    notConnectedCount: number;
};

export default function CallReportPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [report, setReport] = useState<UserReport[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async (targetDate: Date) => {
        setLoading(true);
        try {
            const dateStr = format(targetDate, "yyyy-MM-dd");
            const res = await fetch(`/api/call-report?date=${dateStr}`);
            const data = await res.json();
            if (res.ok) {
                setReport(data.report || []);
            } else {
                toast.error("Failed to fetch report");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(date);
    }, [date]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
            {/* Page Title & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Call Engagement Analytics</h1>
                        <p className="text-sm font-bold text-slate-500">Tracking distinct interactions per user</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner">
                    <button onClick={() => setDate(subDays(date, 1))} className="p-2 hover:bg-white rounded-xl transition-all font-black text-slate-400 hover:text-slate-700 hover:shadow-sm">
                        ←
                    </button>
                    <div className="flex items-center gap-2 px-4 py-1">
                        <Calendar size={14} className="text-indigo-500" />
                        <span className="text-sm font-black text-slate-700 tracking-widest uppercase">{format(date, "MMM dd, yyyy")}</span>
                    </div>
                    <button onClick={() => setDate(addDays(date, 1))} className="p-2 hover:bg-white rounded-xl transition-all font-black text-slate-400 hover:text-slate-700 hover:shadow-sm">
                        →
                    </button>
                </div>
            </div>

            {/* Header Stats Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] shadow-2xl shadow-indigo-200 flex flex-col md:flex-row justify-between items-center text-white gap-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h2 className="text-4xl font-black tracking-tighter mb-1">Daily Call Performance</h2>
                    <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-xs">Real-time stats based on response statuses</p>
                </div>
                <div className="flex gap-8 relative z-10">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Total Operators</p>
                        <p className="text-4xl font-black tracking-tighter">{report.length}</p>
                    </div>
                    <div className="w-px h-12 bg-white/20 self-center" />
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Total Unique Leads</p>
                        <p className="text-4xl font-black tracking-tighter">
                            {report.reduce((acc, curr) => acc + curr.callCount, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading / Data View */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[40px] animate-pulse h-[280px]" />
                    ))}
                </div>
            ) : report.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 border-dashed">
                    <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                        <PhoneCall size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-700">No Call Logs Detected</h3>
                    <p className="text-sm font-bold text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
                        Zero call interactions recorded for this date
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {report.map((user, idx) => (
                        <div key={user.userId} className={`bg-white rounded-[40px] p-8 border ${idx === 0 ? 'border-2 border-indigo-500 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-sm'} relative group hover:-translate-y-2 transition-all duration-500`}>
                            {idx === 0 && (
                                <div className="absolute -top-4 -right-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border-4 border-white">
                                    Top Performer
                                </div>
                            )}
                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 text-indigo-600 flex items-center justify-center font-black text-2xl mb-8 group-hover:scale-110 transition-transform shadow-inner border border-slate-100">
                                {user.name.charAt(0) || "?"}
                            </div>
                            <h3 className="font-black text-slate-800 text-xl truncate mb-1 pr-4">{user.name}</h3>
                            {user.email && <p className="text-[10px] font-black text-slate-400 truncate uppercase tracking-[0.2em]">{user.email}</p>}
                            
                            <div className="mt-10 pt-8 border-t border-slate-50 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Distinct Calls Logged</p>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className={`text-6xl font-black tracking-tighter ${idx === 0 ? 'text-indigo-600' : 'text-slate-800'}`}>
                                            {user.callCount}
                                        </span>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Leads</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Connected: {user.connectedCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Not Connected: {user.notConnectedCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${idx === 0 ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-200'}`}>
                                    <PhoneCall size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

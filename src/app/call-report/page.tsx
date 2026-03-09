"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { format, subDays, addDays } from "date-fns";
import { PieChart, PhoneCall, Calendar } from "lucide-react";
import toast from "react-hot-toast";

type UserReport = {
    userId: string;
    name: string;
    email: string;
    callCount: number;
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
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-[100vw]">
                <Header title="Daily Call Analytics" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 styled-scrollbar scroll-smooth">
                    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
                        {/* Header Stats */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                    <PieChart size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Call Engagement Report</h1>
                                    <p className="text-sm font-bold text-slate-500">Tracking distinct rows uniquely touched via call status</p>
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

                        {/* Loading / Data View */}
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl animate-pulse flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                                        <div className="flex-1 h-6 bg-slate-200 rounded-full max-w-[200px]"></div>
                                        <div className="w-16 h-8 bg-slate-200 rounded-full ml-auto"></div>
                                    </div>
                                ))}
                            </div>
                        ) : report.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 border-dashed">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                                    <PhoneCall size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-700">No Call Logs Detected</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                    There are no calls logged on this specific date. Tell your team to jump into responses and start calling!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {report.map((user, idx) => (
                                    <div key={user.userId} className={`bg-white rounded-[32px] p-6 border ${idx === 0 ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-100' : 'border-slate-100 shadow-sm'} relative group hover:-translate-y-1 transition-all duration-300`}>
                                        {idx === 0 && (
                                            <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border-2 border-white">
                                                Top Caller
                                            </div>
                                        )}
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                            {user.name.charAt(0) || "?"}
                                        </div>
                                        <h3 className="font-black text-slate-800 text-lg truncate mb-1">{user.name}</h3>
                                        {user.email && <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{user.email}</p>}
                                        
                                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distinct Calls Today</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-5xl font-black tracking-tighter ${idx === 0 ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                        {user.callCount}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-400">responses</span>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-50 text-slate-300'}`}>
                                                <PhoneCall size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    FileText,
    MoreVertical,
    ExternalLink,
    Database,
    Trash2,
    Search,
    ChevronRight,
    LayoutDashboard,
    Clock,
    User,
    CheckCircle2,
    Copy,
    Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface FormSummary {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    createdAt: string;
    createdByName: string;
    _count: { responses: number };
}

export default function CRMFormsList() {
    const [forms, setForms] = useState<FormSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [userRole, setUserRole] = useState<string>("GUEST");
    const [isMaster, setIsMaster] = useState(false);

    const fetchForms = async () => {
        try {
            const res = await fetch("/api/crm/forms");
            const data = await res.json();
            setForms(data.forms || []);
            setUserRole(data.userRole || "GUEST");
            setIsMaster(data.isMaster || data.userRole === "ADMIN" || data.userRole === "MASTER");
        } catch (err) {
            toast.error("Failed to fetch forms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchForms(); }, []);

    const copyToClipboard = (id: string) => {
        const url = `${window.location.origin}/f/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Public Link Copied!");
    };

    const deleteForm = async (id: string) => {
        if (!confirm("Are you sure? All responses will be deleted.")) return;
        try {
            const res = await fetch(`/api/crm/forms/${id}`, { method: "DELETE" });
            if (res.ok) {
                setForms(forms.filter(f => f.id !== id));
                toast.success("Form deleted");
            }
        } catch (err) { toast.error("Delete failed"); }
    };

    const filteredForms = forms.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Container */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-slate-900 text-white rounded-[28px] shadow-2xl rotate-2">
                            <LayoutDashboard size={28} className="text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">CRM <span className="text-indigo-600">Forms</span></h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.25em]">Response Collection Hub</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search forms..."
                                className="pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl shadow-sm focus:border-indigo-600 outline-none font-bold text-slate-600 w-[300px] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isMaster && (
                            <Link
                                href="/crm/forms/new"
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Build New Form
                            </Link>
                        )}
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Repositories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredForms.map((form) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={form.id}
                                    className="bg-white rounded-[40px] border-2 border-white shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group overflow-hidden"
                                >
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {form.isPublished && (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 rounded-full flex items-center gap-1.5">
                                                        <CheckCircle2 size={10} /> Live
                                                    </span>
                                                )}
                                                {isMaster && (
                                                    <button onClick={() => deleteForm(form.id)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{form.title}</h3>
                                        <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-8">{form.description || "No description provided."}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Submissions</p>
                                                <p className="text-lg font-black text-slate-900">{form._count.responses}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                                                <p className={`text-sm font-black uppercase ${form.isPublished ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    {form.isPublished ? "Public" : "Draft"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Shelf */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/crm/forms/${form.id}/responses`}
                                                className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                                            >
                                                <Database size={14} className="text-indigo-400" /> View Data
                                            </Link>
                                            <button
                                                onClick={() => copyToClipboard(form.id)}
                                                className="p-4 bg-slate-100 text-slate-500 rounded-[20px] hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-slate-200"
                                                title="Copy Live Link"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                            <Link
                                                href={`/f/${form.id}`}
                                                target="_blank"
                                                className="p-4 bg-white border-2 border-slate-50 text-slate-400 rounded-[20px] hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                                title="Preview Live"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                            <Clock size={12} /> {formatDistanceToNow(new Date(form.createdAt))} ago
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                            <User size={12} /> {form.createdByName}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {filteredForms.length === 0 && !loading && (
                    <div className="text-center py-40 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                            <FileText size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">No Forms Found</h2>
                        <p className="text-slate-400 font-bold max-w-sm mx-auto mt-2">Start by creating your first dynamic form to collect data from your team or clients.</p>
                        {isMaster && (
                            <Link
                                href="/crm/forms/new"
                                className="mt-10 inline-flex px-10 py-5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl transition-all"
                            >
                                <Plus size={20} className="mr-2" /> Build Now
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

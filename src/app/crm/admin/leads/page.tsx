"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
    Search, Filter, Users, UserPlus, CheckCircle2, 
    History, X, ExternalLink, Sparkles, LayoutGrid, 
    FileText, Calendar, ChevronDown, Loader2, ArrowRight,
    ArrowUpDown, MoreHorizontal, ShieldCheck, Mail, Phone,
    Clock, Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";
import StatusMatrixModal from "@/app/components/StatusMatrixModal";
import FormRemarkModal from "@/app/components/FormRemarkModal";

interface Lead {
    id: string;
    formId: string;
    submittedByName: string;
    assignedTo: string[];
    submittedAt: string;
    values: { fieldId: string; value: string }[];
    form: {
        id: string;
        title: string;
        fields: { id: string; label: string; type: string }[];
    };
    remarks: any[];
}

interface TeamMember {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}

export default function AdminLeadsDashboard() {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    
    // Filters
    const [search, setSearch] = useState("");
    const [formId, setFormId] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [forms, setForms] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    
    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigneeSearch, setAssigneeSearch] = useState("");

    // Detail/Modals
    const [statusModal, setStatusModal] = useState<{ lead: Lead, val: string } | null>(null);
    const [openFollowUpModal, setOpenFollowUpModal] = useState<{ formId: string, responseId: string } | null>(null);

    useEffect(() => {
        fetchForms();
        fetchMembers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, formId, assignedTo, page]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/crm/admin/leads?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&formId=${formId}&assignedTo=${assignedTo}`);
            const data = await res.json();
            if (data.responses) {
                setLeads(data.responses);
                setTotal(data.total);
            }
        } catch (err) {
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    };

    const fetchForms = async () => {
        try {
            const res = await fetch("/api/crm/forms");
            const data = await res.json();
            setForms(data.forms || []);
        } catch (err) {}
    };

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/crm/users?limit=500");
            const data = await res.json();
            setTeamMembers(data.users || []);
        } catch (err) {}
    };

    const handleBulkAssign = async (targetClerkId: string) => {
        if (selectedIds.length === 0) return;
        const tid = toast.loading(`Reassigning ${selectedIds.length} leads...`);
        try {
            const res = await fetch("/api/crm/admin/leads", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, assignedTo: [targetClerkId] })
            });

            if (res.ok) {
                toast.success(`Successfully reassigned ${selectedIds.length} leads`, { id: tid });
                setSelectedIds([]);
                setIsAssignModalOpen(false);
                fetchLeads();
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Reassignment failed", { id: tid });
        }
    };

    const getLeadMainDisplay = (lead: Lead) => {
        // Try to find Name, Phone, Email in values
        const vals = lead.values || [];
        const nameVal = vals[0]?.value || lead.submittedByName || "Lead Record";
        const emailVal = vals.find(v => v.value?.includes("@"))?.value;
        const phoneVal = vals.find(v => /^\d{10}$/.test(v.value?.replace(/[^0-9]/g, "")))?.value;

        return { name: nameVal, email: emailVal, phone: phoneVal };
    };

    const filteredTeam = useMemo(() => {
        if (!assigneeSearch) return teamMembers.slice(0, 50);
        const s = assigneeSearch.toLowerCase();
        return teamMembers.filter(m => 
            m.firstName?.toLowerCase().includes(s) || 
            m.lastName?.toLowerCase().includes(s) || 
            m.email?.toLowerCase().includes(s)
        );
    }, [teamMembers, assigneeSearch]);

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-slate-900">
            {/* 🏆 ULTRA-MODERN HEADER */}
            <header className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-3xl border-b border-slate-200 shadow-sm px-8 py-4">
                <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Lead Terminal</h1>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Master Operations Control</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by meta, identity or attribute across all sectors..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-6 border-r border-slate-200 pr-8">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Active</span>
                            <span className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">{total.toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={() => router.push("/crm/forms/new")}
                            className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                        >
                            Build Sector
                        </button>
                    </div>
                </div>
            </header>

            {/* 🛸 GLOBAL OPERATOR CONTROL PANEL */}
            <main className="flex-1 pt-32 pb-20 px-8 max-w-[1920px] mx-auto w-full">
                
                {/* 🧪 SMART FILTERS */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-all">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <LayoutGrid size={22} />
                        </div>
                        <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Form Sector</label>
                            <select 
                                className="w-full bg-transparent font-black text-slate-800 text-sm outline-none cursor-pointer"
                                value={formId}
                                onChange={(e) => setFormId(e.target.value)}
                            >
                                <option value="">Global Scanner (All)</option>
                                {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Users size={22} />
                        </div>
                        <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Staff/Agent</label>
                            <select 
                                className="w-full bg-transparent font-black text-slate-800 text-sm outline-none cursor-pointer"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                            >
                                <option value="">Network Peak (All)</option>
                                {teamMembers.map(m => <option key={m.clerkId} value={m.clerkId}>{m.firstName || m.email}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-all">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Calendar size={22} />
                        </div>
                        <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Time Dimension</label>
                            <span className="font-black text-slate-800 text-sm">Real-time Stream</span>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-[32px] shadow-2xl shadow-indigo-200 group relative overflow-hidden flex items-center gap-5 cursor-pointer hover:-translate-y-1 transition-all active:scale-95"
                         onClick={() => { if (selectedIds.length > 0) setIsAssignModalOpen(true); else toast.info("Select leads in the matrix first"); }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={60} />
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                            <UserPlus size={22} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-black text-sm uppercase tracking-widest leading-none mb-1">Mass Distribute</h3>
                            <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest">{selectedIds.length} Selected Units</p>
                        </div>
                    </div>
                </div>

                {/* 📊 MASTER DATA MATRIX */}
                <div className="bg-white rounded-[40px] shadow-2xl border border-white/40 overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 size={32} className="text-indigo-600 animate-spin" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Calibrating Data Matrix...</span>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-8 py-6 w-16">
                                        <div className="flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 transition-all cursor-pointer"
                                                checked={selectedIds.length === leads.length && leads.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedIds(leads.map(l => l.id));
                                                    else setSelectedIds([]);
                                                }}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitter Detail</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Context Info</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Status</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Agent</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Sector</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <Database size={60} />
                                                <h3 className="text-xl font-black uppercase tracking-widest">Sector Empty</h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map(lead => {
                                        const display = getLeadMainDisplay(lead);
                                        const isSelected = selectedIds.includes(lead.id);
                                        const status = lead.remarks?.[0]?.followUpStatus || "New Lead";
                                        const lastRemark = lead.remarks?.[0]?.remark;
                                        const agents = lead.assignedTo || [];

                                        return (
                                            <motion.tr 
                                                key={lead.id}
                                                initial={false}
                                                className={`group border-b border-slate-50 transition-all hover:bg-slate-50 shadow-inner ${isSelected ? 'bg-indigo-50/40' : ''}`}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 transition-all cursor-pointer"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                if (isSelected) setSelectedIds(prev => prev.filter(id => id !== lead.id));
                                                                else setSelectedIds(prev => [...prev, lead.id]);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div>
                                                        <h4 className="text-[15px] font-black text-slate-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase">{display.name}</h4>
                                                        <div className="flex items-center gap-3">
                                                            {display.phone && <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><Phone size={10} /> {display.phone}</span>}
                                                            {display.email && <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><Mail size={10} /> {display.email}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="max-w-[240px]">
                                                        {lastRemark ? (
                                                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2 italic">"{lastRemark}"</p>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                {lead.values.slice(0, 2).map((v, i) => (
                                                                    <span key={i} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase truncate max-w-[100px]">{v.value || 'N/A'}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex justify-center">
                                                        <button 
                                                            onClick={() => setStatusModal({ lead, val: status })}
                                                            className={`text-[10px] font-black px-4 py-2 rounded-xl border-2 transition-all uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 ${
                                                                ['Closed', 'Call done'].includes(status) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                ['RNR', 'Missed', 'Switch off'].includes(status) ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                                'bg-indigo-50 text-indigo-600 border-indigo-200'
                                                            }`}
                                                        >
                                                            {status}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {agents.length > 0 ? (
                                                            agents.map(aid => {
                                                                const m = teamMembers.find(t => t.clerkId === aid);
                                                                return (
                                                                    <div key={aid} className="flex items-center gap-2 bg-white border border-slate-100 pl-1 pr-3 py-1 rounded-full shadow-sm">
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden text-[9px] flex items-center justify-center font-black">
                                                                            {m?.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover" /> : (m?.firstName?.[0] || 'U')}
                                                                        </div>
                                                                        <span className="text-[10px] font-black text-slate-700 uppercase">{m?.firstName || 'Staff'}</span>
                                                                    </div>
                                                                )
                                                            })
                                                        ) : (
                                                            <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 uppercase tracking-widest">Unassigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                                        <span className="text-[11px] font-black text-slate-800 tracking-tighter uppercase whitespace-nowrap">{lead.form?.title || 'System'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">{format(new Date(lead.submittedAt), "MMM dd, yyyy")}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{format(new Date(lead.submittedAt), "hh:mm a")}</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 🕹️ FOOTER CONTROLS */}
                    <div className="px-10 py-8 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Matrix Data Stream</span>
                                <p className="text-[11px] font-black text-slate-400">Showing {leads.length} units out of {total} available in sector.</p>
                             </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all disabled:opacity-30 active:scale-90"
                             >
                                <X size={20} className="rotate-180" />
                             </button>
                             <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                                Page {page} <span className="text-slate-300 mx-2">/</span> {Math.ceil(total / limit)}
                             </div>
                             <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(total / limit)}
                                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all disabled:opacity-30 active:scale-90"
                             >
                                <ArrowRight size={20} />
                             </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* 🎯 REASSIGN MODAL */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border-4 border-white flex flex-col max-h-[85vh]">
                            <div className="p-10 border-b border-slate-50 bg-[#F9FAFB] flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Target Distribution</h3>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Reassign {selectedIds.length} Leads</p>
                                </div>
                                <button onClick={() => setIsAssignModalOpen(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all shadow-sm border border-slate-100">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Find elite agent by name or email..."
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-inner transition-all"
                                        value={assigneeSearch}
                                        onChange={(e) => setAssigneeSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar">
                                {filteredTeam.map((member) => (
                                    <button
                                        key={member.clerkId}
                                        onClick={() => handleBulkAssign(member.clerkId)}
                                        className="w-full p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all flex items-center gap-6 group text-left"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden font-black text-slate-400 text-xl shadow-inner group-hover:scale-110 transition-transform">
                                            {member.imageUrl ? <img src={member.imageUrl} className="w-full h-full object-cover" /> : (member.firstName?.[0] || 'U')}
                                        </div>
                                        <div className="flex-1">
                                            <h6 className="text-[17px] font-black text-slate-900 leading-none mb-1.5">{member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.email}</h6>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.email}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-indigo-100">
                                            <UserPlus size={20} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Operational Security Protocol Active</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* STATUS MODAL */}
            <StatusMatrixModal 
                isOpen={!!statusModal}
                onClose={() => setStatusModal(null)}
                label="Lead Status Matrix"
                val={statusModal?.val || ""}
                options={[]}
                onSelect={async (opt) => {
                    const lead = statusModal?.lead;
                    if (!lead) return;
                    const tid = toast.loading("Updating status...");
                    try {
                        const res = await fetch(`/api/crm/forms/${lead.formId}/responses/${lead.id}/remarks`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ followUpStatus: opt, remark: `Global Matrix Status Update: ${opt}` })
                        });
                        if (res.ok) {
                            toast.success("Status Updated", { id: tid });
                            setStatusModal(null);
                            fetchLeads();
                        } else throw new Error();
                    } catch (err) {
                        toast.error("Failed to update status", { id: tid });
                    }
                }}
                onFullLog={() => {
                   if (statusModal) {
                       setOpenFollowUpModal({ formId: statusModal.lead.formId, responseId: statusModal.lead.id });
                       setStatusModal(null);
                   }
                }}
            />

            {/* INTERACTION LOG MODAL */}
            {openFollowUpModal && (
                <FormRemarkModal 
                    isOpen={!!openFollowUpModal}
                    onClose={() => setOpenFollowUpModal(null)}
                    formId={openFollowUpModal.formId}
                    responseId={openFollowUpModal.responseId}
                    onSuccess={() => { setOpenFollowUpModal(null); fetchLeads(); }}
                />
            )}
        </div>
    );
}

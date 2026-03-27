"use client";

import React, { useState, useMemo } from "react";
import { X, Search, UserMinus, UserPlus, Filter, CheckCircle2, Users, Loader2, Sparkles, Phone, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface TeamMember {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    role?: string;
}

interface LeadAssignHubProps {
    formId: string;
    onClose: () => void;
    responses: any[];
    teamMembers: TeamMember[];
    onSuccess: () => void;
}

export default function LeadAssignHub({ formId, onClose, responses, teamMembers, onSuccess }: LeadAssignHubProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [unassignedOnly, setUnassignedOnly] = useState(false);
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

    // Filter leads
    const filteredLeads = useMemo(() => {
        return responses.filter(res => {
            const assigned = res.assignedTo || [];
            if (unassignedOnly && assigned.length > 0) return false;

            if (!searchTerm) return true;

            const searchVal = searchTerm.toLowerCase();
            // Search in values
            const hasMatch = res.values?.some((v: any) => v.value?.toLowerCase().includes(searchVal));
            const hasInternalMatch = res.internalValues?.some((v: any) => v.value?.toLowerCase().includes(searchVal));
            const nameMatch = res.submittedByName?.toLowerCase().includes(searchVal);

            return hasMatch || hasInternalMatch || nameMatch;
        });
    }, [responses, searchTerm, unassignedOnly]);

    // Filter team members for quick picker
    const filteredTeam = useMemo(() => {
        if (!assigneeSearch) return teamMembers.slice(0, 10);
        const s = assigneeSearch.toLowerCase();
        return teamMembers.filter(m =>
            m.firstName?.toLowerCase().includes(s) ||
            m.lastName?.toLowerCase().includes(s) ||
            m.email?.toLowerCase().includes(s)
        ).slice(0, 10);
    }, [teamMembers, assigneeSearch]);

    const handleToggleAssignment = async (responseId: string, currentAssigned: string[], targetClerkId: string) => {
        const isAssigned = currentAssigned.includes(targetClerkId);
        const newAssigned = isAssigned
            ? currentAssigned.filter(id => id !== targetClerkId)
            : [...currentAssigned, targetClerkId];

        const key = `${responseId}-${targetClerkId}`;
        setUpdatingIds(prev => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });

        try {
            const res = await fetch(`/api/crm/forms/${formId}/responses`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    responseId,
                    assignedTo: newAssigned
                })
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success(isAssigned ? "Removed user" : "Assigned user", { id: key, duration: 1000 });
            onSuccess(); // Refresh parent data
        } catch (err) {
            toast.error("Error updating assignment");
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    };

    // Helper to get lead "name" or primary info
    const getLeadInfo = (res: any) => {
        // Find a value that looks like a name or use first textual value
        const val = res.values?.[0]?.value || res.values?.[1]?.value || "Lead Record";
        const email = res.values?.find((v: any) => v.value?.includes("@"))?.value;
        const phone = res.values?.find((v: any) => /^\d{10}$/.test(v.value?.replace(/[^0-9]/g, "")))?.value;

        return { name: val, email, phone };
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto" onClick={onClose} />

            <div className="relative w-full max-w-7xl h-[90vh] bg-slate-50 rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden pointer-events-auto border border-white/20">

                {/* 🏆 PREMIUM HEADER */}
                <div className="px-10 py-7 border-b border-slate-200/60 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 z-20">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-[0_12px_24px_rgba(79,70,229,0.3)]">
                            <Sparkles className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Lead Matrix</h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Rapid Distribution Hub v3.0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Filters */}
                        <div className="flex items-center gap-3 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
                            <button
                                onClick={() => setUnassignedOnly(false)}
                                className={`px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${!unassignedOnly ? 'bg-white text-indigo-600 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                All Matrix
                            </button>
                            <button
                                onClick={() => setUnassignedOnly(true)}
                                className={`px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${unassignedOnly ? 'bg-white text-amber-600 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Unassigned Only
                            </button>
                        </div>

                        <button onClick={onClose} className="w-12 h-12 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all flex items-center justify-center text-slate-400 group">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* 🧱 MASTER GRID LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* 👤 LEFT: ACTIVE LEADS CHANNEL */}
                    <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200/60">
                        {/* Search Bar */}
                        <div className="px-10 py-5 bg-white/40 backdrop-blur-sm border-b border-slate-200/40 shrink-0">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by Lead metadata, notes or attributes..."
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-extrabold text-slate-900 shadow-sm text-sm transition-all placeholder:text-slate-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {filteredLeads.length > 0 && (
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        {filteredLeads.length} Matches
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {filteredLeads.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                        <Filter size={40} className="opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest leading-loose">No Leads in Signal</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Adjust filters to scanner sector</p>
                                </div>
                            ) : (
                                filteredLeads.map((res: any) => {
                                    const info = getLeadInfo(res);
                                    const currentAssigned = res.assignedTo || [];
                                    const isSelected = updatingIds.size > 0; // Simple highlight if needed

                                    return (
                                        <div key={res.id} 
                                            className={`p-6 bg-white rounded-3xl border transition-all duration-300 flex items-center gap-8 group/item ${
                                                currentAssigned.length > 0 
                                                ? 'border-slate-100 shadow-sm hover:shadow-xl' 
                                                : 'border-amber-100 bg-amber-50/20 shadow-lg shadow-amber-50/30'
                                            }`}
                                        >
                                            {/* Status Badge */}
                                            <div className="shrink-0 flex flex-col items-center gap-2">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                                                    currentAssigned.length > 0 ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-100 text-amber-600 animate-pulse'
                                                }`}>
                                                    {currentAssigned.length > 0 ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-[15px] font-black text-slate-900 tracking-tight leading-none group-hover/item:text-indigo-600 transition-colors">
                                                        {info.name}
                                                    </h4>
                                                    {currentAssigned.length === 0 && (
                                                        <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-200">Fresh</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                                    {info.phone && <span className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-tighter"><Phone size={12} className="text-indigo-400" /> {info.phone}</span>}
                                                    {info.email && <span className="flex items-center gap-2 text-[11px] font-black text-slate-500 lowercase tracking-tight"><Mail size={12} className="text-indigo-400" /> {info.email}</span>}
                                                    <span className="flex items-center gap-2 text-[11px] font-bold text-slate-300 uppercase tracking-widest"><Clock size={12} /> {res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : 'Syncing...'}</span>
                                                </div>
                                            </div>

                                            {/* 🎯 TARGET ASSIGNMENT PICKER */}
                                            <div className="shrink-0 flex items-center gap-2 border-l border-slate-100 pl-8">
                                                {filteredTeam.map((member) => {
                                                    const isAssigned = currentAssigned.includes(member.clerkId);
                                                    const isUpdating = updatingIds.has(`${res.id}-${member.clerkId}`);
                                                    
                                                    return (
                                                        <button
                                                            key={member.clerkId}
                                                            onClick={() => handleToggleAssignment(res.id, currentAssigned, member.clerkId)}
                                                            disabled={isUpdating}
                                                            title={`${isAssigned ? 'Remove' : 'Assign to'} ${member.firstName || 'Agent'}`}
                                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border relative group/btn ${
                                                                isAssigned 
                                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-100 scale-110 z-10' 
                                                                : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
                                                            }`}
                                                        >
                                                            {isUpdating ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <div className="relative">
                                                                    {member.imageUrl ? (
                                                                        <img src={member.imageUrl} className="w-full h-full object-cover rounded-xl" />
                                                                    ) : (
                                                                        <span className="text-[10px] font-black uppercase text-inherit">
                                                                            {member.firstName?.[0] || member.email[0]}
                                                                        </span>
                                                                    )}
                                                                    {isAssigned ? (
                                                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                            <CheckCircle2 size={10} className="text-white" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-100 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                                                            <UserPlus size={10} className="text-indigo-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 👤 RIGHT: AGENT PICKER (STICKY) */}
                    <div className="w-[380px] bg-white border-l border-slate-200/60 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Select Target Agent</h5>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Operator search..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[18px] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-900 shadow-sm text-xs transition-all"
                                    value={assigneeSearch}
                                    onChange={(e) => setAssigneeSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/20">
                            {filteredTeam.map((member) => {
                                const initials = member.firstName ? (member.firstName[0]?.toUpperCase() || '?') : '?';
                                const memberLeads = responses.filter(r => (r.assignedTo || []).includes(member.clerkId)).length;

                                return (
                                    <div key={member.clerkId} 
                                        className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200/50 transition-all flex items-center gap-4 group/box"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-[18px] bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner font-black text-slate-400">
                                                {member.imageUrl ? <img src={member.imageUrl} className="w-full h-full object-cover" /> : initials}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h6 className="text-[13px] font-black text-slate-900 leading-none mb-1 truncate">
                                                {member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.email.split('@')[0]}
                                            </h6>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{memberLeads} Active Leads</p>
                                        </div>

                                        <div className="shrink-0 space-y-2">
                                            {/* Action applies to ALL selected leads in parent? 
                                                Actually, the current design is per-lead button. 
                                                If we want batch assign, we need a different trigger. 
                                                For now, let's keep the per-lead toggle but make it look like a global operator.
                                            */}
                                            <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                                Ready
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="p-6 bg-indigo-600 rounded-3xl mt-6 shadow-xl shadow-indigo-100 border border-indigo-500 overflow-hidden relative group cursor-pointer active:scale-95 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform">
                                    <Sparkles size={80} />
                                </div>
                                <h6 className="text-white font-black text-sm uppercase tracking-widest mb-1 relative z-10">Smart Distribute</h6>
                                <p className="text-indigo-100 text-[10px] font-bold leading-relaxed relative z-10">Automatically split unassigned leads equally across online agents.</p>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 py-5 border-t border-slate-100 text-center">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Operator Terminal Secure</p>
                        </div>
                    </div>
                </div>

                {/* 🛡️ SYSTEM FOOTER */}
                <div className="px-10 py-6 border-t border-slate-200/60 bg-white shrink-0 flex items-center justify-between z-20">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1.5 underline decoration-2 underline-offset-4">Load Statistics</span>
                            <span className="text-lg font-black text-slate-900 tracking-tighter">{filteredLeads.length} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Processed</span></span>
                        </div>
                        <div className="w-px h-10 bg-slate-200/60" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1.5">Net Agents</span>
                            <span className="text-lg font-black text-slate-900 tracking-tighter">{teamMembers.length} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Synced</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="group px-10 py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:shadow-indigo-200 flex items-center gap-3 active:scale-95"
                        >
                            Sync & Exit
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

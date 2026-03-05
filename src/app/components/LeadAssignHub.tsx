"use client";

import React, { useState, useMemo } from "react";
import { X, Search, UserMinus, UserPlus, Filter, CheckCircle2, Users, Loader2, Sparkles } from "lucide-react";
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

            <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden pointer-events-auto border border-slate-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Lead Assign Hub</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rapid Distribution Center</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button
                                onClick={() => setUnassignedOnly(false)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!unassignedOnly ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                All Leads
                            </button>
                            <button
                                onClick={() => setUnassignedOnly(true)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${unassignedOnly ? 'bg-white text-amber-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Unassigned
                            </button>
                        </div>

                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Sub-Header / Filters */}
                <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-4 shrink-0">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, or content..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-900 shadow-sm text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-64">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find team member..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-900 shadow-sm text-sm transition-all"
                            value={assigneeSearch}
                            onChange={(e) => setAssigneeSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lead List */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="grid grid-cols-1 gap-4">
                        {filteredLeads.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                <Filter size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-black uppercase tracking-widest">No matching leads found</p>
                            </div>
                        ) : (
                            filteredLeads.map((res: any) => {
                                const info = getLeadInfo(res);
                                const currentAssigned = res.assignedTo || [];

                                return (
                                    <div key={res.id} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-wrap items-center gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                                        {/* Lead Info */}
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-base font-black text-slate-900 leading-tight truncate" title={info.name}>
                                                    {info.name}
                                                </h3>
                                                {currentAssigned.length === 0 && (
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-[8px] font-black uppercase tracking-widest">New</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                {info.phone && <span className="flex items-center gap-1">📞 {info.phone}</span>}
                                                {info.email && <span className="flex items-center gap-1">✉️ {info.email}</span>}
                                                <span className="flex items-center gap-1">🕒 {res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : 'Recently'}</span>
                                            </div>
                                        </div>

                                        {/* Current Status / Avatars */}
                                        <div className="shrink-0 flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {currentAssigned.length > 0 ? (
                                                    currentAssigned.map((uid: string) => {
                                                        const m = teamMembers.find(t => t.clerkId === uid);
                                                        return (
                                                            <div key={uid} className="w-9 h-9 rounded-full ring-4 ring-white bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm" title={m?.firstName || 'Assigned User'}>
                                                                {m?.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-slate-400">?</span>}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full ring-4 ring-white bg-slate-50 border border-slate-100 border-dashed flex items-center justify-center text-slate-300">
                                                        <Users size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Pickers */}
                                        <div className="flex-1 min-w-[300px] flex flex-wrap gap-2 justify-end">
                                            {filteredTeam.map((member) => {
                                                const isAssigned = currentAssigned.includes(member.clerkId);
                                                const isUpdating = updatingIds.has(`${res.id}-${member.clerkId}`);
                                                const initials = member.firstName ? (member.firstName[0]?.toUpperCase() || '?') : '?';

                                                return (
                                                    <button
                                                        key={member.clerkId}
                                                        onClick={() => handleToggleAssignment(res.id, currentAssigned, member.clerkId)}
                                                        disabled={isUpdating}
                                                        className={`group/btn relative px-3 py-2 rounded-2xl flex items-center gap-2 transition-all border shadow-sm ${isAssigned
                                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden ${isAssigned ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                            {member.imageUrl ? <img src={member.imageUrl} className="w-full h-full object-cover" /> : initials}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
                                                            {member.firstName || member.email.split('@')[0]}
                                                        </span>

                                                        {isUpdating ? (
                                                            <Loader2 size={12} className="animate-spin text-indigo-500" />
                                                        ) : isAssigned ? (
                                                            <CheckCircle2 size={12} className="text-emerald-600" />
                                                        ) : (
                                                            <UserPlus size={12} className="opacity-0 group-hover/btn:opacity-100 text-indigo-400 transition-opacity" />
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

                {/* Footer Stats */}
                <div className="px-8 py-5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{filteredLeads.length} Matching Leads</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {teamMembers.length} Active Agents
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                        Done & Close
                    </button>
                </div>
            </div>
        </div>
    );
}

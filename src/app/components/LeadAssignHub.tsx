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
    selectedIds?: string[];
    teamMembers: TeamMember[];
    totalCount?: number;
    onSuccess: () => void;
    onFetchAll?: () => Promise<any[]>;
    responses: any[];
}

export default function LeadAssignHub({ formId, onClose, responses, selectedIds = [], teamMembers, totalCount = 0, onSuccess, onFetchAll }: LeadAssignHubProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [unassignedOnly, setUnassignedOnly] = useState(false);
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
    const [selectedBulkIds, setSelectedBulkIds] = useState<Set<string>>(new Set());
    const [isBulkAssigning, setIsBulkAssigning] = useState<boolean>(false);
    const [allHubLeads, setAllHubLeads] = useState<any[] | null>(null);
    const [isLoadingFull, setIsLoadingFull] = useState(false);

    // Filter leads based on selection from main table
    const filteredLeads = useMemo(() => {
        let leads = allHubLeads || responses;
        if (selectedIds.length > 0 && !allHubLeads) { // Only restrict to selection if we haven't loaded all
            leads = leads.filter((r: any) => selectedIds.includes(r.id));
        }

        return leads.filter((res: any) => {
            const assigned = res.assignedTo || [];
            // Enhanced Unassigned Logic: Empty OR only contains the original submitter (not yet reassigned)
            const isTrulyUnassigned = assigned.length === 0 || (assigned.length === 1 && (assigned[0] === res.submittedBy || !res.submittedBy));
            
            if (unassignedOnly && !isTrulyUnassigned) return false;

            if (!searchTerm) return true;

            const searchVal = searchTerm.toLowerCase();
            const hasMatch = res.values?.some((v: any) => v.value?.toLowerCase().includes(searchVal));
            const hasInternalMatch = res.internalValues?.some((v: any) => v.value?.toLowerCase().includes(searchVal));
            const nameMatch = res.submittedByName?.toLowerCase().includes(searchVal);

            return hasMatch || hasInternalMatch || nameMatch;
        });
    }, [responses, allHubLeads, searchTerm, unassignedOnly, selectedIds]);

    const handleLoadAll = async () => {
        if (!onFetchAll) return;
        setIsLoadingFull(true);
        try {
            const all = await onFetchAll();
            setAllHubLeads(all);
            toast.success(`Matrix Fully Loaded (${all.length} leads)`);
        } catch (err) {
            toast.error("Failed to load full sector");
        } finally {
            setIsLoadingFull(false);
        }
    };

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

    const handleBulkAssign = async (targetUserId: string) => {
        if (selectedBulkIds.size === 0) return;
        setIsBulkAssigning(true);
        const tid = toast.loading(`Reassigning ${selectedBulkIds.size} leads...`);
        const targetMember = teamMembers.find(t => t.clerkId === targetUserId);

        try {
            const idsArray = Array.from(selectedBulkIds);
            const results = await Promise.all(idsArray.map(async (id) => {
                const sourceList = allHubLeads || responses;
                const resObj = sourceList.find(r => r.id === id);
                if (!resObj) return null;
                const currentAssigned = resObj.assignedTo || [];
                // Add the user if not already assigned
                if (currentAssigned.includes(targetUserId)) return "skip";

                const newAssigned = [...currentAssigned, targetUserId];
                const res = await fetch(`/api/crm/forms/${formId}/responses`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ responseId: id, assignedTo: newAssigned })
                });
                return res.ok;
            }));

            const successCount = results.filter(r => r === true).length;
            const skippedCount = results.filter(r => r === "skip").length;

            toast.success(`${successCount} Leads Matrix Enforced. ${skippedCount > 0 ? skippedCount + ' Skipped (Already Assigned)' : ''}`, { id: tid });
            if (successCount > 0) onSuccess();
            setSelectedBulkIds(new Set());
        } catch (error) {
            toast.error("Sector Reassignment Failure", { id: tid });
        } finally {
            setIsBulkAssigning(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedBulkIds.size === filteredLeads.length) setSelectedBulkIds(new Set());
        else setSelectedBulkIds(new Set(filteredLeads.map(l => l.id)));
    };

    const toggleRowSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedBulkIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // 🛡️ ENHANCED IDENTITY EXTRACTOR
    const getLeadInfo = (res: any) => {
        const val = res.values?.[0]?.value || res.values?.[1]?.value || "Lead Record";
        const email = res.values?.find((v: any) => v.value?.includes("@"))?.value;
        const phone = res.values?.find((v: any) => /^\d{10}$/.test(v.value?.replace(/[^0-9]/g, "")))?.value;
        const submitter = res.submittedByName || "Anonymous";

        return { name: val, email, phone, submitter };
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
                            <p className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Rapid Distribution Hub v3.0</span>
                                {totalCount > filteredLeads.length && !allHubLeads && (
                                    <button
                                        onClick={handleLoadAll}
                                        disabled={isLoadingFull}
                                        className="px-2 py-0.5 bg-amber-500 text-white rounded text-[8px] font-black uppercase tracking-widest animate-pulse hover:animate-none flex items-center gap-1"
                                    >
                                        {isLoadingFull ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />}
                                        Load All {totalCount} Sector Leads
                                    </button>
                                )}
                            </p>
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
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50 mr-2 group/inputbox">
                                        <div className="flex gap-0.5 border-r border-slate-200/50 pr-1.5 mr-1.5">
                                            {[10, 50, 100].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setSelectedBulkIds(new Set(filteredLeads.slice(0, n).map(l => l.id)))}
                                                    className="px-2 py-1 hover:bg-white hover:text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all text-slate-400"
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200">
                                            <span className="text-[7px] font-black text-slate-300 uppercase">Custom</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={filteredLeads.length}
                                                placeholder="Qty"
                                                className="w-10 bg-transparent border-none p-0 text-[10px] font-black text-slate-900 focus:ring-0 text-center"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = parseInt((e.target as HTMLInputElement).value);
                                                        if (!isNaN(val)) setSelectedBulkIds(new Set(filteredLeads.slice(0, val).map(l => l.id)));
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) setSelectedBulkIds(new Set(filteredLeads.slice(0, val).map(l => l.id)));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedBulkIds.size > 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {selectedBulkIds.size === filteredLeads.length && filteredLeads.length > 0 ? "Deselect Master" : `All Sector (${selectedBulkIds.size})`}
                                    </button>
                                </div>
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
                                    const isRowSelected = selectedBulkIds.has(res.id);

                                    return (
                                        <div key={res.id}
                                            onClick={() => toggleRowSelection(res.id)}
                                            className={`p-6 bg-white rounded-3xl border transition-all duration-300 flex items-center gap-8 group/item cursor-pointer ${isRowSelected
                                                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-xl z-10 translate-x-2'
                                                    : currentAssigned.length > 0
                                                        ? 'border-slate-100 shadow-sm hover:shadow-xl'
                                                        : 'border-amber-100 bg-amber-50/20 shadow-lg shadow-amber-50/30'
                                                }`}
                                        >
                                            <div className="shrink-0">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isRowSelected ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'border-slate-200 bg-white group-hover/item:border-indigo-300'}`}>
                                                    {isRowSelected && <CheckCircle2 size={12} />}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="shrink-0 flex flex-col items-center gap-2">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${currentAssigned.length > 0 ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-100 text-amber-600 animate-pulse'
                                                    }`}>
                                                    {currentAssigned.length > 0 ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
                                                </div>
                                            </div>

                                            {/* Submitter Info and Core Identity */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-[15px] font-black text-slate-900 tracking-tight leading-none group-hover/item:text-indigo-600 transition-colors">
                                                        {info.name}
                                                    </h4>
                                                    {currentAssigned.length === 0 && (
                                                        <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-200">Pending</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-2">
                                                        <Sparkles size={10} /> {info.submitter}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-500 tracking-tight">{info.phone || info.email || 'No contact info'}</span>
                                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : 'Syncing...'}</span>
                                                </div>
                                            </div>

                                            {/* 🎯 TARGET ASSIGNMENT PICKER */}
                                            <div className="shrink-0 flex items-center gap-2 border-l border-slate-100 pl-8">
                                                {/* Logic: Show filtered members OR members already assigned to this specific lead */}
                                                {Array.from(new Set([
                                                    ...filteredTeam.map(m => m.clerkId),
                                                    ...currentAssigned
                                                ])).map((clerkId) => {
                                                    const member = teamMembers.find(t => t.clerkId === clerkId);
                                                    if (!member) return null;

                                                    const isAssigned = currentAssigned.includes(member.clerkId);
                                                    const isUpdating = updatingIds.has(`${res.id}-${member.clerkId}`);

                                                    return (
                                                        <button
                                                            key={member.clerkId}
                                                            onClick={() => handleToggleAssignment(res.id, currentAssigned, member.clerkId)}
                                                            disabled={isUpdating}
                                                            title={`${isAssigned ? 'Remove' : 'Assign to'} ${member.firstName || 'Agent'}`}
                                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border relative group/btn ${isAssigned
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

                    {/* 🕵️ RIGHT: TARGET AGENT MATRIX */}
                    <div className="w-[320px] bg-white border-l border-slate-200/60 flex flex-col z-10 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.05)]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Elite Team Pool</h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Find agent..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
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
                                            {selectedBulkIds.size > 0 ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleBulkAssign(member.clerkId); }}
                                                    disabled={isBulkAssigning}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                                                >
                                                    {isBulkAssigning ? <Loader2 size={10} className="animate-spin" /> : `Assign All (${selectedBulkIds.size})`}
                                                </button>
                                            ) : (
                                                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                                    Ready
                                                </div>
                                            )}
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

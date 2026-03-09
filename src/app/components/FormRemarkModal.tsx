"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaTrash, FaPlus, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface FormRemark {
    id: string;
    remark: string;
    nextFollowUpDate?: string;
    followUpStatus?: string;
    authorName: string;
    createdAt: string;
}

interface Props {
    formId: string;
    responseId: string;
    userRole: string; // "MASTER", "ADMIN", etc.
    onClose: () => void;
    onSave?: () => void;
}

export default function FormRemarkModal({ formId, responseId, userRole, onClose, onSave }: Props) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [remarks, setRemarks] = useState<FormRemark[]>([]);
    const [form, setForm] = useState({
        remark: "",
        nextFollowUpDate: "",
        followUpStatus: "Scheduled"
    });

    const [isAdding, setIsAdding] = useState(false);

    const fetchRemarks = async () => {
        setFetching(true);
        // 1. Load from cache first
        const cacheKey = `remarks_cache_${responseId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try { setRemarks(JSON.parse(cached)); } catch (e) { }
        }

        try {
            const res = await fetch(`/api/crm/forms/${formId}/responses/${responseId}/remarks?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedRemarks = data.remarks || [];

                // Combine with offline-queued remarks for this response if they exist
                const queue = JSON.parse(localStorage.getItem("offline_remarks_queue") || "[]");
                const currentOffline = queue.filter((item: any) => item.responseId === responseId);

                const finalRemarks = [...currentOffline, ...fetchedRemarks];
                setRemarks(finalRemarks);
                localStorage.setItem(cacheKey, JSON.stringify(fetchedRemarks));
            }
        } catch (error) {
            if (!navigator.onLine) {
                // If offline, just rely on cache + existing state
            } else {
                toast.error("Failed to load follow-ups");
            }
        } finally {
            setFetching(false);
        }
    };

    // 🧠 AI Automation: Suggest next follow-up date based on status
    useEffect(() => {
        if (!isAdding) return;

        const today = new Date();
        let daysToAdd = 0;

        switch (form.followUpStatus) {
            case "Missed":
                daysToAdd = 1;
                break;
            case "Called":
                daysToAdd = 2;
                break;
            case "Scheduled":
                daysToAdd = 3;
                break;
            case "Walked In":
                daysToAdd = 3;
                break;
            case "Follow-up Done":
                daysToAdd = 7;
                break;
            case "Closed":
                setForm(prev => ({ ...prev, nextFollowUpDate: "" }));
                return;
            default:
                return;
        }

        if (daysToAdd > 0) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysToAdd);
            setForm(prev => ({ ...prev, nextFollowUpDate: nextDate.toISOString().split('T')[0] }));
        }
    }, [form.followUpStatus, isAdding]);

    useEffect(() => {
        fetchRemarks();

        const handleSync = () => {
            syncOfflineQueue();
        };
        window.addEventListener('online', handleSync);
        return () => window.removeEventListener('online', handleSync);
    }, [formId, responseId]);

    const syncOfflineQueue = async () => {
        const queue = JSON.parse(localStorage.getItem("offline_remarks_queue") || "[]");
        if (queue.length === 0) return;

        toast.loading("Syncing offline follow-ups...", { id: "sync-toast" });

        const newQueue = [...queue];
        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            try {
                const res = await fetch(`/api/crm/forms/${item.formId}/responses/${item.responseId}/remarks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item.data)
                });
                if (res.ok) {
                    newQueue.splice(newQueue.indexOf(item), 1);
                }
            } catch (e) {
                console.error("Sync failed for item", item);
            }
        }

        localStorage.setItem("offline_remarks_queue", JSON.stringify(newQueue));
        if (newQueue.length === 0) {
            toast.success("All follow-ups synced!", { id: "sync-toast" });
            fetchRemarks();
            if (onSave) onSave();
        } else {
            toast.error("Some follow-ups failed to sync.", { id: "sync-toast" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.remark) return toast.error("Please enter a remark.");

        // OFFLINE HANDLER
        if (!navigator.onLine) {
            const offlineItem = {
                id: `offline-${Date.now()}`,
                formId,
                responseId,
                data: form,
                remark: form.remark,
                authorName: "You (Offline)",
                createdAt: new Date().toISOString(),
                nextFollowUpDate: form.nextFollowUpDate,
                followUpStatus: form.followUpStatus
            };

            const queue = JSON.parse(localStorage.getItem("offline_remarks_queue") || "[]");
            localStorage.setItem("offline_remarks_queue", JSON.stringify([...queue, offlineItem]));

            // Optimistic Update
            setRemarks(prev => [offlineItem as any, ...prev]);
            setForm({ remark: "", nextFollowUpDate: "", followUpStatus: "Scheduled" });
            setIsAdding(false);
            toast.success("Saved offline. Will sync when online.");
            if (onSave) onSave();
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/crm/forms/${formId}/responses/${responseId}/remarks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                toast.success("Follow-up added!");
                setForm({ remark: "", nextFollowUpDate: "", followUpStatus: "Scheduled" });
                setIsAdding(false);
                fetchRemarks();
                if (onSave) onSave();
            } else {
                toast.error("Failed to save follow-up.");
            }
        } catch (error) {
            toast.error("Error saving follow-up.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (remarkId: string) => {
        if (!confirm("Are you sure you want to delete this follow-up?")) return;

        try {
            const res = await fetch(`/api/crm/forms/${formId}/responses/${responseId}/remarks?remarkId=${remarkId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Follow-up deleted");
                fetchRemarks();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Network error deleting follow-up");
        }
    };

    const canDelete = userRole === "MASTER" || userRole === "ADMIN";

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 p-5 pl-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <FaCalendarAlt /> Follow-ups & Remarks
                        </h3>
                        <p className="text-indigo-100 text-[11px] mt-1 font-bold uppercase tracking-widest">
                            Client interaction history
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-indigo-500/50 hover:bg-indigo-500 text-white rounded-xl transition-colors">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {fetching ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : remarks.length === 0 && !isAdding ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FaCalendarAlt className="text-slate-300 text-xl" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700">No Follow-ups Yet</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-4">You haven't added any remarks or follow-up dates to this response.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
                            >
                                <FaPlus /> Add First Follow-up
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white"
                                >
                                    <FaPlus /> Add New Follow-up
                                </button>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 shadow-sm rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Update / Remark</label>
                                        <textarea
                                            autoFocus
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 min-h-[80px] font-bold text-slate-700"
                                            placeholder="What was discussed?"
                                            value={form.remark}
                                            onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Next Follow-up Date (Optional)</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                            value={form.nextFollowUpDate}
                                            onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Follow-up Status</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                            value={form.followUpStatus}
                                            onChange={(e) => setForm({ ...form, followUpStatus: e.target.value })}
                                        >
                                            <option>Scheduled</option>
                                            <option>Called</option>
                                            <option>Call Again</option>
                                            <option>Call done</option>
                                            <option>Not interested</option>
                                            <option>RNR</option>
                                            <option>RNR2 (Checked)</option>
                                            <option>RNR3</option>
                                            <option>Switch off</option>
                                            <option>Invalid Number</option>
                                            <option>Walked In</option>
                                            <option>Follow-up Done</option>
                                            <option>Missed</option>
                                            <option>Closed</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={loading}
                                            type="submit"
                                            className="flex-[2] py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? "Saving..." : <><FaSave /> Save Follow-up</>}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3 mt-4">
                                {remarks.map(r => (
                                    <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 relative group hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black uppercase">
                                                    {r.authorName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{r.authorName}</p>
                                                    <p className="text-[10px] text-slate-400">{format(new Date(r.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                                </div>
                                            </div>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium pl-8">{r.remark}</p>

                                        {r.nextFollowUpDate && (
                                            <div className="mt-3 pl-8 flex items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                    <FaCalendarAlt /> Next: {format(new Date(r.nextFollowUpDate), "MMM d, yyyy")}
                                                </span>
                                                {r.followUpStatus && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-md text-[10px] font-black uppercase tracking-widest ${r.followUpStatus === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        r.followUpStatus === 'Missed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                        }`}>
                                                        {r.followUpStatus}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

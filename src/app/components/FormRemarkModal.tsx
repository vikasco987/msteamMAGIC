"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaTrash, FaPlus, FaCalendarAlt, FaMicrophone } from "react-icons/fa";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface FormRemark {
    id: string;
    remark: string;
    nextFollowUpDate?: string;
    followUpStatus?: string;
    leadStatus?: string;
    columnId?: string;
    authorName: string;
    createdAt: string;
}

interface Props {
    formId: string;
    responseId: string;
    columnId?: string; // NEW: Optional column link
    userRole: string; // "MASTER", "ADMIN", etc.
    onClose: () => void;
    onSave?: () => void;
}

export default function FormRemarkModal({ formId, responseId, columnId, userRole, onClose, onSave }: Props) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [remarks, setRemarks] = useState<FormRemark[]>([]);
    const [form, setForm] = useState({
        remark: "",
        nextFollowUpDate: "",
        followUpStatus: "",
        leadStatus: ""
    });

    const [isAdding, setIsAdding] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // 🗣️ VOICE FEEDBACK ENGINE (Speech Synthesis)
    const speakResponse = (text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel(); 
        const utterance = new ((window as any).SpeechSynthesisUtterance)(text);
        utterance.rate = 1.1; 
        utterance.lang = "en-IN";
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Mic not supported in this browser");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-IN"; 
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                setIsListening(false);
                if (event.error !== 'no-speech') toast.error(`Mic Error: ${event.error}`);
            };

            const processTranscript = (text: string) => {
                const dictionary: Record<string, string> = {
                    '\\bcal\\b': 'kal', '\\bcall\\b': 'kal', '\\bperson\\b': 'parson',
                    '\\bhay\\b': 'hai', '\\bhigh\\b': 'hai', '\\bhey\\b': 'hai',
                    '\\bball\\b': 'bol', '\\braha\\b': 'raha', '\\brahow\\b': 'raho',
                    '\\bli\\b': 'liye', '\\blee\\b': 'liye', '\\bkey\\b': 'ke',
                    '\\bkay\\b': 'ke', '\\bmarning\\b': 'morning'
                };
                let cleaned = text.toLowerCase();
                Object.entries(dictionary).forEach(([wrong, right]) => {
                    cleaned = cleaned.replace(new RegExp(wrong, 'gi'), right);
                });
                return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            };

            const CALL_STATUS_OPTIONS = ["CALL AGAIN", "CALL DONE", "RNR", "INVALID NUMBER", "SWITCH OFF", "RNR 2", "RNR3", "INCOMING NOT AVAIABLE", "MEETING", "DUPLICATE", "WRONG NUMBER"];

            recognition.onresult = (event: any) => {
                const rawTranscript = event.results[0][0].transcript;
                const transcript = processTranscript(rawTranscript);
                const startTime = performance.now();
                
                const getSimilarity = (s1: string, s2: string) => {
                    const longer = s1.length > s2.length ? s1.toLowerCase() : s2.toLowerCase();
                    const shorter = s1.length > s2.length ? s2.toLowerCase() : s1.toLowerCase();
                    if (longer.length === 0) return 1.0;
                    const editDistance = (a: string, b: string) => {
                        const costs = [];
                        for (let i = 0; i <= a.length; i++) {
                            let last = i;
                            for (let j = 0; j <= b.length; j++) {
                                if (i === 0) costs[j] = j;
                                else if (j > 0) {
                                    let newVal = costs[j-1];
                                    if (a[i-1] !== b[j-1]) newVal = Math.min(Math.min(newVal, last), costs[j]) + 1;
                                    costs[j-1] = last; last = newVal;
                                }
                            }
                            if (i > 0) costs[b.length] = last;
                        }
                        return costs[b.length];
                    };
                    return (longer.length - editDistance(longer, shorter)) / longer.length;
                };

                let detectedCalling = "";
                let detectedLead = "";
                let detectedDateString = "";
                const today = new Date();
                const transcriptLC = transcript.toLowerCase();
                if (transcriptLC.includes("parson")) {
                    const d = new Date(today); d.setDate(today.getDate() + 2);
                    detectedDateString = d.toISOString().split('T')[0];
                } else if (transcriptLC.includes("kal") || transcriptLC.includes("tomorrow")) {
                    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
                    detectedDateString = tomorrow.toISOString().split('T')[0];
                }

                const SEARCH_PATTERNS = [
                    ...CALL_STATUS_OPTIONS.map(opt => ({ text: opt, intent: opt, type: 'calling' })),
                    ...LEAD_STATUS_OPTIONS.map(opt => ({ text: opt, intent: opt, type: 'lead' })),
                    { text: "nr", intent: "RNR", type: 'calling' },
                    { text: "call karenge", intent: "CALL AGAIN", type: 'calling' },
                    { text: "baat karenge", intent: "CALL AGAIN", type: 'calling' },
                    { text: "meeting fix", intent: "MEETING", type: 'calling' },
                    { text: "done", intent: "CALL DONE", type: 'calling' }
                ];

                let bestMatch = { intent: "", type: "", rating: 0 };
                SEARCH_PATTERNS.forEach(p => {
                    const rating = getSimilarity(transcriptLC, p.text);
                    if (rating > bestMatch.rating && rating > 0.65) {
                        bestMatch = { intent: p.intent, type: p.type, rating };
                    }
                });

                const confidence = bestMatch.rating;
                const endTime = performance.now();
                console.log(`⚡ AI Latency: ${(endTime - startTime).toFixed(2)}ms`);

                if (confidence >= 0.8) {
                    if (bestMatch.type === 'calling') {
                        detectedCalling = bestMatch.intent;
                        speakResponse(`Status set to ${bestMatch.intent}`);
                    }
                    if (bestMatch.type === 'lead') {
                        detectedLead = bestMatch.intent;
                        speakResponse(`Lead marked as ${bestMatch.intent}`);
                    }
                } else if (confidence >= 0.65) {
                    toast(`🤔 AI: Did you mean "${bestMatch.intent}"?`, { icon: '🤖' });
                    speakResponse(`Did you mean ${bestMatch.intent}?`);
                }

                let finalRemark = transcript.trim();
                if (detectedCalling || detectedLead) {
                    const regex = new RegExp(`\\b${bestMatch.intent.replace(/\s+/g, '\\s*')}\\b`, 'gi');
                    finalRemark = finalRemark.replace(regex, '').trim();
                }

                if (!bestMatch.intent && transcript.length > 5) {
                    console.log("❌ MISSED INTENT:", { text: transcript, timestamp: new Date().toISOString() });
                } else if (bestMatch.intent) {
                    console.log("✅ MATCHED INTENT:", { input: transcript, output: bestMatch.intent, confidence, latency: `${(endTime - startTime).toFixed(2)}ms` });
                }

                setForm(prev => ({ 
                    ...prev, 
                    remark: prev.remark ? `${prev.remark} ${finalRemark}` : finalRemark,
                    followUpStatus: detectedCalling || prev.followUpStatus,
                    leadStatus: detectedLead || prev.leadStatus,
                    nextFollowUpDate: detectedDateString || prev.nextFollowUpDate
                }));

                if (detectedCalling || detectedLead || detectedDateString) {
                    toast.success(`✨ AI (Confidence: ${Math.round(confidence * 100)}%): Logged`);
                    if (detectedDateString && !detectedCalling) speakResponse("Date set for follow-up");
                }

                const tLC = rawTranscript.toLowerCase();
                if (tLC.includes("save kardo") || tLC.includes("submit kardo") || tLC.includes("ho gaya")) {
                    speakResponse("Saving results");
                    toast.loading("Saving...");
                    setTimeout(() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click(), 800);
                }
                if (tLC.includes("band kar do") || tLC.includes("cancel kardo")) {
                    speakResponse("Closing");
                    toast.success("Closing...");
                    setTimeout(() => onClose(), 500);
                }
            };

            if (isListening) recognition.stop();
            else recognition.start();
        } catch (e) {
            console.error(e);
            toast.error("Voice typing failed");
        }
    };

    const fetchRemarks = async () => {
        setFetching(true);
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
                const queue = JSON.parse(localStorage.getItem("offline_remarks_queue") || "[]");
                const currentOffline = queue.filter((item: any) => item.responseId === responseId);
                const finalRemarks = [...currentOffline, ...fetchedRemarks];
                setRemarks(finalRemarks);
                localStorage.setItem(cacheKey, JSON.stringify(fetchedRemarks));
            }
        } catch (error) {
            if (navigator.onLine) toast.error("Failed to load follow-ups");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!isAdding) return;
        const today = new Date();
        let daysToAdd = 0;
        switch (form.followUpStatus) {
            case "CALL AGAIN": case "RNR": case "RNR 2": case "RNR3": case "SWITCH OFF": daysToAdd = 1; break;
            case "CALL DONE": case "MEETING": daysToAdd = 2; break;
        }
        if (daysToAdd > 0) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysToAdd);
            setForm(prev => ({ ...prev, nextFollowUpDate: nextDate.toISOString().split('T')[0] }));
        }
    }, [form.followUpStatus, isAdding]);

    const LEAD_STATUS_OPTIONS = [
        "Will Share today", "Will let me know in 2 days", "Not Intertested", "Onboarded", 
        "Will Let me know 7 days", "Customer Will Call", "Meeting Fix", "already applyed", 
        "language barrier", "Already Done", "Delivery Partners", "CUSTOMER WILL LET ME KNOW"
    ];

    useEffect(() => {
        fetchRemarks();
        if (columnId) setIsAdding(true);
        const handleSync = () => syncOfflineQueue();
        window.addEventListener('online', handleSync);
        return () => window.removeEventListener('online', handleSync);
    }, [formId, responseId, columnId]);

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
                if (res.ok) newQueue.splice(newQueue.indexOf(item), 1);
            } catch (e) { }
        }
        localStorage.setItem("offline_remarks_queue", JSON.stringify(newQueue));
        if (newQueue.length === 0) {
            toast.success("All follow-ups synced!", { id: "sync-toast" });
            fetchRemarks();
            if (onSave) onSave();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalRemark = form.remark || `Status interaction: ${form.followUpStatus}`;
        if (!finalRemark && !columnId) return toast.error("Please enter a remark.");
        const payload = { 
            remark: finalRemark,
            nextFollowUpDate: form.nextFollowUpDate || null,
            followUpStatus: form.followUpStatus || "CALL AGAIN",
            leadStatus: form.leadStatus || null,
            columnId 
        };
        if (!navigator.onLine) {
            const offlineItem = { id: `offline-${Date.now()}`, formId, responseId, data: payload, remark: payload.remark, authorName: "You (Offline)", createdAt: new Date().toISOString(), nextFollowUpDate: payload.nextFollowUpDate, followUpStatus: payload.followUpStatus, columnId: payload.columnId };
            const queue = JSON.parse(localStorage.getItem("offline_remarks_queue") || "[]");
            localStorage.setItem("offline_remarks_queue", JSON.stringify([...queue, offlineItem]));
            setRemarks(prev => [offlineItem as any, ...prev]);
            setForm({ remark: "", nextFollowUpDate: "", followUpStatus: "", leadStatus: "" });
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
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success(columnId ? "Status updated!" : "Follow-up added!");
                setForm({ remark: "", nextFollowUpDate: "", followUpStatus: "", leadStatus: "" });
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
            const res = await fetch(`/api/crm/forms/${formId}/responses/${responseId}/remarks?remarkId=${remarkId}`, { method: "DELETE" });
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

    const canDelete = userRole === "MASTER" || userRole === "ADMIN" || userRole === "TL";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 p-5 pl-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2 text-white">
                            <FaCalendarAlt /> {columnId ? "Status Updates" : "Calls & Remarks"}
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
                            <h4 className="text-sm font-bold text-slate-700">No Interactions Yet</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-4">You haven't added any remarks or calling dates to this response.</p>
                            <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2">
                                <FaPlus /> Add First Interaction
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!isAdding ? (
                                <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white">
                                    <FaPlus /> Add New Interaction
                                </button>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 shadow-xl rounded-[32px] p-6 space-y-5 animate-in slide-in-from-top-4">
                                    {!columnId && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Update / Remark</label>
                                                <div className="relative group">
                                                    <textarea
                                                        autoFocus
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-6 pr-24 text-base focus:ring-[12px] focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 min-h-[160px] font-bold text-slate-700 shadow-inner resize-none leading-relaxed"
                                                        placeholder="Speak naturally (Hinglish Supported)..."
                                                        value={form.remark}
                                                        onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                                    />
                                                    <div className="absolute bottom-5 right-5 flex flex-col items-center gap-2">
                                                        {isListening && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Listening...</span>}
                                                        <button 
                                                            type="button"
                                                            onClick={toggleListening}
                                                            title="Speak in Hindi/English/Hinglish"
                                                            className={`flex flex-col items-center justify-center w-16 h-16 rounded-[24px] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] transition-all active:scale-90 z-10 border-4 ${isListening ? 'bg-rose-500 text-white border-rose-400 animate-pulse ring-8 ring-rose-500/20' : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 ring-8 ring-transparent hover:ring-indigo-500/10'}`}
                                                        >
                                                            <FaMicrophone size={28} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Next Scheduled Interaction (Optional)</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
                                                    value={form.nextFollowUpDate}
                                                    onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Calling Status</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                            value={form.followUpStatus}
                                            onChange={(e) => setForm({ ...form, followUpStatus: e.target.value })}
                                        >
                                            <option value="">Select Calling Status</option>
                                            <option>CALL AGAIN</option>
                                            <option>CALL DONE</option>
                                            <option>RNR</option>
                                            <option>INVALID NUMBER</option>
                                            <option>SWITCH OFF</option>
                                            <option>RNR 2</option>
                                            <option>RNR3</option>
                                            <option>INCOMING NOT AVAIABLE</option>
                                            <option>MEETING</option>
                                            <option>DUPLICATE</option>
                                            <option>WRONG NUMBER</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Lead Status (Optional)</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                            value={form.leadStatus}
                                            onChange={(e) => setForm({ ...form, leadStatus: e.target.value })}
                                        >
                                            <option value="">Select Lead Status (None)</option>
                                            {LEAD_STATUS_OPTIONS.map(opt => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                                        <button disabled={loading} type="submit" className="flex-[2] py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2">
                                            {loading ? "Saving..." : (columnId ? "Update Status" : "Save Interaction")}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3 mt-6">
                                {remarks.map((r, i) => (
                                    <div key={r.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                                                    {r.authorName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter leading-none">{r.authorName}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">{format(new Date(r.createdAt), "MMM d, h:mm a")}</p>
                                                </div>
                                            </div>
                                            {canDelete && (
                                                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <FaTrash size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="pl-9">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {r.followUpStatus && (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black border border-slate-200">
                                                        {r.followUpStatus}
                                                    </span>
                                                )}
                                                {r.nextFollowUpDate && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black border border-indigo-100">
                                                        📅 NEXT: {format(new Date(r.nextFollowUpDate), "MMM d, yyyy")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 font-bold leading-relaxed whitespace-pre-wrap">{r.remark}</p>
                                        </div>
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

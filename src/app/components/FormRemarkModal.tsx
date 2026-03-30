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

    const toggleListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Mic not supported in this browser");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "hi-IN"; 
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                setIsListening(false);
                if (event.error !== 'no-speech') toast.error(`Mic Error: ${event.error}`);
            };

            const romanizeHindi = (hindi: string) => {
                const map: Record<string, string> = {
                    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
                    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'nya',
                    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
                    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
                    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
                    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
                    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n',
                    '्': '', '।': '.', ' ': ' '
                };

                const dictionary: Record<string, string> = {
                    'स्विग्गी': 'swiggy', 'जोमैटो': 'zomato', 'कॉल': 'call', 'कस्टमर': 'customer',
                    'ऑनबोर्डिंग': 'onboarding', 'लोडिंग': 'loading', 'बिजी': 'busy', 'पेमेंट': 'payment',
                    'इंटरेस्टेड': 'interested', 'इंटरेस्ट': 'interest', 'बाद': 'baad', 'मैसेज': 'message',
                    'बात': 'baat', 'कल': 'kal', 'बोल': 'bol', 'रहा': 'raha', 'रही': 'rahee', 'रहे': 'rahe',
                    'हूँ': 'hoon', 'हुँ': 'hoon', 'हैं': 'hain', 'है': 'hai', 'था': 'tha', 'थी': 'thi', 'थे': 'the',
                    'परसों': 'parson', 'परसो': 'parson', 'आज': 'aaj', 'हो': 'ho', 'गया': 'gaya', 'गयी': 'gayee', 'थीं': 'theen',
                    'कर': 'kar', 'करो': 'karo', 'करना': 'karna', 'करेंगे': 'karenge', 'ठीक': 'theek', 'दिक्कत': 'dikkat',
                    'समझ': 'samajh', 'बोलना': 'bolna', 'बोला': 'bola', 'बोलूंगा': 'bolunga', 'बोली': 'bolee'
                };

                let processed = hindi;
                for (const [hindiWord, engWord] of Object.entries(dictionary)) {
                    processed = processed.replace(new RegExp(hindiWord, 'g'), engWord);
                }

                let romanized = '';
                for (let i = 0; i < processed.length; i++) {
                    const char = processed[i];
                    const next = processed[i + 1];
                    if (map[char]) {
                        romanized += map[char];
                        const isConsonant = "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह".includes(char);
                        const isVowelSign = "ािीुूेैोौ्ं".includes(next);
                        if (isConsonant && !isVowelSign && next !== ' ' && next !== undefined) {
                            romanized += 'a';
                        }
                    } else if (char.match(/[a-z0-9]/i)) {
                        romanized += char;
                    }
                }

                let final = romanized.toLowerCase().replace(/\s+/g, ' ').trim();
                const smartFixes: Record<string, string> = {
                    '\\bbt\\b': 'baat', '\\bkr\\b': 'kar', '\\bh\\b': 'hai',
                    '\\bhu\\b': 'hoon', '\\bbta\\b': 'bataya', '\\bmarning\\b': 'morning', 
                    '\\bonbording\\b': 'onboarding', '\\btomorrow\\b': 'tomorrow'
                };
                Object.entries(smartFixes).forEach(([wrong, right]) => {
                    final = final.replace(new RegExp(wrong, 'g'), right);
                });
                return final;
            };

            const CALL_STATUS_OPTIONS = ["CALL AGAIN", "CALL DONE", "RNR", "INVALID NUMBER", "SWITCH OFF", "RNR 2", "RNR3", "INCOMING NOT AVAIABLE", "MEETING", "DUPLICATE", "WRONG NUMBER"];

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                const romanTranscript = romanizeHindi(transcript);
                
                let detectedCalling = "";
                let detectedLead = "";
                
                let detectedDateString = "";
                const today = new Date();
                const schedLC = romanTranscript.toLowerCase();
                if (schedLC.includes("parson") || schedLC.includes("parso")) {
                    const d = new Date(today); d.setDate(today.getDate() + 2);
                    detectedDateString = d.toISOString().split('T')[0];
                } else if (schedLC.includes("kal") || schedLC.includes("tomorrow")) {
                    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
                    detectedDateString = tomorrow.toISOString().split('T')[0];
                }

                let workingTranscript = romanTranscript.replace(/\b(status|kardo|kar do|set|lead|karna hai|karna|hoga|kariye|karona|bol raha hun|bol rahi hun|bol rahe hain|bola hai|ko|li|liye|ke|is|se|me|main|kal|parson|parso|today|aaj)\b/gi, '').trim();
                let finalRemark = workingTranscript;

                const CRM_SHORTHANDS: Record<string, string> = {
                    'nr': 'RNR', 'arnar': 'RNR', 'r n r': 'RNR', 'anar': 'RNR', 'call': 'CALL DONE', 'done': 'CALL DONE', 'duplicate': 'DUPLICATE', 'meeting': 'MEETING'
                };

                Object.entries(CRM_SHORTHANDS).forEach(([short, full]) => {
                    const regex = new RegExp(`\\b${short}\\b`, 'gi');
                    if (regex.test(workingTranscript)) {
                        detectedCalling = full;
                        finalRemark = finalRemark.replace(regex, '').trim();
                    }
                });

                if (!detectedCalling) {
                    CALL_STATUS_OPTIONS.forEach(opt => {
                        const regex = new RegExp(`\\b${opt.replace(/\s+/g, '\\s*')}\\b`, 'gi');
                        if (regex.test(workingTranscript)) {
                            detectedCalling = opt;
                            finalRemark = finalRemark.replace(regex, '').trim();
                        }
                    });
                }

                LEAD_STATUS_OPTIONS.forEach(opt => {
                    const pattern = opt.toLowerCase().slice(0, 5);
                    const regex = new RegExp(`\\b(${opt}|${pattern}[a-z]*)\\b`, 'gi');
                    if (regex.test(workingTranscript)) {
                        detectedLead = opt;
                        finalRemark = finalRemark.replace(regex, '').trim();
                    }
                });

                finalRemark = finalRemark.replace(/\s+/g, ' ').trim();

                setForm(prev => ({ 
                    ...prev, 
                    remark: prev.remark ? `${prev.remark} ${finalRemark}` : finalRemark,
                    followUpStatus: detectedCalling || prev.followUpStatus,
                    leadStatus: detectedLead || prev.leadStatus,
                    nextFollowUpDate: detectedDateString || prev.nextFollowUpDate
                }));

                if (detectedCalling || detectedLead || detectedDateString) {
                    toast.success(`✨ AI: ${detectedCalling || detectedLead}${detectedDateString ? ' (Date set!)' : ''}`);
                }

                const TRANSCRIPT_LC = transcript.toLowerCase();
                if (TRANSCRIPT_LC.includes("save kardo") || TRANSCRIPT_LC.includes("submit kardo") || TRANSCRIPT_LC.includes("ho gaya")) {
                    toast.loading("AI: Saving interaction...");
                    setTimeout(() => {
                        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                        if (submitButton) submitButton.click();
                    }, 800);
                }

                if (TRANSCRIPT_LC.includes("band kar do") || TRANSCRIPT_LC.includes("close kardo") || TRANSCRIPT_LC.includes("cancel kardo")) {
                    toast.success("AI: Closing modal...");
                    setTimeout(() => onClose(), 500);
                }
            };

            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
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

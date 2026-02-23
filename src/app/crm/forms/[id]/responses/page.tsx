"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    Database,
    ArrowLeft,
    Download,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Search,
    Filter,
    ArrowUpRight,
    X,
    MoreHorizontal,
    Table,
    FileSpreadsheet,
    Smartphone,
    Plus,
    LayoutGrid,
    CheckCircle2,
    Clock,
    UserPlus,
    Type,
    ChevronDown,
    Save,
    Maximize2,
    ExternalLink,
    ShieldCheck,
    History,
    FileText,
    Hash,
    IndianRupee,
    Percent,
    ListFilter,
    Layers,
    CalendarDays,
    CheckSquare,
    Users,
    Paperclip,
    FunctionSquare,
    Star,
    Link,
    Phone,
    Mail,
    Trash2,
    Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface FormField {
    id: string;
    label: string;
    type: string;
    options: any;
}

interface InternalColumn {
    id: string;
    label: string;
    type: string;
    options: any;
    isRequired?: boolean;
    isLocked?: boolean;
}

interface ResponseValue {
    fieldId: string;
    value: string;
}

interface FormActivity {
    id: string;
    userName: string;
    type: string;
    columnName: string;
    oldValue: string;
    newValue: string;
    createdAt: string;
}

interface FormResponse {
    id: string;
    submittedAt: string;
    submittedByName: string;
    values: ResponseValue[];
}

interface MasterData {
    form: { title: string; fields: FormField[] };
    responses: FormResponse[];
    internalColumns: InternalColumn[];
    internalValues: { responseId: string; columnId: string; value: string; updatedByName?: string; updatedAt?: string }[];
    activities: FormActivity[];
}

const COLUMN_TYPES = [
    { title: "Standard Text", id: "text", icon: Type, color: "text-blue-500" },
    { title: "Long Narrative", id: "long_text", icon: FileText, color: "text-slate-500" },
    { title: "Pure Number", id: "number", icon: Hash, color: "text-emerald-500" },
    { title: "Currency (INR)", id: "currency", icon: IndianRupee, color: "text-indigo-500" },
    { title: "Smart Dropdown", id: "dropdown", icon: ListFilter, color: "text-amber-500" },
    { title: "Multi Select", id: "multi_select", icon: Layers, color: "text-purple-500" },
    { title: "Universal Date", id: "date", icon: CalendarDays, color: "text-rose-500" },
    { title: "Checkbox/Binary", id: "checkbox", icon: CheckSquare, color: "text-cyan-500" },
    { title: "Team Member", id: "user", icon: Users, color: "text-violet-500" },
    { title: "Phone Matrix", id: "phone", icon: Phone, color: "text-green-500" },
    { title: "Verified Email", id: "email", icon: Mail, color: "text-blue-400" },
    { title: "Deep Formula", id: "formula", icon: FunctionSquare, color: "text-pink-500" },
    { title: "External Link", id: "url", icon: Link, color: "text-indigo-400" },
    { title: "Attachment Hub", id: "file", icon: Paperclip, color: "text-slate-400" },
];

export default function CRMSpreadsheetPage() {
    const router = useRouter();
    const params = useParams();
    const [data, setData] = useState<MasterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
    const [editValue, setEditValue] = useState("");

    // New Column Advanced State
    const [newColLabel, setNewColLabel] = useState("");
    const [newColType, setNewColType] = useState("text");
    const [newColOptions, setNewColOptions] = useState<{ label: string, color: string }[]>([]);
    const [newColSettings, setNewColSettings] = useState({ isRequired: false, isLocked: false, showInPublic: false });

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/crm/forms/${params.id}/responses`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            toast.error("Failed to sync matrix");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [params.id]);

    const handleUpdateValue = async (responseId: string, columnId: string, value: string, isInternal: boolean) => {
        try {
            const res = await fetch(`/api/crm/forms/${params.id}/responses`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ responseId, columnId, value, isInternal })
            });
            if (res.ok) {
                fetchData(); // Refetch to get updated activity & metadata
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleConvertToLead = async (res: FormResponse) => {
        const name = res.submittedByName || "Public User";
        const phoneField = data?.form?.fields?.find(f => f.label.toLowerCase().includes("phone") || f.type === "number");
        const emailField = data?.form?.fields?.find(f => f.label.toLowerCase().includes("email") || f.label.toLowerCase().includes("mail"));

        const phone = res.values.find(v => v.fieldId === phoneField?.id)?.value || "";
        const email = res.values.find(v => v.fieldId === emailField?.id)?.value || "";

        if (!phone) {
            const manualPhone = prompt("Phone number not found. Please enter phone manually:");
            if (!manualPhone) return;
            triggerConvert(res.id, name, manualPhone, email);
        } else {
            triggerConvert(res.id, name, phone, email);
        }
    };

    const triggerConvert = async (id: string, name: string, phone: string, email: string) => {
        const loadingToast = toast.loading("Converting to CRM Lead...");
        try {
            const res = await fetch(`/api/crm/responses/${id}/convert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email, remark: `Converted from Form: ${data?.form?.title}` })
            });
            if (res.ok) {
                toast.success("Lead sync complete!", { id: loadingToast });
                router.push("/customers");
            } else {
                toast.error("Conversion failed", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Network error", { id: loadingToast });
        }
    };

    const handleAddColumn = async () => {
        if (!newColLabel) return;
        try {
            const res = await fetch(`/api/crm/forms/${params.id}/columns`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: newColLabel,
                    type: newColType,
                    options: newColOptions,
                    isRequired: newColSettings.isRequired,
                    isLocked: newColSettings.isLocked,
                    showInPublic: newColSettings.showInPublic
                })
            });
            if (res.ok) {
                toast.success("Dimension Deployed");
                setIsAddColumnOpen(false);
                setNewColLabel("");
                setNewColOptions([]);
                fetchData();
            }
        } catch (err) {
            toast.error("Failed to add column");
        }
    };

    const getCellValue = (responseId: string, colId: string, isInternal: boolean) => {
        if (!data) return "";
        if (isInternal) {
            return data.internalValues?.find(v => v.responseId === responseId && v.columnId === colId)?.value || "";
        }
        const resp = data.responses?.find(r => r.id === responseId);
        return resp?.values?.find(v => v.fieldId === colId)?.value || "";
    };

    const filteredResponses = useMemo(() => {
        if (!data) return [];
        if (!searchTerm) return data.responses || [];
        const term = searchTerm.toLowerCase();
        return data.responses.filter(r =>
            (r.submittedByName || "").toLowerCase().includes(term) ||
            r.values.some(v => (v.value || "").toLowerCase().includes(term))
        );
    }, [data, searchTerm]);

    const safeFormat = (dateStr: string, pattern: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "—";
            return format(d, pattern);
        } catch (e) { return "—"; }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-900 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-xl" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Booting Data Matrix v2.0</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col h-screen overflow-hidden text-slate-900">
            {/* SaaS Header */}
            <header className="h-[110px] bg-white border-b border-slate-200 px-12 flex items-center justify-between shrink-0 z-30 shadow-sm relative">
                <div className="flex items-center gap-12">
                    <button onClick={() => router.back()} className="p-4 bg-slate-50 border border-slate-100 rounded-[28px] hover:bg-white transition-all shadow-sm active:scale-90">
                        <ArrowLeft size={22} className="text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter leading-none mb-3">{data?.form?.title || "Project Ledger"}</h1>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <ShieldCheck size={14} className="text-indigo-500" /> Administrative Matrix
                            </span>
                            <span className="h-4 w-[1px] bg-slate-200" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                <History size={14} /> Audit Trail Live
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Universal Record Search..."
                            className="pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[40px] outline-none font-bold text-sm min-w-[420px] transition-all shadow-sm"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddColumnOpen(true)}
                        className="px-10 py-5.5 bg-white border-2 border-slate-100 text-slate-600 rounded-[40px] text-[10px] font-black uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all flex items-center gap-3 active:scale-95"
                    >
                        <Plus size={22} className="text-indigo-600" /> Dimension
                    </button>

                    <button className="px-10 py-5.5 bg-slate-900 text-white rounded-[40px] text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-2xl transition-all shadow-slate-200 flex items-center gap-3 active:scale-95">
                        <Download size={22} className="text-indigo-400" /> Export
                    </button>
                </div>
            </header>

            {/* Matrix Console */}
            <main className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar">
                <table className="border-separate border-spacing-0 w-full min-w-[max-content]">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-white/80 backdrop-blur-xl">
                            <th className="px-12 py-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center sticky left-0 bg-white z-30 min-w-[140px] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">Profile</th>
                            <th className="px-14 py-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] sticky left-[140px] bg-white z-30 min-w-[300px] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">Primary Contributor</th>

                            {data?.form?.fields?.map(f => (
                                <th key={f.id} className="px-14 py-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] min-w-[280px] bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Type size={16} /></div> {f.label}
                                    </div>
                                </th>
                            ))}

                            {data?.internalColumns.map(ic => {
                                const TypeIcon = COLUMN_TYPES.find(t => t.id === ic.type)?.icon || Database;
                                return (
                                    <th key={ic.id} className="px-14 py-8 border-b border-r border-slate-200 text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] bg-indigo-50/10 min-w-[280px]">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50"><TypeIcon size={18} /></div> {ic.label}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResponses.map((res) => (
                            <tr key={res.id} className="group hover:bg-indigo-50/5 transition-all">
                                <td className="px-12 py-8 border-b border-r border-slate-100 text-center sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
                                    <button onClick={() => setSelectedResponse(res)} className="p-4 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-[22px] transition-all bg-white shadow-sm border border-slate-100 hover:border-indigo-100">
                                        <Maximize2 size={20} />
                                    </button>
                                </td>
                                <td className="px-14 py-8 border-b border-r border-slate-100 sticky left-[140px] bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-[20px] bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase ring-4 ring-slate-50">
                                            {res.submittedByName ? res.submittedByName[0] : "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{res.submittedByName || "Public User"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2.5 flex items-center gap-2">
                                                <Calendar size={12} className="text-indigo-500" /> {safeFormat(res.submittedAt, "MMM dd, HH:mm")}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {data?.form?.fields?.map(field => {
                                    const val = getCellValue(res.id, field.id, false);
                                    const isEditing = editingCell?.rowId === res.id && editingCell?.colId === field.id;
                                    return (
                                        <td key={field.id} onClick={() => { setEditingCell({ rowId: res.id, colId: field.id }); setEditValue(val); }} className={`px-14 py-8 border-b border-r border-slate-100 text-[13px] font-bold text-slate-600 transition-all
                                            ${isEditing ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-500' : ''}`}>
                                            {isEditing ? (
                                                <input autoFocus className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-black" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => { handleUpdateValue(res.id, field.id, editValue, false); setEditingCell(null); }} />
                                            ) : (
                                                <span className="truncate block max-w-[200px]">{val || "—"}</span>
                                            )}
                                        </td>
                                    );
                                })}

                                {data?.internalColumns.map(ic => {
                                    const val = getCellValue(res.id, ic.id, true);
                                    const isEditing = editingCell?.rowId === res.id && editingCell?.colId === ic.id;
                                    const metadata = data.internalValues?.find(v => v.responseId === res.id && v.columnId === ic.id);

                                    return (
                                        <td key={ic.id} onClick={() => { if (!ic.isLocked) { setEditingCell({ rowId: res.id, colId: ic.id }); setEditValue(val); } }} className={`px-14 py-8 border-b border-r border-slate-100 transition-all relative group/cell
                                            ${isEditing ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-500' : ''} ${ic.isLocked ? 'bg-slate-50/50 cursor-not-allowed' : 'cursor-text'}`}>

                                            {/* Cell User Badge (Who updated) */}
                                            {metadata?.updatedByName && !isEditing && (
                                                <div className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                    <div className="px-2 py-0.5 bg-slate-800 text-white text-[7px] font-black uppercase rounded-md flex items-center gap-1">
                                                        <User size={8} /> {metadata.updatedByName.split(' ')[0]}
                                                    </div>
                                                </div>
                                            )}

                                            {isEditing ? (
                                                ic.type === "dropdown" ? (
                                                    <select autoFocus className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] font-black uppercase text-indigo-700 outline-none" value={editValue} onChange={(e) => { handleUpdateValue(res.id, ic.id, e.target.value, true); setEditingCell(null); }}>
                                                        <option value="">Select...</option>
                                                        {ic.options?.map((opt: any) => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
                                                    </select>
                                                ) : (
                                                    <input autoFocus className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-black text-[13px]" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => { handleUpdateValue(res.id, ic.id, editValue, true); setEditingCell(null); }} onKeyDown={(e) => e.key === 'Enter' && (handleUpdateValue(res.id, ic.id, editValue, true) || setEditingCell(null))} />
                                                )
                                            ) : (
                                                ic.type === "dropdown" && val ? (
                                                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white shadow-sm">{val}</span>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[13px] font-bold text-indigo-900">{val || "—"}</span>
                                                        {ic.isLocked && <ShieldCheck size={14} className="text-slate-300" />}
                                                    </div>
                                                )
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {/* Matrix Intelligence Drawer */}
            <AnimatePresence>
                {selectedResponse && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedResponse(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-[650px] bg-white shadow-[-40px_0_100px_rgba(0,0,0,0.1)] z-[70] overflow-hidden flex flex-col">

                            {/* Drawer Header */}
                            <div className="p-12 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                                <div>
                                    <span className="px-5 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-[14px] mb-5 inline-block shadow-lg shadow-indigo-100">Profile Analysis</span>
                                    <h2 className="text-4xl font-black tracking-tighter text-slate-900">Core Audit</h2>
                                </div>
                                <button onClick={() => setSelectedResponse(null)} className="p-6 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[30px] transition-all hover:rotate-90 active:scale-90">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                <div className="space-y-16">
                                    {/* Workflow Controller */}
                                    <div className="p-10 bg-slate-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <h4 className="text-2xl font-black mb-4 tracking-tight">Active Workflows</h4>
                                            <p className="text-slate-400 text-xs font-bold mb-12 leading-relaxed max-w-[80%]">Push this submission profile into the main CRM funnel. This triggers automated validation and sales assignment.</p>

                                            <div className="grid grid-cols-2 gap-5">
                                                <button onClick={() => handleConvertToLead(selectedResponse)} className="py-6 bg-white text-slate-900 rounded-[32px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-4">
                                                    <UserPlus size={22} className="text-indigo-600" /> CRM Sync
                                                </button>
                                                <button className="py-6 bg-white/10 text-white border border-white/20 rounded-[32px] text-[11px] font-black uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-4">
                                                    <Mail size={22} className="text-indigo-400" /> Notify Team
                                                </button>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-10 -right-10 p-10 transform rotate-12 opacity-10 group-hover:scale-125 transition-all duration-700">
                                            <LayoutGrid size={250} />
                                        </div>
                                    </div>

                                    {/* Historical Audit Trail */}
                                    <div className="space-y-8">
                                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] px-4 flex items-center gap-4">
                                            <History size={20} className="text-indigo-500" /> Modification Archive
                                        </h3>
                                        <div className="space-y-4">
                                            {data?.activities?.filter(a => a.responseId === selectedResponse.id).length ? (
                                                data.activities.filter(a => a.responseId === selectedResponse.id).map((act, i) => (
                                                    <div key={act.id} className="p-8 bg-slate-50 rounded-[36px] border border-slate-100 relative overflow-hidden group/audit">
                                                        <div className="flex items-start gap-6 relative z-10">
                                                            <div className="w-12 h-12 rounded-[18px] bg-white border border-slate-100 flex items-center justify-center font-black text-xs text-slate-800 shadow-sm">
                                                                {act.userName[0]}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <p className="text-[13px] font-black text-slate-900">{act.userName}</p>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{safeFormat(act.createdAt, "MMM dd, HH:mm")}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                                                    Updated <span className="text-indigo-600 font-black px-2 py-0.5 bg-indigo-50 rounded-lg">{act.columnName}</span> from
                                                                    <span className="mx-2 text-slate-400 line-through">{act.oldValue || "empty"}</span> to
                                                                    <span className="mx-2 text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-lg">{act.newValue}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-0 right-0 p-8 transform rotate-12 opacity-0 group-hover/audit:opacity-[0.03] transition-opacity">
                                                            <Save size={100} />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-20 p-8 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                                    <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No modifications detected since inception</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Attributes Deep View */}
                                    <div className="space-y-8">
                                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] px-4 flex items-center gap-4">
                                            <Database size={20} className="text-indigo-500" /> Attribute Core
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[...(data?.form?.fields || []), ...(data?.internalColumns || [])].map((col: any) => (
                                                <div key={col.id} className="p-10 bg-white border-2 border-slate-50 rounded-[44px] hover:border-slate-200 transition-all shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{col.label}</p>
                                                        {col.type && <span className="text-[8px] font-black px-2 py-1 bg-slate-50 border rounded-md text-slate-400 uppercase">{col.type}</span>}
                                                    </div>
                                                    <p className="text-xl font-black text-slate-900 leading-tight">
                                                        {getCellValue(selectedResponse.id, col.id, !!col.formId === false) || <span className="text-slate-200 italic">No entry detected</span>}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Advanced Dimension Deployment Modal */}
            <AnimatePresence>
                {isAddColumnOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] p-10 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddColumnOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white rounded-[70px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] w-full max-w-[1100px] h-[85vh] relative z-10 border-8 border-white flex overflow-hidden">

                            {/* Modal Selection Left Panel */}
                            <div className="w-[350px] bg-slate-50 border-r border-slate-100 p-12 overflow-y-auto custom-scrollbar">
                                <h3 className="text-2xl font-black tracking-tighter mb-10 flex items-center gap-4"><Plus className="text-indigo-600" /> Dimension Lab</h3>
                                <div className="space-y-3">
                                    {COLUMN_TYPES.map(type => (
                                        <button key={type.id} onClick={() => setNewColType(type.id)} className={`w-full p-6 rounded-[30px] flex items-center gap-5 transition-all
                                            ${newColType === type.id ? 'bg-white shadow-xl ring-2 ring-indigo-500 scale-105' : 'hover:bg-slate-100 text-slate-400'}`}>
                                            <div className={`p-3 rounded-2xl bg-white shadow-sm ${type.color}`}><type.icon size={20} /></div>
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${newColType === type.id ? 'text-slate-900' : ''}`}>{type.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Configuration Right Panel */}
                            <div className="flex-1 p-16 flex flex-col justify-between overflow-y-auto">
                                <div className="space-y-16">
                                    <div>
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 mb-6 block">Visual Identifier</label>
                                        <input autoFocus value={newColLabel} onChange={(e) => setNewColLabel(e.target.value)} placeholder="e.g. Production Status, Revenue Model..." className="w-full p-10 bg-slate-50 border-4 border-transparent focus:border-indigo-600 rounded-[50px] outline-none font-black text-3xl tracking-tighter text-slate-800 transition-all shadow-inner" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Constraint Systems</h4>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px]">
                                                    <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3"><ShieldCheck size={16} className="text-indigo-500" /> Mandatory Input</span>
                                                    <button onClick={() => setNewColSettings({ ...newColSettings, isRequired: !newColSettings.isRequired })} className={`w-14 h-8 rounded-full transition-all relative ${newColSettings.isRequired ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${newColSettings.isRequired ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px]">
                                                    <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3"><Trash2 size={16} className="text-rose-500" /> Immutable Mode</span>
                                                    <button onClick={() => setNewColSettings({ ...newColSettings, isLocked: !newColSettings.isRequired })} className={`w-14 h-8 rounded-full transition-all relative ${newColSettings.isLocked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${newColSettings.isLocked ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Lifecycle Logic</h4>
                                            {newColType === 'dropdown' ? (
                                                <div className="space-y-4">
                                                    {newColOptions.map((opt, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <input value={opt.label} onChange={(e) => { const n = [...newColOptions]; n[i].label = e.target.value; setNewColOptions(n); }} placeholder="Status Label..." className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-black text-xs shadow-inner" />
                                                            <button onClick={() => setNewColOptions(newColOptions.filter((_, idx) => idx !== i))} className="p-4 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors"><X size={16} /></button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => setNewColOptions([...newColOptions, { label: "New Option", color: "#6366f1" }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all">+ Add Lifecycle Node</button>
                                                </div>
                                            ) : (
                                                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center opacity-40">
                                                    <Settings size={30} className="mb-4 text-slate-400 animate-spin-slow" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Advanced Logic Auto-Generates <br />By Data Type Signature</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-20 flex gap-6">
                                    <button onClick={() => setIsAddColumnOpen(false)} className="px-14 py-8 bg-slate-50 text-slate-500 rounded-[36px] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 active:scale-95 transition-all">Abort Deployment</button>
                                    <button onClick={handleAddColumn} className="flex-1 py-8 bg-slate-900 text-white rounded-[36px] text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-black active:scale-95 transition-all">Deploy Dimension Now</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; border: 3px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

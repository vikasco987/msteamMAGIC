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
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface FormField {
    id: string;
    label: string;
    type: string;
    options: string[];
}

interface InternalColumn {
    id: string;
    label: string;
    type: "text" | "status" | "user";
    options: string[];
}

interface ResponseValue {
    fieldId: string;
    value: string;
}

interface InternalValue {
    columnId: string;
    value: string;
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
    internalValues: { responseId: string; columnId: string; value: string }[];
}

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

    // New Column State
    const [newColLabel, setNewColLabel] = useState("");
    const [newColType, setNewColType] = useState<"text" | "status">("text");
    const [newColOptions, setNewColOptions] = useState<string[]>([]);

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
                // Optimistic update
                setData(prev => {
                    if (!prev) return prev;
                    if (isInternal) {
                        const newIv = [...prev.internalValues];
                        const idx = newIv.findIndex(v => v.responseId === responseId && v.columnId === columnId);
                        if (idx > -1) newIv[idx].value = value;
                        else newIv.push({ responseId, columnId, value });
                        return { ...prev, internalValues: newIv };
                    } else {
                        const newResp = [...prev.responses];
                        const rIdx = newResp.findIndex(r => r.id === responseId);
                        if (rIdx > -1) {
                            const vIdx = newResp[rIdx].values.findIndex(v => v.fieldId === columnId);
                            if (vIdx > -1) newResp[rIdx].values[vIdx].value = value;
                        }
                        return { ...prev, responses: newResp };
                    }
                });
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleConvertToLead = async (res: FormResponse) => {
        const name = res.submittedByName || "Public User";
        const phoneField = data?.form.fields.find(f => f.label.toLowerCase().includes("phone") || f.type === "number");
        const emailField = data?.form.fields.find(f => f.label.toLowerCase().includes("email") || f.label.toLowerCase().includes("mail"));

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
                body: JSON.stringify({ name, phone, email, remark: `Converted from Form: ${data?.form.title}` })
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
                body: JSON.stringify({ label: newColLabel, type: newColType, options: newColOptions })
            });
            if (res.ok) {
                toast.success("Column Added");
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
        if (isInternal) {
            return data?.internalValues.find(v => v.responseId === responseId && v.columnId === colId)?.value || "";
        }
        const resp = data?.responses.find(r => r.id === responseId);
        return resp?.values.find(v => v.fieldId === colId)?.value || "";
    };

    const filteredResponses = useMemo(() => {
        if (!data || !searchTerm) return data?.responses || [];
        return data.responses.filter(r =>
            r.submittedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.values.some(v => v.value.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [data, searchTerm]);

    const getStatusColor = (val: string) => {
        const v = val.toLowerCase();
        if (v.includes("new") || v.includes("open")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (v.includes("contact") || v.includes("work")) return "bg-amber-100 text-amber-700 border-amber-200";
        if (v.includes("done") || v.includes("finish") || v.includes("win")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (v.includes("reject") || v.includes("lost")) return "bg-rose-100 text-rose-700 border-rose-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booting Analytics Engine...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col h-screen overflow-hidden">
            {/* Professional Header System */}
            <header className="h-[100px] bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white transition-all shadow-sm">
                            <ArrowLeft size={20} className="text-slate-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{data?.form.title}</h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <LayoutGrid size={12} className="text-indigo-500" /> Professional Matrix Hub
                            </p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Table size={16} className="text-indigo-500" /> Matrix Rows: {filteredResponses.length}
                        </div>
                        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-[28px] text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Data Integrity: 100%
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Universal Matrix Search..."
                            className="pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[30px] outline-none font-bold text-sm min-w-[350px] transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddColumnOpen(true)}
                        className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-[30px] text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-3"
                    >
                        <Plus size={20} /> Add Column
                    </button>

                    <button className="px-8 py-5 bg-slate-900 text-white rounded-[30px] text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-2xl shadow-slate-200 transition-all flex items-center gap-3">
                        <Download size={20} className="text-indigo-400" /> Export Matrix
                    </button>
                </div>
            </header>

            {/* Main Area: Grid */}
            <main className="flex-1 overflow-auto bg-slate-50 relative">
                <table className="border-separate border-spacing-0 w-full min-w-[max-content]">
                    <thead className="sticky top-0 z-20 shadow-xl">
                        <tr className="bg-white">
                            <th className="px-8 py-6 border-b border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sticky left-0 bg-white z-30 min-w-[120px]">Profile</th>
                            <th className="px-10 py-6 border-b border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-[120px] bg-white z-30 min-w-[240px]">Submitted By</th>

                            {/* Live Fields Columns */}
                            {data?.form.fields.map(f => (
                                <th key={f.id} className="px-10 py-6 border-b border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[220px] bg-white">
                                    <div className="flex items-center gap-3">
                                        <Type size={16} className="text-slate-300" /> {f.label}
                                    </div>
                                </th>
                            ))}

                            {/* Internal Columns */}
                            {data?.internalColumns.map(ic => (
                                <th key={ic.id} className="px-10 py-6 border-b border-r border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/20 min-w-[220px]">
                                    <div className="flex items-center gap-3">
                                        <Database size={16} className="text-indigo-400" /> {ic.label}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResponses.map((res, rIdx) => (
                            <tr key={res.id} className="group hover:bg-indigo-50/10 transition-all">
                                <td className="px-8 py-6 border-b border-r border-slate-100 text-center sticky left-0 bg-white group-hover:bg-indigo-50/30 transition-colors z-10">
                                    <button
                                        onClick={() => setSelectedResponse(res)}
                                        className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                                    >
                                        <Maximize2 size={18} />
                                    </button>
                                </td>
                                <td className="px-10 py-6 border-b border-r border-slate-100 sticky left-[120px] bg-white group-hover:bg-indigo-50/30 transition-colors z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center text-[10px] font-black uppercase ring-2 ring-white shadow-md">
                                            {res.submittedByName ? res.submittedByName[0] : "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none">{res.submittedByName || "Public User"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 flex items-center gap-1.5">
                                                <Clock size={12} className="text-indigo-400" /> {format(new Date(res.submittedAt), "MMM dd, HH:mm")}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Response Field Cells */}
                                {data?.form.fields.map(field => {
                                    const val = getCellValue(res.id, field.id, false);
                                    const isEditing = editingCell?.rowId === res.id && editingCell?.colId === field.id;

                                    return (
                                        <td
                                            key={field.id}
                                            className={`px-10 py-6 border-b border-r border-slate-100 text-sm font-medium text-slate-600 cursor-text group/cell
                                                ${isEditing ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`}
                                            onClick={() => {
                                                setEditingCell({ rowId: res.id, colId: field.id });
                                                setEditValue(val);
                                            }}
                                        >
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 font-bold"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => {
                                                        handleUpdateValue(res.id, field.id, editValue, false);
                                                        setEditingCell(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateValue(res.id, field.id, editValue, false);
                                                            setEditingCell(null);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="block min-h-[1em]">{val || <span className="text-slate-200 font-bold italic">empty</span>}</span>
                                            )}
                                        </td>
                                    );
                                })}

                                {/* Internal Grid Cells */}
                                {data?.internalColumns.map(ic => {
                                    const val = getCellValue(res.id, ic.id, true);
                                    const isEditing = editingCell?.rowId === res.id && editingCell?.colId === ic.id;

                                    return (
                                        <td
                                            key={ic.id}
                                            className={`px-10 py-6 border-b border-r border-slate-100 cursor-pointer group/cell
                                                ${isEditing ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`}
                                            onClick={() => {
                                                setEditingCell({ rowId: res.id, colId: ic.id });
                                                setEditValue(val);
                                            }}
                                        >
                                            {isEditing ? (
                                                ic.type === "status" ? (
                                                    <select
                                                        autoFocus
                                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-black uppercase text-indigo-700"
                                                        value={editValue}
                                                        onChange={(e) => {
                                                            handleUpdateValue(res.id, ic.id, e.target.value, true);
                                                            setEditingCell(null);
                                                        }}
                                                        onBlur={() => setEditingCell(null)}
                                                    >
                                                        <option value="">Choose Status...</option>
                                                        {ic.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        autoFocus
                                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 font-bold text-sm"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => {
                                                            handleUpdateValue(res.id, ic.id, editValue, true);
                                                            setEditingCell(null);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleUpdateValue(res.id, ic.id, editValue, true);
                                                                setEditingCell(null);
                                                            }
                                                        }}
                                                    />
                                                )
                                            ) : (
                                                ic.type === "status" && val ? (
                                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${getStatusColor(val)}`}>
                                                        {val}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-bold text-indigo-600 block min-h-[1em]">{val || <span className="text-indigo-200 italic opacity-40">Add data...</span>}</span>
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

            {/* Response Detail Drawer */}
            <AnimatePresence>
                {selectedResponse && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedResponse(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]" />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-[550px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] z-[70] overflow-y-auto"
                        >
                            <div className="p-12 pb-40">
                                <div className="flex items-center justify-between mb-16">
                                    <div>
                                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-xl mb-4 inline-block">Response Profile</span>
                                        <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Master Record</h2>
                                    </div>
                                    <button onClick={() => setSelectedResponse(null)} className="p-5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-3xl transition-all hover:rotate-90">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-16">
                                    {/* Intelligence & Actions */}
                                    <div className="space-y-8">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                                            <ShieldCheck size={18} className="text-indigo-500" /> Administrative Hub
                                        </h3>
                                        <div className="p-10 bg-slate-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <h4 className="text-xl font-black mb-3">Workflow Systems</h4>
                                                <p className="text-slate-400 text-xs font-bold mb-10 leading-relaxed">Execute core CRM actions for this submission profile. This will sync the data with your main customer repository.</p>

                                                <button
                                                    onClick={() => handleConvertToLead(selectedResponse)}
                                                    className="w-full py-6 bg-white text-slate-900 rounded-[30px] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl"
                                                >
                                                    <UserPlus size={20} className="text-indigo-600" /> Convert to CRM Lead
                                                </button>
                                            </div>
                                            <div className="absolute top-0 right-0 p-10 transform rotate-45 opacity-10 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700">
                                                <Database size={150} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Attributes */}
                                    <div className="space-y-8">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                                            <Type size={18} className="text-indigo-500" /> Submitted Fields
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            {data?.form.fields.map(field => (
                                                <div key={field.id} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 hover:border-indigo-100 transition-all">
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">{field.label}</p>
                                                    <p className="text-slate-800 font-bold leading-relaxed text-lg">{getCellValue(selectedResponse.id, field.id, false) || <span className="text-slate-300 italic">No response</span>}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CRM Metadata */}
                                    <div className="space-y-8">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                                            <Database size={18} className="text-emerald-500" /> Internal Intelligence
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            {data?.internalColumns.map(ic => (
                                                <div key={ic.id} className="p-8 bg-emerald-50/30 rounded-[40px] border border-emerald-100/50">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">{ic.label}</p>
                                                    <p className="text-slate-800 font-bold leading-relaxed text-lg">{getCellValue(selectedResponse.id, ic.id, true) || <span className="text-slate-300 italic italic">N/A</span>}</p>
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

            {/* Add Column Modal */}
            <AnimatePresence>
                {isAddColumnOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddColumnOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[60px] shadow-2xl p-16 max-w-[550px] w-full relative z-10 border-4 border-white"
                        >
                            <div className="flex items-center gap-6 mb-12">
                                <div className="p-5 bg-indigo-600 text-white rounded-[30px] shadow-xl shadow-indigo-200">
                                    <Plus size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Custom Dimension</h3>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Add internal CRM analytics column</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Column Label</label>
                                    <input
                                        value={newColLabel}
                                        onChange={(e) => setNewColLabel(e.target.value)}
                                        placeholder="e.g. Lead Status, Recovery Progress..."
                                        className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[30px] outline-none font-bold text-slate-700 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Data Intelligence Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setNewColType("text")}
                                            className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center gap-4
                                                ${newColType === 'text' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xl' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 shadow-sm'}`}
                                        >
                                            <Type size={24} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Standard Text</span>
                                        </button>
                                        <button
                                            onClick={() => setNewColType("status")}
                                            className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center gap-4
                                                ${newColType === 'status' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xl' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 shadow-sm'}`}
                                        >
                                            <CheckCircle2 size={24} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Status Options</span>
                                        </button>
                                    </div>
                                </div>

                                {newColType === "status" && (
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Status Lifecycle Options</label>
                                        <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                                            {newColOptions.map((opt, i) => (
                                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-3">
                                                    <input
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const n = [...newColOptions];
                                                            n[i] = e.target.value;
                                                            setNewColOptions(n);
                                                        }}
                                                        className="flex-1 p-5 bg-slate-50 border-none rounded-2xl font-bold text-sm shadow-inner"
                                                    />
                                                    <button onClick={() => setNewColOptions(newColOptions.filter((_, idx) => idx !== i))} className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><X size={18} /></button>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setNewColOptions([...newColOptions, "New Option"])}
                                            className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[30px] text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all"
                                        >
                                            <Plus size={16} className="inline mr-2" /> Add Lifecycle Stage
                                        </button>
                                    </div>
                                )}

                                <div className="pt-10 flex gap-5">
                                    <button
                                        onClick={() => setIsAddColumnOpen(false)}
                                        className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-[30px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddColumn}
                                        className="flex-1 py-6 bg-indigo-600 text-white rounded-[30px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                                    >
                                        Deploy Matrix
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

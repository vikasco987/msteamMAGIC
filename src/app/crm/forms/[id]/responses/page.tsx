"use client";

import React, { useEffect, useState, useMemo } from "react";
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
    Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface FormField {
    id: string;
    label: string;
    type: string;
}

interface ResponseValue {
    fieldId: string;
    value: string;
}

interface FormResponse {
    id: string;
    submittedAt: string;
    submittedByName: string;
    values: ResponseValue[];
}

interface FormData {
    title: string;
    fields: FormField[];
}

export default function FormResponsesPage() {
    const router = useRouter();
    const params = useParams();
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formRes, responsesRes] = await Promise.all([
                    fetch(`/api/crm/forms/${params.id}`),
                    fetch(`/api/crm/forms/${params.id}/responses`)
                ]);
                const formJson = await formRes.json();
                const respJson = await responsesRes.json();

                setFormData(formJson.form);
                setResponses(respJson.responses || []);
            } catch (err) {
                toast.error("Failed to load response data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const filteredResponses = useMemo(() => {
        if (!searchTerm) return responses;
        return responses.filter(r =>
            r.submittedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.values.some(v => v.value.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [responses, searchTerm]);

    const getFieldValue = (response: FormResponse, fieldId: string) => {
        const val = response.values.find(v => v.fieldId === fieldId);
        return val ? val.value : "—";
    };

    const downloadCSV = () => {
        if (!formData) return;
        const headers = ["Submitted By", "Submitted At", ...formData.fields.map(f => f.label)].join(",");
        const rows = filteredResponses.map(r => [
            r.submittedByName,
            format(new Date(r.submittedAt), "yyyy-MM-dd HH:mm"),
            ...formData.fields.map(f => `"${getFieldValue(r, f.id).replace(/"/g, '""')}"`)
        ].join(","));

        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${formData.title}_Responses.csv`;
        link.click();
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assembling Data Matrix...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-8">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-6">
                            <button onClick={() => router.back()} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                                <ArrowLeft size={20} className="text-slate-500" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                    <span className="text-indigo-600">{formData?.title}</span> Analysis
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.25em]">Response Intelligence Dashboard</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Universal Search..."
                                    className="pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[30px] shadow-sm focus:border-indigo-600 outline-none w-[350px] transition-all font-bold text-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={downloadCSV}
                                className="px-8 py-5 bg-slate-900 text-white rounded-[30px] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
                            >
                                <FileSpreadsheet size={18} className="text-indigo-400" /> Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                            <Table size={14} className="text-indigo-500" /> Total Rows: {filteredResponses.length}
                        </div>
                    </div>
                </header>

                {/* Main Table Container */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Submitted By</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Date/Time</th>
                                    {formData?.fields.map(field => (
                                        <th key={field.id} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 truncate max-w-[200px]">
                                            {field.label}
                                        </th>
                                    ))}
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredResponses.map((res) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={res.id}
                                        className="group hover:bg-slate-50/30 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-[10px] font-black uppercase">
                                                    {res.submittedByName ? res.submittedByName[0] : "?"}
                                                </div>
                                                <span className="text-sm font-black text-slate-800">{res.submittedByName || "Public User"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900">{format(new Date(res.submittedAt), "dd MMM yyyy")}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(res.submittedAt), "HH:mm a")}</span>
                                            </div>
                                        </td>
                                        {formData?.fields.map(field => (
                                            <td key={field.id} className="px-8 py-6">
                                                <div className="text-sm font-medium text-slate-600 line-clamp-1 max-w-[200px]">
                                                    {getFieldValue(res, field.id)}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => setSelectedResponse(res)}
                                                className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredResponses.length === 0 && (
                    <div className="text-center py-40">
                        <div className="w-24 h-24 bg-white shadow-xl rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-slate-50">
                            <Smartphone size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">No Responses Yet</h3>
                        <p className="text-slate-400 font-bold max-w-sm mx-auto mt-2">Data will appear here as soon as users start submitting the form.</p>
                    </div>
                )}
            </div>

            {/* Sidebar Details View */}
            <AnimatePresence>
                {selectedResponse && formData && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedResponse(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]" />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] overflow-y-auto"
                        >
                            <div className="p-10 pb-32">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">Full Entry Profile</span>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">Response Details</h2>
                                    </div>
                                    <button onClick={() => setSelectedResponse(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl font-black text-indigo-600">
                                            {selectedResponse.submittedByName ? selectedResponse.submittedByName[0] : "?"}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900">{selectedResponse.submittedByName || "Public User"}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                                <Calendar size={12} className="text-indigo-400" /> {format(new Date(selectedResponse.submittedAt), "MMMM dd, yyyy • HH:mm a")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-8 flex items-center gap-2">
                                            <Database size={14} className="text-indigo-500" /> Data Attributes
                                        </h3>
                                        {formData.fields.map(field => (
                                            <div key={field.id} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:border-indigo-100 transition-colors">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 underline decoration-indigo-200 underline-offset-4">{field.label}</p>
                                                <p className="text-slate-800 font-bold leading-relaxed whitespace-pre-wrap">{getFieldValue(selectedResponse, field.id)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

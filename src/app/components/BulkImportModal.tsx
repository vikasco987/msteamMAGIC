"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

interface BulkImportModalProps {
    formId: string;
    onClose: () => void;
    onSuccess: () => void;
    availableColumns: { id: string; label: string; isInternal: boolean }[];
}

export default function BulkImportModal({ formId, onClose, onSuccess, availableColumns }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [matchColumnId, setMatchColumnId] = useState<string>("");
    const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map & Preview, 3: Processing
    const [loading, setLoading] = useState(false);

    // Status tracking per row for preview
    const [previewLimit] = useState(10);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];

            if (data.length > 0) {
                const excelHeaders = Object.keys(data[0]);
                setHeaders(excelHeaders);
                setParsedData(data);

                // Auto-map logic
                const autoMap: Record<string, string> = {};
                excelHeaders.forEach(h => {
                    const exactMatch = availableColumns.find(c => c.label.toLowerCase() === h.toLowerCase());
                    if (exactMatch) autoMap[h] = exactMatch.id;
                });
                setHeaderMapping(autoMap);

                // Auto-select match column (e.g., Phone or Email)
                const phoneMatch = availableColumns.find(c => c.label.toLowerCase().includes("phone"));
                if (phoneMatch) setMatchColumnId(phoneMatch.id);

                setStep(2);
            } else {
                toast.error("Excel file is empty");
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleMapChange = (excelHeader: string, dbColId: string) => {
        setHeaderMapping(prev => ({
            ...prev,
            [excelHeader]: dbColId
        }));
    };

    const handleConfirm = async () => {
        if (!matchColumnId) {
            return toast.error("Please select a Key Column to match records (e.g., Phone Number)");
        }

        // Find if match column is internal
        const matchColDef = availableColumns.find(c => c.id === matchColumnId);
        const isInternalMatch = matchColDef?.isInternal ?? false;

        const matchExcelHeader = Object.keys(headerMapping).find(h => headerMapping[h] === matchColumnId);
        if (!matchExcelHeader) {
            return toast.error("You must map an Excel column to your selected Key Column!");
        }

        // Flatten mappings for API
        const updateColumnMap: Record<string, { id: string; isInternal: boolean }> = {};
        Object.entries(headerMapping).forEach(([excelH, dbColId]) => {
            if (!dbColId || dbColId === "SKIP") return;
            const colDef = availableColumns.find(c => c.id === dbColId);
            if (colDef) {
                updateColumnMap[excelH] = { id: dbColId, isInternal: colDef.isInternal };
            }
        });

        if (Object.keys(updateColumnMap).length === 0) {
            return toast.error("Please map at least one column to update");
        }

        setStep(3);
        setLoading(true);

        try {
            const res = await fetch(`/api/crm/forms/${formId}/responses/bulk-import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: parsedData,
                    matchColumnId,
                    matchExcelHeader,
                    updateColumnMap,
                    isInternalMatch
                })
            });

            const result = await res.json();
            if (res.ok && result.success) {
                toast.success(`Updated ${result.successCount} records!`);
                if (result.errorCount > 0) {
                    console.log("Import Errors:", result.errors);
                    toast.error(`${result.errorCount} records failed (see console)`);
                }
                onSuccess();
                onClose();
            } else {
                toast.error(result.error || "Failed to bulk update");
                setStep(2);
            }
        } catch (error) {
            toast.error("Network error during update");
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 shrink-0 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <UploadCloud size={20} /> Smart Bulk Update
                        </h3>
                        <p className="text-blue-100 text-[11px] mt-1 font-bold uppercase tracking-widest">
                            Upload Excel • Match Columns • Safe Update
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5 border-4 border-blue-100">
                                <UploadCloud size={32} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 mb-2">Upload Excel File (.xlsx, .csv)</h4>
                            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                                Upload a file containing the records you want to update. Ensure you have a unique column like Phone or Email to match existing records.
                            </p>

                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                                <UploadCloud size={18} />
                                Choose File
                                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
                            </label>

                            <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 max-w-md">
                                <span className="font-bold flex items-center gap-1 mb-1"><AlertCircle size={14} /> Important:</span>
                                Only existing records will be updated. Records that do not match the selected Key Column will be skipped.
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                                <h4 className="text-sm font-black text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                                    Select Key Column (To Match Records)
                                </h4>
                                <div className="flex items-center gap-4">
                                    <p className="text-xs text-slate-500 flex-1">
                                        Which column in the database should we use to match the rows from your Excel file? (Usually Phone or Email)
                                    </p>
                                    <select
                                        value={matchColumnId}
                                        onChange={(e) => setMatchColumnId(e.target.value)}
                                        className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select Unique Field --</option>
                                        {availableColumns.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                                <h4 className="text-sm font-black text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                                    Map Excel Columns to Database Columns
                                </h4>

                                <div className="space-y-3">
                                    {headers.map(h => (
                                        <div key={h} className="flex items-center gap-4 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-1/3 text-xs font-bold text-slate-700 truncate px-2">
                                                {h} <span className="text-[10px] text-slate-400 font-normal ml-1">(Excel)</span>
                                            </div>
                                            <div className="text-slate-400">→</div>
                                            <select
                                                value={headerMapping[h] || "SKIP"}
                                                onChange={(e) => handleMapChange(h, e.target.value)}
                                                className={`flex-1 p-2 bg-white border rounded-lg text-xs font-bold outline-none ${headerMapping[h] && headerMapping[h] !== "SKIP"
                                                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                                        : 'border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                <option value="SKIP">-- Do Not Update (Skip) --</option>
                                                {availableColumns.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.label} {c.id === matchColumnId ? "(Used for Key)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm overflow-hidden">
                                <h4 className="text-sm font-black text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">3</span>
                                    Preview ({Math.min(parsedData.length, previewLimit)} of {parsedData.length} rows)
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-max text-left border-collapse">
                                        <thead>
                                            <tr>
                                                {headers.map(h => (
                                                    <th key={h} className="p-2 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                        {h}
                                                        <div className="text-[9px] text-blue-500 mt-0.5">
                                                            {headerMapping[h] && headerMapping[h] !== "SKIP"
                                                                ? availableColumns.find(c => c.id === headerMapping[h])?.label
                                                                : "Skipped"}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, previewLimit).map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    {headers.map(h => (
                                                        <td key={h} className={`p-2 border-b border-slate-100 text-xs ${headerMapping[h] && headerMapping[h] !== "SKIP" ? 'font-bold text-slate-700' : 'text-slate-400'
                                                            }`}>
                                                            {row[h]?.toString().substring(0, 30) || "—"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                            <h4 className="text-lg font-black text-slate-800">Updating Database...</h4>
                            <p className="text-sm text-slate-500 mt-2">Processing {parsedData.length} rows. Please do not close this window.</p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {step === 2 && (
                    <div className="p-4 border-t border-slate-100 bg-white flex justify-between shrink-0">
                        <button
                            onClick={() => { setStep(1); setFile(null); setParsedData([]); }}
                            className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                        >
                            Cancel & Restart
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || !matchColumnId || Object.values(headerMapping).filter(v => v && v !== "SKIP").length === 0}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} /> Confirm & Update ({parsedData.length} records)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


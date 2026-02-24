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
    Settings,
    Check,
    GripVertical
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
    formId?: string;
    visibleToRoles?: string[];
    visibleToUsers?: string[];
}

interface ResponseValue {
    fieldId: string;
    value: string;
}

interface FormActivity {
    id: string;
    responseId: string;
    userName: string;
    type: string;
    columnName: string;
    oldValue: string;
    newValue: string;
    createdAt: string;
}

interface SavedView {
    id: string;
    name: string;
    conditions: { colId: string, op: string, val: string, val2?: string }[];
    conjunction: "AND" | "OR";
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

const AVAILABLE_ROLES = ["ADMIN", "MASTER", "MANAGER", "SELLER", "INTERN"];

const FILTER_OPERATORS = {
    text: [
        { label: "Equals", value: "equals" },
        { label: "Contains", value: "contains" },
        { label: "Starts With", value: "starts_with" },
        { label: "Ends With", value: "ends_with" },
        { label: "Complement (Not)", value: "not_equals" },
        { label: "Is Empty", value: "is_empty" },
        { label: "Is Not Empty", value: "is_not_empty" }
    ],
    number: [
        { label: "Equals", value: "eq" },
        { label: "Greater Than", value: "gt" },
        { label: "Less Than", value: "lt" },
        { label: "Greater or Equal", value: "gte" },
        { label: "Less or Equal", value: "lte" },
        { label: "Between", value: "between" },
        { label: "Is Empty", value: "is_empty" }
    ],
    date: [
        { label: "Is Today", value: "today" },
        { label: "Is Yesterday", value: "yesterday" },
        { label: "Before", value: "before" },
        { label: "After", value: "after" },
        { label: "Is Tomorrow", value: "tomorrow" },
        { label: "This Week", value: "this_week" },
        { label: "Between", value: "between" },
        { label: "Is Empty", value: "is_empty" }
    ],
    dropdown: [
        { label: "Is", value: "equals" },
        { label: "Is Not", value: "not_equals" },
        { label: "Is Empty", value: "is_empty" }
    ],
    checkbox: [
        { label: "Is Checked", value: "is_true" },
        { label: "Is Unchecked", value: "is_false" }
    ]
};

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

    // Phase 2 — SaaS Level States
    const [currentView, setCurrentView] = useState<"table" | "kanban">("table");
    const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
    const [conditions, setConditions] = useState<SavedView['conditions']>([]);
    const [filterConjunction, setFilterConjunction] = useState<SavedView['conjunction']>("AND");
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [autoApply, setAutoApply] = useState(true);
    const [activeViewId, setActiveViewId] = useState<string | null>(null);

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [groupByColId, setGroupByColId] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [userRole, setUserRole] = useState<string>("GUEST");
    const [isMaster, setIsMaster] = useState(false);

    // New Column Advanced State
    const [newColLabel, setNewColLabel] = useState("");
    const [newColType, setNewColType] = useState("text");
    const [newColOptions, setNewColOptions] = useState<{ label: string, color: string }[]>([]);
    const [newColSettings, setNewColSettings] = useState({ isRequired: false, isLocked: false, showInPublic: false });
    const [newColPermissions, setNewColPermissions] = useState<{ roles: string[], users: string[] }>({ roles: [], users: [] });

    // Visibility & User Search
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [userResults, setUserResults] = useState<{ clerkId: string, email: string }[]>([]);

    // Phase 3 — Excel Level Features
    const [selection, setSelection] = useState<{
        start: { row: number, col: number } | null,
        end: { row: number, col: number } | null
    }>({ start: null, end: null });
    const [isSelecting, setIsSelecting] = useState(false);

    const fetchData = async () => {
        try {
            const [dataRes, viewsRes] = await Promise.all([
                fetch(`/api/crm/forms/${params.id}/responses`),
                fetch(`/api/crm/forms/${params.id}/views`)
            ]);

            const json = await dataRes.json();
            setData(json);
            setUserRole(json.userRole);
            setIsMaster(json.isMaster);

            if (viewsRes.ok) {
                const viewsJson = await viewsRes.json();
                setSavedViews(viewsJson);
            }

            // Phase 2: Auto-detect Kanban Group Field (Dropdown)
            if (!groupByColId) {
                const firstDropdown = json.internalColumns?.find((c: any) => c.type === "dropdown");
                if (firstDropdown) setGroupByColId(firstDropdown.id);
            }
        } catch (err) {
            toast.error("Failed to sync matrix");
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async (q: string) => {
        setUserSearchQuery(q);
        if (q.length < 2) { setUserResults([]); return; }
        try {
            const res = await fetch(`/api/crm/users?q=${q}`);
            const json = await res.json();
            setUserResults(json);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, [params.id]);

    const getColumns = useMemo(() => {
        if (!data) return [];
        const cols: any[] = [
            { id: "__profile", label: "Profile", isPublic: false, type: "static" },
            { id: "__contributor", label: "Contributor", isPublic: false, type: "static" }
        ];
        (data.form?.fields || []).forEach(f => cols.push({ ...f, isInternal: false }));
        (data.internalColumns || []).forEach(ic => cols.push({ ...ic, isInternal: true }));
        return cols;
    }, [data]);

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
        let results = data.responses || [];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(r =>
                (r.submittedByName || "").toLowerCase().includes(term) ||
                r.values.some(v => (v.value || "").toLowerCase().includes(term))
            );
        }

        if (conditions.length > 0) {
            results = results.filter(r => {
                const matches = conditions.map(cond => {
                    const col = getColumns.find(c => c.id === cond.colId);
                    const isInternal = col?.isInternal;
                    const cellVal = getCellValue(r.id, cond.colId, isInternal);
                    const val = (cellVal || "").toLowerCase();
                    const targetVal = cond.val.toLowerCase();
                    const targetVal2 = cond.val2?.toLowerCase() || "";

                    switch (cond.op) {
                        case "equals": return val === targetVal;
                        case "not_equals": return val !== targetVal;
                        case "contains": return val.includes(targetVal);
                        case "starts_with": return val.startsWith(targetVal);
                        case "ends_with": return val.endsWith(targetVal);
                        case "is_empty": return val.trim().length === 0;
                        case "is_not_empty": return val.trim().length > 0;

                        case "eq": return parseFloat(val) === parseFloat(targetVal);
                        case "gt": return parseFloat(val) > parseFloat(targetVal);
                        case "lt": return parseFloat(val) < parseFloat(targetVal);
                        case "gte": return parseFloat(val) >= parseFloat(targetVal);
                        case "lte": return parseFloat(val) <= parseFloat(targetVal);
                        case "between": return parseFloat(val) >= parseFloat(targetVal) && parseFloat(val) <= parseFloat(targetVal2);

                        case "is_true": return val === "true";
                        case "is_false": return val === "false" || val === "";

                        case "today": {
                            const d = new Date(cellVal);
                            const now = new Date();
                            return d.toDateString() === now.toDateString();
                        }
                        case "this_week": {
                            const d = new Date(cellVal);
                            const now = new Date();
                            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                            return d >= startOfWeek;
                        }
                        case "before": return new Date(cellVal) < new Date(cond.val);
                        case "after": return new Date(cellVal) > new Date(cond.val);

                        default: return true;
                    }
                });

                if (filterConjunction === "AND") return matches.every(m => m);
                return matches.some(m => m);
            });
        }
        return results;
    }, [data, searchTerm, conditions, getCellValue, filterConjunction, getColumns]);

    const groupedResponses = useMemo(() => {
        if (!groupByColId || !data) return {};
        const groups: Record<string, FormResponse[]> = {};
        const groupCol = data.internalColumns?.find(c => c.id === groupByColId);
        const options = groupCol?.options;

        if (Array.isArray(options)) {
            options.forEach((opt: any) => {
                if (opt && opt.label) groups[opt.label] = [];
            });
        }
        groups["Unassigned"] = [];

        filteredResponses.forEach(res => {
            const val = getCellValue(res.id, groupByColId, true);
            if (groups[val]) groups[val].push(res);
            else groups["Unassigned"].push(res);
        });
        return groups;
    }, [filteredResponses, groupByColId, data, getCellValue]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                handleCopy();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // Browser handles paste event, listener below will catch it
            }
        };

        const handlePasteEvent = (e: ClipboardEvent) => {
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

            const text = e.clipboardData?.getData("text");
            if (text) handlePaste(text);
        };

        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("paste", handlePasteEvent);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
            window.removeEventListener("paste", handlePasteEvent);
        };
    }, [selection, filteredResponses, getColumns]);

    const handleCopy = () => {
        if (!selection.start || !selection.end) return;

        const startR = Math.min(selection.start.row, selection.end.row);
        const endR = Math.max(selection.start.row, selection.end.row);
        const startC = Math.min(selection.start.col, selection.end.col);
        const endC = Math.max(selection.start.col, selection.end.col);

        const rows: string[] = [];
        for (let r = startR; r <= endR; r++) {
            const rowValues: string[] = [];
            for (let c = startC; c <= endC; c++) {
                const col = getColumns[c];
                const res = filteredResponses[r];
                if (!col || !res) continue;

                if (col.type === "static") {
                    rowValues.push(col.id === "__profile" ? (res.submittedByName || "") : (res.submittedAt || ""));
                } else {
                    rowValues.push(getCellValue(res.id, col.id, col.isInternal));
                }
            }
            rows.push(rowValues.join("\t"));
        }

        navigator.clipboard.writeText(rows.join("\n"));
        toast.success("Copied to clipboard");
    };

    const handlePaste = async (text: string) => {
        if (!selection.start) return;

        const rows = text.split("\n").filter(r => r.trim()).map(r => r.split("\t"));
        const updates: any[] = [];
        const warnings: string[] = [];
        const startR = selection.start.row;
        const startC = selection.start.col;

        rows.forEach((row, rIdx) => {
            row.forEach((val, cIdx) => {
                const targetR = startR + rIdx;
                const targetC = startC + cIdx;

                if (targetR < filteredResponses.length && targetC < getColumns.length) {
                    const col = getColumns[targetC];
                    const res = filteredResponses[targetR];
                    if (col && res && col.type !== "static") {
                        const trimmedVal = val.trim();

                        // Basic Validation
                        let isValid = true;
                        if (col.type === "phone" && trimmedVal && !/^\d{10,12}$/.test(trimmedVal.replace(/\D/g, ''))) isValid = false;
                        if (col.type === "email" && trimmedVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedVal)) isValid = false;
                        if ((col.type === "number" || col.type === "currency") && trimmedVal && isNaN(Number(trimmedVal))) isValid = false;

                        if (!isValid) {
                            warnings.push(`Invalid ${col.type} at Row ${targetR + 1}, Col ${col.label}`);
                        }

                        updates.push({
                            responseId: res.id,
                            columnId: col.id,
                            value: trimmedVal,
                            isInternal: col.isInternal
                        });
                    }
                }
            });
        });

        if (updates.length === 0) return;

        if (warnings.length > 0) {
            if (!confirm(`${warnings.length} potential data issues found:\n${warnings.slice(0, 5).join('\n')}${warnings.length > 5 ? '\n...' : ''}\n\nProceed anyway?`)) {
                return;
            }
        }

        const loadingToast = toast.loading(`Pasting ${updates.length} values...`);
        try {
            const res = await fetch(`/api/crm/forms/${params.id}/responses`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            });

            if (res.ok) {
                toast.success("Pasted successfully", { id: loadingToast });
                fetchData();
            } else {
                toast.error("Paste failed", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Network error during paste", { id: loadingToast });
        }
    };

    const handleUpdateValue = async (responseId: string, columnId: string, value: string, isInternal: boolean) => {
        try {
            const res = await fetch(`/api/crm/forms/${params.id}/responses`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ responseId, columnId, value, isInternal })
            });
            if (res.ok) {
                fetchData();
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

    const handleFileChange = async (resId: string, colId: string, file: File) => {
        const loadingToast = toast.loading(`Uploading ${file.name}...`);
        try {
            // Mocking upload for now to show UI capability, in real SaaS we use S3/Cloudinary
            const mockUrl = `https://files.msteam.hub/${file.name.replace(/ /g, '_')}`;
            setTimeout(async () => {
                await handleUpdateValue(resId, colId, mockUrl, true);
                toast.success("File Linked Successfully", { id: loadingToast });
            }, 1000);
        } catch (err) {
            toast.error("Upload failed", { id: loadingToast });
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
                    showInPublic: newColSettings.showInPublic,
                    visibleToRoles: newColPermissions.roles,
                    visibleToUsers: newColPermissions.users
                })
            });
            if (res.ok) {
                toast.success("Dimension Deployed");
                setIsAddColumnOpen(false);
                setNewColLabel("");
                setNewColOptions([]);
                setNewColPermissions({ roles: [], users: [] });
                fetchData();
            }
        } catch (err) {
            toast.error("Failed to add column");
        }
    };

    const handleSaveView = async () => {
        const name = prompt("Enter view name:");
        if (!name) return;

        try {
            const res = await fetch(`/api/crm/forms/${params.id}/views`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, conditions, conjunction: filterConjunction })
            });

            if (res.ok) {
                const newView = await res.json();
                setSavedViews([newView, ...savedViews]);
                toast.success("View Archived Correctly");
            }
        } catch (err) {
            toast.error("Failed to save view");
        }
    };

    const handleDeleteView = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Destroy this architecture?")) return;

        try {
            const res = await fetch(`/api/crm/forms/${params.id}/views?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setSavedViews(savedViews.filter(v => v.id !== id));
                if (activeViewId === id) {
                    setActiveViewId(null);
                    setConditions([]);
                }
                toast.success("View Purged");
            }
        } catch (err) { toast.error("Purge failed"); }
    };

    const handleDuplicateView = async (view: any) => {
        const name = prompt("Enter name for duplicate:", `${view.name} (Copy)`);
        if (!name) return;

        try {
            const res = await fetch(`/api/crm/forms/${params.id}/views`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, conditions: view.conditions, conjunction: view.conjunction })
            });
            if (res.ok) {
                const newView = await res.json();
                setSavedViews([newView, ...savedViews]);
                toast.success("Architecture Duplicated");
            }
        } catch (err) { toast.error("Duplication failed"); }
    };

    const handleBulkVisibilityUpdate = async (type: "COLUMN" | "ROW", roles: string[]) => {
        const ids = type === "ROW" ? selectedRows : []; // Add column selection later if needed
        if (ids.length === 0) return;

        try {
            const res = await fetch(`/api/crm/forms/${params.id}/bulk/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids, type, visibleToRoles: roles, visibleToUsers: [] })
            });
            if (res.ok) {
                toast.success(`Access updated for ${ids.length} items`);
                setSelectedRows([]);
                fetchData();
            }
        } catch (err) {
            toast.error("Bulk update failed");
        }
    };

    const toggleRowSelection = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    };

    const applySavedView = (view: any) => {
        setConditions(view.conditions);
        setFilterConjunction(view.conjunction as any);
        setActiveViewId(view.id);
        toast.success(`Matrix calibrated: ${view.name}`);
    };

    const handleClearFilters = () => {
        setConditions([]);
        setActiveViewId(null);
        toast.success("Filters Neutralized");
    };

    const toggleAllRows = () => {
        if (selectedRows.length === filteredResponses.length) setSelectedRows([]);
        else setSelectedRows(filteredResponses.map(r => r.id));
    };


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
                <div className="flex items-center gap-10">
                    <button onClick={() => router.back()} className="p-4 bg-slate-50 border border-slate-100 rounded-[28px] hover:bg-white transition-all shadow-sm active:scale-90 flex items-center gap-2 group">
                        <ArrowLeft size={22} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h1 className="text-3xl font-black tracking-tighter leading-none">{data?.form?.title || "Project Ledger"}</h1>
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                <Activity size={12} className="text-indigo-500" />
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">v2.4 Active Matrix</span>
                            </div>
                        </div>

                        {/* Tab-style Saved Views */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClearFilters}
                                className={`px-5 py-2.5 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${!activeViewId && conditions.length === 0 ? 'bg-white text-indigo-600 border-indigo-600 shadow-[0_-4px_10px_-4px_rgba(79,70,229,0.15)]' : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-50'}`}
                            >
                                Default Canvas
                            </button>
                            {savedViews.map(view => {
                                const isActive = activeViewId === view.id;
                                return (
                                    <button
                                        key={view.id}
                                        onClick={() => applySavedView(view)}
                                        className={`px-5 py-2.5 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all border-b-2 group relative flex items-center gap-2 ${isActive ? 'bg-white text-indigo-600 border-indigo-600 shadow-[0_-4px_10px_-4px_rgba(79,70,229,0.15)]' : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-50'}`}
                                    >
                                        <Layers size={12} className={isActive ? 'text-indigo-600' : 'text-slate-300'} />
                                        {view.name}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setIsFilterBuilderOpen(true)}
                                className="px-5 py-2.5 rounded-t-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-500 transition-all border-b-2 border-transparent hover:bg-indigo-50"
                            >
                                + New Segment
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Quick Column Filters (Dropdown based) */}
                    <div className="flex items-center gap-2 pr-6 border-r border-slate-100 mr-2">
                        {getColumns.filter(c => c.type === "dropdown" || c.type === "date").slice(0, 2).map(col => (
                            <div key={col.id} className="relative group/qf">
                                <select
                                    className="px-6 py-4 bg-slate-50 hover:bg-white border border-slate-100 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-slate-500 focus:text-indigo-600 focus:ring-2 ring-indigo-100 outline-none appearance-none transition-all cursor-pointer min-w-[140px]"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setConditions([...conditions.filter(c => c.colId !== col.id), { colId: col.id, op: "equals", val: e.target.value }]);
                                        } else {
                                            setConditions(conditions.filter(c => c.colId !== col.id));
                                        }
                                    }}
                                    value={conditions.find(c => c.colId === col.id)?.val || ""}
                                >
                                    <option value="">All {col.label}</option>
                                    {col.type === "dropdown" && Array.isArray(col.options) && col.options.map((opt: any) => (
                                        <option key={opt.label} value={opt.label}>{opt.label}</option>
                                    ))}
                                    {col.type === "date" && (
                                        <>
                                            <option value="today">Today</option>
                                            <option value="this_week">This Week</option>
                                        </>
                                    )}
                                </select>
                                <ChevronDown size={10} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover/qf:text-indigo-400" />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center border border-slate-200 p-1.5 rounded-[30px] shadow-sm bg-slate-50/50">
                        <button onClick={() => setCurrentView("table")} className={`flex items-center gap-3 px-8 py-3.5 rounded-[22px] transition-all ${currentView === 'table' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white active:scale-95'}`}>
                            <Table size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Grid View</span>
                        </button>
                        <button onClick={() => setCurrentView("kanban")} className={`flex items-center gap-3 px-8 py-3.5 rounded-[22px] transition-all ${currentView === 'kanban' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white active:scale-95'}`}>
                            <LayoutGrid size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Kanban</span>
                        </button>
                    </div>

                    <div className="h-10 w-px bg-slate-200" />

                    <div className="flex items-center gap-2 bg-white p-2 rounded-[40px] border border-slate-200 shadow-sm">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search records..."
                                className="pl-14 pr-4 py-4 bg-transparent outline-none font-bold text-sm min-w-[280px] transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterBuilderOpen(true)}
                            className={`p-4 rounded-[32px] transition-all flex items-center gap-3 ${conditions.length > 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Filter size={18} />
                            {conditions.length > 0 && <span className="text-[10px] font-black uppercase">{conditions.length}</span>}
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddColumnOpen(true)}
                        className="p-5.5 bg-white border border-slate-100 shadow-sm text-slate-400 rounded-full hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-90"
                    >
                        <Plus size={22} />
                    </button>
                </div>
            </header>

            {/* Matrix Console */}
            <main className="flex-1 overflow-hidden bg-slate-50 relative">
                <AnimatePresence mode="wait">
                    {currentView === "table" ? (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full overflow-auto custom-scrollbar"
                        >
                            <table className="border-separate border-spacing-0 w-full min-w-[max-content]">
                                <thead className="sticky top-0 z-20">
                                    <tr className="bg-white/80 backdrop-blur-xl">
                                        {isMaster && (
                                            <th className="px-10 py-8 border-b border-r border-slate-100 sticky left-0 bg-white z-[35] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
                                                <div onClick={toggleAllRows} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedRows.length === (filteredResponses?.length || 0) && selectedRows.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                                                    {selectedRows.length === (filteredResponses?.length || 0) && selectedRows.length > 0 && <Check size={14} className="text-white" />}
                                                </div>
                                            </th>
                                        )}
                                        <th className={`px-12 py-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center sticky ${isMaster ? 'left-[65px]' : 'left-0'} bg-white z-30 min-w-[140px] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]`}>Profile</th>
                                        <th className={`px-14 py-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] sticky ${isMaster ? 'left-[205px]' : 'left-[140px]'} bg-white z-30 min-w-[300px] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]`}>Primary Contributor</th>
                                        {data?.form?.fields?.map(f => (
                                            <th key={f.id} className="px-14 py-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] min-w-[280px] bg-white">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Type size={16} /></div> {f.label}
                                                </div>
                                            </th>
                                        ))}
                                        {data?.internalColumns?.map(ic => {
                                            const TypeIcon = COLUMN_TYPES.find(t => t.id === ic.type)?.icon || Database;
                                            return (
                                                <th key={ic.id} className="px-14 py-8 border-b border-r border-slate-200 text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] bg-indigo-50/10 min-w-[280px]">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50"><TypeIcon size={18} /></div> {ic.label}
                                                        </div>
                                                        {((ic.visibleToRoles && ic.visibleToRoles.length > 0) || (ic.visibleToUsers && ic.visibleToUsers.length > 0)) && (
                                                            <ShieldCheck size={14} className="text-indigo-400" />
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResponses.map((res, rIdx) => (
                                        <tr key={res.id} className="group hover:bg-indigo-50/5 transition-all relative">
                                            {isMaster && (
                                                <td className="px-10 py-8 border-b border-r border-slate-100 text-center sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
                                                    <div onClick={() => toggleRowSelection(res.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all mx-auto ${selectedRows.includes(res.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                                                        {selectedRows.includes(res.id) && <Check size={14} className="text-white" />}
                                                    </div>
                                                </td>
                                            )}
                                            {getColumns.map((col, cIdx) => {
                                                const val = col.type === "static"
                                                    ? (col.id === "__profile" ? "" : "") // Handle profile/contributor specially below
                                                    : getCellValue(res.id, col.id, col.isInternal);

                                                const isInSelection = selection.start && selection.end &&
                                                    rIdx >= Math.min(selection.start.row, selection.end.row) &&
                                                    rIdx <= Math.max(selection.start.row, selection.end.row) &&
                                                    cIdx >= Math.min(selection.start.col, selection.end.col) &&
                                                    cIdx <= Math.max(selection.start.col, selection.end.col);

                                                const isStart = selection.start?.row === rIdx && selection.start?.col === cIdx;

                                                const commonProps = {
                                                    onMouseDown: () => {
                                                        setSelection({ start: { row: rIdx, col: cIdx }, end: { row: rIdx, col: cIdx } });
                                                        setIsSelecting(true);
                                                    },
                                                    onMouseEnter: () => {
                                                        if (isSelecting) {
                                                            setSelection(prev => ({ ...prev, end: { row: rIdx, col: cIdx } }));
                                                        }
                                                    },
                                                    onMouseUp: () => setIsSelecting(false),
                                                    className: `border-b border-r border-slate-100 transition-all relative select-none ${isInSelection ? 'bg-indigo-50/40 ring-2 ring-inset ring-indigo-300' : ''} ${isStart ? 'ring-indigo-600' : ''}`
                                                };

                                                if (col.id === "__profile") {
                                                    return (
                                                        <td key={col.id} {...commonProps} className={`${commonProps.className} px-12 py-8 text-center sticky ${isMaster ? 'left-[65px]' : 'left-0'} bg-white group-hover:bg-slate-50 z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]`}>
                                                            <button onClick={() => setSelectedResponse(res)} className="p-4 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-[22px] transition-all bg-white shadow-sm border border-slate-100 hover:border-indigo-100">
                                                                <Maximize2 size={20} />
                                                            </button>
                                                        </td>
                                                    );
                                                }

                                                if (col.id === "__contributor") {
                                                    return (
                                                        <td key={col.id} {...commonProps} className={`${commonProps.className} px-14 py-8 sticky ${isMaster ? 'left-[205px]' : 'left-[140px]'} bg-white group-hover:bg-slate-50 z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]`}>
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
                                                    );
                                                }

                                                const isInternal = col.isInternal;
                                                const isEditing = editingCell?.rowId === res.id && editingCell?.colId === col.id;
                                                const isLocked = !!col.isLocked;

                                                return (
                                                    <td key={col.id}
                                                        {...commonProps}
                                                        onClick={() => { if (!isLocked) { setEditingCell({ rowId: res.id, colId: col.id }); setEditValue(val); } }}
                                                        className={`${commonProps.className} px-14 py-8 ${isEditing ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-500 z-10' : ''} ${isLocked ? 'bg-slate-50/50 cursor-not-allowed' : 'cursor-text'}`}
                                                    >
                                                        {/* Render Content Based on Column Type */}
                                                        {isEditing ? (
                                                            col.type === "dropdown" ? (
                                                                <select autoFocus className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] font-black uppercase text-indigo-700 outline-none" value={editValue} onChange={(e) => { handleUpdateValue(res.id, col.id, e.target.value, true); setEditingCell(null); }}>
                                                                    <option value="">Select...</option>
                                                                    {Array.isArray(col.options) && col.options.map((opt: any) => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
                                                                </select>
                                                            ) : (
                                                                <input autoFocus className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-black text-[13px]" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => { handleUpdateValue(res.id, col.id, editValue, isInternal); setEditingCell(null); }} />
                                                            )
                                                        ) : (
                                                            <div className="flex items-center justify-between w-full">
                                                                {col.type === "dropdown" && val ? (
                                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${val.toLowerCase().includes('done') || val.toLowerCase().includes('won') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-600 border-slate-200'}`}>{val}</span>
                                                                ) : col.type === "currency" ? (
                                                                    <span className="text-[13px] font-black text-indigo-900 flex items-center gap-1">
                                                                        <IndianRupee size={12} className="text-slate-400" /> {val || "0.00"}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[13px] font-bold text-indigo-900 truncate max-w-[180px]">{val || "—"}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="kanban"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full overflow-x-auto overflow-y-hidden p-12 flex gap-10 custom-scrollbar bg-slate-100/50"
                        >
                            {Object.entries(groupedResponses).map(([groupName, items]) => (
                                <div key={groupName} className="w-[380px] shrink-0 flex flex-col gap-6">
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{groupName}</h3>
                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-black rounded-md">{items.length}</span>
                                        </div>
                                        <button className="p-2 text-slate-300 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pb-10">
                                        {items.map(item => (
                                            <motion.div
                                                key={item.id}
                                                layoutId={item.id}
                                                onClick={() => setSelectedResponse(item)}
                                                className="p-8 bg-white border-2 border-slate-100 rounded-[40px] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-10 h-10 rounded-[16px] bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase">
                                                        {item.submittedByName ? item.submittedByName[0] : "?"}
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase">{safeFormat(item.submittedAt, "MMM dd")}</span>
                                                </div>
                                                <h4 className="text-sm font-black text-slate-800 mb-2 truncate">{item.submittedByName}</h4>
                                                <div className="space-y-2 mt-4">
                                                    {data?.form?.fields?.slice(0, 2).map(f => (
                                                        <div key={f.id} className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                                            <span>{f.label}:</span>
                                                            <span className="text-slate-600">{getCellValue(item.id, f.id, false) || "—"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-indigo-400"><History size={10} /></div>
                                                    </div>
                                                    <div className="p-2 text-indigo-600 group-hover:translate-x-1 transition-transform"><ArrowUpRight size={16} /></div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <button className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all">+ Drop Here</button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main >

            {/* Sidebar Details Drawer */}
            <AnimatePresence>
                {
                    selectedResponse && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedResponse(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]" />
                            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-[650px] bg-white shadow-[-40px_0_100px_rgba(0,0,0,0.1)] z-[70] overflow-hidden flex flex-col">
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
                                        <div className="p-10 bg-slate-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <h4 className="text-2xl font-black mb-4 tracking-tight">Active Workflows</h4>
                                                <div className="grid grid-cols-2 gap-5 mt-12">
                                                    <button onClick={() => handleConvertToLead(selectedResponse)} className="py-6 bg-white text-slate-900 rounded-[32px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-4">
                                                        <UserPlus size={22} className="text-indigo-600" /> CRM Sync
                                                    </button>
                                                    <button className="py-6 bg-white/10 text-white border border-white/20 rounded-[32px] text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-4">
                                                        <Mail size={22} className="text-indigo-400" /> Notify
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] px-4 flex items-center gap-4"><History size={20} className="text-indigo-500" /> Modification Archive</h3>
                                            <div className="space-y-4">
                                                {data?.activities?.filter(a => a.responseId === selectedResponse.id).length ? (
                                                    data.activities.filter(a => a.responseId === selectedResponse.id).map((act) => (
                                                        <div key={act.id} className="p-8 bg-slate-50 rounded-[36px] border border-slate-100 flex items-start gap-6">
                                                            <div className="w-12 h-12 rounded-[18px] bg-white border border-slate-100 flex items-center justify-center font-black text-xs text-slate-800 shadow-sm">{act.userName[0]}</div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-3"><p className="text-[13px] font-black text-slate-900">{act.userName}</p><span className="text-[10px] font-bold text-slate-400 uppercase">{safeFormat(act.createdAt, "MMM dd, HH:mm")}</span></div>
                                                                <p className="text-xs text-slate-500 font-bold leading-relaxed">Changed <span className="text-indigo-600 font-black">{act.columnName}</span> to <span className="text-emerald-600 font-black">{act.newValue}</span></p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-20 p-8 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                                        <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                                                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No modifications detected</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] px-4 flex items-center gap-4"><Database size={20} className="text-indigo-500" /> Attribute Core</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {[...(data?.form?.fields || []), ...(data?.internalColumns || [])].map((col: any) => (
                                                    <div key={col.id} className="p-10 bg-white border-2 border-slate-50 rounded-[44px] hover:border-slate-200 transition-all shadow-sm">
                                                        <div className="flex items-center justify-between mb-4"><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{col.label}</p></div>
                                                        <p className="text-xl font-black text-slate-900 leading-tight">{getCellValue(selectedResponse.id, col.id, !!col.formId === false) || <span className="text-slate-200 italic">No entry</span>}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >

            {/* Filter Builder Modal — Phase 2 Upgrade */}
            <AnimatePresence>
                {
                    isFilterBuilderOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-[100] p-10">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterBuilderOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[60px] shadow-2xl w-full max-w-[900px] relative z-10 p-12 overflow-hidden flex flex-col gap-10 border-4 border-indigo-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter mb-2">Matrix Filter Hub</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Architect your data segmentation</p>
                                    </div>
                                    <div className="flex bg-slate-100 p-1 rounded-2xl border">
                                        <button onClick={() => setFilterConjunction("AND")} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterConjunction === 'AND' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Match All (AND)</button>
                                        <button onClick={() => setFilterConjunction("OR")} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterConjunction === 'OR' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Match Any (OR)</button>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar max-h-[450px] pr-4">
                                    {conditions.map((c, i) => {
                                        const col = getColumns.find(col => col.id === c.colId);
                                        const colType = col?.type || "text";
                                        const operators = (FILTER_OPERATORS as any)[colType] || FILTER_OPERATORS.text;

                                        return (
                                            <div key={i} className="flex gap-4 items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100 group">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-300 border mb-auto mt-2">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 grid grid-cols-12 gap-3">
                                                    <div className="col-span-4">
                                                        <select value={c.colId} onChange={(e) => { const n = [...conditions]; n[i].colId = e.target.value; setConditions(n); }} className="w-full bg-white p-4 rounded-2xl border-none font-black text-xs shadow-sm appearance-none cursor-pointer hover:ring-2 ring-indigo-200 transition-all">
                                                            <option value="">Select Field...</option>
                                                            {getColumns.filter(f => f.type !== "static").map(f => (
                                                                <option key={f.id} value={f.id}>{f.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <select value={c.op} onChange={(e) => { const n = [...conditions]; n[i].op = e.target.value; setConditions(n); }} className="w-full bg-white p-4 rounded-2xl border-none font-black text-xs shadow-sm appearance-none cursor-pointer hover:ring-2 ring-indigo-200 transition-all">
                                                            {operators.map((op: any) => <option key={op.value} value={op.value}>{op.label}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-4 flex gap-2">
                                                        {!["is_empty", "is_not_empty", "today", "yesterday", "tomorrow", "this_week", "is_true", "is_false"].includes(c.op) && (
                                                            <>
                                                                {colType === "date" ? (
                                                                    <input type="date" value={c.val} onChange={(e) => { const n = [...conditions]; n[i].val = e.target.value; setConditions(n); }} className="flex-1 bg-white p-4 rounded-2xl border-none font-black text-xs shadow-sm outline-none focus:ring-2 ring-indigo-500" />
                                                                ) : colType === "dropdown" ? (
                                                                    <select value={c.val} onChange={(e) => { const n = [...conditions]; n[i].val = e.target.value; setConditions(n); }} className="flex-1 bg-white p-4 rounded-2xl border-none font-black text-xs shadow-sm outline-none focus:ring-2 ring-indigo-500">
                                                                        <option value="">Value...</option>
                                                                        {Array.isArray(col?.options) && col?.options.map((opt: any) => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <input value={c.val} onChange={(e) => { const n = [...conditions]; n[i].val = e.target.value; setConditions(n); }} placeholder="Value..." className="flex-1 bg-white p-4 rounded-2xl border-none font-black text-xs shadow-sm outline-none focus:ring-2 ring-indigo-500" />
                                                                )}
                                                                {c.op === "between" && (
                                                                    <input value={c.val2 || ""} onChange={(e) => { const n = [...conditions]; n[i].val2 = e.target.value; setConditions(n); }} placeholder="To..." className="flex-1 bg-white p-4 rounded-2xl border-none font-black text-xs shadow-sm outline-none focus:ring-2 ring-indigo-500" />
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 flex flex-col gap-1">
                                                        <button onClick={() => {
                                                            const n = [...conditions];
                                                            if (i > 0) {
                                                                [n[i], n[i - 1]] = [n[i - 1], n[i]];
                                                                setConditions(n);
                                                            }
                                                        }} className="flex-1 p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors flex items-center justify-center"><ChevronDown size={14} className="rotate-180" /></button>
                                                        <button onClick={() => {
                                                            const n = [...conditions];
                                                            if (i < n.length - 1) {
                                                                [n[i], n[i + 1]] = [n[i + 1], n[i]];
                                                                setConditions(n);
                                                            }
                                                        }} className="flex-1 p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors flex items-center justify-center"><ChevronDown size={14} /></button>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <button onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))} className="w-full h-full p-4 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-100 transition-colors flex items-center justify-center"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button onClick={() => setConditions([...conditions, { colId: "", op: "equals", val: "" }])} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[40px] text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-3">
                                        <Plus size={18} /> Spawn New Rule
                                    </button>
                                    <div className="mt-12 pt-12 border-t border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Saved Architectures</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {savedViews.map(view => (
                                                <div key={view.id} className="relative group/view">
                                                    <button
                                                        onClick={() => applySavedView(view)}
                                                        className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2 group pr-12"
                                                    >
                                                        <Star size={12} className="group-hover:fill-current" />
                                                        {view.name}
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteView(view.id, e)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-rose-500 hover:text-white text-rose-300 rounded-lg transition-all opacity-0 group-hover/view:opacity-100"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            {savedViews.length === 0 && (
                                                <>
                                                    <button onClick={() => { setConditions([{ colId: "Status", op: "equals", val: "New" }]); setFilterConjunction("AND"); }} className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all">New Leads</button>
                                                    <button onClick={() => { setConditions([{ colId: "Budget", op: "gt", val: "50000" }]); setFilterConjunction("AND"); }} className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all">High Value</button>
                                                </>
                                            )}
                                            <button onClick={handleSaveView} className="px-6 py-4 bg-slate-50 text-slate-400 rounded-[20px] text-[10px] font-black uppercase tracking-widest border border-slate-100 border-dashed hover:border-indigo-300 hover:text-indigo-500 transition-all">+ Save Current View</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button onClick={handleClearFilters} className="px-10 py-6 bg-slate-50 text-slate-500 rounded-[35px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">Neutralize</button>
                                    <div className="flex-1 flex gap-2">
                                        <button onClick={() => setIsFilterBuilderOpen(false)} className="flex-1 py-6 bg-slate-900 text-white rounded-[35px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all shadow-indigo-100 border-b-4 border-indigo-600">Deploy Segmentation ({filteredResponses.length} Matches)</button>

                                        {!activeViewId && conditions.length > 0 && (
                                            <button onClick={handleSaveView} className="px-8 py-6 bg-indigo-50 text-indigo-600 rounded-[35px] text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-2">
                                                <Star size={14} className="fill-indigo-600" />
                                                Archivize Workspace
                                            </button>
                                        )}

                                        <button onClick={() => setAutoApply(!autoApply)} className={`px-6 rounded-[35px] border-2 transition-all flex items-center gap-2 ${autoApply ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                            <Clock size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{autoApply ? "Live" : "Manual"}</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Previous Column Modal Kept... (Simplified for this file Write) */}
            <AnimatePresence>
                {
                    isAddColumnOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-[100] p-10 overflow-hidden">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddColumnOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white rounded-[70px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] w-full max-w-[1100px] h-[85vh] relative z-10 border-8 border-white flex overflow-hidden">
                                <div className="w-[350px] bg-slate-50 border-r border-slate-100 p-12 overflow-y-auto custom-scrollbar">
                                    <h3 className="text-2xl font-black tracking-tighter mb-10 flex items-center gap-4"><Plus className="text-indigo-600" /> Dimension Lab</h3>
                                    <div className="space-y-3">
                                        {COLUMN_TYPES.map(type => (
                                            <button key={type.id} onClick={() => setNewColType(type.id)} className={`w-full p-6 rounded-[30px] flex items-center gap-5 transition-all ${newColType === type.id ? 'bg-white shadow-xl ring-2 ring-indigo-500 scale-105' : 'hover:bg-slate-100 text-slate-400'}`}>
                                                <div className={`p-3 rounded-2xl bg-white shadow-sm ${type.color}`}><type.icon size={20} /></div>
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${newColType === type.id ? 'text-slate-900' : ''}`}>{type.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 p-16 flex flex-col justify-between overflow-y-auto">
                                    <div className="space-y-16">
                                        <div>
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 mb-6 block">Visual Identifier</label>
                                            <input autoFocus value={newColLabel} onChange={(e) => setNewColLabel(e.target.value)} placeholder="e.g. Production Status..." className="w-full p-10 bg-slate-50 border-4 border-transparent focus:border-indigo-600 rounded-[50px] outline-none font-black text-3xl tracking-tighter text-slate-800 transition-all shadow-inner" />
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
                                                        <button onClick={() => setNewColSettings({ ...newColSettings, isLocked: !newColSettings.isLocked })} className={`w-14 h-8 rounded-full transition-all relative ${newColSettings.isLocked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${newColSettings.isLocked ? 'left-7' : 'left-1'}`} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="pt-8">
                                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-4 mb-6">Access Control (RBAC)</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {AVAILABLE_ROLES.map(role => (
                                                            <button
                                                                key={role}
                                                                onClick={() => {
                                                                    const roles = newColPermissions.roles.includes(role)
                                                                        ? newColPermissions.roles.filter(r => r !== role)
                                                                        : [...newColPermissions.roles, role];
                                                                    setNewColPermissions({ ...newColPermissions, roles });
                                                                }}
                                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newColPermissions.roles.includes(role) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                                                            >
                                                                {role}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-8 relative">
                                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-4 mb-6">Individual Analytics Access</h4>
                                                    <div className="space-y-4">
                                                        <div className="relative">
                                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input
                                                                value={userSearchQuery}
                                                                onChange={(e) => searchUsers(e.target.value)}
                                                                placeholder="Search users by email..."
                                                                className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border-none font-bold text-[11px] shadow-inner outline-none focus:ring-1 ring-indigo-500"
                                                            />
                                                        </div>

                                                        {userResults.length > 0 && (
                                                            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-20 py-4 max-h-[200px] overflow-y-auto">
                                                                {userResults.map(u => (
                                                                    <button
                                                                        key={u.clerkId}
                                                                        onClick={() => {
                                                                            if (!newColPermissions.users.includes(u.clerkId)) {
                                                                                setNewColPermissions({ ...newColPermissions, users: [...newColPermissions.users, u.clerkId] });
                                                                            }
                                                                            setUserResults([]);
                                                                            setUserSearchQuery("");
                                                                        }}
                                                                        className="w-full px-6 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                                                                    >
                                                                        <span className="text-[10px] font-black text-slate-700">{u.email}</span>
                                                                        <Plus size={14} className="text-indigo-600" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-2">
                                                            {newColPermissions.users.map(uid => (
                                                                <div key={uid} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
                                                                    <span className="text-[9px] font-black">User: {uid.split('_').pop()?.slice(0, 5)}...</span>
                                                                    <X size={12} className="cursor-pointer" onClick={() => setNewColPermissions({ ...newColPermissions, users: newColPermissions.users.filter(x => x !== uid) })} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Type Configuration</h4>
                                                {newColType === 'dropdown' ? (
                                                    <div className="space-y-4">
                                                        {newColOptions.map((opt, i) => (
                                                            <div key={i} className="flex gap-3">
                                                                <input value={opt.label} onChange={(e) => { const n = [...newColOptions]; n[i].label = e.target.value; setNewColOptions(n); }} placeholder="Status/Label..." className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-black text-xs shadow-inner" />
                                                                <button onClick={() => setNewColOptions(newColOptions.filter((_, idx) => idx !== i))} className="p-4 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors"><X size={16} /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => setNewColOptions([...newColOptions, { label: "New Option", color: "#6366f1" }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all">+ Add Lifecycle Node</button>
                                                    </div>
                                                ) : newColType === 'formula' ? (
                                                    <div className="p-8 bg-slate-900 rounded-[40px] border border-slate-800">
                                                        <div className="flex items-center gap-3 text-indigo-400 mb-4">
                                                            <FunctionSquare size={20} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Logic Engine</span>
                                                        </div>
                                                        <textarea placeholder="e.g. {Price} * {Quantity}" className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white font-mono text-xs focus:ring-1 ring-indigo-500 min-h-[100px]" />
                                                        <p className="text-[8px] text-slate-500 mt-3 font-bold uppercase tracking-tight">Use curly braces for column names</p>
                                                    </div>
                                                ) : (
                                                    <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center opacity-40">
                                                        <Settings size={30} className="mb-4 text-slate-400 animate-spin-slow" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Dynamic Logic Enabled <br />For {newColType} Type</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-20 flex gap-6">
                                        <button onClick={() => setIsAddColumnOpen(false)} className="px-14 py-8 bg-slate-50 text-slate-500 rounded-[36px] text-xs font-black uppercase tracking-[0.2em]">Abort</button>
                                        <button onClick={handleAddColumn} className="flex-1 py-8 bg-slate-900 text-white rounded-[36px] text-xs font-black uppercase tracking-[0.4em] shadow-2xl">Deploy Dimension</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Bulk Action Bar — Floating Permission Lab */}
            <AnimatePresence>
                {
                    selectedRows.length > 0 && (
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-6 bg-slate-900 border border-slate-800 p-4 px-8 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                            <div className="flex items-center gap-4 border-r border-slate-800 pr-6 mr-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">{selectedRows.length}</div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Records Selected</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase text-indigo-400 mr-2 tracking-tighter">Set Visibility:</span>
                                {AVAILABLE_ROLES.map(role => (
                                    <button key={role} onClick={() => handleBulkVisibilityUpdate("ROW", [role])} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Visible to {role}</button>
                                ))}
                                <div className="relative">
                                    <input
                                        className="bg-slate-800 border-none rounded-xl px-4 py-2 text-[9px] font-black uppercase text-white outline-none w-[150px] focus:ring-1 ring-indigo-500"
                                        placeholder="Search User..."
                                        value={userSearchQuery}
                                        onChange={(e) => searchUsers(e.target.value)}
                                    />
                                    {userResults.length > 0 && (
                                        <div className="absolute bottom-full mb-4 left-0 w-[200px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 overflow-hidden">
                                            {userResults.map(u => (
                                                <button
                                                    key={u.clerkId}
                                                    onClick={() => {
                                                        // For bulk, we'll just set it to this one user for now as a quick action
                                                        const res = fetch(`/api/crm/forms/${params.id}/bulk/visibility`, {
                                                            method: "PATCH",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ ids: selectedRows, type: "ROW", visibleToRoles: [], visibleToUsers: [u.clerkId] })
                                                        }).then(() => {
                                                            toast.success(`Exclusive access granted to ${u.email.split('@')[0]}`);
                                                            setSelectedRows([]);
                                                            fetchData();
                                                        });
                                                        setUserResults([]);
                                                        setUserSearchQuery("");
                                                    }}
                                                    className="w-full px-4 py-2 text-left hover:bg-indigo-600 text-[9px] font-black uppercase text-slate-300 hover:text-white"
                                                >
                                                    {u.email}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => handleBulkVisibilityUpdate("ROW", [])} className="px-4 py-2 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-900/50 transition-all">Make Public</button>
                            </div>

                            <div className="h-6 w-[1px] bg-slate-800 mx-2" />

                            <button onClick={() => setSelectedRows([])} className="p-3 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; border: 3px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div >
    );
}

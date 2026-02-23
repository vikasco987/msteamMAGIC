"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Clock,
    User,
    History,
    AlertCircle,
    Timer,
    UserPlus,
    Search,
    TrendingUp,
    Filter,
    Package,
    ArrowRight,
    CheckCircle2,
    Box,
    Truck,
    MapPin,
    Smartphone,
    ChevronLeft,
    ChevronRight,
    Users,
    Eye,
    IndianRupee,
    CalendarDays,
    LayoutPanelTop,
    MoreHorizontal,
    X,
    Navigation,
    Activity,
    CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow, isValid } from "date-fns";
import toast from "react-hot-toast";
import EditTaskModal from "../../components/EditTaskModal";
import { Task } from "@/types/task";

interface StatusLog {
    status: string;
    enterTime: string;
    exitTime: string | null;
    durationMs: number;
}

interface ReassignmentLog {
    time: string;
    content: string;
    author: string;
}

interface TaskAudit {
    id: string;
    task: Task;
    title: string;
    shopName: string;
    createdAt: string;
    lastActivityAt: string;
    createdByName: string;
    currentStatus: string;
    assigneeName: string;
    assignerName: string;
    priority: string;
    tags: string[];
    amount: number;
    received: number;
    statusHistory: StatusLog[];
    reassignments: ReassignmentLog[];
    totalActivities: number;
    isStale: boolean;
    staleHours: number;
}

interface Bottleneck {
    status: string;
    avgDays: number;
}

const ITEMS_PER_PAGE = 15;

export default function DeepAnalysisPage() {
    const [auditData, setAuditData] = useState<TaskAudit[]>([]);
    const [bottleneckData, setBottleneckData] = useState<Bottleneck[]>([]);
    const [staleTasks, setStaleTasks] = useState<TaskAudit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [selectedStale, setSelectedStale] = useState("all");
    const [selectedAssignee, setSelectedAssignee] = useState("all");
    const [selectedAssigner, setSelectedAssigner] = useState("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Modals & Panels
    const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
    const [trackingTask, setTrackingTask] = useState<TaskAudit | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const fetchAudit = async () => {
            try {
                const res = await fetch("/api/tasks/audit");
                const data = await res.json();

                if (res.ok) {
                    setAuditData(data.auditData || []);
                    setBottleneckData(data.bottleneckData || []);
                    setStaleTasks(data.staleTasks || []);
                    if (data.auditData?.length === 0) {
                        setError("No task data found. Try creating or updating some tasks first.");
                    }
                } else {
                    setError(data.error || "Failed to fetch audit data");
                }
            } catch (err) {
                console.error("Fetch audit error:", err);
                setError("Network error: Could not reach the audit server.");
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, []);

    const assignees = useMemo(() => Array.from(new Set(auditData.map(t => t.assigneeName || "Unassigned"))).sort(), [auditData]);
    const assigners = useMemo(() => Array.from(new Set(auditData.map(t => t.assignerName || "Unknown"))).sort(), [auditData]);

    const filteredData = useMemo(() => {
        return auditData.filter(task => {
            const title = task.title || "";
            const shop = task.shopName || "";
            const creator = task.createdByName || "";
            const id = task.id || "";

            const matchesSearch =
                title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                id.toLowerCase().includes(searchTerm.toLowerCase()); // Full ID for search

            const matchesStatus = selectedStatus === "all" || (task.currentStatus || "").toLowerCase() === selectedStatus.toLowerCase();
            const matchesPriority = selectedPriority === "all" || (task.priority || "normal").toLowerCase() === selectedPriority.toLowerCase();
            const matchesStale = selectedStale === "all" || (selectedStale === "stale" && task.isStale) || (selectedStale === "active" && !task.isStale);
            const matchesAssignee = selectedAssignee === "all" || task.assigneeName === selectedAssignee;
            const matchesAssigner = selectedAssigner === "all" || task.assignerName === selectedAssigner;

            return matchesSearch && matchesStatus && matchesPriority && matchesStale && matchesAssignee && matchesAssigner;
        });
    }, [auditData, searchTerm, selectedStatus, selectedPriority, selectedStale, selectedAssignee, selectedAssigner]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedPriority, selectedStale, selectedAssignee, selectedAssigner]);

    const getStatusColor = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s.includes("todo")) return "bg-blue-50 text-blue-700 border-blue-100";
        if (s.includes("progress")) return "bg-amber-50 text-amber-700 border-amber-100";
        if (s.includes("done")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
        return "bg-slate-50 text-slate-700 border-slate-100";
    };

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const safeFormat = (dateStr: any, fmt: string) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return isValid(d) ? format(d, fmt) : "N/A";
    };

    const safeDistance = (dateStr: any) => {
        if (!isMounted || !dateStr) return "N/A";
        const d = new Date(dateStr);
        return isValid(d) ? formatDistanceToNow(d) : "N/A";
    };

    const handleSaveTask = async (updated: Task) => {
        try {
            const res = await fetch(`/api/tasks/${updated.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated.customFields ? { customFields: updated.customFields } : updated),
            });
            if (res.ok) {
                toast.success("Task updated");
                const refreshRes = await fetch("/api/tasks/audit");
                const refreshData = await refreshRes.json();
                setAuditData(refreshData.auditData || []);
            }
        } catch (err) {
            toast.error("Failed to update task");
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 relative overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-slate-900 text-white rounded-[28px] shadow-2xl rotate-3">
                                <LayoutPanelTop size={28} className="text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lifecycle <span className="text-indigo-600">Master Data</span></h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.25em]">Real-time Tracking Matrix</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative group flex-1 max-w-xl">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Universal Search (TRK ID, Shop, Staff, Title)..."
                                className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[30px] shadow-sm focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Filter size={14} /> Intelligence Filters
                        </div>

                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer hover:bg-white transition-all">
                            <option value="all">All Phases</option>
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="done">Done</option>
                        </select>

                        <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer hover:bg-white transition-all">
                            <option value="all">Priority: All</option>
                            <option value="high">High Velocity</option>
                            <option value="normal">Standard</option>
                            <option value="low">Low Priority</option>
                        </select>

                        <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer hover:bg-white transition-all">
                            <option value="all">Assignee: All</option>
                            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>

                        <select value={selectedAssigner} onChange={(e) => setSelectedAssigner(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer hover:bg-white transition-all">
                            <option value="all">Assigner: All</option>
                            {assigners.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>

                        <button
                            onClick={() => {
                                setSearchTerm(""); setSelectedStatus("all"); setSelectedPriority("all");
                                setSelectedAssignee("all"); setSelectedAssigner("all"); setSelectedStale("all");
                            }}
                            className="ml-auto px-6 py-2.5 text-slate-400 hover:text-indigo-600 text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Reset All
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    <div className="xl:col-span-3 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
                            <TrendingUp className="absolute -top-4 -right-4 w-32 h-32 text-slate-50 opacity-50" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 relative z-10 flex items-center gap-2">
                                <TrendingUp size={14} className="text-indigo-500" /> Phase Velocity
                            </h2>
                            <div className="space-y-6 relative z-10">
                                {bottleneckData.map((b, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                            <span className="text-slate-600">{b.status}</span>
                                            <span className="text-indigo-600">{b.avgDays}d</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (b.avgDays / 7) * 100)}%` }} className="h-full bg-indigo-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-rose-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <AlertCircle size={14} /> Red Zone Warnings
                            </h2>
                            <div className="space-y-4">
                                {staleTasks.slice(0, 5).map((t, i) => (
                                    <div key={i} className="p-4 bg-white/10 rounded-2xl flex justify-between items-center group/item hover:bg-white/20 cursor-pointer transition-all"
                                        onClick={() => setSelectedTaskForModal(t.task)}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-black truncate">{t.title}</p>
                                            <p className="text-[9px] font-bold text-rose-200 uppercase tracking-widest">{t.shopName}</p>
                                        </div>
                                        <span className="text-[10px] font-black bg-rose-500 px-2 py-1 rounded-lg">Stale {t.staleHours}h</span>
                                    </div>
                                ))}
                                {staleTasks.length === 0 && <p className="text-[10px] font-black text-rose-100/60 uppercase text-center py-4 tracking-widest">Systems Stable</p>}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-9 space-y-6">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Box size={18} className="text-indigo-600" /> Central Manifest Database
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 ml-2">{filteredData.length} Entries</span>
                                </h3>

                                <div className="flex items-center gap-4">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all disabled:opacity-20"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page {currentPage} of {totalPages || 1}</span>
                                    <button
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all disabled:opacity-20"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-white">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 text-center">Tracking ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Task Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Financials</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Phase</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Assigned To</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Timeline</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence mode="popLayout">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                                                        <p>Loading Master Manifest...</p>
                                                    </td>
                                                </tr>
                                            ) : paginatedData.map((task) => (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    key={task.id}
                                                    className="group hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => setTrackingTask(task)}
                                                            className="flex flex-col items-center group/trk"
                                                        >
                                                            <span className="text-[10px] font-black text-indigo-600 group-hover/trk:underline group-hover/trk:scale-110 transition-all">TRK-{task.id?.slice(-6).toUpperCase() || "N/A"}</span>
                                                            <div className="p-1 px-2 mt-1 bg-indigo-50 rounded-md text-[8px] font-black text-indigo-400 opacity-0 group-hover/trk:opacity-100 transition-opacity">Deep Look</div>
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col max-w-[200px]">
                                                            <span className="text-sm font-black text-slate-800 truncate mb-1">{task.title || "Untitled"}</span>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                                <MapPin size={10} className="text-indigo-400" />
                                                                <span className="truncate">{task.shopName || "No Shop"}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1 text-[11px] font-black text-slate-900">
                                                                <IndianRupee size={10} /> {task.amount || 0}
                                                            </div>
                                                            <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((task.received || 0) / (task.amount || 1)) * 100)}%` }} />
                                                            </div>
                                                            <span className="text-[8px] font-black text-emerald-600 mt-1 uppercase">Received: {task.received || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(task.currentStatus)}`}>
                                                            {task.currentStatus || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">
                                                                    {(task.assigneeName || "U")[0]}
                                                                </div>
                                                                <span className="text-xs font-black text-slate-700">{task.assigneeName || "Unassigned"}</span>
                                                            </div>
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase ml-8">By {task.assignerName || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                                                                <CalendarDays size={10} className="text-slate-400" />
                                                                {safeFormat(task.createdAt, "dd MMM")}
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase mt-1">
                                                                Aktive {safeDistance(task.lastActivityAt)} ago
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button onClick={() => setSelectedTaskForModal(task.task)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all active:scale-95">
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = currentPage - 3 + i + 1;
                                            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                        }
                                        return (
                                            <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-12 h-12 rounded-2xl font-black text-xs border transition-all ${currentPage === pageNum ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-100'}`}>
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deep Tracking Slide-over Panel (Shiprocket Style) */}
            <AnimatePresence>
                {trackingTask && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setTrackingTask(null)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] overflow-y-auto"
                        >
                            <div className="p-8 pb-32">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mb-2">Manifest Path</div>
                                        <h2 className="text-2xl font-black text-slate-900">TRK-{trackingTask.id?.slice(-6).toUpperCase()}</h2>
                                    </div>
                                    <button onClick={() => setTrackingTask(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Quick Stats Section */}
                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <Navigation size={10} className="text-indigo-500" /> Origin Point
                                        </div>
                                        <p className="text-xs font-black text-slate-800">{safeFormat(trackingTask.createdAt, "dd MMM yyyy")}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <Activity size={10} className="text-indigo-500" /> Touchpoints
                                        </div>
                                        <p className="text-xs font-black text-slate-800">{trackingTask.totalActivities} Interactions</p>
                                    </div>
                                </div>

                                {/* The Milestone Timeline (Shiprocket Style) */}
                                <div className="mb-12">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 px-2 flex items-center gap-2">
                                        <Truck size={14} className="text-indigo-600" /> Professional Tracking History
                                    </h3>
                                    <div className="relative pl-6">
                                        <div className="absolute left-[34px] top-6 bottom-6 w-1 bg-slate-100 rounded-full" />
                                        <div className="space-y-10">
                                            {trackingTask.statusHistory.map((log, i) => (
                                                <div key={i} className="flex gap-6 relative group">
                                                    <div className={`shrink-0 w-12 h-12 rounded-[18px] border-4 border-white shadow-xl flex items-center justify-center z-10 
                                                        ${getStatusColor(log.status)} group-hover:scale-110 transition-transform`}>
                                                        {i === trackingTask.statusHistory.length - 1 ? <CheckCircle2 size={24} /> : <Timer size={24} />}
                                                    </div>
                                                    <div className="pt-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.status}</span>
                                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                                {formatDuration(log.durationMs)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {safeFormat(log.enterTime, "dd MMM, HH:mm")}
                                                            {log.exitTime && <span className="mx-2 opacity-30">→</span>}
                                                            {log.exitTime && safeFormat(log.exitTime, "dd MMM, HH:mm")}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Card */}
                                <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-12">
                                    <IndianRupee className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                                    <div className="relative z-10">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 underline decoration-indigo-400 underline-offset-8">Financial Manifest</h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Invoiced Amount</p>
                                                <p className="text-xl font-black">₹{trackingTask.amount || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Recovery Credit</p>
                                                <p className="text-xl font-black text-emerald-400">₹{trackingTask.received || 0}</p>
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                                                <span>Recovery Progress</span>
                                                <span>{Math.floor(((trackingTask.received || 0) / (trackingTask.amount || 1)) * 100)}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((trackingTask.received || 0) / (trackingTask.amount || 1)) * 100)}%` }} className="h-full bg-emerald-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Handover Section */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Custody Handover Log</h3>
                                    {trackingTask.reassignments.length > 0 ? (
                                        trackingTask.reassignments.map((re, i) => (
                                            <div key={i} className="p-5 bg-white border border-slate-100 rounded-[28px] shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <UserPlus size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic mb-3">"{re.content}"</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full">
                                                            <User size={10} /> {re.author}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{safeFormat(re.time, "dd MMM, HH:mm")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Transfers Logged</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Edit Button inside Panel */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        setSelectedTaskForModal(trackingTask.task);
                                        setTrackingTask(null);
                                    }}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Eye size={18} className="text-indigo-400" /> View Comprehensive Profile
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Task Detail Modal Integration */}
            {selectedTaskForModal && (
                <EditTaskModal
                    task={selectedTaskForModal}
                    onClose={() => setSelectedTaskForModal(null)}
                    onSave={handleSaveTask}
                    onDelete={() => {
                        toast.error("Deletion not permitted from report hub.");
                        setSelectedTaskForModal(null);
                    }}
                />
            )}
        </div>
    );
}

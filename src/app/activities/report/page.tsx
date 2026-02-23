"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Clock,
    User,
    History,
    AlertCircle,
    Timer,
    UserPlus,
    ChevronDown,
    ChevronUp,
    Search,
    BarChart3,
    Zap,
    Skull,
    TrendingUp,
    Filter,
    Package,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Tag,
    Box,
    Truck,
    MapPin,
    Smartphone,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

const ITEMS_PER_PAGE = 10;

export default function DeepAnalysisPage() {
    const [auditData, setAuditData] = useState<TaskAudit[]>([]);
    const [bottleneckData, setBottleneckData] = useState<Bottleneck[]>([]);
    const [staleTasks, setStaleTasks] = useState<TaskAudit[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [selectedStale, setSelectedStale] = useState("all");
    const [selectedAssignee, setSelectedAssignee] = useState("all");
    const [selectedAssigner, setSelectedAssigner] = useState("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Modal
    const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);

    useEffect(() => {
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
                    toast.error(data.error || "Access Denied");
                }
            } catch (err) {
                console.error("Fetch audit error:", err);
                setError("Network error: Could not reach the audit server.");
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, []);

    // Extract unique lists for filters
    const assignees = useMemo(() => Array.from(new Set(auditData.map(t => t.assigneeName))).sort(), [auditData]);
    const assigners = useMemo(() => Array.from(new Set(auditData.map(t => t.assignerName))).sort(), [auditData]);

    const filteredData = useMemo(() => {
        return auditData.filter(task => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.createdByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.id.slice(-6).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = selectedStatus === "all" || task.currentStatus.toLowerCase() === selectedStatus.toLowerCase();
            const matchesPriority = selectedPriority === "all" || (task.priority || "normal").toLowerCase() === selectedPriority.toLowerCase();
            const matchesStale = selectedStale === "all" || (selectedStale === "stale" && task.isStale) || (selectedStale === "active" && !task.isStale);
            const matchesAssignee = selectedAssignee === "all" || task.assigneeName === selectedAssignee;
            const matchesAssigner = selectedAssigner === "all" || task.assignerName === selectedAssigner;

            return matchesSearch && matchesStatus && matchesPriority && matchesStale && matchesAssignee && matchesAssigner;
        });
    }, [auditData, searchTerm, selectedStatus, selectedPriority, selectedStale, selectedAssignee, selectedAssigner]);

    // Handle pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [searchTerm, selectedStatus, selectedPriority, selectedStale, selectedAssignee, selectedAssigner]);

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("todo")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (s.includes("progress")) return "bg-amber-100 text-amber-700 border-amber-200";
        if (s.includes("done")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
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
                // Refresh data
                const refreshRes = await fetch("/api/tasks/audit");
                const refreshData = await refreshRes.json();
                setAuditData(refreshData.auditData || []);
            }
        } catch (err) {
            toast.error("Failed to update task");
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with Dashboard feel */}
                <header className="mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-slate-900 text-white rounded-[24px] shadow-2xl">
                                <Box size={28} className="text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tish Intel <span className="text-indigo-600">Lifecycle</span></h1>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 opacity-70">Deep Analysis & Tracking Hub</p>
                            </div>
                        </div>

                        {/* Search Bar - Tracking ID style */}
                        <div className="relative group min-w-[300px] lg:min-w-[400px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search Tracking ID, Shop, or Staff..."
                                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-[24px] shadow-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quick Filters Bank */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs font-black text-slate-500 uppercase tracking-wider">
                                <Filter size={14} /> Core Filters:
                            </div>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="done">Done</option>
                            </select>

                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">High Priority</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low Priority</option>
                            </select>

                            <select
                                value={selectedStale}
                                onChange={(e) => setSelectedStale(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Activity</option>
                                <option value="stale">Stale Only (Red Zone)</option>
                                <option value="active">Active Recently</option>
                            </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs font-black text-slate-500 uppercase tracking-wider">
                                <Users size={14} /> Identity Filters:
                            </div>

                            <select
                                value={selectedAssignee}
                                onChange={(e) => setSelectedAssignee(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Assignees</option>
                                {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>

                            <select
                                value={selectedAssigner}
                                onChange={(e) => setSelectedAssigner(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Asssigners</option>
                                {assigners.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>

                            {(searchTerm || selectedStatus !== "all" || selectedPriority !== "all" || selectedStale !== "all" || selectedAssignee !== "all" || selectedAssigner !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedStatus("all");
                                        setSelectedPriority("all");
                                        setSelectedStale("all");
                                        setSelectedAssignee("all");
                                        setSelectedAssigner("all");
                                    }}
                                    className="px-4 py-2 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-[32px] flex items-center gap-4 text-rose-700">
                        <AlertCircle className="shrink-0" />
                        <div>
                            <p className="font-bold uppercase text-xs tracking-widest">System Scan Result</p>
                            <p className="text-sm opacity-80 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Tracing Task Lifecycles</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Generating shiprocket-style tracking data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar Stats */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Bottleneck Mini-Card */}
                            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-indigo-500" size={16} /> Velocity Matrix
                                </h2>
                                <div className="space-y-4">
                                    {bottleneckData.map((b, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                                                <span className="text-slate-500">{b.status}</span>
                                                <span className="text-indigo-600">{b.avgDays} Days Avg</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (b.avgDays / 7) * 100)}%` }}
                                                    className="h-full bg-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Red Zone Mini-Feed */}
                            <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-2xl shadow-rose-900/10 overflow-hidden relative">
                                <Skull size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                                <h2 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                                    <AlertCircle size={16} /> Stalled Shipments
                                </h2>
                                <div className="space-y-3 relative z-10">
                                    {staleTasks.length > 0 ? (
                                        staleTasks.slice(0, 4).map((task, i) => (
                                            <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors"
                                                onClick={() => setSelectedTaskForModal(task.task)}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black truncate">{task.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{task.shopName}</p>
                                                </div>
                                                <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded ml-2">{task.staleHours}h</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-[10px] text-slate-500 font-black">Velocity is Optimal</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Audit List - Trackable Style */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between mb-2 px-2">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Manifest: {filteredData.length} Tracking Entries</h2>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1 hover:bg-slate-50 rounded-lg disabled:opacity-20 text-slate-600 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                            Page {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1 hover:bg-slate-50 rounded-lg disabled:opacity-20 text-slate-600 transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence mode="popLayout">
                                {paginatedData.map((task) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        key={task.id}
                                        className={`bg-white rounded-[32px] border-2 transition-all overflow-hidden cursor-pointer
                                            ${expandedTaskId === task.id ? 'border-indigo-600 shadow-xl' : 'border-transparent shadow-sm hover:shadow-md'}`}
                                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                    >
                                        {/* Tracking Card Header */}
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                {/* Left Info: Tracking ID & Shop */}
                                                <div className="flex items-center gap-5">
                                                    <div className={`shrink-0 w-16 h-16 rounded-[22px] border-2 flex flex-col items-center justify-center
                                                        ${getStatusColor(task.currentStatus)}`}>
                                                        <Truck size={20} className="mb-0.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">TRK-{task.id.slice(-4).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-black text-slate-900 leading-tight">{task.title}</h3>
                                                            {task.priority.toLowerCase() === 'high' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="High Priority" />}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin size={12} className="text-indigo-500" /> {task.shopName}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <User size={12} className="text-indigo-500" /> {task.assigneeName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Info: Status & Action */}
                                                <div className="flex items-center gap-4 ml-auto md:ml-0">
                                                    <div className="text-right hidden sm:block mr-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Phase</p>
                                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{task.currentStatus}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTaskForModal(task.task);
                                                            }}
                                                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:scale-105 transition-all shadow-lg shadow-slate-200"
                                                        >
                                                            Open Details
                                                        </button>
                                                        <p className="text-[9px] font-bold text-slate-400">Updated {formatDistanceToNow(new Date(task.lastActivityAt))} ago</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Minimal Progress Bar */}
                                            <div className="mt-8 flex items-center gap-3">
                                                <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: task.currentStatus.toLowerCase().includes('done') ? '100%' :
                                                                task.currentStatus.toLowerCase().includes('progress') ? '60%' : '15%'
                                                        }}
                                                        className={`h-full transition-all duration-1000 
                                                            ${task.currentStatus.toLowerCase().includes('done') ? 'bg-emerald-500' :
                                                                task.currentStatus.toLowerCase().includes('progress') ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className={`w-3 h-3 rounded-full border-2 
                                                            ${i === 3 && task.currentStatus.toLowerCase().includes('done') ? 'bg-emerald-500 border-emerald-500' :
                                                                i === 2 && (task.currentStatus.toLowerCase().includes('progress') || task.currentStatus.toLowerCase().includes('done')) ? 'bg-amber-500 border-amber-500' :
                                                                    i === 1 ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Detailed Milestone Tracker */}
                                        <AnimatePresence>
                                            {expandedTaskId === task.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t-2 border-slate-50 bg-slate-50/50"
                                                >
                                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                                        {/* Status Milestone Timeline */}
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-8">Detailed Transit History</h4>
                                                            <div className="space-y-10 relative">
                                                                <div className="absolute left-6 top-3 bottom-3 w-1 bg-slate-200 rounded-full" />
                                                                {task.statusHistory.map((log, i) => (
                                                                    <div key={i} className="relative pl-14 group/log">
                                                                        <div className={`absolute left-0 top-0 w-12 h-12 rounded-[18px] flex items-center justify-center z-10 shadow-sm border-4 border-white transition-transform group-hover/log:scale-110
                                                                            ${getStatusColor(log.status)}`}>
                                                                            {i === task.statusHistory.length - 1 ? <CheckCircle2 size={20} /> : <Timer size={20} />}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center gap-3 mb-1">
                                                                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.status}</span>
                                                                                <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">
                                                                                    {formatDuration(log.durationMs)}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                                {format(new Date(log.enterTime), "dd MMM yyyy, HH:mm")}
                                                                                {log.exitTime && <><ArrowRight size={10} /> {format(new Date(log.exitTime), "dd MMM yyyy, HH:mm")}</>}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Ownership & Analysis Section */}
                                                        <div className="space-y-8">
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">Custody Handover Log</h4>
                                                                <div className="mb-4 flex items-center gap-3 px-1">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Created By</span>
                                                                        <span className="text-[10px] font-black text-slate-700">{task.createdByName}</span>
                                                                    </div>
                                                                    <div className="w-1 h-4 bg-slate-200 rounded-full" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Direct Assigner</span>
                                                                        <span className="text-[10px] font-black text-slate-700">{task.assignerName}</span>
                                                                    </div>
                                                                </div>
                                                                {task.reassignments.length > 0 ? (
                                                                    <div className="space-y-4">
                                                                        {task.reassignments.map((re, i) => (
                                                                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                                                    <UserPlus size={18} />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-xs font-bold text-slate-700 leading-tight mb-2 italic">"{re.content}"</p>
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                                                                            <User size={10} /> {re.author}
                                                                                        </span>
                                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(re.time), "dd MMM, HH:mm")}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-8 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px]">
                                                                        <User size={24} className="mx-auto mb-2 text-slate-300" />
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Single Ownership Manifest</p>
                                                                        <p className="text-[9px] font-bold text-slate-400">Handle by {task.createdByName} since creation.</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Financial & Metadata */}
                                                            <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                                                    <Smartphone size={100} />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-400 flex items-center gap-2">
                                                                        Manifest Summary
                                                                    </h5>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-white/5 p-4 rounded-2xl">
                                                                            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5 flex items-center gap-1">
                                                                                Interaction
                                                                            </div>
                                                                            <div className="text-lg font-black">{task.totalActivities} Touchpoints</div>
                                                                        </div>
                                                                        <div className="bg-white/5 p-4 rounded-2xl">
                                                                            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5 flex items-center gap-1">
                                                                                Financial Status
                                                                            </div>
                                                                            <div className="text-lg font-black">₹{task.received} / ₹{task.amount}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-4 p-4 bg-indigo-600 rounded-2xl flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase opacity-60">Lifespan</p>
                                                                            <p className="text-sm font-black uppercase">{formatDistanceToNow(new Date(task.createdAt))} Transit</p>
                                                                        </div>
                                                                        <History size={20} className="opacity-40" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Bottom Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-[24px] border border-slate-200 shadow-lg">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 hover:bg-slate-50 rounded-xl disabled:opacity-20 text-slate-600 font-black text-xs uppercase transition-all"
                                        >
                                            Prev
                                        </button>
                                        <div className="flex gap-2">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum = i + 1;
                                                // Center page numbers if totalPages > 5
                                                if (totalPages > 5 && currentPage > 3) {
                                                    pageNum = currentPage - 3 + i + 1;
                                                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all 
                                                            ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 hover:bg-slate-50 rounded-xl disabled:opacity-20 text-slate-600 font-black text-xs uppercase transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {filteredData.length === 0 && !loading && (
                                <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                                    <div className="p-6 bg-slate-50 rounded-full inline-flex mb-4 text-slate-200">
                                        <Package size={48} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">No Matching Manifests</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 cursor-pointer hover:text-indigo-600 underline" onClick={() => {
                                        setSearchTerm("");
                                        setSelectedStatus("all");
                                        setSelectedPriority("all");
                                        setSelectedStale("all");
                                        setSelectedAssignee("all");
                                        setSelectedAssigner("all");
                                    }}>Try clearing filters to see all tracking data.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

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

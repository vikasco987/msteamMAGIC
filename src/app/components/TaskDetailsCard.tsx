"use client";

import React, { useState } from "react";
import { FaRegClipboard, FaTimes, FaUserEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import type { Task } from "../../types/task";
import { Note } from "../../../types/note";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import NotesModal from "./NotesModal";
import { PiPushPinSimpleFill } from "react-icons/pi";
import ReassignTaskModal from "./ReassignTaskModal";
import CloneTaskButton from "./CloneTaskButton";
import PaymentRemarkModal from "./PaymentRemarkModal";
import TaskActivityModal from "./TaskActivityModal";
import { FaHandHoldingUsd, FaCommentsDollar, FaHistory } from "react-icons/fa";

interface Props {
  task: Task;
  isAdmin?: boolean;
  onDelete?: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
  onFloatRequest?: (task: Task) => void;
}

// --- Utility Functions ---
const getLabelFromUrl = (url: string): string => {
  const fileName = url.split("/").pop()?.toLowerCase() || "";
  if (fileName.includes("aadhaar")) return "🆔 Aadhaar Card";
  if (fileName.includes("pan")) return "💳 PAN Card";
  if (fileName.includes("selfie")) return "🤳 Selfie Photo";
  if (fileName.endsWith(".pdf")) return "📄 PDF Document";
  if (fileName.includes("license")) return "🍔 Food License";
  if (fileName.includes("menu")) return "📄 Menu Card";
  return "📎 Attachment";
};

const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const getDownloadUrl = (url: string): string =>
  url.includes("/upload/") ? url.replace("/upload/", "/upload/fl_attachment/") : url;

// --- Components ---

// Animated Copy Icon component
const CopyIcon = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative inline-block ml-2">
      <motion.div
        onClick={handleCopy}
        className="text-gray-500 cursor-pointer hover:text-purple-600"
        title="Copy"
        whileTap={{ scale: 0.9 }}
        animate={copied ? { rotate: [0, 10, -10, 0], scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <FaRegClipboard />
      </motion.div>

      <AnimatePresence>
        {copied && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Updated Animated Icon Button for better UI
const AnimatedIconButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
  <motion.button
    onClick={onClick}
    title={title}
    className="p-2 rounded-full hover:bg-purple-100 text-purple-600 transition-colors"
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
  >
    {children}
  </motion.button>
);

// New reusable component for displaying a field with a copy icon
const FieldWithCopy = ({ label, value }: { label: string; value: any }) => {
  if (value === null || value === undefined || value === "") return null;
  const stringValue = String(value);

  return (
    <div className="flex items-center gap-1">
      <p className="mb-0">
        <strong>{label}:</strong> {stringValue}
      </p>
      <CopyIcon text={stringValue} />
    </div>
  );
};

// --- TaskDetailsCard Component ---
export default function TaskDetailsCard({ task, isAdmin = false, onDelete, onUpdateTask, onFloatRequest }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const cf = task.customFields || {};
  const showTitle = task.title !== cf.shopName && task.title !== cf.outletName;

  const displayAssignerName = task.assigner?.name || task.assignerName || "—";
  const displayAssignerEmail = task.assigner?.email || task.assignerEmail || "";
  const displayAssigneeName = task.assignees?.map(a => a?.name || a?.email).filter(Boolean).join(", ") || task.assignee?.name || "—";
  const displayAssigneeEmail = task.assignee?.email || task.assigneeEmail || "";

  const allValues = [
    task.title,
    task.description,
    cf.shopName,
    cf.outletName,
    cf.phone,
    cf.email,
    cf.location,
    cf.accountNumber,
    cf.ifscCode,
    cf.customerName,
    cf.restId,
    cf.packageAmount,
    cf.startDate,
    cf.endDate,
    cf.timeline,
    task.aadhaarUrl,
    task.panUrl,
    task.selfieUrl,
    task.chequeUrl,
    ...(task.menuCardUrls ?? []),
    task.priority,
    task.tags?.join(", "),
    displayAssignerName,
    displayAssignerEmail,
    displayAssigneeName,
    displayAssigneeEmail,
    ...(cf ? Object.entries(cf).map(([key, value]) => `${key}: ${value}`) : []),
  ].filter(Boolean).join("\n");

  const copyAllFields = () => {
    const textarea = document.createElement('textarea');
    textarea.value = allValues;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success("All details copied!");
  };

  const handleDownload = (url: string) => {
    const downloadUrl = getDownloadUrl(url);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const notesCount = task.notes?.length || 0;

  const handleReassignTask = (taskId: string, assigneeId: string) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { assigneeId, assigneeIds: [assigneeId] });
      toast.success("Task reassigned successfully!");
    } else {
      toast.error("Reassign functionality not available.");
    }
    setShowReassignModal(false);
  };

  return (
    <div className="text-sm text-gray-700 space-y-3 overflow-hidden">
      {/* Header with Title and Control Icons */}
      <div className="flex items-start justify-between gap-3">
        {showTitle && (
          <h3
            className="text-base font-bold text-slate-900 leading-tight line-clamp-2 mt-1"
            title={task.title}
          >
            {task.title}
          </h3>
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Action Group */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <AnimatedIconButton onClick={() => setShowReassignModal(true)} title="Reassign Task">
              <FaUserEdit size={14} />
            </AnimatedIconButton>
            <CloneTaskButton taskId={task.id} onCloned={() => onUpdateTask?.(task.id, {})} />
            <AnimatedIconButton onClick={() => setShowActivityModal(true)} title="View Activity Log">
              <FaHistory size={13} className="text-indigo-600" />
            </AnimatedIconButton>
            {(task.amount !== undefined && task.amount > 0) && (
              <AnimatedIconButton onClick={() => setShowRecoveryModal(true)} title="Recovery Status">
                <FaHandHoldingUsd size={16} className="text-blue-600" />
              </AnimatedIconButton>
            )}
          </div>
          {/* View Group */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <div className="relative">
              <AnimatedIconButton onClick={() => setShowNotesModal(true)} title="Notes">
                <span className="text-sm">📝</span>
              </AnimatedIconButton>
              {notesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1 rounded-full border border-white">
                  {notesCount}
                </span>
              )}
            </div>
            <AnimatedIconButton onClick={copyAllFields} title="Copy Details">
              <FaRegClipboard size={14} />
            </AnimatedIconButton>
            {onFloatRequest && (
              <AnimatedIconButton onClick={() => onFloatRequest(task)} title="Pin to Top">
                <PiPushPinSimpleFill size={14} className="text-orange-500" />
              </AnimatedIconButton>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-2">
        {task.description && (
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-3" title={task.description}>
              "{task.description}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-1.5">
          <FieldWithCopy label="🏪 Shop" value={cf.shopName} />
          <FieldWithCopy label="🏷️ Outlet" value={cf.outletName} />
          <FieldWithCopy label="📞 Phone" value={cf.phone} />
          <FieldWithCopy label="👤 Customer" value={cf.customerName} />
          <FieldWithCopy label="💰 Package" value={cf.packageAmount} />

          {cf.location && (
            <div className="flex items-center gap-2 group">
              <p className="text-xs font-medium text-slate-600 truncate flex-1">
                <strong>📍 Location:</strong>{" "}
                {isValidUrl(String(cf.location)) ? (
                  <a href={String(cf.location)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    View Maps Link
                  </a>
                ) : String(cf.location)}
              </p>
              <CopyIcon text={String(cf.location)} />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            <FieldWithCopy label="🏦 A/C" value={cf.accountNumber} />
            <FieldWithCopy label="🔢 IFSC" value={cf.ifscCode} />
          </div>
        </div>

        {/* Status Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map(tag => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attachments</p>
            <div className="grid grid-cols-1 gap-1.5">
              {task.attachments.map((url, i) => {
                const label = getLabelFromUrl(url);
                return (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-slate-600 truncate mr-2">{label}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPreviewUrl(url)} className="text-[10px] font-black text-indigo-600 uppercase">View</button>
                      <button onClick={() => handleDownload(url)} className="text-[10px] font-black text-emerald-600 uppercase">Save</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Meta Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              {displayAssignerName !== "—" && (
                <p className="text-[10px] font-medium text-slate-400">
                  By <span className="text-slate-600 font-bold">{displayAssignerName}</span>
                </p>
              )}
              {displayAssigneeName !== "—" && (
                <p className="text-[10px] font-medium text-slate-400">
                  To <span className="text-indigo-600 font-bold">{displayAssigneeName}</span>
                </p>
              )}
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase">
              {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ""}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                const confirmDelete = window.confirm("Are you sure you want to delete this task?");
                if (confirmDelete && task.id && onDelete) onDelete(task.id);
              }}
              className="w-full py-2 mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete Task
            </button>
          )}
        </div>
      </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {previewUrl && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative">
              <button onClick={() => setPreviewUrl(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg">
                <FaTimes />
              </button>
              <div className="p-2 max-h-[85vh] overflow-auto">
                {previewUrl.toLowerCase().endsWith(".pdf") ? (
                  <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`} className="w-full h-[75vh] rounded-2xl" />
                ) : (
                  <Image src={previewUrl} alt="Preview" width={1200} height={800} className="w-full h-auto object-contain rounded-2xl" unoptimized />
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showNotesModal && (
          <NotesModal
            taskId={task.id}
            initialNotes={task.notes}
            onClose={(notes) => {
              if (notes && onUpdateTask) onUpdateTask(task.id, { notes });
              setShowNotesModal(false);
            }}
          />
        )}

        {showReassignModal && (
          <ReassignTaskModal
            taskId={task.id}
            onClose={() => setShowReassignModal(false)}
            onReassign={handleReassignTask}
          />
        )}

        {showRecoveryModal && (
          <PaymentRemarkModal
            taskId={task.id}
            onClose={() => setShowRecoveryModal(false)}
            onSave={() => onUpdateTask?.(task.id, {})}
          />
        )}

        {showActivityModal && (
          <TaskActivityModal
            taskId={task.id}
            taskTitle={task.title}
            onClose={() => setShowActivityModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

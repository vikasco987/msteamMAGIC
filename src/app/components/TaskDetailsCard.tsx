
// // components/TaskDetailsCard.tsx
// "use client";

// import React, { useState } from "react";
// import { FaRegClipboard, FaTimes, FaUserEdit } from "react-icons/fa"; // Import FaUserEdit
// import toast from "react-hot-toast";
// import type { Task } from "../../types/task";
// import { Note } from "../../../types/note";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import NotesModal from "./NotesModal";
// import { PiPushPinSimpleFill } from "react-icons/pi";
// import ReassignTaskModal from "./ReassignTaskModal"; // Import the new modal

// interface Props {
//   task: Task;
//   isAdmin?: boolean;
//   onDelete?: (taskId: string) => void;
//   onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
//   onFloatRequest?: (task: Task) => void;
// }

// // --- Utility Functions ---
// const getLabelFromUrl = (url: string): string => {
//   const fileName = url.split("/").pop()?.toLowerCase() || "";
//   if (fileName.includes("aadhaar")) return "🆔 Aadhaar Card";
//   if (fileName.includes("pan")) return "💳 PAN Card";
//   if (fileName.includes("selfie")) return "🤳 Selfie Photo";
//   if (fileName.endsWith(".pdf")) return "📄 PDF Document";
//   if (fileName.includes("license")) return "🍔 Food License";
//   if (fileName.includes("menu")) return "📄 Menu Card";
//   return "📎 Attachment";
// };

// const isValidUrl = (str: string): boolean => {
//   try {
//     new URL(str);
//     return true;
//   } catch {
//     return false;
//   }
// };

// const getDownloadUrl = (url: string): string =>
//   url.includes("/upload/") ? url.replace("/upload/", "/upload/fl_attachment/") : url;

// // --- Components ---

// // Animated Copy Icon component
// const CopyIcon = ({ text }: { text: string }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     const textarea = document.createElement("textarea");
//     textarea.value = text;
//     document.body.appendChild(textarea);
//     textarea.select();
//     document.execCommand("copy");
//     document.body.removeChild(textarea);

//     setCopied(true);
//     toast.success("Copied!");
//     setTimeout(() => setCopied(false), 1500); // Hide "Copied!" message after 1.5 seconds
//   };

//   return (
//     <div className="relative inline-block ml-2">
//       <motion.div
//         onClick={handleCopy}
//         className="text-gray-500 cursor-pointer hover:text-purple-600"
//         title="Copy"
//         whileTap={{ scale: 0.9 }}
//         animate={copied ? { rotate: [0, 10, -10, 0], scale: [1, 1.4, 1] } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <FaRegClipboard />
//       </motion.div>

//       {/* Animated "Copied!" message */}
//       <AnimatePresence>
//         {copied && (
//           <motion.div
//             className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow"
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: -10 }}
//             exit={{ opacity: 0, y: -5 }}
//             transition={{ duration: 0.3 }}
//           >
//             Copied!
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Reusable Animated Icon Button for consistency (e.g., for Notes, Float, Copy All)
// const AnimatedIconButton = ({ onClick, title, children, className = "" }: { onClick: () => void; title: string; children: React.ReactNode; className?: string }) => (
//   <motion.button
//     onClick={onClick}
//     title={title}
//     className={`text-gray-500 hover:text-purple-700 p-1 rounded-md ${className}`}
//     whileHover={{ scale: 1.1 }}
//     whileTap={{ scale: 0.9 }}
//   >
//     {children}
//   </motion.button>
// );

// // New reusable component for displaying a field with a copy icon
// const FieldWithCopy = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
//   if (value === null || value === undefined || value === "") return null; // Don't render if value is empty
//   const stringValue = String(value); // Ensure value is a string for CopyIcon

//   return (
//     <div className="flex items-center gap-1">
//       <p className="mb-0">
//         <strong>{label}:</strong> {stringValue}
//       </p>
//       <CopyIcon text={stringValue} />
//     </div>
//   );
// };

// // --- TaskDetailsCard Component ---
// export default function TaskDetailsCard({ task, isAdmin = false, onDelete, onUpdateTask, onFloatRequest }: Props) {
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [showNotesModal, setShowNotesModal] = useState(false);
//   const [showReassignModal, setShowReassignModal] = useState(false); // State for reassign modal

//   const cf = task.customFields || {};
//   const showTitle = task.title !== cf.shopName && task.title !== cf.outletName;

//   const displayAssignerName = task.assigner?.name || task.assignerName || "—";
//   const displayAssignerEmail = task.assigner?.email || task.assignerEmail || "";
//   const displayAssigneeName = task.assignees?.map(a => a?.name || a?.email).filter(Boolean).join(", ") || task.assignee?.name || "—";
//   const displayAssigneeEmail = task.assignee?.email || task.assigneeEmail || "";

//   const allValues = [
//     task.title,
//     task.description,
//     cf.shopName,
//     cf.outletName,
//     cf.phone,
//     cf.email,
//     cf.location,
//     cf.accountNumber,
//     cf.ifscCode,
//     cf.customerName,
//     cf.restId,
//     cf.packageAmount,
//     cf.startDate,
//     cf.endDate,
//     cf.timeline,
//     task.aadhaarUrl,
//     task.panUrl,
//     task.selfieUrl,
//     task.chequeUrl,
//     ...(task.menuCardUrls ?? []),
//     task.priority,
//     task.tags?.join(", "),
//     displayAssignerName,
//     displayAssignerEmail,
//     displayAssigneeName,
//     displayAssigneeEmail,
//     ...(cf ? Object.entries(cf).map(([key, value]) => `${key}: ${value}`) : []),
//   ].filter(Boolean).join("\n");

//   const copyAllFields = () => {
//     const textarea = document.createElement('textarea');
//     textarea.value = allValues;
//     document.body.appendChild(textarea);
//     textarea.select();
//     document.execCommand('copy');
//     document.body.removeChild(textarea);
//     toast.success("All details copied!");
//   };

//   const handleDownload = (url: string) => {
//     const downloadUrl = getDownloadUrl(url);
//     const link = document.createElement("a");
//     link.href = downloadUrl;
//     link.setAttribute("download", "");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const notesCount = task.notes?.length || 0;

//   // Reassign handler that uses onUpdateTask
//   const handleReassignTask = (taskId: string, newAssigneeIds: string[]) => {
//     if (onUpdateTask) {
//       onUpdateTask(taskId, { assigneeIds: newAssigneeIds }); // Update task with new assignee IDs
//       toast.success("Task reassigned successfully!");
//     } else {
//       toast.error("Reassign functionality not available.");
//     }
//     setShowReassignModal(false); // Close modal
//   };

//   return (
//     <div className="text-sm text-gray-700 space-y-2">
//       <div className="flex items-center justify-between">
//         {showTitle && <h3 className="text-lg font-semibold text-purple-800">{task.title}</h3>}
//         <div className="flex items-center gap-2">
//           <div className="relative inline-block">
//             <AnimatedIconButton onClick={() => setShowNotesModal(true)} title="Add/View Notes">
//               📝
//             </AnimatedIconButton>
//             {notesCount > 0 && (
//               <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//                 {notesCount}
//               </span>
//             )}
//           </div>
//           {/* Reassign Task Button (now visible for all roles) */}
//           <AnimatedIconButton
//             onClick={() => setShowReassignModal(true)}
//             title="Reassign Task"
//           >
//             <FaUserEdit />
//           </AnimatedIconButton>
//           {onFloatRequest && (
//             <AnimatedIconButton onClick={() => onFloatRequest(task)} title="Float">
//               <PiPushPinSimpleFill />
//             </AnimatedIconButton>
//           )}
//           <AnimatedIconButton onClick={copyAllFields} title="Copy All" className="flex items-center">
//             <FaRegClipboard className="mr-1" /> Copy All
//           </AnimatedIconButton>
//         </div>
//       </div>

//       <>
//         <FieldWithCopy label="📝 Description" value={task.description} />
//         <FieldWithCopy label="🏪 Shop Name" value={cf.shopName} />
//         <FieldWithCopy label="🏷️ Outlet Name" value={cf.outletName} />
//         <FieldWithCopy label="📞 Phone" value={cf.phone} />
//         <FieldWithCopy label="📧 Email" value={cf.email} />
//         <FieldWithCopy label="👤 Customer Name" value={cf.customerName} />
//         <FieldWithCopy label="💰 Package Amount" value={cf.packageAmount} />
//         <FieldWithCopy label="🗓️ Start Date" value={cf.startDate} />
//         <FieldWithCopy label="📅 End Date" value={cf.endDate} />
//         <FieldWithCopy label="⏱️ Timeline" value={cf.timeline} />

//         {/* Special handling for location due to the conditional link */}
//         {cf.location && (
//           <div className="flex items-center gap-1">
//             <p className="mb-0">
//               <strong>📍 Address:</strong>{" "}
//               {isValidUrl(String(cf.location)) ? (
//                 <a
//                   href={String(cf.location)}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-block px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
//                 >
//                   📍 View on Map
//                 </a>
//               ) : (
//                 String(cf.location)
//               )}
//             </p>
//             <CopyIcon text={String(cf.location)} />
//           </div>
//         )}

//         <FieldWithCopy label="🏦 Account No." value={cf.accountNumber} />
//         <FieldWithCopy label="🔢 IFSC Code" value={cf.ifscCode} />
//         <FieldWithCopy label="🏷️ Tags" value={task.tags?.join(", ")} />

//         {task.attachments && task.attachments.length > 0 && (
//           <div>
//             <strong>📎 Attachments:</strong>
//             <ul className="list-disc ml-6 space-y-2">
//               {task.attachments.map((url, i) => {
//                 const label = getLabelFromUrl(url);
//                 const isPdf = url.toLowerCase().endsWith(".pdf");
//                 const isImage = /\.(jpe?g|png|webp)$/i.test(url);

//                 return (
//                   <li key={i} className="space-x-4">
//                     {(isPdf || isImage) && (
//                       <button
//                         onClick={() => setPreviewUrl(url)}
//                         className="text-purple-700 underline hover:text-purple-900"
//                       >
//                         👁️ Preview
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleDownload(url)}
//                       className="text-green-600 underline hover:text-green-800"
//                     >
//                       ⬇️ {label}
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         )}

//         <FieldWithCopy label="⏰ Created On" value={task.createdAt ? new Date(task.createdAt).toLocaleString() : null} />

//         {(displayAssignerName !== "—" || displayAssigneeName !== "—") && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
//             className="mt-3 border-t pt-2 text-gray-600 text-sm flex justify-between items-start gap-4"
//           >
//             {displayAssignerName !== "—" && (
//               <div title={displayAssignerEmail}>
//                 <p className="text-xs uppercase text-gray-400 tracking-wider">Created By</p>
//                 <p className="font-medium text-gray-700">🧑‍💼 {displayAssignerName}</p>
//               </div>
//             )}
//             {displayAssigneeName !== "—" && (
//               <div title={displayAssigneeEmail}>
//                 <p className="text-xs uppercase text-gray-400 tracking-wider">Assigned To</p>
//                 <p className="font-medium text-gray-700">🙋 {displayAssigneeName}</p>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {isAdmin && (
//           <div className="pt-4">
//             <button
//               onClick={() => {
//                 if (task.id && onDelete) {
//                   toast((t) => (
//                     <div className="flex flex-col">
//                       <span>Are you sure you want to delete this task?</span>
//                       <div className="flex justify-end gap-2 mt-2">
//                         <button
//                           onClick={() => {
//                             onDelete(task.id);
//                             toast.dismiss(t.id);
//                           }}
//                           className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
//                         >
//                           Delete
//                         </button>
//                         <button
//                           onClick={() => toast.dismiss(t.id)}
//                           className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ), { duration: Infinity, style: { background: '#fff', color: '#333' } });
//                 } else {
//                   toast.error("Cannot delete. Task ID missing.");
//                 }
//               }}
//               className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
//             >
//               🗑️ Delete Task
//             </button>
//           </div>
//         )}
//       </>

//       {previewUrl && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white max-w-3xl w-full p-4 rounded shadow-lg relative">
//             <button
//               onClick={() => setPreviewUrl(null)}
//               className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
//             >
//               <FaTimes size={20} />
//             </button>
//             <div className="overflow-auto max-h-[80vh]">
//               {previewUrl.toLowerCase().endsWith(".pdf") ? (
//                 <iframe
//                   src={`https://docs.google.com/gview?url=${encodeURIComponent(
//                     previewUrl
//                   )}&embedded=true`}
//                   className="w-full h-[70vh] border rounded"
//                   title="PDF Preview"
//                 />
//               ) : (
//                 <Image
//                   src={previewUrl}
//                   alt="Attachment Preview"
//                   width={800}
//                   height={600}
//                   className="max-w-full max-h-[70vh] object-contain mx-auto"
//                   unoptimized
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showNotesModal && (
//         <NotesModal
//           taskId={task.id}
//           initialNotes={task.notes}
//           onClose={(updatedNotes?: Note[]) => {
//             if (updatedNotes !== undefined && onUpdateTask) {
//               onUpdateTask(task.id, { notes: updatedNotes });
//             }
//             setShowNotesModal(false);
//           }}
//         />
//       )}

//       {/* Reassign Task Modal */}
//       {showReassignModal && (
//         <ReassignTaskModal
//           taskId={task.id}
//           currentAssigneeIds={task.assigneeIds || []} // Pass current assignees
//           onClose={() => setShowReassignModal(false)}
//           onReassign={handleReassignTask} // Use the centralized handler
//         />
//       )}
//     </div>
//   );
// }

// // // components/TaskDetailsCard.tsx






































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
import { FaHandHoldingUsd, FaCommentsDollar } from "react-icons/fa";

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
const FieldWithCopy = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
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

  const handleReassignTask = (taskId: string, newAssigneeIds: string[]) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { assigneeIds: newAssigneeIds });
      toast.success("Task reassigned successfully!");
    } else {
      toast.error("Reassign functionality not available.");
    }
    setShowReassignModal(false);
  };

  return (
    <div className="text-sm text-gray-700 space-y-2">
      <div className="flex items-center justify-between">
        {showTitle && <h3 className="text-lg font-semibold text-purple-800">{task.title}</h3>}
        {/* Updated Icon Bar */}
        <div className="flex items-center gap-3">
          {/* Left Group - Task Management */}
          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full shadow-sm">
            <AnimatedIconButton onClick={() => setShowReassignModal(true)} title="Reassign Task">
              <FaUserEdit />
            </AnimatedIconButton>
            <CloneTaskButton taskId={task.id} onCloned={() => onUpdateTask?.(task.id, {})} />

            {/* Payment Recovery Chase Button */}
            {(task.amount !== undefined && task.amount > 0) && (
              <AnimatedIconButton
                onClick={() => setShowRecoveryModal(true)}
                title="Update Collection Status"
              >
                <FaHandHoldingUsd className="text-indigo-600" />
              </AnimatedIconButton>
            )}
          </div>

          {/* Right Group - Notes / Copy / Pin */}
          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full shadow-sm">
            <div className="relative">
              <AnimatedIconButton onClick={() => setShowNotesModal(true)} title="Add/View Notes">
                📝
              </AnimatedIconButton>
              {notesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notesCount}
                </span>
              )}
            </div>
            <AnimatedIconButton onClick={copyAllFields} title="Copy All">
              <FaRegClipboard />
            </AnimatedIconButton>
            {onFloatRequest && (
              <AnimatedIconButton onClick={() => onFloatRequest(task)} title="Pin Task">
                <PiPushPinSimpleFill />
              </AnimatedIconButton>
            )}
          </div>
        </div>
      </div>

      <>
        <FieldWithCopy label="📝 Description" value={task.description} />
        <FieldWithCopy label="🏪 Shop Name" value={cf.shopName} />
        <FieldWithCopy label="🏷️ Outlet Name" value={cf.outletName} />
        <FieldWithCopy label="📞 Phone" value={cf.phone} />
        <FieldWithCopy label="📧 Email" value={cf.email} />
        <FieldWithCopy label="👤 Customer Name" value={cf.customerName} />
        <FieldWithCopy label="💰 Package Amount" value={cf.packageAmount} />
        <FieldWithCopy label="🗓️ Start Date" value={cf.startDate} />
        <FieldWithCopy label="📅 End Date" value={cf.endDate} />
        <FieldWithCopy label="⏱️ Timeline" value={cf.timeline} />

        {cf.location && (
          <div className="flex items-center gap-1">
            <p className="mb-0">
              <strong>📍 Address:</strong>{" "}
              {isValidUrl(String(cf.location)) ? (
                <a
                  href={String(cf.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  📍 View on Map
                </a>
              ) : (
                String(cf.location)
              )}
            </p>
            <CopyIcon text={String(cf.location)} />
          </div>
        )}

        <FieldWithCopy label="🏦 Account No." value={cf.accountNumber} />
        <FieldWithCopy label="🔢 IFSC Code" value={cf.ifscCode} />
        <FieldWithCopy label="🏷️ Tags" value={task.tags?.join(", ")} />

        {task.attachments && task.attachments.length > 0 && (
          <div>
            <strong>📎 Attachments:</strong>
            <ul className="list-disc ml-6 space-y-2">
              {task.attachments.map((url, i) => {
                const label = getLabelFromUrl(url);
                const isPdf = url.toLowerCase().endsWith(".pdf");
                const isImage = /\.(jpe?g|png|webp)$/i.test(url);

                return (
                  <li key={i} className="space-x-4">
                    {(isPdf || isImage) && (
                      <button
                        onClick={() => setPreviewUrl(url)}
                        className="text-purple-700 underline hover:text-purple-900"
                      >
                        👁️ Preview
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(url)}
                      className="text-green-600 underline hover:text-green-800"
                    >
                      ⬇️ {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <FieldWithCopy label="⏰ Created On" value={task.createdAt ? new Date(task.createdAt).toLocaleString() : null} />

        {(displayAssignerName !== "—" || displayAssigneeName !== "—") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-3 border-t pt-2 text-gray-600 text-sm flex justify-between items-start gap-4"
          >
            {displayAssignerName !== "—" && (
              <div title={displayAssignerEmail}>
                <p className="text-xs uppercase text-gray-400 tracking-wider">Created By</p>
                <p className="font-medium text-gray-700">🧑‍💼 {displayAssignerName}</p>
              </div>
            )}
            {displayAssigneeName !== "—" && (
              <div title={displayAssigneeEmail}>
                <p className="text-xs uppercase text-gray-400 tracking-wider">Assigned To</p>
                <p className="font-medium text-gray-700">🙋 {displayAssigneeName}</p>
              </div>
            )}
          </motion.div>
        )}

        {isAdmin && (
          <div className="pt-4">
            <button
              onClick={() => {
                if (task.id && onDelete) {
                  toast((t) => (
                    <div className="flex flex-col">
                      <span>Are you sure you want to delete this task?</span>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            onDelete(task.id);
                            toast.dismiss(t.id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => toast.dismiss(t.id)}
                          className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ), { duration: Infinity, style: { background: '#fff', color: '#333' } });
                } else {
                  toast.error("Cannot delete. Task ID missing.");
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              🗑️ Delete Task
            </button>
          </div>
        )}
      </>

      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full p-4 rounded shadow-lg relative">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <FaTimes size={20} />
            </button>
            <div className="overflow-auto max-h-[80vh]">
              {previewUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                    previewUrl
                  )}&embedded=true`}
                  className="w-full h-[70vh] border rounded"
                  title="PDF Preview"
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Attachment Preview"
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                  unoptimized
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showNotesModal && (
        <NotesModal
          taskId={task.id}
          initialNotes={task.notes}
          onClose={(updatedNotes?: Note[]) => {
            if (updatedNotes !== undefined && onUpdateTask) {
              onUpdateTask(task.id, { notes: updatedNotes });
            }
            setShowNotesModal(false);
          }}
        />
      )}

      {showReassignModal && (
        <ReassignTaskModal
          taskId={task.id}
          currentAssigneeIds={task.assigneeIds || []}
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
    </div>
  );
}

































// // components/TaskDetailsCard.tsx
// "use client";

// import React, { useState } from "react";
// import { FaRegClipboard, FaTimes, FaUserEdit } from "react-icons/fa";
// import toast from "react-hot-toast";
// import type { Task } from "../../types/task";
// import { Note } from "../../../types/note";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import NotesModal from "./NotesModal";
// import { PiPushPinSimpleFill } from "react-icons/pi";
// import ReassignTaskModal from "./ReassignTaskModal";
// import CloneTaskButton from "./CloneTaskButton";

// interface Props {
//   task: Task;
//   isAdmin?: boolean;
//   onDelete?: (taskId: string) => void;
//   onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
//   onFloatRequest?: (task: Task) => void;
// }

// // --- Utility Functions ---
// const getLabelFromUrl = (url: string): string => {
//   const fileName = url.split("/").pop()?.toLowerCase() || "";
//   if (fileName.includes("aadhaar")) return "🆔 Aadhaar Card";
//   if (fileName.includes("pan")) return "💳 PAN Card";
//   if (fileName.includes("selfie")) return "🤳 Selfie Photo";
//   if (fileName.endsWith(".pdf")) return "📄 PDF Document";
//   if (fileName.includes("license")) return "🍔 Food License";
//   if (fileName.includes("menu")) return "📄 Menu Card";
//   return "📎 Attachment";
// };

// const isValidUrl = (str: string): boolean => {
//   try {
//     new URL(str);
//     return true;
//   } catch {
//     return false;
//   }
// };

// const getDownloadUrl = (url: string): string =>
//   url.includes("/upload/") ? url.replace("/upload/", "/upload/fl_attachment/") : url;

// // --- Components ---

// // Animated Copy Icon component
// const CopyIcon = ({ text }: { text: string }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     const textarea = document.createElement("textarea");
//     textarea.value = text;
//     document.body.appendChild(textarea);
//     textarea.select();
//     document.execCommand("copy");
//     document.body.removeChild(textarea);

//     setCopied(true);
//     toast.success("Copied!");
//     setTimeout(() => setCopied(false), 1500);
//   };

//   return (
//     <div className="relative inline-block ml-2">
//       <motion.div
//         onClick={handleCopy}
//         className="text-gray-500 cursor-pointer hover:text-purple-600"
//         title="Copy"
//         whileTap={{ scale: 0.9 }}
//         animate={copied ? { rotate: [0, 10, -10, 0], scale: [1, 1.4, 1] } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <FaRegClipboard />
//       </motion.div>

//       <AnimatePresence>
//         {copied && (
//           <motion.div
//             className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow"
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: -10 }}
//             exit={{ opacity: 0, y: -5 }}
//             transition={{ duration: 0.3 }}
//           >
//             Copied!
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Updated Animated Icon Button for better UI
// const AnimatedIconButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
//   <motion.button
//     onClick={onClick}
//     title={title}
//     className="p-2 rounded-full hover:bg-purple-100 text-purple-600 transition-colors"
//     whileHover={{ scale: 1.15 }}
//     whileTap={{ scale: 0.9 }}
//   >
//     {children}
//   </motion.button>
// );

// // New reusable component for displaying a field with a copy icon
// const FieldWithCopy = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
//   if (value === null || value === undefined || value === "") return null;
//   const stringValue = String(value);

//   return (
//     <div className="flex items-center gap-1">
//       <p className="mb-0">
//         <strong>{label}:</strong> {stringValue}
//       </p>
//       <CopyIcon text={stringValue} />
//     </div>
//   );
// };

// // --- TaskDetailsCard Component ---
// export default function TaskDetailsCard({ task, isAdmin = false, onDelete, onUpdateTask, onFloatRequest }: Props) {
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [showNotesModal, setShowNotesModal] = useState(false);
//   const [showReassignModal, setShowReassignModal] = useState(false);

//   const cf = task.customFields || {};
//   const showTitle = task.title !== cf.shopName && task.title !== cf.outletName;

//   const displayAssignerName = task.assigner?.name || task.assignerName || "—";
//   const displayAssignerEmail = task.assigner?.email || task.assignerEmail || "";
//   const displayAssigneeName = task.assignees?.map(a => a?.name || a?.email).filter(Boolean).join(", ") || task.assignee?.name || "—";
//   const displayAssigneeEmail = task.assignee?.email || task.assigneeEmail || "";

//   const allValues = [
//     task.title,
//     task.description,
//     cf.shopName,
//     cf.outletName,
//     cf.phone,
//     cf.email,
//     cf.location,
//     cf.accountNumber,
//     cf.ifscCode,
//     cf.customerName,
//     cf.restId,
//     cf.packageAmount,
//     cf.startDate,
//     cf.endDate,
//     cf.timeline,
//     task.aadhaarUrl,
//     task.panUrl,
//     task.selfieUrl,
//     task.chequeUrl,
//     ...(task.menuCardUrls ?? []),
//     task.priority,
//     task.tags?.join(", "),
//     displayAssignerName,
//     displayAssignerEmail,
//     displayAssigneeName,
//     displayAssigneeEmail,
//     ...(cf ? Object.entries(cf).map(([key, value]) => `${key}: ${value}`) : []),
//   ].filter(Boolean).join("\n");

//   const copyAllFields = () => {
//     const textarea = document.createElement('textarea');
//     textarea.value = allValues;
//     document.body.appendChild(textarea);
//     textarea.select();
//     document.execCommand('copy');
//     document.body.removeChild(textarea);
//     toast.success("All details copied!");
//   };

//   const handleDownload = (url: string) => {
//     const downloadUrl = getDownloadUrl(url);
//     const link = document.createElement("a");
//     link.href = downloadUrl;
//     link.setAttribute("download", "");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const notesCount = task.notes?.length || 0;

//   const handleReassignTask = (taskId: string, newAssigneeIds: string[]) => {
//     if (onUpdateTask) {
//       onUpdateTask(taskId, { assigneeIds: newAssigneeIds });
//       toast.success("Task reassigned successfully!");
//     } else {
//       toast.error("Reassign functionality not available.");
//     }
//     setShowReassignModal(false);
//   };

//   return (
//     <div className="text-sm text-gray-700 space-y-2">
//       <div className="flex items-center justify-between">
//         {showTitle && <h3 className="text-lg font-semibold text-purple-800">{task.title}</h3>}
//         {/* Top Icon Bar */}
//         <div className="flex items-center gap-3">
//           {/* Top Right Group - Notes / Copy / Pin */}
//           <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full shadow-sm">
//             <div className="relative">
//               <AnimatedIconButton onClick={() => setShowNotesModal(true)} title="Add/View Notes">
//                 📝
//               </AnimatedIconButton>
//               {notesCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//                   {notesCount}
//                 </span>
//               )}
//             </div>
//             <AnimatedIconButton onClick={copyAllFields} title="Copy All">
//               <FaRegClipboard />
//             </AnimatedIconButton>
//             {onFloatRequest && (
//               <AnimatedIconButton onClick={() => onFloatRequest(task)} title="Pin Task">
//                 <PiPushPinSimpleFill />
//               </AnimatedIconButton>
//             )}
//           </div>
//         </div>
//       </div>

//       <>
//         <FieldWithCopy label="📝 Description" value={task.description} />
//         <FieldWithCopy label="🏪 Shop Name" value={cf.shopName} />
//         <FieldWithCopy label="🏷️ Outlet Name" value={cf.outletName} />
//         <FieldWithCopy label="📞 Phone" value={cf.phone} />
//         <FieldWithCopy label="📧 Email" value={cf.email} />
//         <FieldWithCopy label="👤 Customer Name" value={cf.customerName} />
//         <FieldWithCopy label="💰 Package Amount" value={cf.packageAmount} />
//         <FieldWithCopy label="🗓️ Start Date" value={cf.startDate} />
//         <FieldWithCopy label="📅 End Date" value={cf.endDate} />
//         <FieldWithCopy label="⏱️ Timeline" value={cf.timeline} />

//         {cf.location && (
//           <div className="flex items-center gap-1">
//             <p className="mb-0">
//               <strong>📍 Address:</strong>{" "}
//               {isValidUrl(String(cf.location)) ? (
//                 <a
//                   href={String(cf.location)}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-block px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
//                 >
//                   📍 View on Map
//                 </a>
//               ) : (
//                 String(cf.location)
//               )}
//             </p>
//             <CopyIcon text={String(cf.location)} />
//           </div>
//         )}

//         <FieldWithCopy label="🏦 Account No." value={cf.accountNumber} />
//         <FieldWithCopy label="🔢 IFSC Code" value={cf.ifscCode} />
//         <FieldWithCopy label="🏷️ Tags" value={task.tags?.join(", ")} />

//         {task.attachments && task.attachments.length > 0 && (
//           <div>
//             <strong>📎 Attachments:</strong>
//             <ul className="list-disc ml-6 space-y-2">
//               {task.attachments.map((url, i) => {
//                 const label = getLabelFromUrl(url);
//                 const isPdf = url.toLowerCase().endsWith(".pdf");
//                 const isImage = /\.(jpe?g|png|webp)$/i.test(url);

//                 return (
//                   <li key={i} className="space-x-4">
//                     {(isPdf || isImage) && (
//                       <button
//                         onClick={() => setPreviewUrl(url)}
//                         className="text-purple-700 underline hover:text-purple-900"
//                       >
//                         👁️ Preview
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleDownload(url)}
//                       className="text-green-600 underline hover:text-green-800"
//                     >
//                       ⬇️ {label}
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         )}

//         <FieldWithCopy label="⏰ Created On" value={task.createdAt ? new Date(task.createdAt).toLocaleString() : null} />

//         {(displayAssignerName !== "—" || displayAssigneeName !== "—") && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
//             className="mt-3 border-t pt-2 text-gray-600 text-sm flex justify-between items-start gap-4"
//           >
//             {displayAssignerName !== "—" && (
//               <div title={displayAssignerEmail}>
//                 <p className="text-xs uppercase text-gray-400 tracking-wider">Created By</p>
//                 <p className="font-medium text-gray-700">🧑‍💼 {displayAssignerName}</p>
//               </div>
//             )}
//             {displayAssigneeName !== "—" && (
//               <div title={displayAssigneeEmail}>
//                 <p className="text-xs uppercase text-gray-400 tracking-wider">Assigned To</p>
//                 <p className="font-medium text-gray-700">🙋 {displayAssigneeName}</p>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {isAdmin && (
//           <div className="pt-4">
//             <button
//               onClick={() => {
//                 if (task.id && onDelete) {
//                   toast((t) => (
//                     <div className="flex flex-col">
//                       <span>Are you sure you want to delete this task?</span>
//                       <div className="flex justify-end gap-2 mt-2">
//                         <button
//                           onClick={() => {
//                             onDelete(task.id);
//                             toast.dismiss(t.id);
//                           }}
//                           className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
//                         >
//                           Delete
//                         </button>
//                         <button
//                           onClick={() => toast.dismiss(t.id)}
//                           className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ), { duration: Infinity, style: { background: '#fff', color: '#333' } });
//                 } else {
//                   toast.error("Cannot delete. Task ID missing.");
//                 }
//               }}
//               className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
//             >
//               🗑️ Delete Task
//             </button>
//           </div>
//         )}
//       </>

//       {/* Moved "Clone" and "Reassign" to a new icon bar at the bottom */}
//       <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
//         <AnimatedIconButton onClick={() => setShowReassignModal(true)} title="Reassign Task">
//           <FaUserEdit />
//         </AnimatedIconButton>
//         <CloneTaskButton taskId={task.id} onCloned={() => onUpdateTask?.(task.id, {})} />
//       </div>


//       {previewUrl && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white max-w-3xl w-full p-4 rounded shadow-lg relative">
//             <button
//               onClick={() => setPreviewUrl(null)}
//               className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
//             >
//               <FaTimes size={20} />
//             </button>
//             <div className="overflow-auto max-h-[80vh]">
//               {previewUrl.toLowerCase().endsWith(".pdf") ? (
//                 <iframe
//                   src={`https://docs.google.com/gview?url=${encodeURIComponent(
//                     previewUrl
//                   )}&embedded=true`}
//                   className="w-full h-[70vh] border rounded"
//                   title="PDF Preview"
//                 />
//               ) : (
//                 <Image
//                   src={previewUrl}
//                   alt="Attachment Preview"
//                   width={800}
//                   height={600}
//                   className="max-w-full max-h-[70vh] object-contain mx-auto"
//                   unoptimized
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showNotesModal && (
//         <NotesModal
//           taskId={task.id}
//           initialNotes={task.notes}
//           onClose={(updatedNotes?: Note[]) => {
//             if (updatedNotes !== undefined && onUpdateTask) {
//               onUpdateTask(task.id, { notes: updatedNotes });
//             }
//             setShowNotesModal(false);
//           }}
//         />
//       )}

//       {showReassignModal && (
//         <ReassignTaskModal
//           taskId={task.id}
//           currentAssigneeIds={task.assigneeIds || []}
//           onClose={() => setShowReassignModal(false)}
//           onReassign={handleReassignTask}
//         />
//       )}
//     </div>
//   );
// }






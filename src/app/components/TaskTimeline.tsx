// // "use client";

// // import React, { useEffect, useState, useCallback, useMemo } from "react";
// // import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// // import Image from "next/image";
// // import * as Dialog from "@radix-ui/react-dialog";
// // import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// // import { useUser } from "@clerk/nextjs";
// // import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";

// // interface Subtask {
// //   id: string;
// //   title: string;
// //   completed: boolean;
// // }useState}/subtasks`, {
// //       method: "POST",
// //       body: JSON.stringify({ title: newSubtask }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewSubtask("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addNote = async () => {
// //     if (!selectedTask || newNote.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/notes`, {
// //       method: "POST",
// //       body: JSON.stringify({
// //         content: newNote,
// //         authorName: user?.fullName || "Anonymous",
// //         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
// //         createdAt: new Date().toISOString(),
// //       }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewNote("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };


// //   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new file...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "PATCH",
// //         body: JSON.stringify({ oldUrl, newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File replaced!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 2000);
// //     } catch (err) {
// //       console.error("Error reuploading attachment:", err);
// //       setUploadStatus("❌ An error occurred during reupload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleNewAttachmentUpload = async (file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new attachment...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "POST",
// //         body: JSON.stringify({ url: newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ New file uploaded successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     } catch (err) {
// //       console.error("Error uploading new attachment:", err);
// //       setUploadStatus("❌ An error occurred during new upload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleDeleteAttachment = useCallback((url: string) => {
// //     if (!selectedTask) return;
// //     setAttachmentToDeleteUrl(url);
// //     setShowConfirmDeleteModal(true);
// //   }, [selectedTask]);

// //   const confirmDeleteAttachment = async () => {
// //     if (!selectedTask || !attachmentToDeleteUrl) return;

// //     setShowConfirmDeleteModal(false);
// //     setUploadStatus("Deleting file...");

// //     try {
// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "DELETE",
// //         body: JSON.stringify({ url: attachmentToDeleteUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const text = await res.text();
// //       let data = null;
// //       try {
// //         data = text ? JSON.parse(text) : {};
// //       } catch (e) {
// //         console.error("Invalid JSON response", e);
// //         setUploadStatus("❌ Invalid server response");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File deleted successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //     } catch (err) {
// //       console.error("Error deleting attachment:", err);
// //       setUploadStatus("❌ Error deleting attachment");
// //     } finally {
// //       setAttachmentToDeleteUrl(null);
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handlePaymentSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     try {
// //       const form = e.target as HTMLFormElement;
// //       const fileInput = form.paymentFile as HTMLInputElement;
// //       const file = fileInput?.files?.[0];

// //       const formData = new FormData();
// //       formData.append("amount", amount);
// //       formData.append("received", received);
// //       if (file) {
// //         formData.append("file", file);
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask?.id}/payments`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       if (!res.ok) {
// //         const err = await res.json();
// //         console.error("❌ Payment update failed:", err);
// //         // toast.error("Failed to update payment."); // Optional toast
// //         setPaymentUploadStatus("Failed to update payment.");
// //         return;
// //       }

// //       // toast.success("✅ Payment updated successfully!"); // Optional toast
// //       setPaymentUploadStatus("Payment updated successfully!");

// //       await fetchTasks(currentPage, tasksPerPage); // Re-fetch all tasks
// //       await updateSelectedTaskFromFetched(); // Update the selected task specifically

// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //     } catch (err) {
// //       console.error("❌ Upload failed:", err);
// //       // toast.error("An error occurred while updating payment."); // Optional toast
// //       setPaymentUploadStatus("An error occurred while updating payment.");
// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //     }
// //   };


// //   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     const newLimit = parseInt(e.target.value, 10);
// //     setTasksPerPage(newLimit);
// //     setCurrentPage(1);
// //   };

// //   const handlePageChange = (pageNumber: number) => {
// //     setCurrentPage(pageNumber);
// //   };

// //   const pageNumbers = useMemo(() => {
// //     const pages = [];
// //     const maxPagesToShow = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
// //     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

// //     if (endPage - startPage + 1 < maxPagesToShow) {
// //       startPage = Math.max(1, endPage - maxPagesToShow + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }
// //     return pages;
// //   }, [totalPages, currentPage]);


// //   return (
// //     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
// //       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //         <div className="flex items-center gap-3">
// //           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
// //           {allAssignees.map((id) => (
// //             <Image
// //               key={id}
// //               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //               alt={assigneeMap[id]?.name || "Assignee Avatar"}
// //               width={32}
// //               height={32}
// //               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
// //                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
// //               }`}
// //               onClick={() =>
// //                 setSelectedAvatar((prev) => (prev === id ? null : id))
// //               }
// //               title={assigneeMap[id]?.name || id}
// //             />
// //           ))}
// //         </div>

// //         <input
// //           type="text"
// //           placeholder="Search tasks..."
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
// //         />

// //         <div className="flex items-center gap-2">
// //           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
// //           <select
// //             id="tasksPerPage"
// //             value={tasksPerPage}
// //             onChange={handleTasksPerPageChange}
// //             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
// //           >
// //             <option value={5}>5</option>
// //             <option value={10}>10</option>
// //             <option value={15}>15</option>
// //             <option value={20}>20</option>
// //             <option value={50}>50</option>
// //           </select>
// //         </div>

// //         <div className="flex items-center gap-2">
// //           <label className="text-sm text-gray-500">Zoom:</label>
// //           <input
// //             type="range"
// //             min={20}
// //             max={100}
// //             value={zoom}
// //             onChange={(e) => setZoom(Number(e.target.value))}
// //             className="w-24"
// //           />
// //         </div>
// //       </div>

// //       ---

// //       <table className="min-w-full border-collapse border border-gray-200">
// //         <thead>
// //           <tr className="bg-gray-100">
// //             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
// //             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
// //             {Array.from({ length: totalDays }).map((_, i) => {
// //               const current = addDays(startDate, i);
// //               const isTodayColumn = isToday(current);
// //               return (
// //                 <th
// //                   key={i}
// //                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
// //                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
// //                   }`}
// //                   style={{ minWidth: `${zoom}px` }}
// //                 >
// //                   {format(current, "dd")}
// //                 </th>
// //               );
// //             })}
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredTasks.length === 0 ? (
// //             <tr>
// //               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
// //                 No tasks found with current filters or on this page.
// //               </td>
// //             </tr>
// //           ) : (
// //             filteredTasks.map((task, index) => {
// //               const startOffset = Math.max(
// //                 0,
// //                 differenceInCalendarDays(new Date(task.start), startDate)
// //               );
// //               const duration =
// //                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

// //               return (
// //                 <tr key={task.id} className="h-12 border-b border-gray-200">
// //                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
// //                     {(currentPage - 1) * tasksPerPage + index + 1}
// //                   </td>
// //                   <td
// //                     onClick={() => handleTaskClick(task)}
// //                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
// //                   >
// //                     <div className="font-semibold text-[13px] text-gray-800 truncate">
// //                       📁 {task.name}
// //                     </div>
// //                     <div className="text-[11px] text-gray-500 truncate">
// //                       🏪 {task.shop} / 👤 {task.customer}
// //                     </div>
// //                   </td>
// //                   {Array.from({ length: totalDays }).map((_, i) => {
// //                     const isBar = i >= startOffset && i < startOffset + duration;
// //                     const bgColor =
// //                       task.progress === 100
// //                         ? "bg-green-500"
// //                         : task.progress > 0
// //                         ? "bg-blue-500"
// //                         : "bg-gray-300";

// //                     return (
// //                       <td
// //                         key={i}
// //                         onClick={() => handleTaskClick(task)}
// //                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
// //                       >
// //                         {isBar && (
// //                           <div
// //                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
// //                             style={{ width: `${task.progress}%` }}
// //                           >
// //                             {task.progress}%
// //                           </div>
// //                         )}
// //                       </td>
// //                     );
// //                   })}
// //                 </tr>
// //               );
// //             })
// //           )}
// //         </tbody>
// //       </table>

// //       ---

// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
// //           <button
// //             onClick={() => handlePageChange(currentPage - 1)}
// //             disabled={currentPage === 1}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Previous
// //           </button>
// //           <div className="flex gap-1">
// //             {pageNumbers.map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
// //                   currentPage === page
// //                     ? "bg-blue-600 text-white shadow-sm"
// //                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
// //                 } transition-all`}
// //               >
// //                 {page}
// //               </button>
// //             ))}
// //           </div>
// //           <button
// //             onClick={() => handlePageChange(currentPage + 1)}
// //             disabled={currentPage === totalPages}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Next
// //           </button>
// //         </div>
// //       )}

// //       ---

// //       <Dialog.Root
// //         open={isPanelOpen}
// //         onOpenChange={(open) => {
// //           setIsPanelOpen(open);
// //           if (!open) {
// //             setSelectedTask(null);
// //             setSelectedTaskId(null);
// //           }
// //         }}
// //       >
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
// //           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
// //             {selectedTask && (
// //               <div className="space-y-6">
// //                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
// //                   <Dialog.Title className="text-2xl font-bold text-gray-900 leading-tight">
// //                     {selectedTask.name}
// //                   </Dialog.Title>
// //                   <Dialog.Close asChild>
// //                     <button
// //                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                       aria-label="Close"
// //                     >
// //                       <FaPlus className="rotate-45" />
// //                     </button>
// //                   </Dialog.Close>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
// //                   <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
// //                     <div className="col-span-2">
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.name}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
// //                       <p className="text-gray-800 mt-1">
// //                         {format(parseISO(selectedTask.start), "MMM dd, yyyy")}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
// //                       <p className="text-gray-800 mt-1">
// //                         {format(parseISO(selectedTask.end), "MMM dd, yyyy")}
// //                       </p>
// //                     </div>
// //                     <div className="col-span-2">
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
// //                       <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
// //                         <div
// //                           className="bg-blue-600 h-2.5 rounded-full"
// //                           style={{ width: `${selectedTask.progress}%` }}
// //                         ></div>
// //                       </div>
// //                       <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
// //                   <div className="flex flex-wrap gap-2">
// //                     {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
// //                       selectedTask.assigneeIds.map((id) => (
// //                         <Image
// //                           key={id}
// //                           src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //                           alt={assigneeMap[id]?.name || "Assignee"}
// //                           width={36}
// //                           height={36}
// //                           className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
// //                           title={assigneeMap[id]?.name || id}
// //                         />
// //                       ))
// //                     ) : (
// //                       <p className="text-gray-500 text-sm">No assignees.</p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
// //                   <div className="space-y-3">
// //                     {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
// //                     {selectedTask.subtasks?.map((s) => (
// //                       <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
// //                         <input
// //                           type="checkbox"
// //                           checked={s.completed}
// //                           onChange={() => toggleSubtask(selectedTask.id, s.id)}
// //                           className="hidden"
// //                         />
// //                         {s.completed ? (
// //                           <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
// //                         ) : (
// //                           <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
// //                         )}
// //                         <span className={`${s.completed ? "line-through text-gray-400" : ""}`}>{s.title}</span>
// //                       </label>
// //                     ))}
// //                   </div>

// //                   <div className="flex mt-4 pt-4 border-t border-gray-200">
// //                     <input
// //                       type="text"
// //                       value={newSubtask}
// //                       onChange={(e) => setNewSubtask(e.target.value)}
// //                       placeholder="Add a new subtask..."
// //                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// //                     />
// //                     <button
// //                       onClick={addSubtask}
// //                       className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition"
// //                     >
// //                       <FaPlus className="inline-block mr-1 text-xs" /> Add
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
// //                   <div className="grid grid-cols-2 gap-3">
// //                     {selectedTask.attachments?.length === 0 && (
// //                       <p className="text-gray-500 text-sm col-span-2">No attachments.</p>
// //                     )}
// //                     {selectedTask.attachments?.map((url, i) => (
// //                       <AttachmentItem
// //                         key={url}
// //                         url={url}
// //                         index={i}
// //                         onReupload={handleReuploadAttachment}
// //                         onDelete={handleDeleteAttachment}
// //                       />
// //                     ))}
// //                   </div>

// //                   <label className="block mt-4 text-sm text-gray-700 cursor-pointer">
// //                     <span className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md font-medium text-blue-700 hover:bg-blue-100 transition-colors">
// //                       <FaPlus className="mr-2" /> Attach File
// //                     </span>
// //                     <input
// //                       type="file"
// //                       className="hidden"
// //                       onChange={async (e) => {
// //                         const file = e.target.files?.[0];
// //                         if (file) {
// //                           await handleNewAttachmentUpload(file);
// //                           e.target.value = '';
// //                         }
// //                       }}
// //                     />
// //                   </label>
// //                   {uploadStatus && <p className="text-xs mt-2 text-gray-600">{uploadStatus}</p>}
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Payment Details</h3>
// //                   <form onSubmit={handlePaymentSubmit} className="space-y-4">
// //                     <div>
// //                       <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Task Amount</label>
// //                       <input
// //                         type="number"
// //                         id="amount"
// //                         name="amount"
// //                         step="0.01"
// //                         value={amount}
// //                         onChange={(e) => setAmount(e.target.value)}
// //                         className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
// //                         placeholder="e.g., 100.00"
// //                       />
// //                     </div>

// //                     <div>
// //                       <label htmlFor="received" className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
// //                       <input
// //                         type="number"
// //                         id="received"
// //                         name="received"
// //                         step="0.01"
// //                         value={received}
// //                         onChange={(e) => setReceived(e.target.value)}
// //                         className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
// //                         placeholder="e.g., 50.00"
// //                       />
// //                     </div>

// //                     <div>
// //                       <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700 mb-1">Payment Proof (Image/PDF)</label>
// //                       <input
// //                         type="file"
// //                         id="paymentFile"
// //                         name="file"
// //                         accept="image/*,application/pdf"
// //                         className="w-full border border-gray-300 rounded-md p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
// //                       />
// //                       {paymentUploadStatus && <p className="text-xs mt-2 text-gray-600">{paymentUploadStatus}</p>}
// //                     </div>

// //                     <button
// //                       type="submit"
// //                       className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition"
// //                     >
// //                       Update Payment Details
// //                     </button>
// //                   </form>

// //                   {selectedTask.paymentProofs && selectedTask.paymentProofs.length > 0 && (
// //                     <div className="mt-6 pt-4 border-t border-gray-200">
// //                       <h4 className="text-md font-semibold text-gray-800 mb-3">Uploaded Proofs</h4>
// //                       <div className="grid grid-cols-2 gap-3">
// //                         {selectedTask.paymentProofs.map((url, i) => (
// //                           <a href={url} key={i} target="_blank" rel="noopener noreferrer" className="block group">
// //                             {isImageUrl(url) ? (
// //                               <img
// //                                 src={url}
// //                                 alt={`Payment Proof ${i + 1}`}
// //                                 className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:opacity-80 transition"
// //                               />
// //                             ) : (
// //                               <div className="p-4 bg-gray-100 rounded-lg shadow-sm text-sm text-blue-600 flex flex-col items-center justify-center h-32">
// //                                 <FaFilePdf className="text-4xl text-red-500 mb-2" />
// //                                 <span className="truncate w-full text-center">{url.substring(url.lastIndexOf('/') + 1)}</span>
// //                               </div>
// //                             )}
// //                           </a>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}
// //                   {selectedTask.paymentProofs?.length === 0 && !selectedTask.amount && !selectedTask.received && (
// //                     <p className="text-gray-500 text-sm mt-4">No payment details or proofs added yet.</p>
// //                   )}
// //                 </div>


// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity</h3>

// //                   <div className="mb-6 border-b border-gray-200 pb-6">
// //                     <div className="flex items-start space-x-3 mb-3">
// //                       <Image
// //                         src={user?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || user?.id || "anonymous")}`}
// //                         alt="User Avatar"
// //                         width={40}
// //                         height={40}
// //                         className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
// //                       />
// //                       <textarea
// //                         value={newNote}
// //                         onChange={(e) => setNewNote(e.target.value)}
// //                         placeholder="Add a comment..."
// //                         rows={3}
// //                         className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
// //                       ></textarea>
// //                     </div>
// //                     <div className="flex justify-end">
// //                       <button
// //                         onClick={addNote}
// //                         disabled={newNote.trim() === ""}
// //                         className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
// //                       >
// //                         Post Comment
// //                       </button>
// //                     </div>
// //                   </div>

// //                   <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
// //                     {selectedTask.notes && selectedTask.notes.length > 0 ? (
// //                       [...selectedTask.notes].sort((a, b) => {
// //                         if (a.createdAt && b.createdAt) {
// //                             return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
// //                         }
// //                         return 0;
// //                       }).map((n) => (
// //                         <div key={n.id} className="flex items-start space-x-4">
// //                           <Image
// //                             src={
// //                               (n.authorEmail && assigneeMap[n.authorEmail]?.imageUrl) ||
// //                               (assigneeMap[n.authorName || '']?.imageUrl) ||
// //                               (user?.primaryEmailAddress?.emailAddress === n.authorEmail ? user.imageUrl : '') ||
// //                               `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(n.authorEmail || n.authorName || "unknown-note-author")}`
// //                             }
// //                             alt={assigneeMap[n.authorEmail || '']?.name || n.authorName || 'User'}
// //                             width={32}
// //                             height={32}
// //                             className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
// //                           />
// //                           <div className="flex-1">
// //                             <p className="text-sm font-semibold text-gray-800">
// //                               {n.authorName || "Anonymous"}
// //                               <span className="text-gray-500 font-normal text-xs ml-2">
// //                                 {n.createdAt ? format(parseISO(n.createdAt), "MMM dd, yyyy 'at' HH:mm") : "Date N/A"}
// //                               </span>
// //                             </p>
// //                             <p className="text-gray-700 text-sm mt-1">{n.content}</p>
// //                           </div>
// //                         </div>
// //                       ))
// //                     ) : (
// //                       <p className="text-gray-500 text-sm">No activity yet. Be the first to comment!</p>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>

// //       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
// //           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl z-[101] w-96 text-center">
// //             <Dialog.Title className="text-lg font-bold mb-4">Confirm Deletion</Dialog.Title>
// //             <Dialog.Description className="text-sm text-gray-700 mb-6">
// //               Are you sure you want to delete this attachment? This action cannot be undone.
// //             </Dialog.Description>
// //             <div className="flex justify-center gap-4">
// //               <button
// //                 onClick={() => setShowConfirmDeleteModal(false)}
// //                 className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={confirmDeleteAttachment}
// //                 className="px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>
// //     </div>
// //   );
// // }
































// // "use client";

// // import React, { useEffect, useState, useCallback, useMemo } from "react";
// // import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// // import Image from "next/image";
// // import * as Dialog from "@radix-ui/react-dialog";
// // import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// // import { useUser } from "@clerk/nextjs";
// // import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// // import PaymentHistory from "./PaymentHistory"; // Import the PaymentHistory component

// // interface Subtask {
// //   id: string;
// //   title: string;
// //   completed: boolean;
// // }

// // interface Note {
// //   id: string;
// //   content: string;
// //   authorName?: string;
// //   authorEmail?: string;
// //   createdAt?: string;
// // }

// // // Updated PaymentEntry interface for detailed history
// // interface PaymentEntry {
// //   amount: number;
// //   received: number;
// //   timestamp: string; // ISO string
// //   user?: {
// //     name?: string;
// //     email?: string;
// //   };
// //   fileUrl?: string; // URL to the payment proof file for this specific entry
// // }

// // interface Task {
// //   id: string;
// //   name: string;
// //   shop: string;
// //   customer: string;
// //   start: string;
// //   end: string;
// //   progress: number;
// //   assigneeIds?: string[];
// //   subtasks?: Subtask[];
// //   notes?: Note[];
// //   attachments?: string[];
// //   // These are now for the current state/summary, not the history itself
// //   amount?: number;
// //   received?: number;
// //   paymentProofs?: string[]; // Kept for existing attachments, though PaymentEntry will hold per-payment proof
// //   payments?: PaymentEntry[]; // This is the new array for payment history
// // }

// // interface AssigneeDetails {
// //   id: string;
// //   name: string;
// //   email: string;
// //   imageUrl: string;
// // }

// // const startDate = new Date("2025-07-10");
// // const endDate = new Date("2025-07-31");
// // const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// // const isImageUrl = (url: string) => {
// //   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// // };

// // interface AttachmentItemProps {
// //   url: string;
// //   index: number;
// //   onReupload: (oldUrl: string, file: File) => Promise<void>;
// //   onDelete: (url: string) => void;
// // }

// // const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
// //   const [showActions, setShowActions] = useState(false);

// //   return (
// //     <div
// //       onMouseEnter={() => setShowActions(true)}
// //       onMouseLeave={() => setShowActions(false)}
// //       className="relative group border border-gray-200 rounded-lg overflow-hidden"
// //     >
// //       <a
// //         href={url}
// //         target="_blank"
// //         rel="noopener noreferrer"
// //         className="block w-full h-24 flex items-center justify-center bg-gray-100"
// //       >
// //         {isImageUrl(url) ? (
// //           <img
// //             src={url}
// //             alt={`Attachment ${index + 1}`}
// //             className="w-full h-full object-cover transition"
// //           />
// //         ) : (
// //           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
// //             <FaFilePdf className="text-4xl text-red-500" />
// //             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
// //           </div>
// //         )}
// //       </a>

// //       {showActions && (
// //         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
// //           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
// //             <FaRedoAlt /> Reupload
// //             <input
// //               type="file"
// //               accept="image/*,application/pdf"
// //               className="hidden"
// //               onChange={async (e) => {
// //                 const file = e.target.files?.[0];
// //                 if (file) {
// //                   await onReupload(url, file);
// //                   e.target.value = '';
// //                 }
// //               }}
// //             />
// //           </label>

// //           <button
// //             onClick={() => onDelete(url)}
// //             className="flex items-center gap-1 hover:text-red-500 transition-colors"
// //           >
// //             <FaTrashAlt /> Delete
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
// //   if (ids.length === 0) return [];
// //   try {
// //     const res = await fetch('/api/assignees', {
// //       method: 'POST',
// //       body: JSON.stringify({ ids }),
// //       headers: { 'Content-Type': 'application/json' }
// //     });
// //     if (!res.ok) {
// //       const errorData = await res.json();
// //       console.error("Failed to fetch assignee details:", errorData.error);
// //       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
// //     }
// //     const data = await res.json();
// //     return data.assignees;
// //   } catch (error) {
// //     console.error("Error fetching assignee details:", error);
// //     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
// //   }
// // };


// // export default function TaskTimeline() {
// //   const { user } = useUser();
// //   const [tasks, setTasks] = useState<Task[]>([]);
// //   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [zoom, setZoom] = useState(40);

// //   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
// //   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

// //   const [newNote, setNewNote] = useState("");
// //   const [newSubtask, setNewSubtask] = useState("");
// //   const [uploadStatus, setUploadStatus] = useState("");
// //   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");

// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [tasksPerPage, setTasksPerPage] = useState(10);
// //   const [totalPages, setTotalPages] = useState(1);

// //   const [isPanelOpen, setIsPanelOpen] = useState(false);

// //   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
// //   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);

// //   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});

// //   // States for the individual payment input fields (not necessarily directly mapping to Task.amount/received)
// //   const [currentAmountInput, setCurrentAmountInput] = useState("");
// //   const [currentReceivedInput, setCurrentReceivedInput] = useState("");


// //   // This state will be incremented to force re-memoization of filteredTasks if needed
// //   const [tasksVersion, setTasksVersion] = useState(0);

// //   useEffect(() => {
// //     // When selectedTask changes, reset payment input fields
// //     if (selectedTask) {
// //       setCurrentAmountInput(selectedTask.amount?.toString() || "");
// //       setCurrentReceivedInput(selectedTask.received?.toString() || "");
// //     }
// //   }, [selectedTask]);


// //   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
// //     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, { cache: "no-store" });
// //     const data = await res.json();

// //     if (Array.isArray(data.tasks)) {
// //       setTasks(data.tasks);
// //       setTasksVersion(prev => prev + 1); // Increment version to force re-memoization
// //       setCurrentPage(data.page);
// //       setTotalPages(data.totalPages);

// //       if (isPanelOpen && selectedTaskId) {
// //         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
// //         setSelectedTask(updated || null);
// //         if (!updated) {
// //           setIsPanelOpen(false);
// //           setSelectedTaskId(null);
// //         }
// //       }
// //     } else {
// //       console.error("Failed to fetch tasks or invalid data format:", data);
// //       setTasks([]);
// //       setTotalPages(1);
// //       setSelectedTask(null);
// //       setSelectedTaskId(null);
// //       setIsPanelOpen(false);
// //     }
// //   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId]);

// //   useEffect(() => {
// //     fetchTasks(currentPage, tasksPerPage);
// //   }, [currentPage, tasksPerPage, fetchTasks]);

// //   useEffect(() => {
// //     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
// //     if (ids.length > 0) {
// //       fetchAssigneeDetails(ids).then((assignees) => {
// //         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
// //           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
// //         );
// //         setAssigneeMap(map);
// //       });
// //     } else {
// //       setAssigneeMap({});
// //     }
// //   }, [tasks]);

// //   const allAssignees = useMemo(() => {
// //     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
// //   }, [tasks]);

// //   const filteredTasks = useMemo(() => {
// //     let currentTasks = [...tasks];
// //     if (searchTerm) {
// //       const lowerSearchTerm = searchTerm.toLowerCase();
// //       currentTasks = currentTasks.filter(task =>
// //         task.name.toLowerCase().includes(lowerSearchTerm) ||
// //         task.shop.toLowerCase().includes(lowerSearchTerm) ||
// //         task.customer.toLowerCase().includes(lowerSearchTerm)
// //       );
// //     }
// //     if (selectedAvatar) {
// //       currentTasks = currentTasks.filter(task =>
// //         (task.assigneeIds || []).includes(selectedAvatar)
// //       );
// //     }
// //     return currentTasks;
// //   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);


// //   const handleTaskClick = useCallback((task: Task) => {
// //     setSelectedTaskId(task.id);
// //     setSelectedTask(task);
// //     setIsPanelOpen(true);
// //   }, []);

// //   const updateSelectedTaskFromFetched = useCallback(async () => {
// //     const updatedRes = await fetch("/api/timeline");
// //     const updatedData = await updatedRes.json();
// //     const updatedTask = updatedData.tasks.find((t: any) => t.id === selectedTask?.id);
// //     if (updatedTask) {
// //       setSelectedTask(updatedTask);
// //     }
// //   }, [selectedTask]);


// //   const toggleSubtask = async (taskId: string, subtaskId: string) => {
// //     await fetch(`/api/subtasks/${subtaskId}`, { method: "PATCH" });
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addSubtask = async () => {
// //     if (!selectedTask || newSubtask.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
// //       method: "POST",
// //       body: JSON.stringify({ title: newSubtask }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewSubtask("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addNote = async () => {
// //     if (!selectedTask || newNote.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/notes`, {
// //       method: "POST",
// //       body: JSON.stringify({
// //         content: newNote,
// //         authorName: user?.fullName || "Anonymous",
// //         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
// //         createdAt: new Date().toISOString(),
// //       }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewNote("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };


// //   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new file...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "PATCH",
// //         body: JSON.stringify({ oldUrl, newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File replaced!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 2000);
// //     } catch (err) {
// //       console.error("Error reuploading attachment:", err);
// //       setUploadStatus("❌ An error occurred during reupload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleNewAttachmentUpload = async (file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new attachment...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "POST",
// //         body: JSON.stringify({ url: newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ New file uploaded successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     } catch (err) {
// //       console.error("Error uploading new attachment:", err);
// //       setUploadStatus("❌ An error occurred during new upload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleDeleteAttachment = useCallback((url: string) => {
// //     if (!selectedTask) return;
// //     setAttachmentToDeleteUrl(url);
// //     setShowConfirmDeleteModal(true);
// //   }, [selectedTask]);

// //   const confirmDeleteAttachment = async () => {
// //     if (!selectedTask || !attachmentToDeleteUrl) return;

// //     setShowConfirmDeleteModal(false);
// //     setUploadStatus("Deleting file...");

// //     try {
// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "DELETE",
// //         body: JSON.stringify({ url: attachmentToDeleteUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const text = await res.text();
// //       let data = null;
// //       try {
// //         data = text ? JSON.parse(text) : {};
// //       } catch (e) {
// //         console.error("Invalid JSON response", e);
// //         setUploadStatus("❌ Invalid server response");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }
// //                           </div>
// //                         )}
// //                       </td>
// //                     );
// //                   })}
// //                 </tr>
// //               );
// //             })
// //           )}
// //         </tbody>
// //       </table>

// //       ---

// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
// //           <button
// //             onClick={() => handlePageChange(currentPage - 1)}
// //             disabled={currentPage === 1}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Previous
// //           </button>
// //           <div className="flex gap-1">
// //             {pageNumbers.map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
// //                   currentPage === page
// //                     ? "bg-blue-600 text-white shadow-sm"
// //                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
// //                 } transition-all`}
// //               >
// //                 {page}
// //               </button>
// //             ))}
// //           </div>
// //           <button
// //             onClick={() => handlePageChange(currentPage + 1)}
// //             disabled={currentPage === totalPages}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Next
// //           </button>
// //         </div>
// //       )}

// //       ---

// //       <Dialog.Root
// //         open={isPanelOpen}
// //         onOpenChange={(open) => {
// //           setIsPanelOpen(open);
// //           if (!open) {
// //             setSelectedTask(null);
// //             setSelectedTaskId(null);
// //           }
// //         }}
// //       >
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
// //           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
// //             {selectedTask && (
// //               <div className="space-y-6">
// //                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
// //                   <Dialog.Title className="text-2xl font-bold text-gray-900 leading-tight">
// //                     {selectedTask.name}
// //                   </Dialog.Title>
// //                   <Dialog.Close asChild>
// //                     <button
// //                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                       aria-label="Close"
// //                     >
// //                       <FaPlus className="rotate-45" />
// //                     </button>
// //                   </Dialog.Close>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
// //                   <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
// //                     <div className="col-span-2">
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.name}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
// //                       <p className="text-gray-800 mt-1">
// //                         {format(parseISO(selectedTask.start), "MMM dd, yyyy")}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
// //                       <p className="text-gray-800 mt-1">
// //                         {format(parseISO(selectedTask.end), "MMM dd, yyyy")}
// //                       </p>
// //                     </div>
// //                     <div className="col-span-2">
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
// //                       <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
// //                         <div
// //                           className="bg-blue-600 h-2.5 rounded-full"
// //                           style={{ width: `${selectedTask.progress}%` }}
// //                         ></div>
// //                       </div>
// //                       <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
// //                   <div className="flex flex-wrap gap-2">
// //                     {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
// //                       selectedTask.assigneeIds.map((id) => (
// //                         <Image
// //                           key={id}
// //                           src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //                           alt={assigneeMap[id]?.name || "Assignee"}
// //                           width={36}
// //                           height={36}
// //                           className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
// //                           title={assigneeMap[id]?.name || id}
// //                         />
// //                       ))
// //                     ) : (
// //                       <p className="text-gray-500 text-sm">No assignees.</p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
// //                   <div className="space-y-3">
// //                     {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
// //                     {selectedTask.subtasks?.map((s) => (
// //                       <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
// //                         <input
// //                           type="checkbox"
// //                           checked={s.completed}
// //                           onChange={() => toggleSubtask(selectedTask.id, s.id)}
// //                           className="hidden"
// //                         />
// //                         {s.completed ? (
// //                           <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
// //                         ) : (
// //                           <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
// //                         )}
// //                         <span className={`${s.completed ? "line-through text-gray-400" : ""}`}>{s.title}</span>
// //                       </label>
// //                     ))}
// //                   </div>

// //                   <div className="flex mt-4 pt-4 border-t border-gray-200">
// //                     <input
// //                       type="text"
// //                       value={newSubtask}
// //                       onChange={(e) => setNewSubtask(e.target.value)}
// //                       placeholder="Add a new subtask..."
// //                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// //                     />
// //                     <button
// //                       onClick={addSubtask}
// //                       className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition"
// //                     >
// //                       <FaPlus className="inline-block mr-1 text-xs" /> Add
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
// //                   <div className="grid grid-cols-2 gap-3">
// //                     {selectedTask.attachments?.length === 0 && (
// //                       <p className="text-gray-500 text-sm col-span-2">No attachments.</p>
// //                     )}
// //                     {selectedTask.attachments?.map((url, i) => (
// //                       <AttachmentItem
// //                         key={url}
// //                         url={url}
// //                         index={i}
// //                         onReupload={handleReuploadAttachment}
// //                         onDelete={handleDeleteAttachment}
// //                       />
// //                     ))}
// //                   </div>

// //                   <div className="mt-4 pt-4 border-t border-gray-200">
// //                     <label htmlFor="newAttachment" className="block text-sm font-medium text-gray-700 mb-2">
// //                       Upload New Attachment
// //                     </label>
// //                     <input
// //                       id="newAttachment"
// //                       type="file"
// //                       accept="image/*,application/pdf"
// //                       className="block w-full text-sm text-gray-500
// //                                 file:mr-4 file:py-2 file:px-4
// //                                 file:rounded-md file:border-0
// //                                 file:text-sm file:font-semibold
// //                                 file:bg-blue-50 file:text-blue-700
// //                                 hover:file:bg-blue-100"
// //                       onChange={async (e) => {
// //                         const file = e.target.files?.[0];
// //                         if (file) {
// //                           await handleNewAttachmentUpload(file);
// //                           e.target.value = ''; // Clear input after upload
// //                         }
// //                       }}
// //                     />
// //                     {uploadStatus && <p className="mt-2 text-sm text-gray-600">{uploadStatus}</p>}
// //                   </div>
// //                 </div>

// //                 {/* Payment Section - Updated */}
// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Payments</h3>
// //                   <form onSubmit={handlePaymentSubmit} className="space-y-4">
// //                     <div>
// //                       <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
// //                         Total Amount Due (₹)
// //                       </label>
// //                       <input
// //                         type="number"
// //                         id="amount"
// //                         name="amount"
// //                         value={currentAmountInput} // Use local state for input
// //                         onChange={(e) => setCurrentAmountInput(e.target.value)}
// //                         step="0.01"
// //                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <label htmlFor="received" className="block text-sm font-medium text-gray-700">
// //                         Amount Received (₹)
// //                       </label>
// //                       <input
// //                         type="number"
// //                         id="received"
// //                         name="received"
// //                         value={currentReceivedInput} // Use local state for input
// //                         onChange={(e) => setCurrentReceivedInput(e.target.value)}
// //                         step="0.01"
// //                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">
// //                         Upload Payment Proof (Optional)
// //                       </label>
// //                       <input
// //                         type="file"
// //                         id="paymentFile"
// //                         name="paymentFile"
// //                         accept="image/*,application/pdf"
// //                         className="mt-1 block w-full text-sm text-gray-500
// //                                   file:mr-4 file:py-2 file:px-4
// //                                   file:rounded-md file:border-0
// //                                   file:text-sm file:font-semibold
// //                                   file:bg-purple-50 file:text-purple-700
// //                                   hover:file:bg-purple-100"
// //                       />
// //                       {paymentUploadStatus && <p className="mt-2 text-sm text-gray-600">{paymentUploadStatus}</p>}
// //                     </div>
// //                     <button
// //                       type="submit"
// //                       className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// //                     >
// //                       Record Payment Update
// //                     </button>
// //                   </form>

// //                   {/* Pass Real History to the Component */}
// //                   {/* {selectedTask.payments && selectedTask.payments.length > 0 ? (
// //                     <div className="mt-6 pt-6 border-t border-gray-200">
// //                         <h4 className="text-md font-semibold text-gray-800 mb-3">Payment History Log</h4>
// //                         <PaymentHistory paymentHistory={selectedTask.payments} />
// //                     </div>
// //                   ) : (
// //                     <p className="text-gray-500 text-sm mt-6 pt-6 border-t border-gray-200">No payment history recorded for this task yet.</p>
// //                   )}
// //                 </div> */}
// //                 {selectedTask.paymentHistory && selectedTask.paymentHistory.length > 0 ? (
// //   <div className="mt-6 pt-6 border-t border-gray-200">
// //       <h4 className="text-md font-semibold text-gray-800 mb-3">Payment History Log</h4>
// //       {/* Pass selectedTask.name as taskTitle */}
// //       <PaymentHistory paymentHistory={selectedTask.paymentHistory} taskTitle={selectedTask.name} />
// //   </div>
// // ) : (
// //   <p className="text-gray-500 text-sm mt-6 pt-6 border-t border-gray-200">No payment history recorded for this task yet.</p>
// // )}


// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
// //                   <div className="space-y-4">
// //                     {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
// //                     {selectedTask.notes?.map((n) => (
// //                       <div key={n.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
// //                         <p className="text-gray-700 text-sm">{n.content}</p>
// //                         <p className="text-xs text-gray-500 mt-1">
// //                           — {n.authorName || "Unknown"} on{" "}
// //                           {n.createdAt ? format(parseISO(n.createdAt), "MMM dd, yyyy HH:mm") : "Unknown date"}
// //                         </p>
// //                       </div>
// //                     ))}
// //                   </div>
// //                   <div className="flex mt-4 pt-4 border-t border-gray-200">
// //                     <textarea
// //                       value={newNote}
// //                       onChange={(e) => setNewNote(e.target.value)}
// //                       placeholder="Add a new note..."
// //                       rows={3}
// //                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// //                     ></textarea>
// //                     <button
// //                       onClick={addNote}
// //                       className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition self-end"
// //                     >
// //                       <FaPlus className="inline-block mr-1 text-xs" /> Add
// //                     </button>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>

// //       {/* Confirmation Modal for Deleting Attachment */}
// //       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-[60]" />
// //           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg z-[70] max-w-md w-full">
// //             <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</Dialog.Title>
// //             <Dialog.Description className="text-gray-700 mb-6">
// //               Are you sure you want to delete this attachment? This action cannot be undone.
// //             </Dialog.Description>
// //             <div className="flex justify-end gap-3">
// //               <Dialog.Close asChild>
// //                 <button
// //                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
// //                   onClick={() => setAttachmentToDeleteUrl(null)}
// //                 >
// //                   Cancel
// //                 </button>
// //               </Dialog.Close>
// //               <button
// //                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
// //                 onClick={confirmDeleteAttachment}
// //               >
// //                   Delete
// //               </button>
// //             </div>
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>

// //     </div>
// //   );
// // }























// // "use client";

// // import React, { useEffect, useState, useCallback, useMemo } from "react";
// // import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// // import Image from "next/image";
// // import * as Dialog from "@radix-ui/react-dialog";
// // import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// // import { useUser } from "@clerk/nextjs";
// // import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// // import PaymentHistory from "./PaymentHistory"; // Import the PaymentHistory component

// // interface Subtask {
// //   id: string;
// //   title: string;
// //   completed: boolean;
// // }

// // interface Note {
// //   id: string;
// //   content: string;
// //   authorName?: string;
// //   authorEmail?: string;
// //   createdAt?: string;
// // }

// // // Updated PaymentEntry interface for detailed history
// // interface PaymentEntry {
// //   amount: number;
// //   received: number;
// //   updatedAt: string; // Changed from 'timestamp' to 'updatedAt' for consistency with MongoDB output
// //   updatedBy: string; // Changed from 'user' object to 'updatedBy' string for consistency with MongoDB output
// //   fileUrl?: string | null; // Optional URL for payment proof
// // }

// // interface Task {
// //   id: string;
// //   name: string;
// //   shop: string;
// //   customer: string;
// //   start: string;
// //   end: string;
// //   progress: number;
// //   assigneeIds?: string[];
// //   subtasks?: Subtask[];
// //   notes?: Note[];
// //   attachments?: string[];
// //   // These are now for the current state/summary, not the history itself
// //   amount?: number; // This might become redundant if all payment tracking is via paymentHistory
// //   received?: number; // This might become redundant if all payment tracking is via paymentHistory
// //   // Removed paymentProofs as fileUrl is now within PaymentEntry
// //   paymentHistory?: PaymentEntry[]; // Corrected to paymentHistory for consistency
// // }

// // interface AssigneeDetails {
// //   id: string;
// //   name: string;
// //   email: string;
// //   imageUrl: string;
// // }

// // const startDate = new Date("2025-07-10");
// // const endDate = new Date("2025-07-31");
// // const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// // const isImageUrl = (url: string) => {
// //   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// // };

// // interface AttachmentItemProps {
// //   url: string;
// //   index: number;
// //   onReupload: (oldUrl: string, file: File) => Promise<void>;
// //   onDelete: (url: string) => void;
// // }

// // const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
// //   const [showActions, setShowActions] = useState(false);

// //   return (
// //     <div
// //       onMouseEnter={() => setShowActions(true)}
// //       onMouseLeave={() => setShowActions(false)}
// //       className="relative group border border-gray-200 rounded-lg overflow-hidden"
// //     >
// //       <a
// //         href={url}
// //         target="_blank"
// //         rel="noopener noreferrer"
// //         className="block w-full h-24 flex items-center justify-center bg-gray-100"
// //       >
// //         {isImageUrl(url) ? (
// //           <img
// //             src={url}
// //             alt={`Attachment ${index + 1}`}
// //             className="w-full h-full object-cover transition"
// //           />
// //         ) : (
// //           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
// //             <FaFilePdf className="text-4xl text-red-500" />
// //             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
// //           </div>
// //         )}
// //       </a>

// //       {showActions && (
// //         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
// //           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
// //             <FaRedoAlt /> Reupload
// //             <input
// //               type="file"
// //               accept="image/*,application/pdf"
// //               className="hidden"
// //               onChange={async (e) => {
// //                 const file = e.target.files?.[0];
// //                 if (file) {
// //                   await onReupload(url, file);
// //                   e.target.value = '';
// //                 }
// //               }}
// //             />
// //           </label>

// //           <button
// //             onClick={() => onDelete(url)}
// //             className="flex items-center gap-1 hover:text-red-500 transition-colors"
// //           >
// //             <FaTrashAlt /> Delete
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
// //   if (ids.length === 0) return [];
// //   try {
// //     const res = await fetch('/api/assignees', {
// //       method: 'POST',
// //       body: JSON.stringify({ ids }),
// //       headers: { 'Content-Type': 'application/json' }
// //     });
// //     if (!res.ok) {
// //       const errorData = await res.json();
// //       console.error("Failed to fetch assignee details:", errorData.error);
// //       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
// //     }
// //     const data = await res.json();
// //     return data.assignees;
// //   } catch (error) {
// //     console.error("Error fetching assignee details:", error);
// //     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
// //   }
// // };


// // export default function TaskTimeline() {
// //   const { user, sessionClaims } = useUser(); // Destructure sessionClaims
// //   const [tasks, setTasks] = useState<Task[]>([]);
// //   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [zoom, setZoom] = useState(40);

// //   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
// //   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

// //   const [newNote, setNewNote] = useState("");
// //   const [newSubtask, setNewSubtask] = useState("");
// //   const [uploadStatus, setUploadStatus] = useState("");
// //   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");

// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [tasksPerPage, setTasksPerPage] = useState(10);
// //   const [totalPages, setTotalPages] = useState(1);

// //   const [isPanelOpen, setIsPanelOpen] = useState(false);

// //   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
// //   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);

// //   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});

// //   // States for the individual payment input fields (not necessarily directly mapping to Task.amount/received)
// //   const [currentAmountInput, setCurrentAmountInput] = useState("");
// //   const [currentReceivedInput, setCurrentReceivedInput] = useState("");


// //   // This state will be incremented to force re-memoization of filteredTasks if needed
// //   const [tasksVersion, setTasksVersion] = useState(0);

// //   useEffect(() => {
// //     // When selectedTask changes, reset payment input fields
// //     if (selectedTask) {
// //       // Use the last entry in paymentHistory or fallback to existing amount/received if available
// //       const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
// //       setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
// //       setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
// //     }
// //   }, [selectedTask]);


// //   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
// //     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, { cache: "no-store" });
// //     const data = await res.json();

// //     if (Array.isArray(data.tasks)) {
// //       setTasks(data.tasks);
// //       setTasksVersion(prev => prev + 1); // Increment version to force re-memoization
// //       setCurrentPage(data.page);
// //       setTotalPages(data.totalPages);

// //       if (isPanelOpen && selectedTaskId) {
// //         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
// //         setSelectedTask(updated || null);
// //         if (!updated) {
// //           setIsPanelOpen(false);
// //           setSelectedTaskId(null);
// //         }
// //       }
// //     } else {
// //       console.error("Failed to fetch tasks or invalid data format:", data);
// //       setTasks([]);
// //       setTotalPages(1);
// //       setSelectedTask(null);
// //       setSelectedTaskId(null);
// //       setIsPanelOpen(false);
// //     }
// //   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId]);

// //   useEffect(() => {
// //     fetchTasks(currentPage, tasksPerPage);
// //   }, [currentPage, tasksPerPage, fetchTasks]);

// //   useEffect(() => {
// //     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
// //     if (ids.length > 0) {
// //       fetchAssigneeDetails(ids).then((assignees) => {
// //         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
// //           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
// //         );
// //         setAssigneeMap(map);
// //       });
// //     } else {
// //       setAssigneeMap({});
// //     }
// //   }, [tasks]);

// //   const allAssignees = useMemo(() => {
// //     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
// //   }, [tasks]);

// //   const filteredTasks = useMemo(() => {
// //     let currentTasks = [...tasks];
// //     if (searchTerm) {
// //       const lowerSearchTerm = searchTerm.toLowerCase();
// //       currentTasks = currentTasks.filter(task =>
// //         task.name.toLowerCase().includes(lowerSearchTerm) ||
// //         task.shop.toLowerCase().includes(lowerSearchTerm) ||
// //         task.customer.toLowerCase().includes(lowerSearchTerm)
// //       );
// //     }
// //     if (selectedAvatar) {
// //       currentTasks = currentTasks.filter(task =>
// //         (task.assigneeIds || []).includes(selectedAvatar)
// //       );
// //     }
// //     return currentTasks;
// //   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);


// //   const handleTaskClick = useCallback((task: Task) => {
// //     setSelectedTaskId(task.id);
// //     setSelectedTask(task);
// //     setIsPanelOpen(true);
// //   }, []);

// //   const updateSelectedTaskFromFetched = useCallback(async () => {
// //     // Re-fetch only the current task if possible for efficiency, or entire tasks list
// //     const updatedRes = await fetch(`/api/timeline?id=${selectedTask?.id}`); // Assuming API supports fetching by ID
// //     const updatedData = await updatedRes.json();
// //     const updatedTask = updatedData.tasks?.find((t: any) => t.id === selectedTask?.id); // Find in returned tasks array
// //     if (updatedTask) {
// //       setSelectedTask(updatedTask);
// //     } else {
// //       // Fallback to full fetch if ID specific fetch not supported or task not found
// //       await fetchTasks(currentPage, tasksPerPage);
// //     }
// //   }, [selectedTask, fetchTasks, currentPage, tasksPerPage]);


// //   const toggleSubtask = async (taskId: string, subtaskId: string) => {
// //     await fetch(`/api/subtasks/${subtaskId}`, { method: "PATCH" });
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addSubtask = async () => {
// //     if (!selectedTask || newSubtask.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
// //       method: "POST",
// //       body: JSON.stringify({ title: newSubtask }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewSubtask("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addNote = async () => {
// //     if (!selectedTask || newNote.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/notes`, {
// //       method: "POST",
// //       body: JSON.stringify({
// //         content: newNote,
// //         authorName: user?.fullName || "Anonymous",
// //         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
// //         createdAt: new Date().toISOString(),
// //       }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewNote("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };


// //   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new file...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "PATCH",
// //         body: JSON.stringify({ oldUrl, newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File replaced!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 2000);
// //     } catch (err) {
// //       console.error("Error reuploading attachment:", err);
// //       setUploadStatus("❌ An error occurred during reupload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleNewAttachmentUpload = async (file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new attachment...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "POST",
// //         body: JSON.stringify({ url: newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ New file uploaded successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     } catch (err) {
// //       console.error("Error uploading new attachment:", err);
// //       setUploadStatus("❌ An error occurred during new upload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleDeleteAttachment = useCallback((url: string) => {
// //     if (!selectedTask) return;
// //     setAttachmentToDeleteUrl(url);
// //     setShowConfirmDeleteModal(true);
// //   }, [selectedTask]);

// //   const confirmDeleteAttachment = async () => {
// //     if (!selectedTask || !attachmentToDeleteUrl) return;

// //     setShowConfirmDeleteModal(false);
// //     setUploadStatus("Deleting file...");

// //     try {
// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "DELETE",
// //         body: JSON.stringify({ url: attachmentToDeleteUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const text = await res.text();
// //       let data = null;
// //       try {
// //         data = text ? JSON.parse(text) : {};
// //       } catch (e) {
// //         console.error("Invalid JSON response", e);
// //         setUploadStatus("❌ Invalid server response");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File deleted successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //     } catch (err) {
// //       console.error("Error deleting attachment:", err);
// //       setUploadStatus("❌ Error deleting attachment");
// //     } finally {
// //       setAttachmentToDeleteUrl(null);
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handlePaymentSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!selectedTask) return;

// //     const parsedAmount = parseFloat(currentAmountInput);
// //     const parsedReceived = parseFloat(currentReceivedInput);

// //     if (isNaN(parsedAmount) || isNaN(parsedReceived)) {
// //       setPaymentUploadStatus("Invalid amount or received value.");
// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //       return;
// //     }

// //     setPaymentUploadStatus("Processing payment update...");

// //     let uploadedUrl: string | null = null; // Initialize as null
// //     const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
// //     const file = fileInput?.files?.[0];

// //     try {
// //       if (file) {
// //         setPaymentUploadStatus("Uploading payment proof...");
// //         const url = await uploadToCloudinary(file, setPaymentUploadStatus);
// //         if (!url) {
// //           setPaymentUploadStatus("❌ Cloudinary upload failed for payment proof.");
// //           setTimeout(() => setPaymentUploadStatus(""), 3000);
// //           return;
// //         }
// //         uploadedUrl = url;
// //       }

// //       // Use sessionClaims for updatedBy as per previous suggestions
// //       const userEmail = sessionClaims?.email as string || "Unknown User";
// //       const userName = sessionClaims?.firstName as string || userEmail; // fallback to email

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
// //         method: "PATCH", // Or POST if creating a new payment entry in the backend array
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           amount: parsedAmount,
// //           received: parsedReceived,
// //           fileUrl: uploadedUrl,
// //           updatedBy: userName, // Using userName directly as suggested
// //           updatedAt: new Date().toISOString(), // Using ISO string for consistency
// //         }),
// //       });

// //       if (!res.ok) {
// //         const err = await res.json();
// //         console.error("❌ Payment update failed:", err);
// //         setPaymentUploadStatus(`Failed to update payment: ${err.error || 'Unknown error'}`);
// //         return;
// //       }

// //       setPaymentUploadStatus("✅ Payment updated successfully!");
// //       // Clear form inputs after successful submission
// //       setCurrentAmountInput("");
// //       setCurrentReceivedInput("");
// //       if (fileInput) fileInput.value = ''; // Clear file input

// //       await fetchTasks(currentPage, tasksPerPage); // Re-fetch all tasks
// //       await updateSelectedTaskFromFetched(); // Update the selected task specifically

// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //     } catch (err) {
// //       console.error("❌ Payment submission failed:", err);
// //       setPaymentUploadStatus("An error occurred while updating payment.");
// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //     }
// //   };


// //   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     const newLimit = parseInt(e.target.value, 10);
// //     setTasksPerPage(newLimit);
// //     setCurrentPage(1);
// //   };

// //   const handlePageChange = (pageNumber: number) => {
// //     setCurrentPage(pageNumber);
// //   };

// //   const pageNumbers = useMemo(() => {
// //     const pages = [];
// //     const maxPagesToShow = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
// //     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

// //     if (endPage - startPage + 1 < maxPagesToShow) {
// //       startPage = Math.max(1, endPage - maxPagesToShow + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }
// //     return pages;
// //   }, [totalPages, currentPage]);


// //   return (
// //     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
// //       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //         <div className="flex items-center gap-3">
// //           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
// //           {allAssignees.map((id) => (
// //             <Image
// //               key={id}
// //               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //               alt={assigneeMap[id]?.name || "Assignee Avatar"}
// //               width={32}
// //               height={32}
// //               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
// //                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
// //               }`}
// //               onClick={() =>
// //                 setSelectedAvatar((prev) => (prev === id ? null : id))
// //               }
// //               title={assigneeMap[id]?.name || id}
// //             />
// //           ))}
// //         </div>

// //         <input
// //           type="text"
// //           placeholder="Search tasks..."
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
// //         />

// //         <div className="flex items-center gap-2">
// //           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
// //           <select
// //             id="tasksPerPage"
// //             value={tasksPerPage}
// //             onChange={handleTasksPerPageChange}
// //             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
// //           >
// //             <option value={5}>5</option>
// //             <option value={10}>10</option>
// //             <option value={15}>15</option>
// //             <option value={20}>20</option>
// //             <option value={50}>50</option>
// //           </select>
// //         </div>

// //         <div className="flex items-center gap-2">
// //           <label className="text-sm text-gray-500">Zoom:</label>
// //           <input
// //             type="range"
// //             min={20}
// //             max={100}
// //             value={zoom}
// //             onChange={(e) => setZoom(Number(e.target.value))}
// //             className="w-24"
// //           />
// //         </div>
// //       </div>

// //       ---

// //       <table className="min-w-full border-collapse border border-gray-200">
// //         <thead>
// //           <tr className="bg-gray-100">
// //             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
// //             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
// //             {Array.from({ length: totalDays }).map((_, i) => {
// //               const current = addDays(startDate, i);
// //               const isTodayColumn = isToday(current);
// //               return (
// //                 <th
// //                   key={i}
// //                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
// //                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
// //                   }`}
// //                   style={{ minWidth: `${zoom}px` }}
// //                 >
// //                   {format(current, "dd")}
// //                 </th>
// //               );
// //             })}
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredTasks.length === 0 ? (
// //             <tr>
// //               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
// //                 No tasks found with current filters or on this page.
// //               </td>
// //             </tr>
// //           ) : (
// //             filteredTasks.map((task, index) => {
// //               const startOffset = Math.max(
// //                 0,
// //                 differenceInCalendarDays(new Date(task.start), startDate)
// //               );
// //               const duration =
// //                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

// //               return (
// //                 <tr key={task.id} className="h-12 border-b border-gray-200">
// //                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
// //                     {(currentPage - 1) * tasksPerPage + index + 1}
// //                   </td>
// //                   <td
// //                     onClick={() => handleTaskClick(task)}
// //                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
// //                   >
// //                     <div className="font-semibold text-[13px] text-gray-800 truncate">
// //                       📁 {task.name}
// //                     </div>
// //                     <div className="text-[11px] text-gray-500 truncate">
// //                       🏪 {task.shop} / 👤 {task.customer}
// //                     </div>
// //                   </td>
// //                   {Array.from({ length: totalDays }).map((_, i) => {
// //                     const isBar = i >= startOffset && i < startOffset + duration;
// //                     const bgColor =
// //                       task.progress === 100
// //                         ? "bg-green-500"
// //                         : task.progress > 0
// //                         ? "bg-blue-500"
// //                         : "bg-gray-300";

// //                     return (
// //                       <td
// //                         key={i}
// //                         onClick={() => handleTaskClick(task)}
// //                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
// //                       >
// //                         {isBar && (
// //                           <div
// //                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
// //                             style={{ width: `${task.progress}%` }}
// //                           >
// //                             {task.progress}%
// //                           </div>
// //                         )}
// //                       </td>
// //                     );
// //                   })}
// //                 </tr>
// //               );
// //             })
// //           )}
// //         </tbody>
// //       </table>

// //       ---

// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
// //           <button
// //             onClick={() => handlePageChange(currentPage - 1)}
// //             disabled={currentPage === 1}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Previous
// //           </button>
// //           <div className="flex gap-1">
// //             {pageNumbers.map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
// //                   currentPage === page
// //                     ? "bg-blue-600 text-white shadow-sm"
// //                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
// //                 } transition-all`}
// //               >
// //                 {page}
// //               </button>
// //             ))}
// //           </div>
// //           <button
// //             onClick={() => handlePageChange(currentPage + 1)}
// //             disabled={currentPage === totalPages}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Next
// //           </button>
// //         </div>
// //       )}

// //       ---

// //       <Dialog.Root
// //         open={isPanelOpen}
// //         onOpenChange={(open) => {
// //           setIsPanelOpen(open);
// //           if (!open) {
// //             setSelectedTask(null);
// //             setSelectedTaskId(null);
// //           }
// //         }}
// //       >
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
// //           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
// //             {selectedTask && (
// //               <div className="space-y-6">
// //                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
// //                   <Dialog.Title className="text-2xl font-bold text-gray-900 leading-tight">
// //                     {selectedTask.name}
// //                   </Dialog.Title>
// //                   <Dialog.Close asChild>
// //                     <button
// //                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                       aria-label="Close"
// //                     >
// //                       <FaPlus className="rotate-45" />
// //                     </button>
// //                   </Dialog.Close>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
// //                   <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
// //                     <div className="col-span-2">
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.name}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
// //                       <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
// //                       <p className="text-gray-800 mt-1">
// //                         {format(parseISO(selectedTask.start), "MMM dd, yyyy")}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
// //                       <p className="text-gray-800 mt-1">
// //                         {format(parseISO(selectedTask.end), "MMM dd, yyyy")}
// //                       </p>
// //                     </div>
// //                     <div className="col-span-2">
// //                       <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
// //                       <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
// //                         <div
// //                           className="bg-blue-600 h-2.5 rounded-full"
// //                           style={{ width: `${selectedTask.progress}%` }}
// //                         ></div>
// //                       </div>
// //                       <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
// //                   <div className="flex flex-wrap gap-2">
// //                     {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
// //                       selectedTask.assigneeIds.map((id) => (
// //                         <Image
// //                           key={id}
// //                           src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //                           alt={assigneeMap[id]?.name || "Assignee"}
// //                           width={36}
// //                           height={36}
// //                           className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
// //                           title={assigneeMap[id]?.name || id}
// //                         />
// //                       ))
// //                     ) : (
// //                       <p className="text-gray-500 text-sm">No assignees.</p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
// //                   <div className="space-y-3">
// //                     {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
// //                     {selectedTask.subtasks?.map((s) => (
// //                       <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
// //                         <input
// //                           type="checkbox"
// //                           checked={s.completed}
// //                           onChange={() => toggleSubtask(selectedTask.id, s.id)}
// //                           className="hidden"
// //                         />
// //                         {s.completed ? (
// //                           <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
// //                         ) : (
// //                           <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
// //                         )}
// //                         <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
// //                           {s.title}
// //                         </span>
// //                       </label>
// //                     ))}
// //                     <div className="flex items-center gap-2 mt-4">
// //                       <input
// //                         type="text"
// //                         value={newSubtask}
// //                         onChange={(e) => setNewSubtask(e.target.value)}
// //                         placeholder="Add new subtask..."
// //                         className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// //                       />
// //                       <button
// //                         onClick={addSubtask}
// //                         className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
// //                         disabled={newSubtask.trim() === ""}
// //                       >
// //                         Add
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
// //                   <div className="space-y-3">
// //                     {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
// //                     {selectedTask.notes?.map((note, idx) => (
// //                       <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
// //                         <p className="text-gray-700">{note.content}</p>
// //                         <p className="text-xs text-gray-500 mt-1">
// //                           — {note.authorName || note.authorEmail || "Unknown"} on{" "}
// //                           {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
// //                         </p>
// //                       </div>
// //                     ))}
// //                     <div className="mt-4">
// //                       <textarea
// //                         value={newNote}
// //                         onChange={(e) => setNewNote(e.target.value)}
// //                         placeholder="Add a new note..."
// //                         rows={3}
// //                         className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
// //                       ></textarea>
// //                       <button
// //                         onClick={addNote}
// //                         className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
// //                         disabled={newNote.trim() === ""}
// //                       >
// //                         Add Note
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
// //                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// //                     {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
// //                     {selectedTask.attachments?.map((url, idx) => (
// //                       <AttachmentItem
// //                         key={url}
// //                         url={url}
// //                         index={idx}
// //                         onReupload={handleReuploadAttachment}
// //                         onDelete={handleDeleteAttachment}
// //                       />
// //                     ))}
// //                     <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
// //                       <FaPlus className="text-xl mb-1" />
// //                       Add new
// //                       <input
// //                         type="file"
// //                         accept="image/*,application/pdf"
// //                         className="hidden"
// //                         onChange={async (e) => {
// //                           const file = e.target.files?.[0];
// //                           if (file) {
// //                             await handleNewAttachmentUpload(file);
// //                             e.target.value = '';
// //                           }
// //                         }}
// //                       />
// //                     </label>
// //                   </div>
// //                   {uploadStatus && (
// //                     <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
// //                       {uploadStatus}
// //                     </p>
// //                   )}
// //                 </div>

// //                 {/* Payment Section */}
// //                 <div className="bg-white p-6 rounded-lg shadow-sm">
// //                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Payment</h3>
// //                   <form onSubmit={handlePaymentSubmit} className="space-y-4">
// //                     <div>
// //                       <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount:</label>
// //                       <input
// //                         type="number"
// //                         id="amount"
// //                         name="amount"
// //                         value={currentAmountInput}
// //                         onChange={(e) => setCurrentAmountInput(e.target.value)}
// //                         step="0.01"
// //                         placeholder="Total amount"
// //                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// //                       />
// //                     </div>
// //                     <div>
// //                       <label htmlFor="received" className="block text-sm font-medium text-gray-700">Received:</label>
// //                       <input
// //                         type="number"
// //                         id="received"
// //                         name="received"
// //                         value={currentReceivedInput}
// //                         onChange={(e) => setCurrentReceivedInput(e.target.value)}
// //                         step="0.01"
// //                         placeholder="Amount received"
// //                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// //                       />
// //                     </div>
// //                     <div>
// //                       <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-700">Payment Proof (Optional):</label>
// //                       <input
// //                         type="file"
// //                         id="paymentFile"
// //                         name="paymentFile"
// //                         accept="image/*,application/pdf"
// //                         className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
// //                       />
// //                     </div>
// //                     <button
// //                       type="submit"
// //                       className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// //                     >
// //                       Update Payment
// //                     </button>
// //                     {paymentUploadStatus && (
// //                       <p className={`mt-3 text-sm font-medium text-center ${paymentUploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
// //                         {paymentUploadStatus}
// //                       </p>
// //                     )}
// //                   </form>
// //                 </div>

// //                 {/* Payment History Section */}
// //                 {selectedTask.paymentHistory && selectedTask.paymentHistory.length > 0 ? (
// //                   <div className="mt-6 pt-6 border-t border-gray-200">
// //                     <h4 className="text-md font-semibold text-gray-800 mb-3">Payment History Log</h4>
// //                     <PaymentHistory
// //                       paymentHistory={selectedTask.paymentHistory}
// //                       taskTitle={selectedTask.name}
// //                     />
// //                   </div>
// //                 ) : (
// //                   <p className="text-gray-500 text-sm mt-6 pt-6 border-t border-gray-200">No payment history recorded for this task yet.</p>
// //                 )}

// //               </div>
// //             )}
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>

// //       {/* Confirmation Modal for Deleting Attachments */}
// //       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
// //           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
// //             <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</Dialog.Title>
// //             <Dialog.Description className="text-sm text-gray-600 mb-6">
// //               Are you sure you want to delete this attachment? This action cannot be undone.
// //             </Dialog.Description>
// //             <div className="flex justify-end gap-3">
// //               <Dialog.Close asChild>
// //                 <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
// //                   Cancel
// //                 </button>
// //               </Dialog.Close>
// //               <button
// //                 onClick={confirmDeleteAttachment}
// //                 className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>
// //     </div>
// //   );
// // }













































// // "use client";

// // import React, { useEffect, useState, useCallback, useMemo } from "react";
// // import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// // import Image from "next/image";
// // import * as Dialog from "@radix-ui/react-dialog";
// // import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// // import { useUser } from "@clerk/nextjs";
// // import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// // import PaymentHistory from "./PaymentHistory"; // Import the PaymentHistory component
// // import PaymentSection from "../components/PaymentSection"; // Import the PaymentSection component

// // interface Subtask {
// //   id: string;
// //   title: string;
// //   completed: boolean;
// // }

// // interface Note {
// //   id: string;
// //   content: string;
// //   authorName?: string;
// //   authorEmail?: string;
// //   createdAt?: string;
// // }

// // interface PaymentEntry {
// //   amount: number;
// //   received: number;
// //   updatedAt: string;
// //   updatedBy: string;
// //   fileUrl?: string | null;
// // }

// // interface Task {
// //   id: string;
// //   name: string;
// //   shop: string;
// //   customer: string;
// //   start: string;
// //   end: string;
// //   progress: number;
// //   assigneeIds?: string[];
// //   subtasks?: Subtask[];
// //   notes?: Note[];
// //   attachments?: string[];
// //   amount?: number;
// //   received?: number;
// //   paymentHistory?: PaymentEntry[];
// // }

// // interface AssigneeDetails {
// //   id: string;
// //   name: string;
// //   email: string;
// //   imageUrl: string;
// // }

// // const startDate = new Date("2025-07-10");
// // const endDate = new Date("2025-07-31");
// // const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// // const isImageUrl = (url: string) => {
// //   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// // };

// // interface AttachmentItemProps {
// //   url: string;
// //   index: number;
// //   onReupload: (oldUrl: string, file: File) => Promise<void>;
// //   onDelete: (url: string) => void;
// // }

// // const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
// //   const [showActions, setShowActions] = useState(false);

// //   return (
// //     <div
// //       onMouseEnter={() => setShowActions(true)}
// //       onMouseLeave={() => setShowActions(false)}
// //       className="relative group border border-gray-200 rounded-lg overflow-hidden"
// //     >
// //       <a
// //         href={url}
// //         target="_blank"
// //         rel="noopener noreferrer"
// //         className="block w-full h-24 flex items-center justify-center bg-gray-100"
// //       >
// //         {isImageUrl(url) ? (
// //           <img
// //             src={url}
// //             alt={`Attachment ${index + 1}`}
// //             className="w-full h-full object-cover transition"
// //           />
// //         ) : (
// //           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
// //             <FaFilePdf className="text-4xl text-red-500" />
// //             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
// //           </div>
// //         )}
// //       </a>

// //       {showActions && (
// //         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
// //           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
// //             <FaRedoAlt /> Reupload
// //             <input
// //               type="file"
// //               accept="image/*,application/pdf"
// //               className="hidden"
// //               onChange={async (e) => {
// //                 const file = e.target.files?.[0];
// //                 if (file) {
// //                   await onReupload(url, file);
// //                   e.target.value = '';
// //                 }
// //               }}
// //             />
// //           </label>

// //           <button
// //             onClick={() => onDelete(url)}
// //             className="flex items-center gap-1 hover:text-red-500 transition-colors"
// //           >
// //             <FaTrashAlt /> Delete
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
// //   if (ids.length === 0) return [];
// //   try {
// //     const res = await fetch('/api/assignees', {
// //       method: 'POST',
// //       body: JSON.stringify({ ids }),
// //       headers: { 'Content-Type': 'application/json' }
// //     });
// //     if (!res.ok) {
// //       const errorData = await res.json();
// //       console.error("Failed to fetch assignee details:", errorData.error);
// //       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
// //     }
// //     const data = await res.json();
// //     return data.assignees;
// //   } catch (error) {
// //     console.error("Error fetching assignee details:", error);
// //     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
// //   }
// // };


// // export default function TaskTimeline() {
// //   const { user, sessionClaims } = useUser();
// //   const [tasks, setTasks] = useState<Task[]>([]);
// //   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [zoom, setZoom] = useState(40);

// //   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
// //   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

// //   const [newNote, setNewNote] = useState("");
// //   const [newSubtask, setNewSubtask] = useState("");
// //   const [uploadStatus, setUploadStatus] = useState("");
// //   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");

// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [tasksPerPage, setTasksPerPage] = useState(10);
// //   const [totalPages, setTotalPages] = useState(1);

// //   const [isPanelOpen, setIsPanelOpen] = useState(false);

// //   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
// //   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);

// //   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});

// //   const [currentAmountInput, setCurrentAmountInput] = useState("");
// //   const [currentReceivedInput, setCurrentReceivedInput] = useState("");
// //   const [showPaymentHistory, setShowPaymentHistory] = useState(false);


// //   const [tasksVersion, setTasksVersion] = useState(0);

// //   useEffect(() => {
// //     if (selectedTask) {
// //       const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
// //       setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
// //       setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
// //     }
// //   }, [selectedTask]);


// //   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
// //     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, { cache: "no-store" });
// //     const data = await res.json();

// //     if (Array.isArray(data.tasks)) {
// //       setTasks(data.tasks);
// //       setTasksVersion(prev => prev + 1);
// //       setCurrentPage(data.page);
// //       setTotalPages(data.totalPages);

// //       if (isPanelOpen && selectedTaskId) {
// //         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
// //         setSelectedTask(updated || null);
// //         if (!updated) {
// //           setIsPanelOpen(false);
// //           setSelectedTaskId(null);
// //         }
// //       }
// //     } else {
// //       console.error("Failed to fetch tasks or invalid data format:", data);
// //       setTasks([]);
// //       setTotalPages(1);
// //       setSelectedTask(null);
// //       setSelectedTaskId(null);
// //       setIsPanelOpen(false);
// //     }
// //   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId]);

// //   useEffect(() => {
// //     fetchTasks(currentPage, tasksPerPage);
// //   }, [currentPage, tasksPerPage, fetchTasks]);

// //   useEffect(() => {
// //     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
// //     if (ids.length > 0) {
// //       fetchAssigneeDetails(ids).then((assignees) => {
// //         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
// //           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
// //         );
// //         setAssigneeMap(map);
// //       });
// //     } else {
// //       setAssigneeMap({});
// //     }
// //   }, [tasks]);

// //   const allAssignees = useMemo(() => {
// //     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
// //   }, [tasks]);

// //   const filteredTasks = useMemo(() => {
// //     let currentTasks = [...tasks];
// //     if (searchTerm) {
// //       const lowerSearchTerm = searchTerm.toLowerCase();
// //       currentTasks = currentTasks.filter(task =>
// //         task.name.toLowerCase().includes(lowerSearchTerm) ||
// //         task.shop.toLowerCase().includes(lowerSearchTerm) ||
// //         task.customer.toLowerCase().includes(lowerSearchTerm)
// //       );
// //     }
// //     if (selectedAvatar) {
// //       currentTasks = currentTasks.filter(task =>
// //         (task.assigneeIds || []).includes(selectedAvatar)
// //       );
// //     }
// //     return currentTasks;
// //   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);


// //   const handleTaskClick = useCallback(async (task: Task) => {
// //     setSelectedTaskId(task.id);
// //     setIsPanelOpen(true);
// //     setShowPaymentHistory(false); // Always hide history on new task selection

// //     try {
// //       // Fetch the full, latest task data from the backend
// //       const res = await fetch(`/api/timeline?id=${task.id}`);
// //       const data = await res.json();
// //       const fullTask = data.tasks?.[0]; // Assuming your API returns an array for a single ID

// //       if (fullTask) {
// //         setSelectedTask(fullTask);
// //       } else {
// //         // Fallback to the task object received from the table if fetch fails or returns empty
// //         console.warn("API did not return full task data, using existing task object.");
// //         setSelectedTask(task);
// //       }
// //     } catch (err) {
// //       console.error("Failed to fetch full task data:", err);
// //       // Fallback in case of a network error or other fetch issues
// //       setSelectedTask(task);
// //     }
// //   }, []);


// //   const updateSelectedTaskFromFetched = useCallback(async () => {
// //     if (selectedTask?.id) {
// //       const updatedRes = await fetch(`/api/timeline?id=${selectedTask.id}`);
// //       const updatedData = await updatedRes.json();
// //       const updatedTask = updatedData.tasks?.[0];
// //       if (updatedTask) {
// //         setSelectedTask(updatedTask);
// //       } else {
// //         await fetchTasks(currentPage, tasksPerPage);
// //       }
// //     } else {
// //       await fetchTasks(currentPage, tasksPerPage);
// //     }
// //   }, [selectedTask, fetchTasks, currentPage, tasksPerPage]);


// //   const toggleSubtask = async (taskId: string, subtaskId: string) => {
// //     await fetch(`/api/subtasks/${subtaskId}`, { method: "PATCH" });
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addSubtask = async () => {
// //     if (!selectedTask || newSubtask.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
// //       method: "POST",
// //       body: JSON.stringify({ title: newSubtask }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewSubtask("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };

// //   const addNote = async () => {
// //     if (!selectedTask || newNote.trim() === "") return;
// //     await fetch(`/api/tasks/${selectedTask.id}/notes`, {
// //       method: "POST",
// //       body: JSON.stringify({
// //         content: newNote,
// //         authorName: user?.fullName || "Anonymous",
// //         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
// //         createdAt: new Date().toISOString(),
// //       }),
// //       headers: { "Content-Type": "application/json" },
// //     });
// //     setNewNote("");
// //     await fetchTasks(currentPage, tasksPerPage);
// //     await updateSelectedTaskFromFetched();
// //   };


// //   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new file...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "PATCH",
// //         body: JSON.stringify({ oldUrl, newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File replaced!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 2000);
// //     } catch (err) {
// //       console.error("Error reuploading attachment:", err);
// //       setUploadStatus("❌ An error occurred during reupload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleNewAttachmentUpload = async (file: File) => {
// //     if (!selectedTask) return;
// //     setUploadStatus("Uploading new attachment...");
// //     try {
// //       const newUrl = await uploadToCloudinary(file, setUploadStatus);
// //       if (!newUrl) {
// //         setUploadStatus("❌ Cloudinary upload failed.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "POST",
// //         body: JSON.stringify({ url: newUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const responseText = await res.text();
// //       let data = null;
// //       try {
// //         data = responseText ? JSON.parse(responseText) : {};
// //       } catch (e) {
// //         console.error("Failed to parse JSON response:", e);
// //         setUploadStatus("❌ Server responded with invalid data.");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ New file uploaded successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     } catch (err) {
// //       console.error("Error uploading new attachment:", err);
// //       setUploadStatus("❌ An error occurred during new upload.");
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleDeleteAttachment = useCallback((url: string) => {
// //     if (!selectedTask) return;
// //     setAttachmentToDeleteUrl(url);
// //     setShowConfirmDeleteModal(true);
// //   }, [selectedTask]);

// //   const confirmDeleteAttachment = async () => {
// //     if (!selectedTask || !attachmentToDeleteUrl) return;

// //     setShowConfirmDeleteModal(false);
// //     setUploadStatus("Deleting file...");

// //     try {
// //       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
// //         method: "DELETE",
// //         body: JSON.stringify({ url: attachmentToDeleteUrl }),
// //         headers: { "Content-Type": "application/json" },
// //       });

// //       const text = await res.text();
// //       let data = null;
// //       try {
// //         data = text ? JSON.parse(text) : {};
// //       } catch (e) {
// //         console.error("Invalid JSON response", e);
// //         setUploadStatus("❌ Invalid server response");
// //         setTimeout(() => setUploadStatus(""), 3000);
// //         return;
// //       }

// //       if (!res.ok) {
// //         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
// //       } else {
// //         setUploadStatus("✅ File deleted successfully!");
// //         await fetchTasks(currentPage, tasksPerPage);
// //         await updateSelectedTaskFromFetched();
// //       }
// //     } catch (err) {
// //       console.error("Error deleting attachment:", err);
// //       setUploadStatus("❌ Error deleting attachment");
// //     } finally {
// //       setAttachmentToDeleteUrl(null);
// //       setTimeout(() => setUploadStatus(""), 3000);
// //     }
// //   };

// //   const handlePaymentSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!selectedTask) {
// //       setPaymentUploadStatus("No task selected.");
// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //       return;
// //     }

// //     const formData = new FormData();
// //     formData.append("amount", currentAmountInput);
// //     formData.append("received", currentReceivedInput);

// //     const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
// //     if (fileInput?.files?.[0]) {
// //       formData.append("file", fileInput.files[0]);
// //     }

// //     const userEmail = sessionClaims?.email as string || "Unknown User";

// //     const userName = sessionClaims?.firstName as string || userEmail;
// //     formData.append("updatedBy", userName);
// //     formData.append("updatedAt", new Date().toISOString());

// //     setPaymentUploadStatus("Processing payment update...");

// //     try {
// //       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       const data = await res.json();

// //       if (!res.ok) {
// //         throw new Error(data.error || "Payment update failed");
// //       }

// //       // Update the selectedTask state with the fresh data from the backend
// //       setSelectedTask(data.task);

// //       // Reset the form inputs
// //       setCurrentAmountInput("");
// //       setCurrentReceivedInput("");
// //       if (fileInput) fileInput.value = '';

// //       setPaymentUploadStatus("✅ Payment updated successfully!");
// //       setShowPaymentHistory(false); // Optionally hide history after new submission

// //     } catch (err: any) {
// //       console.error("Payment submission failed:", err);
// //       setPaymentUploadStatus(`❌ ${err.message || "An error occurred during payment update."}`);
// //     } finally {
// //       setTimeout(() => setPaymentUploadStatus(""), 3000);
// //     }
// //   };

// //   const handleTogglePaymentHistory = useCallback(async () => {
// //     if (!selectedTask?.id) return;

// //     try {
// //       const res = await fetch(`/api/timeline?id=${selectedTask.id}`); // Fetch specific task
// //       const data = await res.json();
// //       const freshTask = data.tasks?.[0]; // Assuming it returns an array for a single ID

// //       if (freshTask) {
// //         setSelectedTask(freshTask); // Update state with fresh data
// //         setShowPaymentHistory((prev) => !prev);
// //       } else {
// //         console.error("Failed to fetch fresh task data for payment history.");
// //         setShowPaymentHistory((prev) => !prev); // Still toggle the view
// //       }
// //     } catch (error) {
// //       console.error("Error fetching fresh task data for payment history:", error);
// //       setShowPaymentHistory((prev) => !prev); // Still toggle the view
// //     }
// //   }, [selectedTask]);


// //   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     const newLimit = parseInt(e.target.value, 10);
// //     setTasksPerPage(newLimit);
// //     setCurrentPage(1);
// //   };

// //   const handlePageChange = (pageNumber: number) => {
// //     setCurrentPage(pageNumber);
// //   };

// //   const pageNumbers = useMemo(() => {
// //     const pages = [];
// //     const maxPagesToShow = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
// //     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

// //     if (endPage - startPage + 1 < maxPagesToShow) {
// //       startPage = Math.max(1, endPage - maxPagesToShow + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }
// //     return pages;
// //   }, [totalPages, currentPage]);


// //   return (
// //     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
// //       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //         <div className="flex items-center gap-3">
// //           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
// //           {allAssignees.map((id) => (
// //             <Image
// //               key={id}
// //               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //               alt={assigneeMap[id]?.name || "Assignee Avatar"}
// //               width={32}
// //               height={32}
// //               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
// //                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
// //               }`}
// //               onClick={() =>
// //                 setSelectedAvatar((prev) => (prev === id ? null : id))
// //               }
// //               title={assigneeMap[id]?.name || id}
// //             />
// //           ))}
// //         </div>

// //         <input
// //           type="text"
// //           placeholder="Search tasks..."
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
// //         />

// //         <div className="flex items-center gap-2">
// //           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
// //           <select
// //             id="tasksPerPage"
// //             value={tasksPerPage}
// //             onChange={handleTasksPerPageChange}
// //             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
// //           >
// //             <option value={5}>5</option>
// //             <option value={10}>10</option>
// //             <option value={15}>15</option>
// //             <option value={20}>20</option>
// //             <option value={50}>50</option>
// //           </select>
// //         </div>

// //         <div className="flex items-center gap-2">
// //           <label className="text-sm text-gray-500">Zoom:</label>
// //           <input
// //             type="range"
// //             min={20}
// //             max={100}
// //             value={zoom}
// //             onChange={(e) => setZoom(Number(e.target.value))}
// //             className="w-24"
// //           />
// //         </div>
// //       </div>

// //       <hr className="my-4" />

// //       <table className="min-w-full border-collapse border border-gray-200">
// //         <thead>
// //           <tr className="bg-gray-100">
// //             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
// //             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
// //             {Array.from({ length: totalDays }).map((_, i) => {
// //               const current = addDays(startDate, i);
// //               const isTodayColumn = isToday(current);
// //               return (
// //                 <th
// //                   key={i}
// //                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
// //                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
// //                   }`}
// //                   style={{ minWidth: `${zoom}px` }}
// //                 >
// //                   {format(current, "dd")}
// //                 </th>
// //               );
// //             })}
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredTasks.length === 0 ? (
// //             <tr>
// //               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
// //                 No tasks found with current filters or on this page.
// //               </td>
// //             </tr>
// //           ) : (
// //             filteredTasks.map((task, index) => {
// //               const startOffset = Math.max(
// //                 0,
// //                 differenceInCalendarDays(new Date(task.start), startDate)
// //               );
// //               const duration =
// //                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

// //               return (
// //                 <tr key={task.id} className="h-12 border-b border-gray-200">
// //                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
// //                     {(currentPage - 1) * tasksPerPage + index + 1}
// //                   </td>
// //                   <td
// //                     onClick={() => handleTaskClick(task)}
// //                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
// //                   >
// //                     <div className="font-semibold text-[13px] text-gray-800 truncate">
// //                       📁 {task.name}
// //                     </div>
// //                     <div className="text-[11px] text-gray-500 truncate">
// //                       🏪 {task.shop} / 👤 {task.customer}
// //                     </div>
// //                   </td>
// //                   {Array.from({ length: totalDays }).map((_, i) => {
// //                     const isBar = i >= startOffset && i < startOffset + duration;
// //                     const bgColor =
// //                       task.progress === 100
// //                         ? "bg-green-500"
// //                         : task.progress > 0
// //                         ? "bg-blue-500"
// //                         : "bg-gray-300";

// //                     return (
// //                       <td
// //                         key={i}
// //                         onClick={() => handleTaskClick(task)}
// //                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
// //                       >
// //                         {isBar && (
// //                           <div
// //                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
// //                             style={{ width: `${task.progress}%` }}
// //                           >
// //                             {task.progress}%
// //                           </div>
// //                         )}
// //                       </td>
// //                     );
// //                   })}
// //                 </tr>
// //               );
// //             })
// //           )}
// //         </tbody>
// //       </table>

// //       <hr className="my-4" />

// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
// //           <button
// //             onClick={() => handlePageChange(currentPage - 1)}
// //             disabled={currentPage === 1}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Previous
// //           </button>
// //           <div className="flex gap-1">
// //             {pageNumbers.map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
// //                   currentPage === page
// //                     ? "bg-blue-600 text-white shadow-sm"
// //                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
// //                 } transition-all`}
// //               >
// //                 {page}
// //               </button>
// //             ))}
// //           </div>
// //           <button
// //             onClick={() => handlePageChange(currentPage + 1)}
// //             disabled={currentPage === totalPages}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
// //           >
// //             Next
// //           </button>
// //         </div>
// //       )}

// //       <hr className="my-4" />

// //       {/* Main Task Detail Dialog */}
// //       <Dialog.Root
// //         open={isPanelOpen}
// //         onOpenChange={(open) => {
// //           setIsPanelOpen(open);
// //           if (!open) {
// //             setSelectedTask(null);
// //             setSelectedTaskId(null);
// //           }
// //         }}
// //       >
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
// //           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
// //             {/* Add the screen-reader-only Dialog.Title directly here */}
// //             <Dialog.Title className="sr-only">Task Details</Dialog.Title>

// //             {selectedTask && (
// //               <>
// //                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
// //                   {/* Your existing visible title (now an h2) */}
// //                   <h2 className="text-2xl font-bold text-gray-900 leading-tight">
// //                     {selectedTask.name}
// //                   </h2>
// //                   <Dialog.Close asChild>
// //                     <button
// //                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                       aria-label="Close"
// //                     >
// //                       <FaPlus className="rotate-45" />
// //                     </button>
// //                   </Dialog.Close>
// //                 </div>

// //                 {/* Rest of the dialog content, now correctly spaced below the title/close button */}
// //                 <div className="space-y-6 mt-4">
// //                   <div className="bg-white p-6 rounded-lg shadow-sm">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
// //                     <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
// //                       <div className="col-span-2">
// //                         <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
// //                         <p className="text-gray-800 mt-1">{selectedTask.name}</p>
// //                       </div>
// //                       <div>
// //                         <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
// //                         <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
// //                       </div>
// //                       <div>
// //                         <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
// //                         <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
// //                       </div>
// //                       <div>
// //                         <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
// //                         <p className="text-gray-800 mt-1">
// //                           {selectedTask.start ? format(parseISO(selectedTask.start), "MMM dd, yyyy") : "N/A"}
// //                         </p>
// //                       </div>
// //                       <div>
// //                         <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
// //                         <p className="text-gray-800 mt-1">
// //                           {selectedTask.end ? format(parseISO(selectedTask.end), "MMM dd, yyyy") : "N/A"}
// //                         </p>
// //                       </div>
// //                       <div className="col-span-2">
// //                         <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
// //                         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
// //                           <div
// //                             className="bg-blue-600 h-2.5 rounded-full"
// //                             style={{ width: `${selectedTask.progress}%` }}
// //                           ></div>
// //                         </div>
// //                         <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="bg-white p-6 rounded-lg shadow-sm">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
// //                     <div className="flex flex-wrap gap-2">
// //                       {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
// //                         selectedTask.assigneeIds.map((id) => (
// //                           <Image
// //                             key={id}
// //                             src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
// //                             alt={assigneeMap[id]?.name || "Assignee"}
// //                             width={36}
// //                             height={36}
// //                             className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
// //                             title={assigneeMap[id]?.name || id}
// //                           />
// //                         ))
// //                       ) : (
// //                         <p className="text-gray-500 text-sm">No assignees.</p>
// //                       )}
// //                     </div>
// //                   </div>

// //                   <div className="bg-white p-6 rounded-lg shadow-sm">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
// //                     <div className="space-y-3">
// //                       {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
// //                       {selectedTask.subtasks?.map((s) => (
// //                         <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
// //                           <input
// //                             type="checkbox"
// //                             checked={s.completed}
// //                             onChange={() => toggleSubtask(selectedTask.id, s.id)}
// //                             className="hidden"
// //                           />
// //                           {s.completed ? (
// //                             <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
// //                           ) : (
// //                             <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
// //                           )}
// //                           <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
// //                             {s.title}
// //                           </span>
// //                         </label>
// //                       ))}
// //                       <div className="flex items-center gap-2 mt-4">
// //                         <input
// //                           type="text"
// //                           value={newSubtask}
// //                           onChange={(e) => setNewSubtask(e.target.value)}
// //                           placeholder="Add new subtask..."
// //                           className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// //                         />
// //                         <button
// //                           onClick={addSubtask}
// //                           className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
// //                           disabled={newSubtask.trim() === ""}
// //                         >
// //                           Add
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="bg-white p-6 rounded-lg shadow-sm">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
// //                     <div className="space-y-3">
// //                       {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
// //                       {selectedTask.notes?.map((note, idx) => (
// //                         <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
// //                           <p className="text-gray-700">{note.content}</p>
// //                           <p className="text-xs text-gray-500 mt-1">
// //                             — {note.authorName || note.authorEmail || "Unknown"} on{" "}
// //                             {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
// //                           </p>
// //                         </div>
// //                       ))}
// //                       <div className="mt-4">
// //                         <textarea
// //                           value={newNote}
// //                           onChange={(e) => setNewNote(e.target.value)}
// //                           placeholder="Add a new note..."
// //                           rows={3}
// //                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
// //                         ></textarea>
// //                         <button
// //                           onClick={addNote}
// //                           className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
// //                           disabled={newNote.trim() === ""}
// //                         >
// //                           Add Note
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="bg-white p-6 rounded-lg shadow-sm">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
// //                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// //                       {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
// //                       {selectedTask.attachments?.map((url, idx) => (
// //                         <AttachmentItem
// //                           key={url}
// //                           url={url}
// //                           index={idx}
// //                           onReupload={handleReuploadAttachment}
// //                           onDelete={handleDeleteAttachment}
// //                         />
// //                       ))}
// //                       <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
// //                         <FaPlus className="text-xl mb-1" />
// //                         Add new
// //                         <input
// //                           type="file"
// //                           accept="image/*,application/pdf"
// //                           className="hidden"
// //                           onChange={async (e) => {
// //                             const file = e.target.files?.[0];
// //                             if (file) {
// //                               await handleNewAttachmentUpload(file);
// //                               e.target.value = '';
// //                             }
// //                           }}
// //                         />
// //                       </label>
// //                     </div>
// //                     {uploadStatus && (
// //                       <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
// //                         {uploadStatus}
// //                       </p>
// //                     )}
// //                   </div>

// //                   <PaymentSection
// //                     selectedTask={selectedTask}
// //                     user={user}
// //                     amount={currentAmountInput}
// //                     setAmount={setCurrentAmountInput}
// //                     received={currentReceivedInput}
// //                     setReceived={setCurrentReceivedInput}
// //                     paymentUploadStatus={paymentUploadStatus}
// //                     setPaymentUploadStatus={setPaymentUploadStatus}
// //                     handlePaymentSubmit={handlePaymentSubmit}
// //                     showPaymentHistory={showPaymentHistory}
// //                     setShowPaymentHistory={setShowPaymentHistory}
// //                     // Pass the new toggle function
// //                     handleTogglePaymentHistory={handleTogglePaymentHistory}
// //                   />

// //                 </div>
// //               </>
// //             )}
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>

// //       {/* Confirm Delete Modal Dialog */}
// //       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
// //         <Dialog.Portal>
// //           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
// //           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
// //             {/* Dialog.Title for confirm delete modal is correctly placed and always rendered when Dialog.Content is open */}
// //             <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
// //               Confirm Deletion
// //             </Dialog.Title>
// //             <Dialog.Description className="text-sm text-gray-600 mb-6">
// //               Are you sure you want to delete this attachment? This action cannot be undone.
// //             </Dialog.Description>
// //             <div className="flex justify-end gap-3">
// //               <Dialog.Close asChild>
// //                 <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
// //                   Cancel
// //                 </button>
// //               </Dialog.Close>
// //               <button
// //                 onClick={confirmDeleteAttachment}
// //                 className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           </Dialog.Content>
// //         </Dialog.Portal>
// //       </Dialog.Root>
// //     </div>
// //   );
// // }






























































// "use client";

// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { Paintbrush } from "lucide-react";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// import Image from "next/image";
// import * as Dialog from "@radix-ui/react-dialog";
// import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// import { useUser } from "@clerk/nextjs";
// import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// import PaymentHistory from "./PaymentHistory"; // Import the PaymentHistory component
// import PaymentSection from "../components/PaymentSection"; // Import the PaymentSection component

// interface Subtask {
//   id: string;
//   title: string;
//   completed: boolean;
// }

// interface Note {
//   id: string;
//   content: string;
//   authorName?: string;
//   authorEmail?: string;
//   createdAt?: string;
// }

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: Subtask[];
//   notes?: Note[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[];
// }

// interface AssigneeDetails {
//   id: string;
//   name: string;
//   email: string;
//   imageUrl: string;
// }

// const startDate = new Date("2025-07-10");
// const endDate = new Date("2025-07-31");
// const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// const isImageUrl = (url: string) => {
//   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// };

// interface AttachmentItemProps {
//   url: string;
//   index: number;
//   onReupload: (oldUrl: string, file: File) => Promise<void>;
//   onDelete: (url: string) => void;
// }

// const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
//   const [showActions, setShowActions] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//       className="relative group border border-gray-200 rounded-lg overflow-hidden"
//     >
//       <a
//         href={url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="block w-full h-24 flex items-center justify-center bg-gray-100"
//       >
//         {isImageUrl(url) ? (
//           <img
//             src={url}
//             alt={`Attachment ${index + 1}`}
//             className="w-full h-full object-cover transition"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
//             <FaFilePdf className="text-4xl text-red-500" />
//             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
//           </div>
//         )}
//       </a>

//       {showActions && (
//         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
//           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
//             <FaRedoAlt /> Reupload
//             <input
//               type="file"
//               accept="image/*,application/pdf"
//               className="hidden"
//               onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (file) {
//                   await onReupload(url, file);
//                   e.target.value = '';
//                 }
//               }}
//             />
//           </label>

//           <button
//             onClick={() => onDelete(url)}
//             className="flex items-center gap-1 hover:text-red-500 transition-colors"
//           >
//             <FaTrashAlt /> Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
//   if (ids.length === 0) return [];
//   try {
//     const res = await fetch('/api/assignees', {
//       method: 'POST',
//       body: JSON.stringify({ ids }),
//       headers: { 'Content-Type': 'application/json' }
//     });
//     if (!res.ok) {
//       const errorData = await res.json();
//       console.error("Failed to fetch assignee details:", errorData.error);
//       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//     }
//     const data = await res.json();
//     return data.assignees;
//   } catch (error) {
//     console.error("Error fetching assignee details:", error);
//     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//   }
// };


// export default function TaskTimeline() {
//   const { user, sessionClaims } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [zoom, setZoom] = useState(40);

//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

//   const [newNote, setNewNote] = useState("");
//   const [newSubtask, setNewSubtask] = useState("");
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [tasksPerPage, setTasksPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);

//   const [isPanelOpen, setIsPanelOpen] = useState(false);

//   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
//   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);

//   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});

//   const [currentAmountInput, setCurrentAmountInput] = useState("");
//   const [currentReceivedInput, setCurrentReceivedInput] = useState("");
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);


//   const [tasksVersion, setTasksVersion] = useState(0);
//   const [taskColors, setTaskColors] = useState<Record<string, string>>({});


//   useEffect(() => {
//     if (selectedTask) {
//       const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
//       setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
//       setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
//     }
//   }, [selectedTask]);


//   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
//     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, { cache: "no-store" });
//     const data = await res.json();

//     if (Array.isArray(data.tasks)) {
//       setTasks(data.tasks);
//       setTasksVersion(prev => prev + 1);
//       setCurrentPage(data.page);
//       setTotalPages(data.totalPages);

//       if (isPanelOpen && selectedTaskId) {
//         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
//         setSelectedTask(updated || null);
//         if (!updated) {
//           setIsPanelOpen(false);
//           setSelectedTaskId(null);
//         }
//       }
//     } else {
//       console.error("Failed to fetch tasks or invalid data format:", data);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//     }
//   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId]);

//   useEffect(() => {
//     fetchTasks(currentPage, tasksPerPage);
//   }, [currentPage, tasksPerPage, fetchTasks]);

//   useEffect(() => {
//     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//     if (ids.length > 0) {
//       fetchAssigneeDetails(ids).then((assignees) => {
//         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
//           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
//         );
//         setAssigneeMap(map);
//       });
//     } else {
//       setAssigneeMap({});
//     }
//   }, [tasks]);



  
//   const allAssignees = useMemo(() => {
//     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//   }, [tasks]);

//   const filteredTasks = useMemo(() => {
//     let currentTasks = [...tasks];
//     if (searchTerm) {
//       const lowerSearchTerm = searchTerm.toLowerCase();
//       currentTasks = currentTasks.filter(task =>
//         task.name.toLowerCase().includes(lowerSearchTerm) ||
//         task.shop.toLowerCase().includes(lowerSearchTerm) ||
//         task.customer.toLowerCase().includes(lowerSearchTerm)
//       );
//     }
//     if (selectedAvatar) {
//       currentTasks = currentTasks.filter(task =>
//         (task.assigneeIds || []).includes(selectedAvatar)
//       );
//     }
//     return currentTasks;
//   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);


//   const handleTaskClick = useCallback(async (task: Task) => {
//     setSelectedTaskId(task.id);
//     setIsPanelOpen(true);
//     setShowPaymentHistory(false); // Always hide history on new task selection

//     try {
//       // Fetch the full, latest task data from the backend
//       const res = await fetch(`/api/timeline?id=${task.id}`);
//       const data = await res.json();
//       const fullTask = data.tasks?.[0]; // Assuming your API returns an array for a single ID

//       if (fullTask) {
//         setSelectedTask(fullTask);
//       } else {
//         // Fallback to the task object received from the table if fetch fails or returns empty
//         console.warn("API did not return full task data, using existing task object.");
//         setSelectedTask(task);
//       }
//     } catch (err) {
//       console.error("Failed to fetch full task data:", err);
//       // Fallback in case of a network error or other fetch issues
//       setSelectedTask(task);
//     }
//   }, []);


//   const updateSelectedTaskFromFetched = useCallback(async () => {
//     if (selectedTask?.id) {
//       const updatedRes = await fetch(`/api/timeline?id=${selectedTask.id}`);
//       const updatedData = await updatedRes.json();
//       const updatedTask = updatedData.tasks?.[0];
//       if (updatedTask) {
//         setSelectedTask(updatedTask);
//       } else {
//         await fetchTasks(currentPage, tasksPerPage);
//       }
//     } else {
//       await fetchTasks(currentPage, tasksPerPage);
//     }
//   }, [selectedTask, fetchTasks, currentPage, tasksPerPage]);


//   const toggleSubtask = async (taskId: string, subtaskId: string) => {
//     await fetch(`/api/subtasks/${subtaskId}`, { method: "PATCH" });
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addSubtask = async () => {
//     if (!selectedTask || newSubtask.trim() === "") return;
//     await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
//       method: "POST",
//       body: JSON.stringify({ title: newSubtask }),
//       headers: { "Content-Type": "application/json" },
//     });
//     setNewSubtask("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addNote = async () => {
//     if (!selectedTask || newNote.trim() === "") return;
//     await fetch(`/api/tasks/${selectedTask.id}/notes`, {
//       method: "POST",
//       body: JSON.stringify({
//         content: newNote,
//         authorName: user?.fullName || "Anonymous",
//         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
//         createdAt: new Date().toISOString(),
//       }),
//       headers: { "Content-Type": "application/json" },
//     });
//     setNewNote("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };


//   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new file...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "PATCH",
//         body: JSON.stringify({ oldUrl, newUrl }),
//         headers: { "Content-Type": "application/json" },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File replaced!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 2000);
//     } catch (err) {
//       console.error("Error reuploading attachment:", err);
//       setUploadStatus("❌ An error occurred during reupload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleNewAttachmentUpload = async (file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new attachment...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "POST",
//         body: JSON.stringify({ url: newUrl }),
//         headers: { "Content-Type": "application/json" },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ New file uploaded successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 3000);
//     } catch (err) {
//       console.error("Error uploading new attachment:", err);
//       setUploadStatus("❌ An error occurred during new upload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleDeleteAttachment = useCallback((url: string) => {
//     if (!selectedTask) return;
//     setAttachmentToDeleteUrl(url);
//     setShowConfirmDeleteModal(true);
//   }, [selectedTask]);

//   const confirmDeleteAttachment = async () => {
//     if (!selectedTask || !attachmentToDeleteUrl) return;

//     setShowConfirmDeleteModal(false);
//     setUploadStatus("Deleting file...");

//     try {
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "DELETE",
//         body: JSON.stringify({ url: attachmentToDeleteUrl }),
//         headers: { "Content-Type": "application/json" },
//       });

//       const text = await res.text();
//       let data = null;
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         console.error("Invalid JSON response", e);
//         setUploadStatus("❌ Invalid server response");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File deleted successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//     } catch (err) {
//       console.error("Error deleting attachment:", err);
//       setUploadStatus("❌ Error deleting attachment");
//     } finally {
//       setAttachmentToDeleteUrl(null);
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handlePaymentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedTask) {
//       setPaymentUploadStatus("No task selected.");
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("amount", currentAmountInput);
//     formData.append("received", currentReceivedInput);

//     const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
//     if (fileInput?.files?.[0]) {
//       formData.append("file", fileInput.files[0]);
//     }

//     const userEmail = sessionClaims?.email as string || "Unknown User";

//     const userName = sessionClaims?.firstName as string || userEmail;
//     formData.append("updatedBy", userName);
//     formData.append("updatedAt", new Date().toISOString());

//     setPaymentUploadStatus("Processing payment update...");

//     try {
//       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Payment update failed");
//       }

//       // Update the selectedTask state with the fresh data from the backend
//       setSelectedTask(data.task);

//       // Reset the form inputs
//       setCurrentAmountInput("");
//       setCurrentReceivedInput("");
//       if (fileInput) fileInput.value = '';

//       setPaymentUploadStatus("✅ Payment updated successfully!");
//       setShowPaymentHistory(false); // Optionally hide history after new submission

//     } catch (err: any) {
//       console.error("Payment submission failed:", err);
//       setPaymentUploadStatus(`❌ ${err.message || "An error occurred during payment update."}`);
//     } finally {
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//     }
//   };

//   const handleTogglePaymentHistory = useCallback(async () => {
//     if (!selectedTask?.id) return;

//     try {
//       const res = await fetch(`/api/timeline?id=${selectedTask.id}`); // Fetch specific task
//       const data = await res.json();
//       const freshTask = data.tasks?.[0]; // Assuming it returns an array for a single ID

//       if (freshTask) {
//         setSelectedTask(freshTask); // Update state with fresh data
//         setShowPaymentHistory((prev) => !prev);
//       } else {
//         console.error("Failed to fetch fresh task data for payment history.");
//         setShowPaymentHistory((prev) => !prev); // Still toggle the view
//       }
//     } catch (error) {
//       console.error("Error fetching fresh task data for payment history:", error);
//       setShowPaymentHistory((prev) => !prev); // Still toggle the view
//     }
//   }, [selectedTask]);


//   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newLimit = parseInt(e.target.value, 10);
//     setTasksPerPage(newLimit);
//     setCurrentPage(1);
//   };

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   const pageNumbers = useMemo(() => {
//     const pages = [];
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }, [totalPages, currentPage]);


//   return (
//     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
//           {allAssignees.map((id) => (
//             <Image
//               key={id}
//               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//               alt={assigneeMap[id]?.name || "Assignee Avatar"}
//               width={32}
//               height={32}
//               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
//                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
//               }`}
//               onClick={() =>
//                 setSelectedAvatar((prev) => (prev === id ? null : id))
//               }
//               title={assigneeMap[id]?.name || id}
//             />
//           ))}
//         </div>

//         <input
//           type="text"
//           placeholder="Search tasks..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
//         />

//         <div className="flex items-center gap-2">
//           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
//           <select
//             id="tasksPerPage"
//             value={tasksPerPage}
//             onChange={handleTasksPerPageChange}
//             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={15}>15</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </div>

//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-500">Zoom:</label>
//           <input
//             type="range"
//             min={20}
//             max={100}
//             value={zoom}
//             onChange={(e) => setZoom(Number(e.target.value))}
//             className="w-24"
//           />
//         </div>
//       </div>














      

//       <hr className="my-4" />

//       <table className="min-w-full border-collapse border border-gray-200">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
//             {Array.from({ length: totalDays }).map((_, i) => {
//               const current = addDays(startDate, i);
//               const isTodayColumn = isToday(current);
//               return (
//                 <th
//                   key={i}
//                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
//                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
//                   }`}
//                   style={{ minWidth: `${zoom}px` }}
//                 >
//                   {format(current, "dd")}
//                 </th>
//               );
//             })}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTasks.length === 0 ? (
//             <tr>
//               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
//                 No tasks found with current filters or on this page.
//               </td>
//             </tr>
//           ) : (
//             filteredTasks.map((task, index) => {
//               const startOffset = Math.max(
//                 0,
//                 differenceInCalendarDays(new Date(task.start), startDate)
//               );
//               const duration =
//                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

//               return (
//                 <tr key={task.id} className="h-12 border-b border-gray-200">
//                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
//                     {(currentPage - 1) * tasksPerPage + index + 1}
//                   </td>
//                   <td
//                     onClick={() => handleTaskClick(task)}
//                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
//                   >
//                     <div className="font-semibold text-[13px] text-gray-800 truncate">
//                       📁 {task.name}
//                     </div>
//                     <div className="text-[11px] text-gray-500 truncate">
//                       🏪 {task.shop} / 👤 {task.customer}
//                     </div>
//                   </td>
//                   {Array.from({ length: totalDays }).map((_, i) => {
//                     const isBar = i >= startOffset && i < startOffset + duration;
//                     const bgColor =
//                       task.progress === 100
//                         ? "bg-green-500"
//                         : task.progress > 0
//                         ? "bg-blue-500"
//                         : "bg-gray-300";

//                     return (
//                       <td
//                         key={i}
//                         onClick={() => handleTaskClick(task)}
//                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
//                       >
//                         {isBar && (
//                           <div
//                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
//                             style={{ width: `${task.progress}%` }}
//                           >
//                             {task.progress}%
//                           </div>
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>

//       <hr className="my-4" />

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Previous
//           </button>
//           <div className="flex gap-1">
//             {pageNumbers.map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
//                   currentPage === page
//                     ? "bg-blue-600 text-white shadow-sm"
//                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
//                 } transition-all`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <hr className="my-4" />

//       {/* Main Task Detail Dialog */}
//       <Dialog.Root
//         open={isPanelOpen}
//         onOpenChange={(open) => {
//           setIsPanelOpen(open);
//           if (!open) {
//             setSelectedTask(null);
//             setSelectedTaskId(null);
//           }
//         }}
//       >
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
//           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
//             {/* Add the screen-reader-only Dialog.Title directly here */}
//             <Dialog.Title className="sr-only">Task Details</Dialog.Title>

//             {selectedTask && (
//               <>
//                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
//                   {/* Your existing visible title (now an h2) */}
//                   <h2 className="text-2xl font-bold text-gray-900 leading-tight">
//                     {selectedTask.name}
//                   </h2>
//                   <Dialog.Close asChild>
//                     <button
//                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       aria-label="Close"
//                     >
//                       <FaPlus className="rotate-45" />
//                     </button>
//                   </Dialog.Close>
//                 </div>

//                 {/* Rest of the dialog content, now correctly spaced below the title/close button */}
//                 <div className="space-y-6 mt-4">
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
//                     <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.name}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.start ? format(parseISO(selectedTask.start), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.end ? format(parseISO(selectedTask.end), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
//                         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
//                           <div
//                             className="bg-blue-600 h-2.5 rounded-full"
//                             style={{ width: `${selectedTask.progress}%` }}
//                           ></div>
//                         </div>
//                         <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
//                         selectedTask.assigneeIds.map((id) => (
//                           <Image
//                             key={id}
//                             src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//                             alt={assigneeMap[id]?.name || "Assignee"}
//                             width={36}
//                             height={36}
//                             className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
//                             title={assigneeMap[id]?.name || id}
//                           />
//                         ))
//                       ) : (
//                         <p className="text-gray-500 text-sm">No assignees.</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
//                     <div className="space-y-3">
//                       {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
//                       {selectedTask.subtasks?.map((s) => (
//                         <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
//                           <input
//                             type="checkbox"
//                             checked={s.completed}
//                             onChange={() => toggleSubtask(selectedTask.id, s.id)}
//                             className="hidden"
//                           />
//                           {s.completed ? (
//                             <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//                           ) : (
//                             <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
//                           )}
//                           <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
//                             {s.title}
//                           </span>
//                         </label>
//                       ))}
//                       <div className="flex items-center gap-2 mt-4">
//                         <input
//                           type="text"
//                           value={newSubtask}
//                           onChange={(e) => setNewSubtask(e.target.value)}
//                           placeholder="Add new subtask..."
//                           className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         <button
//                           onClick={addSubtask}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newSubtask.trim() === ""}
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
//                     <div className="space-y-3">
//                       {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
//                       {selectedTask.notes?.map((note, idx) => (
//                         <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
//                           <p className="text-gray-700">{note.content}</p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             — {note.authorName || note.authorEmail || "Unknown"} on{" "}
//                             {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
//                           </p>
//                         </div>
//                       ))}
//                       <div className="mt-4">
//                         <textarea
//                           value={newNote}
//                           onChange={(e) => setNewNote(e.target.value)}
//                           placeholder="Add a new note..."
//                           rows={3}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
//                         ></textarea>
//                         <button
//                           onClick={addNote}
//                           className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newNote.trim() === ""}
//                         >
//                           Add Note
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                       {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
//                       {selectedTask.attachments?.map((url, idx) => (
//                         <AttachmentItem
//                           key={url}
//                           url={url}
//                           index={idx}
//                           onReupload={handleReuploadAttachment}
//                           onDelete={handleDeleteAttachment}
//                         />
//                       ))}
//                       <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
//                         <FaPlus className="text-xl mb-1" />
//                         Add new
//                         <input
//                           type="file"
//                           accept="image/*,application/pdf"
//                           className="hidden"
//                           onChange={async (e) => {
//                             const file = e.target.files?.[0];
//                             if (file) {
//                               await handleNewAttachmentUpload(file);
//                               e.target.value = '';
//                             }
//                           }}
//                         />
//                       </label>
//                     </div>
//                     {uploadStatus && (
//                       <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
//                         {uploadStatus}
//                       </p>
//                     )}
//                   </div>

//                   <PaymentSection
//                     selectedTask={selectedTask}
//                     user={user}
//                     amount={currentAmountInput}
//                     setAmount={setCurrentAmountInput}
//                     received={currentReceivedInput}
//                     setReceived={setCurrentReceivedInput}
//                     paymentUploadStatus={paymentUploadStatus}
//                     setPaymentUploadStatus={setPaymentUploadStatus}
//                     handlePaymentSubmit={handlePaymentSubmit}
//                     showPaymentHistory={showPaymentHistory}
//                     setShowPaymentHistory={setShowPaymentHistory}
//                     // Pass the new toggle function
//                     handleTogglePaymentHistory={handleTogglePaymentHistory}
//                   />

//                 </div>
//               </>
//             )}
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>

//       {/* Confirm Delete Modal Dialog */}
//       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
//           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
//             {/* Dialog.Title for confirm delete modal is correctly placed and always rendered when Dialog.Content is open */}
//             <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
//               Confirm Deletion
//             </Dialog.Title>
//             <Dialog.Description className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete this attachment? This action cannot be undone.
//             </Dialog.Description>
//             <div className="flex justify-end gap-3">
//               <Dialog.Close asChild>
//                 <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
//                   Cancel
//                 </button>
//               </Dialog.Close>
//               <button
//                 onClick={confirmDeleteAttachment}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>
//     </div>
//   );
// }


































// // components/TaskTimeline.tsx
// "use client"; // This component runs on the client-side

// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { Paintbrush } from "lucide-react";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// import Image from "next/image";
// import * as Dialog from "@radix-ui/react-dialog"; // Corrected import syntax
// import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// import { useUser, useAuth } from "@clerk/nextjs"; // Import useAuth
// import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// import PaymentHistory from "./PaymentHistory";
// import PaymentSection from "../components/PaymentSection";

// interface Subtask {
//   id: string;
//   title: string;
//   completed: boolean;
// }

// interface Note {
//   id: string;
//   content: string;
//   authorName?: string;
//   authorEmail?: string;
//   createdAt?: string;
// }

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: Subtask[];
//   notes?: Note[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[];
// }

// interface AssigneeDetails {
//   id: string;
//   name: string;
//   email: string;
//   imageUrl: string;
// }

// const startDate = new Date("2025-07-10");
// const endDate = new Date("2025-07-31");
// const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// const isImageUrl = (url: string) => {
//   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// };

// interface AttachmentItemProps {
//   url: string;
//   index: number;
//   onReupload: (oldUrl: string, file: File) => Promise<void>;
//   onDelete: (url: string) => void;
// }

// const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
//   const [showActions, setShowActions] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//       className="relative group border border-gray-200 rounded-lg overflow-hidden"
//     >
//       <a
//         href={url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="block w-full h-24 flex items-center justify-center bg-gray-100"
//       >
//         {isImageUrl(url) ? (
//           <img
//             src={url}
//             alt={`Attachment ${index + 1}`}
//             className="w-full h-full object-cover transition"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
//             <FaFilePdf className="text-4xl text-red-500" />
//             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
//           </div>
//         )}
//       </a>

//       {showActions && (
//         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
//           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
//             <FaRedoAlt /> Reupload
//             <input
//               type="file"
//               accept="image/*,application/pdf"
//               className="hidden"
//               onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (file) {
//                   await onReupload(url, file);
//                   e.target.value = '';
//                 }
//               }}
//             />
//           </label>

//           <button
//             onClick={() => onDelete(url)}
//             className="flex items-center gap-1 hover:text-red-500 transition-colors"
//           >
//             <FaTrashAlt /> Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
//   if (ids.length === 0) return [];
//   try {
//     const res = await fetch('/api/assignees', {
//       method: 'POST',
//       body: JSON.stringify({ ids }),
//       headers: { 'Content-Type': 'application/json' }
//     });
//     if (!res.ok) {
//       const errorData = await res.json();
//       console.error("Failed to fetch assignee details:", errorData.error);
//       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//     }
//     const data = await res.json();
//     return data.assignees;
//   } catch (error) {
//     console.error("Error fetching assignee details:", error);
//     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//   }
// };


// export default function TaskTimeline() {
//   const { user, sessionClaims } = useUser();
//   const { getToken } = useAuth(); // Get getToken from Clerk's useAuth hook
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [zoom, setZoom] = useState(40);

//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

//   const [newNote, setNewNote] = useState("");
//   const [newSubtask, setNewSubtask] = useState("");
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [tasksPerPage, setTasksPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);

//   const [isPanelOpen, setIsPanelOpen] = useState(false);

//   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
//   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);

//   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});

//   const [currentAmountInput, setCurrentAmountInput] = useState("");
//   const [currentReceivedInput, setCurrentReceivedInput] = useState("");
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);


//   const [tasksVersion, setTasksVersion] = useState(0);


//   useEffect(() => {
//     if (selectedTask) {
//       const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
//       setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
//       setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
//     }
//   }, [selectedTask]);




















//   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
//     const token = await getToken(); // Get the Clerk token
//     // console.log("Frontend: Fetching tasks with token:", token ? "Token present" : "Token missing"); // Debug line
//     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, {
//       cache: "no-store",
//       headers: {
//         Authorization: `Bearer ${token}`, // Include token in headers
//       },
//     });

//     if (!res.ok) {
//       console.error(`Frontend: Failed to fetch tasks: ${res.status} - ${res.statusText}`);
//       const errorData = await res.json();
//       console.error("Frontend: Error details:", errorData);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//       return; // Early exit on non-ok response
//     }

//     const data = await res.json();

//     if (Array.isArray(data.tasks)) {
//       setTasks(data.tasks);
//       setTasksVersion(prev => prev + 1);
//       setCurrentPage(data.page);
//       setTotalPages(data.totalPages);

//       if (isPanelOpen && selectedTaskId) {
//         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
//         setSelectedTask(updated || null);
//         if (!updated) {
//           setIsPanelOpen(false);
//           setSelectedTaskId(null);
//         }
//       }
//     } else {
//       console.error("Frontend: Invalid data format for tasks:", data);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//     }
//   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId, getToken]);

//   useEffect(() => {
//     fetchTasks(currentPage, tasksPerPage);
//   }, [currentPage, tasksPerPage, fetchTasks]);

//   useEffect(() => {
//     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//     if (ids.length > 0) {
//       fetchAssigneeDetails(ids).then((assignees) => {
//         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
//           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
//         );
//         setAssigneeMap(map);
//       });
//     } else {
//       setAssigneeMap({});
//     }
//   }, [tasks]);



//   const allAssignees = useMemo(() => {
//     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//   }, [tasks]);

//   const filteredTasks = useMemo(() => {
//     let currentTasks = [...tasks];
//     if (searchTerm) {
//       const lowerSearchTerm = searchTerm.toLowerCase();
//       currentTasks = currentTasks.filter(task =>
//         task.name.toLowerCase().includes(lowerSearchTerm) ||
//         task.shop.toLowerCase().includes(lowerSearchTerm) ||
//         task.customer.toLowerCase().includes(lowerSearchTerm)
//       );
//     }
//     if (selectedAvatar) {
//       currentTasks = currentTasks.filter(task =>
//         (task.assigneeIds || []).includes(selectedAvatar)
//       );
//     }
//     return currentTasks;
//   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);


//   const handleTaskClick = useCallback(async (task: Task) => {
//     setSelectedTaskId(task.id);
//     setIsPanelOpen(true);
//     setShowPaymentHistory(false); // Always hide history on new task selection

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/timeline?id=${task.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//           console.error(`Frontend: Failed to fetch single task: ${res.status} - ${res.statusText}`);
//           const errorData = await res.json();
//           console.error("Frontend: Error details for single task:", errorData);
//           // Fallback to the task object received from the table if fetch fails or returns empty
//           setSelectedTask(task);
//           return;
//       }

//       const data = await res.json();
//       const fullTask = data.tasks?.[0]; // Assuming your API returns an array for a single ID

//       if (fullTask) {
//         setSelectedTask(fullTask);
//       } else {
//         console.warn("API did not return full task data, using existing task object.");
//         setSelectedTask(task);
//       }
//     } catch (err) {
//       console.error("Failed to fetch full task data:", err);
//       setSelectedTask(task);
//     }
//   }, [getToken]);


//   const updateSelectedTaskFromFetched = useCallback(async () => {
//     if (selectedTask?.id) {
//       const token = await getToken();
//       const updatedRes = await fetch(`/api/timeline?id=${selectedTask.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!updatedRes.ok) {
//           console.error(`Frontend: Failed to update selected task from fetched: ${updatedRes.status} - ${updatedRes.statusText}`);
//           const errorData = await updatedRes.json();
//           console.error("Frontend: Error details for update selected task:", errorData);
//           await fetchTasks(currentPage, tasksPerPage); // Fallback to fetching all tasks
//           return;
//       }
//       const updatedData = await updatedRes.json();
//       const updatedTask = updatedData.tasks?.[0];
//       if (updatedTask) {
//         setSelectedTask(updatedTask);
//       } else {
//         await fetchTasks(currentPage, tasksPerPage);
//       }
//     } else {
//       await fetchTasks(currentPage, tasksPerPage);
//     }
//   }, [selectedTask, fetchTasks, currentPage, tasksPerPage, getToken]);


//   const toggleSubtask = async (taskId: string, subtaskId: string) => {
//     const token = await getToken();
//     const res = await fetch(`/api/subtasks/${subtaskId}`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//         console.error(`Failed to toggle subtask: ${res.status} - ${res.statusText}`);
//         return;
//     }
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addSubtask = async () => {
//     if (!selectedTask || newSubtask.trim() === "") return;
//     const token = await getToken();
//     const res = await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
//       method: "POST",
//       body: JSON.stringify({ title: newSubtask }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//         console.error(`Failed to add subtask: ${res.status} - ${res.statusText}`);
//         return;
//     }
//     setNewSubtask("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addNote = async () => {
//     if (!selectedTask || newNote.trim() === "") return;
//     const token = await getToken();
//     const res = await fetch(`/api/tasks/${selectedTask.id}/notes`, {
//       method: "POST",
//       body: JSON.stringify({
//         content: newNote,
//         authorName: user?.fullName || "Anonymous",
//         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
//         createdAt: new Date().toISOString(),
//       }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//         console.error(`Failed to add note: ${res.status} - ${res.statusText}`);
//         return;
//     }
//     setNewNote("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };


//   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new file...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "PATCH",
//         body: JSON.stringify({ oldUrl, newUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File replaced!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 2000);
//     } catch (err) {
//       console.error("Error reuploading attachment:", err);
//       setUploadStatus("❌ An error occurred during reupload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleNewAttachmentUpload = async (file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new attachment...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "POST",
//         body: JSON.stringify({ url: newUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ New file uploaded successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 3000);
//     } catch (err) {
//       console.error("Error uploading new attachment:", err);
//       setUploadStatus("❌ An error occurred during new upload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleDeleteAttachment = useCallback((url: string) => {
//     if (!selectedTask) return;
//     setAttachmentToDeleteUrl(url);
//     setShowConfirmDeleteModal(true);
//   }, [selectedTask]);

//   const confirmDeleteAttachment = async () => {
//     if (!selectedTask || !attachmentToDeleteUrl) return;

//     setShowConfirmDeleteModal(false);
//     setUploadStatus("Deleting file...");

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "DELETE",
//         body: JSON.stringify({ url: attachmentToDeleteUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await res.text();
//       let data = null;
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         console.error("Invalid JSON response", e);
//         setUploadStatus("❌ Invalid server response");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File deleted successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//     } catch (err) {
//       console.error("Error deleting attachment:", err);
//       setUploadStatus("❌ Error deleting attachment");
//     } finally {
//       setAttachmentToDeleteUrl(null);
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handlePaymentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedTask) {
//       setPaymentUploadStatus("No task selected.");
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("amount", currentAmountInput);
//     formData.append("received", currentReceivedInput);

//     const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
//     if (fileInput?.files?.[0]) {
//       formData.append("file", fileInput.files[0]);
//     }

//     const userEmail = sessionClaims?.email as string || "Unknown User";

//     const userName = sessionClaims?.firstName as string || userEmail;
//     formData.append("updatedBy", userName);
//     formData.append("updatedAt", new Date().toISOString());

//     setPaymentUploadStatus("Processing payment update...");

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
//         method: "POST",
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Payment update failed");
//       }

//       setSelectedTask(data.task);

//       setCurrentAmountInput("");
//       setCurrentReceivedInput("");
//       if (fileInput) fileInput.value = '';

//       setPaymentUploadStatus("✅ Payment updated successfully!");
//       setShowPaymentHistory(false);

//     } catch (err: any) {
//       console.error("Payment submission failed:", err);
//       setPaymentUploadStatus(`❌ ${err.message || "An error occurred during payment update."}`);
//     } finally {
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//     }
//   };

//   const handleTogglePaymentHistory = useCallback(async () => {
//     if (!selectedTask?.id) return;

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/timeline?id=${selectedTask.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!res.ok) {
//           console.error(`Failed to fetch fresh task data for payment history: ${res.status} - ${res.statusText}`);
//           const errorData = await res.json();
//           console.error("Error details for payment history fetch:", errorData);
//           setShowPaymentHistory((prev) => !prev);
//           return;
//       }
//       const data = await res.json();
//       const freshTask = data.tasks?.[0];

//       if (freshTask) {
//         setSelectedTask(freshTask);
//         setShowPaymentHistory((prev) => !prev);
//       } else {
//         console.error("Failed to fetch fresh task data for payment history.");
//         setShowPaymentHistory((prev) => !prev);
//       }
//     } catch (error) {
//       console.error("Error fetching fresh task data for payment history:", error);
//       setShowPaymentHistory((prev) => !prev);
//     }
//   }, [selectedTask, getToken]);


//   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newLimit = parseInt(e.target.value, 10);
//     setTasksPerPage(newLimit);
//     setCurrentPage(1);
//   };

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   const pageNumbers = useMemo(() => {
//     const pages = [];
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }, [totalPages, currentPage]);


//   return (
//     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
//           {allAssignees.map((id) => (
//             <Image
//               key={id}
//               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//               alt={assigneeMap[id]?.name || "Assignee Avatar"}
//               width={32}
//               height={32}
//               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
//                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
//               }`}
//               onClick={() =>
//                 setSelectedAvatar((prev) => (prev === id ? null : id))
//               }
//               title={assigneeMap[id]?.name || id}
//             />
//           ))}
//         </div>

//         <input
//           type="text"
//           placeholder="Search tasks..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
//         />

//         <div className="flex items-center gap-2">
//           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
//           <select
//             id="tasksPerPage"
//             value={tasksPerPage}
//             onChange={handleTasksPerPageChange}
//             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={15}>15</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </div>

//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-500">Zoom:</label>
//           <input
//             type="range"
//             min={20}
//             max={100}
//             value={zoom}
//             onChange={(e) => setZoom(Number(e.target.value))}
//             className="w-24"
//           />
//         </div>
//       </div>

//       <hr className="my-4" />

//       <table className="min-w-full border-collapse border border-gray-200">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
//             {Array.from({ length: totalDays }).map((_, i) => {
//               const current = addDays(startDate, i);
//               const isTodayColumn = isToday(current);
//               return (
//                 <th
//                   key={i}
//                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
//                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
//                   }`}
//                   style={{ minWidth: `${zoom}px` }}
//                 >
//                   {format(current, "dd")}
//                 </th>
//               );
//             })}
//           </tr>
//         </thead>














//         <tbody>
//           {filteredTasks.length === 0 ? (
//             <tr>
//               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
//                 No tasks found with current filters or on this page.
//               </td>
//             </tr>
//           ) : (
//             filteredTasks.map((task, index) => {
//               const startOffset = Math.max(
//                 0,
//                 differenceInCalendarDays(new Date(task.start), startDate)
//               );
//               const duration =
//                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

//               return (
//                 <tr key={task.id} className="h-12 border-b border-gray-200">
//                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
//                     {(currentPage - 1) * tasksPerPage + index + 1}
//                   </td>
//                   <td
//                     onClick={() => handleTaskClick(task)}
//                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
//                   >
//                     <div className="font-semibold text-[13px] text-gray-800 truncate">
//                       📁 {task.name}
//                     </div>
//                     <div className="text-[11px] text-gray-500 truncate">
//                       🏪 {task.shop} / 👤 {task.customer}
//                     </div>
//                   </td>
//                   {Array.from({ length: totalDays }).map((_, i) => {
//                     const isBar = i >= startOffset && i < startOffset + duration;
//                     const bgColor =
//                       task.progress === 100
//                         ? "bg-green-500"
//                         : task.progress > 0
//                         ? "bg-blue-500"
//                         : "bg-gray-300";

//                     return (
//                       <td
//                         key={i}
//                         onClick={() => handleTaskClick(task)}
//                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
//                       >
//                         {isBar && (
//                           <div
//                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
//                             style={{ width: `${task.progress}%` }}
//                           >
//                             {task.progress}%
//                           </div>
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>

//       <hr className="my-4" />

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Previous
//           </button>
//           <div className="flex gap-1">
//             {pageNumbers.map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
//                   currentPage === page
//                     ? "bg-blue-600 text-white shadow-sm"
//                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
//                 } transition-all`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <hr className="my-4" />

//       {/* Main Task Detail Dialog */}
//       <Dialog.Root
//         open={isPanelOpen}
//         onOpenChange={(open) => {
//           setIsPanelOpen(open);
//           if (!open) {
//             setSelectedTask(null);
//             setSelectedTaskId(null);
//           }
//         }}
//       >
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
//           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
//             <Dialog.Title className="sr-only">Task Details</Dialog.Title>

//             {selectedTask && (
//               <>
//                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
//                   <h2 className="text-2xl font-bold text-gray-900 leading-tight">
//                     {selectedTask.name}
//                   </h2>
//                   <Dialog.Close asChild>
//                     <button
//                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       aria-label="Close"
//                     >
//                       <FaPlus className="rotate-45" />
//                     </button>
//                   </Dialog.Close>
//                 </div>

//                 <div className="space-y-6 mt-4">
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
//                     <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.name}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.start ? format(parseISO(selectedTask.start), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.end ? format(parseISO(selectedTask.end), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
//                         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
//                           <div
//                             className="bg-blue-600 h-2.5 rounded-full"
//                             style={{ width: `${selectedTask.progress}%` }}
//                           ></div>
//                         </div>
//                         <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
//                         selectedTask.assigneeIds.map((id) => (
//                           <Image
//                             key={id}
//                             src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//                             alt={assigneeMap[id]?.name || "Assignee"}
//                             width={36}
//                             height={36}
//                             className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
//                             title={assigneeMap[id]?.name || id}
//                           />
//                         ))
//                       ) : (
//                         <p className="text-gray-500 text-sm">No assignees.</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
//                     <div className="space-y-3">
//                       {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
//                       {selectedTask.subtasks?.map((s) => (
//                         <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
//                           <input
//                             type="checkbox"
//                             checked={s.completed}
//                             onChange={() => toggleSubtask(selectedTask.id, s.id)}
//                             className="hidden"
//                           />
//                           {s.completed ? (
//                             <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//                           ) : (
//                             <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
//                           )}
//                           <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
//                             {s.title}
//                           </span>
//                         </label>
//                       ))}
//                       <div className="flex items-center gap-2 mt-4">
//                         <input
//                           type="text"
//                           value={newSubtask}
//                           onChange={(e) => setNewSubtask(e.target.value)}
//                           placeholder="Add new subtask..."
//                           className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         <button
//                           onClick={addSubtask}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newSubtask.trim() === ""}
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
//                     <div className="space-y-3">
//                       {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
//                       {selectedTask.notes?.map((note, idx) => (
//                         <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
//                           <p className="text-gray-700">{note.content}</p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             — {note.authorName || note.authorEmail || "Unknown"} on{" "}
//                             {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
//                           </p>
//                         </div>
//                       ))}
//                       <div className="mt-4">
//                         <textarea
//                           value={newNote}
//                           onChange={(e) => setNewNote(e.target.value)}
//                           placeholder="Add a new note..."
//                           rows={3}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
//                         ></textarea>
//                         <button
//                           onClick={addNote}
//                           className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newNote.trim() === ""}
//                         >
//                           Add Note
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                       {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
//                       {selectedTask.attachments?.map((url, idx) => (
//                         <AttachmentItem
//                           key={url}
//                           url={url}
//                           index={idx}
//                           onReupload={handleReuploadAttachment}
//                           onDelete={handleDeleteAttachment}
//                         />
//                       ))}
//                       <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
//                         <FaPlus className="text-xl mb-1" />
//                         Add new
//                         <input
//                           type="file"
//                           accept="image/*,application/pdf"
//                           className="hidden"
//                           onChange={async (e) => {
//                             const file = e.target.files?.[0];
//                             if (file) {
//                               await handleNewAttachmentUpload(file);
//                               e.target.value = '';
//                             }
//                           }}
//                         />
//                       </label>
//                     </div>
//                     {uploadStatus && (
//                       <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
//                         {uploadStatus}
//                       </p>
//                     )}
//                   </div>

//                   <PaymentSection
//                     selectedTask={selectedTask}
//                     user={user}
//                     amount={currentAmountInput}
//                     setAmount={setCurrentAmountInput}
//                     received={currentReceivedInput}
//                     setReceived={setCurrentReceivedInput}
//                     paymentUploadStatus={paymentUploadStatus}
//                     setPaymentUploadStatus={setPaymentUploadStatus}
//                     handlePaymentSubmit={handlePaymentSubmit}
//                     showPaymentHistory={showPaymentHistory}
//                     setShowPaymentHistory={setShowPaymentHistory}
//                     handleTogglePaymentHistory={handleTogglePaymentHistory}
//                   />

//                 </div>
//               </>
//             )}
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>

//       {/* Confirm Delete Modal Dialog */}
//       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
//           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
//             <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
//               Confirm Deletion
//             </Dialog.Title>
//             <Dialog.Description className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete this attachment? This action cannot be undone.
//             </Dialog.Description>
//             <div className="flex justify-end gap-3">
//               <Dialog.Close asChild>
//                 <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
//                   Cancel
//                 </button>
//               </Dialog.Close>
//               <button
//                 onClick={confirmDeleteAttachment}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>
//     </div>
//   );
// }






































// // components/TaskTimeline.tsx
// "use client"; // This component runs on the client-side

// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { Paintbrush } from "lucide-react";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// import Image from "next/image";
// import * as Dialog from "@radix-ui/react-dialog"; // Corrected import syntax
// import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// import { useUser, useAuth } from "@clerk/nextjs"; // Import useAuth
// import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// import PaymentHistory from "./PaymentHistory";
// import PaymentSection from "../components/PaymentSection";

// interface Subtask {
//   id: string;
//   title: string;
//   completed: boolean;
// }

// interface Note {
//   id: string;
//   content: string;
//   authorName?: string;
//   authorEmail?: string;
//   createdAt?: string;
// }

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: Subtask[];
//   notes?: Note[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[];
// }

// interface AssigneeDetails {
//   id: string;
//   name: string;
//   email: string;
//   imageUrl: string;
// }

// const startDate = new Date("2025-07-10");
// const endDate = new Date("2025-07-31");
// const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// const isImageUrl = (url: string) => {
//   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// };

// interface AttachmentItemProps {
//   url: string;
//   index: number;
//   onReupload: (oldUrl: string, file: File) => Promise<void>;
//   onDelete: (url: string) => void;
// }

// const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
//   const [showActions, setShowActions] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//       className="relative group border border-gray-200 rounded-lg overflow-hidden"
//     >
//       <a
//         href={url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="block w-full h-24 flex items-center justify-center bg-gray-100"
//       >
//         {isImageUrl(url) ? (
//           <img
//             src={url}
//             alt={`Attachment ${index + 1}`}
//             className="w-full h-full object-cover transition"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
//             <FaFilePdf className="text-4xl text-red-500" />
//             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
//           </div>
//         )}
//       </a>

//       {showActions && (
//         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
//           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
//             <FaRedoAlt /> Reupload
//             <input
//               type="file"
//               accept="image/*,application/pdf"
//               className="hidden"
//               onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (file) {
//                   await onReupload(url, file);
//                   e.target.value = '';
//                 }
//               }}
//             />
//           </label>

//           <button
//             onClick={() => onDelete(url)}
//             className="flex items-center gap-1 hover:text-red-500 transition-colors"
//           >
//             <FaTrashAlt /> Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
//   if (ids.length === 0) return [];
//   try {
//     const res = await fetch('/api/assignees', {
//       method: 'POST',
//       body: JSON.stringify({ ids }),
//       headers: { 'Content-Type': 'application/json' }
//     });
//     if (!res.ok) {
//       const errorData = await res.json();
//       console.error("Failed to fetch assignee details:", errorData.error);
//       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//     }
//     const data = await res.json();
//     return data.assignees;
//   } catch (error) {
//     console.error("Error fetching assignee details:", error);
//     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//   }
// };


// export default function TaskTimeline() {
//   const { user, sessionClaims } = useUser();
//   const { getToken } = useAuth(); // Get getToken from Clerk's useAuth hook
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [zoom, setZoom] = useState(40);

//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

//   const [newNote, setNewNote] = useState("");
//   const [newSubtask, setNewSubtask] = useState("");
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [tasksPerPage, setTasksPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);

//   const [isPanelOpen, setIsPanelOpen] = useState(false);

//   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
//   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);

//   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});

//   const [currentAmountInput, setCurrentAmountInput] = useState("");
//   const [currentReceivedInput, setCurrentReceivedInput] = useState("");
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);


//   const [tasksVersion, setTasksVersion] = useState(0);


//   useEffect(() => {
//     if (selectedTask) {
//       const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
//       setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
//       setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
//     }
//   }, [selectedTask]);

//   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
//     const token = await getToken(); // Get the Clerk token
//     // console.log("Frontend: Fetching tasks with token:", token ? "Token present" : "Token missing"); // Debug line
//     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, {
//       cache: "no-store",
//       headers: {
//         Authorization: `Bearer ${token}`, // Include token in headers
//       },
//     });

//     if (!res.ok) {
//       console.error(`Frontend: Failed to fetch tasks: ${res.status} - ${res.statusText}`);
//       const errorData = await res.json();
//       console.error("Frontend: Error details:", errorData);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//       return; // Early exit on non-ok response
//     }

//     const data = await res.json();

//     if (Array.isArray(data.tasks)) {
//       setTasks(data.tasks);
//       setTasksVersion(prev => prev + 1);
//       setCurrentPage(data.page);
//       setTotalPages(data.totalPages);

//       if (isPanelOpen && selectedTaskId) {
//         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
//         setSelectedTask(updated || null);
//         if (!updated) {
//           setIsPanelOpen(false);
//           setSelectedTaskId(null);
//         }
//       }
//     } else {
//       console.error("Frontend: Invalid data format for tasks:", data);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//     }
//   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId, getToken]);

//   useEffect(() => {
//     fetchTasks(currentPage, tasksPerPage);
//   }, [currentPage, tasksPerPage, fetchTasks]);

//   useEffect(() => {
//     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//     if (ids.length > 0) {
//       fetchAssigneeDetails(ids).then((assignees) => {
//         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
//           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
//         );
//         setAssigneeMap(map);
//       });
//     } else {
//       setAssigneeMap({});
//     }
//   }, [tasks]);



//   const allAssignees = useMemo(() => {
//     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//   }, [tasks]);

//   const filteredTasks = useMemo(() => {
//     let currentTasks = [...tasks];
//     if (searchTerm) {
//       const lowerSearchTerm = searchTerm.toLowerCase();
//       currentTasks = currentTasks.filter(task =>
//         task.name.toLowerCase().includes(lowerSearchTerm) ||
//         task.shop.toLowerCase().includes(lowerSearchTerm) ||
//         task.customer.toLowerCase().includes(lowerSearchTerm)
//       );
//     }
//     if (selectedAvatar) {
//       currentTasks = currentTasks.filter(task =>
//         (task.assigneeIds || []).includes(selectedAvatar)
//       );
//     }
//     return currentTasks;
//   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);


//   const handleTaskClick = useCallback(async (task: Task) => {
//     setSelectedTaskId(task.id);
//     setIsPanelOpen(true);
//     setShowPaymentHistory(false); // Always hide history on new task selection

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/timeline?id=${task.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         console.error(`Frontend: Failed to fetch single task: ${res.status} - ${res.statusText}`);
//         const errorData = await res.json();
//         console.error("Frontend: Error details for single task:", errorData);
//         // Fallback to the task object received from the table if fetch fails or returns empty
//         setSelectedTask(task);
//         return;
//       }

//       const data = await res.json();
//       const fullTask = data.tasks?.[0]; // Assuming your API returns an array for a single ID

//       if (fullTask) {
//         setSelectedTask(fullTask);
//       } else {
//         console.warn("API did not return full task data, using existing task object.");
//         setSelectedTask(task);
//       }
//     } catch (err) {
//       console.error("Failed to fetch full task data:", err);
//       setSelectedTask(task);
//     }
//   }, [getToken]);


//   const updateSelectedTaskFromFetched = useCallback(async () => {
//     if (selectedTask?.id) {
//       const token = await getToken();
//       const updatedRes = await fetch(`/api/timeline?id=${selectedTask.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!updatedRes.ok) {
//         console.error(`Frontend: Failed to update selected task from fetched: ${updatedRes.status} - ${updatedRes.statusText}`);
//         const errorData = await updatedRes.json();
//         console.error("Frontend: Error details for update selected task:", errorData);
//         await fetchTasks(currentPage, tasksPerPage); // Fallback to fetching all tasks
//         return;
//       }
//       const updatedData = await updatedRes.json();
//       const updatedTask = updatedData.tasks?.[0];
//       if (updatedTask) {
//         setSelectedTask(updatedTask);
//       } else {
//         await fetchTasks(currentPage, tasksPerPage);
//       }
//     } else {
//       await fetchTasks(currentPage, tasksPerPage);
//     }
//   }, [selectedTask, fetchTasks, currentPage, tasksPerPage, getToken]);


//   const toggleSubtask = async (taskId: string, subtaskId: string) => {
//     const token = await getToken();
//     const res = await fetch(`/api/subtasks/${subtaskId}`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//       console.error(`Failed to toggle subtask: ${res.status} - ${res.statusText}`);
//       return;
//     }
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addSubtask = async () => {
//     if (!selectedTask || newSubtask.trim() === "") return;
//     const token = await getToken();
//     const res = await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
//       method: "POST",
//       body: JSON.stringify({ title: newSubtask }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//       console.error(`Failed to add subtask: ${res.status} - ${res.statusText}`);
//       return;
//     }
//     setNewSubtask("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addNote = async () => {
//     if (!selectedTask || newNote.trim() === "") return;
//     const token = await getToken();
//     const res = await fetch(`/api/tasks/${selectedTask.id}/notes`, {
//       method: "POST",
//       body: JSON.stringify({
//         content: newNote,
//         authorName: user?.fullName || "Anonymous",
//         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
//         createdAt: new Date().toISOString(),
//       }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//       console.error(`Failed to add note: ${res.status} - ${res.statusText}`);
//       return;
//     }
//     setNewNote("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };


//   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new file...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "PATCH",
//         body: JSON.stringify({ oldUrl, newUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File replaced!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 2000);
//     } catch (err) {
//       console.error("Error reuploading attachment:", err);
//       setUploadStatus("❌ An error occurred during reupload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleNewAttachmentUpload = async (file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new attachment...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "POST",
//         body: JSON.stringify({ url: newUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ New file uploaded successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 3000);
//     } catch (err) {
//       console.error("Error uploading new attachment:", err);
//       setUploadStatus("❌ An error occurred during new upload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleDeleteAttachment = useCallback((url: string) => {
//     if (!selectedTask) return;
//     setAttachmentToDeleteUrl(url);
//     setShowConfirmDeleteModal(true);
//   }, [selectedTask]);

//   const confirmDeleteAttachment = async () => {
//     if (!selectedTask || !attachmentToDeleteUrl) return;

//     setShowConfirmDeleteModal(false);
//     setUploadStatus("Deleting file...");

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "DELETE",
//         body: JSON.stringify({ url: attachmentToDeleteUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await res.text();
//       let data = null;
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         console.error("Invalid JSON response", e);
//         setUploadStatus("❌ Invalid server response");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File deleted successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//     } catch (err) {
//       console.error("Error deleting attachment:", err);
//       setUploadStatus("❌ Error deleting attachment");
//     } finally {
//       setAttachmentToDeleteUrl(null);
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handlePaymentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedTask) {
//       setPaymentUploadStatus("No task selected.");
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("amount", currentAmountInput);
//     formData.append("received", currentReceivedInput);

//     const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
//     if (fileInput?.files?.[0]) {
//       formData.append("file", fileInput.files[0]);
//     }

//     const userEmail = sessionClaims?.email as string || "Unknown User";

//     const userName = sessionClaims?.firstName as string || userEmail;
//     formData.append("updatedBy", userName);
//     formData.append("updatedAt", new Date().toISOString());

//     setPaymentUploadStatus("Processing payment update...");

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
//         method: "POST",
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Payment update failed");
//       }

//       setSelectedTask(data.task);

//       setCurrentAmountInput("");
//       setCurrentReceivedInput("");
//       if (fileInput) fileInput.value = '';

//       setPaymentUploadStatus("✅ Payment updated successfully!");
//       setShowPaymentHistory(false);

//     } catch (err: any) {
//       console.error("Payment submission failed:", err);
//       setPaymentUploadStatus(`❌ ${err.message || "An error occurred during payment update."}`);
//     } finally {
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//     }
//   };

//   const handleTogglePaymentHistory = useCallback(async () => {
//     if (!selectedTask?.id) return;

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/timeline?id=${selectedTask.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!res.ok) {
//         console.error(`Failed to fetch fresh task data for payment history: ${res.status} - ${res.statusText}`);
//         const errorData = await res.json();
//         console.error("Error details for payment history fetch:", errorData);
//         setShowPaymentHistory((prev) => !prev);
//         return;
//       }
//       const data = await res.json();
//       const freshTask = data.tasks?.[0];

//       if (freshTask) {
//         setSelectedTask(freshTask);
//         setShowPaymentHistory((prev) => !prev);
//       } else {
//         console.error("Failed to fetch fresh task data for payment history.");
//         setShowPaymentHistory((prev) => !prev);
//       }
//     } catch (error) {
//       console.error("Error fetching fresh task data for payment history:", error);
//       setShowPaymentHistory((prev) => !prev);
//     }
//   }, [selectedTask, getToken]);


//   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newLimit = parseInt(e.target.value, 10);
//     setTasksPerPage(newLimit);
//     setCurrentPage(1);
//   };

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   const pageNumbers = useMemo(() => {
//     const pages = [];
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }, [totalPages, currentPage]);


//   return (
//     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
//           {allAssignees.map((id) => (
//             <Image
//               key={id}
//               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//               alt={assigneeMap[id]?.name || "Assignee Avatar"}
//               width={32}
//               height={32}
//               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
//                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
//               }`}
//               onClick={() =>
//                 setSelectedAvatar((prev) => (prev === id ? null : id))
//               }
//               title={assigneeMap[id]?.name || id}
//             />
//           ))}
//         </div>

//         <input
//           type="text"
//           placeholder="Search tasks..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
//         />

//         <div className="flex items-center gap-2">
//           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
//           <select
//             id="tasksPerPage"
//             value={tasksPerPage}
//             onChange={handleTasksPerPageChange}
//             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={15}>15</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </div>

//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-500">Zoom:</label>
//           <input
//             type="range"
//             min={20}
//             max={100}
//             value={zoom}
//             onChange={(e) => setZoom(Number(e.target.value))}
//             className="w-24"
//           />
//         </div>
//       </div>

//       <hr className="my-4" />

//       <table className="min-w-full border-collapse border border-gray-200">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
//             {Array.from({ length: totalDays }).map((_, i) => {
//               const current = addDays(startDate, i);
//               const isTodayColumn = isToday(current);
//               return (
//                 <th
//                   key={i}
//                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
//                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
//                   }`}
//                   style={{ minWidth: `${zoom}px` }}
//                 >
//                   {format(current, "dd")}
//                 </th>
//               );
//             })}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTasks.length === 0 ? (
//             <tr>
//               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
//                 No tasks found with current filters or on this page.
//               </td>
//             </tr>
//           ) : (
//             filteredTasks.map((task, index) => {
//               const startOffset = Math.max(
//                 0,
//                 differenceInCalendarDays(new Date(task.start), startDate)
//               );
//               const duration =
//                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

//               return (
//                 <tr key={task.id} className="h-12 border-b border-gray-200">
//                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
//                     {(currentPage - 1) * tasksPerPage + index + 1}
//                   </td>
//                   <td
//                     onClick={() => handleTaskClick(task)}
//                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
//                   >
//                     <div className="font-semibold text-[13px] text-gray-800 truncate">
//                       📁 {task.name}
//                     </div>
//                     <div className="text-[11px] text-gray-500 truncate">
//                       🏪 {task.shop} / 👤 {task.customer}
//                     </div>
//                   </td>
//                   {Array.from({ length: totalDays }).map((_, i) => {
//                     const isBar = i >= startOffset && i < startOffset + duration;
//                     const bgColor =
//                       task.progress === 100
//                         ? "bg-green-500"
//                         : task.progress > 0
//                         ? "bg-blue-500"
//                         : "bg-gray-300";

//                     return (
//                       <td
//                         key={i}
//                         onClick={() => handleTaskClick(task)}
//                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
//                       >
//                         {isBar && (
//                           <div
//                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
//                             style={{ width: `${task.progress}%` }}
//                           >
//                             {task.progress}%
//                           </div>
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>

//       <hr className="my-4" />

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Previous
//           </button>
//           <div className="flex gap-1">
//             {pageNumbers.map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
//                   currentPage === page
//                     ? "bg-blue-600 text-white shadow-sm"
//                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
//                 } transition-all`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <hr className="my-4" />

//       {/* Main Task Detail Dialog */}
//       <Dialog.Root
//         open={isPanelOpen}
//         onOpenChange={(open) => {
//           setIsPanelOpen(open);
//           if (!open) {
//             setSelectedTask(null);
//             setSelectedTaskId(null);
//           }
//         }}
//       >
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
//           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
//             <Dialog.Title className="sr-only">Task Details</Dialog.Title>

//             {selectedTask && (
//               <>
//                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
//                   <h2 className="text-2xl font-bold text-gray-900 leading-tight">
//                     {selectedTask.name}
//                   </h2>
//                   <Dialog.Close asChild>
//                     <button
//                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       aria-label="Close"
//                     >
//                       <FaPlus className="rotate-45" />
//                     </button>
//                   </Dialog.Close>
//                 </div>

//                 <div className="space-y-6 mt-4">
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
//                     <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.name}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.start ? format(parseISO(selectedTask.start), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.end ? format(parseISO(selectedTask.end), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
//                         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
//                           <div
//                             className="bg-blue-600 h-2.5 rounded-full"
//                             style={{ width: `${selectedTask.progress}%` }}
//                           ></div>
//                         </div>
//                         <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
//                         selectedTask.assigneeIds.map((id) => (
//                           <Image
//                             key={id}
//                             src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//                             alt={assigneeMap[id]?.name || "Assignee"}
//                             width={36}
//                             height={36}
//                             className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
//                             title={assigneeMap[id]?.name || id}
//                           />
//                         ))
//                       ) : (
//                         <p className="text-gray-500 text-sm">No assignees.</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
//                     <div className="space-y-3">
//                       {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
//                       {selectedTask.subtasks?.map((s) => (
//                         <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
//                           <input
//                             type="checkbox"
//                             checked={s.completed}
//                             onChange={() => toggleSubtask(selectedTask.id, s.id)}
//                             className="hidden"
//                           />
//                           {s.completed ? (
//                             <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//                           ) : (
//                             <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
//                           )}
//                           <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
//                             {s.title}
//                           </span>
//                         </label>
//                       ))}
//                       <div className="flex items-center gap-2 mt-4">
//                         <input
//                           type="text"
//                           value={newSubtask}
//                           onChange={(e) => setNewSubtask(e.target.value)}
//                           placeholder="Add new subtask..."
//                           className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         <button
//                           onClick={addSubtask}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newSubtask.trim() === ""}
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
//                     <div className="space-y-3">
//                       {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
//                       {selectedTask.notes?.map((note, idx) => (
//                         <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
//                           <p className="text-gray-700">{note.content}</p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             — {note.authorName || note.authorEmail || "Unknown"} on{" "}
//                             {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
//                           </p>
//                         </div>
//                       ))}
//                       <div className="mt-4">
//                         <textarea
//                           value={newNote}
//                           onChange={(e) => setNewNote(e.target.value)}
//                           placeholder="Add a new note..."
//                           rows={3}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
//                         ></textarea>
//                         <button
//                           onClick={addNote}
//                           className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newNote.trim() === ""}
//                         >
//                           Add Note
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                       {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
//                       {selectedTask.attachments?.map((url, idx) => (
//                         <AttachmentItem
//                           key={url}
//                           url={url}
//                           index={idx}
//                           onReupload={handleReuploadAttachment}
//                           onDelete={handleDeleteAttachment}
//                         />
//                       ))}
//                       <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
//                         <FaPlus className="text-xl mb-1" />
//                         Add new
//                         <input
//                           type="file"
//                           accept="image/*,application/pdf"
//                           className="hidden"
//                           onChange={async (e) => {
//                             const file = e.target.files?.[0];
//                             if (file) {
//                               await handleNewAttachmentUpload(file);
//                               e.target.value = '';
//                             }
//                           }}
//                         />
//                       </label>
//                     </div>
//                     {uploadStatus && (
//                       <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
//                         {uploadStatus}
//                       </p>
//                     )}
//                   </div>

//                   <PaymentSection
//                     selectedTask={selectedTask}
//                     user={user}
//                     amount={currentAmountInput}
//                     setAmount={setCurrentAmountInput}
//                     received={currentReceivedInput}
//                     setReceived={setCurrentReceivedInput}
//                     paymentUploadStatus={paymentUploadStatus}
//                     setPaymentUploadStatus={setPaymentUploadStatus}
//                     handlePaymentSubmit={handlePaymentSubmit}
//                     showPaymentHistory={showPaymentHistory}
//                     setShowPaymentHistory={setShowPaymentHistory}
//                     handleTogglePaymentHistory={handleTogglePaymentHistory}
//                   />

//                 </div>
//               </>
//             )}
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>

//       {/* Confirm Delete Modal Dialog */}
//       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
//           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
//             <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
//               Confirm Deletion
//             </Dialog.Title>
//             <Dialog.Description className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete this attachment? This action cannot be undone.
//             </Dialog.Description>
//             <div className="flex justify-end gap-3">
//               <Dialog.Close asChild>
//                 <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
//                   Cancel
//                 </button>
//               </Dialog.Close>
//               <button
//                 onClick={confirmDeleteAttachment}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>
//     </div>
//   );
// }


























// // components/TaskTimeline.tsx
// "use client";

// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { Paintbrush } from "lucide-react";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
// import Image from "next/image";
// import * as Dialog from "@radix-ui/react-dialog";
// import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
// import { useUser, useAuth } from "@clerk/nextjs";
// import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// import PaymentHistory from "./PaymentHistory";
// import PaymentSection from "../components/PaymentSection";

// // ... (your existing interfaces and component helper functions)

// interface Subtask {
//   id: string;
//   title: string;
//   completed: boolean;
// }

// interface Note {
//   id: string;
//   content: string;
//   authorName?: string;
//   authorEmail?: string;
//   createdAt?: string;
// }

// interface PaymentEntry {
//   amount: number;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl?: string | null;
// }

// interface Task {
//   id: string;
//   name: string;
//   shop: string;
//   customer: string;
//   start: string;
//   end: string;
//   progress: number;
//   assigneeIds?: string[];
//   subtasks?: Subtask[];
//   notes?: Note[];
//   attachments?: string[];
//   amount?: number;
//   received?: number;
//   paymentHistory?: PaymentEntry[];
// }

// interface AssigneeDetails {
//   id: string;
//   name: string;
//   email: string;
//   imageUrl: string;
// }

// const startDate = new Date("2025-07-10");
// const endDate = new Date("2025-07-31");
// const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

// const isImageUrl = (url: string) => {
//   return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
// };

// interface AttachmentItemProps {
//   url: string;
//   index: number;
//   onReupload: (oldUrl: string, file: File) => Promise<void>;
//   onDelete: (url: string) => void;
// }

// const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
//   const [showActions, setShowActions] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//       className="relative group border border-gray-200 rounded-lg overflow-hidden"
//     >
//       <a
//         href={url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="block w-full h-24 flex items-center justify-center bg-gray-100"
//       >
//         {isImageUrl(url) ? (
//           <img
//             src={url}
//             alt={`Attachment ${index + 1}`}
//             className="w-full h-full object-cover transition"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
//             <FaFilePdf className="text-4xl text-red-500" />
//             <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
//           </div>
//         )}
//       </a>

//       {showActions && (
//         <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
//           <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
//             <FaRedoAlt /> Reupload
//             <input
//               type="file"
//               accept="image/*,application/pdf"
//               className="hidden"
//               onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (file) {
//                   await onReupload(url, file);
//                   e.target.value = '';
//                 }
//               }}
//             />
//           </label>

//           <button
//             onClick={() => onDelete(url)}
//             className="flex items-center gap-1 hover:text-red-500 transition-colors"
//           >
//             <FaTrashAlt /> Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
//   if (ids.length === 0) return [];
//   try {
//     const res = await fetch('/api/assignees', {
//       method: 'POST',
//       body: JSON.stringify({ ids }),
//       headers: { 'Content-Type': 'application/json' }
//     });
//     if (!res.ok) {
//       const errorData = await res.json();
//       console.error("Failed to fetch assignee details:", errorData.error);
//       return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//     }
//     const data = await res.json();
//     return data.assignees;
//   } catch (error) {
//     console.error("Error fetching assignee details:", error);
//     return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
//   }
// };


// export default function TaskTimeline() {
//   const { user, sessionClaims } = useUser();
//   const { getToken } = useAuth();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [zoom, setZoom] = useState(40);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [newNote, setNewNote] = useState("");
//   const [newSubtask, setNewSubtask] = useState("");
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [paymentUploadStatus, setPaymentUploadStatus] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [tasksPerPage, setTasksPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);
//   const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
//   const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);
//   const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});
//   const [currentAmountInput, setCurrentAmountInput] = useState("");
//   const [currentReceivedInput, setCurrentReceivedInput] = useState("");
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);
//   const [tasksVersion, setTasksVersion] = useState(0);

//   useEffect(() => {
//     if (selectedTask) {
//       const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
//       setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
//       setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
//     }
//   }, [selectedTask]);

//   // ✅ The updated fetch logic is now a standalone useEffect that runs once on component mount
//   // and uses credentials: "include" to send Clerk cookies.
//   useEffect(() => {
//     const fetchInitialTasks = async () => {
//       try {
//         const res = await fetch(`/api/timeline?page=1&limit=10`, {
//           credentials: "include", // ✅ Send Clerk session cookies
//         });

//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(`Failed to fetch: ${res.status} - ${errorData.error}`);
//         }

//         const data = await res.json();
//         setTasks(data.tasks || []);
//         setTotalPages(data.totalPages);
//         setCurrentPage(data.page);
//       } catch (err) {
//         console.error("Frontend: Failed to fetch tasks", err);
//       }
//     };
//     fetchInitialTasks();
//   }, []);

//   const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
//     const token = await getToken();
//     const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, {
//       cache: "no-store",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!res.ok) {
//       console.error(`Frontend: Failed to fetch tasks: ${res.status} - ${res.statusText}`);
//       const errorData = await res.json();
//       console.error("Frontend: Error details:", errorData);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//       return;
//     }

//     const data = await res.json();
//     if (Array.isArray(data.tasks)) {
//       setTasks(data.tasks);
//       setTasksVersion(prev => prev + 1);
//       setCurrentPage(data.page);
//       setTotalPages(data.totalPages);

//       if (isPanelOpen && selectedTaskId) {
//         const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
//         setSelectedTask(updated || null);
//         if (!updated) {
//           setIsPanelOpen(false);
//           setSelectedTaskId(null);
//         }
//       }
//     } else {
//       console.error("Frontend: Invalid data format for tasks:", data);
//       setTasks([]);
//       setTotalPages(1);
//       setSelectedTask(null);
//       setSelectedTaskId(null);
//       setIsPanelOpen(false);
//     }
//   }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId, getToken]);

//   useEffect(() => {
//     fetchTasks(currentPage, tasksPerPage);
//   }, [currentPage, tasksPerPage, fetchTasks]);

//   useEffect(() => {
//     const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//     if (ids.length > 0) {
//       fetchAssigneeDetails(ids).then((assignees) => {
//         const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
//           assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
//         );
//         setAssigneeMap(map);
//       });
//     } else {
//       setAssigneeMap({});
//     }
//   }, [tasks]);

//   const allAssignees = useMemo(() => {
//     return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
//   }, [tasks]);

//   const filteredTasks = useMemo(() => {
//     let currentTasks = [...tasks];
//     if (searchTerm) {
//       const lowerSearchTerm = searchTerm.toLowerCase();
//       currentTasks = currentTasks.filter(task =>
//         task.name.toLowerCase().includes(lowerSearchTerm) ||
//         task.shop.toLowerCase().includes(lowerSearchTerm) ||
//         task.customer.toLowerCase().includes(lowerSearchTerm)
//       );
//     }
//     if (selectedAvatar) {
//       currentTasks = currentTasks.filter(task =>
//         (task.assigneeIds || []).includes(selectedAvatar)
//       );
//     }
//     return currentTasks;
//   }, [tasks, searchTerm, selectedAvatar, tasksVersion]);

//   const handleTaskClick = useCallback(async (task: Task) => {
//     setSelectedTaskId(task.id);
//     setIsPanelOpen(true);
//     setShowPaymentHistory(false);

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/timeline?id=${task.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         console.error(`Frontend: Failed to fetch single task: ${res.status} - ${res.statusText}`);
//         const errorData = await res.json();
//         console.error("Frontend: Error details for single task:", errorData);
//         setSelectedTask(task);
//         return;
//       }

//       const data = await res.json();
//       const fullTask = data.tasks?.[0];

//       if (fullTask) {
//         setSelectedTask(fullTask);
//       } else {
//         console.warn("API did not return full task data, using existing task object.");
//         setSelectedTask(task);
//       }
//     } catch (err) {
//       console.error("Failed to fetch full task data:", err);
//       setSelectedTask(task);
//     }
//   }, [getToken]);

//   const updateSelectedTaskFromFetched = useCallback(async () => {
//     if (selectedTask?.id) {
//       const token = await getToken();
//       const updatedRes = await fetch(`/api/timeline?id=${selectedTask.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!updatedRes.ok) {
//         console.error(`Frontend: Failed to update selected task from fetched: ${updatedRes.status} - ${updatedRes.statusText}`);
//         const errorData = await updatedRes.json();
//         console.error("Frontend: Error details for update selected task:", errorData);
//         await fetchTasks(currentPage, tasksPerPage);
//         return;
//       }
//       const updatedData = await updatedRes.json();
//       const updatedTask = updatedData.tasks?.[0];
//       if (updatedTask) {
//         setSelectedTask(updatedTask);
//       } else {
//         await fetchTasks(currentPage, tasksPerPage);
//       }
//     } else {
//       await fetchTasks(currentPage, tasksPerPage);
//     }
//   }, [selectedTask, fetchTasks, currentPage, tasksPerPage, getToken]);

//   const toggleSubtask = async (taskId: string, subtaskId: string) => {
//     const token = await getToken();
//     const res = await fetch(`/api/subtasks/${subtaskId}`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//       console.error(`Failed to toggle subtask: ${res.status} - ${res.statusText}`);
//       return;
//     }
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addSubtask = async () => {
//     if (!selectedTask || newSubtask.trim() === "") return;
//     const token = await getToken();
//     const res = await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
//       method: "POST",
//       body: JSON.stringify({ title: newSubtask }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//       console.error(`Failed to add subtask: ${res.status} - ${res.statusText}`);
//       return;
//     }
//     setNewSubtask("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const addNote = async () => {
//     if (!selectedTask || newNote.trim() === "") return;
//     const token = await getToken();
//     const res = await fetch(`/api/tasks/${selectedTask.id}/notes`, {
//       method: "POST",
//       body: JSON.stringify({
//         content: newNote,
//         authorName: user?.fullName || "Anonymous",
//         authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
//         createdAt: new Date().toISOString(),
//       }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) {
//       console.error(`Failed to add note: ${res.status} - ${res.statusText}`);
//       return;
//     }
//     setNewNote("");
//     await fetchTasks(currentPage, tasksPerPage);
//     await updateSelectedTaskFromFetched();
//   };

//   const handleReuploadAttachment = async (oldUrl: string, file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new file...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "PATCH",
//         body: JSON.stringify({ oldUrl, newUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File replaced!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 2000);
//     } catch (err) {
//       console.error("Error reuploading attachment:", err);
//       setUploadStatus("❌ An error occurred during reupload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleNewAttachmentUpload = async (file: File) => {
//     if (!selectedTask) return;
//     setUploadStatus("Uploading new attachment...");
//     try {
//       const newUrl = await uploadToCloudinary(file, setUploadStatus);
//       if (!newUrl) {
//         setUploadStatus("❌ Cloudinary upload failed.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "POST",
//         body: JSON.stringify({ url: newUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const responseText = await res.text();
//       let data = null;
//       try {
//         data = responseText ? JSON.parse(responseText) : {};
//       } catch (e) {
//         console.error("Failed to parse JSON response:", e);
//         setUploadStatus("❌ Server responded with invalid data.");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ New file uploaded successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//       setTimeout(() => setUploadStatus(""), 3000);
//     } catch (err) {
//       console.error("Error uploading new attachment:", err);
//       setUploadStatus("❌ An error occurred during new upload.");
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handleDeleteAttachment = useCallback((url: string) => {
//     if (!selectedTask) return;
//     setAttachmentToDeleteUrl(url);
//     setShowConfirmDeleteModal(true);
//   }, [selectedTask]);

//   const confirmDeleteAttachment = async () => {
//     if (!selectedTask || !attachmentToDeleteUrl) return;

//     setShowConfirmDeleteModal(false);
//     setUploadStatus("Deleting file...");

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
//         method: "DELETE",
//         body: JSON.stringify({ url: attachmentToDeleteUrl }),
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await res.text();
//       let data = null;
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         console.error("Invalid JSON response", e);
//         setUploadStatus("❌ Invalid server response");
//         setTimeout(() => setUploadStatus(""), 3000);
//         return;
//       }

//       if (!res.ok) {
//         setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
//       } else {
//         setUploadStatus("✅ File deleted successfully!");
//         await fetchTasks(currentPage, tasksPerPage);
//         await updateSelectedTaskFromFetched();
//       }
//     } catch (err) {
//       console.error("Error deleting attachment:", err);
//       setUploadStatus("❌ Error deleting attachment");
//     } finally {
//       setAttachmentToDeleteUrl(null);
//       setTimeout(() => setUploadStatus(""), 3000);
//     }
//   };

//   const handlePaymentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedTask) {
//       setPaymentUploadStatus("No task selected.");
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("amount", currentAmountInput);
//     formData.append("received", currentReceivedInput);

//     const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
//     if (fileInput?.files?.[0]) {
//       formData.append("file", fileInput.files[0]);
//     }

//     const userEmail = sessionClaims?.email as string || "Unknown User";

//     const userName = sessionClaims?.firstName as string || userEmail;
//     formData.append("updatedBy", userName);
//     formData.append("updatedAt", new Date().toISOString());

//     setPaymentUploadStatus("Processing payment update...");

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
//         method: "POST",
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Payment update failed");
//       }

//       setSelectedTask(data.task);

//       setCurrentAmountInput("");
//       setCurrentReceivedInput("");
//       if (fileInput) fileInput.value = '';

//       setPaymentUploadStatus("✅ Payment updated successfully!");
//       setShowPaymentHistory(false);

//     } catch (err: any) {
//       console.error("Payment submission failed:", err);
//       setPaymentUploadStatus(`❌ ${err.message || "An error occurred during payment update."}`);
//     } finally {
//       setTimeout(() => setPaymentUploadStatus(""), 3000);
//     }
//   };

//   const handleTogglePaymentHistory = useCallback(async () => {
//     if (!selectedTask?.id) return;

//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/timeline?id=${selectedTask.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!res.ok) {
//         console.error(`Failed to fetch fresh task data for payment history: ${res.status} - ${res.statusText}`);
//         const errorData = await res.json();
//         console.error("Error details for payment history fetch:", errorData);
//         setShowPaymentHistory((prev) => !prev);
//         return;
//       }
//       const data = await res.json();
//       const freshTask = data.tasks?.[0];

//       if (freshTask) {
//         setSelectedTask(freshTask);
//         setShowPaymentHistory((prev) => !prev);
//       } else {
//         console.error("Failed to fetch fresh task data for payment history.");
//         setShowPaymentHistory((prev) => !prev);
//       }
//     } catch (error) {
//       console.error("Error fetching fresh task data for payment history:", error);
//       setShowPaymentHistory((prev) => !prev);
//     }
//   }, [selectedTask, getToken]);

//   const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newLimit = parseInt(e.target.value, 10);
//     setTasksPerPage(newLimit);
//     setCurrentPage(1);
//   };

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   const pageNumbers = useMemo(() => {
//     const pages = [];
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }, [totalPages, currentPage]);

//   return (
//     <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
//           {allAssignees.map((id) => (
//             <Image
//               key={id}
//               src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//               alt={assigneeMap[id]?.name || "Assignee Avatar"}
//               width={32}
//               height={32}
//               className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
//                 selectedAvatar === id ? "border-blue-500" : "border-transparent"
//               }`}
//               onClick={() =>
//                 setSelectedAvatar((prev) => (prev === id ? null : id))
//               }
//               title={assigneeMap[id]?.name || id}
//             />
//           ))}
//         </div>
//         <input
//           type="text"
//           placeholder="Search tasks..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
//         />
//         <div className="flex items-center gap-2">
//           <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
//           <select
//             id="tasksPerPage"
//             value={tasksPerPage}
//             onChange={handleTasksPerPageChange}
//             className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={15}>15</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </div>
//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-500">Zoom:</label>
//           <input
//             type="range"
//             min={20}
//             max={100}
//             value={zoom}
//             onChange={(e) => setZoom(Number(e.target.value))}
//             className="w-24"
//           />
//         </div>
//       </div>
//       <hr className="my-4" />
//       <table className="min-w-full border-collapse border border-gray-200">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
//             <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
//             {Array.from({ length: totalDays }).map((_, i) => {
//               const current = addDays(startDate, i);
//               const isTodayColumn = isToday(current);
//               return (
//                 <th
//                   key={i}
//                   className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
//                     isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
//                   }`}
//                   style={{ minWidth: `${zoom}px` }}
//                 >
//                   {format(current, "dd")}
//                 </th>
//               );
//             })}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTasks.length === 0 ? (
//             <tr>
//               <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
//                 No tasks found with current filters or on this page.
//               </td>
//             </tr>
//           ) : (
//             filteredTasks.map((task, index) => {
//               const startOffset = Math.max(
//                 0,
//                 differenceInCalendarDays(new Date(task.start), startDate)
//               );
//               const duration =
//                 differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

//               return (
//                 <tr key={task.id} className="h-12 border-b border-gray-200">
//                   <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
//                     {(currentPage - 1) * tasksPerPage + index + 1}
//                   </td>
//                   <td
//                     onClick={() => handleTaskClick(task)}
//                     className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
//                   >
//                     <div className="font-semibold text-[13px] text-gray-800 truncate">
//                       📁 {task.name}
//                     </div>
//                     <div className="text-[11px] text-gray-500 truncate">
//                       🏪 {task.shop} / 👤 {task.customer}
//                     </div>
//                   </td>
//                   {Array.from({ length: totalDays }).map((_, i) => {
//                     const isBar = i >= startOffset && i < startOffset + duration;
//                     const bgColor =
//                       task.progress === 100
//                         ? "bg-green-500"
//                         : task.progress > 0
//                         ? "bg-blue-500"
//                         : "bg-gray-300";

//                     return (
//                       <td
//                         key={i}
//                         onClick={() => handleTaskClick(task)}
//                         className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
//                       >
//                         {isBar && (
//                           <div
//                             className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
//                             style={{ width: `${task.progress}%` }}
//                           >
//                             {task.progress}%
//                           </div>
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>
//       <hr className="my-4" />
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Previous
//           </button>
//           <div className="flex gap-1">
//             {pageNumbers.map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-3 py-1 text-sm font-medium rounded-lg ${
//                   currentPage === page
//                     ? "bg-blue-600 text-white shadow-sm"
//                     : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
//                 } transition-all`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             Next
//           </button>
//         </div>
//       )}
//       <hr className="my-4" />
//       <Dialog.Root
//         open={isPanelOpen}
//         onOpenChange={(open) => {
//           setIsPanelOpen(open);
//           if (!open) {
//             setSelectedTask(null);
//             setSelectedTaskId(null);
//           }
//         }}
//       >
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
//           <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
//             <Dialog.Title className="sr-only">Task Details</Dialog.Title>
//             {selectedTask && (
//               <>
//                 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
//                   <h2 className="text-2xl font-bold text-gray-900 leading-tight">
//                     {selectedTask.name}
//                   </h2>
//                   <Dialog.Close asChild>
//                     <button
//                       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       aria-label="Close"
//                     >
//                       <FaPlus className="rotate-45" />
//                     </button>
//                   </Dialog.Close>
//                 </div>
//                 <div className="space-y-6 mt-4">
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
//                     <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.name}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
//                         <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.start ? format(parseISO(selectedTask.start), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
//                         <p className="text-gray-800 mt-1">
//                           {selectedTask.end ? format(parseISO(selectedTask.end), "MMM dd, yyyy") : "N/A"}
//                         </p>
//                       </div>
//                       <div className="col-span-2">
//                         <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
//                         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
//                           <div
//                             className="bg-blue-600 h-2.5 rounded-full"
//                             style={{ width: `${selectedTask.progress}%` }}
//                           ></div>
//                         </div>
//                         <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
//                         selectedTask.assigneeIds.map((id) => (
//                           <Image
//                             key={id}
//                             src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
//                             alt={assigneeMap[id]?.name || "Assignee"}
//                             width={36}
//                             height={36}
//                             className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
//                             title={assigneeMap[id]?.name || id}
//                           />
//                         ))
//                       ) : (
//                         <p className="text-gray-500 text-sm">No assignees.</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
//                     <div className="space-y-3">
//                       {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
//                       {selectedTask.subtasks?.map((s) => (
//                         <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
//                           <input
//                             type="checkbox"
//                             checked={s.completed}
//                             onChange={() => toggleSubtask(selectedTask.id, s.id)}
//                             className="hidden"
//                           />
//                           {s.completed ? (
//                             <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//                           ) : (
//                             <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
//                           )}
//                           <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
//                             {s.title}
//                           </span>
//                         </label>
//                       ))}
//                       <div className="flex items-center gap-2 mt-4">
//                         <input
//                           type="text"
//                           value={newSubtask}
//                           onChange={(e) => setNewSubtask(e.target.value)}
//                           placeholder="Add new subtask..."
//                           className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         <button
//                           onClick={addSubtask}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newSubtask.trim() === ""}
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
//                     <div className="space-y-3">
//                       {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
//                       {selectedTask.notes?.map((note, idx) => (
//                         <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
//                           <p className="text-gray-700">{note.content}</p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             — {note.authorName || note.authorEmail || "Unknown"} on{" "}
//                             {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
//                           </p>
//                         </div>
//                       ))}
//                       <div className="mt-4">
//                         <textarea
//                           value={newNote}
//                           onChange={(e) => setNewNote(e.target.value)}
//                           placeholder="Add a new note..."
//                           rows={3}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
//                         ></textarea>
//                         <button
//                           onClick={addNote}
//                           className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
//                           disabled={newNote.trim() === ""}
//                         >
//                           Add Note
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="bg-white p-6 rounded-lg shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                       {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
//                       {selectedTask.attachments?.map((url, idx) => (
//                         <AttachmentItem
//                           key={url}
//                           url={url}
//                           index={idx}
//                           onReupload={handleReuploadAttachment}
//                           onDelete={handleDeleteAttachment}
//                         />
//                       ))}
//                       <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
//                         <FaPlus className="text-xl mb-1" />
//                         Add new
//                         <input
//                           type="file"
//                           accept="image/*,application/pdf"
//                           className="hidden"
//                           onChange={async (e) => {
//                             const file = e.target.files?.[0];
//                             if (file) {
//                               await handleNewAttachmentUpload(file);
//                               e.target.value = '';
//                             }
//                           }}
//                         />
//                       </label>
//                     </div>
//                     {uploadStatus && (
//                       <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
//                         {uploadStatus}
//                       </p>
//                     )}
//                   </div>
//                   <PaymentSection
//                     selectedTask={selectedTask}
//                     user={user}
//                     amount={currentAmountInput}
//                     setAmount={setCurrentAmountInput}
//                     received={currentReceivedInput}
//                     setReceived={setCurrentReceivedInput}
//                     paymentUploadStatus={paymentUploadStatus}
//                     setPaymentUploadStatus={setPaymentUploadStatus}
//                     handlePaymentSubmit={handlePaymentSubmit}
//                     showPaymentHistory={showPaymentHistory}
//                     setShowPaymentHistory={setShowPaymentHistory}
//                     handleTogglePaymentHistory={handleTogglePaymentHistory}
//                   />
//                 </div>
//               </>
//             )}
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>
//       <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
//         <Dialog.Portal>
//           <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
//           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
//             <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
//               Confirm Deletion
//             </Dialog.Title>
//             <Dialog.Description className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete this attachment? This action cannot be undone.
//             </Dialog.Description>
//             <div className="flex justify-end gap-3">
//               <Dialog.Close asChild>
//                 <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
//                   Cancel
//                 </button>
//               </Dialog.Close>
//               <button
//                 onClick={confirmDeleteAttachment}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </Dialog.Content>
//         </Dialog.Portal>
//       </Dialog.Root>
//     </div>
//   );
// }




























































// components/TaskTimeline.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Paintbrush } from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { format, differenceInCalendarDays, addDays, isToday, parseISO } from "date-fns";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { uploadToCloudinary } from "@/app/components/TaskForm/utils";
import { useUser, useAuth } from "@clerk/nextjs";
import { FaFilePdf, FaRedoAlt, FaTrashAlt, FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import  PaymentHistory from "./PaymentHistory";
import PaymentSection from "../components/PaymentSection";

// ... (your existing interfaces and component helper functions)

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Note {
  id: string;
  content: string;
  authorName?: string;
  authorEmail?: string;
  createdAt?: string;
}

interface PaymentEntry {
  amount: number;
  received: number;
  updatedAt: string;
  updatedBy: string;
  fileUrl?: string | null;
}

interface Task {
  id: string;
  name: string;
  shop: string;
  customer: string;
  start: string;
  end: string;
  progress: number;
  assigneeIds?: string[];
  subtasks?: Subtask[];
  notes?: Note[];
  attachments?: string[];
  amount?: number;
  received?: number;
  paymentHistory?: PaymentEntry[];
}

interface AssigneeDetails {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

const startDate = new Date("2025-07-10");
const endDate = new Date("2025-07-31");
const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

const isImageUrl = (url: string) => {
  return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
};

interface AttachmentItemProps {
  url: string;
  index: number;
  onReupload: (oldUrl: string, file: File) => Promise<void>;
  onDelete: (url: string) => void;
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({ url, index, onReupload, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="relative group border border-gray-200 rounded-lg overflow-hidden"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-24 flex items-center justify-center bg-gray-100"
      >
        {isImageUrl(url) ? (
          <img
            src={url}
            alt={`Attachment ${index + 1}`}
            className="w-full h-full object-cover transition"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 text-center p-2">
            <FaFilePdf className="text-4xl text-red-500" />
            <span className="text-xs mt-1 truncate w-full px-1">{url.substring(url.lastIndexOf('/') + 1)}</span>
          </div>
        )}
      </a>

      {showActions && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs z-10">
          <label className="cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors">
            <FaRedoAlt /> Reupload
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await onReupload(url, file);
                  e.target.value = '';
                }
              }}
            />
          </label>

          <button
            onClick={() => onDelete(url)}
            className="flex items-center gap-1 hover:text-red-500 transition-colors"
          >
            <FaTrashAlt /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const fetchAssigneeDetails = async (ids: string[]): Promise<AssigneeDetails[]> => {
  if (ids.length === 0) return [];
  try {
    const res = await fetch('/api/assignees', {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to fetch assignee details:", errorData.error);
      return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
    }
    const data = await res.json();
    return data.assignees;
  } catch (error) {
    console.error("Error fetching assignee details:", error);
    return ids.map(id => ({ id, name: "Unknown", email: "", imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}` }));
  }
};


export default function TaskTimeline() {
  const { user, sessionClaims } = useUser();
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(40);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [paymentUploadStatus, setPaymentUploadStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [attachmentToDeleteUrl, setAttachmentToDeleteUrl] = useState<string | null>(null);
  const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string; imageUrl: string; email: string }>>({});
  const [currentAmountInput, setCurrentAmountInput] = useState("");
  const [currentReceivedInput, setCurrentReceivedInput] = useState("");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [tasksVersion, setTasksVersion] = useState(0);

  useEffect(() => {
    if (selectedTask) {
      const latestPayment = selectedTask.paymentHistory?.[selectedTask.paymentHistory.length - 1];
      setCurrentAmountInput(latestPayment?.amount?.toString() || selectedTask.amount?.toString() || "");
      setCurrentReceivedInput(latestPayment?.received?.toString() || selectedTask.received?.toString() || "");
    }
  }, [selectedTask]);

  // ✅ Updated useEffect to use Clerk JWT token for the initial fetch
  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        const token = await getToken({ template: "default" });
        const res = await fetch(`/api/timeline?page=1&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch: ${res.status} - ${errorData.error}`);
        }
        const data = await res.json();
        setTasks(data.tasks || []);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      } catch (err) {
        console.error("Frontend: Failed to fetch tasks", err);
      }
    };
    fetchInitialTasks();
  }, [getToken]); // Depend on getToken to ensure it's available

  const fetchTasks = useCallback(async (page: number = currentPage, limit: number = tasksPerPage) => {
    const token = await getToken();
    const res = await fetch(`/api/timeline?page=${page}&limit=${limit}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`Frontend: Failed to fetch tasks: ${res.status} - ${res.statusText}`);
      const errorData = await res.json();
      console.error("Frontend: Error details:", errorData);
      setTasks([]);
      setTotalPages(1);
      setSelectedTask(null);
      setSelectedTaskId(null);
      setIsPanelOpen(false);
      return;
    }

    const data = await res.json();
    if (Array.isArray(data.tasks)) {
      setTasks(data.tasks);
      setTasksVersion(prev => prev + 1);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);

      if (isPanelOpen && selectedTaskId) {
        const updated = data.tasks.find((t: Task) => t.id === selectedTaskId);
        setSelectedTask(updated || null);
        if (!updated) {
          setIsPanelOpen(false);
          setSelectedTaskId(null);
        }
      }
    } else {
      console.error("Frontend: Invalid data format for tasks:", data);
      setTasks([]);
      setTotalPages(1);
      setSelectedTask(null);
      setSelectedTaskId(null);
      setIsPanelOpen(false);
    }
  }, [currentPage, tasksPerPage, isPanelOpen, selectedTaskId, getToken]);

  useEffect(() => {
    fetchTasks(currentPage, tasksPerPage);
  }, [currentPage, tasksPerPage, fetchTasks]);

  useEffect(() => {
    const ids = Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
    if (ids.length > 0) {
      fetchAssigneeDetails(ids).then((assignees) => {
        const map: Record<string, { name: string; imageUrl: string; email: string }> = Object.fromEntries(
          assignees.map((a) => [a.id, { name: a.name, imageUrl: a.imageUrl, email: a.email }])
        );
        setAssigneeMap(map);
      });
    } else {
      setAssigneeMap({});
    }
  }, [tasks]);

  const allAssignees = useMemo(() => {
    return Array.from(new Set(tasks.flatMap((task) => task.assigneeIds || [])));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let currentTasks = [...tasks];
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentTasks = currentTasks.filter(task =>
        task.name.toLowerCase().includes(lowerSearchTerm) ||
        task.shop.toLowerCase().includes(lowerSearchTerm) ||
        task.customer.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (selectedAvatar) {
      currentTasks = currentTasks.filter(task =>
        (task.assigneeIds || []).includes(selectedAvatar)
      );
    }
    return currentTasks;
  }, [tasks, searchTerm, selectedAvatar, tasksVersion]);

  const handleTaskClick = useCallback(async (task: Task) => {
    setSelectedTaskId(task.id);
    setIsPanelOpen(true);
    setShowPaymentHistory(false);

    try {
      const token = await getToken();
      const res = await fetch(`/api/timeline?id=${task.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
























      if (!res.ok) {
        console.error(`Frontend: Failed to fetch single task: ${res.status} - ${res.statusText}`);
        const errorData = await res.json();
        console.error("Frontend: Error details for single task:", errorData);
        setSelectedTask(task);
        return;
      }

      const data = await res.json();
      const fullTask = data.tasks?.[0];

      if (fullTask) {
        setSelectedTask(fullTask);
      } else {
        console.warn("API did not return full task data, using existing task object.");
        setSelectedTask(task);
      }
    } catch (err) {
      console.error("Failed to fetch full task data:", err);
      setSelectedTask(task);
    }
  }, [getToken]);

  const updateSelectedTaskFromFetched = useCallback(async () => {
    if (selectedTask?.id) {
      const token = await getToken();
      const updatedRes = await fetch(`/api/timeline?id=${selectedTask.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!updatedRes.ok) {
        console.error(`Frontend: Failed to update selected task from fetched: ${updatedRes.status} - ${updatedRes.statusText}`);
        const errorData = await updatedRes.json();
        console.error("Frontend: Error details for update selected task:", errorData);
        await fetchTasks(currentPage, tasksPerPage);
        return;
      }
      const updatedData = await updatedRes.json();
      const updatedTask = updatedData.tasks?.[0];
      if (updatedTask) {
        setSelectedTask(updatedTask);
      } else {
        await fetchTasks(currentPage, tasksPerPage);
      }
    } else {
      await fetchTasks(currentPage, tasksPerPage);
    }
  }, [selectedTask, fetchTasks, currentPage, tasksPerPage, getToken]);

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const token = await getToken();
    const res = await fetch(`/api/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error(`Failed to toggle subtask: ${res.status} - ${res.statusText}`);
      return;
    }
    await fetchTasks(currentPage, tasksPerPage);
    await updateSelectedTaskFromFetched();
  };

  const addSubtask = async () => {
    if (!selectedTask || newSubtask.trim() === "") return;
    const token = await getToken();
    const res = await fetch(`/api/tasks/${selectedTask.id}/subtasks`, {
      method: "POST",
      body: JSON.stringify({ title: newSubtask }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error(`Failed to add subtask: ${res.status} - ${res.statusText}`);
      return;
    }
    setNewSubtask("");
    await fetchTasks(currentPage, tasksPerPage);
    await updateSelectedTaskFromFetched();
  };

  const addNote = async () => {
    if (!selectedTask || newNote.trim() === "") return;
    const token = await getToken();
    const res = await fetch(`/api/tasks/${selectedTask.id}/notes`, {
      method: "POST",
      body: JSON.stringify({
        content: newNote,
        authorName: user?.fullName || "Anonymous",
        authorEmail: user?.primaryEmailAddress?.emailAddress || user?.id || "unknown@example.com",
        createdAt: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error(`Failed to add note: ${res.status} - ${res.statusText}`);
      return;
    }
    setNewNote("");
    await fetchTasks(currentPage, tasksPerPage);
    await updateSelectedTaskFromFetched();
  };

  const handleReuploadAttachment = async (oldUrl: string, file: File) => {
    if (!selectedTask) return;
    setUploadStatus("Uploading new file...");
    try {
      const newUrl = await uploadToCloudinary(file, setUploadStatus);
      if (!newUrl) {
        setUploadStatus("❌ Cloudinary upload failed.");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }

      const token = await getToken();
      const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
        method: "PATCH",
        body: JSON.stringify({ oldUrl, newUrl }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await res.text();
      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        setUploadStatus("❌ Server responded with invalid data.");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }

      if (!res.ok) {
        setUploadStatus(`❌ Reupload failed: ${data.error || 'Unknown error'}`);
      } else {
        setUploadStatus("✅ File replaced!");
        await fetchTasks(currentPage, tasksPerPage);
        await updateSelectedTaskFromFetched();
      }
      setTimeout(() => setUploadStatus(""), 2000);
    } catch (err) {
      console.error("Error reuploading attachment:", err);
      setUploadStatus("❌ An error occurred during reupload.");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handleNewAttachmentUpload = async (file: File) => {
    if (!selectedTask) return;
    setUploadStatus("Uploading new attachment...");
    try {
      const newUrl = await uploadToCloudinary(file, setUploadStatus);
      if (!newUrl) {
        setUploadStatus("❌ Cloudinary upload failed.");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }

      const token = await getToken();
      const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
        method: "POST",
        body: JSON.stringify({ url: newUrl }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await res.text();
      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        setUploadStatus("❌ Server responded with invalid data.");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }

      if (!res.ok) {
        setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      } else {
        setUploadStatus("✅ New file uploaded successfully!");
        await fetchTasks(currentPage, tasksPerPage);
        await updateSelectedTaskFromFetched();
      }
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      console.error("Error uploading new attachment:", err);
      setUploadStatus("❌ An error occurred during new upload.");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handleDeleteAttachment = useCallback((url: string) => {
    if (!selectedTask) return;
    setAttachmentToDeleteUrl(url);
    setShowConfirmDeleteModal(true);
  }, [selectedTask]);

  const confirmDeleteAttachment = async () => {
    if (!selectedTask || !attachmentToDeleteUrl) return;

    setShowConfirmDeleteModal(false);
    setUploadStatus("Deleting file...");

    try {
      const token = await getToken();
      const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
        method: "DELETE",
        body: JSON.stringify({ url: attachmentToDeleteUrl }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Invalid JSON response", e);
        setUploadStatus("❌ Invalid server response");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }

      if (!res.ok) {
        setUploadStatus(`❌ Delete failed: ${data.error || 'Unknown error'}`);
      } else {
        setUploadStatus("✅ File deleted successfully!");
        await fetchTasks(currentPage, tasksPerPage);
        await updateSelectedTaskFromFetched();
      }
    } catch (err) {
      console.error("Error deleting attachment:", err);
      setUploadStatus("❌ Error deleting attachment");
    } finally {
      setAttachmentToDeleteUrl(null);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTask) {
      setPaymentUploadStatus("No task selected.");
      setTimeout(() => setPaymentUploadStatus(""), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("amount", currentAmountInput);
    formData.append("received", currentReceivedInput);

    const fileInput = (e.target as HTMLFormElement).paymentFile as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("file", fileInput.files[0]);
    }

    const userEmail = sessionClaims?.email as string || "Unknown User";

    const userName = sessionClaims?.firstName as string || userEmail;
    formData.append("updatedBy", userName);
    formData.append("updatedAt", new Date().toISOString());

    setPaymentUploadStatus("Processing payment update...");

    try {
      const token = await getToken();
      const res = await fetch(`/api/tasks/${selectedTask.id}/payments`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment update failed");
      }

      setSelectedTask(data.task);

      setCurrentAmountInput("");
      setCurrentReceivedInput("");
      if (fileInput) fileInput.value = '';

      setPaymentUploadStatus("✅ Payment updated successfully!");
      setShowPaymentHistory(false);

    } catch (err: any) {
      console.error("Payment submission failed:", err);
      setPaymentUploadStatus(`❌ ${err.message || "An error occurred during payment update."}`);
    } finally {
      setTimeout(() => setPaymentUploadStatus(""), 3000);
    }
  };

  const handleTogglePaymentHistory = useCallback(async () => {
    if (!selectedTask?.id) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/timeline?id=${selectedTask.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error(`Failed to fetch fresh task data for payment history: ${res.status} - ${res.statusText}`);
        const errorData = await res.json();
        console.error("Error details for payment history fetch:", errorData);
        setShowPaymentHistory((prev) => !prev);
        return;
      }
      const data = await res.json();
      const freshTask = data.tasks?.[0];

      if (freshTask) {
        setSelectedTask(freshTask);
        setShowPaymentHistory((prev) => !prev);
      } else {
        console.error("Failed to fetch fresh task data for payment history.");
        setShowPaymentHistory((prev) => !prev);
      }
    } catch (error) {
      console.error("Error fetching fresh task data for payment history:", error);
      setShowPaymentHistory((prev) => !prev);
    }
  }, [selectedTask, getToken]);

  const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setTasksPerPage(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };





















  
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-md overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Filter by assignee:</span>
          {allAssignees.map((id) => (
            <Image
              key={id}
              src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
              alt={assigneeMap[id]?.name || "Assignee Avatar"}
              width={32}
              height={32}
              className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 ${
                selectedAvatar === id ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() =>
                setSelectedAvatar((prev) => (prev === id ? null : id))
              }
              title={assigneeMap[id]?.name || id}
            />
          ))}
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="tasksPerPage" className="text-sm text-gray-500">Tasks per page:</label>
          <select
            id="tasksPerPage"
            value={tasksPerPage}
            onChange={handleTasksPerPageChange}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Zoom:</label>
          <input
            type="range"
            min={20}
            max={100}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
      <hr className="my-4" />
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 font-semibold text-sm text-center border-r border-b w-[50px]">#</th>
            <th className="p-2 font-semibold text-sm text-center border-r border-b w-[300px]">Task</th>
            {Array.from({ length: totalDays }).map((_, i) => {
              const current = addDays(startDate, i);
              const isTodayColumn = isToday(current);
              return (
                <th
                  key={i}
                  className={`text-[11px] p-1 text-center border-r border-b border-gray-200 ${
                    isTodayColumn ? "bg-yellow-100 font-bold text-yellow-900" : "bg-gray-50"
                  }`}
                  style={{ minWidth: `${zoom}px` }}
                >
                  {format(current, "dd")}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan={totalDays + 2} className="text-center py-8 text-gray-500">
                No tasks found with current filters or on this page.
              </td>
            </tr>
          ) : (
            filteredTasks.map((task, index) => {
              const startOffset = Math.max(
                0,
                differenceInCalendarDays(new Date(task.start), startDate)
              );
              const duration =
                differenceInCalendarDays(new Date(task.end), new Date(task.start)) + 1;

              return (
                <tr key={task.id} className="h-12 border-b border-gray-200">
                  <td className="p-2 border-r bg-gray-50 text-center text-sm text-gray-600">
                    {(currentPage - 1) * tasksPerPage + index + 1}
                  </td>
                  <td
                    onClick={() => handleTaskClick(task)}
                    className="p-2 border-r bg-gray-50 hover:bg-gray-100 transition cursor-pointer leading-tight"
                  >
                    <div className="font-semibold text-[13px] text-gray-800 truncate">
                      📁 {task.name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      🏪 {task.shop} / 👤 {task.customer}
                    </div>
                  </td>
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const isBar = i >= startOffset && i < startOffset + duration;
                    const bgColor =
                      task.progress === 100
                        ? "bg-green-500"
                        : task.progress > 0
                        ? "bg-blue-500"
                        : "bg-gray-300";

                    return (
                      <td
                        key={i}
                        onClick={() => handleTaskClick(task)}
                        className={`border-r border-gray-200 ${isBar ? `${bgColor} relative cursor-pointer` : ""}`}
                      >
                        {isBar && (
                          <div
                            className="h-full absolute top-0 left-0 bg-white/20 text-white text-[10px] px-1 flex items-center"
                            style={{ width: `${task.progress}%` }}
                          >
                            {task.progress}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <hr className="my-4" />
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                } transition-all`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
      <hr className="my-4" />
      <Dialog.Root
        open={isPanelOpen}
        onOpenChange={(open) => {
          setIsPanelOpen(open);
          if (!open) {
            setSelectedTask(null);
            setSelectedTaskId(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-100 p-6 z-50 shadow-2xl overflow-y-auto">
            <Dialog.Title className="sr-only">Task Details</Dialog.Title>
            {selectedTask && (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {selectedTask.name}
                  </h2>
                  <Dialog.Close asChild>
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Close"
                    >
                      <FaPlus className="rotate-45" />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="space-y-6 mt-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                      <div className="col-span-2">
                        <p className="text-gray-500 font-medium text-xs uppercase">Task Name</p>
                        <p className="text-gray-800 mt-1">{selectedTask.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium text-xs uppercase">Shop</p>
                        <p className="text-gray-800 mt-1">{selectedTask.shop}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium text-xs uppercase">Customer</p>
                        <p className="text-gray-800 mt-1">{selectedTask.customer}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium text-xs uppercase">Start Date</p>
                        <p className="text-gray-800 mt-1">
                          {selectedTask.start ? format(parseISO(selectedTask.start), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium text-xs uppercase">End Date</p>
                        <p className="text-gray-800 mt-1">
                          {selectedTask.end ? format(parseISO(selectedTask.end), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 font-medium text-xs uppercase">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${selectedTask.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-gray-800 text-sm mt-1">{selectedTask.progress}% Complete</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignees</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.assigneeIds && selectedTask.assigneeIds.length > 0 ? (
                        selectedTask.assigneeIds.map((id) => (
                          <Image
                            key={id}
                            src={assigneeMap[id]?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`}
                            alt={assigneeMap[id]?.name || "Assignee"}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
                            title={assigneeMap[id]?.name || id}
                          />
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No assignees.</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
                    <div className="space-y-3">
                      {selectedTask.subtasks?.length === 0 && <p className="text-gray-500 text-sm">No subtasks yet.</p>}
                      {selectedTask.subtasks?.map((s) => (
                        <label key={s.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={s.completed}
                            onChange={() => toggleSubtask(selectedTask.id, s.id)}
                            className="hidden"
                          />
                          {s.completed ? (
                            <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
                          ) : (
                            <FaRegCircle className="text-gray-400 text-lg flex-shrink-0" />
                          )}
                          <span className={`${s.completed ? "line-through text-gray-500" : ""}`}>
                            {s.title}
                          </span>
                        </label>
                      ))}
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          placeholder="Add new subtask..."
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={addSubtask}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={newSubtask.trim() === ""}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
                    <div className="space-y-3">
                      {selectedTask.notes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
                      {selectedTask.notes?.map((note, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
                          <p className="text-gray-700">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            — {note.authorName || note.authorEmail || "Unknown"} on{" "}
                            {note.createdAt ? format(parseISO(note.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                          </p>
                        </div>
                      ))}
                      <div className="mt-4">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a new note..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
                        ></textarea>
                        <button
                          onClick={addNote}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={newNote.trim() === ""}
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedTask.attachments?.length === 0 && <p className="text-gray-500 text-sm col-span-full">No attachments yet.</p>}
                      {selectedTask.attachments?.map((url, idx) => (
                        <AttachmentItem
                          key={url}
                          url={url}
                          index={idx}
                          onReupload={handleReuploadAttachment}
                          onDelete={handleDeleteAttachment}
                        />
                      ))}
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-24 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-xs">
                        <FaPlus className="text-xl mb-1" />
                        Add new
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleNewAttachmentUpload(file);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    {uploadStatus && (
                      <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>
                        {uploadStatus}
                      </p>
                    )}
                  </div>
                  <PaymentSection
                    selectedTask={selectedTask}
                    user={user}
                    amount={currentAmountInput}
                    setAmount={setCurrentAmountInput}
                    received={currentReceivedInput}
                    setReceived={setCurrentReceivedInput}
                    paymentUploadStatus={paymentUploadStatus}
                    setPaymentUploadStatus={setPaymentUploadStatus}
                    handlePaymentSubmit={handlePaymentSubmit}
                    showPaymentHistory={showPaymentHistory}
                    setShowPaymentHistory={setShowPaymentHistory}
                    handleTogglePaymentHistory={handleTogglePaymentHistory}
                  />
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={showConfirmDeleteModal} onOpenChange={setShowConfirmDeleteModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[100] max-w-sm w-full">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this attachment? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDeleteAttachment}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
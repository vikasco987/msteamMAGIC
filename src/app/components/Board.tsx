



// "use client";
// import Stopwatch from "../components/Stopwatch";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import TaskAttachments from "../components/TaskAttachments"; // Keep this import

// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import EditTaskModal from "../components/EditTaskModal";
// import { FaSearch, FaSortAmountDownAlt, FaFileExcel } from "react-icons/fa"; // FaDownload is still needed for export and in TaskAttachments if you pass it there.

// // --- TYPE UPDATE ---
// // Ensure the Task type correctly reflects the structure from your form
// // and includes customFields as a flexible object and attachments as an array of strings (URLs/paths)
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   // Assuming customFields will store label-value pairs.
//   // The 'value' might be a string, or an object if it includes file metadata.
//   // For simplicity, we'll type it as an array of objects matching the CustomField from your form.
//   customFields?: { label: string; value: string | File[] | string[] }[]; // Update to match the TaskForm's CustomField structure
//   attachments?: string[]; // Array of attachment URLs/paths
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const audioRef = useRef<HTMLAudioElement>(null);

//   const fetchTasks = useCallback(async () => {
//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json) ? json : json.tasks;

//       // Filter tasks relevant to the current user
//       // const relevantTasks = taskArray?.filter(
//       //   (task: Task) =>
//       //     task.assignee?.id === user?.id || task.assigneeId === user?.id
//       // );
      
//     console.log("Fetched tasks:", taskArray);

//       const relevantTasks = taskArray?.filter(
//   (task: Task) =>
//     task.assigneeId === user?.id ||
//     task.createdByClerkId === user?.id // Optional: show creator's own tasks too
// );


//       setTasks(relevantTasks || []);
//     } catch (err) {
//       console.error("Error fetching tasks:", err);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   // The handleDownloadAllAttachments function is now moved to TaskAttachments component.
//   // We can remove it from here to avoid duplication.
//   // const handleDownloadAllAttachments = async (attachments: string[], taskId: string) => { /* ... */ };


//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID",
//       "Title",
//       "Description",
//       "Status",
//       "Due Date",
//       "Priority",
//       "Assigner Name",
//       "Assigner Email",
//       "Assignee Name",
//       "Assignee Email",
//       "Created At",
//       "Updated At",
//       "Tags",
//       "Subtasks",
//       "Custom Fields",
//       "Attachments",
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         // --- CUSTOM FIELDS EXPORT UPDATE ---
//         task.customFields
//           ? task.customFields
//               .map((f) => `${f.label}: ${Array.isArray(f.value) ? f.value.length > 0 ? 'Files attached' : '' : f.value}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; "),
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />

//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>
//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>
//                     {col.title}
//                   </h2>
//                   {sortedFilteredTasks
//                     .filter((task) => task.status === col.id)
//                     .map((task, index) => (
//                       <Draggable draggableId={task.id} index={index} key={task.id}>
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                           >
//                             <h3 className="text-purple-800 font-semibold text-lg mb-1">{task.title}</h3>

//                             {/* Description */}
//                             {task.description && (
//                               <p className="text-gray-700 text-sm mb-1">{task.description}</p>
//                             )}

//                             {/* Assigner */}
//                             {task.assigner && (
//                               <p className="text-xs text-gray-500">
//                                 <span className="font-semibold">Assigned by:</span>{" "}
//                                 {task.assigner.name || task.assigner.email}
//                               </p>
//                             )}

//                             {/* Assignee (explicitly show if different from assigner or to clarify) */}
//                             {task.assignee && task.assignee.id !== task.assigner?.id && (
//                                <p className="text-xs text-gray-500">
//                                   <span className="font-semibold">Assigned to:</span>{" "}
//                                   {task.assignee.name || task.assignee.email}
//                                </p>
//                             )}

//                             {/* Due Date */}
//                             {task.dueDate && (
//                                <p className="text-xs text-gray-500">
//                                   <span className="font-semibold">Due:</span>{" "}
//                                   {new Date(task.dueDate).toLocaleDateString()}
//                                </p>
//                             )}

//                             {/* Priority */}
//                             {task.priority && (
//                                <p className="text-xs text-gray-500 capitalize">
//                                   <span className="font-semibold">Priority:</span>{" "}
//                                   {task.priority}
//                                </p>
//                             )}

//                             {/* Created At */}
//                             {task.createdAt && (
//                               <p className="text-xs text-gray-500">
//                                 <span className="font-semibold">Created:</span>{" "}
//                                 {new Date(task.createdAt).toLocaleString()}
//                               </p>
//                             )}

//                             {/* Updated At */}
//                             {task.updatedAt && (
//                                <p className="text-xs text-gray-500">
//                                   <span className="font-semibold">Last Updated:</span>{" "}
//                                   {new Date(task.updatedAt).toLocaleString()}
//                                </p>
//                             )}

//                             {/* Expiry (2 days after creation) */}
//                             {task.createdAt && (
//                               <p className="text-xs text-gray-500">
//                                 <span className="font-semibold">Expires:</span>{" "}
//                                 {new Date(new Date(task.createdAt).getTime() + 2 * 86400000).toLocaleString()}
//                               </p>
//                             )}

//                             {/* Tags */}
//                             {task.tags && task.tags.length > 0 && (
//                                <p className="text-xs text-gray-500">
//                                   <span className="font-semibold">Tags:</span>{" "}
//                                   {task.tags.join(', ')}
//                                </p>
//                             )}

//                             {/* Subtasks */}
//                             {task.subtasks && task.subtasks.length > 0 && (
//                                <div>
//                                   <p className="text-xs text-gray-500 font-semibold">Subtasks:</p>
//                                   <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
//                                      {task.subtasks.map((sub, i) => (
//                                         <li key={i}>{sub.title}</li>
//                                      ))}
//                                   </ul>
//                                </div>
//                             )}

//                             {/* --- Use the TaskAttachments component here --- */}
//                             <TaskAttachments
//                               customFields={task.customFields}
//                               attachments={task.attachments}
//                             />

//                             {/* Stopwatch */}
//                             {task.createdAt && <Stopwatch createdAt={task.createdAt} />}

//                             <div className="mt-3 flex gap-4">
//                               <button
//                                 onClick={() => setEditingTask(task)}
//                                 className="text-sm text-blue-600"
//                               >
//                                 ✏️ Edit
//                               </button>
//                               <button
//                                 onClick={() => handleDeleteTask(task.id)}
//                                 className="text-sm text-red-600"
//                               >
//                                 🗑️ Delete
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }













// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";



// import { FaSearch, FaSortAmountDownAlt, FaFileExcel } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string; // fallback if your API returns just this
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const audioRef = useRef<HTMLAudioElement>(null);

//   const fetchTasks = useCallback(async () => {
//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json) ? json : json.tasks;

//       // Filter tasks assigned to user or created by user
//       const relevantTasks = taskArray?.filter(
//         (task: Task) =>
//           task.assignee?.id === user?.id ||
//           task.assigneeId === user?.id || // fallback if assignee is string id
//           task.createdByClerkId === user?.id
//       );

//       setTasks(relevantTasks || []);
//     } catch (err) {
//       console.error("Error fetching tasks:", err);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null); // close modal if open
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID",
//       "Title",
//       "Description",
//       "Status",
//       "Due Date",
//       "Priority",
//       "Assigner Name",
//       "Assigner Email",
//       "Assignee Name",
//       "Assignee Email",
//       "Created At",
//       "Updated At",
//       "Tags",
//       "Subtasks",
//       "Custom Fields",
//       "Attachments",
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; "),
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         // Treat missing dueDate as far future to sort last
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />

//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>
//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2
//                     className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}
//                   >
//                     {col.title}
//                   </h2>
//                   {sortedFilteredTasks
//                     .filter((task) => task.status === col.id)
//                     .map((task, index) => (
//                       <Draggable draggableId={task.id} index={index} key={task.id}>
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                           >
//                             {/* <h3 className="text-purple-800 font-semibold text-lg mb-1">
//                               {task.title}
//                             </h3>
//                             <TaskDetailsCard task={task} /> */}
//                             {/* <TaskDetailsCard task={task} /> */}


//                             {viewMode === "edit" ? (
//   <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
// ) : (
//   <TaskDetailsCard task={task} />
// )}



//                             <button
//                               onClick={() => setEditingTask(task)}
//                               className="text-sm text-blue-600 mt-2"
//                               aria-label={`Edit task ${task.title}`}
//                             >
//                               ✏️ Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteTask(task.id)}
//                               className="text-sm text-red-600 ml-4"
//                               aria-label={`Delete task ${task.title}`}
//                             >
//                               🗑️ Delete
//                             </button>
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask} // ✅ Required prop
//         />
//       )}
//     </div>
//   );
// }












// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);

//   const fetchTasks = useCallback(async () => {
//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json) ? json : json.tasks;

//       const relevantTasks = taskArray?.filter(
//         (task: Task) =>
//           task.assignee?.id === user?.id ||
//           task.assigneeId === user?.id ||
//           task.createdByClerkId === user?.id
//       );

//       setTasks(relevantTasks || []);
//     } catch (err) {
//       console.error("Error fetching tasks:", err);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                           ) : (
//                             <TaskDetailsCard task={task} />
//                           )}

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="text-sm text-red-600 ml-4"
//                             aria-label={`Delete task ${task.title}`}
//                           >
//                             🗑️ Delete
//                           </button>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }


























// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// // import type { Task } from "../../types/task";
// import type { Task } from "../../../types/task";


// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";

// // ✅ Updated Task type
// // export type Task = {
// //   id: string;
// //   title: string;
// //   description?: string;
// //   status: string;
// //   dueDate?: string;
// //   priority?: string;
// //   assigner?: {
// //     id?: string;
// //     name?: string;
// //     email?: string;
// //   };
// //   assignee?: {
// //     id?: string;
// //     name?: string;
// //     email?: string;
// //   };
// //   assigneeId?: string;
// //   createdByClerkId?: string;
// //   updatedAt?: string;
// //   createdAt?: string;
// //   tags?: string[];
// //   subtasks?: { title: string }[];
// //   customFields?: Record<string, unknown>;
// //   attachments?: string[];
// // };


// const columns = [
//   {
//     id: "todo",
//     title: "\uD83D\uDCDD To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "\u23F3 In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "\u2705 Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const [isAdmin, setIsAdmin] = useState(false);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");


//   // const fetchTasks = useCallback(async () => {
//   //   try {
//   //     const res = await fetch("/api/tasks");
//   //     const json = await res.json();
//   //     const taskArray = Array.isArray(json) ? json : json.tasks;

   
// // );


// // const relevantTasks = taskArray?.filter(
// //   (task: Task) => task.assigneeIds?.includes(user?.id)
// // );

// // const relevantTasks = role === "master"
// //   ? taskArray
// //   : taskArray.filter((task: Task) =>
// //       task.assigneeIds?.includes(user?.id)
// //     );





// //       setTasks(relevantTasks || []);
// //     } catch (err) {
// //       console.error("Error fetching tasks:", err);
// //     }
// //   }, [user?.id]);




// const checkAndFetch = async () => {
//   if (!user?.isLoaded || !user?.id) return;

//   const role =
//     user.publicMetadata?.role || user.privateMetadata?.role || "";

//   setUserRole(role);
//   setIsAdmin(role === "admin" || role === "master");

//   try {
//     const res = await fetch("/api/tasks");
//     const json = await res.json();
//     const taskArray = Array.isArray(json) ? json : json.tasks;

//     const relevantTasks =
//       role === "master"
//         ? taskArray
//         : taskArray.filter((task: Task) =>
//             task.assigneeIds?.includes(user.id)
//           );

//     setTasks(relevantTasks || []);
//   } catch (err) {
//     console.error("Error fetching tasks:", err);
//   }
// };




 

// // useEffect(() => {
// //   // const checkRole = async () => {
// //   //   if (user) {
// //   //     const role =
// //   //       user.publicMetadata?.role || user.privateMetadata?.role || "";
// //   //     setIsAdmin(role === "admin");
// //   //   }
// //   // };

// // //   const checkRole = async () => {
// // //   if (user) {
// // //     const role =
// // //       user.publicMetadata?.role || user.privateMetadata?.role || "";
// // //     setIsAdmin(role === "admin" || role === "master"); // ✅ include master
// // //   }
// // // };


// //   if (user?.id) {
// //     fetchTasks();
// //     checkRole(); // 👈 check if user is admin
// //   }
// // }, [user?.id, fetchTasks]);

//  console.log("🔍 Logged-
//                           ) : (
//                             <TaskDetailsCard task={task} />
//                           )}

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           {/* <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="text-sm text-red-600 ml-4"
//                             aria-label={`Delete task ${task.title}`}
//                           >
//                             🗑️ Delete
//                           </button> */}
//                           {isAdmin && (
//   <button
//     onClick={() => handleDeleteTask(task.id)}
//     className="text-sm text-red-600 ml-4"
//     aria-label={`Delete task ${task.title}`}
//   >
//     🗑️ Delete
//   </button>
// )}

//                         </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }

























//   // useEffect(() => {
//   //   if (user?.id) fetchTasks();
//   // }, [user?.id, fetchTasks]);



// //   useEffect(() => {
// //   if (user?.id) {
// //     checkAndFetch();
// //   }
// // }, [user?.id]);

// useEffect(() => {
//   if (user?.isLoaded && user?.id) {
//     checkAndFetch();
//   }
// }, [user]);



//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       await checkAndFetch();
//       // fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       // fetchTasks();
//       await checkAndFetch(); 
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       // await fetchTasks();
//       await checkAndFetch(); 
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />


















































 







// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);

//   // const fetchTasks = useCallback(async () => {
//   //   try {
//   //     const res = await fetch("/api/tasks");
//   //     const json = await res.json();
//   //     const taskArray = Array.isArray(json) ? json : json.tasks;

//   //     const relevantTasks = taskArray?.filter(
//   //       (task: Task) =>
//   //         task.assignee?.id === user?.id ||
//   //         task.assigneeId === user?.id ||
//   //         task.createdByClerkId === user?.id
//   //     );

//   //     setTasks(relevantTasks || []);
//   //   } catch (err) {
//   //     console.error("Error fetching tasks:", err);
//   //   }
//   // }, [user?.id]);


//   const fetchTasks = useCallback(async () => {
//   if (!user) return;

//   const role =
//     user.publicMetadata?.role || user.privateMetadata?.role || "";
//   const userId = user.id;

//   try {
//     const res = await fetch("/api/tasks");
//     const json = await res.json();
//     const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//     const visibleTasks =
//       role === "master"
//         ? taskArray
//         : taskArray.filter(
//             (task: Task) =>
//               task.createdByClerkId === userId ||
//               task.assignee?.id === userId ||
//               task.assigneeId === userId
//           );

//     setTasks(visibleTasks);
//   } catch (err) {
//     console.error("Error fetching tasks:", err);
//   }
// }, [user]);







//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   // const onDragEnd = async (result: DropResult) => {
//   //   const { destination, source, draggableId } = result;
//   //   if (!destination || destination.droppableId === source.droppableId) return;

//   //   const updated = tasks.map((t) =>
//   //     t.id === draggableId ? { ...t, status: destination.droppableId } : t
//   //   );
//   //   setTasks(updated);

//   //   try {
//   //     await fetch(`/api/tasks/${draggableId}`, {
//   //       method: "PATCH",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ status: destination.droppableId }),
//   //     });
//   //     fetchTasks();
//   //   } catch (error) {
//   //     console.error("Failed to update task status:", error);
//   //   }
//   // };



//   const onDragEnd = async (result: DropResult) => {
//   const { destination, source, draggableId } = result;
//   if (!destination || destination.droppableId === source.droppableId) return;

//   // Find the task being moved
//   const task = tasks.find((t) => t.id === draggableId);
//   if (!task) return;

//   // ✅ Only allow movement if user is assigned
//   const assignedUserIds = task.assigneeId ? [task.assigneeId] : [];
//   if (!assignedUserIds.includes(user?.id || "")) {
//     alert("Only the assigned user can move this task.");
//     return;
//   }

//   // Update local state
//   const updated = tasks.map((t) =>
//     t.id === draggableId ? { ...t, status: destination.droppableId } : t
//   );
//   setTasks(updated);

//   try {
//     await fetch(`/api/tasks/${draggableId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: destination.droppableId }),
//     });
//     fetchTasks();
//   } catch (error) {
//     console.error("Failed to update task status:", error);
//   }
// };


//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                           ) : (
//                             <TaskDetailsCard task={task} />
//                           )}

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="text-sm text-red-600 ml-4"
//                             aria-label={`Delete task ${task.title}`}
//                           >
//                             🗑️ Delete
//                           </button>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }


























 







// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");

  

//   // const fetchTasks = useCallback(async () => {
//   //   try {
//   //     const res = await fetch("/api/tasks");
//   //     const json = await res.json();
//   //     const taskArray = Array.isArray(json) ? json : json.tasks;

//   //     const relevantTasks = taskArray?.filter(
//   //       (task: Task) =>
//   //         task.assignee?.id === user?.id ||
//   //         task.assigneeId === user?.id ||
//   //         task.createdByClerkId === user?.id
//   //     );

//   //     setTasks(relevantTasks || []);
//   //   } catch (err) {
//   //     console.error("Error fetching tasks:", err);
//   //   }
//   // }, [user?.id]);




// // const fetchTasks = useCallback(async () => {
// //   if (!user) return;

// //   const role =
// //     user.publicMetadata?.role || user.privateMetadata?.role || "";
// //   const userId = user.id;

// //   try {
// //     const res = await fetch("/api/tasks");
// //     const json = await res.json();
// //     const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

// //     const visibleTasks =
// //       role === "master"
// //         ? taskArray
// //         : taskArray.filter((task: Task) =>
// //             task.assigneeIds?.includes(userId) ||
// //             task.createdByClerkId === userId
// //           );

// //     setTasks(visibleTasks);
// //   } catch (err) {
// //     console.error("Error fetching tasks:", err);
// //   }
// // }, [user]);


// const fetchTasks = useCallback(async () => {
//   if (!user) return;

//   const role =
//     user.publicMetadata?.role || user.privateMetadata?.role || "";
//   const userId = user.id;
//   setUserRole(role); // ✅ Set the role

//   try {
//     const res = await fetch("/api/tasks");
//     const json = await res.json();
//     const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//     const visibleTasks =
//       role === "master"
//         ? taskArray
//         : taskArray.filter((task: Task) =>
//             task.assigneeIds?.includes(userId) ||
//             task.createdByClerkId === userId
//           );

//     setTasks(visibleTasks);
//   } catch (err) {
//     console.error("Error fetching tasks:", err);
//   }
// }, [user]);




//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);



//   useEffect(() => {
//   if (!user?.id) return;

//   const interval = setInterval(() => {
//     fetchTasks(); // 🔁 Poll every 10 seconds
//   }, 10000);

//   return () => clearInterval(interval); // cleanup on unmount
// }, [user?.id, fetchTasks]);


//   // const onDragEnd = async (result: DropResult) => {
//   //   const { destination, source, draggableId } = result;
//   //   if (!destination || destination.droppableId === source.droppableId) return;

//   //   const updated = tasks.map((t) =>
//   //     t.id === draggableId ? { ...t, status: destination.droppableId } : t
//   //   );
//   //   setTasks(updated);

//   //   try {
//   //     await fetch(`/api/tasks/${draggableId}`, {
//   //       method: "PATCH",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ status: destination.droppableId }),
//   //     });
//   //     fetchTasks();
//   //   } catch (error) {
//   //     console.error("Failed to update task status:", error);
//   //   }
//   // };



//   const onDragEnd = async (result: DropResult) => {
//   const { destination, source, draggableId } = result;
//   if (!destination || destination.droppableId === source.droppableId) return;

//   // Find the task being moved
//   const task = tasks.find((t) => t.id === draggableId);
//   if (!task) return;

//   // ✅ Only allow movement if user is assigned
//   // const assignedUserIds = task.assigneeId ? [task.assigneeId] : [];
//   const assignedUserIds = task.assigneeIds || [];

//   if (!assignedUserIds.includes(user?.id || "")) {
//     alert("Only the assigned user can move this task.");
//     return;
//   }

//   // Update local state
//   const updated = tasks.map((t) =>
//     t.id === draggableId ? { ...t, status: destination.droppableId } : t
//   );
//   setTasks(updated);

//   try {
//     await fetch(`/api/tasks/${draggableId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: destination.droppableId }),
//     });
//     fetchTasks();
//   } catch (error) {
//     console.error("Failed to update task status:", error);
//   }
// };


//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                           ) : (
//                             <TaskDetailsCard task={task} />
//                           )}

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           {/* <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="text-sm text-red-600 ml-4"
//                             aria-label={`Delete task ${task.title}`}
//                           >
//                             🗑️ Delete
//                           </button> */}
//                           {userRole === "master" && (
//   <button
//     onClick={() => handleDeleteTask(task.id)}
//     className="text-sm text-red-600 ml-4"
//     aria-label={`Delete task ${task.title}`}
//   >
//     🗑️ Delete
//   </button>
// )}

//                         </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }











































// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const [hasNewTask, setHasNewTask] = useState(false);
//   const previousTaskCountRef = useRef<number>(0);




//  const seenTaskIdsRef = useRef<Set<string>>(
//   typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//     ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//     : new Set()
// );


//   // const fetchTasks = useCallback(async () => {

// const fetchTasks = useCallback(async () => {
//   if (!user) return;

//   const role = user.publicMetadata?.role || user.privateMetadata?.role || "";
//   const userId = user.id;
//   setUserRole(role);

//   try {
//     const res = await fetch("/api/tasks");
//     const json = await res.json();
//     const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//     const visibleTasks =
//       role === "master"
//         ? taskArray
//         : taskArray.filter((task: Task) =>
//             task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//           );

//     const seenTaskIds = seenTaskIdsRef.current;
//     const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//     // ✅ Only show alert if truly new tasks are found
//     if (newTasks.length > 0) {
//       try {
//         if (audioRef.current) {
//           audioRef.current.volume = 1;
//           await audioRef.current.play();
//         }
//         toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//         if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//           if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.currentTime = 0;
//           }
//         }
//       } catch (err) {
//         console.warn("🔇 Audio autoplay blocked", err);
//       }
//     }

//     // ✅ Save task count and seen task IDs
//     previousTaskCountRef.current = visibleTasks.length;
//     visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//     localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//     setTasks(visibleTasks);
//   } catch (err) {
//     console.error("❌ Error fetching tasks:", err);
//   }
// }, [user]);
  


//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);



//   useEffect(() => {
//   if (!user?.id) return;

//   const interval = setInterval(() => {
//     fetchTasks(); // 🔁 Poll every 10 seconds
//   }, 10000);

//   return () => clearInterval(interval); // cleanup on unmount
// }, [user?.id, fetchTasks]);


  



//   const onDragEnd = async (result: DropResult) => {
//   const { destination, source, draggableId } = result;
//   if (!destination || destination.droppableId === source.droppableId) return;

//   // Find the task being moved
//   const task = tasks.find((t) => t.id === draggableId);
//   if (!task) return;

//   // ✅ Only allow movement if user is assigned
//   // const assignedUserIds = task.assigneeId ? [task.assigneeId] : [];
//   const assignedUserIds = task.assigneeIds || [];

//   if (!assignedUserIds.includes(user?.id || "")) {
//     alert("Only the assigned user can move this task.");
//     return;
//   }

//   // Update local state
//   const updated = tasks.map((t) =>
//     t.id === draggableId ? { ...t, status: destination.droppableId } : t
//   );
//   setTasks(updated);

//   try {
//     await fetch(`/api/tasks/${draggableId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: destination.droppableId }),
//     });
//     fetchTasks();
//   } catch (error) {
//     console.error("Failed to update task status:", error);
//   }
// };


//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//        <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                           ) : (
//                             <TaskDetailsCard task={task} />
//                           )}

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           {/* <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="text-sm text-red-600 ml-4"
//                             aria-label={`Delete task ${task.title}`}
//                           >
//                             🗑️ Delete
//                           </button> */}
//                           {userRole === "master" && (
//   <button
//     onClick={() => handleDeleteTask(task.id)}
//     className="text-sm text-red-600 ml-4"
//     aria-label={`Delete task ${task.title}`}
//   >
//     🗑️ Delete
//   </button>
// )}

//                         </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }























































// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const [hasNewTask, setHasNewTask] = useState(false);
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);





//  const seenTaskIdsRef = useRef<Set<string>>(
//   typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//     ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//     : new Set()
// );


//   // const fetchTasks = useCallback(async () => {

// const fetchTasks = useCallback(async () => {
//   if (!user) return;

//   setLoading(true); // 🔄 Show loading state

//   const role = user.publicMetadata?.role || user.privateMetadata?.role || "";
//   const userId = user.id;
//   setUserRole(role);

//   try {
//     const res = await fetch("/api/tasks");
//     const json = await res.json();
//     const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//     const visibleTasks =
//       role === "master"
//         ? taskArray
//         : taskArray.filter((task: Task) =>
//             task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//           );

//     const seenTaskIds = seenTaskIdsRef.current;
//     const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//     if (newTasks.length > 0) {
//       try {
//         if (audioRef.current) {
//           audioRef.current.volume = 1;
//           await audioRef.current.play();
//         }
//         toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//         if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//           if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.currentTime = 0;
//           }
//         }
//       } catch (err) {
//         console.warn("🔇 Audio autoplay blocked", err);
//       }
//     }

//     // ✅ Update seen list & task state
//     previousTaskCountRef.current = visibleTasks.length;
//     visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//     localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//     setTasks(visibleTasks);
//   } catch (err) {
//     console.error("❌ Error fetching tasks:", err);
//   } finally {
//     setLoading(false); // ✅ Stop loading
//   }
// }, [user]);



//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);



//   useEffect(() => {
//   if (!user?.id) return;

//   const interval = setInterval(() => {
//     fetchTasks(); // 🔁 Poll every 10 seconds
//   }, 10000);

//   return () => clearInterval(interval); // cleanup on unmount
// }, [user?.id, fetchTasks]);


  



//   const onDragEnd = async (result: DropResult) => {
//   const { destination, source, draggableId } = result;
//   if (!destination || destination.droppableId === source.droppableId) return;

//   // Find the task being moved
//   const task = tasks.find((t) => t.id === draggableId);
//   if (!task) return;

//   // ✅ Only allow movement if user is assigned
//   // const assignedUserIds = task.assigneeId ? [task.assigneeId] : [];
//   const assignedUserIds = task.assigneeIds || [];

//   if (!assignedUserIds.includes(user?.id || "")) {
//     alert("Only the assigned user can move this task.");
//     return;
//   }

//   // Update local state
//   const updated = tasks.map((t) =>
//     t.id === draggableId ? { ...t, status: destination.droppableId } : t
//   );
//   setTasks(updated);

//   try {
//     await fetch(`/api/tasks/${draggableId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: destination.droppableId }),
//     });
//     fetchTasks();
//   } catch (error) {
//     console.error("Failed to update task status:", error);
//   }
// };


//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//        <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>
//  {/* <DragDropContext onDragEnd={onDragEnd}> */}
 
//      {/* {loading ? (
//   <div className="text-center text-purple-600 font-medium py-10">
//     🔄 Loading tasks...
//   </div>
// ) : ( */}
//   <DragDropContext onDragEnd={onDragEnd}>





//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                           ) : (
//                             <TaskDetailsCard task={task} />
//                           )}

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           {/* <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="text-sm text-red-600 ml-4"
//                             aria-label={`Delete task ${task.title}`}
//                           >
//                             🗑️ Delete
//                           </button> */}
//                           {userRole === "master" && (
//   <button
//     onClick={() => handleDeleteTask(task.id)}
//     className="text-sm text-red-600 ml-4"
//     aria-label={`Delete task ${task.title}`}
//   >
//     🗑️ Delete
//   </button>
// )}

//          </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
  
//     </div>
//   );
// }


















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   assigneeIds?: string[]; // Add this to match your filter logic
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const [hasNewTask, setHasNewTask] = useState(false);
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   // ✅ New state for hidden cards
//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());

//   // ✅ Function to toggle card visibility
//   const toggleCardVisibility = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       return updated;
//     });
//   };

//   // ✅ Function to show all cards
//   const showAllCards = () => {
//     setHiddenCardIds(new Set());
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true); // 🔄 Show loading state

//     const role = user.publicMetadata?.role || user.privateMetadata?.role || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: Task) =>
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       // ✅ Update seen list & task state
//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false); // ✅ Stop loading
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks(); // 🔁 Poll every 10 seconds
//     }, 10000);

//     return () => clearInterval(interval); // cleanup on unmount
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     // Find the task being moved
//     const task = tasks.find((t) => t.id === draggableId);
//     if (!task) return;

//     // ✅ Only allow movement if user is assigned
//     const assignedUserIds = task.assigneeIds || [];

//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") { // Allow masters to move
//       alert("Only the assigned user or a master can move this task.");
//       return;
//     }

//     // Update local state
//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id, task.title, task.description, task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority, task.assigner?.name, task.assigner?.email,
//         task.assignee?.name, task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields ? Object.entries(task.customFields).map(([k, v]) => `${k}: ${v}`).join("; ") : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         {/* ✅ Show All button */}
//         <button
//           onClick={showAllCards}
//           className="px-3 py-1 text-sm rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
//         >
//           👁️ Show All
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {sortedFilteredTasks.filter((task) => task.status === col.id).map((task, index) => (
//                     <Draggable draggableId={task.id} index={index} key={task.id}>
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                         >
//                           {viewMode === "edit" ? (
//                             <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                           ) : (
//                             // ✅ Pass isHidden prop
//                             <TaskDetailsCard
//                               task={task}
//                               isHidden={hiddenCardIds.has(task.id)}
//                             />
//                           )}

//                           {/* ✅ Toggle button */}
//                           <button
//                             onClick={() => toggleCardVisibility(task.id)}
//                             className="text-sm text-gray-500 hover:text-gray-700 mt-2"
//                           >
//                             {hiddenCardIds.has(task.id) ? "👁️ Show Details" : "🙈 Hide Details"}
//                           </button>

//                           <button
//                             onClick={() => setEditingTask(task)}
//                             className="text-sm text-blue-600 mt-2 ml-4"
//                             aria-label={`Edit task ${task.title}`}
//                           >
//                             ✏️ Edit
//                           </button>
//                           {userRole === "master" && (
//                             <button
//                               onClick={() => handleDeleteTask(task.id)}
//                               className="text-sm text-red-600 ml-4 mt-2"
//                               aria-label={`Delete task ${task.title}`}
//                             >
//                               🗑️ Delete
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }





















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   assigneeIds?: string[]; // Add this to match your filter logic
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   // State for hidden cards, initialized as an empty Set (all cards shown by default)
//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());

//   // Function to toggle card visibility
//   const toggleCardVisibility = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       return updated;
//     });
//   };

//   // Function to show all cards (clears the hiddenCardIds set)
//   const showAllCards = () => {
//     setHiddenCardIds(new Set());
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true); // 🔄 Show loading state

//     const role = user.publicMetadata?.role || user.privateMetadata?.role || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: Task) =>
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       // ✅ Update seen list & task state
//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false); // ✅ Stop loading
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks(); // 🔁 Poll every 10 seconds
//     }, 10000);

//     return () => clearInterval(interval); // cleanup on unmount
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     // Find the task being moved
//     const task = tasks.find((t) => t.id === draggableId);
//     if (!task) return;

//     // Only allow movement if user is assigned or is a master
//     const assignedUserIds = task.assigneeIds || [];
//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") {
//       alert("Only the assigned user or a master can move this task.");
//       return;
//     }

//     // Update local state
//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         // FIX: Corrected ternary operator syntax and added type check
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         {/* Show All button */}
//         <button
//           onClick={showAllCards}
//           className="px-3 py-1 text-sm rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
//         >
//           👁️ Show All Tasks
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {/* Filter out hidden tasks here */}
//                   {sortedFilteredTasks
//                     .filter((task) => task.status === col.id)
//                     .map((task, index) => {
//                       const isCardHidden = hiddenCardIds.has(task.id);
//                       return (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               // Apply hidden style based on isCardHidden
//                               className={`bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500 ${isCardHidden ? 'h-24 overflow-hidden' : ''}`}
//                               style={{
//                                 ...provided.draggableProps.style,
//                                 // Ensure the draggable is not hidden by setting display block if hidden
//                                 display: 'block',
//                               }}
//                             >
//                               {/* Conditionally render TaskDetailsCard/TaskEditableCard or a message */}
//                               {isCardHidden ? (
//                                 <div className="text-sm text-gray-500 italic flex items-center justify-between h-full">
//                                   <span>Details are hidden for this task.</span>
//                                   {/* Toggle button to show details */}
//                                   <button
//                                     onClick={() => toggleCardVisibility(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Show Details
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <>
//                                   {viewMode === "edit" ? (
//                                     <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                                   ) : (
//                                     <TaskDetailsCard task={task} />
//                                   )}
//                                   {/* Toggle button to hide details */}
//                                   <button
//                                     onClick={() => toggleCardVisibility(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700 mt-2"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                   <button
//                                     onClick={() => setEditingTask(task)}
//                                     className="text-sm text-blue-600 mt-2 ml-4"
//                                     aria-label={`Edit task ${task.title}`}
//                                   >
//                                     ✏️ Edit
//                                   </button>
//                                   {userRole === "master" && (
//                                     <button
//                                       onClick={() => handleDeleteTask(task.id)}
//                                       className="text-sm text-red-600 ml-4 mt-2"
//                                       aria-label={`Delete task ${task.title}`}
//                                     >
//                                       🗑️ Delete
//                                     </button>
//                                   )}
//                                 </>
//                               )}
//                             </div>
//                           )}
//                         </Draggable>
//                       );
//                     })}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }






















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   assigneeIds?: string[]; // Add this to match your filter logic
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   // 🔁 Update your hiddenCardIds logic with localStorage support:
//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     const stored = typeof window !== "undefined" ? localStorage.getItem("hiddenCardIds") : null;
//     return stored ? new Set(JSON.parse(stored)) : new Set();
//   });

//   // ✅ Function to toggle visibility and update localStorage:
//   const toggleCardVisibility = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   // ✅ Function to show all cards (reset hidden list):
//   const showAllCards = () => {
//     localStorage.removeItem("hiddenCardIds");
//     setHiddenCardIds(new Set());
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true); // 🔄 Show loading state

//     const role = user.publicMetadata?.role || user.privateMetadata?.role || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: Task) =>
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       // ✅ Update seen list & task state
//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false); // ✅ Stop loading
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks(); // 🔁 Poll every 10 seconds
//     }, 10000);

//     return () => clearInterval(interval); // cleanup on unmount
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     // Find the task being moved
//     const task = tasks.find((t) => t.id === draggableId);
//     if (!task) return;

//     // Only allow movement if user is assigned or is a master
//     const assignedUserIds = task.assigneeIds || [];
//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") {
//       alert("Only the assigned user or a master can move this task.");
//       return;
//     }

//     // Update local state
//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         {/* Show All button */}
//         <button
//           onClick={showAllCards}
//           className="px-3 py-1 text-sm rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
//         >
//           👁️ Show All Tasks
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {/* ✅ Task Board Rendering Logic: Filter out hidden tasks here */}
//                   {sortedFilteredTasks
//                     .filter((task) => task.status === col.id && !hiddenCardIds.has(task.id))
//                     .map((task, index) => (
//                       <Draggable draggableId={task.id} index={index} key={task.id}>
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                           >
//                             {viewMode === "edit" ? (
//                               <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                             ) : (
//                               <TaskDetailsCard task={task} />
//                             )}

//                             {/* ✅ Update Hide Button (only shown when visible) */}
//                             <button
//                               onClick={() => toggleCardVisibility(task.id)}
//                               className="text-sm text-gray-500 hover:text-gray-700 mt-2"
//                             >
//                               🙈 Hide This Task
//                             </button>
//                             <button
//                               onClick={() => setEditingTask(task)}
//                               className="text-sm text-blue-600 mt-2 ml-4"
//                               aria-label={`Edit task ${task.title}`}
//                             >
//                               ✏️ Edit
//                             </button>
//                             {userRole === "master" && (
//                               <button
//                                 onClick={() => handleDeleteTask(task.id)}
//                                 className="text-sm text-red-600 ml-4 mt-2"
//                                 aria-label={`Delete task ${task.title}`}
//                               >
//                                 🗑️ Delete
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }





// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task } from "../../types/task"; // use the correct relative path

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // ✅ Updated Task type
// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   dueDate?: string;
//   priority?: string;
//   assigner?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assignee?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   assigneeId?: string;
//   assigneeIds?: string[]; // Add this to match your filter logic
//   createdByClerkId?: string;
//   updatedAt?: string;
//   createdAt?: string;
//   tags?: string[];
//   subtasks?: { title: string }[];
//   customFields?: Record<string, unknown>;
//   attachments?: string[];
// };

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   // hiddenCardIds State with localStorage:
//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   // Add showAllTasksMode flag:
//   const [showAllTasksMode, setShowAllTasksMode] = useState(false); // Default: show only visible

//   // Toggle Handlers:
//   const handleHideTask = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       updated.add(taskId);
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   // Reusing handleHideTask for "unhide" action by toggling its presence in the set
//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };


//   const handleShowAllTasks = () => {
//     // When "Show All" is clicked, we *temporarily* clear the hidden state for display
//     // but the actual hidden IDs remain in localStorage if not explicitly unhidden.
//     // The filter logic below will handle showing them all.
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     // When "Show" is clicked, switch back to filtering based on hiddenCardIds.
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true); // 🔄 Show loading state

//     const role = user.publicMetadata?.role || user.privateMetadata?.role || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: Task) =>
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       // ✅ Update seen list & task state
//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false); // ✅ Stop loading
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks(); // 🔁 Poll every 10 seconds
//     }, 10000);

//     return () => clearInterval(interval); // cleanup on unmount
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     // Find the task being moved
//     const task = tasks.find((t) => t.id === draggableId);
//     if (!task) return;

//     // Only allow movement if user is assigned or is a master
//     const assignedUserIds = task.assigneeIds || [];
//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") {
//       alert("Only the assigned user or a master can move this task.");
//       return;
//     }

//     // Update local state
//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: Task) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         {/* Update Header Buttons: Show & Show All Toggle */}
//         <div className="flex gap-2">
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               !showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show
//           </button>
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show All
//           </button>
//         </div>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="flex flex-col md:flex-row gap-4">
//           {columns.map((col) => (
//             <Droppable droppableId={col.id} key={col.id}>
//               {(provided) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                 >
//                   <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                   {/* Update Task Filtering */}
//                   {sortedFilteredTasks
//                     .filter((task) => task.status === col.id)
//                     .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                     .map((task, index) => (
//                       <Draggable draggableId={task.id} index={index} key={task.id}>
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                             style={provided.draggableProps.style}
//                           >
//                             {viewMode === "edit" ? (
//                               <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                             ) : (
//                               <TaskDetailsCard task={task} />
//                             )}

//                             <div className="flex gap-2 mt-2">
//                               {/* Show Hide/Unhide button based on mode and task status */}
//                               {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                 <button
//                                   onClick={() => handleToggleHideUnhide(task.id)}
//                                   className="text-sm text-blue-600 hover:text-blue-700"
//                                 >
//                                   👁️ Unhide This Task
//                                 </button>
//                               ) : (
//                                 <button
//                                   onClick={() => handleToggleHideUnhide(task.id)}
//                                   className="text-sm text-gray-500 hover:text-gray-700"
//                                 >
//                                   🙈 Hide This Task
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => setEditingTask(task)}
//                                 className="text-sm text-blue-600"
//                               >
//                                 ✏️ Edit
//                               </button>
//                               {userRole === "master" && (
//                                 <button
//                                   onClick={() => handleDeleteTask(task.id)}
//                                   className="text-sm text-red-600"
//                                 >
//                                   🗑️ Delete
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}

//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </div>
//       </DragDropContext>

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }



















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task";

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<TaskType[]>([]);
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false);

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true);

//     // ✅ FIX: Removed access to user.privateMetadata as it's not available on UserResource
//     const role = user.publicMetadata?.role || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: TaskType) =>
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks();
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     const assignedUserIds = task.assigneeIds || [];
//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") {
//       alert("Only the assigned user or a master can move this task.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: TaskType) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <div className="flex gap-2">
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               !showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show
//           </button>
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show All
//           </button>
//         </div>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                     {sortedFilteredTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                               style={provided.draggableProps.style}
//                             >
//                               {viewMode === "edit" ? (
//                                 <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                               ) : (
//                                 <TaskDetailsCard task={task} />
//                               )}

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }




















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task";

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<TaskType[]>([]);
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null);
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false);

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true);

//     // ✅ FIX: Explicitly cast user.publicMetadata.role to string
//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: TaskType) =>
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks();
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     const assignedUserIds = task.assigneeIds || [];
//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") {
//       alert("Only the assigned user or a master can move this task.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: TaskType) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export.");

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <div className="flex gap-2">
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               !showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show
//           </button>
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show All
//           </button>
//         </div>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                     {sortedFilteredTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                               style={provided.draggableProps.style}
//                             >
//                               {viewMode === "edit" ? (
//                                 <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                               ) : (
//                                 <TaskDetailsCard task={task} />
//                               )}

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }





































// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task"; // Correctly importing TaskType

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // The local 'Task' type definition is no longer needed as we are importing TaskType
// // from "../../types/task".

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<TaskType[]>([]); // Using TaskType
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null); // Using TaskType
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false);

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true);

//     // FIX: Removed access to user.privateMetadata as it's not available on UserResource
//     // Also, explicitly cast publicMetadata.role to string to avoid type inference issues.
//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: TaskType) => // Using TaskType
//               task.assigneeIds?.includes(userId) || task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           // Replaced window.confirm with a custom message box or similar if needed for non-blocking UI
//           // For now, keeping confirm as per original code, but be aware of blocking UI.
//           if (confirm("🆕 New task(s) added! Click OK to stop the sound.")) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks();
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId); // Using TaskType
//     if (!task) return;

//     const assignedUserIds = task.assigneeIds || [];
//     if (!assignedUserIds.includes(user?.id || "") && userRole !== "master") {
//       alert("Only the assigned user or a master can move this task."); // Replaced window.alert
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: TaskType) => { // Using TaskType
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) return alert("No tasks to export."); // Replaced window.alert

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments"
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; ")
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <div className="flex gap-2">
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               !showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show
//           </button>
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show All
//           </button>
//         </div>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                     {sortedFilteredTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                               style={provided.draggableProps.style}
//                             >
//                               {viewMode === "edit" ? (
//                                 <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                               ) : (
//                                 <TaskDetailsCard task={task} />
//                               )}

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }



















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task"; // Correctly importing TaskType//src

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast"; // Ensure react-hot-toast is installed and configured

// import { FaSearch, FaSortAmountDownAlt, FaFileExcel, FaEye, FaEdit } from "react-icons/fa";

// // The local 'Task' type definition is no longer needed as we are importing TaskType
// // from "../../types/task".

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<TaskType[]>([]); // Using TaskType
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null); // Using TaskType
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false);

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) return;

//     setLoading(true);

//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter((task: TaskType) =>
//               // ✅ Corrected type access for assigneeIds and assigneeId for robustness
//               (task.assigneeIds && task.assigneeIds.includes(userId)) ||
//               task.assigneeId === userId || // Fallback for single assigneeId
//               task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (window.confirm("🆕 New task(s) added! Click OK to stop the sound.")) { // Using window.confirm directly
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//       toast.error("Failed to fetch tasks."); // Added toast for fetching errors
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.id) fetchTasks();
//   }, [user?.id, fetchTasks]);

//   useEffect(() => {
//     if (!user?.id) return;

//     const interval = setInterval(() => {
//       fetchTasks();
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [user?.id, fetchTasks]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     // ✅ Corrected logic for checking permissions to move task
//     const canMoveTask =
//       userRole === "master" ||
//       (task.assigneeIds && task.assigneeIds.includes(user?.id || "")) ||
//       task.assigneeId === user?.id; // Check single assigneeId as well

//     if (!canMoveTask) {
//       toast.error("Only the assigned user or a master can move this task.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated);

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       toast.success("Task status updated!"); // User feedback
//       fetchTasks(); // Re-fetch to ensure data consistency
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//       toast.error("Failed to update task status."); // User feedback
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     if (!window.confirm("Are you sure you want to delete this task?")) {
//       return;
//     }
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       toast.success("Task deleted successfully!"); // User feedback
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//       toast.error("Failed to delete task."); // User feedback
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: TaskType) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       toast.success("Task updated successfully!"); // User feedback
//       fetchTasks();
//     } catch (err) {
//       console.error("Failed to update task", err);
//       toast.error("Failed to update task."); // User feedback
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) {
//       toast.error("No tasks to export.");
//       return;
//     }

//     const headers = [
//       "ID", "Title", "Description", "Status", "Due Date", "Priority",
//       "Assigner Name", "Assigner Email", "Assignee Name", "Assignee Email",
//       "Created At", "Updated At", "Tags", "Subtasks", "Custom Fields", "Attachments",
//       "Assignee IDs" // ✅ Added Assignee IDs to export
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; "),
//         task.assigneeIds?.join(", ") // ✅ Include assigneeIds
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//     toast.success("Tasks exported to CSV!"); // User feedback
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (<><FaEdit className="inline mr-1" /> Edit Mode</>) : (<><FaEye className="inline mr-1" /> View Mode</>)}
//         </button>

//         <div className="flex gap-2">
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               !showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show My Tasks
//           </button>
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show All Tasks
//           </button>
//         </div>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2 className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}>{col.title}</h2>

//                     {sortedFilteredTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                               style={provided.draggableProps.style}
//                             >
//                               {viewMode === "edit" ? (
//                                 <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                               ) : (
//                                 <TaskDetailsCard task={task} />
//                               )}

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }












// // components/Board.tsx
// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task"; // Correctly importing TaskType//src

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast"; // Ensure react-hot-toast is installed and configured

// import {
//   FaSearch,
//   FaSortAmountDownAlt,
//   FaFileExcel,
//   FaEye,
//   FaEdit,
// } from "react-icons/fa";

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done",
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const [tasks, setTasks] = useState<TaskType[]>([]); // Using TaskType
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null); // Using TaskType
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("dueDate");
//   const [viewMode, setViewMode] = useState<"view" | "edit">("view");
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [autoRefresh, setAutoRefresh] = useState(true); // New state for auto-refresh

//   // Ref to track if the initial fetch has occurred
//   const hasFetchedInitially = useRef(false);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false);

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   // Use useCallback only if fetchTasks is passed as a prop to a child component
//   // which is not the case here, but if you do, it ensures memoization.
//   const fetchTasks = useCallback(async () => {
//     if (!user) {
//       setLoading(false); // Ensure loading is false if no user
//       return;
//     }

//     setLoading(true);

//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       const visibleTasks =
//         role === "master"
//           ? taskArray
//           : taskArray.filter(
//               (task: TaskType) =>
//                 (task.assigneeIds && task.assigneeIds.includes(userId)) ||
//                 task.assigneeId === userId ||
//                 task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = visibleTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//           if (
//             window.confirm("🆕 New task(s) added! Click OK to stop the sound.")
//           ) {
//             if (audioRef.current) {
//               audioRef.current.pause();
//               audioRef.current.currentTime = 0;
//             }
//           }
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = visibleTasks.length;
//       visibleTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(visibleTasks);
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//       toast.error("Failed to fetch tasks.");
//     } finally {
//       setLoading(false);
//     }
//   }, [user]); // Only re-create fetchTasks if user object changes

//   // Combined useEffect for initial fetch and periodic refresh
//   useEffect(() => {
//     if (!user?.id) {
//       // If user is not loaded or not logged in, ensure we don't proceed
//       setTasks([]); // Clear tasks
//       setLoading(false); // Stop loading state
//       return;
//     }

//     // Initial fetch when the component mounts or user ID becomes available
//     if (user?.id && !hasFetchedInitially.current) {
//       fetchTasks();
//       hasFetchedInitially.current = true;
//     }

//     let intervalId: NodeJS.Timeout;

//     if (autoRefresh) {
//       intervalId = setInterval(() => {
//         fetchTasks();
//       }, 10000); // Fetch every 10 seconds
//     }

//     // Cleanup function to clear the interval when the component unmounts
//     // or when dependencies (user.id, autoRefresh) change.
//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [user?.id, fetchTasks, autoRefresh]); // Dependencies for this effect

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     const canMoveTask =
//       userRole === "master" ||
//       (task.assigneeIds && task.assigneeIds.includes(user?.id || "")) ||
//       task.assigneeId === user?.id;

//     if (!canMoveTask) {
//       toast.error("Only the assigned user or a master can move this task.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated); // Optimistic update

//     try {
//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       toast.success("Task status updated!");
//       // No need for an immediate fetchTasks() here, the interval will catch it
//       // or you can manually update the specific task in state if you want a faster UI update.
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//       toast.error("Failed to update task status.");
//       // Revert optimistic update on error
//       setTasks(tasks);
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     if (!window.confirm("Are you sure you want to delete this task?")) {
//       return;
//     }
//     try {
//       await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
//       toast.success("Task deleted successfully!");
//       fetchTasks(); // Re-fetch all tasks after deletion
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//       toast.error("Failed to delete task.");
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: TaskType) => {
//     try {
//       await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedTask),
//       });
//       toast.success("Task updated successfully!");
//       fetchTasks(); // Re-fetch all tasks after an update
//     } catch (err) {
//       console.error("Failed to update task", err);
//       toast.error("Failed to update task.");
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) {
//       toast.error("No tasks to export.");
//       return;
//     }

//     const headers = [
//       "ID",
//       "Title",
//       "Description",
//       "Status",
//       "Due Date",
//       "Priority",
//       "Assigner Name",
//       "Assigner Email",
//       "Assignee Name",
//       "Assignee Email",
//       "Created At",
//       "Updated At",
//       "Tags",
//       "Subtasks",
//       "Custom Fields",
//       "Attachments",
//       "Assignee IDs", // ✅ Added Assignee IDs to export
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         task.title,
//         task.description,
//         task.status,
//         task.dueDate ? new Date(task.dueDate).toLocaleString() : "",
//         task.priority,
//         task.assigner?.name,
//         task.assigner?.email,
//         task.assignee?.name,
//         task.assignee?.email,
//         task.createdAt ? new Date(task.createdAt).toLocaleString() : "",
//         task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join("; ")
//           : "",
//         task.attachments?.join("; "),
//         task.assigneeIds?.join(", "), // ✅ Include assigneeIds
//       ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//     toast.success("Tasks exported to CSV!"); // User feedback
//   };

//   const sortedFilteredTasks = tasks
//     .filter((task) => task.title?.toLowerCase().includes(filterText.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "priority") {
//         const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
//         return (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3);
//       } else {
//         const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//         const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//         return aTime - bTime;
//       }
//     });

//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <FaSearch className="text-purple-600" />
//           <input
//             value={filterText}
//             onChange={(e) => setFilterText(e.target.value)}
//             placeholder="Filter tasks..."
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Filter tasks"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <FaSortAmountDownAlt className="text-purple-600" />
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border border-purple-300 px-2 py-1 rounded-md text-sm"
//             aria-label="Sort tasks"
//           >
//             <option value="dueDate">Sort by Due Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
//           className="px-3 py-1 text-sm rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100"
//         >
//           {viewMode === "view" ? (
//             <>
//               <FaEdit className="inline mr-1" /> Edit Mode
//             </>
//           ) : (
//             <>
//               <FaEye className="inline mr-1" /> View Mode
//             </>
//           )}
//         </button>

//         <div className="flex gap-2">
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               !showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show My Tasks
//           </button>
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-1 text-sm rounded-md border ${
//               showAllTasksMode
//                 ? "bg-purple-600 text-white"
//                 : "text-purple-600 border-purple-600 hover:bg-purple-100"
//             }`}
//           >
//             👁️ Show All Tasks
//           </button>
//         </div>

//         {/* Auto-Refresh Toggle Button */}
//         <button
//           onClick={() => setAutoRefresh(!autoRefresh)}
//           className={`px-3 py-1 text-sm rounded-md border ${
//             autoRefresh
//               ? "bg-red-600 text-white hover:bg-red-700"
//               : "bg-green-600 text-white hover:bg-green-700"
//           }`}
//         >
//           {autoRefresh ? "⏸️ Pause Auto Refresh" : "▶️ Resume Auto Refresh"}
//         </button>

//         <button
//           onClick={exportTasksToCsv}
//           disabled={tasks.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
//             tasks.length === 0
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700"
//           }`}
//           aria-label="Export tasks to CSV"
//         >
//           <FaFileExcel /> Export to Excel
//         </button>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2
//                       className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}
//                     >
//                       {col.title}
//                     </h2>

//                     {sortedFilteredTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 border-purple-500"
//                               style={provided.draggableProps.style}
//                             >
//                               {viewMode === "edit" ? (
//                                 <TaskEditableCard task={task} onUpdate={handleFieldUpdate} />
//                               ) : (
//                                 <TaskDetailsCard task={task} />
//                               )}

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }








// // components/Board.tsx
// "use client";

// import { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useUser, useAuth } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task"; // Ensure this path is correct

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "../components/TaskEditableCard";
// import toast from "react-hot-toast";

// import { FaFileExcel } from "react-icons/fa";
// import { format, isToday, subDays, startOfMonth, startOfYear } from 'date-fns';

// import { BoardFilters } from "../components/BoardFilters"; // Your BoardFilters component

// // --- Helper function to strip emojis ---
// const stripEmojis = (str: string | null | undefined): string => {
//   if (!str) return "";
//   // This regex matches various emoji ranges and variation selectors
//   return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '').trim();
// };
// // --- End Helper function ---

// // Define TASK_CATEGORIES here as well, so Board.tsx can use it for mapping/filtering
// // The `value` here should be the "clean" text we compare against.
// const TASK_CATEGORIES = [
//   { label: "🍽️ Zomato Onboarding", value: "zomato onboarding" },
//   { label: "🍔 Swiggy Onboarding", value: "swiggy onboarding" },
//   { label: "🍽️🍔 Zomato + Swiggy Combo", value: "zomato + swiggy combo" },
//   { label: "🧾 Food License", value: "food license" },
//   { label: "📸 Photo Upload", value: "photo upload" },
//   { label: "📂 Account Handling", value: "account handling" },
//   { label: "🛠️ Other", value: "other" },
// ];

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done", // Keeping 'done' as the ID
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const [tasks, setTasks] = useState<TaskType[]>([]); // All fetched tasks
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null);

//   // --- Filter States (now managed within Board and passed to BoardFilters) ---
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState("createdAt"); // Default sort by creation date
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default sort descending
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
//   const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
//   const [selectedDates, setSelectedDates] = useState<string[]>([]); // This is now an array

//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const hasFetchedInitially = useRef(false);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false); // Controls user-specific vs. all tasks

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);

//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       const json = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       // Filter tasks based on user role and showAllTasksMode
//       const relevantTasks =
//         (showAllTasksMode || role === "master") // Master can see all, or if showAllTasksMode is active
//           ? taskArray
//           : taskArray.filter(
//               (task: TaskType) =>
//                 (task.assigneeIds && task.assigneeIds.includes(userId)) ||
//                 task.assigneeId === userId ||
//                 task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = relevantTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = relevantTasks.length;
//       relevantTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(relevantTasks); // Update the main tasks state
//     } catch (err) {
//       console.error("❌ Error fetching tasks:", err);
//       toast.error("Failed to fetch tasks.");
//     } finally {
//       setLoading(false);
//     }
//   }, [user, showAllTasksMode]); // showAllTasksMode is now a dependency

//   useEffect(() => {
//     if (!user?.id) {
//       setTasks([]);
//       setLoading(false);
//       return;
//     }

//     if (user?.id && !hasFetchedInitially.current) {
//       fetchTasks();
//       hasFetchedInitially.current = true;
//     }

//     let intervalId: NodeJS.Timeout;

//     if (autoRefresh) {
//       intervalId = setInterval(() => {
//         fetchTasks();
//       }, 10000); // Fetch every 10 seconds
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [user?.id, fetchTasks, autoRefresh]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     const currentUserId = user?.id;
//     const isAssignedToCurrentUser =
//       (task.assigneeIds && task.assigneeIds.includes(currentUserId || "")) ||
//       task.assigneeId === currentUserId;

//     if (!isAssignedToCurrentUser && userRole !== "master") { // Master role can move any task
//       toast.error("You can only move tasks assigned to you.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated); // Optimistic update

//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         setTasks(tasks); // Revert optimistic update
//         return;
//       }

//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       toast.success("Task status updated!");
//       fetchTasks(); // Re-fetch to ensure data consistency
//     } catch (error) {
//       console.error("Failed to update task status:", error);
//       toast.error("Failed to update task status.");
//       setTasks(tasks); // Revert optimistic update
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     const confirmed = window.confirm("Are you sure you want to delete this task?");
//     if (!confirmed) {
//       return;
//     }
//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         return;
//       }

//       await fetch(`/api/tasks/${taskId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       toast.success("Task deleted successfully!");
//       fetchTasks();
//       setEditingTask(null);
//     } catch (err) {
//       console.error("Failed to delete task", err);
//       toast.error("Failed to delete task.");
//     }
//   };

//   const handleFieldUpdate = async (updatedTask: TaskType) => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         return;
//       }

//       const res = await fetch(`/api/tasks/${updatedTask.id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updatedTask),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.details || "Failed to update task.");
//       }

//       toast.success("Task updated successfully!");
//       fetchTasks(); // Re-fetch all tasks to update UI
//     } catch (err: any) {
//       console.error("Failed to update task", err);
//       toast.error(`Failed to update task: ${err.message || 'Unknown error'}`);
//     }
//   };

//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) {
//       toast.error("No tasks to export.");
//       return;
//     }

//     const headers = [
//       "ID",
//       "Title",
//       "Description",
//       "Status",
//       "Due Date",
//       "Priority",
//       "Assigner Name",
//       "Assigner Email",
//       "Assignee Names",
//       "Assignee Emails",
//       "Created At",
//       "Updated At",
//       "Tags",
//       "Subtasks",
//       "Custom Fields",
//       "Attachments",
//       "Highlight Color",
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         // --- CSV Export: Strip emojis from title for clean export ---
//         stripEmojis(task.title), // Apply stripEmojis here
//         // --- End CSV Export ---
//         task.description,
//         task.status,
//         task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.priority,
//         task.assignerName,
//         task.assignerEmail,
//         task.assignees?.map(a => a.name).filter(Boolean).join(" | "),
//         task.assignees?.map(a => a.email).filter(Boolean).join(" | "),
//         task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.updatedAt ? format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join(" | ")
//           : "",
//         task.attachments?.join("; "),
//         task.highlightColor || "",
//       ].map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//     toast.success("Tasks exported to CSV!");
//   };

//   // --- Memoized unique options for dropdowns (passed to BoardFilters) ---
//   const uniqueCategoriesForDisplay = useMemo(() => {
//     // We pass the full TASK_CATEGORIES array (label + value) to BoardFilters
//     // so it can display labels and use values for internal selection.
//     return TASK_CATEGORIES;
//   }, []);


//   const uniqueStatuses = useMemo(() => {
//     const statuses = new Set<string>();
//     tasks.forEach(task => {
//       if (task.status) statuses.add(task.status);
//     });
//     return Array.from(statuses).sort();
//   }, [tasks]);

//   const uniqueAssignees = useMemo(() => {
//     const assignees = new Set<string>();
//     tasks.forEach(task => {
//       if (task.assignees && Array.isArray(task.assignees)) {
//         task.assignees.forEach(assignee => {
//           if (assignee && (assignee.name || assignee.email)) {
//             assignees.add(assignee.name || assignee.email || '');
//           }
//         });
//       }
//     });
//     return Array.from(assignees).sort();
//   }, [tasks]);

//   // --- Filtering and Sorting Logic (Memoized) ---
//   const visibleTasks = useMemo(() => {
//     let filtered = [...tasks]; // Start with a copy of all tasks

//     // 1. Text Filtering
//     if (filterText) {
//       const lowerFilterText = filterText.toLowerCase();
//       filtered = filtered.filter(task =>
//         task.title?.toLowerCase().includes(lowerFilterText) ||
//         task.description?.toLowerCase().includes(lowerFilterText) ||
//         task.customFields?.shopName?.toLowerCase().includes(lowerFilterText) ||
//         task.customFields?.email?.toLowerCase().includes(lowerFilterText) ||
//         task.customFields?.phone?.toLowerCase().includes(lowerFilterText) ||
//         task.assignees?.some(a => (a.name || a.email)?.toLowerCase().includes(lowerFilterText)) ||
//         task.status?.toLowerCase().includes(lowerFilterText) ||
//         task.assignerName?.toLowerCase().includes(lowerFilterText) ||
//         task.customFields?.location?.toLowerCase().includes(lowerFilterText) ||
//         task.tags?.some(tag => tag.toLowerCase().includes(lowerFilterText)) ||
//         task.notes?.some(note => note.content?.toLowerCase().includes(lowerFilterText))
//       );
//     }

//     // 2. Category Filtering (THE CRUCIAL FIX HERE)
//     if (selectedCategories.length > 0) {
//       filtered = filtered.filter((t) => {
//         const strippedTaskTitle = stripEmojis(t.title || "").toLowerCase();
//         // Debug log as suggested
//         // console.log("Comparing:", {
//         //   taskTitle: t.title,
//         //   strippedTaskTitle: strippedTaskTitle,
//         //   selectedCategories: selectedCategories,
//         // });
//         return selectedCategories.some(
//           (catValue) => stripEmojis(catValue).toLowerCase() === strippedTaskTitle
//         );
//       });
//     }


//     // 3. Status Filtering
//     if (selectedStatuses.length > 0) {
//       filtered = filtered.filter(task =>
//         task.status && selectedStatuses.includes(task.status)
//       );
//     }

//     // 4. Assignee Filtering
//     if (selectedAssignees.length > 0) {
//       filtered = filtered.filter(task =>
//         task.assignees?.some(assignee =>
//           assignee && (assignee.name || assignee.email) && selectedAssignees.includes(assignee.name || assignee.email)
//         )
//       );
//     }

//     // 5. Date Filtering
//     if (selectedDates.length > 0) {
//       const now = new Date();
//       filtered = filtered.filter(task => {
//         const taskDate = task.createdAt ? new Date(task.createdAt) : null;
//         if (!taskDate) return false;

//         return selectedDates.some(dateFilter => {
//           switch (dateFilter) {
//             case "today":
//               return isToday(taskDate);
//             case "yesterday":
//               const yesterday = subDays(now, 1);
//               return format(taskDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd");
//             case "last_7_days":
//               const sevenDaysAgo = subDays(now, 7);
//               // Ensure taskDate is within the last 7 days including today
//               return taskDate >= sevenDaysAgo && taskDate <= now;
//             case "this_month":
//               const startOfCurrentMonth = startOfMonth(now);
//               return taskDate >= startOfCurrentMonth && taskDate <= now;
//             case "last_month":
//               const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//               const startOfLastMonth = startOfMonth(prevMonth);
//               const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
//               return taskDate >= startOfLastMonth && taskDate <= endOfLastMonth;
//             case "this_year":
//               const startOfCurrentYear = startOfYear(now);
//               return taskDate >= startOfCurrentYear && taskDate <= now;
//             default:
//               return true;
//           }
//         });
//       });
//     }

//     // 6. Sorting
//     filtered.sort((a, b) => {
//       let aValue: any;
//       let bValue: any;

//       switch (sortBy) {
//         case "createdAt":
//           aValue = new Date(a.createdAt || 0).getTime();
//           bValue = new Date(b.createdAt || 0).getTime();
//           break;
//         case "dueDate":
//           aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
//           bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//           break;
//         case "title":
//           aValue = a.title || "";
//           bValue = b.title || "";
//           break;
//         case "status":
//           aValue = a.status || "";
//           bValue = b.status || "";
//           break;
//         case "shopName":
//             aValue = a.customFields?.shopName || "";
//             bValue = b.customFields?.shopName || "";
//             break;
//         case "priority":
//           const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, "": 3, undefined: 3, null: 3 };
//           aValue = priorityOrder[String(a.priority).toLowerCase()] ?? 3;
//           bValue = priorityOrder[String(b.priority).toLowerCase()] ?? 3;
//           break;
//         default:
//           aValue = (a as any)[sortBy] || "";
//           bValue = (b as any)[sortBy] || "";
//       }

//       if (typeof aValue === 'number' && typeof bValue === 'number') {
//         return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
//       }
//       return sortDirection === "asc"
//         ? String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase())
//         : String(bValue).toLowerCase().localeCompare(String(aValue).toLowerCase());
//     });

//     return filtered;
//   }, [
//     tasks,
//     filterText,
//     selectedCategories, // This is now an array of "values" like "zomato onboarding"
//     selectedStatuses,
//     selectedAssignees,
//     selectedDates,
//     sortBy,
//     sortDirection,
//   ]);


//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
//         {/* --- BoardFilters Component --- */}
//         <BoardFilters
//           filterText={filterText}
//           setFilterText={setFilterText}
//           sortBy={sortBy}
//           setSortBy={setSortBy}
//           sortDirection={sortDirection}
//           setSortDirection={setSortDirection}
//           selectedCategories={selectedCategories}
//           setSelectedCategories={setSelectedCategories}
//           // Pass TASK_CATEGORIES directly as a prop to BoardFilters for rendering
//           // It now expects an array of { label, value } objects for categories
//           allCategories={TASK_CATEGORIES}
//           selectedStatuses={selectedStatuses}
//           setSelectedStatuses={setSelectedStatuses}
//           allStatuses={uniqueStatuses}
//           selectedAssignees={selectedAssignees}
//           setSelectedAssignees={setSelectedAssignees}
//           allAssignees={uniqueAssignees}
//           selectedDates={selectedDates}
//           setSelectedDates={setSelectedDates}
//         />
//         {/* --- End BoardFilters Component --- */}

//         <div className="flex items-center gap-2 flex-wrap">
//           {/* "Show My Tasks" button */}
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               !showAllTasksMode
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "text-blue-600 border-blue-600 hover:bg-blue-100"
//             } flex items-center gap-1`}
//           >
//             👁️ Show My Tasks
//           </button>
//           {/* "Show All Tasks" button (available to all users) */}
//           <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               showAllTasksMode
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "text-blue-600 border-blue-600 hover:bg-blue-100"
//             } flex items-center gap-1`}
//           >
//             🌐 Show All Tasks
//           </button>


//           <button
//             onClick={() => setAutoRefresh(!autoRefresh)}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               autoRefresh
//                 ? "bg-red-600 text-white hover:bg-red-700"
//                 : "bg-green-600 text-white hover:bg-green-700"
//             } flex items-center gap-1`}
//           >
//             {autoRefresh ? "⏸️ Pause Auto Refresh" : "▶️ Resume Auto Refresh"}
//           </button>

//           <button
//             onClick={exportTasksToCsv}
//             disabled={tasks.length === 0}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
//               tasks.length === 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//             aria-label="Export tasks to CSV"
//           >
//             <FaFileExcel /> Export to Excel
//           </button>
//         </div>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2
//                       className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}
//                     >
//                       {col.title} ({visibleTasks.filter(t => t.status === col.id && (showAllTasksMode || !hiddenCardIds.has(t.id))).length})
//                     </h2>

//                     {visibleTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className={`bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 ${task.highlightColor ? `border-[${task.highlightColor}]` : 'border-purple-500'}`}
//                               style={{
//                                 ...provided.draggableProps.style,
//                                 borderLeftColor: task.highlightColor || undefined,
//                               }}
//                             >
//                               <TaskDetailsCard task={task} />

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks}
//           onDelete={handleDeleteTask}
//         />
//       )}
//     </div>
//   );
// }















































// "use client";

// import { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useUser, useAuth } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task"; // Ensure this path is correct

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// // import TaskEditableCard from "./TaskEditableCard"; // ✅ Deleted: Line 8398 - Unused import
// import FloatingTaskCard from "../components/FloatingTaskCard"; // Import the FloatingTaskCard
// import toast from "react-hot-toast";

// import { FaFileExcel } from "react-icons/fa";
// import { format, isToday, subDays, startOfMonth, startOfYear } from 'date-fns';

// import { BoardFilters } from "../components/BoardFilters"; // Your BoardFilters component

// // --- Helper function to strip emojis ---
// const stripEmojis = (str: string | null | undefined): string => {
//   if (!str) return "";
//   // This regex matches various emoji ranges and variation selectors
//   return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '').trim();
// };
// // --- End Helper function ---

// // Define TASK_CATEGORIES here as well, so Board.tsx can use it for mapping/filtering
// // The `value` here should be the "clean" text we compare against.
// const TASK_CATEGORIES = [
//   { label: "🍽️ Zomato Onboarding", value: "zomato onboarding" },
//   { label: "🍔 Swiggy Onboarding", value: "swiggy onboarding" },
//   { label: "🍽️🍔 Zomato + Swiggy Combo", value: "zomato + swiggy combo" },
//   { label: "🧾 Food License", value: "food license" },
//   { label: "📸 Photo Upload", value: "photo upload" },
//   { label: "📂 Account Handling", value: "account handling" },
//   { label: "🛠️ Other", value: "other" },
// ];

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done", // Keeping 'done' as the ID
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const [tasks, setTasks] = useState<TaskType[]>([]); // All fetched tasks
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null);
//   // NEW: State to manage the floating task card
//   const [floatingTask, setFloatingTask] = useState<TaskType | null>(null);

//   // --- Filter States (now managed within Board and passed to BoardFilters) ---
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState<keyof TaskType | "shopName">("createdAt"); // More specific type for sortBy
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default sort descending
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
//   const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
//   const [selectedDates, setSelectedDates] = useState<string[]>([]); // This is now an array

//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const hasFetchedInitially = useRef(false);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false); // Controls user-specific vs. all tasks

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);

//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       // FIX (Line 8723 equivalent): Type json response
//       const json: { tasks: TaskType[] } = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       // Filter tasks based on user role and showAllTasksMode
//       const relevantTasks =
//         (showAllTasksMode || role === "master") // Master can see all, or if showAllTasksMode is active
//           ? taskArray
//           : taskArray.filter(
//               (task: TaskType) =>
//                 (task.assigneeIds && task.assigneeIds.includes(userId)) ||
//                 task.assigneeId === userId ||
//                 task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = relevantTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = relevantTasks.length;
//       relevantTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(relevantTasks); // Update the main tasks state
//     } catch (err: unknown) { // FIX: Type caught error as unknown
//       console.error("❌ Error fetching tasks:", err);
//       toast.error("Failed to fetch tasks.");
//     } finally {
//       setLoading(false);
//     }
//   }, [user, showAllTasksMode]); // showAllTasksMode is now a dependency

//   useEffect(() => {
//     if (!user?.id) {
//       setTasks([]);
//       setLoading(false);
//       return;
//     }

//     if (user?.id && !hasFetchedInitially.current) {
//       fetchTasks();
//       hasFetchedInitially.current = true;
//     }

//     let intervalId: NodeJS.Timeout;

//     if (autoRefresh) {
//       intervalId = setInterval(() => {
//         fetchTasks();
//       }, 10000); // Fetch every 10 seconds
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [user?.id, fetchTasks, autoRefresh]);

//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     const currentUserId = user?.id;
//     const isAssignedToCurrentUser =
//       (task.assigneeIds && task.assigneeIds.includes(currentUserId || "")) ||
//       task.assigneeId === currentUserId;

//     if (!isAssignedToCurrentUser && userRole !== "master") { // Master role can move any task
//       toast.error("You can only move tasks assigned to you.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated); // Optimistic update

//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         setTasks(tasks); // Revert optimistic update
//         return;
//       }

//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       toast.success("Task status updated!");
//       fetchTasks(); // Re-fetch to ensure data consistency
//     } catch (error: unknown) { // FIX: Type caught error as unknown
//       console.error("Failed to update task status:", error);
//       toast.error("Failed to update task status.");
//       setTasks(tasks); // Revert optimistic update
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     // Replaced window.confirm with a toast for confirmation
//     toast((t) => (
//       <div className="flex flex-col">
//         <span>Are you sure you want to delete this task?</span>
//         <div className="flex justify-end gap-2 mt-2">
//           <button
//             onClick={async () => {
//               try {
//                 const token = await getToken();
//                 if (!token) {
//                   console.error("Clerk authentication token not available.");
//                   toast.error("Authentication error. Please log in again.");
//                   toast.dismiss(t.id);
//                   return;
//                 }

//                 await fetch(`/api/tasks/${taskId}`, {
//                   method: "DELETE",
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 });
//                 toast.success("Task deleted successfully!");
//                 fetchTasks();
//                 setEditingTask(null);
//                 // If the deleted task was floating, close the floating card
//                 if (floatingTask && floatingTask.id === taskId) {
//                   setFloatingTask(null);
//                 }
//               } catch (err: unknown) { // FIX: Type caught error as unknown
//                 console.error("Failed to delete task", err);
//                 toast.error("Failed to delete task.");
//               } finally {
//                 toast.dismiss(t.id);
//               }
//             }}
//             className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
//           >
//             Delete
//           </button>
//           <button
//             onClick={() => toast.dismiss(t.id)}
//             className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ), { duration: Infinity, style: { background: '#fff', color: '#333' } });
//   };


//   const handleFieldUpdate = async (taskId: string, updatedFields: Partial<TaskType>) => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         return;
//       }

//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updatedFields), // Send only the updated fields
//       });

//       if (!res.ok) {
//         // FIX (Line 8913 equivalent): Type errorData
//         const errorData: { details?: string; error?: string } = await res.json();
//         throw new Error(errorData.details || errorData.error || "Failed to update task.");
//       }

//       toast.success("Task updated successfully!");
//       fetchTasks(); // Re-fetch all tasks to update UI
//       // If the currently floating task was updated, update its state as well
//       if (floatingTask && floatingTask.id === taskId) {
//         setFloatingTask(prev => prev ? { ...prev, ...updatedFields } : null);
//       }
//     } catch (err: unknown) { // FIX (Line 8944 equivalent): Type caught error as unknown
//       console.error("Failed to update task", err);
//       toast.error(`Failed to update task: ${err instanceof Error ? err.message : String(err)}`);
//     }
//   };


//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) {
//       toast.error("No tasks to export.");
//       return;
//     }

//     const headers = [
//       "ID",
//       "Title",
//       "Description",
//       "Status",
//       "Due Date",
//       "Priority",
//       "Assigner Name",
//       "Assigner Email",
//       "Assignee Names",
//       "Assignee Emails",
//       "Created At",
//       "Updated At",
//       "Tags",
//       "Subtasks",
//       "Custom Fields",
//       "Attachments",
//       "Highlight Color",
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         // --- CSV Export: Strip emojis from title for clean export ---
//         stripEmojis(task.title), // Apply stripEmojis here
//         // --- End CSV Export ---
//         task.description,
//         task.status,
//         task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.priority,
//         task.assignerName,
//         task.assignerEmail,
//         task.assignees?.map(a => a.name).filter(Boolean).join(" | "),
//         task.assignees?.map(a => a.email).filter(Boolean).join(" | "),
//         task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.updatedAt ? format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join(" | ")
//           : "",
//         task.attachments?.join("; "),
//         task.highlightColor || "",
//       ].map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//     toast.success("Tasks exported to CSV!");
//   };

//   // ✅ Deleted: Line 8797 equivalent - uniqueCategoriesForDisplay is unused as TASK_CATEGORIES is passed directly
//   // const uniqueCategoriesForDisplay = useMemo(() => {
//   //   return TASK_CATEGORIES;
//   // }, []);


//   const uniqueStatuses = useMemo(() => {
//     const statuses = new Set<string>();
//     tasks.forEach(task => {
//       if (task.status) statuses.add(task.status);
//     });
//     return Array.from(statuses).sort();
//   }, [tasks]);

//   const uniqueAssignees = useMemo(() => {
//     const assignees = new Set<string>();
//     tasks.forEach(task => {
//       if (task.assignees && Array.isArray(task.assignees)) {
//         task.assignees.forEach(assignee => {
//           if (assignee && (assignee.name || assignee.email)) {
//             assignees.add(assignee.name || assignee.email || '');
//           }
//         });
//       }
//     });
//     return Array.from(assignees).sort();
//   }, [tasks]);

//   // --- Filtering and Sorting Logic (Memoized) ---
//   const visibleTasks = useMemo(() => {
//     let filtered = [...tasks]; // Start with a copy of all tasks

//     // 1. Text Filtering
//     if (filterText) {
//       const lowerFilterText = filterText.toLowerCase();
//       filtered = filtered.filter(task =>
//         task.title?.toLowerCase().includes(lowerFilterText) ||
//         task.description?.toLowerCase().includes(lowerFilterText) ||
//         // Check for existence before calling .toLowerCase() on customFields properties
//         (task.customFields?.shopName && (task.customFields.shopName as string).toLowerCase().includes(lowerFilterText)) ||
//         (task.customFields?.email && (task.customFields.email as string).toLowerCase().includes(lowerFilterText)) ||
//         (task.customFields?.phone && (task.customFields.phone as string).toLowerCase().includes(lowerFilterText)) ||
//         task.assignees?.some(a => (a.name || a.email)?.toLowerCase().includes(lowerFilterText)) ||
//         task.status?.toLowerCase().includes(lowerFilterText) ||
//         task.assignerName?.toLowerCase().includes(lowerFilterText) ||
//         (task.customFields?.location && (task.customFields.location as string).toLowerCase().includes(lowerFilterText)) ||
//         task.tags?.some(tag => tag.toLowerCase().includes(lowerFilterText)) ||
//         task.notes?.some(note => note.content?.toLowerCase().includes(lowerFilterText))
//       );
//     }

//     // 2. Category Filtering (THE CRUCIAL FIX HERE)
//     if (selectedCategories.length > 0) {
//       filtered = filtered.filter((t) => {
//         const strippedTaskTitle = stripEmojis(t.title || "").toLowerCase();
//         return selectedCategories.some(
//           (catValue) => stripEmojis(catValue).toLowerCase() === strippedTaskTitle
//         );
//       });
//     }


//     // 3. Status Filtering
//     if (selectedStatuses.length > 0) {
//       filtered = filtered.filter(task =>
//         task.status && selectedStatuses.includes(task.status)
//       );
//     }

//     // 4. Assignee Filtering
//     if (selectedAssignees.length > 0) {
//       filtered = filtered.filter(task =>
//         task.assignees?.some(assignee =>
//           assignee && (assignee.name || assignee.email) && selectedAssignees.includes(assignee.name || assignee.email || '')
//         )
//       );
//     }

//     // 5. Date Filtering
//     if (selectedDates.length > 0) {
//       const now = new Date();
//       filtered = filtered.filter(task => {
//         const taskDate = task.createdAt ? new Date(task.createdAt) : null;
//         if (!taskDate) return false;

//         return selectedDates.some(dateFilter => {
//           switch (dateFilter) {
//             case "today":
//               return isToday(taskDate);
//             case "yesterday":
//               const yesterday = subDays(now, 1);
//               return format(taskDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd");
//             case "last_7_days":
//               const sevenDaysAgo = subDays(now, 7);
//               // Ensure taskDate is within the last 7 days including today
//               return taskDate >= sevenDaysAgo && taskDate <= now;
//             case "this_month":
//               const startOfCurrentMonth = startOfMonth(now);
//               return taskDate >= startOfCurrentMonth && taskDate <= now;
//             case "last_month":
//               const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//               const startOfLastMonth = startOfMonth(prevMonth);
//               const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
//               return taskDate >= startOfLastMonth && taskDate <= endOfLastMonth;
//             case "this_year":
//               const startOfCurrentYear = startOfYear(now);
//               return taskDate >= startOfCurrentYear && taskDate <= now;
//             default:
//               return true;
//           }
//         });
//       });
//     }

//     // 6. Sorting
//     filtered.sort((a, b) => {
//       // FIX (Lines 8913-8944 equivalent): Replace any with proper types
//       let aValue: string | number | Date | undefined | null;
//       let bValue: string | number | Date | undefined | null;

//       switch (sortBy) {
//         case "createdAt":
//           aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
//           bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
//           break;
//         case "dueDate":
//           aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // Tasks with no due date come last
//           bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//           break;
//         case "title":
//           aValue = a.title || "";
//           bValue = b.title || "";
//           break;
//         case "status":
//           aValue = a.status || "";
//           bValue = b.status || "";
//           break;
//         case "shopName":
//             // Access customFields safely and ensure it's a string
//             aValue = (a.customFields && typeof a.customFields === 'object' && a.customFields.shopName)
//                        ? String(a.customFields.shopName) : "";
//             bValue = (b.customFields && typeof b.customFields === 'object' && b.customFields.shopName)
//                        ? String(b.customFields.shopName) : "";
//             break;
//         case "priority":
//           const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, "": 3, undefined: 3, null: 3 };
//           aValue = priorityOrder[String(a.priority).toLowerCase()] ?? 3;
//           bValue = priorityOrder[String(b.priority).toLowerCase()] ?? 3;
//           break;
//         // Handle other fields dynamically if sortBy can be a direct key of TaskType
//         default:
//           // Ensure that sortBy is a key of TaskType or a custom field key that can be directly accessed
//           const safeSortBy = sortBy as keyof TaskType; // Cast to known key
//           aValue = a[safeSortBy] as typeof aValue; // Access property using the key
//           bValue = b[safeSortBy] as typeof bValue;
//       }

//       // Handle number comparison
//       if (typeof aValue === 'number' && typeof bValue === 'number') {
//         return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
//       }
//       // Handle string comparison (case-insensitive)
//       return sortDirection === "asc"
//         ? String(aValue || '').toLowerCase().localeCompare(String(bValue || '').toLowerCase())
//         : String(bValue || '').toLowerCase().localeCompare(String(aValue || '').toLowerCase());
//     });

//     return filtered;
//   }, [
//     tasks,
//     filterText,
//     selectedCategories, // This is now an array of "values" like "zomato onboarding"
//     selectedStatuses,
//     selectedAssignees,
//     selectedDates,
//     sortBy,
//     sortDirection,
//   ]);


//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
//         {/* --- BoardFilters Component --- */}
//         <BoardFilters
//           filterText={filterText}
//           setFilterText={setFilterText}
//           sortBy={sortBy}
//           setSortBy={setSortBy}
//           sortDirection={sortDirection}
//           setSortDirection={setSortDirection}
//           selectedCategories={selectedCategories}
//           setSelectedCategories={setSelectedCategories}
//           // Pass TASK_CATEGORIES directly as a prop to BoardFilters for rendering
//           // It now expects an array of { label, value } objects for categories
//           allCategories={TASK_CATEGORIES}
//           selectedStatuses={selectedStatuses}
//           setSelectedStatuses={setSelectedStatuses}
//           allStatuses={uniqueStatuses}
//           selectedAssignees={selectedAssignees}
//           setSelectedAssignees={setSelectedAssignees}
//           allAssignees={uniqueAssignees}
//           selectedDates={selectedDates}
//           setSelectedDates={setSelectedDates}
//         />
//         {/* --- End BoardFilters Component --- */}

//         <div className="flex items-center gap-2 flex-wrap">
//           {/* "Show My Tasks" button */}
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               !showAllTasksMode
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "text-blue-600 border-blue-600 hover:bg-blue-100"
//             } flex items-center gap-1`}
//           >
//             👁️ Show My Tasks
//           </button>
//           {/* "Show All Tasks" button (available to all users) */}
//           {/* <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               showAllTasksMode
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "text-blue-600 border-blue-600 hover:bg-blue-100"
//             } flex items-center gap-1`}
//           >
//             🌐 Show All Tasks
//           </button> */}


//           <button
//             onClick={() => setAutoRefresh(!autoRefresh)}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               autoRefresh
//                 ? "bg-red-600 text-white hover:bg-red-700"
//                 : "bg-green-600 text-white hover:bg-green-700"
//             } flex items-center gap-1`}
//           >
//             {autoRefresh ? "⏸️ Pause Auto Refresh" : "▶️ Resume Auto Refresh"}
//           </button>

//           <button
//             onClick={exportTasksToCsv}
//             disabled={tasks.length === 0}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
//               tasks.length === 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//             aria-label="Export tasks to CSV"
//           >
//             <FaFileExcel /> Export to Excel
//           </button>
//         </div>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2
//                       className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}
//                     >
//                       {col.title} ({visibleTasks.filter(t => t.status === col.id && (showAllTasksMode || !hiddenCardIds.has(t.id))).length})
//                     </h2>

//                     {visibleTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className={`bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 ${task.highlightColor ? `border-[${task.highlightColor}]` : 'border-purple-500'}`}
//                               style={{
//                                 ...provided.draggableProps.style,
//                                 borderLeftColor: task.highlightColor || undefined,
//                               }}
//                             >
//                               {/* Pass onFloatRequest to TaskDetailsCard */}
//                               <TaskDetailsCard
//                                 task={task}
//                                 isAdmin={userRole === "master"} // Pass isAdmin based on user role
//                                 onDelete={handleDeleteTask}
//                                 onUpdateTask={handleFieldUpdate}
//                                 onFloatRequest={setFloatingTask} // This sets the task to be floated
//                               />

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks} // onSave should trigger a re-fetch of tasks
//           onDelete={handleDeleteTask}
//         />
//       )}

//       {/* NEW: Render FloatingTaskCard conditionally at the Board level */}
//       {floatingTask && (
//         <FloatingTaskCard
//           task={floatingTask}
//           isAdmin={userRole === "master"} // Pass isAdmin prop
//           onDelete={handleDeleteTask} // Pass delete handler
//           onUpdateTask={handleFieldUpdate} // Pass update handler
//           onClose={() => setFloatingTask(null)} // Function to close the floating card
//         />
//       )}
//     </div>
//   );
// }





























// "use client";

// import { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useUser, useAuth } from "@clerk/nextjs";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Task as TaskType } from "../../types/task"; // Ensure this path is correct

// import EditTaskModal from "../components/EditTaskModal";
// import TaskDetailsCard from "../components/TaskDetailsCard";
// // import TaskEditableCard from "./TaskEditableCard"; // ✅ Deleted: Line 8398 - Unused import
// import FloatingTaskCard from "../components/FloatingTaskCard"; // Import the FloatingTaskCard
// import toast from "react-hot-toast";

// import { FaFileExcel } from "react-icons/fa";
// import { format, isToday, subDays, startOfMonth, startOfYear } from 'date-fns';

// import { BoardFilters } from "../components/BoardFilters"; // Your BoardFilters component

// // --- Helper function to strip emojis ---
// const stripEmojis = (str: string | null | undefined): string => {
//   if (!str) return "";
//   // This regex matches various emoji ranges and variation selectors
//   return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '').trim();
// };
// // --- End Helper function ---

// // Define TASK_CATEGORIES here as well, so Board.tsx can use it for mapping/filtering
// // The `value` here should be the "clean" text we compare against.
// const TASK_CATEGORIES = [
//   { label: "🍽️ Zomato Onboarding", value: "zomato onboarding" },
//   { label: "🍔 Swiggy Onboarding", value: "swiggy onboarding" },
//   { label: "🍽️🍔 Zomato + Swiggy Combo", value: "zomato + swiggy combo" },
//   { label: "🧾 Food License", value: "food license" },
//   { label: "📸 Photo Upload", value: "photo upload" },
//   { label: "📂 Account Handling", value: "account handling" },
//   { label: "🛠️ Other", value: "other" },
// ];

// const columns = [
//   {
//     id: "todo",
//     title: "📝 To Do",
//     color: "border-blue-500",
//     bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
//   },
//   {
//     id: "inprogress",
//     title: "⏳ In Progress",
//     color: "border-yellow-600",
//     bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
//   },
//   {
//     id: "done", // Keeping 'done' as the ID
//     title: "✅ Done",
//     color: "border-green-500",
//     bgColor: "bg-gradient-to-br from-green-100 to-green-50",
//   },
// ];

// export default function Board() {
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const [tasks, setTasks] = useState<TaskType[]>([]); // All fetched tasks
//   const [editingTask, setEditingTask] = useState<TaskType | null>(null);
//   // NEW: State to manage the floating task card
//   const [floatingTask, setFloatingTask] = useState<TaskType | null>(null);

//   // --- Filter States (now managed within Board and passed to BoardFilters) ---
//   const [filterText, setFilterText] = useState("");
//   const [sortBy, setSortBy] = useState<keyof TaskType | "shopName">("createdAt"); // More specific type for sortBy
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default sort descending
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
//   const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
//   const [selectedDates, setSelectedDates] = useState<string[]>([]); // This is now an array

//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [userRole, setUserRole] = useState<string>("");
//   const previousTaskCountRef = useRef<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [autoRefresh, setAutoRefresh] = useState(false);


//   const hasFetchedInitially = useRef(false);

//   const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("hiddenCardIds");
//       return saved ? new Set(JSON.parse(saved)) : new Set();
//     }
//     return new Set();
//   });

//   const [showAllTasksMode, setShowAllTasksMode] = useState(false); // Controls user-specific vs. all tasks

//   const handleToggleHideUnhide = (taskId: string) => {
//     setHiddenCardIds((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(taskId)) {
//         updated.delete(taskId);
//       } else {
//         updated.add(taskId);
//       }
//       localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
//       return updated;
//     });
//   };

//   const handleShowAllTasks = () => {
//     setShowAllTasksMode(true);
//   };

//   const handleShowOnlyVisible = () => {
//     setShowAllTasksMode(false);
//   };

//   const seenTaskIdsRef = useRef<Set<string>>(
//     typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
//       ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
//       : new Set()
//   );

//   const fetchTasks = useCallback(async () => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);

//     const role = (user.publicMetadata?.role as string) || "";
//     const userId = user.id;
//     setUserRole(role);

//     try {
//       const res = await fetch("/api/tasks");
//       // FIX (Line 8723 equivalent): Type json response
//       const json: { tasks: TaskType[] } = await res.json();
//       const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

//       // Filter tasks based on user role and showAllTasksMode
//       const relevantTasks =
//         (showAllTasksMode || role === "master") // Master can see all, or if showAllTasksMode is active
//           ? taskArray
//           : taskArray.filter(
//               (task: TaskType) =>
//                 (task.assigneeIds && task.assigneeIds.includes(userId)) ||
//                 task.assigneeId === userId ||
//                 task.createdByClerkId === userId
//             );

//       const seenTaskIds = seenTaskIdsRef.current;
//       const newTasks = relevantTasks.filter((task) => !seenTaskIds.has(task.id));

//       if (newTasks.length > 0) {
//         try {
//           if (audioRef.current) {
//             audioRef.current.volume = 1;
//             await audioRef.current.play();
//           }
//           toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
//         } catch (err) {
//           console.warn("🔇 Audio autoplay blocked", err);
//         }
//       }

//       previousTaskCountRef.current = relevantTasks.length;
//       relevantTasks.forEach((task) => seenTaskIds.add(task.id));
//       localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

//       setTasks(relevantTasks); // Update the main tasks state
//     } catch (err: unknown) { // FIX: Type caught error as unknown
//       console.error("❌ Error fetching tasks:", err);
//       toast.error("Failed to fetch tasks.");
//     } finally {
//       setLoading(false);
//     }
//   }, [user, showAllTasksMode]); // showAllTasksMode is now a dependency

// //   useEffect(() => {
// //     if (!user?.id) {
// //       setTasks([]);
// //       setLoading(false);
// //       return;
// //     }

// //     if (user?.id && !hasFetchedInitially.current) {
// //       fetchTasks();
// //       hasFetchedInitially.current = true;
// //     }

// //    if (autoRefresh) {
// //   fetchTasks(); // Only run once when user enables refresh
// // }

// //   }, [user?.id, fetchTasks, autoRefresh]);
// useEffect(() => {
//   let interval: NodeJS.Timeout | null = null;

//   if (autoRefresh) {
//     interval = setInterval(() => {
//       fetchTasks();
//     }, 30000); // refresh every 30s
//   }

//   return () => {
//     if (interval) clearInterval(interval);
//   };
// }, [autoRefresh, fetchTasks]);


//   const onDragEnd = async (result: DropResult) => {
//     const { destination, source, draggableId } = result;
//     if (!destination || destination.droppableId === source.droppableId) return;

//     const task = tasks.find((t: TaskType) => t.id === draggableId);
//     if (!task) return;

//     const currentUserId = user?.id;
//     const isAssignedToCurrentUser =
//       (task.assigneeIds && task.assigneeIds.includes(currentUserId || "")) ||
//       task.assigneeId === currentUserId;

//     if (!isAssignedToCurrentUser && userRole !== "master") { // Master role can move any task
//       toast.error("You can only move tasks assigned to you.");
//       return;
//     }

//     const updated = tasks.map((t) =>
//       t.id === draggableId ? { ...t, status: destination.droppableId } : t
//     );
//     setTasks(updated); // Optimistic update

//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         setTasks(tasks); // Revert optimistic update
//         return;
//       }

//       await fetch(`/api/tasks/${draggableId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: destination.droppableId }),
//       });
//       toast.success("Task status updated!");
//       fetchTasks(); // Re-fetch to ensure data consistency
//     } catch (error: unknown) { // FIX: Type caught error as unknown
//       console.error("Failed to update task status:", error);
//       toast.error("Failed to update task status.");
//       setTasks(tasks); // Revert optimistic update
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     // Replaced window.confirm with a toast for confirmation
//     toast((t) => (
//       <div className="flex flex-col">
//         <span>Are you sure you want to delete this task?</span>
//         <div className="flex justify-end gap-2 mt-2">
//           <button
//             onClick={async () => {
//               try {
//                 const token = await getToken();
//                 if (!token) {
//                   console.error("Clerk authentication token not available.");
//                   toast.error("Authentication error. Please log in again.");
//                   toast.dismiss(t.id);
//                   return;
//                 }

//                 await fetch(`/api/tasks/${taskId}`, {
//                   method: "DELETE",
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 });
//                 toast.success("Task deleted successfully!");
//                 fetchTasks();
//                 setEditingTask(null);
//                 // If the deleted task was floating, close the floating card
//                 if (floatingTask && floatingTask.id === taskId) {
//                   setFloatingTask(null);
//                 }
//               } catch (err: unknown) { // FIX: Type caught error as unknown
//                 console.error("Failed to delete task", err);
//                 toast.error("Failed to delete task.");
//               } finally {
//                 toast.dismiss(t.id);
//               }
//             }}
//             className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
//           >
//             Delete
//           </button>
//           <button
//             onClick={() => toast.dismiss(t.id)}
//             className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ), { duration: Infinity, style: { background: '#fff', color: '#333' } });
//   };


//   const handleFieldUpdate = async (taskId: string, updatedFields: Partial<TaskType>) => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         console.error("Clerk authentication token not available.");
//         toast.error("Authentication error. Please log in again.");
//         return;
//       }

//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updatedFields), // Send only the updated fields
//       });

//       if (!res.ok) {
//         // FIX (Line 8913 equivalent): Type errorData
//         const errorData: { details?: string; error?: string } = await res.json();
//         throw new Error(errorData.details || errorData.error || "Failed to update task.");
//       }

//       toast.success("Task updated successfully!");
//       fetchTasks(); // Re-fetch all tasks to update UI
//       // If the currently floating task was updated, update its state as well
//       if (floatingTask && floatingTask.id === taskId) {
//         setFloatingTask(prev => prev ? { ...prev, ...updatedFields } : null);
//       }
//     } catch (err: unknown) { // FIX (Line 8944 equivalent): Type caught error as unknown
//       console.error("Failed to update task", err);
//       toast.error(`Failed to update task: ${err instanceof Error ? err.message : String(err)}`);
//     }
//   };


//   const exportTasksToCsv = () => {
//     if (tasks.length === 0) {
//       toast.error("No tasks to export.");
//       return;
//     }

//     const headers = [
//       "ID",
//       "Title",
//       "Description",
//       "Status",
//       "Due Date",
//       "Priority",
//       "Assigner Name",
//       "Assigner Email",
//       "Assignee Names",
//       "Assignee Emails",
//       "Created At",
//       "Updated At",
//       "Tags",
//       "Subtasks",
//       "Custom Fields",
//       "Attachments",
//       "Highlight Color",
//     ];

//     const csvRows = tasks.map((task) =>
//       [
//         task.id,
//         // --- CSV Export: Strip emojis from title for clean export ---
//         stripEmojis(task.title), // Apply stripEmojis here
//         // --- End CSV Export ---
//         task.description,
//         task.status,
//         task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.priority,
//         task.assignerName,
//         task.assignerEmail,
//         task.assignees?.map(a => a.name).filter(Boolean).join(" | "),
//         task.assignees?.map(a => a.email).filter(Boolean).join(" | "),
//         task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.updatedAt ? format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss') : "",
//         task.tags?.join(", "),
//         task.subtasks?.map((sub) => sub.title).join("; "),
//         task.customFields && typeof task.customFields === "object"
//           ? Object.entries(task.customFields)
//               .map(([k, v]) => `${k}: ${v}`)
//               .join(" | ")
//           : "",
//         task.attachments?.join("; "),
//         task.highlightColor || "",
//       ].map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
//     );

//     const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `tasks_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//     toast.success("Tasks exported to CSV!");
//   };

//   // ✅ Deleted: Line 8797 equivalent - uniqueCategoriesForDisplay is unused as TASK_CATEGORIES is passed directly
//   // const uniqueCategoriesForDisplay = useMemo(() => {
//   //   return TASK_CATEGORIES;
//   // }, []);


//   const uniqueStatuses = useMemo(() => {
//     const statuses = new Set<string>();
//     tasks.forEach(task => {
//       if (task.status) statuses.add(task.status);
//     });
//     return Array.from(statuses).sort();
//   }, [tasks]);

//   const uniqueAssignees = useMemo(() => {
//     const assignees = new Set<string>();
//     tasks.forEach(task => {
//       if (task.assignees && Array.isArray(task.assignees)) {
//         task.assignees.forEach(assignee => {
//           if (assignee && (assignee.name || assignee.email)) {
//             assignees.add(assignee.name || assignee.email || '');
//           }
//         });
//       }
//     });
//     return Array.from(assignees).sort();
//   }, [tasks]);

//   // --- Filtering and Sorting Logic (Memoized) ---
//   const visibleTasks = useMemo(() => {
//     let filtered = [...tasks]; // Start with a copy of all tasks

//     // 1. Text Filtering
//     if (filterText) {
//       const lowerFilterText = filterText.toLowerCase();
//       filtered = filtered.filter(task =>
//         task.title?.toLowerCase().includes(lowerFilterText) ||
//         task.description?.toLowerCase().includes(lowerFilterText) ||
//         // Check for existence before calling .toLowerCase() on customFields properties
//         (task.customFields?.shopName && (task.customFields.shopName as string).toLowerCase().includes(lowerFilterText)) ||
//         (task.customFields?.email && (task.customFields.email as string).toLowerCase().includes(lowerFilterText)) ||
//         (task.customFields?.phone && (task.customFields.phone as string).toLowerCase().includes(lowerFilterText)) ||
//         task.assignees?.some(a => (a.name || a.email)?.toLowerCase().includes(lowerFilterText)) ||
//         task.status?.toLowerCase().includes(lowerFilterText) ||
//         task.assignerName?.toLowerCase().includes(lowerFilterText) ||
//         (task.customFields?.location && (task.customFields.location as string).toLowerCase().includes(lowerFilterText)) ||
//         task.tags?.some(tag => tag.toLowerCase().includes(lowerFilterText)) ||
//         task.notes?.some(note => note.content?.toLowerCase().includes(lowerFilterText))
//       );
//     }

//     // 2. Category Filtering (THE CRUCIAL FIX HERE)
//     if (selectedCategories.length > 0) {
//       filtered = filtered.filter((t) => {
//         const strippedTaskTitle = stripEmojis(t.title || "").toLowerCase();
//         return selectedCategories.some(
//           (catValue) => stripEmojis(catValue).toLowerCase() === strippedTaskTitle
//         );
//       });
//     }


//     // 3. Status Filtering
//     if (selectedStatuses.length > 0) {
//       filtered = filtered.filter(task =>
//         task.status && selectedStatuses.includes(task.status)
//       );
//     }

//     // 4. Assignee Filtering
//     if (selectedAssignees.length > 0) {
//       filtered = filtered.filter(task =>
//         task.assignees?.some(assignee =>
//           assignee && (assignee.name || assignee.email) && selectedAssignees.includes(assignee.name || assignee.email || '')
//         )
//       );
//     }

//     // 5. Date Filtering
//     if (selectedDates.length > 0) {
//       const now = new Date();
//       filtered = filtered.filter(task => {
//         const taskDate = task.createdAt ? new Date(task.createdAt) : null;
//         if (!taskDate) return false;

//         return selectedDates.some(dateFilter => {
//           switch (dateFilter) {
//             case "today":
//               return isToday(taskDate);
//             case "yesterday":
//               const yesterday = subDays(now, 1);
//               return format(taskDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd");
//             case "last_7_days":
//               const sevenDaysAgo = subDays(now, 7);
//               // Ensure taskDate is within the last 7 days including today
//               return taskDate >= sevenDaysAgo && taskDate <= now;
//             case "this_month":
//               const startOfCurrentMonth = startOfMonth(now);
//               return taskDate >= startOfCurrentMonth && taskDate <= now;
//             case "last_month":
//               const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//               const startOfLastMonth = startOfMonth(prevMonth);
//               const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
//               return taskDate >= startOfLastMonth && taskDate <= endOfLastMonth;
//             case "this_year":
//               const startOfCurrentYear = startOfYear(now);
//               return taskDate >= startOfCurrentYear && taskDate <= now;
//             default:
//               return true;
//           }
//         });
//       });
//     }

//     // 6. Sorting
//     filtered.sort((a, b) => {
//       // FIX (Lines 8913-8944 equivalent): Replace any with proper types
//       let aValue: string | number | Date | undefined | null;
//       let bValue: string | number | Date | undefined | null;

//       switch (sortBy) {
//         case "createdAt":
//           aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
//           bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
//           break;
//         case "dueDate":
//           aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // Tasks with no due date come last
//           bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
//           break;
//         case "title":
//           aValue = a.title || "";
//           bValue = b.title || "";
//           break;
//         case "status":
//           aValue = a.status || "";
//           bValue = b.status || "";
//           break;
//         case "shopName":
//             // Access customFields safely and ensure it's a string
//             aValue = (a.customFields && typeof a.customFields === 'object' && a.customFields.shopName)
//                        ? String(a.customFields.shopName) : "";
//             bValue = (b.customFields && typeof b.customFields === 'object' && b.customFields.shopName)
//                        ? String(b.customFields.shopName) : "";
//             break;
//         case "priority":
//           const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, "": 3, undefined: 3, null: 3 };
//           aValue = priorityOrder[String(a.priority).toLowerCase()] ?? 3;
//           bValue = priorityOrder[String(b.priority).toLowerCase()] ?? 3;
//           break;
//         // Handle other fields dynamically if sortBy can be a direct key of TaskType
//         default:
//           // Ensure that sortBy is a key of TaskType or a custom field key that can be directly accessed
//           const safeSortBy = sortBy as keyof TaskType; // Cast to known key
//           aValue = a[safeSortBy] as typeof aValue; // Access property using the key
//           bValue = b[safeSortBy] as typeof bValue;
//       }

//       // Handle number comparison
//       if (typeof aValue === 'number' && typeof bValue === 'number') {
//         return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
//       }
//       // Handle string comparison (case-insensitive)
//       return sortDirection === "asc"
//         ? String(aValue || '').toLowerCase().localeCompare(String(bValue || '').toLowerCase())
//         : String(bValue || '').toLowerCase().localeCompare(String(aValue || '').toLowerCase());
//     });

//     return filtered;
//   }, [
//     tasks,
//     filterText,
//     selectedCategories, // This is now an array of "values" like "zomato onboarding"
//     selectedStatuses,
//     selectedAssignees,
//     selectedDates,
//     sortBy,
//     sortDirection,
//   ]);


//   return (
//     <div className="p-4">
//       <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

//       <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
//         {/* --- BoardFilters Component --- */}
//         <BoardFilters
//           filterText={filterText}
//           setFilterText={setFilterText}
//           sortBy={sortBy}
//           setSortBy={setSortBy}
//           sortDirection={sortDirection}
//           setSortDirection={setSortDirection}
//           selectedCategories={selectedCategories}
//           setSelectedCategories={setSelectedCategories}
//           // Pass TASK_CATEGORIES directly as a prop to BoardFilters for rendering
//           // It now expects an array of { label, value } objects for categories
//           allCategories={TASK_CATEGORIES}
//           selectedStatuses={selectedStatuses}
//           setSelectedStatuses={setSelectedStatuses}
//           allStatuses={uniqueStatuses}
//           selectedAssignees={selectedAssignees}
//           setSelectedAssignees={setSelectedAssignees}
//           allAssignees={uniqueAssignees}
//           selectedDates={selectedDates}
//           setSelectedDates={setSelectedDates}
//         />
//         {/* --- End BoardFilters Component --- */}

//         <div className="flex items-center gap-2 flex-wrap">
//           {/* "Show My Tasks" button */}
//           <button
//             onClick={handleShowOnlyVisible}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               !showAllTasksMode
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "text-blue-600 border-blue-600 hover:bg-blue-100"
//             } flex items-center gap-1`}
//           >
//             👁️ Show My Tasks
//           </button>
//           {/* "Show All Tasks" button (available to all users) */}
//           {/* <button
//             onClick={handleShowAllTasks}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               showAllTasksMode
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "text-blue-600 border-blue-600 hover:bg-blue-100"
//             } flex items-center gap-1`}
//           >
//             🌐 Show All Tasks
//           </button> */}


//           <button
//             onClick={() => setAutoRefresh(!autoRefresh)}
//             className={`px-3 py-2 text-sm rounded-lg border ${
//               autoRefresh
//                 ? "bg-red-600 text-white hover:bg-red-700"
//                 : "bg-green-600 text-white hover:bg-green-700"
//             } flex items-center gap-1`}
//           >
//             {autoRefresh ? "⏸️ Pause Auto Refresh" : "▶️ Resume Auto Refresh"}
//           </button>

//           <button
//             onClick={exportTasksToCsv}
//             disabled={tasks.length === 0}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
//               tasks.length === 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//             aria-label="Export tasks to CSV"
//           >
//             <FaFileExcel /> Export to Excel
//           </button>
//         </div>
//       </div>

//       {loading && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           Loading tasks...
//         </div>
//       )}

//       {!loading && tasks.length === 0 && (
//         <div className="text-center text-lg text-gray-500 my-8">
//           No tasks to display.
//         </div>
//       )}

//       {!loading && tasks.length > 0 && (
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex flex-col md:flex-row gap-4">
//             {columns.map((col) => (
//               <Droppable droppableId={col.id} key={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
//                   >
//                     <h2
//                       className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}
//                     >
//                       {col.title} ({visibleTasks.filter(t => t.status === col.id && (showAllTasksMode || !hiddenCardIds.has(t.id))).length})
//                     </h2>

//                     {visibleTasks
//                       .filter((task) => task.status === col.id)
//                       .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
//                       .map((task, index) => (
//                         <Draggable draggableId={task.id} index={index} key={task.id}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className={`bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 ${task.highlightColor ? `border-[${task.highlightColor}]` : 'border-purple-500'}`}
//                               style={{
//                                 ...provided.draggableProps.style,
//                                 borderLeftColor: task.highlightColor || undefined,
//                               }}
//                             >
//                               {/* Pass onFloatRequest to TaskDetailsCard */}
//                               <TaskDetailsCard
//                                 task={task}
//                                 isAdmin={userRole === "master"} // Pass isAdmin based on user role
//                                 onDelete={handleDeleteTask}
//                                 onUpdateTask={handleFieldUpdate}
//                                 onFloatRequest={setFloatingTask} // This sets the task to be floated
//                               />

//                               <div className="flex gap-2 mt-2">
//                                 {showAllTasksMode && hiddenCardIds.has(task.id) ? (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-blue-600 hover:text-blue-700"
//                                   >
//                                     👁️ Unhide This Task
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => handleToggleHideUnhide(task.id)}
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                   >
//                                     🙈 Hide This Task
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={() => setEditingTask(task)}
//                                   className="text-sm text-blue-600"
//                                 >
//                                   ✏️ Edit
//                                 </button>
//                                 {userRole === "master" && (
//                                   <button
//                                     onClick={() => handleDeleteTask(task.id)}
//                                     className="text-sm text-red-600"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       )}

//       {editingTask && (
//         <EditTaskModal
//           task={editingTask}
//           onClose={() => setEditingTask(null)}
//           onSave={fetchTasks} // onSave should trigger a re-fetch of tasks
//           onDelete={handleDeleteTask}
//         />
//       )}

//       {/* NEW: Render FloatingTaskCard conditionally at the Board level */}
//       {floatingTask && (
//         <FloatingTaskCard
//           task={floatingTask}
//           isAdmin={userRole === "master"} // Pass isAdmin prop
//           onDelete={handleDeleteTask} // Pass delete handler
//           onUpdateTask={handleFieldUpdate} // Pass update handler
//           onClose={() => setFloatingTask(null)} // Function to close the floating card
//         />
//       )}
//     </div>
//   );
// }






























































"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task as TaskType } from "../../types/task"; // Ensure this path is correct

import EditTaskModal from "../components/EditTaskModal";
import TaskDetailsCard from "../components/TaskDetailsCard";
// import TaskEditableCard from "./TaskEditableCard"; // ✅ Deleted: Line 8398 - Unused import
import FloatingTaskCard from "../components/FloatingTaskCard"; // Import the FloatingTaskCard
import toast from "react-hot-toast";

import { FaFileExcel } from "react-icons/fa";
import { format, isToday, subDays, startOfMonth, startOfYear } from 'date-fns';

import { BoardFilters } from "../components/BoardFilters"; // Your BoardFilters component

// --- Helper function to strip emojis ---
const stripEmojis = (str: string | null | undefined): string => {
  if (!str) return "";
  // This regex matches various emoji ranges and variation selectors
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '').trim();
};
// --- End Helper function ---

// Define TASK_CATEGORIES here as well, so Board.tsx can use it for mapping/filtering
// The `value` here should be the "clean" text we compare against.
const TASK_CATEGORIES = [
  { label: "🍽️ Zomato Onboarding", value: "zomato onboarding" },
  { label: "🍔 Swiggy Onboarding", value: "swiggy onboarding" },
  { label: "🍽️🍔 Zomato + Swiggy Combo", value: "zomato + swiggy combo" },
  { label: "🧾 Food License", value: "food license" },
  { label: "📸 Photo Upload", value: "photo upload" },
  { label: "📂 Account Handling", value: "account handling" },
  { label: "🛠️ Other", value: "other" },
];

const columns = [
  {
    id: "todo",
    title: "📝 To Do",
    color: "border-blue-500",
    bgColor: "bg-gradient-to-br from-blue-100 to-blue-50",
  },
  {
    id: "inprogress",
    title: "⏳ In Progress",
    color: "border-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50",
  },
  {
    id: "done", // Keeping 'done' as the ID
    title: "✅ Done",
    color: "border-green-500",
    bgColor: "bg-gradient-to-br from-green-100 to-green-50",
  },
];

export default function Board() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]); // All fetched tasks
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  // NEW: State to manage the floating task card
  const [floatingTask, setFloatingTask] = useState<TaskType | null>(null);

  // --- Filter States (now managed within Board and passed to BoardFilters) ---
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<keyof TaskType | "shopName">("createdAt"); // More specific type for sortBy
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default sort descending
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // This is now an array

  const audioRef = useRef<HTMLAudioElement>(null);
  const [userRole, setUserRole] = useState<string>("");
  const previousTaskCountRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const hasFetchedInitially = useRef(false);

  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hiddenCardIds");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [showAllTasksMode, setShowAllTasksMode] = useState(false); // Controls user-specific vs. all tasks

  const handleToggleHideUnhide = (taskId: string) => {
    setHiddenCardIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(taskId)) {
        updated.delete(taskId);
      } else {
        updated.add(taskId);
      }
      localStorage.setItem("hiddenCardIds", JSON.stringify([...updated]));
      return updated;
    });
  };

  const handleShowAllTasks = () => {
    setShowAllTasksMode(true);
  };

  const handleShowOnlyVisible = () => {
    setShowAllTasksMode(false);
  };

  const seenTaskIdsRef = useRef<Set<string>>(
    typeof window !== "undefined" && localStorage.getItem("seenTaskIds")
      ? new Set(JSON.parse(localStorage.getItem("seenTaskIds")!))
      : new Set()
  );

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const role = (user.publicMetadata?.role as string) || "";
    const userId = user.id;
    setUserRole(role);

    try {
      const res = await fetch("/api/tasks");
      // FIX (Line 8723 equivalent): Type json response
      const json: { tasks: TaskType[] } = await res.json();
      const taskArray: TaskType[] = Array.isArray(json.tasks) ? json.tasks : [];

      // Filter tasks based on user role and showAllTasksMode
      const relevantTasks =
        (showAllTasksMode || role === "master") // Master can see all, or if showAllTasksMode is active
          ? taskArray
          : taskArray.filter(
              (task: TaskType) =>
                (task.assigneeIds && task.assigneeIds.includes(userId)) ||
                task.assigneeId === userId ||
                task.createdByClerkId === userId
            );

      const seenTaskIds = seenTaskIdsRef.current;
      const newTasks = relevantTasks.filter((task) => !seenTaskIds.has(task.id));

      if (newTasks.length > 0) {
        try {
          if (audioRef.current) {
            audioRef.current.volume = 1;
            await audioRef.current.play();
          }
          toast.success(`🎉 ${newTasks.length} new task(s) assigned!`);
        } catch (err) {
          console.warn("🔇 Audio autoplay blocked", err);
        }
      }

      previousTaskCountRef.current = relevantTasks.length;
      relevantTasks.forEach((task) => seenTaskIds.add(task.id));
      localStorage.setItem("seenTaskIds", JSON.stringify(Array.from(seenTaskIds)));

      setTasks(relevantTasks); // Update the main tasks state
    } catch (err: unknown) { // FIX: Type caught error as unknown
      console.error("❌ Error fetching tasks:", err);
      toast.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  }, [user, showAllTasksMode]); // showAllTasksMode is now a dependency

  // useEffect(() => {
  //   if (!user?.id) {
  //     setTasks([]);
  //     setLoading(false);
  //     return;
  //   }

  //   if (user?.id && !hasFetchedInitially.current) {
  //     fetchTasks();
  //     hasFetchedInitially.current = true;
  //   }

  //   let intervalId: NodeJS.Timeout;

  //   if (autoRefresh) {
  //     intervalId = setInterval(() => {
  //       fetchTasks();
  //     }, 10000); // Fetch every 10 seconds
  //   }

  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [user?.id, fetchTasks, autoRefresh]);




  useEffect(() => {
  if (!user?.id) {
    setTasks([]);
    setLoading(false);
    return;
  }

  if (user?.id && !hasFetchedInitially.current) {
    fetchTasks();
    hasFetchedInitially.current = true;
  }
}, [user?.id, fetchTasks]);


  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const task = tasks.find((t: TaskType) => t.id === draggableId);
    if (!task) return;

    const currentUserId = user?.id;
    const isAssignedToCurrentUser =
      (task.assigneeIds && task.assigneeIds.includes(currentUserId || "")) ||
      task.assigneeId === currentUserId;

    if (!isAssignedToCurrentUser && userRole !== "master") { // Master role can move any task
      toast.error("You can only move tasks assigned to you.");
      return;
    }

    const updated = tasks.map((t) =>
      t.id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTasks(updated); // Optimistic update

    try {
      const token = await getToken();
      if (!token) {
        console.error("Clerk authentication token not available.");
        toast.error("Authentication error. Please log in again.");
        setTasks(tasks); // Revert optimistic update
        return;
      }

      await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: destination.droppableId }),
      });
      toast.success("Task status updated!");
       // Re-fetch to ensure data consistency
    } catch (error: unknown) { // FIX: Type caught error as unknown
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status.");
      setTasks(tasks); // Revert optimistic update
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Replaced window.confirm with a toast for confirmation
    toast((t) => (
      <div className="flex flex-col">
        <span>Are you sure you want to delete this task?</span>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                const token = await getToken();
                if (!token) {
                  console.error("Clerk authentication token not available.");
                  toast.error("Authentication error. Please log in again.");
                  toast.dismiss(t.id);
                  return;
                }

                await fetch(`/api/tasks/${taskId}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                toast.success("Task deleted successfully!");
                fetchTasks();
                setEditingTask(null);
                // If the deleted task was floating, close the floating card
                if (floatingTask && floatingTask.id === taskId) {
                  setFloatingTask(null);
                }
              } catch (err: unknown) { // FIX: Type caught error as unknown
                console.error("Failed to delete task", err);
                toast.error("Failed to delete task.");
              } finally {
                toast.dismiss(t.id);
              }
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
  };


  const handleFieldUpdate = async (taskId: string, updatedFields: Partial<TaskType>) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("Clerk authentication token not available.");
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields), // Send only the updated fields
      });

      if (!res.ok) {
        // FIX (Line 8913 equivalent): Type errorData
        const errorData: { details?: string; error?: string } = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to update task.");
      }

      toast.success("Task updated successfully!");
      fetchTasks(); // Re-fetch all tasks to update UI
      // If the currently floating task was updated, update its state as well
      if (floatingTask && floatingTask.id === taskId) {
        setFloatingTask(prev => prev ? { ...prev, ...updatedFields } : null);
      }
    } catch (err: unknown) { // FIX (Line 8944 equivalent): Type caught error as unknown
      console.error("Failed to update task", err);
      toast.error(`Failed to update task: ${err instanceof Error ? err.message : String(err)}`);
    }
  };


  const exportTasksToCsv = () => {
    if (tasks.length === 0) {
      toast.error("No tasks to export.");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Description",
      "Status",
      "Due Date",
      "Priority",
      "Assigner Name",
      "Assigner Email",
      "Assignee Names",
      "Assignee Emails",
      "Created At",
      "Updated At",
      "Tags",
      "Subtasks",
      "Custom Fields",
      "Attachments",
      "Highlight Color",
    ];

    const csvRows = tasks.map((task) =>
      [
        task.id,
        // --- CSV Export: Strip emojis from title for clean export ---
        stripEmojis(task.title), // Apply stripEmojis here
        // --- End CSV Export ---
        task.description,
        task.status,
        task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm:ss') : "",
        task.priority,
        task.assignerName,
        task.assignerEmail,
        task.assignees?.map(a => a.name).filter(Boolean).join(" | "),
        task.assignees?.map(a => a.email).filter(Boolean).join(" | "),
        task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss') : "",
        task.updatedAt ? format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss') : "",
        task.tags?.join(", "),
        task.subtasks?.map((sub) => sub.title).join("; "),
        task.customFields && typeof task.customFields === "object"
          ? Object.entries(task.customFields)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" | ")
          : "",
        task.attachments?.join("; "),
        task.highlightColor || "",
      ].map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
    );

    const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success("Tasks exported to CSV!");
  };

  // ✅ Deleted: Line 8797 equivalent - uniqueCategoriesForDisplay is unused as TASK_CATEGORIES is passed directly
  // const uniqueCategoriesForDisplay = useMemo(() => {
  //   return TASK_CATEGORIES;
  // }, []);


  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    tasks.forEach(task => {
      if (task.status) statuses.add(task.status);
    });
    return Array.from(statuses).sort();
  }, [tasks]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    tasks.forEach(task => {
      if (task.assignees && Array.isArray(task.assignees)) {
        task.assignees.forEach(assignee => {
          if (assignee && (assignee.name || assignee.email)) {
            assignees.add(assignee.name || assignee.email || '');
          }
        });
      }
    });
    return Array.from(assignees).sort();
  }, [tasks]);

  // --- Filtering and Sorting Logic (Memoized) ---
  const visibleTasks = useMemo(() => {
    let filtered = [...tasks]; // Start with a copy of all tasks

    // 1. Text Filtering
    if (filterText) {
      const lowerFilterText = filterText.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(lowerFilterText) ||
        task.description?.toLowerCase().includes(lowerFilterText) ||
        // Check for existence before calling .toLowerCase() on customFields properties
        (task.customFields?.shopName && (task.customFields.shopName as string).toLowerCase().includes(lowerFilterText)) ||
        (task.customFields?.email && (task.customFields.email as string).toLowerCase().includes(lowerFilterText)) ||
        (task.customFields?.phone && (task.customFields.phone as string).toLowerCase().includes(lowerFilterText)) ||
        task.assignees?.some(a => (a.name || a.email)?.toLowerCase().includes(lowerFilterText)) ||
        task.status?.toLowerCase().includes(lowerFilterText) ||
        task.assignerName?.toLowerCase().includes(lowerFilterText) ||
        (task.customFields?.location && (task.customFields.location as string).toLowerCase().includes(lowerFilterText)) ||
        task.tags?.some(tag => tag.toLowerCase().includes(lowerFilterText)) ||
        task.notes?.some(note => note.content?.toLowerCase().includes(lowerFilterText))
      );
    }

    // 2. Category Filtering (THE CRUCIAL FIX HERE)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((t) => {
        const strippedTaskTitle = stripEmojis(t.title || "").toLowerCase();
        return selectedCategories.some(
          (catValue) => stripEmojis(catValue).toLowerCase() === strippedTaskTitle
        );
      });
    }


    // 3. Status Filtering
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(task =>
        task.status && selectedStatuses.includes(task.status)
      );
    }

    // 4. Assignee Filtering
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(task =>
        task.assignees?.some(assignee =>
          assignee && (assignee.name || assignee.email) && selectedAssignees.includes(assignee.name || assignee.email || '')
        )
      );
    }

    // 5. Date Filtering
    if (selectedDates.length > 0) {
      const now = new Date();
      filtered = filtered.filter(task => {
        const taskDate = task.createdAt ? new Date(task.createdAt) : null;
        if (!taskDate) return false;

        return selectedDates.some(dateFilter => {
          switch (dateFilter) {
            case "today":
              return isToday(taskDate);
            case "yesterday":
              const yesterday = subDays(now, 1);
              return format(taskDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd");
            case "last_7_days":
              const sevenDaysAgo = subDays(now, 7);
              // Ensure taskDate is within the last 7 days including today
              return taskDate >= sevenDaysAgo && taskDate <= now;
            case "this_month":
              const startOfCurrentMonth = startOfMonth(now);
              return taskDate >= startOfCurrentMonth && taskDate <= now;
            case "last_month":
              const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const startOfLastMonth = startOfMonth(prevMonth);
              const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
              return taskDate >= startOfLastMonth && taskDate <= endOfLastMonth;
            case "this_year":
              const startOfCurrentYear = startOfYear(now);
              return taskDate >= startOfCurrentYear && taskDate <= now;
            default:
              return true;
          }
        });
      });
    }

    // 6. Sorting
    filtered.sort((a, b) => {
      // FIX (Lines 8913-8944 equivalent): Replace any with proper types
      let aValue: string | number | Date | undefined | null;
      let bValue: string | number | Date | undefined | null;

      switch (sortBy) {
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // Tasks with no due date come last
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case "title":
          aValue = a.title || "";
          bValue = b.title || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "shopName":
            // Access customFields safely and ensure it's a string
            aValue = (a.customFields && typeof a.customFields === 'object' && a.customFields.shopName)
                       ? String(a.customFields.shopName) : "";
            bValue = (b.customFields && typeof b.customFields === 'object' && b.customFields.shopName)
                       ? String(b.customFields.shopName) : "";
            break;
        case "priority":
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, "": 3, undefined: 3, null: 3 };
          aValue = priorityOrder[String(a.priority).toLowerCase()] ?? 3;
          bValue = priorityOrder[String(b.priority).toLowerCase()] ?? 3;
          break;
        // Handle other fields dynamically if sortBy can be a direct key of TaskType
        default:
          // Ensure that sortBy is a key of TaskType or a custom field key that can be directly accessed
          const safeSortBy = sortBy as keyof TaskType; // Cast to known key
          aValue = a[safeSortBy] as typeof aValue; // Access property using the key
          bValue = b[safeSortBy] as typeof bValue;
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      // Handle string comparison (case-insensitive)
      return sortDirection === "asc"
        ? String(aValue || '').toLowerCase().localeCompare(String(bValue || '').toLowerCase())
        : String(bValue || '').toLowerCase().localeCompare(String(aValue || '').toLowerCase());
    });

    return filtered;
  }, [
    tasks,
    filterText,
    selectedCategories, // This is now an array of "values" like "zomato onboarding"
    selectedStatuses,
    selectedAssignees,
    selectedDates,
    sortBy,
    sortDirection,
  ]);


  return (
    <div className="p-4">
      <audio ref={audioRef} src="/alert.mp3" preload="auto" loop />

      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        {/* --- BoardFilters Component --- */}
        <BoardFilters
          filterText={filterText}
          setFilterText={setFilterText}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          // Pass TASK_CATEGORIES directly as a prop to BoardFilters for rendering
          // It now expects an array of { label, value } objects for categories
          allCategories={TASK_CATEGORIES}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          allStatuses={uniqueStatuses}
          selectedAssignees={selectedAssignees}
          setSelectedAssignees={setSelectedAssignees}
          allAssignees={uniqueAssignees}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
        {/* --- End BoardFilters Component --- */}

        <div className="flex items-center gap-2 flex-wrap">
          {/* "Show My Tasks" button */}
          <button
            onClick={handleShowOnlyVisible}
            className={`px-3 py-2 text-sm rounded-lg border ${
              !showAllTasksMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-blue-600 border-blue-600 hover:bg-blue-100"
            } flex items-center gap-1`}
          >
            👁️ Show My Tasks
          </button>
          {/* "Show All Tasks" button (available to all users) */}
          {/* <button
            onClick={handleShowAllTasks}
            className={`px-3 py-2 text-sm rounded-lg border ${
              showAllTasksMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-blue-600 border-blue-600 hover:bg-blue-100"
            } flex items-center gap-1`}
          >
            🌐 Show All Tasks
          </button> */}

{/* 
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 text-sm rounded-lg border ${
              autoRefresh
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            } flex items-center gap-1`}
          >
            {autoRefresh ? "⏸️ Pause Auto Refresh" : "▶️ Resume Auto Refresh"}
          </button> */}
          <button
  onClick={fetchTasks}
  className="px-3 py-2 text-sm rounded-lg border bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
>
  🔄 Refresh
</button>


          <button
            onClick={exportTasksToCsv}
            disabled={tasks.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              tasks.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            aria-label="Export tasks to CSV"
          >
            <FaFileExcel /> Export to Excel
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center text-lg text-gray-500 my-8">
          Loading tasks...
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center text-lg text-gray-500 my-8">
          No tasks to display.
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-4">
            {columns.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg p-4 flex-1 min-h-[400px] ${col.bgColor}`}
                  >
                    <h2
                      className={`text-lg font-bold mb-3 text-purple-900 border-b pb-2 ${col.color}`}
                    >
                      {col.title} ({visibleTasks.filter(t => t.status === col.id && (showAllTasksMode || !hiddenCardIds.has(t.id))).length})
                    </h2>

                    {visibleTasks
                      .filter((task) => task.status === col.id)
                      .filter((task) => showAllTasksMode || !hiddenCardIds.has(task.id))
                      .map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 mb-3 rounded-xl shadow-md border-l-4 ${task.highlightColor ? `border-[${task.highlightColor}]` : 'border-purple-500'}`}
                              style={{
                                ...provided.draggableProps.style,
                                borderLeftColor: task.highlightColor || undefined,
                              }}
                            >
                              {/* Pass onFloatRequest to TaskDetailsCard */}
                              <TaskDetailsCard
                                task={task}
                                isAdmin={userRole === "master"} // Pass isAdmin based on user role
                                onDelete={handleDeleteTask}
                                onUpdateTask={handleFieldUpdate}
                                onFloatRequest={setFloatingTask} // This sets the task to be floated
                              />

                              <div className="flex gap-2 mt-2">
                                {showAllTasksMode && hiddenCardIds.has(task.id) ? (
                                  <button
                                    onClick={() => handleToggleHideUnhide(task.id)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    👁️ Unhide This Task
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleHideUnhide(task.id)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                  >
                                    🙈 Hide This Task
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="text-sm text-blue-600"
                                >
                                  ✏️ Edit
                                </button>
                                {userRole === "master" && (
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-sm text-red-600"
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={fetchTasks} // onSave should trigger a re-fetch of tasks
          onDelete={handleDeleteTask}
        />
      )}

      {/* NEW: Render FloatingTaskCard conditionally at the Board level */}
      {floatingTask && (
        <FloatingTaskCard
          task={floatingTask}
          isAdmin={userRole === "master"} // Pass isAdmin prop
          onDelete={handleDeleteTask} // Pass delete handler
          onUpdateTask={handleFieldUpdate} // Pass update handler
          onClose={() => setFloatingTask(null)} // Function to close the floating card
        />
      )}
    </div>
  );
}





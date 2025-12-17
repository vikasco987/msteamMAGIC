

// "use client"; // <-- Add this at the very top

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface PaymentsTodayResponse {
//   paymentsToday: PaymentEntry[];
//   summaryByAssigner: Record<string, number>;
// }

// export default function PaymentsTodayPage() {
//   const [data, setData] = useState<PaymentsTodayResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/payments/today")
//       .then((res) => res.json())
//       .then((json) => {
//         setData(json);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch payments:", err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div className="p-4 text-lg">Loading...</div>;
//   if (!data) return <div className="p-4 text-red-500">No data available.</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Today's Payments</h1>

//       {/* Summary */}
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold mb-2">Total Payments by Assigner</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {Object.entries(data.summaryByAssigner).map(([assigner, total]) => (
//             <div key={assigner} className="p-4 bg-white rounded-lg shadow flex justify-between items-center">
//               <span className="font-medium">{assigner}</span>
//               <span className="font-bold">{total}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Detailed Table */}
//       <div className="overflow-x-auto bg-white rounded-lg shadow">
//         <table className="min-w-full table-auto border-collapse">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Task</th>
//               <th className="p-3 text-left">Assigner</th>
//               <th className="p-3 text-right">Received</th>
//               <th className="p-3 text-left">Updated At</th>
//               <th className="p-3 text-left">Updated By</th>
//               <th className="p-3 text-left">File</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.paymentsToday.map((p, i) => (
//               <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
//                 <td className="p-3">{p.taskTitle}</td>
//                 <td className="p-3">{p.assignerName}</td>
//                 <td className="p-3 text-right">{p.received}</td>
//                 <td className="p-3">{new Date(p.updatedAt).toLocaleString()}</td>
//                 <td className="p-3">{p.updatedBy}</td>
//                 <td className="p-3">
//                   {p.fileUrl ? (
//                     <a href={p.fileUrl} target="_blank" rel="noopener noreferrer">
//                       <img src={p.fileUrl} alt="Proof" className="h-12 w-12 object-cover rounded" />
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }











































// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   // default = today
//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   const fetchPayments = async (date: string) => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();
//       setPayments(data.paymentsToday || []);
//       setSummary(data.summaryByAssigner || {});
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // load today's data initially
//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         {/* Date Filter */}
//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found.</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">
//               👤 {name}
//             </h2>
//             <p className="text-xl font-bold text-green-900">
//               ₹ {total}
//             </p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={5} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p, index) => (
//               <tr key={index} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">
//                   {new Date(p.updatedAt).toLocaleString()}
//                 </td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }







// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   const fetchPayments = async (date: string) => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();
//       setPayments(data.paymentsToday || []);
//       setSummary(data.summaryByAssigner || {});
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         {/* Date Filter */}
//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found.</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">
//               👤 {name}
//             </h2>
//             <p className="text-xl font-bold text-green-900">
//               ₹ {total}
//             </p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={5} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p, index) => (
//               <tr key={index} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


























// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string; // ✅ REQUIRED FOR DELETE
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   const fetchPayments = async (date: string) => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();
//       setPayments(data.paymentsToday || []);
//       setSummary(data.summaryByAssigner || {});
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE HANDLER */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     const ok = confirm("Are you sure you want to delete this payment record?");
//     if (!ok) return;

//     try {
//       await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       // refresh list
//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         {/* Date Filter */}
//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found.</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">
//               👤 {name}
//             </h2>
//             <p className="text-xl font-bold text-green-900">
//               ₹ {total}
//             </p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }







// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string; // ✅ REQUIRED FOR DELETE
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   const fetchPayments = async (date: string) => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();
//       setPayments(data.paymentsToday || []);
//       setSummary(data.summaryByAssigner || {});
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE HANDLER */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     const ok = confirm("Are you sure you want to delete this payment record?");
//     if (!ok) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert("Delete failed: " + data?.error);
//         return;
//       }

//       // refresh list
//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         {/* Date Filter */}
//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found.</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">
//               👤 {name}
//             </h2>
//             <p className="text-xl font-bold text-green-900">
//               ₹ {total}
//             </p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }














// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string; // ✅ REQUIRED FOR DELETE
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       // Safety check: Ensure paymentsToday is an array
//       if (!Array.isArray(data.paymentsToday)) {
//         console.warn("paymentsToday is not an array:", data.paymentsToday);
//         setPayments([]);
//       } else {
//         setPayments(data.paymentsToday);
//       }

//       // Safety check: Ensure summaryByAssigner is an object
//       if (typeof data.summaryByAssigner !== "object" || data.summaryByAssigner === null) {
//         setSummary({});
//       } else {
//         setSummary(data.summaryByAssigner);
//       }
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE HANDLER */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     const ok = confirm("Are you sure you want to delete this payment record?");
//     if (!ok) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert("Delete failed: " + data?.error || "Unknown error");
//         return;
//       }

//       // Refresh list after deletion
//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">💰 Payments Report</h1>

//         {/* Date Filter */}
//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found.</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">👤 {name}</h2>
//             <p className="text-xl font-bold text-green-900">₹ {total}</p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }







// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string; // ✅ REQUIRED FOR DELETE
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;
//   received: number;
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   /* ✅ Fetch payments for a specific date */
//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       // Safety check: Ensure paymentsToday is an array
//       setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : []);

//       // Safety check: Ensure summaryByAssigner is an object
//       setSummary(typeof data.summaryByAssigner === "object" && data.summaryByAssigner ? data.summaryByAssigner : {});
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE payment */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     const ok = confirm("Are you sure you want to delete this payment record?");
//     if (!ok) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert("Delete failed: " + (data?.error || "Unknown error"));
//         return;
//       }

//       // ✅ Refresh the payment list after deletion
//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">💰 Payments Report</h1>

//         {/* Date Filter */}
//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found.</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">👤 {name}</h2>
//             <p className="text-xl font-bold text-green-900">₹ {total}</p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Payment Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>
//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }














// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string;
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;

//   received: number;        // total received
//   amountUpdated: number;   // 🔥 newly added amount

//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   /* ✅ Fetch payments */
//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : []);
//       setSummary(
//         typeof data.summaryByAssigner === "object" && data.summaryByAssigner
//           ? data.summaryByAssigner
//           : {}
//       );
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE payment */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this payment record?")) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert("Delete failed: " + (data?.error || "Unknown error"));
//         return;
//       }

//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">💰 Payments Report</h1>

//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">👤 {name}</h2>
//             <p className="text-xl font-bold text-green-900">₹ {total}</p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated Amount</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2">{p.assignerName}</td>

//                 {/* ✅ Total received */}
//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>

//                 {/* 🔥 Newly added amount */}
//                 <td className="border px-3 py-2 font-semibold text-blue-700">
//                   +₹ {p.amountUpdated}
//                 </td>

//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>

//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>

//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


















// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string;
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;

//   received: number;        // total received till now
//   amountUpdated: number;   // + / - updated amount

//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   /* ✅ Fetch payments */
//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : {});
//       setSummary(
//         typeof data.summaryByAssigner === "object" && data.summaryByAssigner
//           ? data.summaryByAssigner
//           : {}
//       );
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE payment */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this payment record?")) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert("Delete failed: " + (data?.error || "Unknown error"));
//         return;
//       }

//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">💰 Payments Report</h1>

//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* ✅ ASSIGNER TOTAL BOXES (ONLY HERE) */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">👤 {name}</h2>
//             <p className="text-xl font-bold text-green-900">₹ {total}</p>
//             <p className="text-sm text-green-700">Total received</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={7} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={7} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>

//                 <td className="border px-3 py-2 font-medium">
//                   {p.assignerName}
//                 </td>

//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>

//                 <td
//                   className={`border px-3 py-2 font-semibold ${
//                     p.amountUpdated >= 0
//                       ? "text-blue-700"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {p.amountUpdated >= 0 ? "+" : "-"}₹{" "}
//                   {Math.abs(p.amountUpdated)}
//                 </td>

//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>

//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>

//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }















// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string;
//   taskId: string;
//   taskTitle: string;
//   assignerName: string;

//   received: number;        // total received till now
//   amountUpdated: number;   // + / - updated amount

//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   /* ✅ Fetch payments */
//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       // ✅ FIXED HERE
//       setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : []);

//       setSummary(
//         typeof data.summaryByAssigner === "object" && data.summaryByAssigner
//           ? data.summaryByAssigner
//           : {}
//       );
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE payment */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this payment record?")) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert("Delete failed: " + (data?.error || "Unknown error"));
//         return;
//       }

//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* ✅ ASSIGNER TOTAL BOXES */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">
//               👤 {name}
//             </h2>
//             <p className="text-xl font-bold text-green-900">
//               ₹ {total}
//             </p>
//             <p className="text-sm text-green-700">
//               Total updated amount
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={7} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={7} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2">{p.taskTitle}</td>

//                 <td className="border px-3 py-2 font-medium">
//                   {p.assignerName}
//                 </td>

//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>

//                 <td
//                   className={`border px-3 py-2 font-semibold ${
//                     p.amountUpdated >= 0
//                       ? "text-blue-700"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {p.amountUpdated >= 0 ? "+" : "-"}₹{" "}
//                   {Math.abs(p.amountUpdated)}
//                 </td>

//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>

//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>

//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
























// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string;
//   taskId: string;          // Unique Task ID
//   taskTitle: string;
//   assignerName: string;

//   received: number;        // total received till now
//   amountUpdated: number;   // + / - updated amount

//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);

//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   /* ✅ Fetch payments */
//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : []);
//       setSummary(
//         typeof data.summaryByAssigner === "object" && data.summaryByAssigner
//           ? data.summaryByAssigner
//           : {}
//       );
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE payment */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this payment record?")) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert("Delete failed: " + (data?.error || "Unknown error"));
//         return;
//       }

//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* ✅ ASSIGNER TOTAL BOXES */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">
//               👤 {name}
//             </h2>
//             <p className="text-xl font-bold text-green-900">
//               ₹ {total}
//             </p>
//             <p className="text-sm text-green-700">
//               Total updated amount
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task ID</th> {/* New Column */}
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={8} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={8} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2 font-mono text-sm text-gray-700">
//                   {p.taskId} {/* Show unique task ID */}
//                 </td>

//                 <td className="border px-3 py-2">{p.taskTitle}</td>

//                 <td className="border px-3 py-2 font-medium">
//                   {p.assignerName}
//                 </td>

//                 <td className="border px-3 py-2 font-semibold text-green-700">
//                   ₹ {p.received}
//                 </td>

//                 <td
//                   className={`border px-3 py-2 font-semibold ${
//                     p.amountUpdated >= 0 ? "text-blue-700" : "text-red-600"
//                   }`}
//                 >
//                   {p.amountUpdated >= 0 ? "+" : "-"}₹ {Math.abs(p.amountUpdated)}
//                 </td>

//                 <td className="border px-3 py-2 text-sm">
//                   {formatDateTime(p.updatedAt)}
//                 </td>

//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a
//                       href={p.fileUrl}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   ) : (
//                     "—"
//                   )}
//                 </td>

//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


















// "use client";

// import React, { useEffect, useState } from "react";

// interface PaymentEntry {
//   paymentId: string;
//   taskId: string;          // Unique Task ID
//   taskTitle: string;
//   assignerName: string;
//   received: number;        // total received till now
//   amountUpdated: number;   // + / - updated amount
//   updatedAt: string;
//   updatedBy: string;
//   fileUrl: string | null;
//   phone?: string | null;   // New field
//   shopName?: string | null; // New field
// }

// interface SummaryByAssigner {
//   [assignerName: string]: number;
// }

// /* ✅ Date formatter */
// function formatDateTime(dateString: string) {
//   const date = new Date(dateString);
//   const datePart = date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
//   const timePart = date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
//   return `${datePart.toLowerCase()} and ${timePart.toLowerCase()}`;
// }

// export default function PaymentsTodayPage() {
//   const [payments, setPayments] = useState<PaymentEntry[]>([]);
//   const [summary, setSummary] = useState<SummaryByAssigner>({});
//   const [loading, setLoading] = useState(false);

//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);

//   /* ✅ Fetch payments */
//   const fetchPayments = async (date: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/payments/today?date=${date}`);
//       const data = await res.json();

//       setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : []);
//       setSummary(
//         typeof data.summaryByAssigner === "object" && data.summaryByAssigner
//           ? data.summaryByAssigner
//           : {}
//       );
//     } catch (err) {
//       console.error("Failed to fetch payments", err);
//       setPayments([]);
//       setSummary({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ✅ DELETE payment */
//   const handleDelete = async (taskId: string, paymentId: string) => {
//     if (!taskId || !paymentId) {
//       alert("Delete failed: taskId and paymentId are required.");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this payment record?")) return;

//     try {
//       const res = await fetch("/api/payments/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ taskId, paymentId }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert("Delete failed: " + (data?.error || "Unknown error"));
//         return;
//       }

//       fetchPayments(selectedDate);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchPayments(selectedDate);
//   }, [selectedDate]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">
//           💰 Payments Report
//         </h1>

//         <div className="flex items-center gap-2">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//           />
//           <button
//             onClick={() => fetchPayments(selectedDate)}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Assigner Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {Object.keys(summary).length === 0 && !loading && (
//           <p className="text-gray-500">No payments found</p>
//         )}

//         {Object.entries(summary).map(([name, total]) => (
//           <div
//             key={name}
//             className="bg-green-100 border border-green-300 rounded-lg p-4 shadow"
//           >
//             <h2 className="text-lg font-semibold text-green-800">👤 {name}</h2>
//             <p className="text-xl font-bold text-green-900">₹ {total}</p>
//             <p className="text-sm text-green-700">Total updated amount</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-2 text-left">Task ID</th>
//               <th className="border px-3 py-2 text-left">Task</th>
//               <th className="border px-3 py-2">Assigner</th>
//               <th className="border px-3 py-2">Phone</th> {/* New Column */}
//               <th className="border px-3 py-2">Shop Name</th> {/* New Column */}
//               <th className="border px-3 py-2">Received</th>
//               <th className="border px-3 py-2">Updated</th>
//               <th className="border px-3 py-2">Updated At</th>
//               <th className="border px-3 py-2">Proof</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan={10} className="text-center py-6">
//                   Loading...
//                 </td>
//               </tr>
//             )}

//             {!loading && payments.length === 0 && (
//               <tr>
//                 <td colSpan={10} className="text-center py-6 text-gray-500">
//                   No records for selected date
//                 </td>
//               </tr>
//             )}

//             {payments.map((p) => (
//               <tr key={p.paymentId} className="hover:bg-gray-50">
//                 <td className="border px-3 py-2 font-mono text-sm text-gray-700">{p.taskId}</td>
//                 <td className="border px-3 py-2">{p.taskTitle}</td>
//                 <td className="border px-3 py-2 font-medium">{p.assignerName}</td>
//                 <td className="border px-3 py-2">{p.phone || "—"}</td>
//                 <td className="border px-3 py-2">{p.shopName || "—"}</td>
//                 <td className="border px-3 py-2 font-semibold text-green-700">₹ {p.received}</td>
//                 <td className={`border px-3 py-2 font-semibold ${p.amountUpdated >= 0 ? "text-blue-700" : "text-red-600"}`}>
//                   {p.amountUpdated >= 0 ? "+" : "-"}₹ {Math.abs(p.amountUpdated)}
//                 </td>
//                 <td className="border px-3 py-2 text-sm">{formatDateTime(p.updatedAt)}</td>
//                 <td className="border px-3 py-2">
//                   {p.fileUrl ? (
//                     <a href={p.fileUrl} target="_blank" className="text-blue-600 underline">View</a>
//                   ) : "—"}
//                 </td>
//                 <td className="border px-3 py-2 text-center">
//                   <button
//                     onClick={() => handleDelete(p.taskId, p.paymentId)}
//                     className="text-red-600 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
























"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  User, 
  Store, 
  Phone, 
  Trash2, 
  ExternalLink, 
  Filter, 
  IndianRupee,
  ChevronRight,
  Search
} from "lucide-react";

interface PaymentEntry {
  paymentId: string;
  taskId: string;
  taskTitle: string;
  assignerName: string;
  received: number;
  amountUpdated: number;
  updatedAt: string;
  updatedBy: string;
  fileUrl: string | null;
  phone?: string | null;
  shopName?: string | null;
}

interface SummaryByAssigner {
  [assignerName: string]: number;
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date: datePart, time: timePart };
}

export default function PaymentsTodayPage() {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [summary, setSummary] = useState<SummaryByAssigner>({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const fetchPayments = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/today?date=${date}`);
      const data = await res.json();
      setPayments(Array.isArray(data.paymentsToday) ? data.paymentsToday : []);
      setSummary(data.summaryByAssigner || {});
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string, paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const res = await fetch("/api/payments/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, paymentId }),
      });
      if (res.ok) fetchPayments(selectedDate);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    fetchPayments(selectedDate);
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="bg-blue-600 text-white p-2 rounded-lg">
                <IndianRupee size={24} />
              </span>
              Payments Report
            </h1>
            <p className="text-gray-500 mt-1">Track and manage your daily transactions</p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <Calendar size={18} className="text-gray-400 ml-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
            />
            <button
              onClick={() => fetchPayments(selectedDate)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md shadow-blue-100"
            >
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Assigner Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(summary).map(([name, total]) => (
            <div key={name} className="relative overflow-hidden bg-white group p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <User size={64} />
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{name}</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">₹{total.toLocaleString()}</h2>
              <div className="mt-3 flex items-center text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                Updated Today
              </div>
            </div>
          ))}
          {Object.keys(summary).length === 0 && !loading && (
            <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Search className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-gray-500">No summary data for this date</p>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Task Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Assigner</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Client Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Proof</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span>Loading records...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No records found for the selected date.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const dt = formatDateTime(p.updatedAt);
                    return (
                      <tr key={p.paymentId} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{p.taskTitle}</span>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">ID: {p.taskId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                              {p.assignerName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{p.assignerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {p.shopName && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Store size={14} className="text-gray-400" />
                                {p.shopName}
                              </div>
                            )}
                            {p.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Phone size={14} className="text-gray-400" />
                                {p.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">₹{p.received}</span>
                            <span className={`text-xs font-medium ${p.amountUpdated >= 0 ? "text-blue-600" : "text-red-500"}`}>
                              {p.amountUpdated >= 0 ? "+" : "-"}{Math.abs(p.amountUpdated)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 italic">
                            {dt.date}<br/>{dt.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {p.fileUrl ? (
                            <a 
                              href={p.fileUrl} 
                              target="_blank" 
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                            >
                              View <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs italic">No proof</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(p.taskId, p.paymentId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
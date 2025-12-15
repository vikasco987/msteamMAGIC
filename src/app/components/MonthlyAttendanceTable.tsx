// "use client";

// import { useEffect, useState } from "react";

// interface TableData {
//   headers: string[];
//   rows: Record<string, string>[];
// }

// export default function MonthlyAttendanceTable({ month }: { month: string }) {
//   const [data, setData] = useState<TableData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`/api/attendance/monthly?month=${month}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         // validate structure
//         if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
//           throw new Error("Invalid response format");
//         }

//         setData(json);
//       } catch (err: any) {
//         console.error("❌ Fetch monthly failed:", err);
//         setError(err.message || "Failed to load data");
//         setData({ headers: ["Employee"], rows: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [month]);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
//   if (!data || data.rows.length === 0)
//     return <p className="p-4">No attendance records for {month}</p>;

//   return (
//     <div className="overflow-auto border rounded-lg shadow-lg bg-white">
//       <table className="min-w-full border-collapse text-sm">
//         <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
//           <tr>
//             {data.headers.map((h) => (
//               <th key={h} className="px-3 py-2 border">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.rows.map((row, i) => (
//             <tr
//               key={i}
//               className={
//                 i % 2 === 0
//                   ? "bg-gray-50 hover:bg-gray-100"
//                   : "bg-white hover:bg-gray-100"
//               }
//             >
//               {data.headers.map((h) => (
//                 <td key={h} className="px-3 py-2 border text-center">
//                   {row[h] ?? "-"}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }











// lkjkhgfdfgyhjipkl[p
//   ',l;kjhjgvhjiko[p];
//   4
  
//   'oiuyuhuji'
// ]











// "use client";

// import { useEffect, useState } from "react";

// interface TableData {
//   headers: string[];
//   rows: Record<string, string>[]; // key is header, value is cell
// }

// // -------------------- Helpers --------------------
// // Decrease date by 1 day and format in IST
// function formatDateMinusOne(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     date.setDate(date.getDate() - 1); // decrease 1 day
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       timeZone: "Asia/Kolkata",
//     });
//   } catch {
//     return dateString;
//   }
// }

// export default function MonthlyAttendanceTable({ month }: { month: string }) {
//   const [data, setData] = useState<TableData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`/api/attendance/monthly?month=${month}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         // validate structure
//         if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
//           throw new Error("Invalid response format");
//         }

//         setData(json);
//       } catch (err: any) {
//         console.error("❌ Fetch monthly failed:", err);
//         setError(err.message || "Failed to load data");
//         setData({ headers: ["Employee"], rows: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [month]);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
//   if (!data || data.rows.length === 0)
//     return <p className="p-4">No attendance records for {month}</p>;

//   return (
//     <div className="overflow-auto border rounded-lg shadow-lg bg-white">
//       <table className="min-w-full border-collapse text-sm">
//         <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
//           <tr>
//             {data.headers.map((h) => (
//               <th key={h} className="px-3 py-2 border">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.rows.map((row, i) => (
//             <tr
//               key={i}
//               className={
//                 i % 2 === 0
//                   ? "bg-gray-50 hover:bg-gray-100"
//                   : "bg-white hover:bg-gray-100"
//               }
//             >
//               {data.headers.map((h) => (
//                 <td key={h} className="px-3 py-2 border text-center">
//                   {h.toLowerCase().includes("date")
//                     ? formatDateMinusOne(row[h])
//                     : row[h] ?? "-"}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";

// interface TableData {
//   headers: string[];
//   rows: Record<string, string>[];
// }

// // -------------------- Helpers --------------------
// function formatDate(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       timeZone: "Asia/Kolkata",
//     });
//   } catch {
//     return dateString;
//   }
// }

// export default function MonthlyAttendanceTable({ month }: { month: string }) {
//   const [data, setData] = useState<TableData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // For monthly API, month should be in YYYY-MM format
//         const monthParam = month.includes("-") && month.length === 7 ? month : month.slice(0, 7);
//         const res = await fetch(`/api/attendance/monthly?month=${monthParam}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
//           throw new Error("Invalid response format");
//         }

//         setData(json);
//       } catch (err: any) {
//         console.error("❌ Fetch monthly failed:", err);
//         setError(err.message || "Failed to load data");
//         setData({ headers: ["Employee"], rows: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [month]);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
//   if (!data || data.rows.length === 0)
//     return <p className="p-4">No attendance records for {month}</p>;

//   return (
//     <div className="overflow-auto border rounded-lg shadow-lg bg-white">
//       <table className="min-w-full border-collapse text-sm">
//         <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
//           <tr>
//             {data.headers.map((h) => (
//               <th key={h} className="px-3 py-2 border">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.rows.map((row, i) => (
//             <tr
//               key={i}
//               className={
//                 i % 2 === 0
//                   ? "bg-gray-50 hover:bg-gray-100"
//                   : "bg-white hover:bg-gray-100"
//               }
//             >
//               {data.headers.map((h) => (
//                 <td key={h} className="px-3 py-2 border text-center">
//                   {h.toLowerCase().includes("date")
//                     ? formatDate(row[h])
//                     : row[h] ?? "-"}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";

// interface TableData {
//   headers: string[];
//   rows: Record<string, string>[]; // key is header, value is cell
// }

// // -------------------- Helpers --------------------
// // Increment date by 1 day and format in IST
// function formatDatePlusOne(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     date.setDate(date.getDate() + 1); // increment 1 day
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       timeZone: "Asia/Kolkata",
//     });
//   } catch {
//     return dateString;
//   }
// }

// export default function MonthlyAttendanceTable({ month }: { month: string }) {
//   const [data, setData] = useState<TableData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const monthParam = month.includes("-") && month.length === 7 ? month : month.slice(0, 7);
//         const res = await fetch(`/api/attendance/monthly?month=${monthParam}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
//           throw new Error("Invalid response format");
//         }

//         // Optional: sort rows by checkIn date
//         json.rows.sort((a: any, b: any) => {
//           const dateA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
//           const dateB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
//           return dateA - dateB;
//         });

//         setData(json);
//       } catch (err: any) {
//         console.error("❌ Fetch monthly failed:", err);
//         setError(err.message || "Failed to load data");
//         setData({ headers: ["Employee"], rows: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [month]);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
//   if (!data || data.rows.length === 0)
//     return <p className="p-4">No attendance records for {month}</p>;

//   return (
//     <div className="overflow-auto border rounded-lg shadow-lg bg-white">
//       <table className="min-w-full border-collapse text-sm">
//         <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
//           <tr>
//             {data.headers.map((h) => (
//               <th key={h} className="px-3 py-2 border">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.rows.map((row, i) => (
//             <tr
//               key={i}
//               className={
//                 i % 2 === 0
//                   ? "bg-gray-50 hover:bg-gray-100"
//                   : "bg-white hover:bg-gray-100"
//               }
//             >
//               {data.headers.map((h) => (
//                 <td key={h} className="px-3 py-2 border text-center">
//                   {(h.toLowerCase().includes("date") || h.toLowerCase().includes("checkin")) 
//                     ? formatDatePlusOne(row[h] ?? row["checkIn"]) 
//                     : row[h] ?? "-"}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }










// "use client";

// import { useEffect, useState } from "react";

// interface TableData {
//   headers: string[];
//   rows: Record<string, any>[]; // allow object types like checkIn: { $date: ... }
// }

// // -------------------- Helpers --------------------
// function formatDateIST(dateInput?: any): string {
//   if (!dateInput) return "-";

//   try {
//     // Handle MongoDB {$date: "..."} objects
//     const raw =
//       typeof dateInput === "string"
//         ? dateInput
//         : dateInput.$date || dateInput;

//     const date = new Date(raw);

//     // Convert to IST explicitly
//     return date.toLocaleDateString("en-IN", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       timeZone: "Asia/Kolkata",
//     });
//   } catch {
//     return String(dateInput);
//   }
// }

// function formatDateTimeIST(dateInput?: any): string {
//   if (!dateInput) return "-";
//   try {
//     const raw =
//       typeof dateInput === "string"
//         ? dateInput
//         : dateInput.$date || dateInput;

//     const date = new Date(raw);

//     return date.toLocaleString("en-IN", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//       timeZone: "Asia/Kolkata",
//     });
//   } catch {
//     return String(dateInput);
//   }
// }

// export default function MonthlyAttendanceTable() {
//   // Default to current month
//   const today = new Date();
//   const defaultMonth = today.toISOString().slice(0, 7);

//   const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
//   const [data, setData] = useState<TableData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`/api/attendance/monthly?month=${selectedMonth}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
//           throw new Error("Invalid response format");
//         }

//         // Sort rows by checkIn
//         json.rows.sort((a: any, b: any) => {
//           const dateA = a.checkIn ? new Date(a.checkIn.$date || a.checkIn).getTime() : 0;
//           const dateB = b.checkIn ? new Date(b.checkIn.$date || b.checkIn).getTime() : 0;
//           return dateA - dateB;
//         });

//         setData(json);
//       } catch (err: any) {
//         console.error("❌ Fetch monthly failed:", err);
//         setError(err.message || "Failed to load data");
//         setData({ headers: ["Employee"], rows: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedMonth]);

//   return (
//     <div>
//       {/* Month Selector */}
//       <div className="flex items-center gap-3 mb-4">
//         <label htmlFor="month" className="font-medium text-sm">
//           Select Month:
//         </label>
//         <input
//           type="month"
//           id="month"
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>

//       {/* Table */}
//       {loading && <p className="p-4">Loading...</p>}
//       {error && <p className="p-4 text-red-600">Error: {error}</p>}
//       {!loading && data && data.rows.length === 0 && (
//         <p className="p-4">No attendance records for {selectedMonth}</p>
//       )}

//       {data && data.rows.length > 0 && (
//         <div className="overflow-auto border rounded-lg shadow-lg bg-white">
//           <table className="min-w-full border-collapse text-sm">
//             <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
//               <tr>
//                 {data.headers.map((h) => (
//                   <th key={h} className="px-3 py-2 border">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data.rows.map((row, i) => (
//                 <tr
//                   key={i}
//                   className={
//                     i % 2 === 0
//                       ? "bg-gray-50 hover:bg-gray-100"
//                       : "bg-white hover:bg-gray-100"
//                   }
//                 >
//                   {data.headers.map((h) => {
//                     const val = row[h];
//                     if (!val) return <td key={h} className="px-3 py-2 border text-center">-</td>;

//                     // ✅ For checkIn/checkOut show full datetime
//                     if (h.toLowerCase().includes("checkin") || h.toLowerCase().includes("checkout")) {
//                       return (
//                         <td key={h} className="px-3 py-2 border text-center">
//                           {formatDateTimeIST(val)}
//                         </td>
//                       );
//                     }

//                     // ✅ For date column show only date
//                     if (h.toLowerCase().includes("date")) {
//                       return (
//                         <td key={h} className="px-3 py-2 border text-center">
//                           {formatDateIST(val)}
//                         </td>
//                       );
//                     }

//                     return (
//                       <td key={h} className="px-3 py-2 border text-center">
//                         {String(val)}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }







// "use client";

// import { useEffect, useState } from "react";

// interface TableData {
//   headers: string[];
//   rows: Record<string, any>[]; // allow objects like checkIn: { $date: ... }
// }

// // -------------------- Helpers --------------------
// // Convert UTC date to IST
// function toISTDate(dateInput?: any): Date | null {
//   if (!dateInput) return null;
//   try {
//     const raw = typeof dateInput === "string" ? dateInput : dateInput.$date || dateInput;
//     const date = new Date(raw);
//     // Shift UTC → IST by adding 5:30 hours
//     const istTime = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
//     return istTime;
//   } catch {
//     return null;
//   }
// }

// // Format date for table (day-month-year)
// function formatDateIST(dateInput?: any): string {
//   const istDate = toISTDate(dateInput);
//   if (!istDate) return "-";
//   return istDate.toLocaleDateString("en-IN", {
//     weekday: "short",
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });
// }

// // Format date + time for checkIn/checkOut
// function formatDateTimeIST(dateInput?: any): string {
//   const istDate = toISTDate(dateInput);
//   if (!istDate) return "-";
//   return istDate.toLocaleString("en-IN", {
//     weekday: "short",
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// }

// export default function MonthlyAttendanceTable() {
//   // Default to current month
//   const today = new Date();
//   const defaultMonth = today.toISOString().slice(0, 7);

//   const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
//   const [data, setData] = useState<TableData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`/api/attendance/monthly?month=${selectedMonth}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
//           throw new Error("Invalid response format");
//         }

//         // Sort rows by checkIn date (IST)
//         json.rows.sort((a: any, b: any) => {
//           const dateA = toISTDate(a.checkIn)?.getTime() || 0;
//           const dateB = toISTDate(b.checkIn)?.getTime() || 0;
//           return dateA - dateB;
//         });

//         setData(json);
//       } catch (err: any) {
//         console.error("❌ Fetch monthly failed:", err);
//         setError(err.message || "Failed to load data");
//         setData({ headers: ["Employee"], rows: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedMonth]);

//   return (
//     <div>
//       {/* Month Selector */}
//       <div className="flex items-center gap-3 mb-4">
//         <label htmlFor="month" className="font-medium text-sm">
//           Select Month:
//         </label>
//         <input
//           type="month"
//           id="month"
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>

//       {/* Table */}
//       {loading && <p className="p-4">Loading...</p>}
//       {error && <p className="p-4 text-red-600">Error: {error}</p>}
//       {!loading && data && data.rows.length === 0 && (
//         <p className="p-4">No attendance records for {selectedMonth}</p>
//       )}

//       {data && data.rows.length > 0 && (
//         <div className="overflow-auto border rounded-lg shadow-lg bg-white">
//           <table className="min-w-full border-collapse text-sm">
//             <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
//               <tr>
//                 {data.headers.map((h) => (
//                   <th key={h} className="px-3 py-2 border">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data.rows.map((row, i) => (
//                 <tr
//                   key={i}
//                   className={i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
//                 >
//                   {data.headers.map((h) => {
//                     const val = row[h];
//                     if (!val) return <td key={h} className="px-3 py-2 border text-center">-</td>;

//                     if (h.toLowerCase().includes("checkin") || h.toLowerCase().includes("checkout")) {
//                       return (
//                         <td key={h} className="px-3 py-2 border text-center">
//                           {formatDateTimeIST(val)}
//                         </td>
//                       );
//                     }

//                     if (h.toLowerCase().includes("date")) {
//                       return (
//                         <td key={h} className="px-3 py-2 border text-center">
//                           {formatDateIST(val)}
//                         </td>
//                       );
//                     }

//                     return (
//                       <td key={h} className="px-3 py-2 border text-center">{String(val)}</td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";

interface TableData {
  headers: string[];
  rows: Record<string, any>[];
}

// -------------------- Helpers --------------------
// Hardcoded "subtract 1 day" helper for table display
function formatDateMinusOne(dateInput?: any): string {
  if (!dateInput) return "-";
  try {
    const raw = typeof dateInput === "string" ? dateInput : dateInput.$date || dateInput;
    const date = new Date(raw);

    // HARD FIX: subtract 1 day
    date.setDate(date.getDate() - 1);

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "-";
  }
}

// Format checkIn/checkOut times in IST
function formatTime(dateInput?: any): string {
  if (!dateInput) return "-";
  try {
    const raw = typeof dateInput === "string" ? dateInput : dateInput.$date || dateInput;
    const date = new Date(raw);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "-";
  }
}

export default function MonthlyAttendanceTable() {
  const today = new Date();
  const defaultMonth = today.toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/attendance/monthly?month=${selectedMonth}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!json || !Array.isArray(json.headers) || !Array.isArray(json.rows)) {
          throw new Error("Invalid response format");
        }

        // Sort rows by checkIn date (original UTC, not minus 1)
        json.rows.sort((a: any, b: any) => {
          const dateA = new Date(a.checkIn || 0).getTime();
          const dateB = new Date(b.checkIn || 0).getTime();
          return dateA - dateB;
        });

        setData(json);
      } catch (err: any) {
        console.error("❌ Fetch monthly failed:", err);
        setError(err.message || "Failed to load data");
        setData({ headers: ["Employee"], rows: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  return (
    <div>
      {/* Month Selector */}
      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="month" className="font-medium text-sm">
          Select Month:
        </label>
        <input
          type="month"
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Table */}
      {loading && <p className="p-4">Loading...</p>}
      {error && <p className="p-4 text-red-600">Error: {error}</p>}
      {!loading && data && data.rows.length === 0 && (
        <p className="p-4">No attendance records for {selectedMonth}</p>
      )}

      {data && data.rows.length > 0 && (
        <div className="overflow-auto border rounded-lg shadow-lg bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase tracking-wide">
              <tr>
                {data.headers.map((h) => (
                  <th key={h} className="px-3 py-2 border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
                >
                  {data.headers.map((h) => {
                    const val = row[h];
                    if (!val) return <td key={h} className="px-3 py-2 border text-center">-</td>;

                    if (h.toLowerCase().includes("checkin") || h.toLowerCase().includes("checkout")) {
                      return (
                        <td key={h} className="px-3 py-2 border text-center">
                          {formatTime(val)}
                        </td>
                      );
                    }

                    if (h.toLowerCase().includes("date")) {
                      return (
                        <td key={h} className="px-3 py-2 border text-center">
                          {formatDateMinusOne(val)}
                        </td>
                      );
                    }

                    return (
                      <td key={h} className="px-3 py-2 border text-center">{String(val)}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

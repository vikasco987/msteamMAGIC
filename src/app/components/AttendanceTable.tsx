













// "use client";

// import { useEffect, useState } from "react";
// import MonthlyAttendanceTable from "./MonthlyAttendanceTable";
// import AttendanceAnalyticsTable from "./AttendanceAnalyticsTable";
// import AttendancePivotTable from "./AttendancePivotTable"; // ✅ Pivot view
// import { Button } from "@/components/ui/button";

// interface Attendance {
//   id: string;
//   userId: string;
//   employeeName?: string;
//   faceImage?: string;
//   location?: string;
//   deviceInfo?: string;
//   checkIn?: string;
//   checkOut?: string;
//   checkInReason?: string;
//   checkOutReason?: string;
//   date: string;
//   status?: string;
//   verified?: boolean;
//   remarks?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // -------------------- Helpers --------------------
// function formatDate(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     const weekday = date.toLocaleString("en-US", { weekday: "short" });
//     const day = date.getDate();
//     const month = date.toLocaleString("en-US", { month: "short" });
//     const year = date.getFullYear();
//     return `${weekday}, ${day} ${month}, ${year}`;
//   } catch {
//     return dateString;
//   }
// }

// function formatTime(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     let hour = date.getHours();
//     const minutes = date.getMinutes().toString().padStart(2, "0");
//     const suffix = hour >= 12 ? "PM" : "AM";
//     hour = hour % 12 || 12;
//     return `${hour}:${minutes} ${suffix}`;
//   } catch {
//     return dateString;
//   }
// }

// // ✅ Convert decimal hours (e.g. 8.6532) → "8 hr 39 min"
// function formatDecimalHours(decimalHours?: number): string {
//   if (decimalHours == null) return "-";
//   const hrs = Math.floor(decimalHours);
//   const mins = Math.round((decimalHours - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// // ✅ Calculate Late By (office start = 10:00 AM)
// function calculateLateBy(checkIn?: string): string {
//   if (!checkIn) return "-";

//   const actualCheckIn = new Date(checkIn);
//   const officeStart = new Date(checkIn);
//   officeStart.setHours(10, 0, 0, 0);

//   if (actualCheckIn <= officeStart) return "On Time";

//   const diffMs = actualCheckIn.getTime() - officeStart.getTime();
//   const diffMins = Math.floor(diffMs / 60000);
//   const hrs = Math.floor(diffMins / 60);
//   const mins = diffMins % 60;

//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "-";
// }

// // ✅ Calculate Working Hours (subtract 1 hr lunch)
// function calculateWorkingHours(checkIn?: string, checkOut?: string): number {
//   if (!checkIn || !checkOut) return 0;

//   const inTime = new Date(checkIn);
//   const outTime = new Date(checkOut);

//   let diffMs = outTime.getTime() - inTime.getTime();
//   if (diffMs <= 0) return 0;

//   let hours = diffMs / (1000 * 60 * 60);

//   // subtract 1 hr lunch
//   hours = Math.max(0, hours - 1);

//   return hours;
// }

// // ✅ Calculate Overtime (Total - 8 hrs - 1 hr lunch)
// function calculateOvertime(checkIn?: string, checkOut?: string): number {
//   if (!checkIn || !checkOut) return 0;

//   const inTime = new Date(checkIn);
//   const outTime = new Date(checkOut);

//   let diffMs = outTime.getTime() - inTime.getTime();
//   if (diffMs <= 0) return 0;

//   let totalHours = diffMs / (1000 * 60 * 60);

//   // subtract 1 hr lunch
//   totalHours = Math.max(0, totalHours - 1);

//   const overtime = totalHours - 8;
//   return overtime > 0 ? overtime : 0;
// }

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//   const [data, setData] = useState<Attendance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState<"daily" | "monthly" | "analytics" | "pivot">(
//     "daily"
//   );
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );

//   useEffect(() => {
//     if (view !== "daily") return; // only fetch for daily view
//     const fetchAttendance = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/attendance/list?date=${selectedDate}`);
//         const json = await res.json();
//         if (Array.isArray(json)) {
//           setData(json);
//         } else {
//           setData([]);
//         }
//       } catch (err) {
//         console.error("Failed to load attendance:", err);
//         setData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendance();
//   }, [selectedDate, view]);

//   if (loading && view === "daily")
//     return <p className="p-4">Loading attendance...</p>;

//   return (
//     <div className="p-4 space-y-4">
//       {/* 🔹 Extra Control Button Above Table */}
//       <div className="flex justify-end">
//         <Button
//           variant="outline"
//           onClick={() => alert("Export feature coming soon 🚀")}
//         >
//           Export Attendance
//         </Button>
//       </div>

//       {/* Controls */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         {/* Date Picker */}
//         {view === "daily" && (
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="px-3 py-2 border rounded text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
//           />
//         )}

//         {/* Toggle Buttons */}
//         <div className="flex gap-2">
//           {["daily", "monthly", "analytics", "pivot"].map((mode) => (
//             <button
//               key={mode}
//               onClick={() => setView(mode as any)}
//               className={`px-4 py-2 text-sm rounded shadow-sm transition ${
//                 view === mode
//                   ? "bg-blue-600 text-white font-semibold"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               {mode.charAt(0).toUpperCase() + mode.slice(1)} View
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Conditional Rendering */}
//       {view === "monthly" ? (
//         <MonthlyAttendanceTable month={selectedDate.slice(0, 7)} />
//       ) : view === "analytics" ? (
//         <AttendanceAnalyticsTable month={selectedDate.slice(0, 7)} />
//       ) : view === "pivot" ? (
//         <AttendancePivotTable month={selectedDate.slice(0, 7)} />
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full border border-gray-300 text-sm shadow-md rounded-lg overflow-hidden">
//             <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//               <tr>
//                 <th className="p-2 border">Employee</th>
//                 <th className="p-2 border">Date</th>
//                 <th className="p-2 border">Check In</th>
//                 <th className="p-2 border">Check Out</th>
//                 <th className="p-2 border">Late By</th>
//                 <th className="p-2 border">Reason</th>
//                 <th className="p-2 border">Status</th>
//                 <th className="p-2 border">Working Hours</th>
//                 <th className="p-2 border">Overtime</th>
//                 <th className="p-2 border">Remarks</th>
//               </tr>
//             </thead>
//    <tbody>
//   {data.length === 0 ? (
//     <tr>
//       <td colSpan={10} className="p-4 text-center text-gray-500">
//         No attendance records found for {selectedDate}.
//       </td>
//     </tr>
//   ) : (
//     data.map((row) => {
//       const workingHrs = calculateWorkingHours(row.checkIn, row.checkOut);
//       const overtime = calculateOvertime(row.checkIn, row.checkOut);

//       return (
//         <tr key={row.id} className="border-t hover:bg-blue-50 transition">
//           <td className="p-2 border font-medium text-gray-800">
//             {row.employeeName || row.userId}
//           </td>
//           <td className="p-2 border">{formatDate(row.date)}</td>
//           <td className="p-2 border">{formatTime(row.checkIn)}</td>
//           <td className="p-2 border">{formatTime(row.checkOut)}</td>
//           <td
//             className={`p-2 border ${
//               calculateLateBy(row.checkIn) === "On Time"
//                 ? "text-green-600 font-semibold"
//                 : "text-red-600 font-semibold"
//             }`}
//           >
//             {calculateLateBy(row.checkIn)}
//           </td>
//           <td className="p-2 border">
//             {row.checkInReason || row.checkOutReason || "-"}
//           </td>
//           <td className="p-2 border">{row.status || "-"}</td>
//           <td
//             className={`p-2 border ${
//               workingHrs >= 8
//                 ? "text-green-600 font-semibold"
//                 : "text-red-600 font-semibold"
//             }`}
//           >
//             {formatDecimalHours(workingHrs)}
//           </td>
//           <td
//             className={`p-2 border ${
//               overtime > 0 ? "text-blue-600 font-semibold" : "text-gray-600"
//             }`}
//           >
//             {formatDecimalHours(overtime)}
//           </td>
//           <td className="p-2 border">
//             {row.remarks?.trim() || "-"}
//           </td>
//         </tr>
//       );
//     })
//   )}
// </tbody>


//           </table>
//         </div>
//       )}
//     </div>
//   );
// }











// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion"; // For animations
// import MonthlyAttendanceTable from "./MonthlyAttendanceTable";
// import AttendanceAnalyticsTable from "./AttendanceAnalyticsTable";
// import AttendancePivotTable from "./AttendancePivotTable";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { CheckCircle, XCircle, Clock, UserMinus, ArrowUpCircle } from "lucide-react";

// interface Attendance {
//   id: string;
//   userId: string;
//   employeeName?: string;
//   faceImage?: string;
//   location?: string;
//   deviceInfo?: string;
//   checkIn?: string;
//   checkOut?: string;
//   checkInReason?: string;
//   checkOutReason?: string;
//   date: string;
//   status?: string;
//   verified?: boolean;
//   remarks?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // -------------------- Helpers (unchanged for now) --------------------
// function formatDate(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     const weekday = date.toLocaleString("en-US", { weekday: "short" });
//     const day = date.getDate();
//     const month = date.toLocaleString("en-US", { month: "short" });
//     const year = date.getFullYear();
//     return `${weekday}, ${day} ${month}, ${year}`;
//   } catch {
//     return dateString;
//   }
// }

// function formatTime(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     let hour = date.getHours();
//     const minutes = date.getMinutes().toString().padStart(2, "0");
//     const suffix = hour >= 12 ? "PM" : "AM";
//     hour = hour % 12 || 12;
//     return `${hour}:${minutes} ${suffix}`;
//   } catch {
//     return dateString;
//   }
// }

// function formatDecimalHours(decimalHours?: number): string {
//   if (decimalHours == null) return "-";
//   const hrs = Math.floor(decimalHours);
//   const mins = Math.round((decimalHours - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// function calculateLateBy(checkIn?: string): string {
//   if (!checkIn) return "-";
//   const actualCheckIn = new Date(checkIn);
//   const officeStart = new Date(checkIn);
//   officeStart.setHours(10, 0, 0, 0);

//   if (actualCheckIn <= officeStart) return "On Time";

//   const diffMs = actualCheckIn.getTime() - officeStart.getTime();
//   const diffMins = Math.floor(diffMs / 60000);
//   const hrs = Math.floor(diffMins / 60);
//   const mins = diffMins % 60;

//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "-";
// }

// function calculateWorkingHours(checkIn?: string, checkOut?: string): number {
//   if (!checkIn || !checkOut) return 0;
//   const inTime = new Date(checkIn);
//   const outTime = new Date(checkOut);
//   let diffMs = outTime.getTime() - inTime.getTime();
//   if (diffMs <= 0) return 0;
//   let hours = diffMs / (1000 * 60 * 60);
//   hours = Math.max(0, hours - 1);
//   return hours;
// }

// function calculateOvertime(checkIn?: string, checkOut?: string): number {
//   if (!checkIn || !checkOut) return 0;
//   const inTime = new Date(checkIn);
//   const outTime = new Date(checkOut);
//   let diffMs = outTime.getTime() - inTime.getTime();
//   if (diffMs <= 0) return 0;
//   let totalHours = diffMs / (1000 * 60 * 60);
//   totalHours = Math.max(0, totalHours - 1);
//   const overtime = totalHours - 8;
//   return overtime > 0 ? overtime : 0;
// }

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//   const [data, setData] = useState<Attendance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState<"daily" | "monthly" | "analytics" | "pivot">(
//     "daily"
//   );
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );

//   useEffect(() => {
//     if (view !== "daily") return;
//     const fetchAttendance = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/attendance/list?date=${selectedDate}`);
//         const json = await res.json();
//         if (Array.isArray(json)) {
//           setData(json);
//         } else {
//           setData([]);
//         }
//       } catch (err) {
//         console.error("Failed to load attendance:", err);
//         setData([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAttendance();
//   }, [selectedDate, view]);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header and Controls */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//         <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
//           Attendance Dashboard 📅
//         </h1>
//         <div className="flex items-center gap-4 flex-wrap">
//           {view === "daily" && (
//             <Input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="w-[180px]"
//             />
//           )}
//           <Select value={view} onValueChange={(value: any) => setView(value)}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select View" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="daily">Daily View</SelectItem>
//               <SelectItem value="monthly">Monthly View</SelectItem>
//               <SelectItem value="analytics">Analytics View</SelectItem>
//               <SelectItem value="pivot">Pivot View</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button>Export</Button>
//         </div>
//       </div>

//       {loading && view === "daily" ? (
//         <div className="flex items-center justify-center p-12">
//           <svg
//             className="animate-spin h-8 w-8 text-blue-500"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             ></path>
//           </svg>
//           <p className="ml-4 text-gray-600">Loading attendance...</p>
//         </div>
//       ) : (
//         <motion.div
//           key={view}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="space-y-6"
//         >
//           {view === "monthly" ? (
//             <MonthlyAttendanceTable month={selectedDate.slice(0, 7)} />
//           ) : view === "analytics" ? (
//             <AttendanceAnalyticsTable month={selectedDate.slice(0, 7)} />
//           ) : view === "pivot" ? (
//             <AttendancePivotTable month={selectedDate.slice(0, 7)} />
//           ) : (
//             <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//               <div className="overflow-x-auto relative">
//                 <table className="min-w-full text-sm divide-y divide-gray-200">
//                   <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Late By</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Working Hours</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overtime</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {data.length === 0 ? (
//                       <tr>
//                         <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
//                           No attendance records found for {selectedDate}.
//                         </td>
//                       </tr>
//                     ) : (
//                       data.map((row) => {
//                         const workingHrs = calculateWorkingHours(row.checkIn, row.checkOut);
//                         const overtime = calculateOvertime(row.checkIn, row.checkOut);
//                         const lateBy = calculateLateBy(row.checkIn);
//                         return (
//                           <tr key={row.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                               {row.employeeName || row.userId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatDate(row.date)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatTime(row.checkIn)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatTime(row.checkOut)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                               {lateBy !== "On Time" && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                                   <Clock className="w-3 h-3" />
//                                   <span>{lateBy}</span>
//                                 </span>
//                               )}
//                               {lateBy === "On Time" && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                   <CheckCircle className="w-3 h-3" />
//                                   <span>On Time</span>
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {row.checkInReason || row.checkOutReason || "-"}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                               <div className="flex items-center justify-start gap-2">
//                                 {row.status === "Present" && <CheckCircle className="text-green-500 w-5 h-5" />}
//                                 {row.status === "Absent" && <XCircle className="text-red-500 w-5 h-5" />}
//                                 {row.status === "Half-Day" && <UserMinus className="text-orange-500 w-5 h-5" />}
//                                 {row.status === "Leave" && <XCircle className="text-yellow-500 w-5 h-5" />}
//                                 <span className={`inline-flex px-2 py-1 leading-tight rounded-full text-xs font-medium ${
//                                   row.status === "Present" ? "bg-green-100 text-green-800" :
//                                   row.status === "Leave" ? "bg-yellow-100 text-yellow-800" :
//                                   row.status === "Half-Day" ? "bg-orange-100 text-orange-800" :
//                                   "bg-gray-100 text-gray-800"
//                                 }`}>
//                                   {row.status || "N/A"}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                               <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
//                                 workingHrs >= 8 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                               }`}>
//                                 {formatDecimalHours(workingHrs)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                               {overtime > 0 ? (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                   <ArrowUpCircle className="w-3 h-3" />
//                                   <span>{formatDecimalHours(overtime)}</span>
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-500">-</span>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               <span title={row.remarks}>
//                                 {row.remarks && row.remarks.length > 20
//                                   ? `${row.remarks.slice(0, 20)}...`
//                                   : row.remarks || "-"}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </div>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion"; // For animations
// import MonthlyAttendanceTable from "./MonthlyAttendanceTable";
// import AttendanceAnalyticsTable from "./AttendanceAnalyticsTable";
// import AttendancePivotTable from "./AttendancePivotTable";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { CheckCircle, XCircle, Clock, UserMinus, ArrowUpCircle } from "lucide-react";

// interface Attendance {
//   id: string;
//   userId: string;
//   employeeName?: string;
//   faceImage?: string;
//   location?: string;
//   deviceInfo?: string;
//   checkIn?: string;
//   checkOut?: string;
//   checkInReason?: string;
//   checkOutReason?: string;
//   date: string;
//   status?: string;
//   verified?: boolean;
//   remarks?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // -------------------- Helpers --------------------
// //✅ Display date in IST correctly
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

// function formatTime(dateString?: string): string {
//   if (!dateString) return "-";
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//       timeZone: "Asia/Kolkata",
//     });
//   } catch {
//     return dateString;
//   }
// }
// // Decrease date by 1 day and format in IST
// // function formatDateMinusOne(dateString?: string): string {
// //   if (!dateString) return "-";
// //   try {
// //     const [year, month, yday] = dateString.split("-").map(Number);
// //     const date = new Date(year, month - 1, day);
// //     // Decrease 1 day
// //     date.setDate(date.getDate() - 1);

// //     return date.toLocaleDateString("en-US", {
// //       weekday: "short",
// //       day: "numeric",
// //       month: "short",
// //       year: "numeric",
// //       timeZone: "Asia/Kolkata",
// //     });
// //   } catch {
// //     return dateString;
// //   }
// // }

// // // Format checkIn/checkOut times in IST (optional, no change)
// // function formatTime(dateString?: string): string {
// //   if (!dateString) return "-";
// //   try {
// //     const date = new Date(dateString);
// //     return date.toLocaleTimeString("en-US", {
// //       hour: "2-digit",
// //       minute: "2-digit",
// //       hour12: true,
// //       timeZone: "Asia/Kolkata",
// //     });
// //   } catch {
// //     return dateString;
// //   }
// // }


// function formatDecimalHours(decimalHours?: number): string {
//   if (decimalHours == null) return "-";
//   const hrs = Math.floor(decimalHours);
//   const mins = Math.round((decimalHours - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// function calculateLateBy(checkIn?: string): string {
//   if (!checkIn) return "-";
//   const actualCheckIn = new Date(checkIn);
//   const officeStart = new Date(checkIn);
//   officeStart.setHours(10, 0, 0, 0);

//   if (actualCheckIn <= officeStart) return "On Time";

//   const diffMs = actualCheckIn.getTime() - officeStart.getTime();
//   const diffMins = Math.floor(diffMs / 60000);
//   const hrs = Math.floor(diffMins / 60);
//   const mins = diffMins % 60;

//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "-";
// }

// function calculateWorkingHours(checkIn?: string, checkOut?: string): number {
//   if (!checkIn || !checkOut) return 0;
//   const inTime = new Date(checkIn);
//   const outTime = new Date(checkOut);
//   let diffMs = outTime.getTime() - inTime.getTime();
//   if (diffMs <= 0) return 0;
//   let hours = diffMs / (1000 * 60 * 60);
//   hours = Math.max(0, hours - 1); // 1 hour break
//   return hours;
// }

// function calculateOvertime(checkIn?: string, checkOut?: string): number {
//   if (!checkIn || !checkOut) return 0;
//   const inTime = new Date(checkIn);
//   const outTime = new Date(checkOut);
//   let diffMs = outTime.getTime() - inTime.getTime();
//   if (diffMs <= 0) return 0;
//   let totalHours = diffMs / (1000 * 60 * 60);
//   totalHours = Math.max(0, totalHours - 1); // 1 hour break
//   const overtime = totalHours - 8;
//   return overtime > 0 ? overtime : 0;
// }

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//   const [data, setData] = useState<Attendance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState<"daily" | "monthly" | "analytics" | "pivot">(
//     "daily"
//   );
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );

//   useEffect(() => {
//     if (view !== "daily") return;
//     const fetchAttendance = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/attendance/list?date=${selectedDate}`);
//         const json = await res.json();
//         if (Array.isArray(json)) {
//           setData(json);
//         } else {
//           setData([]);
//         }
//       } catch (err) {
//         console.error("Failed to load attendance:", err);
//         setData([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAttendance();
//   }, [selectedDate, view]);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header and Controls */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//         <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
//           Attendance Dashboard 📅
//         </h1>
//         <div className="flex items-center gap-4 flex-wrap">
//           {view === "daily" && (
//             <Input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="w-[180px]"
//             />
//           )}
//           <Select value={view} onValueChange={(value: any) => setView(value)}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select View" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="daily">Daily View</SelectItem>
//               <SelectItem value="monthly">Monthly View</SelectItem>
//               <SelectItem value="analytics">Analytics View</SelectItem>
//               <SelectItem value="pivot">Pivot View</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button>Export</Button>
//         </div>
//       </div>

//       {loading && view === "daily" ? (
//         <div className="flex items-center justify-center p-12">
//           <svg
//             className="animate-spin h-8 w-8 text-blue-500"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             ></path>
//           </svg>
//           <p className="ml-4 text-gray-600">Loading attendance...</p>
//         </div>
//       ) : (
//         <motion.div
//           key={view}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="space-y-6"
//         >
//           {view === "monthly" ? (
//             <MonthlyAttendanceTable month={selectedDate.slice(0, 7)} />
//           ) : view === "analytics" ? (
//             <AttendanceAnalyticsTable month={selectedDate.slice(0, 7)} />
//           ) : view === "pivot" ? (
//             <AttendancePivotTable month={selectedDate.slice(0, 7)} />
//           ) : (
//             <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//               <div className="overflow-x-auto relative">
//                 <table className="min-w-full text-sm divide-y divide-gray-200">
//                   <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Late By</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Working Hours</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overtime</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {data.length === 0 ? (
//                       <tr>
//                         <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
//                           No attendance records found for {selectedDate}.
//                         </td>
//                       </tr>
//                     ) : (
//                       data.map((row) => {
//                         const workingHrs = calculateWorkingHours(row.checkIn, row.checkOut);
//                         const overtime = calculateOvertime(row.checkIn, row.checkOut);
//                         const lateBy = calculateLateBy(row.checkIn);
//                         return (
//                           <tr key={row.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                               {row.employeeName || row.userId}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatDate(row.date)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatTime(row.checkIn)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatTime(row.checkOut)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                               {lateBy !== "On Time" && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                                   <Clock className="w-3 h-3" />
//                                   <span>{lateBy}</span>
//                                 </span>
//                               )}
//                               {lateBy === "On Time" && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                   <CheckCircle className="w-3 h-3" />
//                                   <span>On Time</span>
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {row.checkInReason || row.checkOutReason || "-"}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                               <div className="flex items-center justify-start gap-2">
//                                 {row.status === "Present" && <CheckCircle className="text-green-500 w-5 h-5" />}
//                                 {row.status === "Absent" && <XCircle className="text-red-500 w-5 h-5" />}
//                                 {row.status === "Half-Day" && <UserMinus className="text-orange-500 w-5 h-5" />}
//                                 {row.status === "Leave" && <XCircle className="text-yellow-500 w-5 h-5" />}
//                                 <span className={`inline-flex px-2 py-1 leading-tight rounded-full text-xs font-medium ${
//                                   row.status === "Present" ? "bg-green-100 text-green-800" :
//                                   row.status === "Leave" ? "bg-yellow-100 text-yellow-800" :
//                                   row.status === "Half-Day" ? "bg-orange-100 text-orange-800" :
//                                   "bg-gray-100 text-gray-800"
//                                 }`}>
//                                   {row.status || "N/A"}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                               <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
//                                 workingHrs >= 8 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                               }`}>
//                                 {formatDecimalHours(workingHrs)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                               {overtime > 0 ? (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                   <ArrowUpCircle className="w-3 h-3" />
//                                   <span>{formatDecimalHours(overtime)}</span>
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-500">-</span>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               <span title={row.remarks}>
//                                 {row.remarks && row.remarks.length > 20
//                                   ? `${row.remarks.slice(0, 20)}...`
//                                   : row.remarks || "-"}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </div>
//   );
// }









"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // For animations
import MonthlyAttendanceTable from "./MonthlyAttendanceTable";
import AttendanceAnalyticsTable from "./AttendanceAnalyticsTable";
import AttendancePivotTable from "./AttendancePivotTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, UserMinus, ArrowUpCircle } from "lucide-react";

interface Attendance {
  id: string;
  userId: string;
  employeeName?: string;
  faceImage?: string;
  location?: string;
  deviceInfo?: string;
  checkIn?: string;
  checkOut?: string;
  checkInReason?: string;
  checkOutReason?: string;
  date: string;
  status?: string;
  verified?: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Helpers --------------------
// Display date in IST and decrease by 1 day
function formatDateMinusOne(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1); // Decrease by 1 day
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return dateString;
  }
}

// Format checkIn/checkOut times in IST
function formatTime(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return dateString;
  }
}

function formatDecimalHours(decimalHours?: number): string {
  if (decimalHours == null) return "-";
  const hrs = Math.floor(decimalHours);
  const mins = Math.round((decimalHours - hrs) * 60);
  if (hrs && mins) return `${hrs} hr ${mins} min`;
  if (hrs) return `${hrs} hr`;
  if (mins) return `${mins} min`;
  return "0 min";
}

function calculateLateBy(checkIn?: string): string {
  if (!checkIn) return "-";
  const actualCheckIn = new Date(checkIn);
  const officeStart = new Date(checkIn);
  officeStart.setHours(10, 0, 0, 0);

  if (actualCheckIn <= officeStart) return "On Time";

  const diffMs = actualCheckIn.getTime() - officeStart.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hrs && mins) return `${hrs} hr ${mins} min`;
  if (hrs) return `${hrs} hr`;
  if (mins) return `${mins} min`;
  return "-";
}

function calculateWorkingHours(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const inTime = new Date(checkIn);
  const outTime = new Date(checkOut);
  let diffMs = outTime.getTime() - inTime.getTime();
  if (diffMs <= 0) return 0;
  let hours = diffMs / (1000 * 60 * 60);
  hours = Math.max(0, hours - 1); // 1 hour break
  return hours;
}

function calculateOvertime(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const inTime = new Date(checkIn);
  const outTime = new Date(checkOut);
  let diffMs = outTime.getTime() - inTime.getTime();
  if (diffMs <= 0) return 0;
  let totalHours = diffMs / (1000 * 60 * 60);
  totalHours = Math.max(0, totalHours - 1); // 1 hour break
  const overtime = totalHours - 8;
  return overtime > 0 ? overtime : 0;
}

// -------------------- Component --------------------
export default function AttendanceTable() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"daily" | "monthly" | "analytics" | "pivot">("daily");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (view !== "daily") return;
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/list?date=${selectedDate}`);
        const json = await res.json();
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Failed to load attendance:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedDate, view]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Attendance Dashboard 📅
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          {view === "daily" && (
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[180px]"
            />
          )}
          <Select value={view} onValueChange={(value: any) => setView(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
              <SelectItem value="analytics">Analytics View</SelectItem>
              <SelectItem value="pivot">Pivot View</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export</Button>
        </div>
      </div>

      {loading && view === "daily" ? (
        <div className="flex items-center justify-center p-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="ml-4 text-gray-600">Loading attendance...</p>
        </div>
      ) : (
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {view === "monthly" ? (
            <MonthlyAttendanceTable month={selectedDate.slice(0, 7)} />
          ) : view === "analytics" ? (
            <AttendanceAnalyticsTable month={selectedDate.slice(0, 7)} />
          ) : view === "pivot" ? (
            <AttendancePivotTable month={selectedDate.slice(0, 7)} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto relative">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Late By</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Working Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overtime</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                          No attendance records found for {selectedDate}.
                        </td>
                      </tr>
                    ) : (
                      data.map((row) => {
                        const workingHrs = calculateWorkingHours(row.checkIn, row.checkOut);
                        const overtime = calculateOvertime(row.checkIn, row.checkOut);
                        const lateBy = calculateLateBy(row.checkIn);
                        return (
                          <tr key={row.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.employeeName || row.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateMinusOne(row.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(row.checkIn)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(row.checkOut)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {lateBy !== "On Time" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <Clock className="w-3 h-3" />
                                  <span>{lateBy}</span>
                                </span>
                              )}
                              {lateBy === "On Time" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>On Time</span>
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {row.checkInReason || row.checkOutReason || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center justify-start gap-2">
                                {row.status === "Present" && <CheckCircle className="text-green-500 w-5 h-5" />}
                                {row.status === "Absent" && <XCircle className="text-red-500 w-5 h-5" />}
                                {row.status === "Half-Day" && <UserMinus className="text-orange-500 w-5 h-5" />}
                                {row.status === "Leave" && <XCircle className="text-yellow-500 w-5 h-5" />}
                                <span className={`inline-flex px-2 py-1 leading-tight rounded-full text-xs font-medium ${
                                  row.status === "Present" ? "bg-green-100 text-green-800" :
                                  row.status === "Leave" ? "bg-yellow-100 text-yellow-800" :
                                  row.status === "Half-Day" ? "bg-orange-100 text-orange-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {row.status || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                workingHrs >= 8 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {formatDecimalHours(workingHrs)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                              {overtime > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <ArrowUpCircle className="w-3 h-3" />
                                  <span>{formatDecimalHours(overtime)}</span>
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span title={row.remarks}>
                                {row.remarks && row.remarks.length > 20
                                  ? `${row.remarks.slice(0, 20)}...`
                                  : row.remarks || "-"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

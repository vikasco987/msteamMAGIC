// "use client";

// import { useEffect, useState } from "react";
// import { CheckCircle, XCircle, UserMinus, Clock, ArrowUpCircle } from "lucide-react";

// interface AttendanceRecord {
//   date: string; // UTC string
//   checkIn?: string;
//   checkOut?: string;
//   status: "Present" | "Absent" | "Leave" | "Half-Day";
//   lateBy?: string; // e.g., "10 min"
//   workingHours?: number; // in decimal hours
//   overtime?: number; // in decimal hours
//   remarks?: string;
// }

// // -------------------- Helpers --------------------
// // Convert UTC to IST
// function toIST(dateString?: string) {
//   if (!dateString) return null;
//   const date = new Date(dateString);
//   return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
// }

// // Format date
// function formatDate(dateString?: string) {
//   const date = toIST(dateString);
//   if (!date) return "-";
//   return date.toLocaleDateString("en-IN", {
//     weekday: "short",
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });
// }

// // Format time
// function formatTime(dateString?: string) {
//   const date = toIST(dateString);
//   if (!date) return "-";
//   return date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// }

// // Format decimal hours to "X hr Y min"
// function formatDecimalHours(decimal?: number) {
//   if (!decimal) return "-";
//   const hrs = Math.floor(decimal);
//   const mins = Math.round((decimal - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// // -------------------- Component --------------------
// export default function DailyAttendanceTable() {
//   const [records, setRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Replace this with your API call to fetch the employee's monthly attendance
//   useEffect(() => {
//     async function fetchAttendance() {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/attendance/employee/monthly"); // Example endpoint
//         const data: AttendanceRecord[] = await res.json();
//         setRecords(data);
//       } catch (err) {
//         console.error("Failed to fetch attendance", err);
//         setRecords([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchAttendance();
//   }, []);

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">My Attendance 📅</h1>

//       {loading ? (
//         <p>Loading attendance...</p>
//       ) : records.length === 0 ? (
//         <p>No attendance records found for this month.</p>
//       ) : (
//         <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
//           <table className="min-w-full text-sm border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 <th className="px-4 py-2 border">Date</th>
//                 <th className="px-4 py-2 border">Check-In</th>
//                 <th className="px-4 py-2 border">Check-Out</th>
//                 <th className="px-4 py-2 border">Status</th>
//                 <th className="px-4 py-2 border">Late By</th>
//                 <th className="px-4 py-2 border">Working Hours</th>
//                 <th className="px-4 py-2 border">Overtime</th>
//                 <th className="px-4 py-2 border">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((rec, idx) => (
//                 <tr
//                   key={idx}
//                   className={idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
//                 >
//                   <td className="px-4 py-2 border text-center">{formatDate(rec.date)}</td>
//                   <td className="px-4 py-2 border text-center">{formatTime(rec.checkIn)}</td>
//                   <td className="px-4 py-2 border text-center">{formatTime(rec.checkOut)}</td>
//                   <td className="px-4 py-2 border text-center">
//                     <span
//                       className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                         rec.status === "Present"
//                           ? "bg-green-100 text-green-800"
//                           : rec.status === "Absent"
//                           ? "bg-red-100 text-red-800"
//                           : rec.status === "Leave"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-orange-100 text-orange-800"
//                       }`}
//                     >
//                       {rec.status === "Present" && <CheckCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Absent" && <XCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Leave" && <CheckCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Half-Day" && <UserMinus className="w-3 h-3 mr-1" />}
//                       {rec.status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2 border text-center">{rec.lateBy || "-"}</td>
//                   <td className="px-4 py-2 border text-center">{formatDecimalHours(rec.workingHours)}</td>
//                   <td className="px-4 py-2 border text-center">{formatDecimalHours(rec.overtime)}</td>
//                   <td className="px-4 py-2 border text-center">{rec.remarks || "-"}</td>
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
// import { CheckCircle, XCircle, UserMinus } from "lucide-react";
// import { useUser } from "@clerk/nextjs";

// // Attendance record interface
// interface AttendanceRecord {
//   date: string; // UTC string
//   checkIn?: string;
//   checkOut?: string;
//   status: "Present" | "Absent" | "Leave" | "Half-Day";
//   lateBy?: string;
//   workingHours?: number;
//   overtime?: number;
//   remarks?: string;
//   employeeName?: string;
// }

// // -------------------- Helpers --------------------
// function toIST(dateString?: string) {
//   if (!dateString) return null;
//   const date = new Date(dateString);
//   return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
// }

// function formatDate(dateString?: string) {
//   const date = toIST(dateString);
//   if (!date) return "-";
//   return date.toLocaleDateString("en-IN", {
//     weekday: "short",
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });
// }

// function formatTime(dateString?: string) {
//   const date = toIST(dateString);
//   if (!date) return "-";
//   return date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// }

// function formatDecimalHours(decimal?: number) {
//   if (!decimal) return "-";
//   const hrs = Math.floor(decimal);
//   const mins = Math.round((decimal - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//   const { user, isLoaded } = useUser();
//   const [records, setRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filterDate, setFilterDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   ); // default today

//   // Don't render until Clerk user is loaded
//   if (!isLoaded) return null;
//   if (!user) return <p>Please log in to view your attendance.</p>;

//   const fetchAttendance = async () => {
//     setLoading(true);
//     try {
//       // Fetch attendance only for logged-in user
//       const res = await fetch(
//         `/api/attendance?userId=${user.id}&date=${filterDate}`
//       );
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const data = await res.json();

//       // Flatten rows for table
//       const flatRecords: AttendanceRecord[] = [];
//       data.rows.forEach((row: any) => {
//         data.headers.slice(1, -1).forEach((day: string) => {
//           flatRecords.push({
//             date: new Date(
//               Number(filterDate.split("-")[0]),
//               Number(filterDate.split("-")[1]) - 1,
//               Number(day)
//             ).toISOString(),
//             status:
//               row[day] === "✅"
//                 ? "Present"
//                 : row[day] === "❌"
//                 ? "Absent"
//                 : row[day] === "⏳"
//                 ? "Half-Day"
//                 : "Leave",
//             employeeName: row.Employee,
//             checkIn: row[`${day}_checkIn`],
//             checkOut: row[`${day}_checkOut`],
//             lateBy: row[`${day}_lateBy`],
//             workingHours: row[`${day}_workingHours`],
//             overtime: row[`${day}_overtime`],
//             remarks: row[`${day}_remarks`],
//           });
//         });
//       });

//       setRecords(flatRecords);
//     } catch (err) {
//       console.error("Failed to fetch attendance", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [filterDate, user.id]);

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Attendance 📅</h1>
//         <input
//           type="date"
//           value={filterDate}
//           onChange={(e) => setFilterDate(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>

//       {loading ? (
//         <p>Loading attendance...</p>
//       ) : records.length === 0 ? (
//         <p>No attendance records found for this date/month/year.</p>
//       ) : (
//         <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
//           <table className="min-w-full text-sm border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 <th className="px-4 py-2 border">Date</th>
//                 <th className="px-4 py-2 border">Employee</th>
//                 <th className="px-4 py-2 border">Check-In</th>
//                 <th className="px-4 py-2 border">Check-Out</th>
//                 <th className="px-4 py-2 border">Status</th>
//                 <th className="px-4 py-2 border">Late By</th>
//                 <th className="px-4 py-2 border">Working Hours</th>
//                 <th className="px-4 py-2 border">Overtime</th>
//                 <th className="px-4 py-2 border">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((rec, idx) => (
//                 <tr
//                   key={idx}
//                   className={
//                     idx % 2 === 0
//                       ? "bg-gray-50 hover:bg-gray-100"
//                       : "bg-white hover:bg-gray-100"
//                   }
//                 >
//                   <td className="px-4 py-2 border text-center">{formatDate(rec.date)}</td>
//                   <td className="px-4 py-2 border text-center">{rec.employeeName}</td>
//                   <td className="px-4 py-2 border text-center">{formatTime(rec.checkIn)}</td>
//                   <td className="px-4 py-2 border text-center">{formatTime(rec.checkOut)}</td>
//                   <td className="px-4 py-2 border text-center">
//                     <span
//                       className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                         rec.status === "Present"
//                           ? "bg-green-100 text-green-800"
//                           : rec.status === "Absent"
//                           ? "bg-red-100 text-red-800"
//                           : rec.status === "Leave"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-orange-100 text-orange-800"
//                       }`}
//                     >
//                       {rec.status === "Present" && <CheckCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Absent" && <XCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Half-Day" && <UserMinus className="w-3 h-3 mr-1" />}
//                       {rec.status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2 border text-center">{rec.lateBy || "-"}</td>
//                   <td className="px-4 py-2 border text-center">{formatDecimalHours(rec.workingHours)}</td>
//                   <td className="px-4 py-2 border text-center">{formatDecimalHours(rec.overtime)}</td>
//                   <td className="px-4 py-2 border text-center">{rec.remarks || "-"}</td>
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
// import { CheckCircle, XCircle, UserMinus } from "lucide-react";
// import { useUser, useAuth } from "@clerk/nextjs";

// // Attendance record interface
// interface AttendanceRecord {
//   date: string; // UTC string
//   checkIn?: string;
//   checkOut?: string;
//   status: "Present" | "Absent" | "Leave" | "Half-Day";
//   lateBy?: string;
//   workingHours?: number;
//   overtime?: number;
//   remarks?: string;
//   employeeName?: string;
// }

// // -------------------- Helpers --------------------
// function toIST(dateString?: string) {
//   if (!dateString) return null;
//   const date = new Date(dateString);
//   return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
// }

// function formatDate(dateString?: string) {
//   const date = toIST(dateString);
//   if (!date) return "-";
//   return date.toLocaleDateString("en-IN", {
//     weekday: "short",
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });
// }

// function formatTime(dateString?: string) {
//   const date = toIST(dateString);
//   if (!date) return "-";
//   return date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// }

// function formatDecimalHours(decimal?: number) {
//   if (!decimal) return "-";
//   const hrs = Math.floor(decimal);
//   const mins = Math.round((decimal - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//   const { user, isLoaded } = useUser();
//   const { getToken } = useAuth();
//   const [records, setRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filterMonth, setFilterMonth] = useState<string>(
//     `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
//   );

//   // Don't render until Clerk user is loaded
//   if (!isLoaded) return null;
//   if (!user) return <p>Please log in to view your attendance.</p>;

//   const fetchAttendance = async () => {
//     setLoading(true);
//     try {
//       const token = await getToken(); // Clerk token

//       const res = await fetch(`/api/attendance/monthly?month=${filterMonth}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const data = await res.json();

//       // Flatten rows for table
//       const flatRecords: AttendanceRecord[] = [];
//       data.rows.forEach((row: any) => {
//         data.headers.slice(1, -1).forEach((day: string) => {
//           flatRecords.push({
//             date: new Date(
//               Number(filterMonth.split("-")[0]),
//               Number(filterMonth.split("-")[1]) - 1,
//               Number(day)
//             ).toISOString(),
//             status:
//               row[day] === "✅"
//                 ? "Present"
//                 : row[day] === "❌"
//                 ? "Absent"
//                 : row[day] === "⏳"
//                 ? "Half-Day"
//                 : "Leave",
//             employeeName: row.Employee,
//             checkIn: row[`${day}_checkIn`],
//             checkOut: row[`${day}_checkOut`],
//             lateBy: row[`${day}_lateBy`],
//             workingHours: row[`${day}_workingHours`],
//             overtime: row[`${day}_overtime`],
//             remarks: row[`${day}_remarks`],
//           });
//         });
//       });

//       setRecords(flatRecords);
//     } catch (err) {
//       console.error("Failed to fetch attendance", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [filterMonth, user.id]);

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">My Attendance 📅</h1>
//         <input
//           type="month"
//           value={filterMonth}
//           onChange={(e) => setFilterMonth(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>

//       {loading ? (
//         <p>Loading attendance...</p>
//       ) : records.length === 0 ? (
//         <p>No attendance records found for this month.</p>
//       ) : (
//         <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
//           <table className="min-w-full text-sm border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 <th className="px-4 py-2 border">Date</th>
//                 <th className="px-4 py-2 border">Employee</th>
//                 <th className="px-4 py-2 border">Check-In</th>
//                 <th className="px-4 py-2 border">Check-Out</th>
//                 <th className="px-4 py-2 border">Status</th>
//                 <th className="px-4 py-2 border">Late By</th>
//                 <th className="px-4 py-2 border">Working Hours</th>
//                 <th className="px-4 py-2 border">Overtime</th>
//                 <th className="px-4 py-2 border">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((rec, idx) => (
//                 <tr
//                   key={idx}
//                   className={
//                     idx % 2 === 0
//                       ? "bg-gray-50 hover:bg-gray-100"
//                       : "bg-white hover:bg-gray-100"
//                   }
//                 >
//                   <td className="px-4 py-2 border text-center">{formatDate(rec.date)}</td>
//                   <td className="px-4 py-2 border text-center">{rec.employeeName}</td>
//                   <td className="px-4 py-2 border text-center">{formatTime(rec.checkIn)}</td>
//                   <td className="px-4 py-2 border text-center">{formatTime(rec.checkOut)}</td>
//                   <td className="px-4 py-2 border text-center">
//                     <span
//                       className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                         rec.status === "Present"
//                           ? "bg-green-100 text-green-800"
//                           : rec.status === "Absent"
//                           ? "bg-red-100 text-red-800"
//                           : rec.status === "Leave"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-orange-100 text-orange-800"
//                       }`}
//                     >
//                       {rec.status === "Present" && <CheckCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Absent" && <XCircle className="w-3 h-3 mr-1" />}
//                       {rec.status === "Half-Day" && <UserMinus className="w-3 h-3 mr-1" />}
//                       {rec.status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2 border text-center">{rec.lateBy || "-"}</td>
//                   <td className="px-4 py-2 border text-center">{formatDecimalHours(rec.workingHours)}</td>
//                   <td className="px-4 py-2 border text-center">{formatDecimalHours(rec.overtime)}</td>
//                   <td className="px-4 py-2 border text-center">{rec.remarks || "-"}</td>
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
// import { useUser, useAuth } from "@clerk/nextjs";

// interface AttendanceRecord {
//   date: string;
//   checkIn?: string;
//   checkOut?: string;
//   status?: "Present" | "Absent" | "Leave" | "Half-Day";
//   verified?: boolean;
//   remarks?: string;
//   employeeName?: string;
// }

// // -------------------- Helpers --------------------
// function formatDate(dateString?: string) {
//   if (!dateString) return "-";
//   return new Date(dateString).toLocaleDateString("en-IN", {
//     weekday: "short",
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });
// }

// function formatTime(dateString?: string) {
//   if (!dateString) return "-";
//   return new Date(dateString).toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// }

// function formatDecimalHours(decimal?: number) {
//   if (!decimal) return "-";
//   const hrs = Math.floor(decimal);
//   const mins = Math.round((decimal - hrs) * 60);
//   if (hrs && mins) return `${hrs} hr ${mins} min`;
//   if (hrs) return `${hrs} hr`;
//   if (mins) return `${mins} min`;
//   return "0 min";
// }

// // -------------------- Calculations --------------------
// function calcLate(checkIn?: string) {
//   if (!checkIn) return 0;
//   const checkDate = new Date(checkIn);
//   const tenAM = new Date(checkDate);
//   tenAM.setHours(10, 0, 0, 0);
//   return checkDate > tenAM ? (checkDate.getTime() - tenAM.getTime()) / (1000 * 60 * 60) : 0;
// }

// function calcEarlyCheckout(checkOut?: string) {
//   if (!checkOut) return 0;
//   const checkDate = new Date(checkOut);
//   const sevenPM = new Date(checkDate);
//   sevenPM.setHours(19, 0, 0, 0);
//   return checkDate < sevenPM ? (sevenPM.getTime() - checkDate.getTime()) / (1000 * 60 * 60) : 0;
// }

// function calcWorkingHours(checkIn?: string, checkOut?: string) {
//   if (!checkIn || !checkOut) return 0;
//   const start = new Date(checkIn).getTime();
//   const end = new Date(checkOut).getTime();
//   let hours = (end - start) / (1000 * 60 * 60);
//   if (hours > 1) hours -= 1; // subtract 1 hr lunch
//   return hours;
// }

// function calcOvertime(hours: number) {
//   return hours > 8 ? hours - 8 : 0;
// }

// function calcDayType(checkIn?: string, checkOut?: string, hours?: number) {
//   if (!checkIn) return "Absent";
//   if (!checkOut) return "Half-Day";
//   if (!hours || hours < 6) return "Half-Day";
//   return "Full Day";
// }

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//   const { user, isLoaded } = useUser();
//   const { getToken } = useAuth();
//   const [records, setRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filterMonth, setFilterMonth] = useState<string>(
//     `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
//   );

//   if (!isLoaded) return null;
//   if (!user) return <p>Please log in to view your attendance.</p>;

//   const fetchAttendance = async () => {
//     setLoading(true);
//     try {
//       const token = await getToken();
//       const res = await fetch(`/api/attendance/monthly?month=${filterMonth}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
//       const data: AttendanceRecord[] = await res.json();
//       const enriched = data.map((rec) => ({
//         ...rec,
//         employeeName: user.fullName || user.username,
//       }));
//       setRecords(enriched);
//     } catch (err) {
//       console.error("Failed to fetch attendance", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [filterMonth, user.id]);

//   // -------------------- Totals --------------------
//   const year = Number(filterMonth.split("-")[0]);
//   const month = Number(filterMonth.split("-")[1]);
//   const today = new Date();
//   const totalDaysInMonth = new Date(year, month, 0).getDate();
//   const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

//   const passedDays = isCurrentMonth ? today.getDate() : totalDaysInMonth;

//   const totals = records.reduce(
//     (acc, rec) => {
//       const workingHrs = calcWorkingHours(rec.checkIn, rec.checkOut);
//       const lateHrs = calcLate(rec.checkIn);
//       const earlyHrs = calcEarlyCheckout(rec.checkOut);
//       const overtimeHrs = calcOvertime(workingHrs);
//       const dayType = calcDayType(rec.checkIn, rec.checkOut, workingHrs);

//       if (dayType === "Full Day") acc.totalPresent += 1;
//       if (dayType === "Half-Day") acc.totalHalfDay += 1;
//       acc.totalLate += lateHrs;
//       acc.totalEarly += earlyHrs;
//       acc.totalOvertime += overtimeHrs;

//       return acc;
//     },
//     {
//       totalPresent: 0,
//       totalHalfDay: 0,
//       totalAbsent: 0,
//       totalLate: 0,
//       totalEarly: 0,
//       totalOvertime: 0,
//     }
//   );

//   // Correct calculation for Total Absent
//   totals.totalAbsent = passedDays - (totals.totalPresent + totals.totalHalfDay);
//   if (totals.totalAbsent < 0) totals.totalAbsent = 0;

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">My Attendance 📅</h1>
//         <input
//           type="month"
//           value={filterMonth}
//           onChange={(e) => setFilterMonth(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         <div className="p-4 bg-white rounded shadow text-center">
//           <p className="text-gray-500 text-sm">Total Days</p>
//           <p className="text-2xl font-bold">{totalDaysInMonth}</p>
//         </div>
//         <div className="p-4 bg-green-100 rounded shadow text-center">
//           <p className="text-green-800 text-sm">Total Present</p>
//           <p className="text-2xl font-bold">{totals.totalPresent}</p>
//         </div>
//         <div className="p-4 bg-yellow-100 rounded shadow text-center">
//           <p className="text-yellow-800 text-sm">Total Half-Day</p>
//           <p className="text-2xl font-bold">{totals.totalHalfDay}</p>
//         </div>
//         <div className="p-4 bg-red-100 rounded shadow text-center">
//           <p className="text-red-800 text-sm">Total Absent</p>
//           <p className="text-2xl font-bold">{totals.totalAbsent}</p>
//         </div>
//         <div className="p-4 bg-red-50 rounded shadow text-center">
//           <p className="text-red-600 text-sm">Total Late</p>
//           <p className="text-2xl font-bold">{formatDecimalHours(totals.totalLate)}</p>
//         </div>
//         <div className="p-4 bg-orange-50 rounded shadow text-center">
//           <p className="text-orange-600 text-sm">Total Early Checkout</p>
//           <p className="text-2xl font-bold">{formatDecimalHours(totals.totalEarly)}</p>
//         </div>
//         <div className="p-4 bg-green-50 rounded shadow text-center">
//           <p className="text-green-700 text-sm">Total Overtime</p>
//           <p className="text-2xl font-bold">{formatDecimalHours(totals.totalOvertime)}</p>
//         </div>
//       </div>

//       {/* Attendance Table */}
//       {loading ? (
//         <p>Loading attendance...</p>
//       ) : records.length === 0 ? (
//         <p>No attendance records found for this month.</p>
//       ) : (
//         <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
//           <table className="min-w-full text-sm border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 <th className="px-4 py-2 border">Date</th>
//                 <th className="px-4 py-2 border">Employee</th>
//                 <th className="px-4 py-2 border">Check-In</th>
//                 <th className="px-4 py-2 border">Late</th>
//                 <th className="px-4 py-2 border">Check-Out</th>
//                 <th className="px-4 py-2 border">Early Checkout</th>
//                 <th className="px-4 py-2 border">Working Hours</th>
//                 <th className="px-4 py-2 border">Overtime</th>
//                 <th className="px-4 py-2 border">Day Type</th>
//                 <th className="px-4 py-2 border">Verified Status</th>
//                 <th className="px-4 py-2 border">Remarks</th>
//                 <th className="px-4 py-2 border">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((rec, idx) => {
//                 const workingHrs = calcWorkingHours(rec.checkIn, rec.checkOut);
//                 const lateHrs = calcLate(rec.checkIn);
//                 const earlyHrs = calcEarlyCheckout(rec.checkOut);
//                 return (
//                   <tr
//                     key={idx}
//                     className={idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
//                   >
//                     <td className="px-4 py-2 border text-center">{formatDate(rec.date)}</td>
//                     <td className="px-4 py-2 border text-center">{rec.employeeName}</td>
//                     <td className="px-4 py-2 border text-center">{formatTime(rec.checkIn)}</td>
//                     <td className="px-4 py-2 border text-center text-red-600 font-medium">
//                       {lateHrs ? formatDecimalHours(lateHrs) : "-"}
//                     </td>
//                     <td className="px-4 py-2 border text-center">{formatTime(rec.checkOut)}</td>
//                     <td className="px-4 py-2 border text-center text-orange-600 font-medium">
//                       {earlyHrs ? formatDecimalHours(earlyHrs) : "-"}
//                     </td>
//                     <td className="px-4 py-2 border text-center">{formatDecimalHours(workingHrs)}</td>
//                     <td className="px-4 py-2 border text-center text-green-700 font-bold">
//                       {formatDecimalHours(calcOvertime(workingHrs))}
//                     </td>
//                     <td className="px-4 py-2 border text-center font-medium">
//                       {calcDayType(rec.checkIn, rec.checkOut, workingHrs)}
//                     </td>
//                     <td className="px-4 py-2 border text-center">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           rec.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {rec.verified ? "Verified" : "Unverified"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2 border text-center">{rec.remarks || "-"}</td>
//                     <td className="px-4 py-2 border text-center">{rec.status || "-"}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
















// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { useUser, useAuth } from "@clerk/nextjs";

// interface AttendanceRecord {
//     date: string | Date;
//     checkIn?: string | Date;
//     checkOut?: string | Date;
//     status?: "Present" | "Absent" | "Leave" | "Half-Day" | "Unverified";
//     verified?: boolean;
//     remarks?: string | null;
//     employeeName?: string;
// }

// // -------------------- Helpers --------------------
// function parseDate(date?: any) {
//     if (!date) return undefined;
//     // handle MongoDB $date objects
//     if (typeof date === "object" && "$date" in date) return new Date(date.$date);
//     return new Date(date);
// }

// function formatDate(date?: any) {
//     const d = parseDate(date);
//     if (!d) return "-";
//     // Using standard US format for clarity in the table
//     return d.toLocaleDateString("en-US", {
//         weekday: "short",
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     });
// }

// // MODIFIED: Show "0" if checkIn/checkOut is missing (based on user request)
// function formatTime(date?: any) {
//     const d = parseDate(date);
//     if (!d) return "0"; // Display "0" if time is null/not recorded
//     return d.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//     });
// }

// // MODIFIED: Show "0" if duration is zero or null (based on user request)
// function formatDecimalHours(decimal?: number) {
//     // Check if decimal is null/undefined OR is practically zero
//     if (!decimal || decimal < 0.01) return "0"; 
    
//     const hrs = Math.floor(decimal);
//     const mins = Math.round((decimal - hrs) * 60);
//     const parts = [];
//     if (hrs > 0) parts.push(`${hrs} hr`);
//     if (mins > 0) parts.push(`${mins} min`);
    
//     return parts.join(" ");
// }

// // -------------------- Calculations --------------------
// function calcLate(checkIn?: any) {
//     const ci = parseDate(checkIn);
//     if (!ci) return 0;
//     const tenAM = new Date(ci);
//     tenAM.setHours(10, 0, 0, 0);
//     return ci > tenAM ? (ci.getTime() - tenAM.getTime()) / (1000 * 60 * 60) : 0;
// }

// function calcEarlyCheckout(checkOut?: any) {
//     const co = parseDate(checkOut);
//     if (!co) return 0;
//     const sevenPM = new Date(co);
//     sevenPM.setHours(19, 0, 0, 0);
//     return co < sevenPM ? (sevenPM.getTime() - co.getTime()) / (1000 * 60 * 60) : 0;
// }

// function calcWorkingHours(checkIn?: any, checkOut?: any) {
//     const ci = parseDate(checkIn);
//     const co = parseDate(checkOut);
//     if (!ci || !co) return 0;
//     let hours = (co.getTime() - ci.getTime()) / (1000 * 60 * 60);
//     if (hours > 1) hours -= 1; // subtract 1 hr lunch
//     return Math.max(0, hours);
// }

// function calcOvertime(hours: number) {
//     return hours > 8 ? hours - 8 : 0;
// }

// function calcDayType(checkIn?: any, checkOut?: any, hours?: number) {
//     if (!parseDate(checkIn)) return "Absent";
//     if (!parseDate(checkOut)) return "Half-Day";
//     if (!hours || hours < 6) return "Half-Day";
//     return "Full Day";
// }

// // --- Utility function for badge styling (Enhanced design) ---
// const getStatusBadge = (status?: string | boolean) => {
//     const value = typeof status === 'boolean' ? (status ? 'Verified' : 'Unverified') : status;

//     switch (value) {
//         case "Verified":
//         case "Present":
//         case "Full Day":
//             return "bg-green-100 text-green-700 font-bold border border-green-300";
//         case "Half-Day":
//             return "bg-yellow-100 text-yellow-700 font-bold border border-yellow-300";
//         case "Absent":
//         case "Unverified":
//             return "bg-red-100 text-red-700 font-bold border border-red-300";
//         case "Leave":
//             return "bg-blue-100 text-blue-700 font-bold border border-blue-300";
//         default:
//             return "bg-gray-100 text-gray-600 border border-gray-300";
//     }
// };

// // -------------------- Component --------------------
// export default function AttendanceTable() {
//     const { user, isLoaded } = useUser();
//     const { getToken } = useAuth();
//     const [records, setRecords] = useState<AttendanceRecord[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [filterMonth, setFilterMonth] = useState<string>(
//         `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
//     );

//     if (!isLoaded) return null;
//     if (!user) return <p className="text-center p-8 text-gray-700">Please log in to view your attendance.</p>;

//     const fetchAttendance = async () => {
//         setLoading(true);
//         try {
//             const token = await getToken();
//             const res = await fetch(`/api/attendance/monthly?month=${filterMonth}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
//             const data: AttendanceRecord[] = await res.json();

//             const enriched = data.map((rec) => ({
//                 ...rec,
//                 employeeName: user.fullName || user.username || "Employee",
//                 verified: rec.verified ?? false,
//                 status: rec.status ?? (rec.verified ? "Present" : "Unverified"),
//             }));

//             setRecords(enriched);
//         } catch (err) {
//             console.error("Failed to fetch attendance", err);
//             setRecords([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchAttendance();
//     }, [filterMonth, user.id]);

//     // -------------------- Sorting Logic: Near to present day first --------------------
//     const sortedRecords = useMemo(() => {
//         // Sort by date descending (nearest to present day first)
//         return [...records].sort((a, b) => {
//             const dateA = parseDate(a.date)?.getTime() || 0;
//             const dateB = parseDate(b.date)?.getTime() || 0;
//             return dateB - dateA; // Sort descending (B before A)
//         });
//     }, [records]);

//     // -------------------- Totals --------------------
//     const year = Number(filterMonth.split("-")[0]);
//     const month = Number(filterMonth.split("-")[1]);
//     const today = new Date();
//     const totalDaysInMonth = new Date(year, month, 0).getDate();
//     const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
//     const passedDays = isCurrentMonth ? today.getDate() : totalDaysInMonth;

//     const totals = records.reduce(
//         (acc, rec) => {
//             const workingHrs = calcWorkingHours(rec.checkIn, rec.checkOut);
//             const lateHrs = calcLate(rec.checkIn);
//             const earlyHrs = calcEarlyCheckout(rec.checkOut);
//             const overtimeHrs = calcOvertime(workingHrs);
//             const dayType = calcDayType(rec.checkIn, rec.checkOut, workingHrs);

//             if (dayType === "Full Day") acc.totalPresent += 1;
//             if (dayType === "Half-Day") acc.totalHalfDay += 1;
//             acc.totalLate += lateHrs;
//             acc.totalEarly += earlyHrs;
//             acc.totalOvertime += overtimeHrs;

//             return acc;
//         },
//         { totalPresent: 0, totalHalfDay: 0, totalAbsent: 0, totalLate: 0, totalEarly: 0, totalOvertime: 0 }
//     );

//     totals.totalAbsent = passedDays - (totals.totalPresent + totals.totalHalfDay);
//     if (totals.totalAbsent < 0) totals.totalAbsent = 0;

//     return (
//         <div className="p-4 bg-gray-50 min-h-screen">
//             <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-bold text-gray-800">My Attendance 📅</h1>
//                 <input
//                     type="month"
//                     value={filterMonth}
//                     onChange={(e) => setFilterMonth(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
//                 />
//             </div>

//             {/* Summary Cards (ORIGINAL STYLING RETAINED) */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <div className="p-4 bg-white rounded shadow text-center">
//                     <p className="text-gray-500 text-sm">Total Days</p>
//                     <p className="text-2xl font-bold">{totalDaysInMonth}</p>
//                 </div>
//                 <div className="p-4 bg-green-100 rounded shadow text-center">
//                     <p className="text-green-800 text-sm">Total Present</p>
//                     <p className="text-2xl font-bold">{totals.totalPresent}</p>
//                 </div>
//                 <div className="p-4 bg-yellow-100 rounded shadow text-center">
//                     <p className="text-yellow-800 text-sm">Total Half-Day</p>
//                     <p className="text-2xl font-bold">{totals.totalHalfDay}</p>
//                 </div>
//                 <div className="p-4 bg-red-100 rounded shadow text-center">
//                     <p className="text-red-800 text-sm">Total Absent</p>
//                     <p className="text-2xl font-bold">{totals.totalAbsent}</p>
//                 </div>
//                 <div className="p-4 bg-red-50 rounded shadow text-center">
//                     <p className="text-red-600 text-sm">Total Late</p>
//                     <p className="text-2xl font-bold">{formatDecimalHours(totals.totalLate)}</p>
//                 </div>
//                 <div className="p-4 bg-orange-50 rounded shadow text-center">
//                     <p className="text-orange-600 text-sm">Total Early Checkout</p>
//                     <p className="text-2xl font-bold">{formatDecimalHours(totals.totalEarly)}</p>
//                 </div>
//                 <div className="p-4 bg-green-50 rounded shadow text-center">
//                     <p className="text-green-700 text-sm">Total Overtime</p>
//                     <p className="text-2xl font-bold">{formatDecimalHours(totals.totalOvertime)}</p>
//                 </div>
//             </div>

//             {/* Attendance Table (NEW ATTRACTIVE DESIGN & SORTING) */}
//             {loading ? (
//                 <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
//                     <p className="text-lg text-gray-600">Loading attendance records...</p>
//                 </div>
//             ) : sortedRecords.length === 0 ? (
//                 <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
//                     <p className="text-xl text-gray-700 font-medium">No attendance records found for this month.</p>
//                 </div>
//             ) : (
//                 <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xl bg-white">
//                     <table className="min-w-full text-sm">
//                         <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
//                             <tr className="text-gray-600 uppercase tracking-wider font-semibold">
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Date</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Employee</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Check-In</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Late</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Check-Out</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Early Out</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Work Hrs</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Overtime</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Day Type</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Status</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Verified</th>
//                                 <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Remarks</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {/* Using sortedRecords for sorting */}
//                             {sortedRecords.map((rec, idx) => {
//                                 const workingHrs = calcWorkingHours(rec.checkIn, rec.checkOut);
//                                 const lateHrs = calcLate(rec.checkIn);
//                                 const earlyHrs = calcEarlyCheckout(rec.checkOut);
//                                 const dayType = calcDayType(rec.checkIn, rec.checkOut, workingHrs);
                                
//                                 // Dynamic row styling
//                                 const rowClass = idx % 2 === 0 
//                                     ? "bg-white hover:bg-gray-50 transition duration-100" 
//                                     : "bg-gray-50 hover:bg-gray-100 transition duration-100";
                                
//                                 // Display values using updated formatters (showing "0" for missing/zero)
//                                 const lateDisplay = formatDecimalHours(lateHrs);
//                                 const earlyDisplay = formatDecimalHours(earlyHrs);
//                                 const workingHrsDisplay = formatDecimalHours(workingHrs);
//                                 const overtimeDisplay = formatDecimalHours(calcOvertime(workingHrs));
                                
//                                 return (
//                                     <tr key={idx} className={rowClass}>
//                                         <td className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-800 whitespace-nowrap">{formatDate(rec.date)}</td>
//                                         <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-700 whitespace-nowrap">{rec.employeeName}</td>
//                                         {/* Check-In/Out using formatTime which returns "0" for null */}
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-mono">{formatTime(rec.checkIn)}</td>
//                                         {/* Conditional color for late */}
//                                         <td className={`px-4 py-3 border-b border-gray-100 text-center text-sm font-semibold ${lateHrs > 0 ? 'text-red-600' : 'text-gray-500'}`}>
//                                             {lateDisplay}
//                                         </td>
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-mono">{formatTime(rec.checkOut)}</td>
//                                         {/* Conditional color for early checkout */}
//                                         <td className={`px-4 py-3 border-b border-gray-100 text-center text-sm font-semibold ${earlyHrs > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
//                                             {earlyDisplay}
//                                         </td>
//                                         {/* Highlight working hours */}
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-bold text-blue-600">
//                                             {workingHrsDisplay}
//                                         </td>
//                                         {/* Highlight overtime */}
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-bold text-green-700">
//                                             {overtimeDisplay}
//                                         </td>
//                                         {/* Day Type Badge */}
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center">
//                                             <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dayType)}`}>
//                                                 {dayType}
//                                             </span>
//                                         </td>
//                                         {/* Status Badge */}
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center">
//                                             <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(rec.status)}`}>
//                                                 {rec.status || "-"}
//                                             </span>
//                                         </td>
//                                         {/* Verified Status Badge */}
//                                         <td className="px-4 py-3 border-b border-gray-100 text-center">
//                                             <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(rec.verified)}`}>
//                                                 {rec.verified ? "Verified" : "Pending"}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 text-left">{rec.remarks || "-"}</td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }















"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

interface AttendanceRecord {
  date: string | Date;
  checkIn?: string | Date;
  checkOut?: string | Date;
  status?: "Present" | "Absent" | "Leave" | "Half-Day" | "Unverified";
  verified?: boolean;
  remarks?: string | null;
  employeeName?: string;
}

// -------------------- Helpers --------------------
function parseDate(date?: any) {
  if (!date) return undefined;
  if (typeof date === "object" && "$date" in date) return new Date(date.$date);
  return new Date(date);
}

function formatDate(date?: any) {
  const d = parseDate(date);
  if (!d) return "-";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date?: any) {
  const d = parseDate(date);
  if (!d) return "0";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDecimalHours(decimal?: number) {
  if (!decimal || decimal < 0.01) return "0";
  const hrs = Math.floor(decimal);
  const mins = Math.round((decimal - hrs) * 60);
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} hr`);
  if (mins > 0) parts.push(`${mins} min`);
  return parts.join(" ");
}

// -------------------- Calculations --------------------
function calcLate(checkIn?: any) {
  const ci = parseDate(checkIn);
  if (!ci) return 0;
  const tenAM = new Date(ci);
  tenAM.setHours(10, 0, 0, 0);
  return ci > tenAM ? (ci.getTime() - tenAM.getTime()) / (1000 * 60 * 60) : 0;
}

function calcEarlyCheckout(checkOut?: any) {
  const co = parseDate(checkOut);
  if (!co) return 0;
  const sevenPM = new Date(co);
  sevenPM.setHours(19, 0, 0, 0);
  return co < sevenPM ? (sevenPM.getTime() - co.getTime()) / (1000 * 60 * 60) : 0;
}

function calcWorkingHours(checkIn?: any, checkOut?: any) {
  const ci = parseDate(checkIn);
  const co = parseDate(checkOut);
  if (!ci || !co) return 0;
  let hours = (co.getTime() - ci.getTime()) / (1000 * 60 * 60);
  if (hours > 1) hours -= 1; // subtract 1 hr lunch
  return Math.max(0, hours);
}

function calcOvertime(hours: number) {
  return hours > 8 ? hours - 8 : 0;
}

function calcDayType(checkIn?: any, checkOut?: any, hours?: number) {
  if (!parseDate(checkIn)) return "Absent";
  if (!parseDate(checkOut)) return "Half-Day";
  if (!hours || hours < 6) return "Half-Day";
  return "Full Day";
}

// -------------------- Badge Styling --------------------
const getStatusBadge = (status?: string | boolean) => {
  const value = typeof status === 'boolean' ? (status ? 'Verified' : 'Unverified') : status;
  switch (value) {
    case "Verified":
    case "Present":
    case "Full Day":
      return "bg-green-100 text-green-700 font-bold border border-green-300";
    case "Half-Day":
      return "bg-yellow-100 text-yellow-700 font-bold border border-yellow-300";
    case "Absent":
    case "Unverified":
      return "bg-red-100 text-red-700 font-bold border border-red-300";
    case "Leave":
      return "bg-blue-100 text-blue-700 font-bold border border-blue-300";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-300";
  }
};

// -------------------- Component --------------------
export default function AttendanceTable() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );

  if (!isLoaded) return null;
  if (!user) return <p className="text-center p-8 text-gray-700">Please log in to view your attendance.</p>;

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/attendance/employeemonthly?month=${filterMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data: AttendanceRecord[] = await res.json();

      const enriched = data.map((rec) => ({
        ...rec,
        employeeName: user.fullName || user.username || "Employee",
        verified: rec.verified ?? false,
        status: rec.status ?? (rec.verified ? "Present" : "Unverified"),
      }));

      setRecords(enriched);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filterMonth, user.id]);

  // -------------------- Sorting --------------------
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [records]);

  // -------------------- Totals --------------------
  const year = Number(filterMonth.split("-")[0]);
  const month = Number(filterMonth.split("-")[1]);
  const today = new Date();
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const passedDays = isCurrentMonth ? today.getDate() : totalDaysInMonth;

  const totals = records.reduce(
    (acc, rec) => {
      const workingHrs = calcWorkingHours(rec.checkIn, rec.checkOut);
      const lateHrs = calcLate(rec.checkIn);
      const earlyHrs = calcEarlyCheckout(rec.checkOut);
      const overtimeHrs = calcOvertime(workingHrs);
      const dayType = calcDayType(rec.checkIn, rec.checkOut, workingHrs);

      if (dayType === "Full Day") acc.totalPresent += 1;
      if (dayType === "Half-Day") acc.totalHalfDay += 1;
      acc.totalLate += lateHrs;
      acc.totalEarly += earlyHrs;
      acc.totalOvertime += overtimeHrs;

      return acc;
    },
    { totalPresent: 0, totalHalfDay: 0, totalAbsent: 0, totalLate: 0, totalEarly: 0, totalOvertime: 0 }
  );

  totals.totalAbsent = passedDays - (totals.totalPresent + totals.totalHalfDay);
  if (totals.totalAbsent < 0) totals.totalAbsent = 0;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance 📅</h1>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow text-center">
          <p className="text-gray-500 text-sm">Total Days</p>
          <p className="text-2xl font-bold">{totalDaysInMonth}</p>
        </div>
        <div className="p-4 bg-green-100 rounded shadow text-center">
          <p className="text-green-800 text-sm">Total Present</p>
          <p className="text-2xl font-bold">{totals.totalPresent}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded shadow text-center">
          <p className="text-yellow-800 text-sm">Total Half-Day</p>
          <p className="text-2xl font-bold">{totals.totalHalfDay}</p>
        </div>
        <div className="p-4 bg-red-100 rounded shadow text-center">
          <p className="text-red-800 text-sm">Total Absent</p>
          <p className="text-2xl font-bold">{totals.totalAbsent}</p>
        </div>
        <div className="p-4 bg-red-50 rounded shadow text-center">
          <p className="text-red-600 text-sm">Total Late</p>
          <p className="text-2xl font-bold">{formatDecimalHours(totals.totalLate)}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded shadow text-center">
          <p className="text-orange-600 text-sm">Total Early Checkout</p>
          <p className="text-2xl font-bold">{formatDecimalHours(totals.totalEarly)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded shadow text-center">
          <p className="text-green-700 text-sm">Total Overtime</p>
          <p className="text-2xl font-bold">{formatDecimalHours(totals.totalOvertime)}</p>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-lg text-gray-600">Loading attendance records...</p>
        </div>
      ) : sortedRecords.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <p className="text-xl text-gray-700 font-medium">No attendance records found for this month.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
              <tr className="text-gray-600 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Date</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Employee</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Check-In</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Late</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Check-Out</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Early Out</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Work Hrs</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Overtime</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Day Type</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Status</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Verified</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((rec, idx) => {
                const workingHrs = calcWorkingHours(rec.checkIn, rec.checkOut);
                const lateHrs = calcLate(rec.checkIn);
                const earlyHrs = calcEarlyCheckout(rec.checkOut);
                const dayType = calcDayType(rec.checkIn, rec.checkOut, workingHrs);

                const rowClass =
                  idx % 2 === 0
                    ? "bg-white hover:bg-gray-50 transition duration-100"
                    : "bg-gray-50 hover:bg-gray-100 transition duration-100";

                return (
                  <tr key={idx} className={rowClass}>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-800 whitespace-nowrap">{formatDate(rec.date)}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-700 whitespace-nowrap">{rec.employeeName}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-mono">{formatTime(rec.checkIn)}</td>
                    <td className={`px-4 py-3 border-b border-gray-100 text-center text-sm font-semibold ${lateHrs > 0 ? 'text-red-600' : 'text-gray-500'}`}>{formatDecimalHours(lateHrs)}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-mono">{formatTime(rec.checkOut)}</td>
                    <td className={`px-4 py-3 border-b border-gray-100 text-center text-sm font-semibold ${earlyHrs > 0 ? 'text-orange-600' : 'text-gray-500'}`}>{formatDecimalHours(earlyHrs)}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-bold text-blue-600">{formatDecimalHours(workingHrs)}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-bold text-green-700">{formatDecimalHours(calcOvertime(workingHrs))}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dayType)}`}>{dayType}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(rec.status)}`}>{rec.status || "-"}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(rec.verified)}`}>{rec.verified ? "Verified" : "Pending"}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 text-left">{rec.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

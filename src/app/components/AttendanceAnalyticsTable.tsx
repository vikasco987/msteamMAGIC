// "use client";

// import { useEffect, useState } from "react";

// export default function AttendanceAnalyticsTable({ month, weekStart }: { month?: string; weekStart?: string }) {
//   const [data, setData] = useState<{ headers: string[]; rows: any[] } | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const query = month ? `month=${month}` : `weekStart=${weekStart}`;
//         const res = await fetch(`/api/attendance/analytics?${query}`);
//         const json = await res.json();
//         setData(json);
//       } catch (err) {
//         console.error("Failed to fetch analytics", err);
//       }
//     }
//     fetchData();
//   }, [month, weekStart]);

//   if (!data) return <p>Loading analytics...</p>;
//   if (!data.rows?.length) return <p>No analytics found for given range.</p>;

//   return (
//     <div className="overflow-x-auto shadow-lg rounded-2xl mt-6">
//       <table className="min-w-full border border-gray-300 bg-white">
//         <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
//           <tr>
//             {data.headers.map((h) => (
//               <th key={h} className="px-4 py-2 border text-left">{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.rows.map((row, idx) => (
//             <tr key={idx} className="hover:bg-gray-50 text-sm">
//               {data.headers.map((h) => (
//                 <td key={h} className="px-4 py-2 border">{row[h]}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }















// "use client";
// import React from "react";

// interface AttendanceRecord {
//   employeeId: string;
//   employeeName?: string;
//   date: string;
//   checkIn: string | null;
//   checkOut: string | null;
// }

// interface Props {
//   records: AttendanceRecord[];
// }

// const AttendanceAnalyticsTable: React.FC<Props> = ({ records }) => {
//   if (!records || records.length === 0) {
//     return <p className="text-center text-gray-500">No attendance records available.</p>;
//   }

//   // Office timings
//   const officeStart = "09:00:00";
//   const officeEnd = "19:00:00";

//   // Convert ISO → HH:mm:ss
//   const toTimeString = (dateStr: string | null): string | null => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     return d.toTimeString().slice(0, 8); // "HH:mm:ss"
//   };

//   // Helper → get time difference in hours
//   const getHours = (start: string, end: string) => {
//     const startDate = new Date(`1970-01-01T${start}`);
//     const endDate = new Date(`1970-01-01T${end}`);
//     return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
//   };

//   // Group by employee
//   const employeeSummary: Record<string, any> = {};

//   records.forEach((rec) => {
//     if (!employeeSummary[rec.employeeId]) {
//       employeeSummary[rec.employeeId] = {
//         name: rec.employeeName || "Unknown",
//         daysPresent: 0,
//         daysLate: 0,
//         daysEarlyLeave: 0,
//         totalHours: 0,
//         overtime: 0,
//       };
//     }

//     const emp = employeeSummary[rec.employeeId];

//     const checkIn = toTimeString(rec.checkIn);
//     const checkOut = toTimeString(rec.checkOut);

//     if (checkIn && checkOut) {
//       emp.daysPresent += 1;

//       // Late if checkIn after 9 AM
//       if (checkIn > officeStart) {
//         emp.daysLate += 1;
//       }

//       // Early Leave if checkout before 7 PM
//       if (checkOut < officeEnd) {
//         emp.daysEarlyLeave += 1;
//       }

//       // Total Hours
//       const worked = getHours(checkIn, checkOut);
//       emp.totalHours += worked;

//       // Overtime (anything above 10 hrs)
//       const expected = getHours(officeStart, officeEnd); // 10 hrs
//       if (worked > expected) {
//         emp.overtime += worked - expected;
//       }
//     }
//   });

//   const summaryData = Object.values(employeeSummary);

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full border border-gray-300 shadow-lg rounded-lg overflow-hidden">
//         <thead className="bg-blue-600 text-white">
//           <tr>
//             <th className="px-4 py-2 border">Employee</th>
//             <th className="px-4 py-2 border">Days Present</th>
//             <th className="px-4 py-2 border">Days Late</th>
//             <th className="px-4 py-2 border">Days Early Leave</th>
//             <th className="px-4 py-2 border">Total Hours Worked</th>
//             <th className="px-4 py-2 border">Total Overtime</th>
//           </tr>
//         </thead>
//         <tbody>
//           {summaryData.map((emp: any, idx) => (
//             <tr key={idx} className="text-center hover:bg-gray-100">
//               <td className="px-4 py-2 border font-semibold">{emp.name}</td>
//               <td className="px-4 py-2 border">{emp.daysPresent}</td>
//               <td className="px-4 py-2 border text-red-600">{emp.daysLate}</td>
//               <td className="px-4 py-2 border text-orange-600">{emp.daysEarlyLeave}</td>
//               <td className="px-4 py-2 border">{emp.totalHours.toFixed(1)} hrs</td>
//               <td className="px-4 py-2 border text-green-600">{emp.overtime.toFixed(1)} hrs</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AttendanceAnalyticsTable;




// "use client";

// import { useEffect, useState } from "react";

// interface Attendance {
//   id: string;
//   userId: string;
//   employeeName?: string;
//   checkIn?: string;
//   checkOut?: string;
//   workingHours?: number;
//   overtimeHours?: number;
//   date: string;
// }

// interface Props {
//   month: string; // e.g. "2025-09"
// }

// export default function AttendanceAnalyticsTable({ month }: Props) {
//   const [data, setData] = useState<Attendance[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMonthData = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/attendance/list?month=${month}`);
//         const json = await res.json();
//         if (Array.isArray(json)) {
//           setData(json);
//         } else {
//           setData([]);
//         }
//       } catch (err) {
//         console.error("Failed to load analytics:", err);
//         setData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMonthData();
//   }, [month]);

//   // Group attendance by employee
//   const grouped = data.reduce((acc: any, row) => {
//     const name = row.employeeName || row.userId || "Unknown";
//     if (!acc[name]) {
//       acc[name] = {
//         employee: name,
//         daysPresent: 0,
//         daysLate: 0,
//         daysEarlyLeave: 0,
//         totalHours: 0,
//         totalOvertime: 0,
//       };
//     }

//     // Mark present
//     acc[name].daysPresent++;

//     // Parse times
//     const checkIn = row.checkIn ? new Date(row.checkIn) : null;
//     const checkOut = row.checkOut ? new Date(row.checkOut) : null;

//     // Late if check-in after 10:15 AM
//     if (checkIn) {
//       const cutoff = new Date(checkIn);
//       cutoff.setHours(10, 15, 0, 0);
//       if (checkIn > cutoff) acc[name].daysLate++;
//     }

//     // Early leave if checkout before 7:00 PM
//     if (checkOut) {
//       const cutoff = new Date(checkOut);
//       cutoff.setHours(19, 0, 0, 0);
//       if (checkOut < cutoff) acc[name].daysEarlyLeave++;
//     }

//     // Add working hours (minutes → hours)
//     if (row.workingHours) acc[name].totalHours += row.workingHours;
//     if (row.overtimeHours) acc[name].totalOvertime += row.overtimeHours;

//     return acc;
//   }, {});

//   const summary = Object.values(grouped);

// function formatHours(hours?: number): string {
//   if (hours == null) return "-";
  
//   // Convert hours (float) → total minutes
//   const totalMinutes = Math.round(hours * 60);
  
//   const hrs = Math.floor(totalMinutes / 60);
//   const mins = totalMinutes % 60;
  
//   if (hrs && mins) return `${hrs}hr ${mins}min`;
//   if (hrs) return `${hrs}hr`;
//   if (mins) return `${mins}min`;
//   return "0min";
// }


//   if (loading) return <p className="p-4">Loading analytics...</p>;

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full border border-gray-300 text-sm shadow-md rounded-lg overflow-hidden">
//         <thead className="bg-blue-600 text-white">
//           <tr>
//             <th className="p-3 border">Employee</th>
//             <th className="p-3 border">Days Present</th>
//             <th className="p-3 border">Days Late</th>
//             <th className="p-3 border">Days Early Leave</th>
//             <th className="p-3 border">Total Hours</th>
//             <th className="p-3 border">Total Overtime</th>
//           </tr>
//         </thead>
//         <tbody>
//           {summary.length === 0 ? (
//             <tr>
//               <td colSpan={6} className="p-4 text-center text-gray-500">
//                 No attendance records available for {month}.
//               </td>
//             </tr>
//           ) : (
//             summary.map((row: any, idx) => (
//               <tr
//                 key={idx}
//                 className="border-t hover:bg-gray-50 transition"
//               >
//                 <td className="p-3 border font-medium">{row.employee}</td>
//                 <td className="p-3 border text-center">{row.daysPresent}</td>
//                 <td className="p-3 border text-center text-red-600">
//                   {row.daysLate}
//                 </td>
//                 <td className="p-3 border text-center text-yellow-600">
//                   {row.daysEarlyLeave}
//                 </td>
//                 <td className="p-3 border text-center">
//                   {formatHours(row.totalHours)}
//                 </td>
//                 <td className="p-3 border text-center text-green-600">
//                   {formatHours(row.totalOvertime)}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";

interface Attendance {
  id: string;
  userId: string;
  employeeName?: string;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  date: string; // UTC ISO string
}

export default function AttendanceAnalyticsTable() {
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/list?month=${month}`);
        const json = await res.json();
        if (Array.isArray(json)) {
          // 🔑 FIX: Normalize all dates to YYYY-MM-DD in UTC
          const normalized = json.map((r: Attendance) => {
            const d = new Date(r.date);
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
            const dd = String(d.getUTCDate()).padStart(2, "0");
            return { ...r, date: `${yyyy}-${mm}-${dd}` };
          });
          setData(normalized);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthData();
  }, [month]);

  // Group attendance by employee
  const grouped = data.reduce((acc: any, row) => {
    // ✅ Filter by month string match (YYYY-MM)
    if (!row.date.startsWith(month)) return acc;

    const name = row.employeeName || row.userId || "Unknown";
    if (!acc[name]) {
      acc[name] = {
        employee: name,
        daysPresent: 0,
        daysLate: 0,
        daysEarlyLeave: 0,
        totalHours: 0,
        totalOvertime: 0,
      };
    }

    acc[name].daysPresent++;

    const checkIn = row.checkIn ? new Date(row.checkIn) : null;
    const checkOut = row.checkOut ? new Date(row.checkOut) : null;

    // Late if check-in after 10:15 AM local
    if (checkIn) {
      const cutoff = new Date(checkIn);
      cutoff.setHours(10, 15, 0, 0);
      if (checkIn > cutoff) acc[name].daysLate++;
    }

    // Early leave if checkout before 7:00 PM local
    if (checkOut) {
      const cutoff = new Date(checkOut);
      cutoff.setHours(19, 0, 0, 0);
      if (checkOut < cutoff) acc[name].daysEarlyLeave++;
    }

    if (row.workingHours) acc[name].totalHours += row.workingHours;
    if (row.overtimeHours) acc[name].totalOvertime += row.overtimeHours;

    return acc;
  }, {});

  const summary = Object.values(grouped);

  function formatHours(hours?: number): string {
    if (hours == null) return "-";
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs && mins) return `${hrs}hr ${mins}min`;
    if (hrs) return `${hrs}hr`;
    if (mins) return `${mins}min`;
    return "0min";
  }

  return (
    <div className="overflow-x-auto">
      {/* Month Filter */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Attendance Analytics</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      {loading ? (
        <p className="p-4">Loading analytics...</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 border">Employee</th>
              <th className="p-3 border">Days Present</th>
              <th className="p-3 border">Days Late</th>
              <th className="p-3 border">Days Early Leave</th>
              <th className="p-3 border">Total Hours</th>
              <th className="p-3 border">Total Overtime</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No attendance records available for {month}.
                </td>
              </tr>
            ) : (
              summary.map((row: any, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{row.employee}</td>
                  <td className="p-3 border text-center">{row.daysPresent}</td>
                  <td className="p-3 border text-center text-red-600">{row.daysLate}</td>
                  <td className="p-3 border text-center text-yellow-600">{row.daysEarlyLeave}</td>
                  <td className="p-3 border text-center">{formatHours(row.totalHours)}</td>
                  <td className="p-3 border text-center text-green-600">
                    {formatHours(row.totalOvertime)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

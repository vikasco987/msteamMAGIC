// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts';
// import FloatingTaskCard from '../components/FloatingTaskCard'; // 🆕 Make sure this path is correct

// type UserStat = {
//   userName: string;
//   email: string;
//   taskCount: number;
//   completedCount: number;
// };

// export default function DashboardPage() {
//   const { user } = useUser();

//   const [userStats, setUserStats] = useState<UserStat[]>([]);
//   const [selectedMonth, setSelectedMonth] = useState<string>(
//     new Date().toISOString().slice(0, 7)
//   );
//   const [showFloating, setShowFloating] = useState(false); // 🆕 Floating card visibility

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch(`/api/stats/user-performance?month=${selectedMonth}`);
//         const data = await res.json();
//         setUserStats(data);
//       } catch (err) {
//         console.error('Failed to fetch stats:', err);
//       }
//     };

//     fetchStats();
//   }, [selectedMonth]);

//   const totalTasks = userStats.reduce((sum, u) => sum + u.taskCount, 0);
//   const completedTasks = userStats.reduce((sum, u) => sum + u.completedCount, 0);
//   const completionRate =
//     totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
//   const mostActive =
//     userStats.length > 0
//       ? userStats.reduce((prev, curr) =>
//           curr.taskCount > prev.taskCount ? curr : prev
//         )
//       : { userName: 'N/A', taskCount: 0 };

//   const email =
//     typeof user?.emailAddresses?.[0]?.emailAddress === 'string'
//       ? user.emailAddresses[0].emailAddress
//       : 'Unknown';

//   const sampleTask = {
//     id: 'task-789',
//     title: '📦 Swiggy Onboarding',
//     status: 'In Progress',
//     description: 'Upload menu and verify documents',
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>

//       <p className="text-sm text-gray-500 mb-4">
//         Logged in as: {user?.username || email} (
//         {String(user?.publicMetadata?.role || 'user')})
//       </p>

//       <div className="mb-4">
//         <label className="text-sm text-gray-600">Select Month: </label>
//         <input
//           type="month"
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="ml-2 px-2 py-1 border rounded"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white rounded-xl shadow p-4">
//           <h3 className="text-lg font-semibold">📌 Total Tasks</h3>
//           <p className="text-2xl">{totalTasks}</p>
//         </div>
//         <div className="bg-white rounded-xl shadow p-4">
//           <h3 className="text-lg font-semibold">✅ Completion Rate</h3>
//           <p className="text-2xl">{completionRate}%</p>
//         </div>
//         <div className="bg-white rounded-xl shadow p-4">
//           <h3 className="text-lg font-semibold">🏆 Most Active</h3>
//           <p className="text-lg">
//             {mostActive.userName} ({mostActive.taskCount} tasks)
//           </p>
//         </div>
//       </div>

//       <div className="mb-4">
//         <button
//           onClick={() => setShowFloating(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
//         >
//           Open Floating Task
//         </button>
//       </div>

//       {showFloating && (
//         <FloatingTaskCard
//           task={sampleTask}
//           onClose={() => setShowFloating(false)}
//         />
//       )}

//       <div className="bg-white rounded-xl shadow p-4 h-96">
//         <h2 className="text-xl font-semibold mb-4">📊 User Task Comparison</h2>
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={userStats}>
//             <XAxis dataKey="userName" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="taskCount" fill="#8884d8" name="Total Tasks" />
//             <Bar dataKey="completedCount" fill="#82ca9d" name="Completed Tasks" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }













// "use client";
// import { useEffect, useState } from "react";

// interface AssigneeSummary {
//   assigneeName: string;
//   todo: number;
//   inprogress: number;
//   done: number;
// }

// export default function TaskDashboard() {
//   const [stats, setStats] = useState<AssigneeSummary[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         const res = await fetch("/api/dashboard/assignee-summary");
//         const data = await res.json();

//         if (Array.isArray(data)) {
//           setStats(data);
//         } else {
//           console.error("Unexpected API response:", data);
//           setStats([]); // fallback so map() won't break
//         }
//       } catch (error) {
//         console.error("Failed to fetch stats", error);
//         setStats([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStats();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">📊 Assignee Summary</h2>
//       {stats.length === 0 ? (
//         <p>No data available</p>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2">
//           {stats.map((user, i) => (
//             <div
//               key={i}
//               className="p-4 border rounded-lg shadow bg-white"
//             >
//               <h3 className="font-semibold text-lg">{user.assigneeName}</h3>
//               <ul className="mt-2 space-y-1">
//                 <li>📝 Todo: {user.todo}</li>
//                 <li>🚧 In Progress: {user.inprogress}</li>
//                 <li>✅ Done: {user.done}</li>
//               </ul>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }








// "use client";

// import { useEffect, useState } from "react";

// interface AssigneeStats {
//   assigneeName: string;
//   todo: number;
//   inProgress: number;
//   done: number;
// }

// export default function TaskDashboard() {
//   const [stats, setStats] = useState<AssigneeStats[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/dashboard/tasks")
//       .then((res) => res.json())
//       .then((data) => {
//         if (Array.isArray(data)) {
//           setStats(data);
//         }
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   if (loading) return <p className="text-center">Loading...</p>;

//   if (!stats.length) return <p className="text-center">No tasks found</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">📊 Assignee Task Summary</h2>

//       <table className="w-full border border-gray-300 rounded-lg shadow-md">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-3 border">Assignee</th>
//             <th className="p-3 border">📝 Todo</th>
//             <th className="p-3 border">🚧 In Progress</th>
//             <th className="p-3 border">✅ Done</th>
//           </tr>
//         </thead>
//         <tbody>
//           {stats.map((stat, idx) => (
//             <tr key={idx} className="text-center border-t">
//               <td className="p-3 border font-semibold">{stat.assigneeName}</td>
//               <td className="p-3 border">{stat.todo}</td>
//               <td className="p-3 border">{stat.inProgress}</td>
//               <td className="p-3 border">{stat.done}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }















// "use client";

// import { useEffect, useState } from "react";

// interface Stats {
//   assignee: string;
//   todo: number;
//   inprogress: number;
//   done: number;
// }

// export default function TaskDashboard() {
//   const [stats, setStats] = useState<Stats[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/api/tasks/stats");

//         if (!res.ok) {
//           throw new Error(`Server error: ${res.status} ${res.statusText}`);
//         }

//         const data = await res.json();

//         // Validate response structure
//         if (!data || !Array.isArray(data.stats)) {
//           throw new Error("Invalid API response format. Expected { stats: [] }");
//         }

//         setStats(data.stats);
//       } catch (err: any) {
//         console.error("Error fetching task stats:", err);
//         setError(err.message || "Unknown error occurred while fetching stats.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, []);

//   if (loading) return <p className="text-blue-500">⏳ Loading task stats...</p>;

//   if (error) {
//     return (
//       <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//         <h2 className="font-bold">❌ Error</h2>
//         <p>{error}</p>
//         <p className="mt-2 text-sm text-gray-600">
//           Check API `/api/tasks/stats` response in browser dev tools → Network tab.
//         </p>
//       </div>
//     );
//   }

//   if (stats.length === 0) {
//     return (
//       <p className="text-gray-500">
//         ⚠️ No tasks found in the database. Try creating some tasks first.
//       </p>
//     );
//   }

//   return (
//     <div className="p-6 bg-white shadow rounded-lg">
//       <h2 className="text-xl font-bold mb-4">📊 Assignee Task Summary</h2>
//       <table className="w-full border border-gray-300">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 border">Assignee</th>
//             <th className="p-2 border">📝 Todo</th>
//             <th className="p-2 border">🚧 In Progress</th>
//             <th className="p-2 border">✅ Done</th>
//           </tr>
//         </thead>
//         <tbody>
//           {stats.map((row, idx) => (
//             <tr key={idx} className="text-center">
//               <td className="p-2 border font-medium">{row.assignee}</td>
//               <td className="p-2 border">{row.todo}</td>
//               <td className="p-2 border">{row.inprogress}</td>
//               <td className="p-2 border">{row.done}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }





// "use client";

// import { useEffect, useState } from "react";

// interface Stats {
//   [assignee: string]: { todo: number; inProgress: number; done: number };
// }

// export default function TaskDashboard() {
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         const res = await fetch("/api/tasks/stats");

//         if (!res.ok) {
//           const errorData = await res.json().catch(() => ({}));
//           throw new Error(
//             `API Error ${res.status}: ${
//               errorData.error || res.statusText || "Unknown"
//             }`
//           );
//         }

//         const data = await res.json();
//         if (!data.stats) {
//           throw new Error("Invalid API response: stats missing");
//         }

//         setStats(data.stats);
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch stats");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, []);

//   if (loading) return <p>⏳ Loading stats...</p>;
//   if (error) return <p className="text-red-600">❌ Error: {error}</p>;
//   if (!stats || Object.keys(stats).length === 0)
//     return <p>⚠️ No stats available</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">📊 Assignee Summary</h2>
//       <table className="min-w-full border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border px-4 py-2">Assignee</th>
//             <th className="border px-4 py-2">📝 Todo</th>
//             <th className="border px-4 py-2">🚧 In Progress</th>
//             <th className="border px-4 py-2">✅ Done</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.entries(stats).map(([assignee, s]) => (
//             <tr key={assignee}>
//               <td className="border px-4 py-2">{assignee}</td>
//               <td className="border px-4 py-2">{s.todo}</td>
//               <td className="border px-4 py-2">{s.inProgress}</td>
//               <td className="border px-4 py-2">{s.done}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }'

























// "use client";

// import { useEffect, useState } from "react";

// interface AssigneeStats {
//   assignee: string;
//   todo: number;
//   inprogress: number;
//   done: number;
// }

// export default function AssigneeSummary() {
//   const [data, setData] = useState<AssigneeStats[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         const res = await fetch("/api/tasks/stats");
//         if (!res.ok) {
//           const err = await res.json();
//           throw new Error(`API Error ${res.status}: ${err.error || "Unknown"}`);
//         }
//         const json = await res.json();
//         if (json.success && Array.isArray(json.data)) {
//           setData(json.data);
//         } else {
//           throw new Error("Invalid API response structure");
//         }
//       } catch (err: any) {
//         console.error("Error fetching stats:", err);
//         setError(err.message || "Something went wrong");
//       }
//     }
//     fetchStats();
//   }, []);

//   if (error) {
//     return (
//       <div className="p-4 bg-red-100 text-red-800 rounded-lg">
//         ❌ Error: {error}
//       </div>
//     );
//   }

//   if (data.length === 0) {
//     return (
//       <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
//         ⚠️ No tasks found
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white shadow rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Assignee Summary</h2>
//       <table className="w-full border border-gray-300">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="border p-2">Assignee</th>
//             <th className="border p-2">📝 Todo</th>
//             <th className="border p-2">🚧 In Progress</th>
//             <th className="border p-2">✅ Done</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row, i) => (
//             <tr key={i} className="hover:bg-gray-50">
//               <td className="border p-2">{row.assignee}</td>
//               <td className="border p-2">{row.todo}</td>
//               <td className="border p-2">{row.inprogress}</td>
//               <td className="border p-2">{row.done}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }











"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Row = {
  assignee: string;
  todo: number;
  inprogress: number;
  done: number;
  total: number;
};

type StatsResponse = {
  success: boolean;
  totals?: {
    todo: number;
    inprogress: number;
    done: number;
  };
  data?: Row[];
};

export default function TaskStatsDashboard() {
  const [totals, setTotals] = useState({ todo: 0, inprogress: 0, done: 0 });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get<StatsResponse>("/api/tasks/stats");
        if (res.data.success) {
          setTotals(res.data.totals || { todo: 0, inprogress: 0, done: 0 });
          setRows(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">📝 Todo</h2>
          <p className="text-2xl font-bold">{totals?.todo ?? 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">🚧 In Progress</h2>
          <p className="text-2xl font-bold">{totals?.inprogress ?? 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">✅ Done</h2>
          <p className="text-2xl font-bold">{totals?.done ?? 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Assignee</th>
              <th className="px-4 py-2 border">📝 Todo</th>
              <th className="px-4 py-2 border">🚧 In Progress</th>
              <th className="px-4 py-2 border">✅ Done</th>
              <th className="px-4 py-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.assignee} className="text-center">
                  <td className="px-4 py-2 border">{r.assignee}</td>
                  <td className="px-4 py-2 border">{r.todo ?? 0}</td>
                  <td className="px-4 py-2 border">{r.inprogress ?? 0}</td>
                  <td className="px-4 py-2 border">{r.done ?? 0}</td>
                  <td className="px-4 py-2 border">{r.total ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2 border text-center" colSpan={5}>
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

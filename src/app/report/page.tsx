// // pages/ReportPage.tsx
// "use client";

// import React, { useState, useEffect } from 'react';
// import { useUser } from '@clerk/nextjs';
// import  TaskTableView  from '../components/TaskTableView'; // Adjust path as needed
// import { Task } from '../../types/task'; // Adjust path as needed
// import toast from 'react-hot-toast';

// export default function ReportPage() {
//   const { user, isLoaded } = useUser();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchTasks = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch('/api/tasks');
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || 'Failed to fetch tasks');
//       }
//       const data = await res.json();
//       if (Array.isArray(data.tasks)) {
//         setTasks(data.tasks);
//       } else {
//         console.warn("API returned non-array for tasks:", data);
//         setTasks([]); // Ensure tasks is always an array
//         toast.error("Failed to load tasks: Invalid data format.");
//       }
//     } catch (err: any) {
//       console.error("Error fetching tasks:", err);
//       setError(err.message || 'An error occurred while fetching tasks.');
//       toast.error(err.message || 'Failed to load tasks.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Only fetch if user is loaded and has an allowed role
//     if (isLoaded && user && (user.publicMetadata?.role === "admin" || user.publicMetadata?.role === "seller" || user.publicMetadata?.role === "master")) {
//       fetchTasks();
//     } else if (isLoaded && !user) {
//       setLoading(false); // User not logged in
//     } else if (isLoaded && user && user.publicMetadata?.role !== "admin" && user.publicMetadata?.role !== "seller" && user.publicMetadata?.role !== "master") {
//       setLoading(false); // User logged in but unauthorized role
//       setError("⛔ Access Denied: You do not have the required role to view this page.");
//     }
//   }, [isLoaded, user]); // Re-fetch when user object or loading state changes

//   if (!isLoaded || loading) {
//     return <div className="p-6 text-gray-500 text-center py-8">Loading user and tasks...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-8 text-red-600">Error: {error}</div>;
//   }

//   // After loading, if user is null (not signed in) or role is not allowed
//   const role = user?.publicMetadata?.role;
//   if (!user || (role !== "admin" && role !== "seller" && role !== "master")) {
//     return <div className="p-6 text-red-500 text-center py-8">
//              ⛔ Access Denied: Please sign in with an authorized account.
//            </div>;
//   }

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">📋 Task Dashboard</h1>
//       {/* Pass setTasks directly to TaskTableView */}
//       <TaskTableView tasks={tasks} user={user} onTasksUpdate={setTasks} />
//     </main>
//   );
// }













// pages/ReportPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import TaskTableView from '../components/TaskTableView'; // Adjust path as needed
import { Task } from '../../types/task'; // Adjust path as needed
import toast from 'react-hot-toast';

// Define the expected structure of the API response
interface ApiResponse {
  tasks: Task[];
}

export default function ReportPage() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }
      // FIX: Explicitly type `data` as ApiResponse
      const data: ApiResponse = await res.json(); // THIS IS LINE 33

      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        console.warn("API returned non-array for tasks:", data);
        setTasks([]); // Ensure tasks is always an array
        toast.error("Failed to load tasks: Invalid data format.");
      }
    } catch (err: any) { // Consider refining this `any` as well if possible
      console.error("Error fetching tasks:", err);
      setError(err.message || 'An error occurred while fetching tasks.');
      toast.error(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is loaded and has an allowed role
    if (isLoaded && user && (user.publicMetadata?.role === "admin" || user.publicMetadata?.role === "seller" || user.publicMetadata?.role === "master")) {
      fetchTasks();
    } else if (isLoaded && !user) {
      setLoading(false); // User not logged in
    } else if (isLoaded && user && user.publicMetadata?.role !== "admin" && user.publicMetadata?.role !== "seller" && user.publicMetadata?.role !== "master") {
      setLoading(false); // User logged in but unauthorized role
      setError("⛔ Access Denied: You do not have the required role to view this page.");
    }
  }, [isLoaded, user]); // Re-fetch when user object or loading state changes

  if (!isLoaded || loading) {
    return <div className="p-6 text-gray-500 text-center py-8">Loading user and tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  // After loading, if user is null (not signed in) or role is not allowed
  const role = user?.publicMetadata?.role;
  if (!user || (role !== "admin" && role !== "seller" && role !== "master")) {
    return <div className="p-6 text-red-500 text-center py-8">
              ⛔ Access Denied: Please sign in with an authorized account.
            </div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📋 Task Dashboard</h1>
      {/* Pass setTasks directly to TaskTableView */}
      <TaskTableView tasks={tasks} user={user} onTasksUpdate={setTasks} />
    </main>
  );
}
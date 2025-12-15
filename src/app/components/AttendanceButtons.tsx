// "use client";

// import { useState } from "react";

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);

//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);

//     try {
//       // ✅ Get location from browser
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             (err) => {
//               console.warn("Geolocation error:", err);
//               resolve(); // continue without location
//             },
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       // ✅ Send location + other data to backend
//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type,
//           reason,
//           remarks,
//           lat: latitude,
//           lng: longitude,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert(data.error || "Failed to mark attendance");
//       } else {
//         alert(
//           `${type === "checkIn" ? "Check-In" : "Check-Out"} recorded\nStatus: ${
//             data.attendance?.status
//           }`
//         );
//         console.log("Attendance Response:", data);
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   return (
//     <div className="flex flex-col gap-4 p-4 border rounded-lg w-80">
//       {showReason && (
//         <div className="flex flex-col gap-2">
//           <textarea
//             placeholder="Reason (required)"
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <textarea
//             placeholder="Remarks (optional)"
//             value={remarks}
//             onChange={(e) => setRemarks(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <button
//             onClick={() => actionType && handleAttendance(actionType)}
//             disabled={loading || (showReason && !reason)}
//             className="bg-green-600 text-white py-2 rounded"
//           >
//             {loading ? "Submitting..." : "Submit"}
//           </button>
//         </div>
//       )}

//       {!showReason && (
//         <>
//           <button
//             onClick={checkInClick}
//             disabled={loading}
//             className="bg-blue-600 text-white py-2 rounded"
//           >
//             {loading && actionType === "checkIn" ? "..." : "Check In"}
//           </button>
//           <button
//             onClick={checkOutClick}
//             disabled={loading}
//             className="bg-red-600 text-white py-2 rounded"
//           >
//             {loading && actionType === "checkOut" ? "..." : "Check Out"}
//           </button>
//         </>
//       )}
//     </div>
//   );
// }










// "use client";

// import { useState } from "react";

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);

//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);

//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type, reason, remarks, lat: latitude, lng: longitude }),
//       });

//       const data = await res.json();
//       if (!res.ok) alert(data.error || "Failed to mark attendance");
//       else
//         alert(
//           `${type === "checkIn" ? "Check-In" : "Check-Out"} recorded for ${
//             data.attendance.userName
//           }\nStatus: ${data.attendance.status}`
//         );
//     } catch (err) {
//       console.error(err);
//       alert("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   return (
//     <div className="flex flex-col gap-4 p-4 border rounded-lg w-80">
//       {showReason && (
//         <div className="flex flex-col gap-2">
//           <textarea
//             placeholder="Reason (required)"
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <textarea
//             placeholder="Remarks (optional)"
//             value={remarks}
//             onChange={(e) => setRemarks(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <button
//             onClick={() => actionType && handleAttendance(actionType)}
//             disabled={loading || !reason}
//             className="bg-green-600 text-white py-2 rounded"
//           >
//             {loading ? "Submitting..." : "Submit"}
//           </button>
//         </div>
//       )}

//       {!showReason && (
//         <>
//           <button onClick={checkInClick} disabled={loading} className="bg-blue-600 text-white py-2 rounded">
//             {loading && actionType === "checkIn" ? "..." : "Check In"}
//           </button>
//           <button onClick={checkOutClick} disabled={loading} className="bg-red-600 text-white py-2 rounded">
//             {loading && actionType === "checkOut" ? "..." : "Check Out"}
//           </button>
//         </>
//       )}
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect } from "react";

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//   const [checkInStatus, setCheckInStatus] = useState<"notCheckedIn" | "checkedIn" | null>(null);
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);

//   // This effect will run once when the component mounts to check the user's initial status.
//   useEffect(() => {
//     // We would need to fetch the attendance status from the server here.
//     // For this example, we'll simulate a check.
//     const fetchStatus = async () => {
//       // In a real application, you'd make an API call like this:
//       // const res = await fetch("/api/attendance/status");
//       // const data = await res.json();
//       // if (data.checkedIn) {
//       //   setCheckInStatus("checkedIn");
//       //   setCheckInTime(data.checkInTime);
//       // } else {
//       //   setCheckInStatus("notCheckedIn");
//       // }

//       // Simulation for now:
//       // Let's assume the user is not checked in initially.
//       setCheckInStatus("notCheckedIn");
//     };
//     fetchStatus();
//   }, []);

//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);

//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type, reason, remarks, lat: latitude, lng: longitude }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         alert(data.error || "Failed to mark attendance");
//       } else {
//         alert(
//           `${type === "checkIn" ? "Check-In" : "Check-Out"} recorded for ${
//             data.attendance.userName
//           }\nStatus: ${data.attendance.status}`
//         );
//         // Update the status dynamically after a successful check-in
//         if (type === "checkIn") {
//           setCheckInStatus("checkedIn");
//           setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
//         } else if (type === "checkOut") {
//           setCheckInStatus("notCheckedIn");
//           setCheckInTime(null);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   return (
//     <div className="flex flex-col gap-4 p-4 border rounded-lg w-80">
//       {/* Small card showing today's status */}
//       <div className="p-3 bg-gray-100 rounded-md text-sm text-center">
//         {checkInStatus === "checkedIn" && checkInTime ? (
//           <p>Checked in at {checkInTime}</p>
//         ) : (
//           <p>You are not checked in yet</p>
//         )}
//       </div>

//       {showReason && (
//         <div className="flex flex-col gap-2">
//           <textarea
//             placeholder="Reason (required)"
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <textarea
//             placeholder="Remarks (optional)"
//             value={remarks}
//             onChange={(e) => setRemarks(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <button
//             onClick={() => actionType && handleAttendance(actionType)}
//             disabled={loading || !reason}
//             className="bg-green-600 text-white py-2 rounded"
//           >
//             {loading ? "Submitting..." : "Submit"}
//           </button>
//         </div>
//       )}

//       {!showReason && (
//         <>
//           <button onClick={checkInClick} disabled={loading || checkInStatus === "checkedIn"} className={`text-white py-2 rounded ${checkInStatus === "checkedIn" ? "bg-gray-400" : "bg-blue-600"}`}>
//             {loading && actionType === "checkIn" ? "..." : "Check In"}
//           </button>
//           <button onClick={checkOutClick} disabled={loading || checkInStatus !== "checkedIn"} className={`text-white py-2 rounded ${checkInStatus !== "checkedIn" ? "bg-gray-400" : "bg-red-600"}`}>
//             {loading && actionType === "checkOut" ? "..." : "Check Out"}
//           </button>
//         </>
//       )}
//     </div>
//   );
// }











// "use client";

// import { useState, useEffect } from "react";
// import toast, { Toaster } from 'react-hot-toast';
// import { FaRegCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//   const [checkInStatus, setCheckInStatus] = useState<"notCheckedIn" | "checkedIn" | null>(null);
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);
//   const [overtime, setOvertime] = useState<string>("0h 0m");
//   const [hoursWorked, setHoursWorked] = useState<string>("0h 0m");

//   useEffect(() => {
//     // In a real app, this would be an API call to get the current day's attendance
//     const fetchStatus = async () => {
//       // Simulate API response
//       const attendanceData = {
//         checkedIn: false,
//         checkInTime: null,
//         hoursWorked: "0h 0m",
//         overtime: "0h 0m"
//       };

//       if (attendanceData.checkedIn) {
//         setCheckInStatus("checkedIn");
//         setCheckInTime(attendanceData.checkInTime);
//         setHoursWorked(attendanceData.hoursWorked);
//         setOvertime(attendanceData.overtime);
//       } else {
//         setCheckInStatus("notCheckedIn");
//       }
//     };
//     fetchStatus();
//   }, []);

//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);

//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type, reason, remarks, lat: latitude, lng: longitude }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Failed to mark attendance");
//       } else {
//         toast.success(`Attendance marked successfully!`);

//         // Update the status dynamically after a successful action
//         if (type === "checkIn") {
//           setCheckInStatus("checkedIn");
//           setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
//           setHoursWorked("0h 0m"); // Reset for new day
//           setOvertime("0h 0m"); // Reset for new day
//         } else if (type === "checkOut") {
//           setCheckInStatus("notCheckedIn");
//           setCheckInTime(null);
//           // In a real app, update hours worked and overtime from the API response
//           setHoursWorked("8h 30m");
//           setOvertime("0h 30m");
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   const attendanceSummary = [
//     { title: "Hours Worked Today", value: hoursWorked, icon: <FaClock className="text-gray-600" /> },
//     { title: "Overtime", value: overtime, icon: <FaCalendarAlt className="text-gray-600" /> },
//     { title: "Last Check-in", value: checkInTime || "N/A", icon: <FaRegCheckCircle className="text-gray-600" /> },
//   ];

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="flex flex-col gap-4 p-4 border rounded-lg w-80 shadow-md">
//         {/* Attendance Summary Widget */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {attendanceSummary.map((item) => (
//             <div key={item.title} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
//               {item.icon}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-500">{item.title}</span>
//                 <span className="font-semibold">{item.value}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Status Card */}
//         <div className="p-3 bg-gray-100 rounded-md text-sm text-center">
//           {checkInStatus === "checkedIn" && checkInTime ? (
//             <p className="font-semibold text-green-600">
//               <FaRegCheckCircle className="inline-block mr-2" />
//               Checked in at {checkInTime}
//             </p>
//           ) : (
//             <p>You are not checked in yet</p>
//           )}
//         </div>

//         {showReason && (
//           <div className="flex flex-col gap-2">
//             <textarea
//               placeholder="Reason (required)"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <textarea
//               placeholder="Remarks (optional)"
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <button
//               onClick={() => actionType && handleAttendance(actionType)}
//               disabled={loading || !reason}
//               className="relative bg-green-600 text-white py-2 rounded overflow-hidden"
//             >
//               {loading && <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
//               </div>}
//               <span className={loading ? "opacity-0" : ""}>{loading ? "Submitting..." : "Submit"}</span>
//             </button>
//           </div>
//         )}

//         {!showReason && (
//           <>
//             <button
//               onClick={checkInClick}
//               disabled={loading || checkInStatus === "checkedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${checkInStatus === "checkedIn" ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-600 text-white"}`}
//             >
//               {loading && actionType === "checkIn" ? (
//                 <div className="relative flex items-center justify-center">
//                   <div className="absolute w-full h-full rounded-full animate-ping bg-blue-400 opacity-75"></div>
//                   <div className="relative w-4 h-4 rounded-full bg-white"></div>
//                 </div>
//               ) : (
//                 <>
//                   {checkInStatus === "checkedIn" ? "Already Checked In ✔️" : "Check In"}
//                 </>
//               )}
//             </button>
//             <button
//               onClick={checkOutClick}
//               disabled={loading || checkInStatus !== "checkedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${checkInStatus !== "checkedIn" ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-red-600 text-white"}`}
//             >
//               {loading && actionType === "checkOut" ? (
//                 <div className="relative flex items-center justify-center">
//                   <div className="absolute w-full h-full rounded-full animate-ping bg-red-400 opacity-75"></div>
//                   <div className="relative w-4 h-4 rounded-full bg-white"></div>
//                 </div>
//               ) : (
//                 "Check Out"
//               )}
//             </button>
//           </>
//         )}
//       </div>
//     </>
//   );
// }






// "use client";

// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { FaRegCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//   const [checkInStatus, setCheckInStatus] = useState<"notCheckedIn" | "checkedIn" | null>(null);
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);
//   const [overtime, setOvertime] = useState<string>("0h 0m");
//   const [hoursWorked, setHoursWorked] = useState<string>("0h 0m");
//   const [isClient, setIsClient] = useState(false);

//   // ✅ Only run client-side
//   useEffect(() => {
//     setIsClient(true);

//     const fetchTodayAttendance = async () => {
//       try {
//         const res = await fetch("/api/attendance/today"); // ✅ Your backend should return today's attendance
//         const data = await res.json();

//         if (data.attendance) {
//           const att = data.attendance;
//           setCheckInStatus(att.checkIn ? "checkedIn" : "notCheckedIn");
//           setCheckInTime(att.checkIn ? new Date(att.checkIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null);

//           // Format hoursWorked & overtime
//           const wh = att.workingHours || 0;
//           const ot = att.overtimeHours || 0;
//           setHoursWorked(`${Math.floor(wh)}h ${Math.floor((wh % 1) * 60)}m`);
//           setOvertime(`${Math.floor(ot)}h ${Math.floor((ot % 1) * 60)}m`);
//         } else {
//           setCheckInStatus("notCheckedIn");
//         }
//       } catch (err) {
//         console.error("Error fetching today's attendance:", err);
//       }
//     };

//     fetchTodayAttendance();
//   }, []);

//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);
//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type, reason, remarks, lat: latitude, lng: longitude }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Failed to mark attendance");
//       } else {
//         toast.success("Attendance marked successfully!");

//         // ✅ Update state from backend response
//         const att = data.attendance;
//         setCheckInStatus(att.checkIn ? "checkedIn" : "notCheckedIn");
//         setCheckInTime(att.checkIn ? new Date(att.checkIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null);

//         const wh = att.workingHours || 0;
//         const ot = att.overtimeHours || 0;
//         setHoursWorked(`${Math.floor(wh)}h ${Math.floor((wh % 1) * 60)}m`);
//         setOvertime(`${Math.floor(ot)}h ${Math.floor((ot % 1) * 60)}m`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   if (!isClient) return <div className="p-4 text-gray-500">Loading...</div>;

//   const attendanceSummary = [
//     { title: "Hours Worked Today", value: hoursWorked, icon: <FaClock className="text-gray-600" /> },
//     { title: "Overtime", value: overtime, icon: <FaCalendarAlt className="text-gray-600" /> },
//     { title: "Last Check-in", value: checkInTime || "N/A", icon: <FaRegCheckCircle className="text-gray-600" /> },
//   ];

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="flex flex-col gap-4 p-4 border rounded-lg w-80 shadow-md">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {attendanceSummary.map((item) => (
//             <div key={item.title} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
//               {item.icon}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-500">{item.title}</span>
//                 <span className="font-semibold">{item.value}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="p-3 bg-gray-100 rounded-md text-sm text-center">
//           {checkInStatus === "checkedIn" && checkInTime ? (
//             <p className="font-semibold text-green-600">
//               <FaRegCheckCircle className="inline-block mr-2" />
//               Checked in at {checkInTime}
//             </p>
//           ) : (
//             <p>You are not checked in yet</p>
//           )}
//         </div>

//         {showReason && (
//           <div className="flex flex-col gap-2">
//             <textarea
//               placeholder="Reason (required)"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <textarea
//               placeholder="Remarks (optional)"
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <button
//               onClick={() => actionType && handleAttendance(actionType)}
//               disabled={loading || !reason}
//               className="relative bg-green-600 text-white py-2 rounded overflow-hidden"
//             >
//               {loading ? "Submitting..." : "Submit"}
//             </button>
//           </div>
//         )}

//         {!showReason && (
//           <>
//             <button
//               onClick={checkInClick}
//               disabled={loading || checkInStatus === "checkedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${
//                 checkInStatus === "checkedIn"
//                   ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//                   : "bg-blue-600 text-white"
//               }`}
//             >
//               {checkInStatus === "checkedIn" ? "Already Checked In ✔️" : "Check In"}
//             </button>
//             <button
//               onClick={checkOutClick}
//               disabled={loading || checkInStatus !== "checkedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${
//                 checkInStatus !== "checkedIn"
//                   ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//                   : "bg-red-600 text-white"
//               }`}
//             >
//               Check Out
//             </button>
//           </>
//         )}
//       </div>
//     </>
//   );
// // // }
// "use client";

// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { FaRegCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//   const [checkInStatus, setCheckInStatus] = useState<"notCheckedIn" | "checkedIn" | "checkedOut">("notCheckedIn");
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
//   const [overtime, setOvertime] = useState<string>("0h 0m");
//   const [hoursWorked, setHoursWorked] = useState<string>("0h 0m");
//   const [isClient, setIsClient] = useState(false);

//   // ------------------ Helper: convert backend UTC date to local time string ------------------
//   const formatTime = (utcDate: string) => {
//     if (!utcDate) return null;
//     const d = new Date(utcDate);
//     return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//   };

//   // ------------------ Fetch today's attendance ------------------
//   const fetchTodayAttendance = async () => {
//     try {
//       const res = await fetch("/api/attendance/today");
//       const data = await res.json();

//       if (data.attendance) {
//         const att = data.attendance;
//         const checkedIn = !!att.checkIn;
//         const checkedOut = !!att.checkOut;

//         setCheckInStatus(
//           checkedOut ? "checkedOut" : checkedIn ? "checkedIn" : "notCheckedIn"
//         );

//         setCheckInTime(formatTime(att.checkIn));
//         setCheckOutTime(formatTime(att.checkOut));

//         const wh = att.workingHours || 0;
//         const ot = att.overtimeHours || 0;
//         setHoursWorked(`${Math.floor(wh)}h ${Math.floor((wh % 1) * 60)}m`);
//         setOvertime(`${Math.floor(ot)}h ${Math.floor((ot % 1) * 60)}m`);
//       } else {
//         setCheckInStatus("notCheckedIn");
//         setCheckInTime(null);
//         setCheckOutTime(null);
//         setHoursWorked("0h 0m");
//         setOvertime("0h 0m");
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//     }
//   };

//   useEffect(() => {
//     setIsClient(true);
//     fetchTodayAttendance();
//   }, []);

//   // ------------------ Handle check-in / check-out ------------------
//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);
//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type, reason, remarks, lat: latitude, lng: longitude }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Failed to mark attendance");
//       } else {
//         toast.success("Attendance marked successfully!");
//         fetchTodayAttendance(); // ✅ Refresh after check-in/out
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   if (!isClient) return <div className="p-4 text-gray-500">Loading...</div>;

//   const attendanceSummary = [
//     { title: "Hours Worked Today", value: hoursWorked, icon: <FaClock className="text-gray-600" /> },
//     { title: "Overtime", value: overtime, icon: <FaCalendarAlt className="text-gray-600" /> },
//     { title: "Last Check-in", value: checkInTime || "N/A", icon: <FaRegCheckCircle className="text-gray-600" /> },
//     { title: "Last Check-out", value: checkOutTime || "N/A", icon: <FaRegCheckCircle className="text-gray-600" /> },
//   ];

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="flex flex-col gap-4 p-4 border rounded-lg w-80 shadow-md">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {attendanceSummary.map((item) => (
//             <div key={item.title} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
//               {item.icon}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-500">{item.title}</span>
//                 <span className="font-semibold">{item.value}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="p-3 bg-gray-100 rounded-md text-sm text-center">
//           {checkInStatus === "checkedIn" && checkInTime ? (
//             <p className="font-semibold text-green-600">
//               <FaRegCheckCircle className="inline-block mr-2" />
//               Checked in at {checkInTime}
//             </p>
//           ) : checkInStatus === "checkedOut" && checkOutTime ? (
//             <p className="font-semibold text-blue-600">
//               <FaRegCheckCircle className="inline-block mr-2" />
//               Checked out at {checkOutTime}
//             </p>
//           ) : (
//             <p>You are not checked in yet</p>
//           )}
//         </div>

//         {showReason && (
//           <div className="flex flex-col gap-2">
//             <textarea
//               placeholder="Reason (required)"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <textarea
//               placeholder="Remarks (optional)"
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <button
//               onClick={() => actionType && handleAttendance(actionType)}
//               disabled={loading || !reason}
//               className="relative bg-green-600 text-white py-2 rounded overflow-hidden"
//             >
//               {loading ? "Submitting..." : "Submit"}
//             </button>
//           </div>
//         )}

//         {!showReason && (
//           <>
//             <button
//               onClick={checkInClick}
//               disabled={loading || checkInStatus !== "notCheckedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${
//                 checkInStatus !== "notCheckedIn"
//                   ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//                   : "bg-blue-600 text-white"
//               }`}
//             >
//               {checkInStatus === "checkedIn" || checkInStatus === "checkedOut"
//                 ? "Already Checked In ✔️"
//                 : "Check In"}
//             </button>
//             <button
//               onClick={checkOutClick}
//               disabled={loading || checkInStatus !== "checkedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${
//                 checkInStatus !== "checkedIn"
//                   ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//                   : "bg-red-600 text-white"
//               }`}
//             >
//               Check Out
//             </button>
//           </>
//         )}
//       </div>
//     </>
//   );
// }




// "use client";

// import { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { FaRegCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";

// export default function AttendanceButtons() {
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(
//     null
//   );
//   const [checkInStatus, setCheckInStatus] = useState<
//     "notCheckedIn" | "checkedIn" | "checkedOut"
//   >("notCheckedIn");
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
//   const [hoursWorked, setHoursWorked] = useState<string>("00:00:00");
//   const [overtime, setOvertime] = useState<string>("00:00:00");
//   const [isClient, setIsClient] = useState(false);

//   // store actual Date objects for live calc
//   const checkInDateRef = useRef<Date | null>(null);
//   const checkOutDateRef = useRef<Date | null>(null);

//   const formatTime = (utcDate: string) => {
//     if (!utcDate) return null;
//     const d = new Date(utcDate);
//     return d.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Format ms -> HH:MM:SS
//   const formatDuration = (ms: number) => {
//     const h = Math.floor(ms / (1000 * 60 * 60))
//       .toString()
//       .padStart(2, "0");
//     const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
//       .toString()
//       .padStart(2, "0");
//     const s = Math.floor((ms % (1000 * 60)) / 1000)
//       .toString()
//       .padStart(2, "0");
//     return `${h}:${m}:${s}`;
//   };

//   // ------------------ Fetch today's attendance ------------------
//   const fetchTodayAttendance = async () => {
//     try {
//       const res = await fetch("/api/attendance/today");
//       const data = await res.json();

//       if (data.attendance) {
//         const att = data.attendance;
//         const checkedIn = !!att.checkIn;
//         const checkedOut = !!att.checkOut;

//         setCheckInStatus(
//           checkedOut ? "checkedOut" : checkedIn ? "checkedIn" : "notCheckedIn"
//         );

//         if (att.checkIn) {
//           checkInDateRef.current = new Date(att.checkIn);
//           setCheckInTime(formatTime(att.checkIn));
//         } else {
//           checkInDateRef.current = null;
//           setCheckInTime(null);
//         }

//         if (att.checkOut) {
//           checkOutDateRef.current = new Date(att.checkOut);
//           setCheckOutTime(formatTime(att.checkOut));
//         } else {
//           checkOutDateRef.current = null;
//           setCheckOutTime(null);
//         }
//       } else {
//         setCheckInStatus("notCheckedIn");
//         setCheckInTime(null);
//         setCheckOutTime(null);
//         checkInDateRef.current = null;
//         checkOutDateRef.current = null;
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//     }
//   };

//   useEffect(() => {
//     setIsClient(true);
//     fetchTodayAttendance();
//   }, []);

//   // ------------------ Live Update Every Second ------------------
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (checkInStatus === "checkedIn" && checkInDateRef.current) {
//         const now = new Date();
//         const workedMs = now.getTime() - checkInDateRef.current.getTime();
//         setHoursWorked(formatDuration(workedMs));

//         // overtime if > 9h
//         const overtimeMs = workedMs - 9 * 60 * 60 * 1000;
//         setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");
//       } else if (
//         checkInStatus === "checkedOut" &&
//         checkInDateRef.current &&
//         checkOutDateRef.current
//       ) {
//         const workedMs =
//           checkOutDateRef.current.getTime() - checkInDateRef.current.getTime();
//         setHoursWorked(formatDuration(workedMs));

//         const overtimeMs = workedMs - 9 * 60 * 60 * 1000;
//         setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");
//       } else {
//         setHoursWorked("00:00:00");
//         setOvertime("00:00:00");
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [checkInStatus]);

//   // ------------------ Handle check-in / check-out ------------------
//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);
//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type,
//           reason,
//           remarks,
//           lat: latitude,
//           lng: longitude,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Failed to mark attendance");
//       } else {
//         toast.success("Attendance marked successfully!");
//         fetchTodayAttendance();
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   if (!isClient) return <div className="p-4 text-gray-500">Loading...</div>;

//   const attendanceSummary = [
//     {
//       title: "Hours Worked Today",
//       value: hoursWorked,
//       icon: <FaClock className="text-gray-600" />,
//     },
//     {
//       title: "Overtime",
//       value: overtime,
//       icon: <FaCalendarAlt className="text-gray-600" />,
//     },
//     {
//       title: "Last Check-in",
//       value: checkInTime || "N/A",
//       icon: <FaRegCheckCircle className="text-gray-600" />,
//     },
//     {
//       title: "Last Check-out",
//       value: checkOutTime || "N/A",
//       icon: <FaRegCheckCircle className="text-gray-600" />,
//     },
//   ];

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="flex flex-col gap-4 p-4 border rounded-lg w-80 shadow-md bg-white/70 backdrop-blur">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {attendanceSummary.map((item) => (
//             <div
//               key={item.title}
//               className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg"
//             >
//               {item.icon}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-500">{item.title}</span>
//                 <span className="font-semibold">{item.value}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="p-3 bg-gray-100 rounded-md text-sm text-center">
//           {checkInStatus === "checkedIn" && checkInTime ? (
//             <p className="font-semibold text-green-600">
//               <FaRegCheckCircle className="inline-block mr-2" />
//               Checked in at {checkInTime}
//             </p>
//           ) : checkInStatus === "checkedOut" && checkOutTime ? (
//             <p className="font-semibold text-blue-600">
//               <FaRegCheckCircle className="inline-block mr-2" />
//               Checked out at {checkOutTime}
//             </p>
//           ) : (
//             <p>You are not checked in yet</p>
//           )}
//         </div>

//         {showReason && (
//           <div className="flex flex-col gap-2">
//             <textarea
//               placeholder="Reason (required)"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <textarea
//               placeholder="Remarks (optional)"
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <button
//               onClick={() => actionType && handleAttendance(actionType)}
//               disabled={loading || !reason}
//               className="relative bg-green-600 text-white py-2 rounded overflow-hidden"
//             >
//               {loading ? "Submitting..." : "Submit"}
//             </button>
//           </div>
//         )}

//         {!showReason && (
//           <>
//             <button
//               onClick={checkInClick}
//               disabled={loading || checkInStatus !== "notCheckedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${
//                 checkInStatus !== "notCheckedIn"
//                   ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//                   : "bg-blue-600 text-white"
//               }`}
//             >
//               {checkInStatus === "checkedIn" || checkInStatus === "checkedOut"
//                 ? "Already Checked In ✔️"
//                 : "Check In"}
//             </button>
//             <button
//               onClick={checkOutClick}
//               disabled={loading || checkInStatus !== "checkedIn"}
//               className={`relative py-2 rounded overflow-hidden transition-all duration-300 ${
//                 checkInStatus !== "checkedIn"
//                   ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//                   : "bg-red-600 text-white"
//               }`}
//             >
//               Check Out
//             </button>
//           </>
//         )}
//       </div>
//     </>
//   );
// }




// "use client";

// import { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { FaRegCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";
// import DailyAttendanceTable from "../attendance/employee/components/DailyAttendanceTable";

// export default function AttendanceButtons() {
//   // ------------------ State ------------------
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [showReason, setShowReason] = useState(false);
//   const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//   const [checkInStatus, setCheckInStatus] = useState<
//     "notCheckedIn" | "checkedIn" | "checkedOut"
//   >("notCheckedIn");
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
//   const [hoursWorked, setHoursWorked] = useState<string>("00:00:00");
//   const [overtime, setOvertime] = useState<string>("00:00:00");
//   const [isClient, setIsClient] = useState(false);
//   const [showTab, setShowTab] = useState<"today" | "monthly">("today");

//   // ------------------ Refs ------------------
//   const checkInDateRef = useRef<Date | null>(null);
//   const checkOutDateRef = useRef<Date | null>(null);

//   // ------------------ Helpers ------------------
//   const formatTime = (utcDate: string) => {
//     if (!utcDate) return null;
//     const d = new Date(utcDate);
//     return d.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDuration = (ms: number) => {
//     const h = Math.floor(ms / (1000 * 60 * 60))
//       .toString()
//       .padStart(2, "0");
//     const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
//       .toString()
//       .padStart(2, "0");
//     const s = Math.floor((ms % (1000 * 60)) / 1000)
//       .toString()
//       .padStart(2, "0");
//     return `${h}:${m}:${s}`;
//   };

//   // ------------------ Fetch Today's Attendance ------------------
//   const fetchTodayAttendance = async () => {
//     try {
//       const res = await fetch("/api/attendance/today");
//       const data = await res.json();

//       if (data.attendance) {
//         const att = data.attendance;
//         const checkedIn = !!att.checkIn;
//         const checkedOut = !!att.checkOut;

//         setCheckInStatus(
//           checkedOut ? "checkedOut" : checkedIn ? "checkedIn" : "notCheckedIn"
//         );

//         if (att.checkIn) {
//           checkInDateRef.current = new Date(att.checkIn);
//           setCheckInTime(formatTime(att.checkIn));
//         } else {
//           checkInDateRef.current = null;
//           setCheckInTime(null);
//         }

//         if (att.checkOut) {
//           checkOutDateRef.current = new Date(att.checkOut);
//           setCheckOutTime(formatTime(att.checkOut));
//         } else {
//           checkOutDateRef.current = null;
//           setCheckOutTime(null);
//         }
//       } else {
//         setCheckInStatus("notCheckedIn");
//         setCheckInTime(null);
//         setCheckOutTime(null);
//         checkInDateRef.current = null;
//         checkOutDateRef.current = null;
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//     }
//   };

//   // ------------------ Client-side & Live Update ------------------
//   useEffect(() => {
//     setIsClient(true);
//     fetchTodayAttendance();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (checkInStatus === "checkedIn" && checkInDateRef.current) {
//         const now = new Date();
//         const workedMs = now.getTime() - checkInDateRef.current.getTime();
//         setHoursWorked(formatDuration(workedMs));

//         const overtimeMs = workedMs - 9 * 60 * 60 * 1000;
//         setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");
//       } else if (
//         checkInStatus === "checkedOut" &&
//         checkInDateRef.current &&
//         checkOutDateRef.current
//       ) {
//         const workedMs =
//           checkOutDateRef.current.getTime() - checkInDateRef.current.getTime();
//         setHoursWorked(formatDuration(workedMs));

//         const overtimeMs = workedMs - 9 * 60 * 60 * 1000;
//         setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");
//       } else {
//         setHoursWorked("00:00:00");
//         setOvertime("00:00:00");
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [checkInStatus]);

//   // ------------------ Attendance Actions ------------------
//   const handleAttendance = async (type: "checkIn" | "checkOut") => {
//     setLoading(true);
//     try {
//       let latitude: number | null = null;
//       let longitude: number | null = null;

//       if (navigator.geolocation) {
//         await new Promise<void>((resolve) => {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => {
//               latitude = pos.coords.latitude;
//               longitude = pos.coords.longitude;
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         });
//       }

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type,
//           reason,
//           remarks,
//           lat: latitude,
//           lng: longitude,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Failed to mark attendance");
//       } else {
//         toast.success("Attendance marked successfully!");
//         fetchTodayAttendance();
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error marking attendance");
//     } finally {
//       setLoading(false);
//       setReason("");
//       setRemarks("");
//       setShowReason(false);
//       setActionType(null);
//     }
//   };

//   const checkInClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkIn");
//     if (hour >= 10) setShowReason(true);
//     else handleAttendance("checkIn");
//   };

//   const checkOutClick = () => {
//     const hour = new Date().getHours();
//     setActionType("checkOut");
//     if (hour < 19) setShowReason(true);
//     else handleAttendance("checkOut");
//   };

//   if (!isClient) return <div className="p-4 text-gray-500">Loading...</div>;

//   // ------------------ Attendance Summary ------------------
//   const attendanceSummary = [
//     {
//       title: "Hours Worked Today",
//       value: hoursWorked,
//       icon: <FaClock className="text-blue-600" />,
//     },
//     {
//       title: "Overtime",
//       value: overtime,
//       icon: <FaCalendarAlt className="text-red-600" />,
//     },
//     {
//       title: "Last Check-in",
//       value: checkInTime || "N/A",
//       icon: <FaRegCheckCircle className="text-green-600" />,
//     },
//     {
//       title: "Last Check-out",
//       value: checkOutTime || "N/A",
//       icon: <FaRegCheckCircle className="text-purple-600" />,
//     },
//   ];

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6 justify-center">
//         <button
//           onClick={() => setShowTab("today")}
//           className={`px-6 py-2 rounded-full font-semibold transition ${
//             showTab === "today"
//               ? "bg-blue-600 text-white shadow-lg"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           Today
//         </button>
//         <button
//           onClick={() => setShowTab("monthly")}
//           className={`px-6 py-2 rounded-full font-semibold transition ${
//             showTab === "monthly"
//               ? "bg-blue-600 text-white shadow-lg"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           Monthly
//         </button>
//       </div>

//       {/* Tab Content */}
//       {showTab === "today" && (
//         <div className="flex flex-col gap-6">
//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {attendanceSummary.map((item) => (
//               <div
//                 key={item.title}
//                 className="flex items-center gap-3 p-4 bg-gradient-to-r from-white to-blue-50 rounded-xl shadow hover:scale-105 transition-transform"
//               >
//                 <div className="text-2xl">{item.icon}</div>
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-500">{item.title}</span>
//                   <span className="font-bold text-lg">{item.value}</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Check-in/out status */}
//           <div className="p-4 bg-blue-50 rounded-xl text-center font-semibold text-gray-700">
//             {checkInStatus === "checkedIn" && checkInTime ? (
//               <p className="text-green-600">
//                 <FaRegCheckCircle className="inline-block mr-2" />
//                 Checked in at {checkInTime}
//               </p>
//             ) : checkInStatus === "checkedOut" && checkOutTime ? (
//               <p className="text-purple-600">
//                 <FaRegCheckCircle className="inline-block mr-2" />
//                 Checked out at {checkOutTime}
//               </p>
//             ) : (
//               <p>You are not checked in yet</p>
//             )}
//           </div>

//           {/* Reason / Remarks */}
//           {showReason && (
//             <div className="flex flex-col gap-3">
//               <textarea
//                 placeholder="Reason (required)"
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <textarea
//                 placeholder="Remarks (optional)"
//                 value={remarks}
//                 onChange={(e) => setRemarks(e.target.value)}
//                 className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <button
//                 onClick={() => actionType && handleAttendance(actionType)}
//                 disabled={loading || !reason}
//                 className="bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
//               >
//                 {loading ? "Submitting..." : "Submit"}
//               </button>
//             </div>
//           )}

//           {/* Check-in / Check-out Buttons */}
//           {!showReason && (
//             <div className="flex gap-3">
//               <button
//                 onClick={checkInClick}
//                 disabled={loading || checkInStatus !== "notCheckedIn"}
//                 className={`flex-1 py-3 rounded-xl font-semibold transition ${
//                   checkInStatus !== "notCheckedIn"
//                     ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                     : "bg-blue-600 text-white hover:bg-blue-700"
//                 }`}
//               >
//                 {checkInStatus === "checkedIn" || checkInStatus === "checkedOut"
//                   ? "Already Checked In ✔️"
//                   : "Check In"}
//               </button>
//               <button
//                 onClick={checkOutClick}
//                 disabled={loading || checkInStatus !== "checkedIn"}
//                 className={`flex-1 py-3 rounded-xl font-semibold transition ${
//                   checkInStatus !== "checkedIn"
//                     ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                     : "bg-red-600 text-white hover:bg-red-700"
//                 }`}
//               >
//                 Check Out
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {showTab === "monthly" && (
//         <div className="mt-6 bg-white p-4 rounded-xl shadow-lg">
//           <DailyAttendanceTable />
//         </div>
//       )}
//     </>
//   );
// }







// "use client";

// import { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// // Using modern/bold icons for impact
// import { FaPlayCircle, FaStopCircle, FaHourglassHalf, FaCalendarCheck, FaBolt, FaExclamationCircle, FaMapMarkerAlt, FaSyncAlt } from "react-icons/fa";
// import DailyAttendanceTable from "../attendance/employee/components/DailyAttendanceTable";

// // --- ATTENDANCE POLICY CONSTANTS (CUSTOMIZED) ---
// // Late Check-in is AFTER 10:00 AM
// const STANDARD_START_HOUR = 10; // 10 AM
// // Early Check-out is BEFORE 7:00 PM
// const STANDARD_END_HOUR = 19; // 7 PM (19:00)
// const STANDARD_WORK_HOURS_MS = 9 * 60 * 60 * 1000; // 9 hours (Standard shift length remains 9 hours)
// const GRACE_MINUTES = 0; // Removing grace period since you specified exactly 'after 10 AM'

// export default function AttendanceButtons() {
//     // ------------------ State ------------------
//     const [loading, setLoading] = useState(false);
//     const [reason, setReason] = useState("");
//     const [remarks, setRemarks] = useState("");
//     const [showReason, setShowReason] = useState(false);
//     const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//     const [checkInStatus, setCheckInStatus] = useState<
//         "notCheckedIn" | "checkedIn" | "checkedOut"
//     >("notCheckedIn");
//     const [checkInTime, setCheckInTime] = useState<string | null>(null);
//     const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
//     const [hoursWorked, setHoursWorked] = useState<string>("00:00:00");
//     const [overtime, setOvertime] = useState<string>("00:00:00");
//     const [tardinessDuration, setTardinessDuration] = useState<string>("00:00:00");
//     const [earlyExitDuration, setEarlyExitDuration] = useState<string>("00:00:00");
//     const [isClient, setIsClient] = useState(false);
//     const [showTab, setShowTab] = useState<"today" | "monthly">("today");

//     // 💡 NEW STATE FOR LOCATION MANAGEMENT
//     const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
//     const [locationError, setLocationError] = useState<string | null>(null);


//     // ------------------ Refs ------------------
//     const checkInDateRef = useRef<Date | null>(null);
//     const checkOutDateRef = useRef<Date | null>(null);

//     // ------------------ Helpers ------------------
//     const formatTime = (utcDate: string) => {
//         if (!utcDate) return null;
//         const d = new Date(utcDate);
//         // Use 12-hour clock with AM/PM for standard time display
//         return d.toLocaleTimeString("en-US", {
//             hour: "2-digit",
//             minute: "2-digit",
//         });
//     };

//     const formatDuration = (ms: number) => {
//         const absMs = Math.abs(ms);
//         const h = Math.floor(absMs / (1000 * 60 * 60))
//             .toString()
//             .padStart(2, "0");
//         const m = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60))
//             .toString()
//             .padStart(2, "0");
//         const s = Math.floor((absMs % (1000 * 60)) / 1000)
//             .toString()
//             .padStart(2, "0");
//         // Returns duration in HH:MM:SS format
//         return `${h}:${m}:${s}`;
//     };

//     // ------------------ Geolocation Fetcher ------------------
//     const fetchLocation = async (manualAttempt: boolean = false) => {
//         if (!navigator.geolocation) {
//             setLocationError("Geolocation is not supported by your browser.");
//             return;
//         }

//         // Only show loading if it's a manual or initial attempt, not during an attendance punch
//         if (manualAttempt || !currentLocation) {
//             setLoading(true);
//         }
//         setLocationError(null);
        
//         try {
//             await new Promise<void>((resolve, reject) => {
//                 navigator.geolocation.getCurrentPosition(
//                     (pos) => {
//                         setCurrentLocation({
//                             lat: pos.coords.latitude,
//                             lng: pos.coords.longitude,
//                         });
//                         resolve();
//                     },
//                     (err) => {
//                         console.error("Geolocation Error:", err);
//                         const errorMsg = 
//                             err.code === err.PERMISSION_DENIED 
//                                 ? "Location access denied. Please allow location access in your browser settings to punch in/out."
//                                 : "Failed to get location. Try again.";
//                         setLocationError(errorMsg);
//                         setCurrentLocation(null);
//                         reject(new Error(errorMsg));
//                     },
//                     { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//                 );
//             });
//         } catch (e) {
//             // Error handling already done in the promise reject
//         } finally {
//             if (manualAttempt || !currentLocation) {
//                 setLoading(false);
//             }
//         }
//     };


//     // ------------------ Fetch Today's Attendance ------------------
//     const fetchTodayAttendance = async () => {
//         try {
//             const res = await fetch("/api/attendance/today");
//             const data = await res.json();

//             if (data.attendance) {
//                 const att = data.attendance;
//                 const checkedOut = !!att.checkOut;

//                 setCheckInStatus(
//                     checkedOut ? "checkedOut" : !!att.checkIn ? "checkedIn" : "notCheckedIn"
//                 );

//                 if (att.checkIn) {
//                     checkInDateRef.current = new Date(att.checkIn);
//                     setCheckInTime(formatTime(att.checkIn));
//                 } else {
//                     checkInDateRef.current = null;
//                     setCheckInTime(null);
//                 }

//                 if (att.checkOut) {
//                     checkOutDateRef.current = new Date(att.checkOut);
//                     setCheckOutTime(formatTime(att.checkOut));
//                 } else {
//                     checkOutDateRef.current = null;
//                     setCheckOutTime(null);
//                 }
//             } else {
//                 setCheckInStatus("notCheckedIn");
//                 setCheckInTime(null);
//                 setCheckOutTime(null);
//                 checkInDateRef.current = null;
//                 checkOutDateRef.current = null;
//             }
//         } catch (err) {
//             console.error("Error fetching today's attendance:", err);
//         }
//     };

//     // ------------------ Client-side & Live Update ------------------
//     useEffect(() => {
//         setIsClient(true);
//         fetchTodayAttendance();
//         fetchLocation(); // 💡 TISH: Initial location fetch on load
//     }, []);

//     useEffect(() => {
//         const calculateDurations = () => {
//             let workedMs = 0;

//             if (checkInStatus === "checkedIn" && checkInDateRef.current) {
//                 const now = new Date();
//                 workedMs = now.getTime() - checkInDateRef.current.getTime();
//             } else if (
//                 checkInStatus === "checkedOut" &&
//                 checkInDateRef.current &&
//                 checkOutDateRef.current
//             ) {
//                 workedMs =
//                     checkOutDateRef.current.getTime() - checkInDateRef.current.getTime();
//             }

//             setHoursWorked(formatDuration(workedMs));
//             const overtimeMs = workedMs - STANDARD_WORK_HOURS_MS;
//             setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");

//             // --- LATE CHECK-IN LOGIC (After 10:00 AM) ---
//             if (checkInDateRef.current) {
//                 const standardStartTime = new Date(checkInDateRef.current);
//                 // Policy Check: 10:00 AM
//                 standardStartTime.setHours(STANDARD_START_HOUR, GRACE_MINUTES, 0, 0);

//                 const tardyMs = checkInDateRef.current.getTime() - standardStartTime.getTime();
//                 setTardinessDuration(tardyMs > 0 ? formatDuration(tardyMs) : "00:00:00");
//             } else {
//                 setTardinessDuration("00:00:00");
//             }

//             // --- EARLY CHECK-OUT LOGIC (Before 7:00 PM) ---
//             if (checkOutDateRef.current) {
//                 const standardEndTime = new Date(checkOutDateRef.current);
//                 // Policy Check: 7:00 PM
//                 standardEndTime.setHours(STANDARD_END_HOUR, 0, 0, 0);

//                 const earlyExitMs = standardEndTime.getTime() - checkOutDateRef.current.getTime();
//                 setEarlyExitDuration(earlyExitMs > 0 ? formatDuration(earlyExitMs) : "00:00:00");
//             } else {
//                 setEarlyExitDuration("00:00:00");
//             }

//             if (checkInStatus === "notCheckedIn") {
//                 setHoursWorked("00:00:00");
//                 setOvertime("00:00:00");
//                 setTardinessDuration("00:00:00");
//                 setEarlyExitDuration("00:00:00");
//             }
//         };

//         calculateDurations(); 

//         const interval = setInterval(() => {
//             if (checkInStatus === "checkedIn") {
//                 calculateDurations();
//             }
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [checkInStatus]);

//     // ------------------ Attendance Actions ------------------
//     const handleAttendance = async (type: "checkIn" | "checkOut") => {
//         setLoading(true);
        
//         // 💡 TISH'S CRITICAL LOGIC: BLOCK ATTENDANCE IF LOCATION IS MISSING/DENIED
//         if (!currentLocation) {
//             toast.error("Location is mandatory to mark attendance. Please allow location access and try again.");
//             setLoading(false);
//             // Optionally, force a location refresh attempt
//             fetchLocation(true); 
//             return;
//         }

//         try {
//             const latitude = currentLocation.lat;
//             const longitude = currentLocation.lng;

//             // No need to fetch location inside here anymore, it's done via state check above

//             const res = await fetch("/api/attendance", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     type,
//                     reason,
//                     remarks,
//                     lat: latitude,
//                     lng: longitude,
//                 }),
//             });

//             const data = await res.json();
//             if (!res.ok) {
//                 toast.error(data.error || `Failed to ${type === "checkIn" ? "Check-in" : "Check-out"}`);
//             } else {
//                 toast.success(`Successfully ${type === "checkIn" ? "Checked In" : "Checked Out"}!`);
//                 // Force a location refresh after a successful punch to update coordinates for the next action
//                 fetchLocation(); 
//                 fetchTodayAttendance();
//             }
//         } catch (err) {
//             console.error(err);
//             toast.error("Error marking attendance");
//         } finally {
//             setLoading(false);
//             setReason("");
//             setRemarks("");
//             setShowReason(false);
//             setActionType(null);
//         }
//     };

//     const checkInClick = () => {
//         const now = new Date();
//         const startBoundary = new Date(now);
//         // Check boundary is 10:00 AM (10:00)
//         startBoundary.setHours(STANDARD_START_HOUR, GRACE_MINUTES, 0, 0);

//         setActionType("checkIn");
//         // If check-in is after 10:00 AM, show reason
//         if (now.getTime() > startBoundary.getTime()) {
//             setShowReason(true);
//         } else {
//             handleAttendance("checkIn");
//         }
//     };

//     const checkOutClick = () => {
//         const now = new Date();
//         const endBoundary = new Date(now);
//         // Check boundary is 7:00 PM (19:00)
//         endBoundary.setHours(STANDARD_END_HOUR, 0, 0, 0);

//         setActionType("checkOut");
//         // If check-out is before 7:00 PM, show reason
//         if (now.getTime() < endBoundary.getTime()) {
//             setShowReason(true);
//         } else {
//             handleAttendance("checkOut");
//         }
//     };

//     // ------------------ Component Render Logic ------------------
//     if (!isClient) return <div className="p-8 bg-white rounded-xl shadow-2xl text-gray-500 text-center font-medium">Loading Employee Portal...</div>;

//     const isLate = tardinessDuration !== "00:00:00";
//     const isEarlyExit = earlyExitDuration !== "00:00:00";
//     const isLocationReady = !!currentLocation && !locationError;

//     let attendanceStatusText = "";
//     let attendanceStatusClass = "";
//     let attendanceStatusIcon = null;

//     if (checkInStatus === "checkedOut") {
//         if (isLate || isEarlyExit) {
//             attendanceStatusText = "Day Completed: Exceptions Found";
//             attendanceStatusClass = "bg-gradient-to-r from-red-500 to-orange-500 text-white";
//             attendanceStatusIcon = <FaExclamationCircle className="text-3xl" />;
//         } else {
//             attendanceStatusText = "Day Completed: Policy Compliant 🎉";
//             attendanceStatusClass = "bg-gradient-to-r from-green-500 to-green-700 text-white";
//             attendanceStatusIcon = <FaCalendarCheck className="text-3xl" />;
//         }
//     } else if (checkInStatus === "checkedIn") {
//         attendanceStatusText = "Currently Clocked In & Working";
//         attendanceStatusClass = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white animate-pulse-slow";
//         attendanceStatusIcon = <FaBolt className="text-3xl" />;
//     } else {
//         attendanceStatusText = "Ready to Start Day";
//         attendanceStatusClass = "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800";
//         attendanceStatusIcon = <FaHourglassHalf className="text-3xl" />;
//     }

//     const attendanceSummary = [
//         // ... (Summary items remain the same)
//         {
//             title: "Live Hours Worked",
//             value: hoursWorked,
//             icon: <FaHourglassHalf className="text-blue-500" />,
//             isWarning: false,
//             desc: "Time since your Check-in.",
//         },
//         {
//             title: "Overtime Clock",
//             value: overtime,
//             icon: <FaBolt className="text-purple-500" />,
//             isWarning: false,
//             desc: "Time worked beyond 9 hours.",
//         },
//         {
//             title: "Tardiness (Late)",
//             value: tardinessDuration,
//             icon: <FaExclamationCircle className="text-red-500" />,
//             isWarning: isLate,
//             bgColor: isLate ? "bg-red-50" : "bg-white",
//             desc: `After 10:00 AM (Policy).`,
//         },
//         {
//             title: "Early Exit",
//             value: earlyExitDuration,
//             icon: <FaExclamationCircle className="text-orange-500" />,
//             isWarning: isEarlyExit,
//             bgColor: isEarlyExit ? "bg-orange-50" : "bg-white",
//             desc: `Before 7:00 PM (Policy).`,
//         },
//     ];

//     return (
//         <div className="max-w-5xl mx-auto p-4 md:p-10 bg-gray-100 min-h-screen font-sans">
//             <Toaster position="top-center" reverseOrder={false} />

//             {/* Header and Tabs - Cleaned up */}
//             <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-white p-4 rounded-xl shadow-lg">
//                 <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-blue-600 pl-3">
//                     Employee Attendance Portal
//                 </h1>
//                 <div className="flex gap-2 p-1 rounded-full bg-gray-100 shadow-inner">
//                     <button
//                         onClick={() => setShowTab("today")}
//                         className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${
//                             showTab === "today"
//                                 ? "bg-blue-600 text-white shadow-xl scale-105"
//                                 : "text-gray-600 hover:bg-white"
//                         }`}
//                     >
//                         Today's Punch
//                     </button>
//                     <button
//                         onClick={() => setShowTab("monthly")}
//                         className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${
//                             showTab === "monthly"
//                                 ? "bg-blue-600 text-white shadow-xl scale-105"
//                                 : "text-gray-600 hover:bg-white"
//                         }`}
//                     >
//                         Monthly Records
//                     </button>
//                 </div>
//             </div>

//             {/* Location Status Bar (NEW FEATURE) */}
//             <div className={`p-4 rounded-xl shadow-md mb-6 flex items-center justify-between transition-colors duration-300 ${isLocationReady ? 'bg-green-100 border-l-4 border-green-500 text-green-800' : 'bg-red-100 border-l-4 border-red-500 text-red-800'}`}>
//                 <div className="flex items-center gap-3">
//                     <FaMapMarkerAlt className="text-2xl" />
//                     <p className="font-semibold">
//                         Location Status: 
//                         <span className={`font-bold ml-2 ${isLocationReady ? 'text-green-700' : 'text-red-700'}`}>
//                             {isLocationReady ? 'GPS Ready' : 'Location Required!'}
//                         </span>
//                         {isLocationReady && <span className="text-sm font-normal ml-2">({currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)})</span>}
//                     </p>
//                 </div>
//                 <button 
//                     onClick={() => fetchLocation(true)} 
//                     disabled={loading}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition duration-300 ${loading ? 'bg-gray-300 cursor-wait' : isLocationReady ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
//                 >
//                     <FaSyncAlt className={`${loading ? 'animate-spin' : ''}`} />
//                     {loading ? 'Fetching...' : 'Re-fetch Location'}
//                 </button>
//             </div>
//             {locationError && (
//                  <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg mb-6 text-sm font-medium">
//                     {locationError}
//                 </div>
//             )}
            
//             {/* Tab Content */}
//             {showTab === "today" && (
//                 <div className="flex flex-col gap-6">

//                     {/* Policy Status Card - Bold and Clear */}
//                     <div className={`p-6 rounded-3xl shadow-2xl transition duration-500 ${attendanceStatusClass}`}>
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-4">
//                                 {attendanceStatusIcon}
//                                 <div>
//                                     <h3 className="text-sm font-light uppercase opacity-90">Current Status</h3>
//                                     <p className="text-3xl font-extrabold">{attendanceStatusText}</p>
//                                 </div>
//                             </div>
//                             {/* 💥 LAST CHECK IN/OUT TIME DISPLAYED HERE 💥 */}
//                             <div className="text-right">
//                                 <p className="text-xl font-bold">
//                                     {checkInTime || '—'} <span className="text-sm font-light opacity-80">IN</span> / {checkOutTime || '—'} <span className="text-sm font-light opacity-80">OUT</span>
//                                 </p>
//                                 <p className="text-sm font-medium opacity-80 mt-1">
//                                     {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Summary Cards Grid - Premium Look with HH:MM:SS */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                         {attendanceSummary.map((item) => (
//                             <div
//                                 key={item.title}
//                                 className={`flex flex-col p-5 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-t-4 ${item.isWarning ? "border-red-500 bg-white" : "border-blue-500 bg-white"}`}
//                             >
//                                 <div className="flex items-center justify-between">
//                                     <span className={`text-xs font-semibold uppercase ${item.isWarning ? "text-red-700" : "text-gray-500"}`}>{item.title}</span>
//                                     <div className="text-2xl">{item.icon}</div>
//                                 </div>
                                
//                                 {/* Displays full HH:MM:SS format */}
//                                 <span className={`font-black text-3xl mt-2 tracking-wider ${item.isWarning ? "text-red-800" : "text-gray-900"}`}>
//                                     {item.value} 
//                                 </span>
                                
//                                 <p className="text-xs text-gray-400 mt-2 italic">{item.desc}</p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Reason / Remarks Form - Elevated Look */}
//                     {showReason && (
//                         <div className="p-6 bg-white rounded-2xl shadow-2xl border-t-8 border-yellow-500">
//                             <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                 <FaExclamationCircle className="text-yellow-500" />
//                                 Policy Exception Required
//                             </h3>
//                             <p className="text-gray-600 mb-4 border-b pb-4">
//                                 You are triggering an exception ({actionType === 'checkIn' ? 'Late Check-in' : 'Early Check-out'}). Please provide a required reason for HR verification.
//                             </p>
//                             <div className="flex flex-col gap-4">
//                                 <textarea
//                                     placeholder="Reason (required: why are you late/leaving early?)"
//                                     value={reason}
//                                     onChange={(e) => setReason(e.target.value)}
//                                     className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 min-h-[100px] transition duration-300 shadow-inner"
//                                 />
//                                 <textarea
//                                     placeholder="Remarks (optional: any additional notes for the manager)"
//                                     value={remarks}
//                                     onChange={(e) => setRemarks(e.target.value)}
//                                     className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 min-h-[80px] transition duration-300 shadow-inner"
//                                 />
//                                 <button
//                                     onClick={() => actionType && handleAttendance(actionType)}
//                                     disabled={loading || !reason || !isLocationReady} // 💡 LOCATION BLOCK ADDED HERE
//                                     className={`py-4 rounded-xl font-bold text-white transition duration-300 shadow-lg ${
//                                         loading || !reason || !isLocationReady ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.01] hover:shadow-xl"
//                                     }`}
//                                 >
//                                     {loading ? "Submitting Exception Request..." : !isLocationReady ? "Location Required to Submit" : `Submit & ${actionType === 'checkIn' ? 'PUNCH IN' : 'PUNCH OUT'}`}
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Check-in / Check-out Buttons - Large and Bold */}
//                     {!showReason && (
//                         <div className="flex flex-col sm:flex-row gap-6 mt-4">
//                             <button
//                                 onClick={checkInClick}
//                                 disabled={loading || checkInStatus !== "notCheckedIn" || !isLocationReady} // 💡 LOCATION BLOCK ADDED HERE
//                                 className={`flex-1 flex flex-col items-center justify-center gap-2 p-8 rounded-2xl font-black text-2xl transition duration-500 shadow-2xl border-b-8 ${
//                                     checkInStatus !== "notCheckedIn" || !isLocationReady
//                                         ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-500"
//                                         : "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transform hover:scale-[1.03] border-green-800"
//                                 }`}
//                             >
//                                 <FaPlayCircle className="text-4xl mb-1" />
//                                 {checkInStatus !== "notCheckedIn"
//                                     ? "Checked In/Out Today"
//                                     : !isLocationReady ? "Location Required" : "PUNCH IN"}
//                             </button>
//                             <button
//                                 onClick={checkOutClick}
//                                 disabled={loading || checkInStatus !== "checkedIn" || !isLocationReady} // 💡 LOCATION BLOCK ADDED HERE
//                                 className={`flex-1 flex flex-col items-center justify-center gap-2 p-8 rounded-2xl font-black text-2xl transition duration-500 shadow-2xl border-b-8 ${
//                                     checkInStatus !== "checkedIn" || !isLocationReady
//                                         ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-500"
//                                         : "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transform hover:scale-[1.03] border-red-800"
//                                 }`}
//                             >
//                                 <FaStopCircle className="text-4xl mb-1" />
//                                 {!isLocationReady ? "Location Required" : "PUNCH OUT"}
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Monthly View - Styled Card */}
//             {showTab === "monthly" && (
//                 <div className="mt-6 bg-white p-8 rounded-2xl shadow-2xl">
//                     <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 pb-3 border-blue-100">
//                         Monthly Payroll Summary
//                     </h2>
//                     <p className="text-gray-600 mb-6 italic">
//                         This view provides the high-level data used for payroll processing, tracking all compliance, leave, and total working hours.
//                     </p>
//                     <DailyAttendanceTable />
//                 </div>
//             )}
//         </div>
//     );
// }














// "use client";

// import { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { 
//     FaPlayCircle, FaStopCircle, FaHourglassHalf, FaCalendarCheck, 
//     FaBolt, FaExclamationCircle, FaMapMarkerAlt, FaSyncAlt 
// } from "react-icons/fa";
// import DailyAttendanceTable from "../attendance/employee/components/DailyAttendanceTable";

// // --- ATTENDANCE POLICY CONSTANTS ---
// const STANDARD_START_HOUR = 10; // 10 AM
// const STANDARD_END_HOUR = 19; // 7 PM
// const STANDARD_WORK_HOURS_MS = 9 * 60 * 60 * 1000; // 9 hours
// const GRACE_MINUTES = 0; // No grace period

// export default function AttendanceButtons() {
//     // ------------------ State ------------------
//     const [loading, setLoading] = useState(false);
//     const [reason, setReason] = useState("");
//     const [remarks, setRemarks] = useState("");
//     const [showReason, setShowReason] = useState(false);
//     const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
//     const [checkInStatus, setCheckInStatus] = useState<"notCheckedIn" | "checkedIn" | "checkedOut">("notCheckedIn");
//     const [checkInTime, setCheckInTime] = useState<string | null>(null);
//     const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
//     const [hoursWorked, setHoursWorked] = useState<string>("00:00:00");
//     const [overtime, setOvertime] = useState<string>("00:00:00");
//     const [tardinessDuration, setTardinessDuration] = useState<string>("00:00:00");
//     const [earlyExitDuration, setEarlyExitDuration] = useState<string>("00:00:00");
//     const [isClient, setIsClient] = useState(false);
//     const [showTab, setShowTab] = useState<"today" | "monthly">("today");
//     const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
//     const [locationError, setLocationError] = useState<string | null>(null);

//     // ------------------ Refs ------------------
//     const checkInDateRef = useRef<Date | null>(null);
//     const checkOutDateRef = useRef<Date | null>(null);

//     // ------------------ Helpers ------------------
//     const formatTime = (utcDate: string) => {
//         if (!utcDate) return null;
//         const d = new Date(utcDate);
//         return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//     };

//     const formatDuration = (ms: number) => {
//         const absMs = Math.abs(ms);
//         const h = Math.floor(absMs / (1000 * 60 * 60)).toString().padStart(2, "0");
//         const m = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
//         const s = Math.floor((absMs % (1000 * 60)) / 1000).toString().padStart(2, "0");
//         return `${h}:${m}:${s}`;
//     };

//     // ------------------ Geolocation ------------------
//     const fetchLocation = async (manualAttempt: boolean = false) => {
//         if (!navigator.geolocation) {
//             setLocationError("Geolocation not supported by your browser.");
//             return;
//         }
//         if (manualAttempt || !currentLocation) setLoading(true);
//         setLocationError(null);

//         try {
//             await new Promise<void>((resolve, reject) => {
//                 navigator.geolocation.getCurrentPosition(
//                     (pos) => {
//                         setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//                         resolve();
//                     },
//                     (err) => {
//                         const errorMsg = err.code === err.PERMISSION_DENIED 
//                             ? "Location access denied. Please allow location access in browser settings."
//                             : "Failed to get location. Try again.";
//                         setLocationError(errorMsg);
//                         setCurrentLocation(null);
//                         reject(new Error(errorMsg));
//                     },
//                     { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//                 );
//             });
//         } catch {}
//         finally { if (manualAttempt || !currentLocation) setLoading(false); }
//     };

//     // ------------------ Fetch Today's Attendance ------------------
//     const fetchTodayAttendance = async () => {
//         try {
//             const res = await fetch("/api/attendance/today");
//             const data = await res.json();
//             if (data.attendance) {
//                 const att = data.attendance;
//                 const checkedOut = !!att.checkOut;

//                 setCheckInStatus(checkedOut ? "checkedOut" : !!att.checkIn ? "checkedIn" : "notCheckedIn");
//                 if (att.checkIn) { checkInDateRef.current = new Date(att.checkIn); setCheckInTime(formatTime(att.checkIn)); } 
//                 else { checkInDateRef.current = null; setCheckInTime(null); }
//                 if (att.checkOut) { checkOutDateRef.current = new Date(att.checkOut); setCheckOutTime(formatTime(att.checkOut)); } 
//                 else { checkOutDateRef.current = null; setCheckOutTime(null); }
//             } else {
//                 setCheckInStatus("notCheckedIn");
//                 setCheckInTime(null); setCheckOutTime(null); checkInDateRef.current = null; checkOutDateRef.current = null;
//             }
//         } catch (err) { console.error("Error fetching today's attendance:", err); }
//     };

//     // ------------------ Client-side Effects ------------------
//     useEffect(() => { setIsClient(true); fetchTodayAttendance(); fetchLocation(); }, []);

//     useEffect(() => {
//         const calculateDurations = () => {
//             let workedMs = 0;
//             if (checkInStatus === "checkedIn" && checkInDateRef.current) workedMs = new Date().getTime() - checkInDateRef.current.getTime();
//             else if (checkInStatus === "checkedOut" && checkInDateRef.current && checkOutDateRef.current) workedMs = checkOutDateRef.current.getTime() - checkInDateRef.current.getTime();

//             setHoursWorked(formatDuration(workedMs));
//             const overtimeMs = workedMs - STANDARD_WORK_HOURS_MS;
//             setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");

//             if (checkInDateRef.current) {
//                 const standardStartTime = new Date(checkInDateRef.current); standardStartTime.setHours(STANDARD_START_HOUR, GRACE_MINUTES, 0, 0);
//                 const tardyMs = checkInDateRef.current.getTime() - standardStartTime.getTime();
//                 setTardinessDuration(tardyMs > 0 ? formatDuration(tardyMs) : "00:00:00");
//             } else setTardinessDuration("00:00:00");

//             if (checkOutDateRef.current) {
//                 const standardEndTime = new Date(checkOutDateRef.current); standardEndTime.setHours(STANDARD_END_HOUR, 0, 0, 0);
//                 const earlyExitMs = standardEndTime.getTime() - checkOutDateRef.current.getTime();
//                 setEarlyExitDuration(earlyExitMs > 0 ? formatDuration(earlyExitMs) : "00:00:00");
//             } else setEarlyExitDuration("00:00:00");

//             if (checkInStatus === "notCheckedIn") { setHoursWorked("00:00:00"); setOvertime("00:00:00"); setTardinessDuration("00:00:00"); setEarlyExitDuration("00:00:00"); }
//         };

//         calculateDurations();
//         const interval = setInterval(() => { if (checkInStatus === "checkedIn") calculateDurations(); }, 1000);
//         return () => clearInterval(interval);
//     }, [checkInStatus]);

//     // ------------------ Attendance Actions ------------------
//     const handleAttendance = async (type: "checkIn" | "checkOut") => {
//         setLoading(true);
//         if (!currentLocation) { toast.error("Location is mandatory."); setLoading(false); fetchLocation(true); return; }

//         try {
//             const res = await fetch("/api/attendance", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ type, reason, remarks, lat: currentLocation.lat, lng: currentLocation.lng }),
//             });
//             const data = await res.json();
//             if (!res.ok) toast.error(data.error || `Failed to ${type}`);
//             else { toast.success(`Successfully ${type === "checkIn" ? "Checked In" : "Checked Out"}!`); fetchLocation(); fetchTodayAttendance(); }
//         } catch { toast.error("Error marking attendance"); }
//         finally { setLoading(false); setReason(""); setRemarks(""); setShowReason(false); setActionType(null); }
//     };

//     const checkInClick = () => {
//         const now = new Date(); const startBoundary = new Date(now); startBoundary.setHours(STANDARD_START_HOUR, GRACE_MINUTES, 0, 0);
//         setActionType("checkIn");
//         if (now.getTime() > startBoundary.getTime()) setShowReason(true);
//         else handleAttendance("checkIn");
//     };

//     const checkOutClick = () => {
//         const now = new Date(); const endBoundary = new Date(now); endBoundary.setHours(STANDARD_END_HOUR, 0, 0, 0);
//         setActionType("checkOut");
//         if (now.getTime() < endBoundary.getTime()) setShowReason(true);
//         else handleAttendance("checkOut");
//     };

//     // ------------------ Render ------------------
//     if (!isClient) return <div className="p-8 bg-white rounded-xl shadow-2xl text-gray-500 text-center font-medium">Loading Employee Portal...</div>;

//     const isLate = tardinessDuration !== "00:00:00";
//     const isEarlyExit = earlyExitDuration !== "00:00:00";
//     const isLocationReady = !!currentLocation && !locationError;

//     let attendanceStatusText = "", attendanceStatusClass = "", attendanceStatusIcon = null;
//     if (checkInStatus === "checkedOut") {
//         if (isLate || isEarlyExit) { attendanceStatusText = "Day Completed: Exceptions Found"; attendanceStatusClass = "bg-gradient-to-r from-red-500 to-orange-500 text-white"; attendanceStatusIcon = <FaExclamationCircle className="text-3xl" />; }
//         else { attendanceStatusText = "Day Completed: Policy Compliant 🎉"; attendanceStatusClass = "bg-gradient-to-r from-green-500 to-green-700 text-white"; attendanceStatusIcon = <FaCalendarCheck className="text-3xl" />; }
//     } else if (checkInStatus === "checkedIn") { attendanceStatusText = "Currently Clocked In & Working"; attendanceStatusClass = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white animate-pulse-slow"; attendanceStatusIcon = <FaBolt className="text-3xl" />; }
//     else { attendanceStatusText = "Ready to Start Day"; attendanceStatusClass = "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800"; attendanceStatusIcon = <FaHourglassHalf className="text-3xl" />; }

//     const attendanceSummary = [
//         { title: "Live Hours Worked", value: hoursWorked, icon: <FaHourglassHalf className="text-blue-500" />, isWarning: false, desc: "Time since your Check-in." },
//         { title: "Overtime Clock", value: overtime, icon: <FaBolt className="text-purple-500" />, isWarning: false, desc: "Time worked beyond 9 hours." },
//         { title: "Tardiness (Late)", value: tardinessDuration, icon: <FaExclamationCircle className="text-red-500" />, isWarning: isLate, bgColor: isLate ? "bg-red-50" : "bg-white", desc: "After 10:00 AM (Policy)." },
//         { title: "Early Exit", value: earlyExitDuration, icon: <FaExclamationCircle className="text-orange-500" />, isWarning: isEarlyExit, bgColor: isEarlyExit ? "bg-orange-50" : "bg-white", desc: "Before 7:00 PM (Policy)." },
//     ];

//     return (
//         <div className="max-w-5xl mx-auto p-4 md:p-10 bg-gray-100 min-h-screen font-sans">
//             <Toaster position="top-center" reverseOrder={false} />

//             {/* Header and Tabs */}
//             <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-white p-4 rounded-xl shadow-lg">
//                 <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-blue-600 pl-3">Employee Attendance Portal</h1>
//                 <div className="flex gap-2 p-1 rounded-full bg-gray-100 shadow-inner">
//                     <button onClick={() => setShowTab("today")} className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${showTab === "today" ? "bg-blue-600 text-white shadow-xl scale-105" : "text-gray-600 hover:bg-white"}`}>Today's Punch</button>
//                     <button onClick={() => setShowTab("monthly")} className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${showTab === "monthly" ? "bg-blue-600 text-white shadow-xl scale-105" : "text-gray-600 hover:bg-white"}`}>Monthly Records</button>
//                 </div>
//             </div>

//             {/* Location Status */}
//             <div className={`p-4 rounded-xl shadow-md mb-6 flex items-center justify-between transition-colors duration-300 ${isLocationReady ? 'bg-green-100 border-l-4 border-green-500 text-green-800' : 'bg-red-100 border-l-4 border-red-500 text-red-800'}`}>
//                 <div className="flex items-center gap-3">
//                     <FaMapMarkerAlt className="text-2xl" />
//                     <p className="font-semibold">
//                         Location Status: 
//                         <span className={`font-bold ml-2 ${isLocationReady ? 'text-green-700' : 'text-red-700'}`}>{isLocationReady ? 'GPS Ready' : 'Location Required!'}</span>
//                         {isLocationReady && <span className="text-sm font-normal ml-2">({currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)})</span>}
//                     </p>
//                 </div>
//                 <button onClick={() => fetchLocation(true)} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition duration-300 ${loading ? 'bg-gray-300 cursor-wait' : isLocationReady ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
//                     <FaSyncAlt className={`${loading ? 'animate-spin' : ''}`} />
//                     {loading ? 'Fetching...' : 'Re-fetch Location'}
//                 </button>
//             </div>
//             {locationError && <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg mb-6 text-sm font-medium">{locationError}</div>}

//             {/* Tab Content */}
//             {showTab === "today" && (
//                 <div className="flex flex-col gap-6">
//                     {/* Policy Status Card */}
//                     <div className={`p-6 rounded-3xl shadow-2xl transition duration-500 ${attendanceStatusClass}`}>
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-4">{attendanceStatusIcon}<div><h3 className="text-sm font-light uppercase opacity-90">Current Status</h3><p className="text-3xl font-extrabold">{attendanceStatusText}</p></div></div>
//                             <div className="text-right"><p className="text-xl font-bold">{checkInTime || '—'} <span className="text-sm font-light opacity-80">IN</span> / {checkOutTime || '—'} <span className="text-sm font-light opacity-80">OUT</span></p><p className="text-sm font-medium opacity-80 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p></div>
//                         </div>
//                     </div>

//                     {/* Summary Cards */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                         {attendanceSummary.map(item => (
//                             <div key={item.title} className={`flex flex-col p-5 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-t-4 ${item.isWarning ? "border-red-500 bg-white" : "border-blue-500 bg-white"}`}>
//                                 <div className="flex items-center justify-between"><span className={`text-xs font-semibold uppercase ${item.isWarning ? "text-red-700" : "text-gray-500"}`}>{item.title}</span><div className="text-2xl">{item.icon}</div></div>
//                                 <span className={`font-black text-3xl mt-2 tracking-wider ${item.isWarning ? "text-red-800" : "text-gray-900"}`}>{item.value}</span>
//                                 <p className="text-xs text-gray-400 mt-2 italic">{item.desc}</p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Reason / Remarks */}
//                     {showReason && (
//                         <div className="p-6 bg-white rounded-2xl shadow-2xl border-t-8 border-yellow-500">
//                             <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaExclamationCircle className="text-yellow-500" />Policy Exception Required</h3>
//                             <p className="text-gray-600 mb-4 border-b pb-4">You are triggering an exception ({actionType === 'checkIn' ? 'Late Check-in' : 'Early Check-out'}). Please provide a reason.</p>
//                             <div className="flex flex-col gap-4">
//                                 <textarea placeholder="Reason (required)" value={reason} onChange={e => setReason(e.target.value)} className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 min-h-[100px] transition duration-300 shadow-inner" />
//                                 <textarea placeholder="Remarks (optional)" value={remarks} onChange={e => setRemarks(e.target.value)} className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 min-h-[80px] transition duration-300 shadow-inner" />
//                                 <button onClick={() => actionType && handleAttendance(actionType)} disabled={loading || !reason || !isLocationReady} className={`py-4 rounded-xl font-bold text-white transition duration-300 shadow-lg ${loading || !reason || !isLocationReady ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.01] hover:shadow-xl"}`}>{loading ? "Submitting..." : !isLocationReady ? "Location Required" : `Submit & ${actionType === 'checkIn' ? 'PUNCH IN' : 'PUNCH OUT'}`}</button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Check-in / Check-out Buttons */}
//                     {!showReason && (
//                         <div className="flex flex-col sm:flex-row gap-6 mt-4">
//                             <button onClick={checkInClick} disabled={loading || checkInStatus !== "notCheckedIn" || !isLocationReady} className={`flex-1 flex flex-col items-center justify-center gap-2 p-8 rounded-2xl font-black text-2xl transition duration-500 shadow-2xl border-b-8 ${checkInStatus !== "notCheckedIn" || !isLocationReady ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-500" : "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transform hover:scale-[1.03] border-green-800"}`}><FaPlayCircle className="text-4xl mb-1" />{checkInStatus !== "notCheckedIn" ? "Checked In/Out Today" : !isLocationReady ? "Location Required" : "PUNCH IN"}</button>
//                             <button onClick={checkOutClick} disabled={loading || checkInStatus !== "checkedIn" || !isLocationReady} className={`flex-1 flex flex-col items-center justify-center gap-2 p-8 rounded-2xl font-black text-2xl transition duration-500 shadow-2xl border-b-8 ${checkInStatus !== "checkedIn" || !isLocationReady ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-500" : "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transform hover:scale-[1.03] border-red-800"}`}><FaStopCircle className="text-4xl mb-1" />{!isLocationReady ? "Location Required" : "PUNCH OUT"}</button>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Monthly View */}
//             {showTab === "monthly" && (
//                 <div className="mt-6 bg-white p-8 rounded-2xl shadow-2xl">
//                     <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 pb-3 border-blue-100">Monthly Payroll Summary</h2>
//                     <p className="text-gray-600 mb-6 italic">High-level data for payroll processing, tracking compliance, leave, and working hours.</p>
//                     <DailyAttendanceTable />
//                 </div>
//             )}
//         </div>
//     );
// }




"use client";

import { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
    FaPlayCircle, FaStopCircle, FaHourglassHalf, FaCalendarCheck, 
    FaBolt, FaExclamationCircle, FaMapMarkerAlt, FaSyncAlt, FaHeart 
} from "react-icons/fa";
import DailyAttendanceTable from "../attendance/employee/components/DailyAttendanceTable";
// 1. IMPORT THE NEW COMPONENT
import Motivation from "../attendance/employee/components/Motivation";

// --- ATTENDANCE POLICY CONSTANTS ---
const STANDARD_START_HOUR = 10; // 10 AM
const STANDARD_END_HOUR = 19; // 7 PM
const STANDARD_WORK_HOURS_MS = 9 * 60 * 60 * 1000; // 9 hours
const GRACE_MINUTES = 0; // No grace period

// Define the type for the tabs, including the new 'motivation' tab
type TabType = "today" | "monthly" | "Marathon";

export default function AttendanceButtons() {
    // ------------------ State ------------------
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const [remarks, setRemarks] = useState("");
    const [showReason, setShowReason] = useState(false);
    const [actionType, setActionType] = useState<"checkIn" | "checkOut" | null>(null);
    const [checkInStatus, setCheckInStatus] = useState<"notCheckedIn" | "checkedIn" | "checkedOut">("notCheckedIn");
    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
    const [hoursWorked, setHoursWorked] = useState<string>("00:00:00");
    const [overtime, setOvertime] = useState<string>("00:00:00");
    const [tardinessDuration, setTardinessDuration] = useState<string>("00:00:00");
    const [earlyExitDuration, setEarlyExitDuration] = useState<string>("00:00:00");
    const [isClient, setIsClient] = useState(false);
    // 2. UPDATE STATE TO INCLUDE NEW TAB TYPE
    const [showTab, setShowTab] = useState<TabType>("today"); 
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    // ------------------ Refs ------------------
    const checkInDateRef = useRef<Date | null>(null);
    const checkOutDateRef = useRef<Date | null>(null);

    // ------------------ Helpers ------------------
    const formatTime = (utcDate: string) => {
        if (!utcDate) return null;
        const d = new Date(utcDate);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const formatDuration = (ms: number) => {
        const absMs = Math.abs(ms);
        const h = Math.floor(absMs / (1000 * 60 * 60)).toString().padStart(2, "0");
        const m = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
        const s = Math.floor((absMs % (1000 * 60)) / 1000).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    // ------------------ Geolocation ------------------
    const fetchLocation = async (manualAttempt: boolean = false) => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported by your browser.");
            return;
        }
        if (manualAttempt || !currentLocation) setLoading(true);
        setLocationError(null);

        try {
            await new Promise<void>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        resolve();
                    },
                    (err) => {
                        const errorMsg = err.code === err.PERMISSION_DENIED 
                            ? "Location access denied. Please allow location access in browser settings."
                            : "Failed to get location. Try again.";
                        setLocationError(errorMsg);
                        setCurrentLocation(null);
                        reject(new Error(errorMsg));
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                );
            });
        } catch {}
        finally { if (manualAttempt || !currentLocation) setLoading(false); }
    };

    // ------------------ Fetch Today's Attendance ------------------
    const fetchTodayAttendance = async () => {
        try {
            const res = await fetch("/api/attendance/today");
            const data = await res.json();
            if (data.attendance) {
                const att = data.attendance;
                const checkedOut = !!att.checkOut;

                setCheckInStatus(checkedOut ? "checkedOut" : !!att.checkIn ? "checkedIn" : "notCheckedIn");
                if (att.checkIn) { checkInDateRef.current = new Date(att.checkIn); setCheckInTime(formatTime(att.checkIn)); } 
                else { checkInDateRef.current = null; setCheckInTime(null); }
                if (att.checkOut) { checkOutDateRef.current = new Date(att.checkOut); setCheckOutTime(formatTime(att.checkOut)); } 
                else { checkOutDateRef.current = null; setCheckOutTime(null); }
            } else {
                setCheckInStatus("notCheckedIn");
                setCheckInTime(null); setCheckOutTime(null); checkInDateRef.current = null; checkOutDateRef.current = null;
            }
        } catch (err) { console.error("Error fetching today's attendance:", err); }
    };

    // ------------------ Client-side Effects ------------------
    useEffect(() => { setIsClient(true); fetchTodayAttendance(); fetchLocation(); }, []);

    useEffect(() => {
        const calculateDurations = () => {
            let workedMs = 0;
            if (checkInStatus === "checkedIn" && checkInDateRef.current) workedMs = new Date().getTime() - checkInDateRef.current.getTime();
            else if (checkInStatus === "checkedOut" && checkInDateRef.current && checkOutDateRef.current) workedMs = checkOutDateRef.current.getTime() - checkInDateRef.current.getTime();

            setHoursWorked(formatDuration(workedMs));
            const overtimeMs = workedMs - STANDARD_WORK_HOURS_MS;
            setOvertime(overtimeMs > 0 ? formatDuration(overtimeMs) : "00:00:00");

            if (checkInDateRef.current) {
                const standardStartTime = new Date(checkInDateRef.current); standardStartTime.setHours(STANDARD_START_HOUR, GRACE_MINUTES, 0, 0);
                const tardyMs = checkInDateRef.current.getTime() - standardStartTime.getTime();
                setTardinessDuration(tardyMs > 0 ? formatDuration(tardyMs) : "00:00:00");
            } else setTardinessDuration("00:00:00");

            if (checkOutDateRef.current) {
                const standardEndTime = new Date(checkOutDateRef.current); standardEndTime.setHours(STANDARD_END_HOUR, 0, 0, 0);
                const earlyExitMs = standardEndTime.getTime() - checkOutDateRef.current.getTime();
                setEarlyExitDuration(earlyExitMs > 0 ? formatDuration(earlyExitMs) : "00:00:00");
            } else setEarlyExitDuration("00:00:00");

            if (checkInStatus === "notCheckedIn") { setHoursWorked("00:00:00"); setOvertime("00:00:00"); setTardinessDuration("00:00:00"); setEarlyExitDuration("00:00:00"); }
        };

        calculateDurations();
        const interval = setInterval(() => { if (checkInStatus === "checkedIn") calculateDurations(); }, 1000);
        return () => clearInterval(interval);
    }, [checkInStatus]);

    // ------------------ Attendance Actions ------------------
    const handleAttendance = async (type: "checkIn" | "checkOut") => {
        setLoading(true);
        if (!currentLocation) { toast.error("Location is mandatory."); setLoading(false); fetchLocation(true); return; }

        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, reason, remarks, lat: currentLocation.lat, lng: currentLocation.lng }),
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error || `Failed to ${type}`);
            else { toast.success(`Successfully ${type === "checkIn" ? "Checked In" : "Checked Out"}!`); fetchLocation(); fetchTodayAttendance(); }
        } catch { toast.error("Error marking attendance"); }
        finally { setLoading(false); setReason(""); setRemarks(""); setShowReason(false); setActionType(null); }
    };

    const checkInClick = () => {
        const now = new Date(); const startBoundary = new Date(now); startBoundary.setHours(STANDARD_START_HOUR, GRACE_MINUTES, 0, 0);
        setActionType("checkIn");
        if (now.getTime() > startBoundary.getTime()) setShowReason(true);
        else handleAttendance("checkIn");
    };

    const checkOutClick = () => {
        const now = new Date(); const endBoundary = new Date(now); endBoundary.setHours(STANDARD_END_HOUR, 0, 0, 0);
        setActionType("checkOut");
        if (now.getTime() < endBoundary.getTime()) setShowReason(true);
        else handleAttendance("checkOut");
    };

    // ------------------ Render ------------------
    if (!isClient) return <div className="p-8 bg-white rounded-xl shadow-2xl text-gray-500 text-center font-medium">Loading Employee Portal...</div>;

    const isLate = tardinessDuration !== "00:00:00";
    const isEarlyExit = earlyExitDuration !== "00:00:00";
    const isLocationReady = !!currentLocation && !locationError;

    let attendanceStatusText = "", attendanceStatusClass = "", attendanceStatusIcon = null;
    if (checkInStatus === "checkedOut") {
        if (isLate || isEarlyExit) { attendanceStatusText = "Day Completed: Exceptions Found"; attendanceStatusClass = "bg-gradient-to-r from-red-500 to-orange-500 text-white"; attendanceStatusIcon = <FaExclamationCircle className="text-3xl" />; }
        else { attendanceStatusText = "Day Completed: Policy Compliant 🎉"; attendanceStatusClass = "bg-gradient-to-r from-green-500 to-green-700 text-white"; attendanceStatusIcon = <FaCalendarCheck className="text-3xl" />; }
    } else if (checkInStatus === "checkedIn") { attendanceStatusText = "Currently Clocked In & Working"; attendanceStatusClass = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white animate-pulse-slow"; attendanceStatusIcon = <FaBolt className="text-3xl" />; }
    else { attendanceStatusText = "Ready to Start Day"; attendanceStatusClass = "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800"; attendanceStatusIcon = <FaHourglassHalf className="text-3xl" />; }

    const attendanceSummary = [
        { title: "Live Hours Worked", value: hoursWorked, icon: <FaHourglassHalf className="text-blue-500" />, isWarning: false, desc: "Time since your Check-in." },
        { title: "Overtime Clock", value: overtime, icon: <FaBolt className="text-purple-500" />, isWarning: false, desc: "Time worked beyond 9 hours." },
        { title: "Tardiness (Late)", value: tardinessDuration, icon: <FaExclamationCircle className="text-red-500" />, isWarning: isLate, bgColor: isLate ? "bg-red-50" : "bg-white", desc: "After 10:00 AM (Policy)." },
        { title: "Early Exit", value: earlyExitDuration, icon: <FaExclamationCircle className="text-orange-500" />, isWarning: isEarlyExit, bgColor: isEarlyExit ? "bg-orange-50" : "bg-white", desc: "Before 7:00 PM (Policy)." },
    ];

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 bg-gray-100 min-h-screen font-sans">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Header and Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-white p-4 rounded-xl shadow-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-blue-600 pl-3">Employee Attendance Portal</h1>
                <div className="flex gap-2 p-1 rounded-full bg-gray-100 shadow-inner">
                    <button onClick={() => setShowTab("today")} className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${showTab === "today" ? "bg-blue-600 text-white shadow-xl scale-105" : "text-gray-600 hover:bg-white"}`}>Today's Punch</button>
                    <button onClick={() => setShowTab("monthly")} className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${showTab === "monthly" ? "bg-blue-600 text-white shadow-xl scale-105" : "text-gray-600 hover:bg-white"}`}>Monthly Records</button>
                    {/* 3. ADD THE NEW TAB BUTTON */}
                    <button onClick={() => setShowTab("Marathon")} className={`px-5 py-2 rounded-full font-bold transition duration-300 transform ${showTab === "Marathon" ? "bg-blue-600 text-white shadow-xl scale-105" : "text-gray-600 hover:bg-white"}`}>Marathon <FaHeart className="inline ml-1 text-pink-300"/></button>
                </div>
            </div>

            {/* Location Status (Only visible on the 'Today' tab) */}
            {showTab === "today" && (
                <>
                    <div className={`p-4 rounded-xl shadow-md mb-6 flex items-center justify-between transition-colors duration-300 ${isLocationReady ? 'bg-green-100 border-l-4 border-green-500 text-green-800' : 'bg-red-100 border-l-4 border-red-500 text-red-800'}`}>
                        <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-2xl" />
                            <p className="font-semibold">
                                Location Status: 
                                <span className={`font-bold ml-2 ${isLocationReady ? 'text-green-700' : 'text-red-700'}`}>{isLocationReady ? 'GPS Ready' : 'Location Required!'}</span>
                                {isLocationReady && <span className="text-sm font-normal ml-2">({currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)})</span>}
                            </p>
                        </div>
                        <button onClick={() => fetchLocation(true)} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition duration-300 ${loading ? 'bg-gray-300 cursor-wait' : isLocationReady ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                            <FaSyncAlt className={`${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Fetching...' : 'Re-fetch Location'}
                        </button>
                    </div>
                    {locationError && <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg mb-6 text-sm font-medium">{locationError}</div>}
                </>
            )}

            {/* Tab Content */}
            {showTab === "today" && (
                <div className="flex flex-col gap-6">
                    {/* Policy Status Card */}
                    <div className={`p-6 rounded-3xl shadow-2xl transition duration-500 ${attendanceStatusClass}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">{attendanceStatusIcon}<div><h3 className="text-sm font-light uppercase opacity-90">Current Status</h3><p className="text-3xl font-extrabold">{attendanceStatusText}</p></div></div>
                            <div className="text-right"><p className="text-xl font-bold">{checkInTime || '—'} <span className="text-sm font-light opacity-80">IN</span> / {checkOutTime || '—'} <span className="text-sm font-light opacity-80">OUT</span></p><p className="text-sm font-medium opacity-80 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p></div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {attendanceSummary.map(item => (
                            <div key={item.title} className={`flex flex-col p-5 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-t-4 ${item.isWarning ? "border-red-500 bg-white" : "border-blue-500 bg-white"}`}>
                                <div className="flex items-center justify-between"><span className={`text-xs font-semibold uppercase ${item.isWarning ? "text-red-700" : "text-gray-500"}`}>{item.title}</span><div className="text-2xl">{item.icon}</div></div>
                                <span className={`font-black text-3xl mt-2 tracking-wider ${item.isWarning ? "text-red-800" : "text-gray-900"}`}>{item.value}</span>
                                <p className="text-xs text-gray-400 mt-2 italic">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reason / Remarks */}
                    {showReason && (
                        <div className="p-6 bg-white rounded-2xl shadow-2xl border-t-8 border-yellow-500">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaExclamationCircle className="text-yellow-500" />Policy Exception Required</h3>
                            <p className="text-gray-600 mb-4 border-b pb-4">You are triggering an exception ({actionType === 'checkIn' ? 'Late Check-in' : 'Early Check-out'}). Please provide a reason.</p>
                            <div className="flex flex-col gap-4">
                                <textarea placeholder="Reason (required)" value={reason} onChange={e => setReason(e.target.value)} className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 min-h-[100px] transition duration-300 shadow-inner" />
                                <textarea placeholder="Remarks (optional)" value={remarks} onChange={e => setRemarks(e.target.value)} className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 min-h-[80px] transition duration-300 shadow-inner" />
                                <button onClick={() => actionType && handleAttendance(actionType)} disabled={loading || !reason || !isLocationReady} className={`py-4 rounded-xl font-bold text-white transition duration-300 shadow-lg ${loading || !reason || !isLocationReady ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.01] hover:shadow-xl"}`}>{loading ? "Submitting..." : !isLocationReady ? "Location Required" : `Submit & ${actionType === 'checkIn' ? 'PUNCH IN' : 'PUNCH OUT'}`}</button>
                            </div>
                        </div>
                    )}

                    {/* Check-in / Check-out Buttons */}
                    {!showReason && (
                        <div className="flex flex-col sm:flex-row gap-6 mt-4">
                            <button onClick={checkInClick} disabled={loading || checkInStatus !== "notCheckedIn" || !isLocationReady} className={`flex-1 flex flex-col items-center justify-center gap-2 p-8 rounded-2xl font-black text-2xl transition duration-500 shadow-2xl border-b-8 ${checkInStatus !== "notCheckedIn" || !isLocationReady ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-500" : "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transform hover:scale-[1.03] border-green-800"}`}><FaPlayCircle className="text-4xl mb-1" />{checkInStatus !== "notCheckedIn" ? "Checked In/Out Today" : !isLocationReady ? "Location Required" : "PUNCH IN"}</button>
                            <button onClick={checkOutClick} disabled={loading || checkInStatus !== "checkedIn" || !isLocationReady} className={`flex-1 flex flex-col items-center justify-center gap-2 p-8 rounded-2xl font-black text-2xl transition duration-500 shadow-2xl border-b-8 ${checkInStatus !== "checkedIn" || !isLocationReady ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-500" : "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transform hover:scale-[1.03] border-red-800"}`}><FaStopCircle className="text-4xl mb-1" />{!isLocationReady ? "Location Required" : "PUNCH OUT"}</button>
                        </div>
                    )}
                </div>
            )}

            {/* Monthly View */}
            {showTab === "monthly" && (
                <div className="mt-6 bg-white p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 pb-3 border-blue-100">Monthly Payroll Summary</h2>
                    <p className="text-gray-600 mb-6 italic">High-level data for payroll processing, tracking compliance, leave, and working hours.</p>
                    <DailyAttendanceTable />
                </div>
            )}
            
            {/* 4. CONDITIONAL RENDERING FOR THE NEW TAB */}
            {showTab === "Marathon" && (
                <div className="mt-6 bg-white p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 pb-3 border-pink-300 flex items-center gap-2">Daily Motivation & Well-being <FaHeart className="text-pink-500" /></h2>
                    <p className="text-gray-600 mb-6 italic">Take a moment to center yourself and get inspired!</p>
                    {/* The imported Motivation component is rendered here */}
                    <Motivation />
                </div>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  location?: any;
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

interface AttendanceTableProps {
  all?: boolean;
}

// -------------------- Helpers --------------------
// Display date in IST and decrease by 1 day
// This compensates for the storage hack in the POST API which stores "Tomorrow Midnight IST"
function formatDateMinusOne(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1); 
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
export default function AttendanceTable({ all = false }: AttendanceTableProps) {
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
        const url = `/api/attendance/list?date=${selectedDate}${all ? "&all=true" : ""}`;
        const res = await fetch(url);
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
  }, [selectedDate, view, all]);

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
          <Button onClick={() => window.print()}>Export</Button>
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
            <MonthlyAttendanceTable month={selectedDate.slice(0, 7)} all={all} />
          ) : view === "analytics" ? (
            <AttendanceAnalyticsTable month={selectedDate.slice(0, 7)} all={all} />
          ) : view === "pivot" ? (
            <AttendancePivotTable month={selectedDate.slice(0, 7)} all={all} />
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

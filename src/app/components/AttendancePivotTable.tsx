"use client";

import { useEffect, useState } from "react";
import {
  FiClock,
  FiAlertCircle,
  FiEdit,
  FiBriefcase,
} from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Attendance {
  id: string;
  userId: string;
  employeeName?: string;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  remarks?: string;
  checkInReason?: string;
  checkOutReason?: string;
  status?: string;
  verified?: boolean;
  location?: any;
  date: string;
  isLate?: boolean;
  isEarlyLeave?: boolean;
}

export default function AttendancePivotTable() {
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  function getMonthDates(month: string) {
    const [year, m] = month.split("-").map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      `${year}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
    );
  }

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/list?month=${month}`);
        const json = await res.json();
        if (Array.isArray(json)) setData(json);
        else setData([]);
      } catch (err) {
        console.error("Failed to load attendance:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, [month]);

  const monthDates = getMonthDates(month);

  const grouped: Record<string, Record<string, Attendance>> = {};
  data.forEach((row) => {
    const emp = row.employeeName || row.userId || "Unknown";
    const dateKey = new Date(row.date).toISOString().slice(0, 10);
    if (!grouped[emp]) grouped[emp] = {};
    grouped[emp][dateKey] = {
      ...row,
      isLate: row.isLate ?? false,
      isEarlyLeave: row.isEarlyLeave ?? false,
      workingHours: row.workingHours ?? 0,
      overtimeHours: row.overtimeHours ?? 0,
    };
  });

  function formatHours(hours?: number) {
    if (!hours) return "-";
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs ? `${hrs}h ${mins}m` : `${mins}m`;
  }

  function formatTime(date?: string) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatFullTime(date?: string) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString();
  }

  function formatLocation(loc?: any) {
    if (!loc) return "-";
    if (typeof loc === "object") return JSON.stringify(loc);
    return String(loc);
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto p-4 bg-gray-50 min-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Attendance Pivot Table
          </h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {loading ? (
          <p className="p-4 text-gray-600">Loading...</p>
        ) : (
          <table className="min-w-[1000px] border border-gray-200 text-xs shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="p-2 border-r">Employee</th>
                {monthDates.map((d) => (
                  <th key={d} className="p-2 border-r text-center">
                    {new Date(d).getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(grouped).map((emp, idx) => (
                <tr
                  key={emp}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-all`}
                >
                  <td className="p-2 border-r font-medium bg-gray-100 text-gray-700 sticky left-0 z-10">
                    {emp}
                  </td>
                  {monthDates.map((d) => {
                    const rec = grouped[emp][d];
                    const reasonText = rec
                      ? rec.checkInReason ||
                        rec.checkOutReason ||
                        rec.remarks ||
                        "-"
                      : "-";

                    return (
                      <td
                        key={d}
                        className="p-1 border-r text-center align-top"
                      >
                        {rec ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white rounded-lg shadow-sm p-2 text-[10px] leading-tight border hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer">
                                <div className="flex justify-between">
                                  <FiClock className="inline mr-1 text-blue-500" />{" "}
                                  In: {formatTime(rec.checkIn)}
                                </div>
                                <div className="flex justify-between">
                                  <FiClock className="inline mr-1 text-red-500" />{" "}
                                  Out: {formatTime(rec.checkOut)}
                                </div>
                                <div className="mt-1 flex flex-wrap justify-center gap-1">
                                  {rec.isLate && (
                                    <span className="flex items-center bg-red-200 text-red-800 text-[10px] px-1 rounded">
                                      <FiAlertCircle className="mr-1" /> Late
                                    </span>
                                  )}
                                  {rec.isEarlyLeave && (
                                    <span className="flex items-center bg-yellow-200 text-yellow-800 text-[10px] px-1 rounded">
                                      <FiAlertCircle className="mr-1" /> Early
                                    </span>
                                  )}
                                  {rec.overtimeHours &&
                                    rec.overtimeHours > 0 && (
                                      <span className="flex items-center bg-green-200 text-green-800 text-[10px] px-1 rounded">
                                        <FiBriefcase className="mr-1" /> OT:{" "}
                                        {formatHours(rec.overtimeHours)}
                                      </span>
                                    )}
                                </div>
                                <div className="mt-1">
                                  <span className="font-semibold">
                                    <FiClock className="inline mr-1" />
                                    Hours:
                                  </span>{" "}
                                  {formatHours(rec.workingHours)}
                                </div>
                                {reasonText !== "-" && (
                                  <div className="italic text-gray-500 mt-1 flex items-center">
                                    <FiEdit className="mr-1" /> {reasonText}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-3 text-xs bg-white text-gray-800 rounded shadow-md border">
                              <p>
                                <b>Check In:</b> {formatFullTime(rec.checkIn)}
                              </p>
                              <p>
                                <b>Check Out:</b> {formatFullTime(rec.checkOut)}
                              </p>
                              <p>
                                <b>Status:</b> {rec.status || "-"}
                              </p>
                              <p>
                                <b>Verified:</b> {rec.verified ? "Yes" : "No"}
                              </p>
                              <p>
                                <b>Location:</b> {formatLocation(rec.location)}
                              </p>
                              <p>
                                <b>Reason/Remarks:</b> {reasonText}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </TooltipProvider>
  );
}

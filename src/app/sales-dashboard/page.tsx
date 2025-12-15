"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IndianRupee, TrendingUp, CheckCircle, ShoppingBag, Percent } from "lucide-react"; 

import RevenueByAssigneeChart from "../components/charts/RevenueByAssigneeChart";
import MonthReportTable from "../components/tables/MonthReportTable";
import WeekReportTable from "../components/tables/WeekReportTable";
import DayReportTable from "../components/tables/DayReportTable";
import GoalProgress from "../components/charts/GoalProgress";
import AllReportsSection from "../components/tables/AllReportsSection";
import CumulativeChartSwitcher from "../components/charts/CumulativeChartSwitcher";

// ⬇️ New imports for combined Assigner sales section
import DayReportByAssignerTable from "../components/tables/DayReportByAssignerTable";
import WeekReportByAssignerTable from "../components/tables/AssignerReportTable";
import CategorySalesTable from "../components/tables/category-sales"; 

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface SalesStats {
  totalRevenue: number;
  amountReceived: number;
  pendingAmount: number;
  totalSales: number;
}

interface MonthlyChartData {
  month: string;
  revenue: number;
}

interface AssigneeChartData {
  assignee: string;
  revenue: number;
}

type ReportEntry = Record<string, any>;

const tabs = [
  { label: "All Reports", key: "all" },
    { label: "By Assigner", key: "assigner" },
  { label: "Day", key: "day" },
  { label: "Week", key: "week" },
  { label: "Month", key: "month" },

  { label: "Charts", key: "charts" },
];

export default function SalesDashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<SalesStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyChartData[]>([]);
  const [assigneeData, setAssigneeData] = useState<AssigneeChartData[]>([]);
  const [dayData, setDayData] = useState<ReportEntry[]>([]);
  const [weekData, setWeekData] = useState<ReportEntry[]>([]);
  const [monthTableData, setMonthTableData] = useState<ReportEntry[]>([]);
  const [cumulativeData, setCumulativeData] = useState<ReportEntry[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showGoalProgress, setShowGoalProgress] = useState(false);
  const [cumulativeDayData, setCumulativeDayData] = useState<ReportEntry[]>([]);

  // Calculate pending percentage
  const pendingPercentage = stats?.totalRevenue && stats.totalRevenue > 0
    ? ((stats.pendingAmount / stats.totalRevenue) * 100).toFixed(1)
    : "0.0";


  useEffect(() => {
    if (user && !["admin", "master"].includes(user?.publicMetadata?.role as string)) {
      router.push("/unauthorized");
    }
  }, [user, router]);

  useEffect(() => {
    fetch("/api/stats/user-performance/overview")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));

    fetch("/api/stats/user-performance/monthly")
      .then((res) => res.json())
      .then((data: Record<string, number>) => {
        setMonthlyData(Object.entries(data).map(([month, revenue]) => ({
          month,
          revenue: typeof revenue === "number" ? revenue : 0,
        })));
      })
      .catch(() => setMonthlyData([]));

    fetch("/api/stats/user-performance/by-assignee")
      .then((res) => res.json())
      .then((res: Record<string, number>) => {
        setAssigneeData(Object.entries(res).map(([assignee, revenue]) => ({
          assignee,
          revenue: typeof revenue === "number" ? revenue : 0,
        })));
      })
      .catch(() => setAssigneeData([]));

    fetch("/api/stats/user-performance/day-report?page=1&limit=1000")
      .then((res) => res.json())
      .then((json: { data: ReportEntry[] }) => {
        setDayData(json.data || []);
        setCumulativeDayData(json.data || []);
      });

    fetch("/api/stats/user-performance/week-report?page=1&limit=1000")
      .then((res) => res.json())
      .then((data: { data: ReportEntry[] }) => {
        setWeekData(data.data);
        setCumulativeData(data.data);
      });

    fetch("/api/stats/user-performance/mom-table")
      .then((res) => res.json())
      .then((res: { data: ReportEntry[] }) => {
        setMonthTableData(res.data || []);
      });
  }, []);

  useEffect(() => {
    if (activeTab !== "charts") {
      setShowGoalProgress(false);
    }
  }, [activeTab]);

  if (!user) return <p className="p-4">Loading user...</p>;
  if (!stats) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <Link
          href="/goals"
          className="text-sm font-medium text-blue-600 hover:underline border border-blue-600 rounded px-3 py-1"
        >
          Set Goals
        </Link>
      </div>

      {/* 📊 This Month Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-2"> 
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <h3>Total Revenue</h3>
            <IndianRupee />
          </div>
          <p className="mt-2 text-2xl font-bold">₹{stats.totalRevenue?.toLocaleString() ?? 0}</p>
        </div>

        {/* Received */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <h3>Received</h3>
            <CheckCircle />
          </div>
          <p className="mt-2 text-2xl font-bold">₹{stats.amountReceived?.toLocaleString() ?? 0}</p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-r from-red-400 to-rose-500 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <h3>Pending</h3>
            <TrendingUp />
          </div>
          <p className="mt-2 text-2xl font-bold">₹{stats.pendingAmount?.toLocaleString() ?? 0}</p>
        </div>
        
        {/* UPDATED CARD: Pending Percentage with new color */}
        <div className="bg-gradient-to-r from-pink-500 to-red-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <h3>Pending %</h3>
            <Percent />
          </div>
          <p className="mt-2 text-2xl font-bold">{pendingPercentage}%</p>
        </div>

        {/* Sales */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <h3>Sales</h3>
            <ShoppingBag />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.totalSales ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b mt-8 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "all" && <AllReportsSection />}
        {activeTab === "month" && <MonthReportTable data={monthTableData} />}
        {activeTab === "week" && <WeekReportTable data={weekData} />}
        {activeTab === "day" && <DayReportTable data={dayData} />}

        {/* ✅ Combined Day + Week + Category Sales by Assigner */}
        {activeTab === "assigner" && (
          <div className="space-y-8">
            <DayReportByAssignerTable />
            <WeekReportByAssignerTable />
            <CategorySalesTable /> {/* 📊 Category-Wise Sales */}
          </div>
        )}

        {activeTab === "charts" && (
          <>
            {!showGoalProgress ? (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowGoalProgress(true)}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-md"
                  >
                    Show Monthly Goal Progress
                  </button>
                </div>

                <div className="rounded-xl bg-white shadow-md p-4 border border-gray-200 mb-6">
                  <h2>Monthly Revenue</h2>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>

                <CumulativeChartSwitcher
                  dayData={cumulativeDayData}
                  weekData={cumulativeData}
                  monthData={monthTableData}
                />

                <RevenueByAssigneeChart data={assigneeData} />
              </>
            ) : (
              <GoalProgress />
            )}
          </>
        )}
      </div>
    </div>
  );
}
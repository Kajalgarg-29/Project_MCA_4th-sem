"use client";

import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetTasksQuery, useGetProjectsQuery } from "@/state/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const monthlyData = [
  { month: "Jan", tasks: 12, completed: 8 },
  { month: "Feb", tasks: 18, completed: 14 },
  { month: "Mar", tasks: 15, completed: 11 },
  { month: "Apr", tasks: 22, completed: 18 },
  { month: "May", tasks: 19, completed: 15 },
  { month: "Jun", tasks: 25, completed: 20 },
];

const statusData = [
  { name: "To Do", value: 4 },
  { name: "In Progress", value: 3 },
  { name: "Review", value: 2 },
  { name: "Done", value: 5 },
];

export default function AnalyticsPage() {
  const { data: projects = [] } = useGetProjectsQuery();

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your project performance
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">
              Monthly Tasks Overview
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3b82f6"
                  fill="#eff6ff"
                  name="Total Tasks"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  fill="#ecfdf5"
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">
              Task Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">
              Task Completion Trend
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">
              Projects Overview
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={projects
                  .slice(0, 5)
                  .map((p: any) => ({
                    name: p.name.slice(0, 10),
                    tasks: Math.floor(Math.random() * 10) + 1,
                  }))}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

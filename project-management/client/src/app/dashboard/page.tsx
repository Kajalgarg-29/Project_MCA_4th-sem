"use client";

import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetTasksQuery,
  useGetProjectsQuery,
  useGetUsersQuery,
} from "@/state/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CheckSquare, Users, FolderOpen, Clock } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Team Members",
      value: users.length,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Active Tasks",
      value: "—",
      icon: CheckSquare,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pending Review",
      value: "—",
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const projectChartData = projects.slice(0, 6).map((p: any) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
    tasks: Math.floor(Math.random() * 10) + 1,
  }));

  const pieData = [
    { name: "To Do", value: 4 },
    { name: "In Progress", value: 3 },
    { name: "Review", value: 2 },
    { name: "Done", value: 5 },
  ];

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Overview of your projects and tasks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} mb-3`}
              >
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">
              Tasks by Project
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Task Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project: any) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderOpen size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {project.name}
                    </p>
                    {project.description && (
                      <p className="text-xs text-gray-400">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No projects yet
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

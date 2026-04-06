"use client";

import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetUsersQuery,
  useGetAttendanceSummaryQuery,
} from "@/state/api";
import { useMemo, useState } from "react";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  CheckSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  BarChart2,
} from "lucide-react";

const C = {
  blue: "#2563eb",
  blueLight: "#eff6ff",
  green: "#059669",
  greenLight: "#ecfdf5",
  amber: "#d97706",
  amberLight: "#fffbeb",
  red: "#dc2626",
  redLight: "#fef2f2",
  indigo: "#4f46e5",
  violet: "#7c3aed",
  chart: ["#2563eb", "#059669", "#d97706", "#dc2626", "#4f46e5", "#7c3aed"],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const seedMonthly = MONTHS.map((month, i) => ({
  month,
  created: [12, 18, 15, 22, 19, 25][i],
  completed: [8, 14, 11, 18, 15, 20][i],
  overdue: [2, 3, 1, 4, 2, 3][i],
}));

const statusColors: Record<string, string> = {
  "To Do": C.blue,
  "In Progress": C.amber,
  "Under Review": C.indigo,
  Completed: C.green,
};

function delta(val: number, prev: number) {
  if (prev === 0) return { pct: 0, up: true };
  const pct = Math.round(((val - prev) / prev) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
}

function StatCard({
  label,
  value,
  prev,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  prev: number;
  icon: any;
  color: string;
  bg: string;
}) {
  const { pct, up } = delta(value, prev);
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon size={18} color={color} />
        </span>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
        {value.toLocaleString()}
      </p>
      <div className="flex items-center gap-1 text-xs font-medium">
        {up ? (
          <ArrowUpRight size={14} color={C.green} />
        ) : (
          <ArrowDownRight size={14} color={C.red} />
        )}
        <span style={{ color: up ? C.green : C.red }}>{pct}% vs last month</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  ) : null;

export default function AnalyticsPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const now = new Date();
  const { data: projects = [], isLoading: projLoading } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: tasks = [], isLoading: taskLoading } = useGetTasksQuery(
    { projectId: selectedProject ?? (projects[0]?.id ?? 0) },
    { skip: projects.length === 0 }
  );
  const { data: attendanceSummary = [] } = useGetAttendanceSummaryQuery(
    { month: now.getMonth() + 1, year: now.getFullYear() },
    { refetchOnMountOrArgChange: true }
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      const s = t.status ?? "To Do";
      map[s] = (map[s] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const tasksByPriority = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      const p = t.priority ?? "Medium";
      map[p] = (map[p] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter(
      (t) => t.status === "Completed" || t.status === "Done"
    ).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== "Completed" &&
          t.status !== "Done"
      ).length,
    [tasks]
  );

  const radarData = [
    { subject: "Completion", A: completionRate },
    {
      subject: "On-Time",
      A: tasks.length ? Math.round(((tasks.length - overdueTasks) / tasks.length) * 100) : 0,
    },
    { subject: "Team Size", A: Math.min(users.length * 10, 100) },
    { subject: "Projects", A: Math.min(projects.length * 12, 100) },
    {
      subject: "Attendance",
      A: attendanceSummary.length
        ? Math.round(
            (attendanceSummary.filter((a: any) => a.status === "present").length /
              attendanceSummary.length) *
              100
          )
        : 70,
    },
  ];

  return (
    <DashboardWrapper>
      <div
        className="min-h-screen p-6"
        style={{ background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={22} color={C.blue} />
              <h1
                className="text-2xl font-extrabold text-gray-900 tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Real-time insights across projects, tasks &amp; team performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                className="pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                value={selectedProject ?? ""}
                onChange={(e) =>
                  setSelectedProject(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className="text-gray-500" />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Projects"
            value={projects.length}
            prev={Math.max(projects.length - 2, 0)}
            icon={Briefcase}
            color={C.blue}
            bg={C.blueLight}
          />
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            prev={Math.max(tasks.length - 4, 0)}
            icon={CheckSquare}
            color={C.green}
            bg={C.greenLight}
          />
          <StatCard
            label="Team Members"
            value={users.length}
            prev={Math.max(users.length - 1, 0)}
            icon={Users}
            color={C.indigo}
            bg="#eef2ff"
          />
          <StatCard
            label="Overdue Tasks"
            value={overdueTasks}
            prev={overdueTasks + 1}
            icon={Clock}
            color={C.red}
            bg={C.redLight}
          />
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-6 flex items-center justify-between text-white shadow-md">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">
              Overall Completion Rate
            </p>
            <p className="text-4xl font-extrabold tracking-tight">
              {completionRate}%
            </p>
            <p className="text-xs opacity-70 mt-1">
              {tasks.filter((t) => t.status === "Completed" || t.status === "Done").length} of{" "}
              {tasks.length} tasks completed
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 w-1/2">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-white transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-xs opacity-70">
              {overdueTasks > 0 ? `⚠ ${overdueTasks} tasks overdue` : "✓ No overdue tasks"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-sm">
                Monthly Task Activity
              </h2>
              <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                <TrendingUp size={13} /> +12% this month
              </span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={seedMonthly}>
                <defs>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="created" stroke={C.blue} strokeWidth={2} fill="url(#gBlue)" name="Created" />
                <Area type="monotone" dataKey="completed" stroke={C.green} strokeWidth={2} fill="url(#gGreen)" name="Completed" />
                <Area type="monotone" dataKey="overdue" stroke={C.red} strokeWidth={2} fill="none" strokeDasharray="4 2" name="Overdue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-4">
              Task Status Breakdown
            </h2>
            {tasksByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                No task data
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={tasksByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tasksByStatus.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={statusColors[entry.name] ?? C.chart[i % C.chart.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {tasksByStatus.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              statusColors[entry.name] ?? C.chart[i % C.chart.length],
                          }}
                        />
                        <span className="text-gray-500">{entry.name}</span>
                      </div>
                      <span className="font-bold text-gray-700">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-4">
              Tasks by Priority
            </h2>
            {tasksByPriority.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByPriority} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tasks">
                    {tasksByPriority.map((_, i) => (
                      <Cell key={i} fill={C.chart[i % C.chart.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-4">
              Completion Trend
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={seedMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={C.blue}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: C.blue, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="overdue"
                  stroke={C.red}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                  name="Overdue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-1">
              Team Health Score
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Composite of 5 key metrics (0–100)
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke={C.indigo}
                  fill={C.indigo}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Projects Summary</h2>
            <span className="text-xs text-gray-400">{projects.length} total</span>
          </div>
          {projLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-300 text-sm">
              Loading…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold">Project</th>
                  <th className="text-left px-5 py-3 font-semibold">Start Date</th>
                  <th className="text-left px-5 py-3 font-semibold">End Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const ended =
                    p.endDate && new Date(p.endDate) < now;
                  const status = ended ? "Completed" : "Active";
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-gray-800">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-gray-400">
                        {p.startDate
                          ? new Date(p.startDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-400">
                        {p.endDate
                          ? new Date(p.endDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: status === "Completed" ? C.greenLight : C.blueLight,
                            color: status === "Completed" ? C.green : C.blue,
                          }}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardWrapper>
  );
}
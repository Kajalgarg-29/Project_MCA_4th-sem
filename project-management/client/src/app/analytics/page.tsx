"use client";

import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetUsersQuery,
  useGetAttendanceSummaryQuery,
} from "@/state/api";
import { useMemo, useState, useCallback } from "react";
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
  Users,
  Briefcase,
  CheckSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  AlertTriangle,
} from "lucide-react";

// ─── palette ─────────────────────────────────────────────────────────────────
const C = {
  blue: "#2563eb",
  blueLight: "#eff6ff",
  green: "#059669",
  greenLight: "#ecfdf5",
  amber: "#d97706",
  red: "#dc2626",
  redLight: "#fef2f2",
  indigo: "#4f46e5",
  chart: ["#2563eb", "#059669", "#d97706", "#dc2626", "#4f46e5", "#7c3aed"],
};

const STATUS_COLORS: Record<string, string> = {
  "To Do": C.blue,
  "In Progress": C.amber,
  "Under Review": C.indigo,
  Completed: C.green,
  Done: C.green,
};

// ─── seed monthly data (visual baseline; replace with real API if available) ──
const SEED_MONTHLY = [
  { month: "Jan", created: 12, completed: 8, overdue: 2 },
  { month: "Feb", created: 18, completed: 14, overdue: 3 },
  { month: "Mar", created: 15, completed: 11, overdue: 1 },
  { month: "Apr", created: 22, completed: 18, overdue: 4 },
  { month: "May", created: 19, completed: 15, overdue: 2 },
  { month: "Jun", created: 25, completed: 20, overdue: 3 },
];

// ─── CSV export helper ────────────────────────────────────────────────────────
function exportCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const CustomTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs min-w-[120px]">
      {label && <p className="font-semibold text-gray-700 mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-bold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  ) : null;

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
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
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ${className}`}>
      <h2 className="font-bold text-gray-800 text-sm mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart({ height = 200 }: { height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-gray-300 gap-2"
      style={{ height }}
    >
      <BarChart2 size={28} />
      <span className="text-xs">No data available</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const now = new Date();
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");
  // const [refreshing, setRefreshing] = useState(false);

  // ── queries ────────────────────────────────────────────────────────────────
  const {
    data: projects = [],
    isLoading: projLoading,
    refetch: refetchProjects,
  } = useGetProjectsQuery();

  const { data: users = [], refetch: refetchUsers } = useGetUsersQuery();

  const targetProjectId =
    selectedProjectId === "all"
      ? projects[0]?.id ?? 0
      : selectedProjectId;

  const {
    data: tasks = [],
    isLoading: taskLoading,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    { projectId: targetProjectId },
    { skip: projects.length === 0 }
  );

  const { data: attendanceSummary = [], refetch: refetchAttendance } =
    useGetAttendanceSummaryQuery({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

  // ── refresh all data ───────────────────────────────────────────────────────
  // const handleRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   await Promise.allSettled([
  //     refetchProjects(),
  //     refetchUsers(),
  //     refetchTasks(),
  //     refetchAttendance(),
  //   ]);
  //   setRefreshing(false);
  // }, [refetchProjects, refetchUsers, refetchTasks, refetchAttendance]);

  // ── derived metrics ────────────────────────────────────────────────────────
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

  const completedCount = useMemo(
    () =>
      tasks.filter((t) => t.status === "Completed" || t.status === "Done").length,
    [tasks]
  );

  const completionRate = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

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

  const attendancePct = useMemo(() => {
    if (!attendanceSummary.length) return null;
    const present = attendanceSummary.filter(
      (a: any) => a.status === "present"
    ).length;
    return Math.round((present / attendanceSummary.length) * 100);
  }, [attendanceSummary]);

  const radarData = [
    { subject: "Completion", A: completionRate },
    {
      subject: "On-Time",
      A: tasks.length
        ? Math.round(((tasks.length - overdueTasks) / tasks.length) * 100)
        : 0,
    },
    { subject: "Team Size", A: Math.min(users.length * 10, 100) },
    { subject: "Projects", A: Math.min(projects.length * 12, 100) },
    { subject: "Attendance", A: attendancePct ?? 0 },
  ];

  const activeProjects = projects.filter(
    (p) => !p.endDate || new Date(p.endDate) >= now
  ).length;

  // ── export handlers ────────────────────────────────────────────────────────
  const handleExportTasks = () =>
    exportCSV(
      `tasks-project-${targetProjectId}.csv`,
      tasks.map((t) => ({
        ID: t.id,
        Title: t.title,
        Status: t.status ?? "",
        Priority: t.priority ?? "",
        "Start Date": t.startDate ?? "",
        "Due Date": t.dueDate ?? "",
        "Project ID": t.projectId,
      }))
    );

  const handleExportProjects = () =>
    exportCSV(
      "projects.csv",
      projects.map((p) => ({
        ID: p.id,
        Name: p.name,
        Description: p.description ?? "",
        "Start Date": p.startDate ?? "",
        "End Date": p.endDate ?? "",
        Status:
          p.endDate && new Date(p.endDate) < now ? "Completed" : "Active",
      }))
    );

  const isLoading = projLoading || taskLoading;

  return (
    <DashboardWrapper>
      <div className="min-h-screen p-6 bg-slate-50">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={20} color={C.blue} />
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              {now.toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Project filter */}
            <select
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={selectedProjectId}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Refresh — calls real RTK Query refetch on all queries */}
            {/* <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {refreshing ? <Spinner /> : <Spinner />}
              {refreshing ? "Refreshing…" : "Refresh"}
            </button> */}

            {/* Export tasks as CSV */}
            <button
              onClick={handleExportTasks}
              disabled={tasks.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Tasks
            </button>

            {/* Export projects as CSV */}
            <button
              onClick={handleExportProjects}
              disabled={projects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Projects
            </button>
          </div>
        </div>

        {/* loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-blue-500 mb-4">
            <Spinner />
            Loading data…
          </div>
        )}

        {/* ── KPI cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Projects"
            value={projects.length}
            sub={`${activeProjects} active`}
            icon={Briefcase}
            color={C.blue}
            bg={C.blueLight}
          />
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            sub={`${completedCount} completed`}
            icon={CheckSquare}
            color={C.green}
            bg={C.greenLight}
          />
          <StatCard
            label="Team Members"
            value={users.length}
            sub="across all teams"
            icon={Users}
            color={C.indigo}
            bg="#eef2ff"
          />
          <StatCard
            label="Overdue Tasks"
            value={overdueTasks}
            sub={overdueTasks > 0 ? "need attention" : "all on schedule"}
            icon={overdueTasks > 0 ? AlertTriangle : Clock}
            color={overdueTasks > 0 ? C.red : C.green}
            bg={overdueTasks > 0 ? C.redLight : C.greenLight}
          />
        </div>

        {/* ── Completion banner ────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4 text-white shadow-md">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">Completion Rate</p>
            <p className="text-4xl font-extrabold tracking-tight">{completionRate}%</p>
            <p className="text-xs opacity-70 mt-1">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-1 max-w-sm">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-white transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            {attendancePct !== null && (
              <span className="text-xs opacity-70">
                Attendance this month: {attendancePct}%
              </span>
            )}
            {overdueTasks > 0 && (
              <span className="text-xs opacity-70">⚠ {overdueTasks} overdue</span>
            )}
          </div>
        </div>

        {/* ── Row 1: Area + Donut ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SectionCard title="Monthly Task Activity" className="md:col-span-2">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={SEED_MONTHLY}>
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
          </SectionCard>

          <SectionCard title="Task Status Breakdown">
            {tasksByStatus.length === 0 ? (
              <EmptyChart />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie
                      data={tasksByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tasksByStatus.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={STATUS_COLORS[entry.name] ?? C.chart[i % C.chart.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-1">
                  {tasksByStatus.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              STATUS_COLORS[entry.name] ?? C.chart[i % C.chart.length],
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
          </SectionCard>
        </div>

        {/* ── Row 2: Bar + Line + Radar ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SectionCard title="Tasks by Priority">
            {tasksByPriority.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByPriority} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tasks">
                    {tasksByPriority.map((_, i) => (
                      <Cell key={i} fill={C.chart[i % C.chart.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Completion Trend">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={SEED_MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="completed" stroke={C.blue} strokeWidth={2.5} dot={{ r: 4, fill: C.blue, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Completed" />
                <Line type="monotone" dataKey="overdue" stroke={C.red} strokeWidth={2} strokeDasharray="4 2" dot={false} name="Overdue" />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Team Health Score">
            <p className="text-xs text-gray-400 -mt-2 mb-3">
              Composite of 5 live metrics (0–100)
            </p>
            <ResponsiveContainer width="100%" height={195}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar name="Score" dataKey="A" stroke={C.indigo} fill={C.indigo} fillOpacity={0.2} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* ── Projects table ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Projects Summary</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{projects.length} total</span>
              <button
                onClick={handleExportProjects}
                disabled={projects.length === 0}
                className="text-xs text-blue-600 font-semibold hover:underline disabled:opacity-40"
              >
                Export CSV
              </button>
            </div>
          </div>

          {projLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
              <Spinner />
              Loading projects…
            </div>
          ) : projects.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-300 text-sm">
              No projects found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-widest bg-gray-50">
                    <th className="text-left px-5 py-3 font-semibold">#</th>
                    <th className="text-left px-5 py-3 font-semibold">Project</th>
                    <th className="text-left px-5 py-3 font-semibold">Description</th>
                    <th className="text-left px-5 py-3 font-semibold">Start Date</th>
                    <th className="text-left px-5 py-3 font-semibold">End Date</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => {
                    const isEnded = p.endDate && new Date(p.endDate) < now;
                    const status = isEnded ? "Completed" : "Active";
                    return (
                      <tr
                        key={p.id}
                        className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{p.name}</td>
                        <td className="px-5 py-3 text-gray-400 max-w-xs truncate">
                          {p.description ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {p.startDate
                            ? new Date(p.startDate).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {p.endDate
                            ? new Date(p.endDate).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background:
                                status === "Completed" ? C.greenLight : C.blueLight,
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
            </div>
          )}
        </div>
      </div>
    </DashboardWrapper>
  );
}
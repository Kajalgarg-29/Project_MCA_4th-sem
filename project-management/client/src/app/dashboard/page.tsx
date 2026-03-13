"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetTasksQuery, useGetCampaignsQuery, useGetProjectsQuery, useGetUsersQuery } from "@/state/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { CheckSquare, Radio, Users, FolderOpen, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = { "To Do": "#94a3b8", "In Progress": "#3b82f6", Review: "#f59e0b", Done: "#10b981" };
const PRIORITY_COLORS: Record<string, string> = { Urgent: "#ef4444", High: "#f97316", Medium: "#3b82f6", Low: "#10b981", Backlog: "#94a3b8" };
const CAMPAIGN_COLORS: Record<string, string> = { Active: "#10b981", Draft: "#94a3b8", Paused: "#f59e0b", Completed: "#6366f1" };

function DashboardContent() {
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery({});
  const { data: campaigns = [], isLoading: campaignsLoading } = useGetCampaignsQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();

  const today = new Date();
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "Done");
  const activeCampaigns = campaigns.filter(c => c.status === "Active");
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0);

  const tasksByStatus = ["To Do", "In Progress", "Review", "Done"].map(s => ({ name: s, count: tasks.filter(t => t.status === s).length, fill: STATUS_COLORS[s] }));
  const tasksByPriority = Object.entries(PRIORITY_COLORS).map(([p, color]) => ({ name: p, count: tasks.filter(t => t.priority === p).length, color }));
  const campaignStatusData = Object.entries(CAMPAIGN_COLORS).map(([s, color]) => ({ name: s, value: campaigns.filter(c => c.status === s).length, color })).filter(d => d.value > 0);
  const leadsData = campaigns.filter(c => (c.leads || 0) > 0).slice(0, 6).map(c => ({ name: c.name.slice(0, 12), leads: c.leads || 0 }));

  const KPICard = ({ label, value, icon: Icon, color, sub, href }: any) => (
    <Link href={href || "#"} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition block">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}><Icon size={16} className="text-white" /></div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </Link>
  );

  return (
    <div className="space-y-0 -m-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Dashboard</h1>
            <p className="text-xs text-gray-400">{today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{overdue.length} task{overdue.length > 1 ? "s are" : " is"} overdue</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Total Tasks" value={tasks.length} icon={CheckSquare} color="bg-blue-500" sub={`${tasks.filter(t => t.status === "Done").length} completed`} href="/projects" />
          <KPICard label="Active Campaigns" value={activeCampaigns.length} icon={Radio} color="bg-green-500" sub={`${campaigns.length} total`} href="/campaigns" />
          <KPICard label="Total Leads" value={totalLeads.toLocaleString()} icon={TrendingUp} color="bg-violet-500" sub="Across all campaigns" href="/analytics" />
          <KPICard label="Team Members" value={users.length} icon={Users} color="bg-orange-500" sub={`${projects.length} projects`} href="/users" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tasksByStatus} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {tasksByStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Campaign Status</h3>
            {campaignStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No campaigns yet</div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={180}>
                  <PieChart>
                    <Pie data={campaignStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                      {campaignStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {campaignStatusData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                      <span className="text-xs font-bold text-gray-800 ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Task Priority Breakdown</h3>
            <div className="space-y-3">
              {tasksByPriority.filter(p => p.count > 0).map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14">{p.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${tasks.length ? (p.count / tasks.length) * 100 : 0}%`, background: p.color }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-6 text-right">{p.count}</span>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-gray-300 text-center py-6">No tasks yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Leads per Campaign</h3>
            {leadsData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No lead data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={leadsData} layout="vertical" barSize={14}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} width={80} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Tasks</h3>
              <Link href="/projects" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </div>
            {tasksLoading ? (
              <div className="p-8 text-center text-gray-300 text-sm">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-300 text-sm">No tasks yet</div>
            ) : (
              tasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[t.priority || "Medium"] || "#94a3b8" }} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${STATUS_COLORS[t.status || "To Do"]}20`, color: STATUS_COLORS[t.status || "To Do"] }}>{t.status}</span>
                  {t.dueDate && <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0"><Clock size={10} />{new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Campaigns</h3>
              <Link href="/campaigns" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </div>
            {campaignsLoading ? (
              <div className="p-8 text-center text-gray-300 text-sm">Loading...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-gray-300 text-sm">No campaigns yet</div>
            ) : (
              campaigns.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAMPAIGN_COLORS[c.status] || "#94a3b8" }} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{c.platform}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${CAMPAIGN_COLORS[c.status]}20`, color: CAMPAIGN_COLORS[c.status] }}>{c.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardWrapper><DashboardContent /></DashboardWrapper>;
}

"use client";
import { useState, useEffect } from "react";
import DashboardWrapper from "./dashboardWrapper";
import { useGetProjectsQuery, useGetUsersQuery, useGetTasksQuery, useGetCampaignsQuery, useGetAttendanceSummaryQuery } from "@/state/api";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from "recharts";
import {
  FolderOpen, Users, CheckSquare, TrendingUp, ArrowRight,
  Clock, Target, DollarSign, Eye, Zap, AlertCircle,
  ChevronRight, Activity, Award, Calendar
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Home() {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const today = new Date();
  const { data: attendance = [] } = useGetAttendanceSummaryQuery({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) try { setCurrentUser(JSON.parse(stored)); } catch {}
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const activeCampaigns = campaigns.filter((c: any) => c.status === "Active").length;
  const totalBudget = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s: number, c: any) => s + (c.spent || 0), 0);
  const totalReach = campaigns.reduce((s: number, c: any) => s + (c.reach || 0), 0);
  const overdueProjects = projects.filter((p: any) => p.endDate && new Date(p.endDate) < today).length;

  // Campaign type distribution
  const campaignTypes = campaigns.reduce((acc: any, c: any) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(campaignTypes).map(([name, value]) => ({ name, value }));

  // Monthly reach data (mock from campaigns)
  const reachData = [
    { month: "Oct", reach: 12000, clicks: 800 },
    { month: "Nov", reach: 18000, clicks: 1200 },
    { month: "Dec", reach: 15000, clicks: 950 },
    { month: "Jan", reach: 22000, clicks: 1600 },
    { month: "Feb", reach: 28000, clicks: 2100 },
    { month: "Mar", reach: totalReach || 25000, clicks: campaigns.reduce((s: number, c: any) => s + (c.clicks || 0), 0) },
  ];

  // Project status distribution
  const projectStatusData = [
    { name: "Active", value: projects.filter((p: any) => !p.endDate || new Date(p.endDate) >= today).length },
    { name: "Overdue", value: overdueProjects },
    { name: "No Dates", value: projects.filter((p: any) => !p.startDate && !p.endDate).length },
  ].filter(d => d.value > 0);

  // Attendance this month
  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((s: number, a: any) => {
        const total = a.present + a.late + a.wfh;
        const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return s + (total / days) * 100;
      }, 0) / attendance.length)
    : 0;

  const statCards = [
    { label: "Total Projects", value: projects.length, sub: `${overdueProjects} overdue`, icon: FolderOpen, color: "from-blue-500 to-blue-600", link: "/" },
    { label: "Team Members", value: users.length, sub: `${users.filter((u: any) => u.teamId).length} in teams`, icon: Users, color: "from-purple-500 to-purple-600", link: "/users" },
    { label: "Active Campaigns", value: activeCampaigns, sub: `${campaigns.length} total`, icon: Zap, color: "from-green-500 to-green-600", link: "/campaigns" },
    { label: "Total Reach", value: totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach, sub: "this month", icon: Eye, color: "from-orange-500 to-orange-600", link: "/campaigns" },
    { label: "Budget Used", value: `₹${(totalSpent / 1000).toFixed(1)}K`, sub: `of ₹${(totalBudget / 1000).toFixed(1)}K`, icon: DollarSign, color: "from-pink-500 to-pink-600", link: "/campaigns" },
    { label: "Avg Attendance", value: `${avgAttendance}%`, sub: "this month", icon: Award, color: "from-teal-500 to-teal-600", link: "/attendance" },
  ];

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {greeting}, {currentUser?.username || "there"} 👋
              </h1>
              <p className="text-gray-400 mt-1">
                {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/projects/1">
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                  <CheckSquare size={16} /> View Tasks
                </button>
              </Link>
              <Link href="/campaigns">
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  <Target size={16} /> Campaigns
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {overdueProjects > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              {overdueProjects} project{overdueProjects > 1 ? "s are" : " is"} overdue! Please review and update deadlines.
            </p>
            <Link href="/timeline" className="ml-auto text-xs text-red-600 font-semibold hover:underline whitespace-nowrap">
              View Timeline →
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link href={stat.link} key={stat.label}>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
                  <stat.icon size={18} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Reach & Clicks Area Chart */}
          <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-gray-800">Campaign Performance</h2>
                <p className="text-xs text-gray-400 mt-0.5">Reach & clicks over last 6 months</p>
              </div>
              <Link href="/analytics" className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                Full Analytics <ChevronRight size={12} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={reachData}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="url(#reachGrad)" strokeWidth={2} name="Reach" />
                <Area type="monotone" dataKey="clicks" stroke="#10b981" fill="url(#clickGrad)" strokeWidth={2} name="Clicks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign Types Pie */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="mb-4">
              <h2 className="font-bold text-gray-800">Campaign Types</h2>
              <p className="text-xs text-gray-400 mt-0.5">Distribution by type</p>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.slice(0, 4).map((item: any, idx: number) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No campaigns yet</div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Recent Projects</h2>
              <Link href="/" className="text-xs text-blue-500 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 4).map((project: any, idx: number) => {
                const isOverdue = project.endDate && new Date(project.endDate) < today;
                return (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] + "20" }}>
                        <FolderOpen size={15} style={{ color: COLORS[idx % COLORS.length] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{project.name}</p>
                        <p className="text-xs text-gray-400">
                          {project.endDate
                            ? isOverdue ? "⚠️ Overdue"
                            : `Due ${new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : "No deadline"}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition shrink-0" />
                    </div>
                  </Link>
                );
              })}
              {projects.length === 0 && (
                <p className="text-sm text-gray-300 text-center py-6">No projects yet</p>
              )}
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Active Campaigns</h2>
              <Link href="/campaigns" className="text-xs text-blue-500 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {campaigns.filter((c: any) => c.status === "Active").slice(0, 4).map((campaign: any) => {
                const budgetPct = campaign.budget ? Math.min(Math.round(((campaign.spent || 0) / campaign.budget) * 100), 100) : 0;
                return (
                  <div key={campaign.id} className="p-2.5 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-medium text-gray-800 truncate">{campaign.name}</p>
                      <span className="text-xs text-green-600 font-medium shrink-0 ml-2">{campaign.type}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Budget: ₹{(campaign.budget || 0).toLocaleString()}</span>
                      <span>{budgetPct}% used</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {campaigns.filter((c: any) => c.status === "Active").length === 0 && (
                <p className="text-sm text-gray-300 text-center py-6">No active campaigns</p>
              )}
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Team Overview</h2>
              <Link href="/users" className="text-xs text-blue-500 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((user: any) => (
                <div key={user.userId} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.username}</p>
                    <p className="text-xs text-gray-400">{user.team?.teamName || "Unassigned"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                    ${user.role === "Admin" ? "bg-red-100 text-red-600" :
                      user.role === "Manager" ? "bg-purple-100 text-purple-600" :
                      "bg-gray-100 text-gray-500"}`}>
                    {user.role || "Member"}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-gray-300 text-center py-6">No team members yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

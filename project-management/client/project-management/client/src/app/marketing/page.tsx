"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import {
  Home, Clock, Search, Settings, Users, Users2, BarChart2,
  Bell, SlidersHorizontal, ChevronDown, ChevronUp, Plus,
  TrendingUp, Target, MousePointerClick, DollarSign,
  LogOut, Moon, X, Megaphone, Calendar, CheckSquare, Filter
} from "lucide-react";

const spendData = [
  { month: "Jan", Google: 38000, Facebook: 28000, Instagram: 18000, LinkedIn: 8000 },
  { month: "Feb", Google: 48000, Facebook: 32000, Instagram: 22000, LinkedIn: 10000 },
  { month: "Mar", Google: 62000, Facebook: 42000, Instagram: 30000, LinkedIn: 14000 },
  { month: "Apr", Google: 52000, Facebook: 36000, Instagram: 26000, LinkedIn: 12000 },
  { month: "May", Google: 72000, Facebook: 28000, Instagram: 20000, LinkedIn: 16000 },
  { month: "Jun", Google: 78000, Facebook: 38000, Instagram: 24000, LinkedIn: 10000 },
];

const leadData = [
  { month: "Jan", leads: 180 },
  { month: "Feb", leads: 220 },
  { month: "Mar", leads: 195 },
  { month: "Apr", leads: 260 },
  { month: "May", leads: 240 },
  { month: "Jun", leads: 300 },
];

const platformShare = [
  { name: "Google Ads", value: 42, color: "#4285F4" },
  { name: "Facebook", value: 28, color: "#1877F2" },
  { name: "Instagram", value: 18, color: "#E1306C" },
  { name: "LinkedIn", value: 12, color: "#0A66C2" },
];

const campaigns = [
  { name: "Summer Sale 2024", platform: "Google", status: "Active", spend: "₹24,000", leads: 320, ctr: "4.2%" },
  { name: "Brand Awareness Q2", platform: "Facebook", status: "Active", spend: "₹18,500", leads: 210, ctr: "3.1%" },
  { name: "Product Launch", platform: "Instagram", status: "Paused", spend: "₹12,000", leads: 180, ctr: "2.8%" },
  { name: "B2B Outreach", platform: "LinkedIn", status: "Active", spend: "₹8,000", leads: 95, ctr: "1.9%" },
  { name: "Retargeting Campaign", platform: "Google", status: "Ended", spend: "₹35,500", leads: 390, ctr: "5.1%" },
];

const approvals = [
  { title: "Q3 Budget Increase", requestedBy: "Rahul S.", amount: "₹50,000", status: "Pending" },
  { title: "New Instagram Campaign", requestedBy: "Priya M.", amount: "₹15,000", status: "Pending" },
];

const TABS = ["Overview", "Campaigns (5)", "Budget", "Lead Pipeline", "Calendar (6)", "Approvals (2)"];
const PLATFORMS = ["All", "Google", "Facebook", "Instagram", "LinkedIn"];
const PRIORITY_ITEMS = ["Urgent", "High", "Medium", "Low", "Backlog"];

export default function MarketingHub() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [activePlatform, setActivePlatform] = useState("All");
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [priorityOpen, setPriorityOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredData = activePlatform === "All"
    ? spendData
    : spendData.map(d => ({ month: d.month, [activePlatform]: (d as any)[activePlatform] }));

  const platformColors: Record<string, string> = {
    Google: "#4285F4", Facebook: "#1877F2", Instagram: "#E1306C", LinkedIn: "#0A66C2"
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-52 bg-white border-r border-gray-100 flex flex-col shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">BC</div>
              <div>
                <div className="text-sm font-bold text-gray-800">BAJAJ CAPITAL</div>
                <div className="text-xs text-gray-400">Digital Marketing</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)}><X size={14} className="text-gray-400" /></button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {[
              { icon: Home, label: "Home" },
              { icon: Clock, label: "Timeline" },
              { icon: Search, label: "Search" },
              { icon: Settings, label: "Settings" },
              { icon: Users, label: "Users" },
              { icon: Users2, label: "Teams" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <Icon size={15} />{label}
              </button>
            ))}
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 font-medium">
              <BarChart2 size={15} />Marketing Hub
            </button>

            {/* Projects */}
            <div className="pt-3">
              <button onClick={() => setProjectsOpen(!projectsOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                <div className="flex items-center gap-1">
                  <span>Projects</span>
                  <span className="bg-gray-100 text-gray-500 text-xs rounded-full px-1.5 py-0.5">1</span>
                </div>
                <div className="flex items-center gap-1">
                  <Plus size={12} />
                  {projectsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </button>
              {projectsOpen && (
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>seo lizards
                </button>
              )}
            </div>

            {/* Priority */}
            <div className="pt-1">
              <button onClick={() => setPriorityOpen(!priorityOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                <span>Priority</span>
                {priorityOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {priorityOpen && PRIORITY_ITEMS.map((p) => (
                <button key={p} className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    p === "Urgent" ? "border-red-500" :
                    p === "High" ? "border-orange-500" :
                    p === "Medium" ? "border-yellow-500" :
                    p === "Low" ? "border-green-500" : "border-gray-400"
                  }`}></div>
                  {p}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <BarChart2 size={18} className="text-gray-500" />
              </button>
            )}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search..." className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-64 outline-none focus:border-red-300" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100"><Moon size={16} className="text-gray-500" /></button>
            <button className="p-2 rounded-lg hover:bg-gray-100"><SlidersHorizontal size={16} className="text-gray-500" /></button>
            <button className="p-2 rounded-lg hover:bg-gray-100"><Users size={16} className="text-gray-500" /></button>
            <span className="text-sm text-gray-700 font-medium">admin</span>
            <button className="flex items-center gap-1.5 bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 transition">
              <LogOut size={14} />Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <BarChart2 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-800">Digital Marketing Hub</h1>
                <p className="text-xs text-gray-400">Bajaj Capital</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100"><SlidersHorizontal size={18} className="text-gray-500" /></button>
              <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                <Plus size={16} />New Campaign
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-100 px-6">
            <div className="flex gap-0">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === "Overview" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "TOTAL AD SPEND", value: "₹98,000", change: "+12%", icon: DollarSign, color: "bg-red-500" },
                    { label: "TOTAL LEADS", value: "1,195", change: "+18%", icon: Users, color: "bg-blue-500" },
                    { label: "AVG. CTR", value: "3.4%", change: "+0.4%", icon: MousePointerClick, color: "bg-green-500" },
                    { label: "AVG. ROI", value: "3.6x", change: "+0.4x", icon: TrendingUp, color: "bg-purple-500" },
                  ].map(({ label, value, change, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-400 tracking-wider">{label}</span>
                        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
                      <div className="text-xs text-green-600 font-medium">
                        📈 {change} <span className="text-gray-400 font-normal">vs last month</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Spend by Platform */}
                  <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Spend by Platform (Monthly)</h3>
                      <div className="flex gap-1">
                        {PLATFORMS.map((p) => (
                          <button key={p} onClick={() => setActivePlatform(p)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                              activePlatform === p ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={spendData} barSize={10} barGap={2}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `₹${v/1000}k`} />
                        <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        {(activePlatform === "All" ? ["Google", "Facebook", "Instagram", "LinkedIn"] : [activePlatform]).map((p) => (
                          <Bar key={p} dataKey={p} fill={platformColors[p]} radius={[3, 3, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Platform share */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">Budget Allocation</h3>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={platformShare} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                          {platformShare.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {platformShare.map((p) => (
                        <div key={p.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }}></div>
                            <span className="text-xs text-gray-600">{p.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lead trend */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Lead Pipeline Trend</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={leadData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="leads" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {activeTab === "Campaigns (5)" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">All Campaigns</h3>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <Filter size={14} />Filter
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Campaign", "Platform", "Status", "Spend", "Leads", "CTR"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {campaigns.map((c) => (
                      <tr key={c.name} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{c.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                            background: `${platformColors[c.platform]}20`,
                            color: platformColors[c.platform]
                          }}>{c.platform}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            c.status === "Active" ? "bg-green-100 text-green-700" :
                            c.status === "Paused" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>{c.status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{c.spend}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{c.leads}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{c.ctr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Approvals (2)" && (
              <div className="space-y-3">
                {approvals.map((a) => (
                  <div key={a.title} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <CheckSquare size={18} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{a.title}</p>
                        <p className="text-xs text-gray-400">Requested by {a.requestedBy} · {a.amount}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">Approve</button>
                      <button className="px-4 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!["Overview", "Campaigns (5)", "Approvals (2)"].includes(activeTab) && (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
                <Megaphone size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">{activeTab} — coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
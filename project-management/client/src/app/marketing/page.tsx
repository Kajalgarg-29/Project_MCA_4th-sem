"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetProjectsQuery, useGetUsersQuery, useGetCampaignsQuery } from "@/state/api";
import { TrendingUp, Target, Users, BarChart2, Megaphone, Eye, MousePointer, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import Link from "next/link";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function MarketingPage() {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const [activeTab, setActiveTab] = useState("overview");

  const totalReach = campaigns.reduce((s: number, c: any) => s + (c.reach || 0), 0);
  const totalClicks = campaigns.reduce((s: number, c: any) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s: number, c: any) => s + (c.conversions || 0), 0);
  const totalBudget = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s: number, c: any) => s + (c.spent || 0), 0);
  const avgCTR = totalReach > 0 ? ((totalClicks / totalReach) * 100).toFixed(2) : "0";
  const avgConvRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0";
  const roi = totalSpent > 0 ? (((totalBudget - totalSpent) / totalSpent) * 100).toFixed(1) : "0";

  const campaignTypeData = campaigns.reduce((acc: any, c: any) => {
    const existing = acc.find((a: any) => a.name === c.type);
    if (existing) { existing.campaigns++; existing.reach += c.reach || 0; existing.clicks += c.clicks || 0; }
    else acc.push({ name: c.type, campaigns: 1, reach: c.reach || 0, clicks: c.clicks || 0 });
    return acc;
  }, []);

  const statusData = [
    { name: "Active", value: campaigns.filter((c: any) => c.status === "Active").length },
    { name: "Draft", value: campaigns.filter((c: any) => c.status === "Draft").length },
    { name: "Paused", value: campaigns.filter((c: any) => c.status === "Paused").length },
    { name: "Completed", value: campaigns.filter((c: any) => c.status === "Completed").length },
  ].filter(d => d.value > 0);

  const topCampaigns = [...campaigns]
    .sort((a: any, b: any) => (b.conversions || 0) - (a.conversions || 0))
    .slice(0, 5);

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Marketing Hub</h1>
            <p className="text-gray-400 text-sm mt-0.5">Complete overview of your marketing performance</p>
          </div>
          <Link href="/campaigns">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              <Megaphone size={16} /> Manage Campaigns
            </button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Reach", value: totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach, icon: Eye, color: "from-blue-500 to-blue-600", trend: "+12%", up: true },
            { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointer, color: "from-purple-500 to-purple-600", trend: "+8%", up: true },
            { label: "Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "from-green-500 to-green-600", trend: "+24%", up: true },
            { label: "ROI", value: `${roi}%`, icon: TrendingUp, color: "from-orange-500 to-orange-600", trend: roi > "0" ? "Positive" : "Negative", up: Number(roi) > 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? "text-green-600" : "text-red-500"}`}>
                  {s.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{s.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Campaigns", value: campaigns.filter((c: any) => c.status === "Active").length },
            { label: "Avg CTR", value: `${avgCTR}%` },
            { label: "Conv. Rate", value: `${avgConvRate}%` },
            { label: "Budget Used", value: `₹${(totalSpent / 1000).toFixed(1)}K / ₹${(totalBudget / 1000).toFixed(1)}K` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {["overview", "campaigns", "team"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition
                ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {tab === "overview" ? "Performance" : tab === "campaigns" ? "Campaign Mix" : "Team"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">Reach by Campaign Type</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={campaignTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="reach" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reach" />
                  <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">Campaign Status</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-gray-600">{s.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Top Campaigns by Conversions</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left p-4">Campaign</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-right p-4">Reach</th>
                  <th className="text-right p-4">Clicks</th>
                  <th className="text-right p-4">Conv.</th>
                  <th className="text-right p-4">CTR</th>
                  <th className="text-right p-4">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topCampaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{c.type}</td>
                    <td className="p-4 text-sm text-gray-700 text-right">{(c.reach || 0).toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-700 text-right">{(c.clicks || 0).toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-700 text-right">{(c.conversions || 0).toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-700 text-right">{c.reach > 0 ? ((c.clicks / c.reach) * 100).toFixed(2) : 0}%</td>
                    <td className="p-4 text-right">
                      <p className="text-sm font-medium text-gray-800">₹{(c.budget || 0).toLocaleString()}</p>
                      <div className="w-16 h-1 bg-gray-100 rounded-full ml-auto mt-1">
                        <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${Math.min(((c.spent || 0) / (c.budget || 1)) * 100, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan={7} className="p-12 text-center text-gray-300">No campaigns yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "team" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">Team Members ({users.length})</h2>
              <div className="space-y-3">
                {users.slice(0, 8).map((u: any) => (
                  <div key={u.userId} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.username}</p>
                      <p className="text-xs text-gray-400">{u.team?.teamName || "No team"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.role === "Admin" ? "bg-red-100 text-red-600" : u.role === "Manager" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
                      {u.role || "Member"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">Projects ({projects.length})</h2>
              <div className="space-y-3">
                {projects.slice(0, 6).map((p: any) => {
                  const isOverdue = p.endDate && new Date(p.endDate) < new Date();
                  return (
                    <Link href={`/projects/${p.id}`} key={p.id}>
                      <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart2 size={15} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className={`text-xs ${isOverdue ? "text-red-400" : "text-gray-400"}`}>
                            {isOverdue ? "⚠️ Overdue" : p.endDate ? `Due ${new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "No deadline"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}

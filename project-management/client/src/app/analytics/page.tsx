"use client";

import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetCampaignsQuery, useGetTasksQuery, useGetProjectsQuery } from "@/state/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, LineChart, Line, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, DollarSign, Target, MousePointerClick, Eye, BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  Google: "#4285F4", Facebook: "#1877F2", Instagram: "#E1306C",
  LinkedIn: "#0A66C2", Email: "#6366f1", YouTube: "#FF0000", SEO: "#10b981",
};

function AnalyticsContent() {
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: tasks = [] } = useGetTasksQuery({ projectId: projects[0]?.id }, { skip: !projects[0]?.id });
  const [timeRange, setTimeRange] = useState<"all" | "active" | "completed">("all");

  const filtered = timeRange === "all" ? campaigns : campaigns.filter(c =>
    timeRange === "active" ? c.status === "Active" : c.status === "Completed"
  );

  // Core metrics
  const totalBudget = filtered.reduce((s, c) => s + c.budget, 0);
  const totalLeads = filtered.reduce((s, c) => s + (c.leads || 0), 0);
  const totalClicks = filtered.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConversions = filtered.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalImpressions = filtered.reduce((s, c) => s + (c.impressions || 0), 0);
  const costPerLead = totalLeads > 0 ? (totalBudget / totalLeads) : 0;
  const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100) : 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
  const roi = totalBudget > 0 ? (((totalConversions * 5000) - totalBudget) / totalBudget * 100) : 0;

  // ROI per campaign
  const roiPerCampaign = filtered.map(c => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
    roi: c.budget > 0 ? Math.round(((c.conversions || 0) * 5000 - c.budget) / c.budget * 100) : 0,
    budget: c.budget,
    leads: c.leads || 0,
    conversions: c.conversions || 0,
    platform: c.platform,
  })).sort((a, b) => b.roi - a.roi);

  // Platform breakdown
  const platforms = [...new Set(filtered.map(c => c.platform))];
  const platformData = platforms.map(p => {
    const pCampaigns = filtered.filter(c => c.platform === p);
    return {
      name: p,
      budget: pCampaigns.reduce((s, c) => s + c.budget, 0),
      leads: pCampaigns.reduce((s, c) => s + (c.leads || 0), 0),
      conversions: pCampaigns.reduce((s, c) => s + (c.conversions || 0), 0),
      clicks: pCampaigns.reduce((s, c) => s + (c.clicks || 0), 0),
      color: PLATFORM_COLORS[p] || "#6b7280",
    };
  }).sort((a, b) => b.leads - a.leads);

  // Traffic sources pie
  const trafficSources = platformData.map(p => ({ name: p.name, value: p.clicks || p.leads, color: p.color })).filter(p => p.value > 0);

  // Leads vs Budget scatter data
  const leadsVsBudget = filtered.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
    budget: Math.round(c.budget / 1000),
    leads: c.leads || 0,
    cpl: c.leads ? Math.round(c.budget / c.leads) : 0,
    color: PLATFORM_COLORS[c.platform] || "#6b7280",
  }));

  // Campaign performance table
  const perfTable = filtered.map(c => ({
    ...c,
    cpl: (c.leads || 0) > 0 ? Math.round(c.budget / (c.leads || 1)) : 0,
    convRate: (c.leads || 0) > 0 ? Math.round(((c.conversions || 0) / (c.leads || 1)) * 100) : 0,
    roi: c.budget > 0 ? Math.round(((c.conversions || 0) * 5000 - c.budget) / c.budget * 100) : 0,
    ctr: (c.impressions || 0) > 0 ? ((c.clicks || 0) / (c.impressions || 1) * 100).toFixed(1) : "0.0",
  })).sort((a, b) => b.leads - a.leads);

  const MetricCard = ({ label, value, sub, icon: Icon, color, positive }: any) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}><Icon size={16} className="text-white" /></div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      {sub !== undefined && (
        <div className={`text-xs flex items-center gap-1 font-medium ${positive === undefined ? "text-gray-400" : positive ? "text-green-600" : "text-red-500"}`}>
          {positive === true && <ArrowUpRight size={12} />}
          {positive === false && <ArrowDownRight size={12} />}
          {sub}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-0 -m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <BarChart2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Analytics</h1>
            <p className="text-xs text-gray-400">ROI, Cost per Lead, Conversions & Traffic</p>
          </div>
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          {[["all", "All Campaigns"], ["active", "Active"], ["completed", "Completed"]].map(([val, label]) => (
            <button key={val} onClick={() => setTimeRange(val as any)}
              className={`px-3 py-1.5 text-xs font-medium transition ${timeRange === val ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard label="Total ROI" value={`${roi > 0 ? "+" : ""}${roi.toFixed(1)}%`} sub={`₹${totalBudget.toLocaleString()} invested`} icon={TrendingUp} color="bg-green-500" positive={roi > 0} />
          <MetricCard label="Cost per Lead" value={costPerLead > 0 ? `₹${Math.round(costPerLead).toLocaleString()}` : "—"} sub={`${totalLeads} total leads`} icon={DollarSign} color="bg-blue-500" positive={costPerLead < 500} />
          <MetricCard label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} sub={`${totalConversions} of ${totalLeads} leads`} icon={Target} color="bg-violet-500" positive={conversionRate > 5} />
          <MetricCard label="Click-through Rate" value={`${ctr.toFixed(2)}%`} sub={`${totalClicks.toLocaleString()} clicks`} icon={MousePointerClick} color="bg-orange-500" positive={ctr > 2} />
        </div>

        {/* ROI per Campaign + Traffic Sources */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">ROI by Campaign</h3>
            {roiPerCampaign.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No campaign data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roiPerCampaign} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} width={110} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "ROI"]} />
                  <Bar dataKey="roi" radius={[0, 6, 6, 0]}>
                    {roiPerCampaign.map((entry, i) => (
                      <Cell key={i} fill={entry.roi >= 0 ? "#10b981" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Traffic Sources</h3>
            {trafficSources.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={trafficSources} cx="50%" cy="50%" outerRadius={60} dataKey="value" paddingAngle={3}>
                      {trafficSources.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, name) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {trafficSources.map(s => {
                    const total = trafficSources.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                    return (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-xs text-gray-600 flex-1">{s.name}</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Platform comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Leads by Platform</h3>
            {platformData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={platformData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="leads" radius={[6, 6, 0, 0]}>
                    {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Budget vs Leads (₹k)</h3>
            {leadsVsBudget.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadsVsBudget} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="budget" name="Budget (₹k)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" name="Leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Campaign Performance Breakdown</h3>
            <span className="text-xs text-gray-400">{filtered.length} campaigns</span>
          </div>
          {perfTable.length === 0 ? (
            <div className="p-16 text-center">
              <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No campaigns yet. Create campaigns to see analytics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{["Campaign", "Platform", "Budget", "Impressions", "Clicks", "CTR", "Leads", "CPL", "Conv. Rate", "ROI"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {perfTable.map(c => (
                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-sm text-gray-800">{c.name}</div>
                        <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block mt-0.5 font-medium ${c.status === "Active" ? "bg-green-100 text-green-700" : c.status === "Paused" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${PLATFORM_COLORS[c.platform] || "#6b7280"}20`, color: PLATFORM_COLORS[c.platform] || "#6b7280" }}>{c.platform}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">₹{c.budget.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{(c.impressions || 0).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{(c.clicks || 0).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-sm text-blue-600 font-medium">{c.ctr}%</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-violet-600">{c.leads || 0}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{c.cpl > 0 ? `₹${c.cpl.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(c.convRate, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{c.convRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-bold flex items-center gap-1 ${c.roi >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {c.roi >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {c.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-xs font-bold text-gray-600" colSpan={2}>TOTALS</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{totalBudget.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{totalImpressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{totalClicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{ctr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-sm font-bold text-violet-600">{totalLeads}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{costPerLead > 0 ? `₹${Math.round(costPerLead).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{conversionRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{roi.toFixed(1)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return <DashboardWrapper><AnalyticsContent /></DashboardWrapper>;
}

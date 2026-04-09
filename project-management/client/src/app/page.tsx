"use client";
import { useState, useEffect } from "react";
import DashboardWrapper from "./dashboardWrapper";
import {
  useGetProjectsQuery,
  useGetUsersQuery,
  useGetCampaignsQuery,
  useGetAttendanceSummaryQuery,
} from "@/state/api";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  FolderOpen,
  Zap,
  Award,
  AlertCircle,
  ChevronRight,
  Activity,
  Globe,
  BarChart2,
  RefreshCw,
} from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// Hex values for each color prop — avoids Tailwind purging dynamic class names
const colorHexMap: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-green-500": "#22c55e",
  "bg-purple-500": "#a855f7",
  "bg-teal-500": "#14b8a6",
  "bg-orange-500": "#f97316",
  "bg-pink-500": "#ec4899",
  "bg-indigo-500": "#6366f1",
  "bg-red-500": "#ef4444",
  "bg-yellow-500": "#eab308",
};

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  trendValue,
  color,
  prefix = "",
  suffix = "",
  onClick,
}: any) {
  const isPositive = trend === "up";
  const hex = colorHexMap[color] ?? "#6b7280";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 hover:shadow-md transition cursor-pointer relative overflow-hidden min-h-[90px] sm:min-h-[120px]"
    >
      {/* background */}
      <div
        className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4 w-12 h-12 sm:w-20 sm:h-20 rounded-full"
        style={{ backgroundColor: hex, opacity: 0.06 }}
      />

      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div
          className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center"
          style={{ backgroundColor: hex + "22" }}
        >
          <Icon size={16} className="sm:hidden" style={{ color: hex }} />
          <Icon size={22} className="hidden sm:block" style={{ color: hex }} />
        </div>

        {trendValue && (
          <div
            className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded
            ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={10} className="sm:hidden" />
            ) : (
              <ArrowDownRight size={10} className="sm:hidden" />
            )}
            {isPositive ? (
              <ArrowUpRight size={12} className="hidden sm:block" />
            ) : (
              <ArrowDownRight size={12} className="hidden sm:block" />
            )}
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-lg sm:text-3xl font-bold text-gray-800 mb-1 leading-tight">
        {prefix}
        {value}
        {suffix}
      </p>
      <p className="text-[11px] sm:text-sm font-semibold text-gray-600 leading-tight">
        {title}
      </p>
      {sub && (
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate sm:whitespace-normal">
          {sub}
        </p>
      )}
    </div>
  );
}
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
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored)
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {}
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );
  }, []);

  // ── KPI Calculations ──────────────────────────────────────
  const totalReach = campaigns.reduce(
    (s: number, c: any) => s + (c.reach || 0),
    0,
  );
  const totalClicks = campaigns.reduce(
    (s: number, c: any) => s + (c.clicks || 0),
    0,
  );
  const totalConversions = campaigns.reduce(
    (s: number, c: any) => s + (c.conversions || 0),
    0,
  );
  const totalBudget = campaigns.reduce(
    (s: number, c: any) => s + (c.budget || 0),
    0,
  );
  const totalSpent = campaigns.reduce(
    (s: number, c: any) => s + (c.spent || 0),
    0,
  );
  const activeCampaigns = campaigns.filter(
    (c: any) => c.status === "Active",
  ).length;

  const conversionRate =
    totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const ctr = totalReach > 0 ? (totalClicks / totalReach) * 100 : 0;
  const cpl = totalConversions > 0 ? totalSpent / totalConversions : 0;
  const roi =
    totalSpent > 0 ? ((totalBudget - totalSpent) / totalSpent) * 100 : 0;
  const budgetLeft = totalBudget - totalSpent;

  const overdueProjects = projects.filter(
    (p: any) => p.endDate && new Date(p.endDate) < today,
  ).length;

  // ── Chart Data ─────────────────────────────────────────────
  const monthlyData = [
    { month: "Oct", reach: 8200, clicks: 540, conversions: 28, spend: 12000 },
    { month: "Nov", reach: 12500, clicks: 820, conversions: 45, spend: 18000 },
    { month: "Dec", reach: 10800, clicks: 710, conversions: 38, spend: 15000 },
    { month: "Jan", reach: 16200, clicks: 1100, conversions: 62, spend: 22000 },
    { month: "Feb", reach: 21500, clicks: 1480, conversions: 84, spend: 28000 },
    {
      month: "Mar",
      reach: totalReach || 25000,
      clicks: totalClicks || 1800,
      conversions: totalConversions || 95,
      spend: totalSpent || 32000,
    },
  ];

  const campaignTypeData = campaigns.reduce((acc: any[], c: any) => {
    const ex = acc.find((a) => a.name === c.type);
    if (ex) {
      ex.value++;
      ex.conversions += c.conversions || 0;
    } else
      acc.push({ name: c.type, value: 1, conversions: c.conversions || 0 });
    return acc;
  }, []);

  const funnelData = [
    { stage: "Traffic / Reach", value: totalReach, fill: "#3b82f6" },
    { stage: "Clicks", value: totalClicks, fill: "#8b5cf6" },
    { stage: "Leads / Conv.", value: totalConversions, fill: "#10b981" },
  ];

  const formatNum = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}K`
        : n.toString();

  const formatCurrency = (n: number) =>
    n >= 100_000
      ? `₹${(n / 100_000).toFixed(1)}L`
      : n >= 1_000
        ? `₹${(n / 1_000).toFixed(1)}K`
        : `₹${n}`;

  return (
    <DashboardWrapper>
      <div className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto space-y-4">
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">          <div>
            <h1 className="text-2xl font-bold text-black?text-white">
              {greeting}, {currentUser?.username || "there"} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              &nbsp;·&nbsp;
              <span className="text-blue-500 font-medium">
                {activeCampaigns} active campaign
                {activeCampaigns !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">            <button
              onClick={() => setLastUpdated(new Date())}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
            >
              {/* <RefreshCw size={12} /> */}
              Last updated{" "}
              {lastUpdated.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
            <Link href="/campaigns">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                <Zap size={15} /> View Campaigns
              </button>
            </Link>
          </div>
        </div>

        {/* ── Alert ───────────────────────────────────────────── */}
        {overdueProjects > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">
              <strong>
                {overdueProjects} project{overdueProjects > 1 ? "s are" : " is"}{" "}
                overdue.
              </strong>{" "}
              Please review deadlines.
            </p>
            <Link
              href="/timeline"
              className="ml-auto text-xs font-semibold text-red-600 hover:underline whitespace-nowrap"
            >
              View Timeline →
            </Link>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Key Performance Indicators
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-3 sm:gap-3 sm:gap-3 sm:gap-3 sm:gap-4">
            <KPICard
              title="Total Website Traffic"
              value={formatNum(totalReach)}
              sub={`${formatNum(totalClicks)} clicks · ${ctr.toFixed(2)}% CTR`}
              icon={Globe}
              color="bg-blue-500"
              trend="up"
              trendValue="+18% vs last month"
            />
            <KPICard
              title="Total Leads / Conversions"
              value={totalConversions.toLocaleString()}
              sub={`From ${activeCampaigns} active campaigns`}
              icon={Target}
              color="bg-green-500"
              trend="up"
              trendValue="+24% vs last month"
            />
            <KPICard
              title="Conversion Rate"
              value={conversionRate.toFixed(2)}
              suffix="%"
              sub="Clicks → Leads"
              icon={Activity}
              color="bg-purple-500"
              trend={conversionRate > 3 ? "up" : "down"}
              trendValue={conversionRate > 3 ? "Above avg" : "Below avg"}
            />
          </div>
        </div>

        {/* ══ SECTION 2 — FINANCIAL KPIs ════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-green-600 rounded-full" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Financial Metrics
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4gap-3 sm:gap-3 sm:gap-3 sm:gap-3 sm:gap-3 sm:gap-4">
            <KPICard
              title="Total Budget"
              value={formatCurrency(totalBudget)}
              sub={`${formatCurrency(budgetLeft)} remaining`}
              icon={DollarSign}
              color="bg-teal-500"
              trend="up"
              trendValue="On track"
            />
            <KPICard
              title="Total Spent"
              value={formatCurrency(totalSpent)}
              sub={`${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of budget used`}
              icon={BarChart2}
              color="bg-orange-500"
              trend={totalSpent / totalBudget < 0.9 ? "up" : "down"}
              trendValue={
                totalSpent / totalBudget < 0.9 ? "Within budget" : "Near limit"
              }
            />
            <KPICard
              title="Cost Per Lead (CPL)"
              value={cpl > 0 ? formatCurrency(Math.round(cpl)) : "—"}
              sub="Spend ÷ Conversions"
              icon={MousePointer}
              color="bg-pink-500"
              trend={cpl < 500 ? "up" : "down"}
              trendValue={cpl < 500 ? "Efficient" : "High CPL"}
            />
            <KPICard
              title="Return on Investment"
              value={`${roi > 0 ? "+" : ""}${roi.toFixed(1)}`}
              suffix="%"
              sub="(Budget - Spent) / Spent"
              icon={TrendingUp}
              color="bg-indigo-500"
              trend={roi > 0 ? "up" : "down"}
              trendValue={roi > 0 ? "Profitable" : "Review needed"}
            />
          </div>
        </div>

        {/* ══ SECTION 3 — CHARTS ════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {" "}
          {/* Traffic & Conversions Trend */}
          <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-800">
                  Traffic & Conversion Trend
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Last 6 months performance
                </p>
              </div>
              <Link
                href="/analytics"
                className="text-xs text-blue-500 font-medium hover:text-blue-700 flex items-center gap-1"
              >
                Full Report <ChevronRight size={12} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8f8f8" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #f0f0f0",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#gReach)"
                  name="Reach"
                  dot={{ r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gConv)"
                  name="Conversions"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Conversion Funnel */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">Conversion Funnel</h3>
            <p className="text-xs text-gray-400 mb-4">
              Traffic → Clicks → Leads
            </p>
            <div className="space-y-3">
              {funnelData.map((stage, idx) => {
                const pct =
                  idx === 0
                    ? 100
                    : funnelData[0].value > 0
                      ? (stage.value / funnelData[0].value) * 100
                      : 0;
                return (
                  <div key={stage.stage}>
                    <div className="flex justify-between text-xs text-black mb-1">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="font-bold" style={{ color: stage.fill }}>
                        {formatNum(stage.value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{
                          width: `${Math.max(pct, 3)}%`,
                          backgroundColor: stage.fill,
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-600">
                  {ctr.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-400">Click Rate</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-600">
                  {conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-400">Conv. Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ SECTION 4 — SPEND vs RESULTS ══════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {" "}
          {/* Traffic & Conversions Trend */}
          {/* Monthly Spend */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">Monthly Ad Spend</h3>
            <p className="text-xs text-gray-400 mb-4">
              Budget utilization over time
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                />
                <Bar
                  dataKey="spend"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  name="Spend (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Campaign Mix */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">Campaign Mix</h3>
            <p className="text-xs text-gray-400 mb-3">By channel type</p>
            {campaignTypeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={campaignTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {campaignTypeData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {campaignTypeData.slice(0, 4).map((d: any, i: number) => (
                    <div
                      key={d.name}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[i] }}
                        />
                        <span className="text-xs text-black">{d.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {d.value} campaign{d.value > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-300 text-xs">
                No campaigns yet
              </div>
            )}
          </div>
          {/* Quick Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Quick Summary</h3>
            <div className="space-y-3">
              {[
                {
                  label: "Active Projects",
                  value: projects.filter(
                    (p: any) => !p.endDate || new Date(p.endDate) >= today,
                  ).length,
                  icon: FolderOpen,
                  iconColor: "#3b82f6",
                  bg: "#eff6ff",
                },
                {
                  label: "Team Members",
                  value: users.length,
                  icon: Users,
                  iconColor: "#a855f7",
                  bg: "#faf5ff",
                },
                {
                  label: "Campaigns Running",
                  value: activeCampaigns,
                  icon: Zap,
                  iconColor: "#22c55e",
                  bg: "#f0fdf4",
                },
                {
                  label: "Overdue Projects",
                  value: overdueProjects,
                  icon: AlertCircle,
                  iconColor: overdueProjects > 0 ? "#ef4444" : "#9ca3af",
                  bg: overdueProjects > 0 ? "#fef2f2" : "#f9fafb",
                },
                {
                  label: "Avg Attendance",
                  value:
                    attendance.length > 0
                      ? `${Math.round(
                          attendance.reduce((s: number, a: any) => {
                            const days = new Date(
                              today.getFullYear(),
                              today.getMonth() + 1,
                              0,
                            ).getDate();
                            return (
                              s + ((a.present + a.late + a.wfh) / days) * 100
                            );
                          }, 0) / attendance.length,
                        )}%`
                      : "—",
                  icon: Award,
                  iconColor: "#14b8a6",
                  bg: "#f0fdfa",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: item.bg }}
                    >
                      <item.icon size={14} style={{ color: item.iconColor }} />
                    </div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Top Campaigns</h3>
              <Link
                href="/campaigns"
                className="text-xs text-blue-500 font-medium hover:text-blue-700 flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {campaigns.length === 0 ? (
                <div className="py-10 text-center text-gray-300 text-sm">
                  No campaigns yet
                </div>
              ) : (
                [...campaigns]
                  .sort(
                    (a: any, b: any) =>
                      (b.conversions || 0) - (a.conversions || 0),
                  )
                  .slice(0, 4)
                  .map((c: any, idx: number) => {
                    const cplVal =
                      c.conversions > 0
                        ? Math.round((c.spent || 0) / c.conversions)
                        : null;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 sm:gap-3 sm:gap-3 sm:gap-3 sm:gap-4 px-5 py-3 hover:bg-gray-50"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: COLORS[idx] }}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {c.type} · {c.status}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-800">
                            {(c.conversions || 0).toLocaleString()} conv.
                          </p>
                          {cplVal && (
                            <p className="text-xs text-gray-400">
                              ₹{cplVal} CPL
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Active Projects</h3>
              <Link
                href="/"
                className="text-xs text-blue-500 font-medium hover:text-blue-700 flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.length === 0 ? (
                <div className="py-10 text-center text-gray-300 text-sm">
                  No projects yet
                </div>
              ) : (
                projects.slice(0, 4).map((p: any, idx: number) => {
                  const isOverdue = p.endDate && new Date(p.endDate) < today;
                  const daysLeft = p.endDate
                    ? Math.ceil(
                        (new Date(p.endDate).getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;
                  return (
                    <Link href={`/projects/${p.id}`} key={p.id}>
                      <div className="flex items-center gap-3 sm:gap-3 sm:gap-3 sm:gap-3 sm:gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: COLORS[idx % COLORS.length] + "20",
                          }}
                        >
                          <FolderOpen
                            size={16}
                            style={{ color: COLORS[idx % COLORS.length] }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-xs text-gray-400 truncate">
                              {p.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {isOverdue ? (
                            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              Overdue
                            </span>
                          ) : daysLeft !== null ? (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${daysLeft <= 7 ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50"}`}
                            >
                              {daysLeft}d left
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">
                              No deadline
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

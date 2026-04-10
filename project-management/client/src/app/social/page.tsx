"use client";
import { useState } from "react";
import DashboardWrapper from "../dashboardWrapper";
import { useGetCampaignsQuery } from "@/state/api";
import { Heart, MessageCircle, Share2, Eye, MousePointer, Users, Star, TrendingUp, ChevronDown } from "lucide-react";

const PLATFORM_CONFIG: Record<string, { name: string; icon: string; color: string; bg: string; border: string; text: string; badge: string; types: string[] }> = {
  instagram: { name: "Instagram", icon: "📸", color: "#E1306C", bg: "bg-pink-50",  border: "border-pink-200",  text: "text-pink-600",  badge: "bg-pink-100 text-pink-700",  types: ["Instagram"] },
  facebook:  { name: "Facebook",  icon: "👥", color: "#1877F2", bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-600",  badge: "bg-blue-100 text-blue-700",  types: ["Facebook"] },
  linkedin:  { name: "LinkedIn",  icon: "💼", color: "#0A66C2", bg: "bg-sky-50",   border: "border-sky-200",   text: "text-sky-700",   badge: "bg-sky-100 text-sky-700",   types: ["LinkedIn"] },
  twitter:   { name: "Twitter/X", icon: "🐦", color: "#000000", bg: "bg-gray-50",  border: "border-gray-200",  text: "text-gray-800",  badge: "bg-gray-100 text-gray-700", types: ["Twitter"] },
};

type PlatformKey = keyof typeof PLATFORM_CONFIG;

export default function SocialMediaPage() {
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const [active, setActive] = useState<PlatformKey>("instagram");
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const fmt = (n: number) =>
    n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` :
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  const getPlatformCampaigns = (key: PlatformKey) => {
    const types = PLATFORM_CONFIG[key].types;
    return campaigns.filter((c: any) => types.includes(c.type));
  };

  const getPlatformStats = (key: PlatformKey) => {
    const camps = getPlatformCampaigns(key);
    return {
      reach:       camps.reduce((s, c: any) => s + (c.reach || 0), 0),
      clicks:      camps.reduce((s, c: any) => s + (c.clicks || 0), 0),
      conversions: camps.reduce((s, c: any) => s + (c.conversions || 0), 0),
      spent:       camps.reduce((s, c: any) => s + (c.spent || 0), 0),
      budget:      camps.reduce((s, c: any) => s + (c.budget || 0), 0),
      active:      camps.filter((c: any) => c.status === "Active").length,
      count:       camps.length,
    };
  };

  const p = PLATFORM_CONFIG[active];
  const stats = getPlatformStats(active);
  const platformCampaigns = getPlatformCampaigns(active);
  const engagementRate = stats.reach > 0 ? ((stats.clicks / stats.reach) * 100).toFixed(2) : "0.00";
  const convRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100).toFixed(2) : "0.00";

  const totalReach       = campaigns.reduce((s, c: any) => s + (c.reach || 0), 0);
  const totalClicks      = campaigns.reduce((s, c: any) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c: any) => s + (c.conversions || 0), 0);
  const totalSpent       = campaigns.reduce((s, c: any) => s + (c.spent || 0), 0);

  const summaryStat = [
    { label: "Total Reach",    value: fmt(totalReach),       icon: Eye,          color: "text-blue-500",   sub: "All campaigns" },
    { label: "Total Clicks",   value: fmt(totalClicks),      icon: MousePointer, color: "text-purple-500", sub: `${totalReach > 0 ? ((totalClicks / totalReach) * 100).toFixed(2) : 0}% CTR` },
    { label: "Conversions",    value: fmt(totalConversions), icon: TrendingUp,   color: "text-green-500",  sub: `${totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0}% rate` },
    { label: "Total Spent",    value: `₹${fmt(totalSpent)}`, icon: Users,        color: "text-orange-500", sub: "Across all platforms" },
  ];

  return (
    <DashboardWrapper>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800?text-white">Social Media Metrics</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Based on your real campaign data across platforms</p>
        </div>

        {/* Overall Summary — 2 cols on mobile, 4 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {summaryStat.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium leading-tight">{s.label}</span>
                <s.icon size={13} className={s.color} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Platform Tabs — scrollable row on mobile */}
        {/* Desktop: normal tab row */}
        <div className="hidden sm:flex gap-2 flex-wrap">
          {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).map(key => {
            const pl = PLATFORM_CONFIG[key];
            const count = getPlatformCampaigns(key).length;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  active === key
                    ? `${pl.bg} ${pl.border} ${pl.text}`
                    : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span>{pl.icon}</span>{pl.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === key ? pl.badge : "bg-gray-100 text-gray-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile: dropdown */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setMobileDropdownOpen(v => !v)}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${p.bg} ${p.border} ${p.text}`}
          >
            <span className="flex items-center gap-2">
              <span>{p.icon}</span>{p.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.badge}`}>{stats.count}</span>
            </span>
            <ChevronDown size={15} className={`transition-transform ${mobileDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
              {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).filter(k => k !== active).map(key => {
                const pl = PLATFORM_CONFIG[key];
                const count = getPlatformCampaigns(key).length;
                return (
                  <button
                    key={key}
                    onClick={() => { setActive(key); setMobileDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    <span>{pl.icon}</span>{pl.name}
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 ml-auto">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Platform Content */}
        {platformCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-16 text-center">
            <p className="text-4xl mb-3">{p.icon}</p>
            <p className="text-gray-500 font-medium">No campaigns for {p.name} yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a campaign with type: <strong>{p.types.join(", ")}</strong></p>
          </div>
        ) : (
          /* Stack on mobile, 3-col on lg */
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-5">

            {/* Left panel: spans 2 cols on lg */}
            <div className="lg:col-span-2 space-y-4">

              {/* Overview banner */}
              <div className={`${p.bg} border ${p.border} rounded-2xl p-4 sm:p-5`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="font-bold text-gray-800 text-sm sm:text-base">{p.icon} {p.name} Overview</h2>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.badge}`}>
                    {stats.active} active{stats.active !== 1 ? "" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{fmt(stats.reach)}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Total Reach</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{engagementRate}%</p>
                    <p className="text-xs sm:text-sm text-gray-500">Engagement</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{fmt(stats.conversions)}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Conversions</p>
                  </div>
                </div>
              </div>

              {/* 4 mini stat cards — 2×2 on mobile, 4 cols on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Reach",      value: fmt(stats.reach),       icon: Eye,          color: "text-blue-400" },
                  { label: "Clicks",     value: fmt(stats.clicks),      icon: MousePointer, color: "text-purple-400" },
                  { label: "Conv. Rate", value: `${convRate}%`,          icon: TrendingUp,   color: "text-green-400" },
                  { label: "Spent",      value: `₹${fmt(stats.spent)}`, icon: Share2,       color: "text-orange-400" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{s.label}</span>
                      <s.icon size={13} className={s.color} />
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-800">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Reach vs Clicks bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Reach & Clicks</h3>
                <div className="space-y-4">
                  {[
                    { label: "Reach",  value: stats.reach,  opacity: 1 },
                    { label: "Clicks", value: stats.clicks, opacity: 0.6 },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-500 font-medium">{row.label}</span>
                        <span className="font-bold text-gray-800">{fmt(row.value)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${stats.reach > 0 ? Math.max((row.value / stats.reach) * 100, 2) : 2}%`,
                            backgroundColor: p.color,
                            opacity: row.opacity,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel: Top Campaigns */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                <p className="font-bold text-gray-800 text-sm">Campaigns on {p.name}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[...platformCampaigns]
                  .sort((a: any, b: any) => (b.conversions || 0) - (a.conversions || 0))
                  .slice(0, 5)
                  .map((c: any, i) => (
                    <div key={c.id} className="px-4 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-400 mt-0.5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-tight truncate">{c.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${p.badge}`}>{c.status}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        {[
                          { icon: Eye,          val: fmt(c.reach || 0),       color: "text-blue-400" },
                          { icon: MousePointer, val: fmt(c.clicks || 0),      color: "text-purple-400" },
                          { icon: TrendingUp,   val: fmt(c.conversions || 0), color: "text-green-400" },
                        ].map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <s.icon size={11} className={s.color} />
                            <span className="text-xs text-gray-500">{s.val}</span>
                          </div>
                        ))}
                      </div>
                      {c.budget && (
                        <p className="text-xs text-gray-400 mt-1.5">Budget: ₹{fmt(c.budget)}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table — horizontally scrollable on mobile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <p className="font-bold text-gray-800">Platform Comparison</p>
            <p className="text-xs text-gray-400">Real data from your campaigns</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Platform", "Campaigns", "Reach", "Clicks", "CTR", "Conversions"].map(h => (
                    <th key={h} className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).map(key => {
                  const pl = PLATFORM_CONFIG[key];
                  const s  = getPlatformStats(key);
                  const ctr = s.reach > 0 ? ((s.clicks / s.reach) * 100).toFixed(1) : "0.0";
                  return (
                    <tr
                      key={key}
                      className={`hover:bg-gray-50 cursor-pointer transition ${active === key ? "bg-blue-50/40" : ""}`}
                      onClick={() => setActive(key)}
                    >
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{pl.icon}</span>
                          <span className={`font-semibold ${pl.text} hidden xs:inline`}>{pl.name}</span>
                          {/* On very small screens just show icon */}
                          <span className={`font-semibold ${pl.text} xs:hidden text-xs`}>{pl.name.split("/")[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.count}</span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-gray-600 whitespace-nowrap">{fmt(s.reach)}</td>
                      <td className="px-4 sm:px-5 py-3 text-gray-600 whitespace-nowrap">{fmt(s.clicks)}</td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <span className={`font-semibold ${parseFloat(ctr) >= 3 ? "text-green-600" : parseFloat(ctr) >= 1 ? "text-yellow-600" : "text-red-500"}`}>
                          {ctr}%
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-gray-600 whitespace-nowrap">{fmt(s.conversions)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardWrapper>
  );
}
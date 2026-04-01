"use client";
import { useState } from "react";
import DashboardWrapper from "../dashboardWrapper";
import { useGetCampaignsQuery } from "@/state/api";
import { Heart, MessageCircle, Share2, Eye, MousePointer, Users, Star, TrendingUp } from "lucide-react";

const PLATFORM_CONFIG: Record<string, { name: string; icon: string; color: string; bg: string; border: string; text: string; badge: string; types: string[] }> = {
  instagram: { name: "Instagram", icon: "📸", color: "#E1306C", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-600", badge: "bg-pink-100 text-pink-700", types: ["Instagram"] },
  facebook:  { name: "Facebook",  icon: "👥", color: "#1877F2", bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-600",  badge: "bg-blue-100 text-blue-700",  types: ["Facebook"] },
  linkedin:  { name: "LinkedIn",  icon: "💼", color: "#0A66C2", bg: "bg-sky-50",   border: "border-sky-200",   text: "text-sky-700",   badge: "bg-sky-100 text-sky-700",   types: ["LinkedIn"] },
  twitter:   { name: "Twitter/X", icon: "🐦", color: "#000000", bg: "bg-gray-50",  border: "border-gray-200",  text: "text-gray-800",  badge: "bg-gray-100 text-gray-700", types: ["Twitter"] },
};

type PlatformKey = keyof typeof PLATFORM_CONFIG;

export default function SocialMediaPage() {
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const [active, setActive] = useState<PlatformKey>("instagram");
  const fmt = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

  // Map campaigns to platforms by type
  const getPlatformCampaigns = (key: PlatformKey) => {
    const types = PLATFORM_CONFIG[key].types;
    return campaigns.filter((c: any) => types.includes(c.type));
  };

  const getPlatformStats = (key: PlatformKey) => {
    const camps = getPlatformCampaigns(key);
    return {
      reach: camps.reduce((s, c: any) => s + (c.reach || 0), 0),
      clicks: camps.reduce((s, c: any) => s + (c.clicks || 0), 0),
      conversions: camps.reduce((s, c: any) => s + (c.conversions || 0), 0),
      spent: camps.reduce((s, c: any) => s + (c.spent || 0), 0),
      budget: camps.reduce((s, c: any) => s + (c.budget || 0), 0),
      active: camps.filter((c: any) => c.status === "Active").length,
      count: camps.length,
    };
  };

  const p = PLATFORM_CONFIG[active];
  const stats = getPlatformStats(active);
  const platformCampaigns = getPlatformCampaigns(active);
  const engagementRate = stats.reach > 0 ? ((stats.clicks / stats.reach) * 100).toFixed(2) : "0.00";
  const convRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100).toFixed(2) : "0.00";

  const totalReach = campaigns.reduce((s, c: any) => s + (c.reach || 0), 0);
  const totalClicks = campaigns.reduce((s, c: any) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c: any) => s + (c.conversions || 0), 0);
  const totalSpent = campaigns.reduce((s, c: any) => s + (c.spent || 0), 0);

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Social Media Metrics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Based on your real campaign data across platforms</p>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Reach", value: fmt(totalReach), icon: Eye, color: "text-blue-500", sub: "All campaigns" },
            { label: "Total Clicks", value: fmt(totalClicks), icon: MousePointer, color: "text-purple-500", sub: `${totalReach > 0 ? ((totalClicks/totalReach)*100).toFixed(2) : 0}% CTR` },
            { label: "Conversions", value: fmt(totalConversions), icon: TrendingUp, color: "text-green-500", sub: `${totalClicks > 0 ? ((totalConversions/totalClicks)*100).toFixed(2) : 0}% rate` },
            { label: "Total Spent", value: `₹${fmt(totalSpent)}`, icon: Users, color: "text-orange-500", sub: "Across all platforms" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400 font-medium">{s.label}</span><s.icon size={14} className={s.color} /></div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).map(key => {
            const pl = PLATFORM_CONFIG[key];
            const count = getPlatformCampaigns(key).length;
            return (
              <button key={key} onClick={() => setActive(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${active === key ? `${pl.bg} ${pl.border} ${pl.text}` : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"}`}>
                <span>{pl.icon}</span>{pl.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === key ? pl.badge : "bg-gray-100 text-gray-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {platformCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-4xl mb-3">{p.icon}</p>
            <p className="text-gray-500 font-medium">No campaigns for {p.name} yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a campaign with type: <strong>{p.types.join(", ")}</strong></p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {/* Left: Platform Overview + Stats */}
            <div className="col-span-2 space-y-4">
              <div className={`${p.bg} border ${p.border} rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">{p.icon} {p.name} Overview</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.badge}`}>{stats.active} active campaign{stats.active !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-2xl font-bold text-gray-800">{fmt(stats.reach)}</p><p className="text-sm text-gray-500">Total Reach</p></div>
                  <div><p className="text-2xl font-bold text-gray-800">{engagementRate}%</p><p className="text-sm text-gray-500">Engagement Rate</p></div>
                  <div><p className="text-2xl font-bold text-gray-800">{fmt(stats.conversions)}</p><p className="text-sm text-gray-500">Conversions</p></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Reach", value: fmt(stats.reach), icon: Eye, color: "text-blue-400" },
                  { label: "Clicks", value: fmt(stats.clicks), icon: MousePointer, color: "text-purple-400" },
                  { label: "Conv. Rate", value: `${convRate}%`, icon: TrendingUp, color: "text-green-400" },
                  { label: "Spent", value: `₹${fmt(stats.spent)}`, icon: Share2, color: "text-orange-400" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400">{s.label}</span><s.icon size={14} className={s.color} /></div>
                    <p className="text-lg font-bold text-gray-800">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Reach vs Clicks bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4">Reach & Clicks</h3>
                <div className="space-y-4">
                  {[{ label: "Reach", value: stats.reach, max: stats.reach, opacity: 1 }, { label: "Clicks", value: stats.clicks, max: stats.reach, opacity: 0.6 }].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-500 font-medium">{row.label}</span><span className="font-bold text-gray-800">{fmt(row.value)}</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${stats.reach > 0 ? Math.max((row.value/stats.reach)*100, 2) : 2}%`, backgroundColor: p.color, opacity: row.opacity }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Top Campaigns */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Star size={15} className="text-amber-400" />
                <p className="font-bold text-gray-800 text-sm">Campaigns on {p.name}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[...platformCampaigns].sort((a: any, b: any) => (b.conversions || 0) - (a.conversions || 0)).slice(0, 5).map((c: any, i) => (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400 mt-0.5">#{i+1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 leading-tight">{c.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${p.badge}`}>{c.status}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      {[{ icon: Eye, val: fmt(c.reach || 0), color: "text-blue-400" }, { icon: MousePointer, val: fmt(c.clicks || 0), color: "text-purple-400" }, { icon: TrendingUp, val: fmt(c.conversions || 0), color: "text-green-400" }].map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1"><s.icon size={11} className={s.color} /><span className="text-xs text-gray-500">{s.val}</span></div>
                      ))}
                    </div>
                    {c.budget && <p className="text-xs text-gray-400 mt-1.5">Budget: ₹{fmt(c.budget)}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><p className="font-bold text-gray-800">Platform Comparison</p><p className="text-xs text-gray-400">Real data from your campaigns</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{["Platform","Campaigns","Reach","Clicks","CTR","Conversions"].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).map(key => {
                  const pl = PLATFORM_CONFIG[key];
                  const s = getPlatformStats(key);
                  const ctr = s.reach > 0 ? ((s.clicks/s.reach)*100).toFixed(1) : "0.0";
                  return (
                    <tr key={key} className={`hover:bg-gray-50 cursor-pointer transition ${active === key ? "bg-blue-50/40" : ""}`} onClick={() => setActive(key)}>
                      <td className="px-5 py-3"><div className="flex items-center gap-2"><span>{pl.icon}</span><span className={`font-semibold ${pl.text}`}>{pl.name}</span></div></td>
                      <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.count}</span></td>
                      <td className="px-5 py-3 text-gray-600">{fmt(s.reach)}</td>
                      <td className="px-5 py-3 text-gray-600">{fmt(s.clicks)}</td>
                      <td className="px-5 py-3"><span className={`font-semibold ${parseFloat(ctr) >= 3 ? "text-green-600" : parseFloat(ctr) >= 1 ? "text-yellow-600" : "text-red-500"}`}>{ctr}%</span></td>
                      <td className="px-5 py-3 text-gray-600">{fmt(s.conversions)}</td>
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
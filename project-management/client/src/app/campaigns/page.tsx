"use client";
import { useState, useEffect } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetCampaignsQuery, useCreateCampaignMutation,
  useUpdateCampaignMutation, useDeleteCampaignMutation,
} from "@/state/api";
import { Plus, X, Pencil, Trash2, Megaphone, TrendingUp, Target, DollarSign, Eye, MousePointer, Zap } from "lucide-react";

const STATUSES = ["Draft", "Active", "Paused", "Completed", "Cancelled"];
const TYPES = ["Social Media", "Paid Ads", "Google Ads", "Email Marketing", "SEO", "PPC", "Content", "Influencer", "Event", "Instagram", "Facebook", "LinkedIn", "Twitter", "Other"];

const STATUS_DOT: Record<string, string> = {
  Draft: "bg-gray-400", Active: "bg-green-500", Paused: "bg-yellow-500",
  Completed: "bg-blue-500", Cancelled: "bg-red-500",
};
const STATUS_BADGE: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600", Active: "bg-green-100 text-green-700",
  Paused: "bg-yellow-100 text-yellow-700", Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};
const TYPE_BADGE: Record<string, string> = {
  "Social Media": "bg-pink-50 text-pink-700", "Paid Ads": "bg-blue-50 text-blue-700",
  "Google Ads": "bg-orange-50 text-orange-700", "Email Marketing": "bg-blue-50 text-blue-700",
  SEO: "bg-green-50 text-green-700", PPC: "bg-orange-50 text-orange-700",
  Content: "bg-purple-50 text-purple-700", Influencer: "bg-yellow-50 text-yellow-700",
  Event: "bg-red-50 text-red-700", Instagram: "bg-pink-50 text-pink-700",
  Facebook: "bg-blue-50 text-blue-700", LinkedIn: "bg-sky-50 text-sky-700",
  Twitter: "bg-gray-50 text-gray-700", Other: "bg-gray-50 text-gray-700",
};

const emptyForm = {
  name: "", description: "", status: "Draft", type: "Social Media",
  budget: "", spent: "", startDate: "", endDate: "",
  target: "", reach: "", clicks: "", conversions: "",
};

// ── Defined OUTSIDE component to keep stable identity ──
const InputField = ({ label, ...props }: any) => (
  <div>
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
      {label}
    </label>
    <input
      className="w-full border border-gray-200 dark:border-gray-700 
      bg-white dark:bg-gray-800 
      text-gray-800 dark:text-gray-100
      rounded-xl px-3 py-3 text-sm 
      outline-none focus:border-blue-500 transition"
      {...props}
    />
  </div>
);

function DetailPanel({ campaign, onClose, onEdit, getCTR, getROI, getBudgetUsed, barColor }: any) {
  const pct = getBudgetUsed(campaign);
  const roi = getROI(campaign);
  const remaining = (campaign.budget || 0) - (campaign.spent || 0);

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }) : "Not set";

  return (
    <div className="bg-white lg:rounded-xl lg:border lg:border-gray-100 lg:shadow-sm p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">{campaign.name}</h2>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[campaign.status] ?? "bg-gray-100 text-gray-600"}`}>
              {campaign.status}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[campaign.type] ?? "bg-gray-100 text-gray-600"}`}>
              {campaign.type}
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(campaign)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition">
            <Pencil size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition">
            <X size={14} />
          </button>
        </div>
      </div>

      {campaign.description && (
        <p className="text-sm text-gray-500 pb-4 mb-1 border-b border-gray-100">{campaign.description}</p>
      )}

      {/* KPIs */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-3">Key Metrics</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Reach", value: (campaign.reach || 0).toLocaleString(), icon: Eye, color: "text-blue-500" },
          { label: "Clicks", value: (campaign.clicks || 0).toLocaleString(), icon: MousePointer, color: "text-purple-500" },
          { label: "Conversions", value: (campaign.conversions || 0).toLocaleString(), icon: Target, color: "text-green-500" },
          { label: "CTR", value: getCTR(campaign), icon: TrendingUp, color: "text-orange-500" },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <m.icon size={12} className={m.color} />
              <p className="text-xs text-gray-400">{m.label}</p>
            </div>
            <p className="text-base font-bold text-gray-800">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Budget */}
      {campaign.budget ? (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Budget</p>
          {[
            { label: "Total Budget", value: `₹${campaign.budget.toLocaleString()}`, color: "" },
            { label: "Spent", value: `₹${(campaign.spent || 0).toLocaleString()}`, color: "" },
            { label: "Remaining", value: `₹${remaining.toLocaleString()}`, color: remaining < 0 ? "text-red-600" : "text-green-600" },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-sm py-1">
              <span className="text-gray-500">{r.label}</span>
              <span className={`font-semibold ${r.color || "text-gray-800"}`}>{r.value}</span>
            </div>
          ))}
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
          </div>
          {roi && (
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">ROI</span>
              <span className={`font-semibold ${Number(roi) > 0 ? "text-green-600" : "text-red-600"}`}>{roi}%</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Timeline */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timeline</p>
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Start</p>
            <p className="text-sm font-medium text-gray-700">{fmtDate(campaign.startDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">End</p>
            <p className="text-sm font-medium text-gray-700">{fmtDate(campaign.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Target */}
      {campaign.target && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Audience</p>
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{campaign.target}</p>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [form, setForm] = useState<any>(emptyForm);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (c: any) => {
    setForm({
      name: c.name, description: c.description || "", status: c.status,
      type: c.type, budget: c.budget || "", spent: c.spent || "",
      startDate: c.startDate ? c.startDate.split("T")[0] : "",
      endDate: c.endDate ? c.endDate.split("T")[0] : "",
      target: c.target || "", reach: c.reach || "",
      clicks: c.clicks || "", conversions: c.conversions || "",
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert("Campaign name is required");
    const payload = {
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
      spent: form.spent ? Number(form.spent) : undefined,
      reach: form.reach ? Number(form.reach) : undefined,
      clicks: form.clicks ? Number(form.clicks) : undefined,
      conversions: form.conversions ? Number(form.conversions) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    if (editingId) await updateCampaign({ id: editingId, ...payload });
    else await createCampaign(payload);
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this campaign permanently?")) return;
    await deleteCampaign(id);
    if (selectedCampaign?.id === id) setSelectedCampaign(null);
  };

  const filtered = campaigns.filter((c: any) => {
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    if (filterType !== "All" && c.type !== filterType) return false;
    return true;
  });

  const totalBudget = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((s: number, c: any) => s + (c.reach || 0), 0);
  const totalConversions = campaigns.reduce((s: number, c: any) => s + (c.conversions || 0), 0);
  const activeCampaigns = campaigns.filter((c: any) => c.status === "Active").length;

  const getROI = (c: any) => {
    if (!c.budget || !c.spent || c.spent === 0) return null;
    return (((c.budget - c.spent) / c.spent) * 100).toFixed(1);
  };
  const getCTR = (c: any) => {
    if (!c.reach || c.reach === 0) return "0%";
    return ((c.clicks / c.reach) * 100).toFixed(2) + "%";
  };
  const getConvRate = (c: any) => {
    if (!c.clicks || c.clicks === 0) return "0%";
    return ((c.conversions / c.clicks) * 100).toFixed(2) + "%";
  };
  const getBudgetUsed = (c: any) => {
    if (!c.budget || c.budget === 0) return 0;
    return Math.min(Math.round(((c.spent || 0) / c.budget) * 100), 100);
  };
  const barColor = (pct: number) =>
    pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500";

  return (
    <DashboardWrapper>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800?text-white">Campaigns</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage and track your marketing campaigns</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Campaigns", value: campaigns.length, icon: Megaphone, color: "text-blue-600 bg-blue-50" },
            { label: "Active", value: activeCampaigns, icon: Zap, color: "text-green-600 bg-green-50" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "text-purple-600 bg-purple-50" },
            { label: "Total Reach", value: totalReach.toLocaleString(), icon: Eye, color: "text-orange-600 bg-orange-50" },
            { label: "Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "text-pink-600 bg-pink-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color} mb-2`}>
                <s.icon size={16} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

     {/* ── Filters ── */}
<div className="flex flex-col gap-2 mb-5">
  <div
    className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0"
    style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as any}
  >
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-max">
      {["All", ...STATUSES].map(s => (
        <button
          key={s}
          onClick={() => setFilterStatus(s)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition
            ${filterStatus === s
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
        >
          {s}
        </button>
      ))}
    </div>
  </div>

  <div className="flex items-center gap-2">
    <select
      value={filterType}
      onChange={e => setFilterType(e.target.value)}
      className="flex-1 sm:flex-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 outline-none focus:border-blue-400 bg-white dark:bg-gray-900"
    >
      <option value="All">All Types</option>
      {TYPES.map(t => <option key={t}>{t}</option>)}
    </select>
    {(filterStatus !== "All" || filterType !== "All") && (
      <button
        onClick={() => { setFilterStatus("All"); setFilterType("All"); }}
        className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap"
      >
        Clear ✕
      </button>
    )}
  </div>
</div>

        {/* ── Content ── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Campaign List */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
                <Megaphone size={40} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-medium">No campaigns found</p>
                <p className="text-gray-300 text-sm mt-1 mb-4">Create your first campaign to get started</p>
                <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((campaign: any) => {
                  const pct = getBudgetUsed(campaign);
                  const roi = getROI(campaign);
                  const isSelected = selectedCampaign?.id === campaign.id;

                  return (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(isSelected ? null : campaign)}
                      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer transition hover:shadow-md
                        ${isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="p-4 sm:p-5">
                        {/* Card Header */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[campaign.status]}`} />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-800?text-white text-sm sm:text-base truncate">{campaign.name}</h3>
                              {campaign.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{campaign.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end" onClick={e => e.stopPropagation()}>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[campaign.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {campaign.status}
                            </span>
                            <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[campaign.type] ?? "bg-gray-100 text-gray-600"}`}>
                              {campaign.type}
                            </span>
                            <button onClick={() => openEdit(campaign)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(campaign.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {[
                            { label: "Reach", value: (campaign.reach || 0).toLocaleString() },
                            { label: "Clicks", value: (campaign.clicks || 0).toLocaleString() },
                            { label: "CTR", value: getCTR(campaign) },
                            { label: "Conv. Rate", value: getConvRate(campaign) },
                          ].map(m => (
                            <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">{m.label}</p>
                              <p className="text-xs sm:text-sm font-semibold text-gray-700">{m.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Budget bar */}
                        {campaign.budget ? (
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>₹{(campaign.spent || 0).toLocaleString()} / ₹{campaign.budget.toLocaleString()}</span>
                              <span className={pct > 90 ? "text-red-500 font-medium" : ""}>{pct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        ) : null}

                        {/* Footer */}
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-gray-400">
                          {campaign.startDate && (
                            <span>📅 {new Date(campaign.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                          )}
                          {campaign.endDate && (
                            <span>→ {new Date(campaign.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                          )}
                          {campaign.target && <span className="truncate max-w-[160px]">🎯 {campaign.target}</span>}
                          {roi && (
                            <span className={Number(roi) > 0 ? "text-green-600 font-medium" : "text-red-500"}>ROI: {roi}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Desktop Detail Panel ── */}
          {selectedCampaign && !isMobile && (
            <div className="hidden lg:block w-80 xl:w-96 shrink-0">
              <DetailPanel
                campaign={selectedCampaign}
                onClose={() => setSelectedCampaign(null)}
                onEdit={openEdit}
                getCTR={getCTR} getROI={getROI} getBudgetUsed={getBudgetUsed} barColor={barColor}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      {selectedCampaign && isMobile && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSelectedCampaign(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-gray-200 rounded-full" />
            </div>
            <DetailPanel
              campaign={selectedCampaign}
              onClose={() => setSelectedCampaign(null)}
              onEdit={openEdit}
              getCTR={getCTR} getROI={getROI} getBudgetUsed={getBudgetUsed} barColor={barColor}
            />
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
<div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-9 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-800">{editingId ? "Edit Campaign" : "Create Campaign"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
<div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {/* Basic Info */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
                <div className="space-y-3">
                  <InputField
                    label="Campaign Name *"
                    type="text"
                    placeholder="e.g. Summer Sale 2026"
                    value={form.name}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                    autoFocus
                  />
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                    <textarea
                      placeholder="Describe your campaign goals..."
                      value={form.description}
                      onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                      <select
                        value={form.status}
                        onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                      <select
                        value={form.type}
                        onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      >
                        {TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Budget */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Budget</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Total Budget (₹)"
                    type="number"
                    placeholder="0"
                    value={form.budget}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, budget: e.target.value }))}
                  />
                  <InputField
                    label="Amount Spent (₹)"
                    type="number"
                    placeholder="0"
                    value={form.spent}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, spent: e.target.value }))}
                  />
                </div>
              </section>

              {/* Timeline */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Timeline</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
                  />
                  <InputField
                    label="End Date"
                    type="date"
                    value={form.endDate}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </section>

              {/* Performance Metrics */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Performance Metrics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    label="Reach"
                    type="number"
                    placeholder="0"
                    value={form.reach}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, reach: e.target.value }))}
                  />
                  <InputField
                    label="Clicks"
                    type="number"
                    placeholder="0"
                    value={form.clicks}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, clicks: e.target.value }))}
                  />
                  <InputField
                    label="Conversions"
                    type="number"
                    placeholder="0"
                    value={form.conversions}
                    onChange={(e: any) => setForm((f: any) => ({ ...f, conversions: e.target.value }))}
                  />
                </div>
              </section>

              {/* Target Audience */}
              <InputField
                label="Target Audience"
                type="text"
                placeholder="e.g. Women 25-45, interested in fitness"
                value={form.target}
                onChange={(e: any) => setForm((f: any) => ({ ...f, target: e.target.value }))}
              />
            </div>

            {/* Modal Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
  <button
    onClick={() => setShowModal(false)}
    className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
  >
    Cancel
  </button>
  <button
    onClick={handleSubmit}
    className="flex-1 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white"
  >
    {editingId ? "Save Changes" : "Create Campaign"}
  </button>
</div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}
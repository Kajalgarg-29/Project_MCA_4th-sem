"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetCampaignsQuery, useCreateCampaignMutation,
  useUpdateCampaignMutation, useDeleteCampaignMutation,
} from "@/state/api";
import {
  Plus, X, Pencil, Trash2, Megaphone, TrendingUp,
  Target, DollarSign, Users, Eye, MousePointer, CheckCircle, Clock, FileText, Zap
} from "lucide-react";

const STATUSES = ["Draft", "Active", "Paused", "Completed", "Cancelled"];
const TYPES = ["Social Media", "Email", "SEO", "PPC", "Content", "Influencer", "Event", "Other", "Instagram", "Facebook", "LinkedIn", "Twitter"];

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600",
  Active: "bg-green-100 text-green-700",
  Paused: "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUS_DOT: Record<string, string> = {
  Draft: "bg-gray-400",
  Active: "bg-green-500",
  Paused: "bg-yellow-500",
  Completed: "bg-blue-500",
  Cancelled: "bg-red-500",
};

const TYPE_COLORS: Record<string, string> = {
  "Social Media": "bg-pink-50 text-pink-700",
  Email: "bg-blue-50 text-blue-700",
  SEO: "bg-green-50 text-green-700",
  PPC: "bg-orange-50 text-orange-700",
  Content: "bg-purple-50 text-purple-700",
  Influencer: "bg-yellow-50 text-yellow-700",
  Event: "bg-red-50 text-red-700",
  Other: "bg-gray-50 text-gray-700",
  Instagram: "bg-pink-50 text-pink-700",
  Facebook: "bg-blue-50 text-blue-700",
  LinkedIn: "bg-sky-50 text-sky-700",
  Twitter: "bg-gray-50 text-gray-700",
};

const emptyForm = {
  name: "", description: "", status: "Draft", type: "Social Media",
  budget: "", spent: "", startDate: "", endDate: "",
  target: "", reach: "", clicks: "", conversions: "",
};

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

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (c: any) => {
    setForm({
      name: c.name, description: c.description || "", status: c.status,
      type: c.type, budget: c.budget || "", spent: c.spent || "",
      startDate: c.startDate ? c.startDate.split("T")[0] : "",
      endDate: c.endDate ? c.endDate.split("T")[0] : "",
      target: c.target || "", reach: c.reach || "", clicks: c.clicks || "", conversions: c.conversions || "",
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
    if (editingId) {
      await updateCampaign({ id: editingId, ...payload });
    } else {
      await createCampaign(payload);
    }
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
  const totalSpent = campaigns.reduce((s: number, c: any) => s + (c.spent || 0), 0);
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

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage and track your marketing campaigns</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total Campaigns", value: campaigns.length, icon: Megaphone, color: "text-blue-600 bg-blue-50" },
            { label: "Active", value: activeCampaigns, icon: Zap, color: "text-green-600 bg-green-50" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "text-purple-600 bg-purple-50" },
            { label: "Total Reach", value: totalReach.toLocaleString(), icon: Eye, color: "text-orange-600 bg-orange-50" },
            { label: "Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "text-pink-600 bg-pink-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color} mb-2`}>
                <s.icon size={18} />
              </div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {["All", ...STATUSES].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                  ${filterStatus === s ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-blue-400 bg-white"
          >
            <option value="All">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(filterStatus !== "All" || filterType !== "All") && (
            <button
              type="button"
              onClick={() => { setFilterStatus("All"); setFilterType("All"); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              Clear filters ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Campaign List */}
          <div className={`${selectedCampaign ? "w-1/2" : "w-full"} transition-all`}>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
                <Megaphone size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-medium">No campaigns found</p>
                <p className="text-gray-300 text-sm mt-1 mb-4">Create your first campaign to get started</p>
                <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((campaign: any) => {
                  const budgetUsed = getBudgetUsed(campaign);
                  const roi = getROI(campaign);
                  const isSelected = selectedCampaign?.id === campaign.id;

                  return (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(isSelected ? null : campaign)}
                      className={`bg-white rounded-xl shadow-sm border cursor-pointer transition hover:shadow-md
                        ${isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${STATUS_DOT[campaign.status]}`} />
                            <div>
                              <h3 className="font-semibold text-gray-800">{campaign.name}</h3>
                              {campaign.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{campaign.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[campaign.status]}`}>
                              {campaign.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[campaign.type] || "bg-gray-100 text-gray-600"}`}>
                              {campaign.type}
                            </span>
                            <button onClick={() => openEdit(campaign)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(campaign.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                            <p className="text-xs text-gray-400">Reach</p>
                            <p className="text-sm font-semibold text-gray-700">{(campaign.reach || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                            <p className="text-xs text-gray-400">Clicks</p>
                            <p className="text-sm font-semibold text-gray-700">{(campaign.clicks || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                            <p className="text-xs text-gray-400">CTR</p>
                            <p className="text-sm font-semibold text-gray-700">{getCTR(campaign)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                            <p className="text-xs text-gray-400">Conv. Rate</p>
                            <p className="text-sm font-semibold text-gray-700">{getConvRate(campaign)}</p>
                          </div>
                        </div>

                        {/* Budget bar */}
                        {campaign.budget && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Budget Used: ₹{(campaign.spent || 0).toLocaleString()} / ₹{campaign.budget.toLocaleString()}</span>
                              <span className={budgetUsed > 90 ? "text-red-500 font-medium" : ""}>{budgetUsed}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${budgetUsed > 90 ? "bg-red-500" : budgetUsed > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${budgetUsed}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          {campaign.startDate && (
                            <span>📅 {new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          )}
                          {campaign.endDate && (
                            <span>→ {new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          )}
                          {campaign.target && <span>🎯 {campaign.target}</span>}
                          {roi && <span className={Number(roi) > 0 ? "text-green-600 font-medium" : "text-red-500"}>ROI: {roi}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedCampaign && (
            <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedCampaign.name}</h2>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[selectedCampaign.status]}`}>{selectedCampaign.status}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[selectedCampaign.type]}`}>{selectedCampaign.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(selectedCampaign)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Pencil size={15} /></button>
                  <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><X size={15} /></button>
                </div>
              </div>

              {selectedCampaign.description && (
                <p className="text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">{selectedCampaign.description}</p>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Total Reach", value: (selectedCampaign.reach || 0).toLocaleString(), icon: Eye, color: "text-blue-600" },
                  { label: "Clicks", value: (selectedCampaign.clicks || 0).toLocaleString(), icon: MousePointer, color: "text-purple-600" },
                  { label: "Conversions", value: (selectedCampaign.conversions || 0).toLocaleString(), icon: Target, color: "text-green-600" },
                  { label: "CTR", value: getCTR(selectedCampaign), icon: TrendingUp, color: "text-orange-600" },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <m.icon size={14} className={m.color} />
                      <p className="text-xs text-gray-400">{m.label}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Budget */}
              {selectedCampaign.budget && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700 text-sm mb-3">Budget Overview</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Total Budget</span>
                    <span className="font-semibold text-gray-800">₹{selectedCampaign.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Spent</span>
                    <span className="font-semibold text-gray-800">₹{(selectedCampaign.spent || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-500">Remaining</span>
                    <span className={`font-semibold ${(selectedCampaign.budget - (selectedCampaign.spent || 0)) < 0 ? "text-red-600" : "text-green-600"}`}>
                      ₹{(selectedCampaign.budget - (selectedCampaign.spent || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getBudgetUsed(selectedCampaign) > 90 ? "bg-red-500" : getBudgetUsed(selectedCampaign) > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${getBudgetUsed(selectedCampaign)}%` }}
                    />
                  </div>
                  {getROI(selectedCampaign) && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">ROI</span>
                      <span className={`font-semibold ${Number(getROI(selectedCampaign)) > 0 ? "text-green-600" : "text-red-600"}`}>
                        {getROI(selectedCampaign)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <h3 className="font-medium text-gray-700 text-sm mb-3">Timeline</h3>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Start Date</p>
                    <p className="font-medium text-gray-700">
                      {selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">End Date</p>
                    <p className="font-medium text-gray-700">
                      {selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target */}
              {selectedCampaign.target && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm mb-2">Target Audience</h3>
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{selectedCampaign.target}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? "Edit Campaign" : "Create New Campaign"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Campaign Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Sale 2026"
                      value={form.name}
                      onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      autoFocus
                    />
                  </div>
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
              </div>

              {/* Budget */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Budget</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Total Budget (₹)</label>
                    <input type="number" placeholder="0" value={form.budget}
                      onChange={e => setForm((f: any) => ({ ...f, budget: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Amount Spent (₹)</label>
                    <input type="number" placeholder="0" value={form.spent}
                      onChange={e => setForm((f: any) => ({ ...f, spent: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Timeline</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
                    <input type="date" value={form.endDate}
                      onChange={e => setForm((f: any) => ({ ...f, endDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Reach</label>
                    <input type="number" placeholder="0" value={form.reach}
                      onChange={e => setForm((f: any) => ({ ...f, reach: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Clicks</label>
                    <input type="number" placeholder="0" value={form.clicks}
                      onChange={e => setForm((f: any) => ({ ...f, clicks: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Conversions</label>
                    <input type="number" placeholder="0" value={form.conversions}
                      onChange={e => setForm((f: any) => ({ ...f, conversions: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Target Audience</label>
                <input type="text" placeholder="e.g. Women 25-45, interested in fitness"
                  value={form.target}
                  onChange={e => setForm((f: any) => ({ ...f, target: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 font-medium">
                {editingId ? "Save Changes" : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}
"use client";

import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetCampaignsQuery, useCreateCampaignMutation, useUpdateCampaignMutation, useDeleteCampaignMutation, Campaign } from "@/state/api";
import { Plus, X, Pencil, Trash2, Megaphone, Target, TrendingUp, DollarSign, MousePointerClick } from "lucide-react";

const CAMPAIGN_TYPES = ["SEO", "Google Ads", "Facebook Ads", "Instagram", "Email Marketing", "Content Marketing", "LinkedIn Ads", "YouTube"];
const PLATFORMS = ["Google", "Facebook", "Instagram", "LinkedIn", "Email", "YouTube", "SEO"];
const STATUSES = ["Draft", "Active", "Paused", "Completed"];
const emptyForm = { name: "", type: "Google Ads", platform: "Google", budget: "", startDate: "", endDate: "", goal: "", status: "Draft", targetAge: "", targetLocation: "", targetIndustry: "", clicks: "", leads: "", conversions: "", impressions: "" };
const statusColors: Record<string, string> = { Active: "bg-green-100 text-green-700", Draft: "bg-gray-100 text-gray-600", Paused: "bg-yellow-100 text-yellow-700", Completed: "bg-blue-100 text-blue-700" };
const platformColors: Record<string, string> = { Google: "#4285F4", Facebook: "#1877F2", Instagram: "#E1306C", LinkedIn: "#0A66C2", Email: "#6366f1", YouTube: "#FF0000", SEO: "#10b981" };

function CampaignModal({ title, form, setForm, onSubmit, onClose, isEdit }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Campaign Name *</label>
            <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Sale Campaign" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Campaign Type</label>
            <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
              {CAMPAIGN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Platform</label>
            <select value={form.platform} onChange={e => setForm((f: any) => ({ ...f, platform: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Budget (₹) *</label>
            <input type="number" value={form.budget} onChange={e => setForm((f: any) => ({ ...f, budget: e.target.value }))} placeholder="e.g. 50000" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
            <input type="date" value={form.startDate} onChange={e => setForm((f: any) => ({ ...f, startDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
            <input type="date" value={form.endDate} onChange={e => setForm((f: any) => ({ ...f, endDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Campaign Goal</label>
            <input value={form.goal} onChange={e => setForm((f: any) => ({ ...f, goal: e.target.value }))} placeholder="e.g. Generate 200 leads, Increase brand awareness" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="col-span-2 border-t pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🎯 Target Audience</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Age Group</label>
                <input value={form.targetAge} onChange={e => setForm((f: any) => ({ ...f, targetAge: e.target.value }))} placeholder="e.g. 25-40" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                <input value={form.targetLocation} onChange={e => setForm((f: any) => ({ ...f, targetLocation: e.target.value }))} placeholder="e.g. India, Mumbai" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Industry</label>
                <input value={form.targetIndustry} onChange={e => setForm((f: any) => ({ ...f, targetIndustry: e.target.value }))} placeholder="e.g. Finance, Tech" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>
          {isEdit && (
            <div className="col-span-2 border-t pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📊 Performance Metrics</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Leads", key: "leads" },
                  { label: "Clicks", key: "clicks" },
                  { label: "Conversions", key: "conversions" },
                  { label: "Impressions", key: "impressions" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <input type="number" value={form[key]} onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={onSubmit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">{isEdit ? "Save Changes" : "Create Campaign"}</button>
        </div>
      </div>
    </div>
  );
}

function CampaignsContent() {
  const { data: campaigns = [], isLoading } = useGetCampaignsQuery();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("All");

  const handleCreate = async () => {
    if (!form.name || !form.budget) return;
    await createCampaign(form as any);
    setForm(emptyForm); setShowModal(false);
  };
  const handleEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setForm({ name: c.name, type: c.type, platform: c.platform, budget: String(c.budget), startDate: c.startDate ? c.startDate.split("T")[0] : "", endDate: c.endDate ? c.endDate.split("T")[0] : "", goal: c.goal || "", status: c.status, targetAge: c.targetAge || "", targetLocation: c.targetLocation || "", targetIndustry: c.targetIndustry || "", clicks: String(c.clicks || 0), leads: String(c.leads || 0), conversions: String(c.conversions || 0), impressions: String(c.impressions || 0) });
  };
  const handleUpdate = async () => {
    if (!editingCampaign || !form.name) return;
    await updateCampaign({ id: editingCampaign.id, data: form as any });
    setEditingCampaign(null); setForm(emptyForm);
  };
  const handleDelete = async (id: number) => { await deleteCampaign(id); setDeleteConfirm(null); };

  const filtered = filterStatus === "All" ? campaigns : campaigns.filter(c => c.status === filterStatus);
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);

  return (
    <div className="space-y-0 -m-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Megaphone size={20} className="text-white" /></div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Campaign Management</h1>
            <p className="text-xs text-gray-400">{campaigns.length} campaigns total</p>
          </div>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={16} /> New Campaign
        </button>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "bg-blue-500" },
            { label: "Active Campaigns", value: activeCampaigns, icon: Megaphone, color: "bg-green-500" },
            { label: "Total Leads", value: totalLeads, icon: Target, color: "bg-violet-500" },
            { label: "Conversions", value: totalConversions, icon: TrendingUp, color: "bg-orange-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}><Icon size={14} className="text-white" /></div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{value}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">All Campaigns</h3>
            <div className="flex gap-1">
              {["All", ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{s}</button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading campaigns...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No campaigns yet. Create your first one!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{["Campaign", "Type", "Platform", "Budget", "Status", "Leads", "Clicks", "Conversions", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-sm text-gray-800">{c.name}</div>
                      {c.goal && <div className="text-xs text-gray-400 truncate max-w-[160px]">{c.goal}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{c.type}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${platformColors[c.platform] || "#6b7280"}20`, color: platformColors[c.platform] || "#6b7280" }}>{c.platform}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-700">₹{c.budget.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[c.status] || "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1 text-sm font-semibold text-violet-600"><Target size={13} />{c.leads || 0}</div></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1 text-sm text-blue-500"><MousePointerClick size={13} />{c.clicks || 0}</div></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1 text-sm text-green-600"><TrendingUp size={13} />{c.conversions || 0}</div></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <CampaignModal title="New Campaign" form={form} setForm={setForm} onSubmit={handleCreate} onClose={() => { setShowModal(false); setForm(emptyForm); }} isEdit={false} />}
      {editingCampaign && <CampaignModal title="Edit Campaign" form={form} setForm={setForm} onSubmit={handleUpdate} onClose={() => { setEditingCampaign(null); setForm(emptyForm); }} isEdit={true} />}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={36} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Delete Campaign?</h2>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return <DashboardWrapper><CampaignsContent /></DashboardWrapper>;
}

"use client";

import { useState } from "react";
import DashboardWrapper from "./dashboardWrapper";
import { useGetProjectsQuery, useGetCampaignsQuery, useGetUsersQuery, useGetTasksQuery, useCreateProjectMutation } from "@/state/api";
import Link from "next/link";
import { LayoutDashboard, FolderOpen, Radio, Megaphone, Plus, X, ArrowRight, CheckSquare, Target, TrendingUp, Users, Clock, Star, Zap } from "lucide-react";

const QUICK_LINKS = [
  { href: "/dashboard", label: "Dashboard", desc: "KPIs & charts", icon: LayoutDashboard, color: "bg-blue-500", light: "bg-blue-50 text-blue-600" },
  { href: "/campaigns", label: "Campaigns", desc: "Manage campaigns", icon: Radio, color: "bg-violet-500", light: "bg-violet-50 text-violet-600" },
  { href: "/marketing", label: "Marketing Hub", desc: "Analytics overview", icon: Megaphone, color: "bg-pink-500", light: "bg-pink-50 text-pink-600" },
];

function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "" });
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">New Project</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Project Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Q2 Marketing Campaign" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (form.name) { onSave(form); onClose(); } }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Create Project</button>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: tasks = [] } = useGetTasksQuery({ projectId: projects[0]?.id }, { skip: !projects[0]?.id });
  const [createProject] = useCreateProjectMutation();
  const [showNewProject, setShowNewProject] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const urgentTasks = tasks.filter(t => t.priority === "Urgent" && t.status !== "Done").length;

  const handleCreateProject = async (data: any) => {
    await createProject({
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-0 -m-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-yellow-300" />
              <span className="text-blue-200 text-xs font-medium">{dateStr}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{greeting}! 👋</h1>
            <p className="text-blue-200 text-sm">Here's your workspace overview for today.</p>
          </div>
          <button onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow-lg">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Mini stats in hero */}
        <div className="relative z-10 grid grid-cols-4 gap-3 mt-6">
          {[
            { label: "Projects", value: projects.length, icon: FolderOpen },
            { label: "Tasks Done", value: `${completedTasks}/${tasks.length}`, icon: CheckSquare },
            { label: "Active Campaigns", value: activeCampaigns, icon: Radio },
            { label: "Total Leads", value: totalLeads, icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white bg-opacity-10 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3">
              <Icon size={18} className="text-blue-200" />
              <div>
                <div className="text-white font-bold text-lg leading-none">{value}</div>
                <div className="text-blue-200 text-xs mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Alerts */}
        {urgentTasks > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-3">
            <Zap size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">You have {urgentTasks} urgent task{urgentTasks > 1 ? "s" : ""} that need attention!</span>
            <Link href={`/projects/${projects[0]?.id}`} className="ml-auto text-xs text-red-500 hover:underline font-medium flex items-center gap-1">View <ArrowRight size={12} /></Link>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ href, label, desc, icon: Icon, color, light }) => (
              <Link key={href} href={href}
                className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-400 ml-auto transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Projects + Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Projects */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Your Projects</h2>
              <button onClick={() => setShowNewProject(true)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={13} /> New Project
              </button>
            </div>
            {loadingProjects ? (
              <div className="p-8 text-center text-gray-300 text-sm">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center">
                <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-3">No projects yet</p>
                <button onClick={() => setShowNewProject(true)} className="text-blue-500 text-sm hover:underline">Create your first project →</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {projects.map((project, i) => {
                  const colors = ["bg-blue-500", "bg-violet-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
                  const color = colors[i % colors.length];
                  return (
                    <Link key={project.id} href={`/projects/${project.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition group">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800 group-hover:text-blue-600 transition truncate">{project.name}</div>
                        <div className="text-xs text-gray-400 truncate">{project.description || "No description"}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {project.endDate && (
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{new Date(project.endDate).toLocaleDateString()}</span>
                        )}
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-400 transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side stats */}
          <div className="space-y-3">
            {/* Team */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</span>
                <Users size={16} className="text-gray-300" />
              </div>
              <div className="text-3xl font-bold text-orange-500 mb-1">{users.length}</div>
              <div className="text-xs text-gray-400">members across {projects.length} projects</div>
              <Link href="/users" className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:underline font-medium">
                View team <ArrowRight size={11} />
              </Link>
            </div>

            {/* Campaigns summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaigns</span>
                <TrendingUp size={16} className="text-gray-300" />
              </div>
              <div className="text-3xl font-bold text-violet-500 mb-1">{campaigns.length}</div>
              <div className="text-xs text-gray-400">{activeCampaigns} active · {totalLeads} leads</div>
              <Link href="/campaigns" className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:underline font-medium">
                View campaigns <ArrowRight size={11} />
              </Link>
            </div>

            {/* Task progress */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
                  <CheckSquare size={16} className="text-gray-300" />
                </div>
                <div className="text-3xl font-bold text-green-500 mb-1">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</div>
                <div className="text-xs text-gray-400 mb-2">tasks completed</div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Campaigns */}
        {campaigns.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Recent Campaigns</h2>
              <Link href="/campaigns" className="text-xs text-blue-500 hover:underline font-medium flex items-center gap-1">View all <ArrowRight size={11} /></Link>
            </div>
            <div className="grid grid-cols-4 divide-x divide-gray-50">
              {campaigns.slice(0, 4).map(c => {
                const statusColor: Record<string, string> = { Active: "text-green-600 bg-green-50", Draft: "text-gray-500 bg-gray-50", Paused: "text-yellow-600 bg-yellow-50", Completed: "text-blue-600 bg-blue-50" };
                return (
                  <div key={c.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[c.status] || "text-gray-500 bg-gray-50"}`}>{c.status}</span>
                    </div>
                    <div className="font-medium text-sm text-gray-800 truncate mb-1">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.platform}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-violet-600 font-semibold">{c.leads || 0} leads</span>
                      <span className="text-xs text-gray-500">₹{c.budget.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSave={handleCreateProject} />}
    </div>
  );
}

export default function Home() {
  return <DashboardWrapper><HomeContent /></DashboardWrapper>;
}

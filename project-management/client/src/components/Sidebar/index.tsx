"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, LayoutDashboard, BarChart2, Clock, Calendar,
  Radio, Megaphone, Users, Shield, Settings,
  ChevronDown, ChevronRight, Plus, X, FolderOpen, Trash2
} from "lucide-react";
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from "@/state/api";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Timeline", href: "/timeline", icon: Clock },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Campaigns", href: "/campaigns", icon: Radio },
  { label: "Marketing Hub", href: "/marketing", icon: Megaphone },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Users", href: "/users", icon: Users },
  { label: "Teams", href: "/teams", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: projects = [] } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "" });

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const result = await createProject({
      name: form.name,
      description: form.description || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    });
    setForm({ name: "", description: "", startDate: "", endDate: "" });
    setShowModal(false);
    if ("data" in result && result.data) {
      router.push(`/projects/${result.data.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this project and all its tasks?")) return;
    await deleteProject(projectId);
    if (pathname === `/projects/${projectId}`) router.push("/");
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-30 overflow-hidden">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 leading-tight text-sm">ManageX</p>
                <p className="text-xs text-gray-400">Management Dashboard</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav - scrollable */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition cursor-pointer
                    ${active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}>
                    <item.icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Projects Section */}
          <div className="mt-5">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <button
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
              >
                {projectsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                Projects
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
                title="New project"
              >
                <Plus size={13} />
              </button>
            </div>

            {projectsOpen && (
              <div className="space-y-0.5">
                {projects.map((project) => {
                  const active = pathname === `/projects/${project.id}`;
                  return (
                    <div key={project.id} className="relative group">
                      <Link href={`/projects/${project.id}`}>
                        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition cursor-pointer pr-8
                          ${active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                          <FolderOpen size={14} className={`shrink-0 ${active ? "text-blue-500" : "text-gray-400"}`} />
                          <span className="truncate">{project.name}</span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 transition"
                        title="Delete project"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
                {projects.length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-2 italic">No projects yet</p>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Create New Project</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm">Cancel</button>
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, BarChart2, Clock, Calendar, FileText, Share2,
  Radio, Megaphone, Users, Shield, Settings,
  ChevronDown, ChevronRight, Plus, X, FolderOpen, Trash2,
} from "lucide-react";
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from "@/state/api";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Timeline", href: "/timeline", icon: Clock },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Campaigns", href: "/campaigns", icon: Radio },
  { label: "Marketing Hub", href: "/marketing", icon: Megaphone },
  { label: "SEO", href: "/seo", icon: BarChart2 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Social Media", href: "/social", icon: Share2 },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Users", href: "/users", icon: Users },
  { label: "Teams", href: "/teams", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      onClose();
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
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 z-50
          bg-white dark:bg-gray-900
          border-r border-gray-100 dark:border-gray-800
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
          <Link href="/" onClick={onClose}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 leading-tight text-sm">ManageX</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Management Dashboard</p>
              </div>
            </div>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition cursor-pointer
                    ${active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}>
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
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300"
              >
                {projectsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                Projects
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition"
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
                      <Link href={`/projects/${project.id}`} onClick={onClose}>
                        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition cursor-pointer pr-8
                          ${active
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}>
                          <FolderOpen size={14} className={`shrink-0 ${active ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`} />
                          <span className="truncate">{project.name}</span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-400 transition"
                        title="Delete project"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
                {projects.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-600 px-3 py-2 italic">No projects yet</p>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Create New Project</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none placeholder-gray-400 dark:placeholder-gray-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
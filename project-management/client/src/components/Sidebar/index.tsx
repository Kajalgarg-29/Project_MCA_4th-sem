"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Settings, Users, Briefcase,
  ChevronDown, FolderOpen, Plus, X, Megaphone, Radio,
  LayoutDashboard, Calendar, TrendingUp, Clock,
} from "lucide-react";
import { useState } from "react";
import { useGetProjectsQuery, useCreateProjectMutation } from "@/state/api";

const navLinks = [
  { href: "/",          label: "Home",         icon: Home },
  { href: "/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics",    icon: TrendingUp },
  { href: "/timeline",  label: "Timeline",     icon: Clock },
  { href: "/calendar",  label: "Calendar",     icon: Calendar },
  { href: "/campaigns", label: "Campaigns",    icon: Radio },
  { href: "/marketing", label: "Marketing Hub",icon: Megaphone },
  { href: "/search",    label: "Search",       icon: Search },
  { href: "/users",     label: "Users",        icon: Users },
  { href: "/teams",     label: "Teams",        icon: Briefcase },
  { href: "/settings",  label: "Settings",     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [showProjects, setShowProjects] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { data: projects, refetch } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createProject({ name, description });
    setName("");
    setDescription("");
    setShowModal(false);
    refetch();
  };

  return (
    <>
      <div className="flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 shadow-md border-r border-gray-100 dark:border-gray-800">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl font-bold text-blue-600">Manage X</h1>
          <p className="text-xs text-gray-400">Management Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="pt-4">
            <div className="flex items-center justify-between px-3 py-2">
              <button onClick={() => setShowProjects(!showProjects)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Projects</span>
                <ChevronDown size={14} className={`transition-transform ${showProjects ? "rotate-180" : ""}`} />
              </button>
              <button onClick={() => setShowModal(true)}
                className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">
                <Plus size={16} />
              </button>
            </div>
            {showProjects && (
              <div className="mt-1 space-y-1">
                {projects?.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname === `/projects/${project.id}`
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                    <FolderOpen size={16} />
                    {project.name}
                  </Link>
                ))}
                {!projects?.length && (
                  <p className="px-3 py-2 text-xs text-gray-400">No projects yet</p>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Create New Project</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Project name *" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              <textarea placeholder="Description (optional)" value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 h-20 resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import DashboardWrapper from "./dashboardWrapper";
import { useGetProjectsQuery, useGetUsersQuery, useGetTasksQuery, useCreateProjectMutation } from "@/state/api";
import Link from "next/link";
import { FolderOpen, Plus, X, ArrowRight, CheckSquare, TrendingUp, Users, Clock } from "lucide-react";

export default function Home() {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createProject] = useCreateProjectMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "" });

  const handleCreate = async () => {
    if (!form.name.trim()) return alert("Project name required");
    await createProject({ name: form.name, description: form.description, startDate: form.startDate || undefined, endDate: form.endDate || undefined });
    setForm({ name: "", description: "", startDate: "", endDate: "" });
    setShowModal(false);
  };

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome to ManageX</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your digital marketing projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Projects", value: projects.length, icon: FolderOpen, color: "bg-blue-50 text-blue-600" },
            { label: "Team Members", value: users.length, icon: Users, color: "bg-purple-50 text-purple-600" },
            { label: "Active Tasks", value: "—", icon: CheckSquare, color: "bg-green-50 text-green-600" },
            { label: "This Week", value: "—", icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Your Projects</h2>
          <span className="text-sm text-gray-400">{projects.length} total</span>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No projects yet. Create your first one!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen size={20} className="text-blue-600" />
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "No date"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

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
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                autoFocus
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

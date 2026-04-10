"use client";

import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from "@/state/api";
import { Plus, Trash2, FolderOpen, Calendar, X } from "lucide-react";
import { useRouter } from "next/navigation";

const emptyForm = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
};

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects = [], isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleCreate = async () => {
    if (!form.name.trim()) return alert("Project name is required");
    await createProject({
      name: form.name,
      description: form.description || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    });
    setForm(emptyForm);
    setShowModal(false);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
  };

  return (
    <DashboardWrapper>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800?text-white">Projects</h1>
            <p className="text-sm text-gray-400 mt-1">{projects.length} total projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">No projects yet</p>
            <p className="text-gray-300 text-sm mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FolderOpen size={20} className="text-blue-500" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-800 mb-1 truncate">{project.name}</h3>
                {project.description && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                )}

                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                    <Calendar size={12} />
                    {project.startDate && (
                      <span>{new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    )}
                    {project.startDate && project.endDate && <span>→</span>}
                    {project.endDate && (
                      <span>{new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Create New Project</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Q2 Marketing Campaign"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                <textarea
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 font-medium"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

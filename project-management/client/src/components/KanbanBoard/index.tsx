"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation, useDeleteTaskMutation } from "@/state/api";
import { Plus, X, Trash2, Pencil, GripVertical, Calendar, Tag, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";

const statusColumns = [
  { id: "To Do", label: "To Do", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  { id: "In Progress", label: "In Progress", color: "bg-blue-100 text-blue-600", dot: "bg-blue-500" },
  { id: "Review", label: "Review", color: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-500" },
  { id: "Done", label: "Done", color: "bg-green-100 text-green-600", dot: "bg-green-500" },
];

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

const columnBg: Record<string, string> = {
  "To Do": "bg-gray-50 border-gray-200",
  "In Progress": "bg-blue-50 border-blue-200",
  "Review": "bg-yellow-50 border-yellow-200",
  "Done": "bg-green-50 border-green-200",
};

interface TaskForm {
  title: string;
  description: string;
  priority: string;
  status: string;
  tags: string;
  dueDate: string;
}

const emptyForm: TaskForm = {
  title: "", description: "", priority: "Medium",
  status: "To Do", tags: "", dueDate: "",
};

export default function KanbanBoard({ projectId, projectName }: { projectId: number; projectName?: string }) {
  const { data: tasks = [] } = useGetTasksQuery({ projectId });
  const [createTask] = useCreateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  // Track which columns are collapsed on mobile
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((field: keyof TaskForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const openCreate = (status?: string) => {
    setForm({ ...emptyForm, status: status || "To Do" });
    setEditingTask(null);
    setShowModal(true);
  };

  const openEdit = (task: any) => {
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      tags: task.tags || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Title is required");
    if (editingTask) {
      await updateTaskStatus({ taskId: editingTask.id, status: form.status });
    } else {
      await createTask({
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        tags: form.tags || undefined,
        dueDate: form.dueDate || undefined,
        projectId,
      });
    }
    setShowModal(false);
    setEditingTask(null);
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const taskId = Number(result.draggableId);
    if (result.source.droppableId !== newStatus) {
      await updateTaskStatus({ taskId, status: newStatus });
    }
  };

  const getTasksByStatus = (status: string) =>
    tasks.filter((t: any) => t.status === status);

  const isOverdue = (dueDate: string) => dueDate && new Date(dueDate) < new Date();

  const toggleCol = (colId: string) =>
    setCollapsedCols(prev => ({ ...prev, [colId]: !prev[colId] }));

  return (
    <div className="p-3 sm:p-5 h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 sm:mb-5 gap-2">
        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm sm:text-xl font-semibold truncate max-w-[60vw]">
          <FolderOpen size={15} className="shrink-0" />
          <span className="truncate">{projectName || "Project Board"}</span>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/*
          Mobile: vertical stack of collapsible column accordions
          Desktop (lg+): 4-column grid
        */}
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-4 lg:gap-4">
          {statusColumns.map(col => {
            const colTasks = getTasksByStatus(col.id);
            const isCollapsed = collapsedCols[col.id] ?? false;

            return (
              <div
                key={col.id}
                className={`rounded-2xl border-2 ${columnBg[col.id]} flex flex-col`}
                style={{ minHeight: isCollapsed ? undefined : "120px" }}
              >
                {/* Column header */}
                <div className="p-3 pb-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.color}`}>
                        {col.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-white text-gray-500 font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {colTasks.length}
                      </span>
                      <button
                        onClick={() => openCreate(col.id)}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white text-gray-400 hover:text-blue-500 transition"
                      >
                        <Plus size={13} />
                      </button>
                      {/* Collapse toggle — mobile only */}
                      <button
                        onClick={() => toggleCol(col.id)}
                        className="lg:hidden w-5 h-5 flex items-center justify-center rounded-full hover:bg-white text-gray-400 transition"
                      >
                        {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Droppable area — hidden when collapsed on mobile */}
                {!isCollapsed && (
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 px-3 pb-3 space-y-2 transition-colors ${snapshot.isDraggingOver ? "bg-white/50 rounded-xl" : ""}`}
                      >
                        {colTasks.map((task: any, index: number) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 group
                                  ${snapshot.isDragging ? "shadow-lg rotate-1 border-blue-200" : "hover:shadow-md"} transition-all`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-0.5 text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
                                  >
                                    <GripVertical size={14} />
                                  </div>
                                  <p className="text-sm font-semibold text-gray-800 flex-1 leading-tight">{task.title}</p>
                                  {/* Action buttons: always visible on mobile, hover on desktop */}
                                  <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition shrink-0">
                                    <button onClick={() => openEdit(task)} className="p-1 hover:bg-blue-50 rounded-lg text-gray-400?text-white hover:text-blue-500 transition">
                                      <Pencil size={13} />
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2 ml-4">{task.description}</p>
                                )}

                                <div className="flex flex-wrap gap-1.5 items-center ml-4">
                                  {task.priority && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium border ${priorityColors[task.priority] || "bg-gray-100 text-gray-600"}`}>
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-md ${isOverdue(task.dueDate) ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"}`}>
                                      <Calendar size={10} />
                                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                  )}
                                </div>
                                {task.tags && (
                                  <div className="flex flex-wrap gap-1 mt-1.5 ml-4">
                                    {task.tags.split(",").map((tag: string) => (
                                      <span key={tag} className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md">
                                        <Tag size={9} />
                                        {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <button
                            onClick={() => openCreate(col.id)}
                            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-300 hover:border-blue-300 hover:text-blue-400 transition flex flex-col items-center gap-1"
                          >
                            <Plus size={16} />
                            Add task
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          {/* Bottom sheet on mobile, centered modal on sm+ */}
          <div className="bg-black w-full sm:rounded-2xl sm:max-w-md rounded-t-2xl shadow-xl max-h-[92dvh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800?text-white">{editingTask ? "Edit Task" : "Create New Task"}</h2>
                {projectName && (
                  <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                    <FolderOpen size={11} />{projectName}
                  </p>
                )}
              </div>
              <button onClick={() => { setShowModal(false); setEditingTask(null); }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Task Title *</label>
                <input type="text" placeholder="What needs to be done?" value={form.title}
                  onChange={e => handleChange("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" autoFocus />
                           
                    </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
                <textarea placeholder="Add more details..." value={form.description}
                  onChange={e => handleChange("description", e.target.value)}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => handleChange("status", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                    {statusColumns.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => handleChange("priority", e.target.value)}
                               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400">

                    {["Urgent", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => handleChange("dueDate", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />

                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tags</label>
                  <input type="text" placeholder="design, dev, ..." value={form.tags}
                    onChange={e => handleChange("tags", e.target.value)}
                               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />

                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 sm:p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => { setShowModal(false); setEditingTask(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 font-medium">
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
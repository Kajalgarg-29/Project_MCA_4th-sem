"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation, useDeleteTaskMutation } from "@/state/api";
import { Plus, X, Trash2, Pencil } from "lucide-react";

const statusColumns = ["To Do", "In Progress", "Review", "Done"];

const columnColors: Record<string, string> = {
  "To Do": "border-gray-300 bg-gray-50",
  "In Progress": "border-blue-300 bg-blue-50",
  "Review": "border-yellow-300 bg-yellow-50",
  "Done": "border-green-300 bg-green-50",
};

const headerColors: Record<string, string> = {
  "To Do": "text-gray-700",
  "In Progress": "text-blue-700",
  "Review": "text-yellow-700",
  "Done": "text-green-700",
};

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

interface TaskForm {
  title: string;
  description: string;
  priority: string;
  status: string;
  tags: string;
  dueDate: string;
}

export default function KanbanBoard({ projectId }: { projectId: number }) {
  const { data: tasks = [] } = useGetTasksQuery({ projectId });
  const [createTask] = useCreateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    tags: "",
    dueDate: "",
  });

  const handleChange = useCallback((field: keyof TaskForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Title is required");
    await createTask({
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      status: form.status,
      tags: form.tags || undefined,
      dueDate: form.dueDate || undefined,
      projectId,
    });
    setForm({ title: "", description: "", priority: "Medium", status: "To Do", tags: "", dueDate: "" });
    setShowModal(false);
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const taskId = Number(result.draggableId);
    await updateTaskStatus({ taskId, status: newStatus });
  };

  const getTasksByStatus = (status: string) =>
    tasks.filter((t: any) => t.status === status);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {statusColumns.map(status => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl border-2 p-3 min-h-[500px] ${columnColors[status]}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-semibold ${headerColors[status]}`}>{status}</h3>
                    <span className="text-xs bg-white rounded-full px-2 py-0.5 font-medium shadow-sm">
                      {getTasksByStatus(status).length}
                    </span>
                  </div>

                  {getTasksByStatus(status).map((task: any, index: number) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-100 group"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm text-gray-800 mb-1 flex-1">{task.title}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 items-center">
                            {task.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || "bg-gray-100 text-gray-600"}`}>
                                {task.priority}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-gray-400">
                                📅 {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {task.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.split(",").map((tag: string) => (
                                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
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
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title *"
                value={form.title}
                onChange={e => handleChange("title", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                autoFocus
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
              />
              <select
                value={form.priority}
                onChange={e => handleChange("priority", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                <option>Urgent</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select
                value={form.status}
                onChange={e => handleChange("status", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                {statusColumns.map(s => <option key={s}>{s}</option>)}
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={e => handleChange("tags", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
              <input
                type="date"
                value={form.dueDate}
                onChange={e => handleChange("dueDate", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

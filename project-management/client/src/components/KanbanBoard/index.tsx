"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation, useDeleteTaskMutation, useUpdateTaskMutation, Task } from "@/state/api";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

const COLUMNS = ["To Do", "In Progress", "Review", "Done"];
const COLUMN_COLORS: Record<string, string> = {
  "To Do": "bg-gray-100 border-gray-300",
  "In Progress": "bg-blue-50 border-blue-300",
  "Review": "bg-yellow-50 border-yellow-300",
  "Done": "bg-green-50 border-green-300",
};
const COLUMN_HEADER_COLORS: Record<string, string> = {
  "To Do": "bg-gray-200 text-gray-700",
  "In Progress": "bg-blue-200 text-blue-700",
  "Review": "bg-yellow-200 text-yellow-700",
  "Done": "bg-green-200 text-green-700",
};
const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "bg-red-100 text-red-600",
  High: "bg-orange-100 text-orange-600",
  Medium: "bg-yellow-100 text-yellow-600",
  Low: "bg-green-100 text-green-600",
};
const emptyForm = { title: "", description: "", priority: "Medium", status: "To Do", tags: "", dueDate: "" };

interface Props { projectId: number; }

export default function KanbanBoard({ projectId }: Props) {
  const { data: tasks = [], refetch } = useGetTasksQuery({ projectId });
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    await updateTaskStatus({ taskId: Number(result.draggableId), status: result.destination.droppableId });
    refetch();
  };

  const handleCreateTask = async () => {
    if (!form.title) return;
    await createTask({ ...form, projectId });
    setForm(emptyForm); setShowModal(false); refetch();
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      tags: task.tags || "",
      dueDate: task.dueDate ? task.dueDate.toString().split("T")[0] : "",
    });
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !form.title) return;
    await updateTask({ taskId: editingTask.id, data: form });
    setEditingTask(null); setForm(emptyForm); refetch();
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    setShowDeleteConfirm(null); refetch();
  };

  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  const FormFields = () => (
    <div className="space-y-3">
      <input type="text" placeholder="Task title *" value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
      <textarea placeholder="Description" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 h-20 resize-none" />
      <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
        <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
      </select>
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
        {COLUMNS.map((col) => <option key={col}>{col}</option>)}
      </select>
      <input type="text" placeholder="Tags (comma separated)" value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
      <input type="date" value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
    </div>
  );

  const Modal = ({ title, onSubmit, submitLabel, onClose }: any) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <FormFields />
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={onSubmit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">{submitLabel}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} /> Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className={`rounded-xl border-2 ${COLUMN_COLORS[col]} p-3 min-h-[500px]`}>
              <div className={`flex items-center justify-between rounded-lg px-3 py-2 mb-3 ${COLUMN_HEADER_COLORS[col]}`}>
                <span className="font-semibold text-sm">{col}</span>
                <span className="text-xs font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center">
                  {getTasksByStatus(col).length}
                </span>
              </div>
              <Droppable droppableId={col}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[400px]">
                    {getTasksByStatus(col).map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className={`bg-white rounded-lg shadow p-3 border border-gray-100 cursor-grab ${snapshot.isDragging ? "shadow-lg rotate-1 scale-105" : ""} transition-all`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm text-gray-800">{task.title}</p>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => handleEditClick(task)}
                                  className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => setShowDeleteConfirm(task.id)}
                                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            {task.description && <p className="text-xs text-gray-400 mt-1 mb-2 line-clamp-2">{task.description}</p>}
                            <div className="flex items-center justify-between mt-2">
                              {task.priority && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] || "bg-gray-100 text-gray-500"}`}>
                                  {task.priority}
                                </span>
                              )}
                              {task.dueDate && <span className="text-xs text-gray-400">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>
                            {task.tags && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {task.tags.split(",").map((tag) => (
                                  <span key={tag} className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">{tag.trim()}</span>
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
            </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && <Modal title="Create New Task" onSubmit={handleCreateTask} submitLabel="Create Task" onClose={() => { setShowModal(false); setForm(emptyForm); }} />}
      {editingTask && <Modal title="Edit Task" onSubmit={handleUpdateTask} submitLabel="Save Changes" onClose={() => { setEditingTask(null); setForm(emptyForm); }} />}

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={36} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Delete Task?</h2>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteTask(showDeleteConfirm)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

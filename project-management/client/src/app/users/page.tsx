"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from "@/state/api";
import { Users, Mail, Shield, Plus, X, Pencil, Trash2, Crown, Eye, BarChart2 } from "lucide-react";

const ROLES = ["Admin", "Manager", "Marketer", "Viewer"];
const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: any; desc: string }> = {
  Admin:    { color: "text-red-700",    bg: "bg-red-100",    icon: Crown,    desc: "Full access to all features" },
  Manager:  { color: "text-blue-700",   bg: "bg-blue-100",   icon: Shield,   desc: "Manage projects and teams" },
  Marketer: { color: "text-green-700",  bg: "bg-green-100",  icon: BarChart2, desc: "Create and manage campaigns" },
  Viewer:   { color: "text-gray-600",   bg: "bg-gray-100",   icon: Eye,      desc: "Read-only access" },
};
const AVATAR_BG = ["bg-blue-500", "bg-violet-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500", "bg-rose-500", "bg-teal-500"];
const emptyForm = { username: "", email: "", role: "Viewer" };

function UserModal({ user, onClose, onSave }: any) {
  const [form, setForm] = useState(user ? { username: user.username, email: user.email, role: user.role || "Viewer" } : emptyForm);
  const isEdit = !!user;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">{isEdit ? "Edit User" : "Add New User"}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Username *</label>
            <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. john_doe"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. john@company.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(role => {
                const cfg = ROLE_CONFIG[role];
                const Icon = cfg.icon;
                return (
                  <button key={role} onClick={() => setForm({ ...form, role })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition text-left ${form.role === role ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700">{role}</div>
                      <div className="text-xs text-gray-400 leading-tight">{cfg.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (form.username && form.email) { onSave(form); onClose(); } }}
            disabled={!form.username || !form.email}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {isEdit ? "Save Changes" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersContent() {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState("All");

  const filtered = filterRole === "All" ? users : users.filter(u => (u.role || "Viewer") === filterRole);
  const roleCounts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => (u.role || "Viewer") === r).length }), {} as Record<string, number>);

  return (
    <div className="space-y-0 -m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">User Management</h1>
            <p className="text-xs text-gray-400">{users.filter(u => u.username).length} users · Role-based access control</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Role Stats */}
        <div className="grid grid-cols-4 gap-4">
          {ROLES.map(role => {
            const cfg = ROLE_CONFIG[role];
            const Icon = cfg.icon;
            return (
              <div key={role} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{role}s</span>
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                    <Icon size={14} className={cfg.color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800">{roleCounts[role] || 0}</div>
                <div className="text-xs text-gray-400 mt-1">{cfg.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Filter + Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">All Users</h3>
            <div className="flex gap-1">
              {["All", ...ROLES].map(r => (
                <button key={r} onClick={() => setFilterRole(r)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterRole === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{r}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading users...</div>
          ) : filtered.filter(u => u.username).length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{["User", "Email", "Role", "Permissions", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.filter(u => u.username).map((user, i) => {
                  const role = user.role || "Viewer";
                  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG["Viewer"];
                  const Icon = cfg.icon;
                  const initials = user.username?.slice(0, 2).toUpperCase() || "U";
                  const bg = AVATAR_BG[i % AVATAR_BG.length];
                  return (
                    <tr key={user.userId} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{initials}</div>
                          <div>
                            <div className="font-medium text-sm text-gray-800">{user.username}</div>
                            <div className="text-xs text-gray-400">ID #{user.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail size={13} className="text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                          <Icon size={11} />{role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{cfg.desc}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => setEditUser(user)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteConfirm(user.userId)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <UserModal onClose={() => setShowModal(false)} onSave={(data: any) => createUser(data)} />}
      {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} onSave={(data: any) => updateUser({ userId: editUser.userId, data })} />}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={36} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Delete User?</h2>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => { deleteUser(deleteConfirm!); setDeleteConfirm(null); }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return <DashboardWrapper><UsersContent /></DashboardWrapper>;
}

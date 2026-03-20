"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from "@/state/api";
import { Users, Pencil, Trash2, X, Search, Plus, Mail, Shield } from "lucide-react";

export default function UsersPage() {
  const { data: users = [] } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [addForm, setAddForm] = useState({ username: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [showPassword, setShowPassword] = useState(false);

  const filtered = users.filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    setError("");
    if (!addForm.username.trim()) return setError("Username is required");
    if (!addForm.email.trim()) return setError("Email is required");
    if (!addForm.password.trim()) return setError("Password is required");
    if (addForm.password.length < 6) return setError("Password must be at least 6 characters");
    try {
      const result = await createUser(addForm);
      if ("error" in result) {
        const err = result.error as any;
        setError(err?.data?.message || "Failed to create user");
        return;
      }
      setShowAddModal(false);
      setAddForm({ username: "", email: "", password: "" });
      setError("");
    } catch {
      setError("Something went wrong");
    }
  };

  const handleEdit = async () => {
    setError("");
    if (!selectedUser || !editForm.username.trim()) return setError("Username is required");
    try {
      await updateUser({ userId: selectedUser.userId, data: editForm });
      setShowEditModal(false);
      setSelectedUser(null);
      setError("");
    } catch {
      setError("Something went wrong");
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`Delete user "${username}" permanently? This cannot be undone.`)) return;
    await deleteUser(userId);
  };

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-400 text-sm mt-0.5">{users.length} registered members</p>
          </div>
          <button
            onClick={() => { setAddForm({ username: "", email: "", password: "" }); setError(""); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Users", value: users.length, color: "text-blue-600 bg-blue-50" },
            { label: "In a Team", value: users.filter((u: any) => u.teamId).length, color: "text-green-600 bg-green-50" },
            { label: "Unassigned", value: users.filter((u: any) => !u.teamId).length, color: "text-orange-600 bg-orange-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700"
            />
            <span className="text-xs text-gray-400">{filtered.length} results</span>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Team</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user: any) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.username}</p>
                        <p className="text-xs text-gray-400">ID #{user.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Mail size={13} className="text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.team?.teamName ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Shield size={13} className="text-purple-400" />
                        {user.team.teamName}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">No team</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.teamId ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {user.teamId ? "● Active" : "○ Unassigned"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedUser(user); setEditForm({ username: user.username, email: user.email }); setError(""); setShowEditModal(true); }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition"
                        title="Edit user"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId, user.username)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition"
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No users found</p>
              <p className="text-xs mt-1">Try a different search or add a new user</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
                <p className="text-xs text-gray-400 mt-0.5">Create a new team member account</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setError(""); }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Username *</label>
                <input
                  type="text"
                  placeholder="e.g. johndoe"
                  value={addForm.username}
                  onChange={e => setAddForm(f => ({ ...f, username: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email Address *</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={addForm.password}
                    onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">User can change their password after logging in</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 font-medium">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
                <p className="text-xs text-gray-400 mt-0.5">Update user information</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setError(""); }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Username *</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEditModal(false); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEdit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

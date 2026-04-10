"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/api";
import {
  Users,
  Pencil,
  Trash2,
  X,
  Search,
  Plus,
  Mail,
  Shield,
  Crown,
  UserCheck,
  ChevronDown,
} from "lucide-react";

const ROLES = ["Admin", "Manager", "Member"];
const ROLE_STYLES: Record<string, string> = {
  Admin:   "bg-red-100 text-red-600",
  Manager: "bg-purple-100 text-purple-600",
  Member:  "bg-gray-100 text-gray-500",
};
const ROLE_ICONS: Record<string, any> = {
  Admin:   Crown,
  Manager: Shield,
  Member:  UserCheck,
};

export default function UsersPage() {
  const { data: users = [] } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch]               = useState("");
  const [filterRole, setFilterRole]       = useState("All");
  const [filterOpen, setFilterOpen]       = useState(false);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser]   = useState<any>(null);
  const [error, setError]                 = useState("");
  const [addForm, setAddForm]             = useState({ username: "", email: "", password: "", role: "Member" });
  const [editForm, setEditForm]           = useState({ username: "", email: "", role: "Member" });
  const [showPassword, setShowPassword]   = useState(false);

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const userRole    = currentUser?.role?.toLowerCase();
  const isAdmin     = userRole === "admin";
  const isManager   = userRole === "manager";
  const canEdit     = isAdmin || isManager;
  const availableRoles = isAdmin ? ROLES : ["Manager", "Member"];

  const filtered = users.filter((u: any) => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === "All" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleAdd = async () => {
    setError("");
    if (!addForm.username.trim()) return setError("Username is required");
    if (!addForm.email.trim())    return setError("Email is required");
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
      setAddForm({ username: "", email: "", password: "", role: "Member" });
    } catch { setError("Something went wrong"); }
  };

  const handleEdit = async () => {
    setError("");
    if (!selectedUser || !editForm.username.trim()) return setError("Username is required");
    await updateUser({ userId: selectedUser.userId, data: editForm });
    if (editForm.role !== selectedUser.role) {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/role/${selectedUser.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ role: editForm.role }),
      });
    }
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`Delete user "${username}" permanently?`)) return;
    await deleteUser(userId);
  };

  return (
    <DashboardWrapper>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{users.length} registered members</p>
          </div>
          {canEdit && (
            <button
              onClick={() => { setAddForm({ username: "", email: "", password: "", role: "Member" }); setError(""); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium transition self-start xs:self-auto"
            >
              <Plus size={15} /> Add User
            </button>
          )}
        </div>

        {/* Stats — 2×2 on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {[
            { label: "Total Users", value: users.length,                                                      color: "text-blue-600" },
            { label: "Admins",      value: users.filter((u: any) => u.role === "Admin").length,               color: "text-red-600" },
            { label: "Managers",    value: users.filter((u: any) => u.role === "Manager").length,             color: "text-purple-600" },
            { label: "Members",     value: users.filter((u: any) => u.role === "Member" || !u.role).length,   color: "text-gray-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Search + Filter bar */}
          <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Role filter — scrollable pills on mobile */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
              {["All", ...ROLES].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition
                    ${filterRole === r ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop table — hidden on mobile */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Team</th>
                  <th className="text-left p-4">Status</th>
                  {canEdit && <th className="text-right p-4">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user: any) => {
                  const RoleIcon = ROLE_ICONS[user.role] || UserCheck;
                  return (
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
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLES[user.role] || ROLE_STYLES.Member}`}>
                          <RoleIcon size={11} />{user.role || "Member"}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.team?.teamName
                          ? <div className="flex items-center gap-1.5 text-sm text-gray-700"><Shield size={13} className="text-purple-400" />{user.team.teamName}</div>
                          : <span className="text-sm text-gray-300">No team</span>}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.teamId ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                          {user.teamId ? "● Active" : "○ Unassigned"}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelectedUser(user); setEditForm({ username: user.username, email: user.email, role: user.role || "Member" }); setError(""); setShowEditModal(true); }}
                              className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition"
                            ><Pencil size={15} /></button>
                            <button
                              onClick={() => handleDelete(user.userId, user.username)}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition"
                            ><Trash2 size={15} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — shown only on mobile */}
          <div className="sm:hidden divide-y divide-gray-50">
            {filtered.map((user: any) => {
              const RoleIcon = ROLE_ICONS[user.role] || UserCheck;
              return (
                <div key={user.userId} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { setSelectedUser(user); setEditForm({ username: user.username, email: user.email, role: user.role || "Member" }); setError(""); setShowEditModal(true); }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition"
                        ><Pencil size={14} /></button>
                        <button
                          onClick={() => handleDelete(user.userId, user.username)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition"
                        ><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLES[user.role] || ROLE_STYLES.Member}`}>
                      <RoleIcon size={10} />{user.role || "Member"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.teamId ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {user.teamId ? "● Active" : "○ Unassigned"}
                    </span>
                    {user.team?.teamName && (
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        <Shield size={10} className="text-purple-400" />{user.team.teamName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 text-gray-400">
              <Users size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
              <button onClick={() => { setShowAddModal(false); setError(""); }}><X size={20} className="text-gray-400" /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Username *</label>
                <input type="text" placeholder="johndoe" value={addForm.username}
                  onChange={e => setAddForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email *</label>
                <input type="email" placeholder="john@company.com" value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={addForm.password}
                    onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Role
                  {isManager && <span className="ml-2 text-xs text-gray-400 font-normal">(Admin role restricted)</span>}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableRoles.map(r => (
                    <button key={r} onClick={() => setAddForm(f => ({ ...f, role: r }))}
                      className={`py-2 rounded-xl text-xs font-medium border transition ${addForm.role === r ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 font-medium">Create User</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {showEditModal && selectedUser && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
              <button onClick={() => { setShowEditModal(false); setError(""); }}><X size={20} className="text-gray-400" /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Username</label>
                <input type="text" value={editForm.username}
                  onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email</label>
                <input type="email" value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Role
                  {isManager && <span className="ml-2 text-xs text-gray-400 font-normal">(Admin role restricted)</span>}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableRoles.map(r => (
                    <button key={r} onClick={() => setEditForm(f => ({ ...f, role: r }))}
                      className={`py-2 rounded-xl text-xs font-medium border transition ${editForm.role === r ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEditModal(false); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleEdit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 font-medium">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}
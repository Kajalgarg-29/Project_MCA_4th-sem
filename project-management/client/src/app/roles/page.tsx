"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetUsersQuery } from "@/state/api";
import { useRole } from "@/context/RoleContext";
import RoleBadge from "@/components/RoleBadge";
import { Crown, Shield, User, Save, AlertCircle, CheckCircle } from "lucide-react";

const ROLES = ["Admin", "Manager", "Member"];

const ROLE_DESCRIPTIONS = {
  Admin: {
    icon: Crown,
    color: "text-red-600 bg-red-50 border-red-200",
    permissions: [
      "Full system access",
      "Manage users & change roles",
      "Delete any project/task",
      "View all reports & exports",
      "Manage team settings",
      "Access all attendance records",
    ],
  },
  Manager: {
    icon: Shield,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    permissions: [
      "Manage projects & tasks",
      "View all team attendance",
      "Manage campaigns",
      "View analytics & reports",
      "Manage calendar events",
      "Cannot manage users/roles",
    ],
  },
  Member: {
    icon: User,
    color: "text-gray-600 bg-gray-50 border-gray-200",
    permissions: [
      "View assigned projects",
      "Manage own tasks",
      "Own attendance only",
      "View campaigns (read-only)",
      "Manage own calendar events",
      "Cannot delete projects",
    ],
  },
};

export default function RolesPage() {
  const { isAdmin, role: currentRole } = useRole();
  const { data: users = [], refetch } = useGetUsersQuery();
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  if (!isAdmin) {
    return (
      <DashboardWrapper>
        <div className="p-6 max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-400">Only Admins can manage user roles.</p>
          <p className="text-gray-300 text-sm mt-1">Your current role: <strong>{currentRole}</strong></p>
        </div>
      </DashboardWrapper>
    );
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    setSaving(userId);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/role/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      await refetch();
      setSaved(userId);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      alert("Failed to update role");
    } finally {
      setSaving(null);
    }
  };

  const filtered = users.filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">Assign and manage user roles and permissions</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(ROLE_DESCRIPTIONS).map(([roleName, config]) => {
            const Icon = config.icon;
            const count = users.filter((u: any) => u.role === roleName).length;
            return (
              <div key={roleName} className={`rounded-2xl border p-5 ${config.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Icon size={20} className={config.color.split(" ")[0]} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{roleName}</h3>
                    <p className="text-xs text-gray-500">{count} user{count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {config.permissions.map(p => (
                    <li key={p} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className={p.startsWith("Cannot") ? "text-red-400 mt-0.5" : "text-green-500 mt-0.5"}>
                        {p.startsWith("Cannot") ? "✕" : "✓"}
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* User Role Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
            />
            <span className="text-xs text-gray-400">{filtered.length} users</span>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Current Role</th>
                <th className="text-left p-4">Team</th>
                <th className="text-left p-4">Change Role</th>
                <th className="text-right p-4">Status</th>
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
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <RoleBadge role={user.role || "Member"} />
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600">{user.team?.teamName || <span className="text-gray-300">No team</span>}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {ROLES.map(r => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(user.userId, r)}
                          disabled={user.role === r || saving === user.userId}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                            ${user.role === r
                              ? "border-blue-500 bg-blue-50 text-blue-600 cursor-default"
                              : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            } ${saving === user.userId ? "opacity-50 cursor-wait" : ""}`}
                        >
                          {saving === user.userId ? "..." : r}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {saved === user.userId ? (
                      <span className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={13} /> Saved!
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardWrapper>
  );
}

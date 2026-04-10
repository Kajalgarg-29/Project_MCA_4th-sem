"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetTeamsQuery,
  useGetUsersQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddUserToTeamMutation,
  useRemoveUserFromTeamMutation,
} from "@/state/api";
import { Users, Plus, X, Pencil, Trash2, UserPlus, UserMinus, Shield, Eye } from "lucide-react";

export default function TeamsPage() {
  const { data: teams = [] } = useGetTeamsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [addUserToTeam] = useAddUserToTeamMutation();
  const [removeUserFromTeam] = useRemoveUserFromTeamMutation();

  // ✅ Read current user and derive permissions
  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const userRole = currentUser?.role?.toLowerCase();
  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";
  const canEdit = isAdmin || isManager; // ✅ Admin + Manager can create/edit/delete/add/remove

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamName, setTeamName] = useState("");

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    await createTeam({ teamName });
    setTeamName("");
    setShowCreateModal(false);
  };

  const handleEdit = async () => {
    if (!teamName.trim() || !selectedTeam) return;
    await updateTeam({ teamId: selectedTeam.id, teamName });
    setTeamName("");
    setShowEditModal(false);
    setSelectedTeam(null);
  };

  const handleDelete = async (teamId: number) => {
    if (!confirm("Delete this team? Members will be unassigned.")) return;
    await deleteTeam(teamId);
  };

  const handleAddMember = async (userId: number) => {
    if (!selectedTeam) return;
    await addUserToTeam({ teamId: selectedTeam.id, userId });
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Remove this member from team?")) return;
    await removeUserFromTeam(userId);
  };

  const getTeamMembers = (teamId: number) =>
    users.filter((u: any) => u.teamId === teamId);
  const getNonMembers = (teamId: number) =>
    users.filter((u: any) => u.teamId !== teamId);

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800?text-white">Teams</h1>
            <p className="text-gray-400 text-sm mt-1">
              {teams.length} teams · {users.length} members
            </p>
          </div>

          {/* ✅ Only Admin/Manager see New Team button */}
          {canEdit ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus size={16} /> New Team
            </button>
          ) : (
            // ✅ Members see a read-only badge
            <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full font-medium">
              <Eye size={13} /> View Only
            </span>
          )}
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 gap-6">
          {teams.map((team: any) => {
            const members = getTeamMembers(team.id);
            return (
              <div
                key={team.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Shield size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{team.teamName}</h3>
                      <p className="text-xs text-gray-400">{members.length} members</p>
                    </div>
                  </div>

                  {/* ✅ Action buttons — Admin/Manager only */}
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedTeam(team); setShowAddMemberModal(true); }}
                        className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                      >
                        <UserPlus size={14} /> Add Member
                      </button>
                      <button
                        onClick={() => { setSelectedTeam(team); setTeamName(team.teamName); setShowEditModal(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(team.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Members list */}
                <div className="p-4">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      {canEdit ? "No members yet — click Add Member" : "No members yet"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {members.map((user: any) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3 group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {user.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-800">{user.username}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[80px]">{user.role}</p>
                            </div>
                          </div>

                          {/* ✅ Remove button — Admin/Manager only */}
                          {canEdit && (
                            <button
                              onClick={() => handleRemoveMember(user.userId)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 transition"
                            >
                              <UserMinus size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {teams.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No teams yet</p>
              <p className="text-sm mb-4">
                {canEdit
                  ? "Create your first team to start collaborating"
                  : "No teams have been created yet"}
              </p>
              {canEdit && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Create Team
                </button>
              )}
            </div>
          )}
        </div>

        {/* Unassigned Users */}
        {users.filter((u: any) => !u.teamId).length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Unassigned Members</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {users
                .filter((u: any) => !u.teamId)
                .map((user: any) => (
                  <div key={user.userId} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-400">No team</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Create Team Modal — Admin/Manager only */}
      {showCreateModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Create New Team</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Team name *"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Team Modal — Admin/Manager only */}
      {showEditModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Team</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Team name *"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add Member Modal — Admin/Manager only */}
      {showAddMemberModal && selectedTeam && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Add Member to {selectedTeam.teamName}
              </h2>
              <button onClick={() => setShowAddMemberModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {getNonMembers(selectedTeam.id).map((user: any) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {user.teamId && (
                        <p className="text-xs text-orange-400">Currently in another team</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.userId)}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              ))}
              {getNonMembers(selectedTeam.id).length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  All users are already in this team
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="w-full mt-4 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}
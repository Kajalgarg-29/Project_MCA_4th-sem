"use client";

import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetTeamsQuery, useGetUsersQuery, useGetProjectsQuery,
  useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation,
  useAddTeamMemberMutation, useRemoveTeamMemberMutation,
  useAssignProjectToTeamMutation, useRemoveProjectFromTeamMutation,
} from "@/state/api";
import { Briefcase, Plus, Users, FolderOpen, Crown, X, ChevronDown, ChevronUp, Trash2, Edit2, UserPlus, FolderPlus } from "lucide-react";

const BG_GRADIENTS = ["from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-green-500 to-emerald-600", "from-orange-500 to-red-500", "from-pink-500 to-rose-600", "from-cyan-500 to-blue-500"];
const AVATAR_COLORS = ["bg-blue-500", "bg-violet-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500", "bg-rose-500", "bg-teal-500"];

function Avatar({ name, index, size = "md" }: { name: string; index: number; size?: "sm" | "md" }) {
  const initials = name?.slice(0, 2).toUpperCase() || "?";
  const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials}</div>;
}

function TeamModal({ team, users, onClose, onCreate, onUpdate }: any) {
  const [name, setName] = useState(team?.teamName || "");
  const [ownerId, setOwnerId] = useState(team?.productOwnerUserId || "");
  const [managerId, setManagerId] = useState(team?.projectManagerUserId || "");
  const isEdit = !!team;

  const handleSubmit = () => {
    if (!name.trim()) return;
    const data = { teamName: name, productOwnerUserId: ownerId || undefined, projectManagerUserId: managerId || undefined };
    if (isEdit) onUpdate({ teamId: team.id, ...data });
    else onCreate(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">{isEdit ? "Edit Team" : "Create Team"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Team Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing Team"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Product Owner</label>
            <select value={ownerId} onChange={e => setOwnerId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select user</option>
              {users.map((u: any) => <option key={u.userId} value={u.userId}>{u.username}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Project Manager</label>
            <select value={managerId} onChange={e => setManagerId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select user</option>
              {users.map((u: any) => <option key={u.userId} value={u.userId}>{u.username}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{isEdit ? "Save Changes" : "Create Team"}</button>
        </div>
      </div>
    </div>
  );
}

function AddMemberModal({ team, users, onClose, onAdd }: any) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const memberIds = new Set(team.users?.map((u: any) => u.userId));
  const available = users.filter((u: any) => !memberIds.has(u.userId));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">Add Member to {team.teamName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          {available.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">All users are already in this team</p>
          ) : (
            <div className="space-y-2">
              {available.map((u: any, i: number) => (
                <button key={u.userId} onClick={() => setSelectedUserId(u.userId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${selectedUserId == u.userId ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"}`}>
                  <Avatar name={u.username} index={i} size="sm" />
                  <span className="text-sm font-medium text-gray-700">{u.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (selectedUserId) { onAdd(Number(selectedUserId)); onClose(); } }} disabled={!selectedUserId}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Add Member</button>
        </div>
      </div>
    </div>
  );
}

function AssignProjectModal({ team, projects, onClose, onAssign }: any) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const assignedIds = new Set(team.projectTeams?.map((pt: any) => pt.projectId));
  const available = projects.filter((p: any) => !assignedIds.has(p.id));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">Assign Project to {team.teamName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          {available.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">All projects are already assigned</p>
          ) : (
            <div className="space-y-2">
              {available.map((p: any) => (
                <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${selectedProjectId == p.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"}`}>
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (selectedProjectId) { onAssign(Number(selectedProjectId)); onClose(); } }} disabled={!selectedProjectId}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Assign Project</button>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, users, projects, index, onEdit, onDelete, onAddMember, onRemoveMember, onAssignProject, onRemoveProject }: any) {
  const [expanded, setExpanded] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAssignProject, setShowAssignProject] = useState(false);

  const getUser = (id?: number) => users.find((u: any) => u.userId === id);
  const owner = getUser(team.productOwnerUserId);
  const manager = getUser(team.projectManagerUserId);
  const members: any[] = team.users || [];
  const assignedProjects: any[] = team.projectTeams || [];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Color bar */}
        <div className={`h-1.5 bg-gradient-to-r ${BG_GRADIENTS[index % BG_GRADIENTS.length]}`} />

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${BG_GRADIENTS[index % BG_GRADIENTS.length]} flex items-center justify-center flex-shrink-0`}>
            <Briefcase size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm">{team.teamName}</h3>
            <p className="text-xs text-gray-400">{members.length} member{members.length !== 1 ? "s" : ""} · {assignedProjects.length} project{assignedProjects.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onEdit(team)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Edit2 size={14} className="text-gray-400" /></button>
            <button onClick={() => onDelete(team.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} className="text-red-400" /></button>
            <button onClick={() => setExpanded(e => !e)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-50">
            {/* Roles */}
            {(owner || manager) && (
              <div className="px-5 py-3 flex gap-4 border-b border-gray-50">
                {owner && (
                  <div className="flex items-center gap-2">
                    <Crown size={13} className="text-yellow-500" />
                    <span className="text-xs text-gray-400">Owner:</span>
                    <span className="text-xs font-semibold text-gray-700">{owner.username}</span>
                  </div>
                )}
                {manager && (
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-blue-500" />
                    <span className="text-xs text-gray-400">Manager:</span>
                    <span className="text-xs font-semibold text-gray-700">{manager.username}</span>
                  </div>
                )}
              </div>
            )}

            {/* Members */}
            <div className="px-5 py-4 border-b border-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</span>
                </div>
                <button onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  <UserPlus size={12} /> Add
                </button>
              </div>
              {members.length === 0 ? (
                <p className="text-xs text-gray-300 italic">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member: any, mi: number) => (
                    <div key={member.userId} className="flex items-center gap-2.5 group">
                      <Avatar name={member.username} index={mi} size="sm" />
                      <span className="text-xs font-medium text-gray-700 flex-1">{member.username}</span>
                      {member.userId === team.productOwnerUserId && <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Owner</span>}
                      {member.userId === team.projectManagerUserId && <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Manager</span>}
                      <button onClick={() => onRemoveMember(team.id, member.userId)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded-md">
                        <X size={11} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <FolderOpen size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</span>
                </div>
                <button onClick={() => setShowAssignProject(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  <FolderPlus size={12} /> Assign
                </button>
              </div>
              {assignedProjects.length === 0 ? (
                <p className="text-xs text-gray-300 italic">No projects assigned</p>
              ) : (
                <div className="space-y-1.5">
                  {assignedProjects.map((pt: any) => (
                    <div key={pt.id} className="flex items-center gap-2 group">
                      <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FolderOpen size={11} className="text-blue-500" />
                      </div>
                      <span className="text-xs text-gray-700 flex-1 font-medium">{pt.project?.name}</span>
                      <button onClick={() => onRemoveProject(team.id, pt.projectId)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded-md">
                        <X size={11} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddMember && <AddMemberModal team={team} users={users} onClose={() => setShowAddMember(false)} onAdd={(userId: number) => onAddMember(team.id, userId)} />}
      {showAssignProject && <AssignProjectModal team={team} projects={projects} onClose={() => setShowAssignProject(false)} onAssign={(projectId: number) => onAssignProject(team.id, projectId)} />}
    </>
  );
}

function TeamsContent() {
  const { data: teams = [], isLoading } = useGetTeamsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [addMember] = useAddTeamMemberMutation();
  const [removeMember] = useRemoveTeamMemberMutation();
  const [assignProject] = useAssignProjectToTeamMutation();
  const [removeProject] = useRemoveProjectFromTeamMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  return (
    <div className="space-y-0 -m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Teams</h1>
            <p className="text-xs text-gray-400">{teams.length} team{teams.length !== 1 ? "s" : ""} · {users.length} total members</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={16} /> New Team
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm p-8">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <Briefcase size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No teams yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Create a team to start organizing members and projects</p>
            <button onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus size={15} /> Create First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team, i) => (
              <TeamCard
                key={team.id} team={team} users={users} projects={projects} index={i}
                onEdit={setEditTeam}
                onDelete={(id: number) => setDeleteConfirm(id)}
                onAddMember={(teamId: number, userId: number) => addMember({ teamId, userId })}
                onRemoveMember={(teamId: number, userId: number) => removeMember({ teamId, userId })}
                onAssignProject={(teamId: number, projectId: number) => assignProject({ teamId, projectId })}
                onRemoveProject={(teamId: number, projectId: number) => removeProject({ teamId, projectId })}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <TeamModal users={users} onClose={() => setShowCreateModal(false)}
          onCreate={(data: any) => createTeam(data)} onUpdate={() => {}} />
      )}
      {editTeam && (
        <TeamModal team={editTeam} users={users} onClose={() => setEditTeam(null)}
          onCreate={() => {}} onUpdate={(data: any) => updateTeam(data)} />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={36} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Delete Team?</h2>
            <p className="text-sm text-gray-500 mb-5">Members will be unassigned. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => { deleteTeam(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return <DashboardWrapper><TeamsContent /></DashboardWrapper>;
}

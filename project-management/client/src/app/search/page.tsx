"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetProjectsQuery, useGetUsersQuery } from "@/state/api";
import { Search, FolderOpen, User } from "lucide-react";

export default function SearchPage() {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [query, setQuery] = useState("");

  const filteredProjects = projects.filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase()));
  const filteredUsers = users.filter((u: any) => u.username.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Search</h1>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm mb-6">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700"
            autoFocus
          />
        </div>
        {query && (
          <div className="space-y-4">
            {filteredProjects.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-800 mb-3">Projects ({filteredProjects.length})</h3>
                {filteredProjects.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FolderOpen size={14} className="text-blue-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredUsers.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-800 mb-3">Users ({filteredUsers.length})</h3>
                {filteredUsers.map((u: any) => (
                  <div key={u.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">{u.username?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.username}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredProjects.length === 0 && filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}

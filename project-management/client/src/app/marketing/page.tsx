"use client";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetProjectsQuery, useGetUsersQuery } from "@/state/api";
import { TrendingUp, Target, Users, BarChart2 } from "lucide-react";

export default function MarketingPage() {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  return (
    <DashboardWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Marketing Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Your marketing performance overview</p>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[{ label: "Projects", value: projects.length, icon: BarChart2, color: "bg-blue-50 text-blue-600" },
            { label: "Team Size", value: users.length, icon: Users, color: "bg-purple-50 text-purple-600" },
            { label: "ROI", value: "142%", icon: TrendingUp, color: "bg-green-50 text-green-600" },
            { label: "Goals Met", value: "8/10", icon: Target, color: "bg-orange-50 text-orange-600" }
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} mb-3`}><s.icon size={20} /></div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Active Projects</h2>
            <div className="space-y-2">
              {projects.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{p.name}</p>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }} />
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No projects yet</p>}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Team Members</h2>
            <div className="space-y-2">
              {users.slice(0, 5).map((u: any) => (
                <div key={u.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No team members yet</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

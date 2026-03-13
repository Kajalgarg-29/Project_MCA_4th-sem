"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useSearchItemsQuery } from "@/state/api";
import { Search, FolderOpen, CheckSquare, Clock } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = { Urgent: "bg-red-100 text-red-700", High: "bg-orange-100 text-orange-700", Medium: "bg-blue-100 text-blue-700", Low: "bg-green-100 text-green-700" };
const STATUS_COLORS: Record<string, string> = { "To Do": "bg-gray-100 text-gray-600", "In Progress": "bg-blue-100 text-blue-700", Review: "bg-yellow-100 text-yellow-700", Done: "bg-green-100 text-green-700" };

function SearchContent() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data, isLoading, isFetching } = useSearchItemsQuery(submitted, { skip: submitted.length < 2 });

  const tasks = data?.tasks || [];
  const projects = data?.projects || [];
  const total = tasks.length + projects.length;

  return (
    <div className="space-y-0 -m-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Search size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Search</h1>
            <p className="text-xs text-gray-400">Search across tasks and projects</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        {/* Search bar */}
        <div className="relative max-w-2xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSubmitted(query)}
            placeholder="Search tasks, projects... (press Enter)"
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          {query && (
            <button onClick={() => { setQuery(""); setSubmitted(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>

        {submitted.length >= 2 && (
          isLoading || isFetching ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm"><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Searching...</div>
          ) : (
            <>
              <p className="text-sm text-gray-500">{total} result{total !== 1 ? "s" : ""} for <span className="font-semibold text-gray-700">"{submitted}"</span></p>

              {projects.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                    <FolderOpen size={15} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">Projects ({projects.length})</span>
                  </div>
                  {projects.map((p: any) => (
                    <a key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FolderOpen size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                        {p.description && <div className="text-xs text-gray-400 mt-0.5">{p.description}</div>}
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {tasks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                    <CheckSquare size={15} className="text-violet-500" />
                    <span className="text-sm font-semibold text-gray-700">Tasks ({tasks.length})</span>
                  </div>
                  {tasks.map((t: any) => (
                    <div key={t.id} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition">
                      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckSquare size={16} className="text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{t.title}</div>
                        {t.description && <div className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</div>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {t.status && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>}
                          {t.priority && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[t.priority] || "bg-gray-100 text-gray-500"}`}>{t.priority}</span>}
                          {t.dueDate && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {total === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
                  <Search size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No results found</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different keyword</p>
                </div>
              )}
            </>
          )
        )}

        {submitted.length < 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
            <Search size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Start typing to search</p>
            <p className="text-gray-400 text-sm mt-1">Search tasks and projects by name or description</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <DashboardWrapper><SearchContent /></DashboardWrapper>;
}

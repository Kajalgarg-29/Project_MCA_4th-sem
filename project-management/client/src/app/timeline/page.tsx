"use client";

import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetTasksQuery, useGetCampaignsQuery, useGetProjectsQuery } from "@/state/api";
import { BarChart2, ChevronLeft, ChevronRight, CheckSquare, Radio } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = { Urgent: "#ef4444", High: "#f97316", Medium: "#3b82f6", Low: "#10b981" };
const CAMPAIGN_COLORS: Record<string, string> = { Active: "#10b981", Draft: "#94a3b8", Paused: "#f59e0b", Completed: "#6366f1" };
const STATUS_TEXT: Record<string, string> = { "To Do": "bg-gray-100 text-gray-600", "In Progress": "bg-blue-100 text-blue-700", "Review": "bg-yellow-100 text-yellow-700", "Done": "bg-green-100 text-green-700" };

function TimelineContent() {
  const today = new Date();
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date(today);
    d.setDate(1);
    return d;
  });
  const [view, setView] = useState<"month" | "quarter">("month");
  const [filter, setFilter] = useState<"all" | "tasks" | "campaigns">("all");

  const { data: projects = [] } = useGetProjectsQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: tasks = [] } = useGetTasksQuery({ projectId: projects[0]?.id }, { skip: !projects[0]?.id });

  // Days to show
  const daysToShow = view === "month" ? 30 : 90;
  const days: Date[] = [];
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(viewStart);
    d.setDate(viewStart.getDate() + i);
    days.push(d);
  }

  const viewEnd = days[days.length - 1];
  const totalDays = daysToShow;

  const getLeft = (date: Date) => {
    const diff = Math.floor((date.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, (diff / totalDays) * 100);
  };
  const getWidth = (start: Date, end: Date) => {
    const s = Math.max(start.getTime(), viewStart.getTime());
    const e = Math.min(end.getTime(), viewEnd.getTime());
    const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0.5, (diff / totalDays) * 100);
  };
  const isInRange = (start?: Date, end?: Date) => {
    if (!start && !end) return false;
    const s = start || end!;
    const e = end || start!;
    return s <= viewEnd && e >= viewStart;
  };

  const prev = () => { const d = new Date(viewStart); d.setDate(d.getDate() - (view === "month" ? 30 : 90)); setViewStart(d); };
  const next = () => { const d = new Date(viewStart); d.setDate(d.getDate() + (view === "month" ? 30 : 90)); setViewStart(d); };
  const goToday = () => { const d = new Date(today); d.setDate(today.getDate() - 5); setViewStart(d); };

  const todayLeft = getLeft(today);
  const showToday = todayLeft >= 0 && todayLeft <= 100;

  // Task rows
  const taskRows = tasks
    .filter(t => t.startDate || t.dueDate)
    .filter(() => filter === "all" || filter === "tasks")
    .filter(t => {
      const s = t.startDate ? new Date(t.startDate) : t.dueDate ? new Date(t.dueDate) : null;
      const e = t.dueDate ? new Date(t.dueDate) : t.startDate ? new Date(t.startDate) : null;
      return s && e && isInRange(s, e);
    });

  // Campaign rows
  const campaignRows = campaigns
    .filter(c => c.startDate || c.endDate)
    .filter(() => filter === "all" || filter === "campaigns")
    .filter(c => {
      const s = c.startDate ? new Date(c.startDate) : c.endDate ? new Date(c.endDate) : null;
      const e = c.endDate ? new Date(c.endDate) : c.startDate ? new Date(c.startDate) : null;
      return s && e && isInRange(s, e);
    });

  // Week markers
  const weekMarkers = days.filter(d => d.getDay() === 1);
  // Month markers
  const monthMarkers = days.filter((d, i) => i === 0 || d.getDate() === 1);

  const ROW_HEIGHT = 44;

  return (
    <div className="space-y-0 -m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <BarChart2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Timeline</h1>
            <p className="text-xs text-gray-400">Gantt view of tasks & campaigns</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {[["all", "All"], ["tasks", "Tasks"], ["campaigns", "Campaigns"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val as any)}
                className={`px-3 py-1.5 text-xs font-medium transition ${filter === val ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>
          {/* View */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {[["month", "30 Days"], ["quarter", "90 Days"]].map(([val, label]) => (
              <button key={val} onClick={() => setView(val as any)}
                className={`px-3 py-1.5 text-xs font-medium transition ${view === val ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Today</button>
          <button onClick={prev} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronLeft size={16} className="text-gray-500" /></button>
          <button onClick={next} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronRight size={16} className="text-gray-500" /></button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="flex items-center gap-5 px-5 py-3 border-b border-gray-100 flex-wrap">
            {[
              { color: "#ef4444", label: "Urgent" }, { color: "#f97316", label: "High" },
              { color: "#3b82f6", label: "Medium" }, { color: "#10b981", label: "Low / Active Campaign" },
              { color: "#6366f1", label: "Completed Campaign" }, { color: "#f59e0b", label: "Paused Campaign" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ background: color }} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Left labels */}
            <div className="w-52 flex-shrink-0 border-r border-gray-100">
              {/* Header spacer */}
              <div className="h-10 border-b border-gray-100 px-4 flex items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</span>
              </div>

              {/* Task labels */}
              {(filter === "all" || filter === "tasks") && taskRows.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare size={12} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Tasks</span>
                    </div>
                  </div>
                  {taskRows.map(t => (
                    <div key={t.id} className="flex items-center px-4 border-b border-gray-50 hover:bg-gray-50" style={{ height: ROW_HEIGHT }}>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate">{t.title}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {t.priority && <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${PRIORITY_COLORS[t.priority]}20`, color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>}
                          {t.status && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_TEXT[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Campaign labels */}
              {(filter === "all" || filter === "campaigns") && campaignRows.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Radio size={12} className="text-violet-500" />
                      <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Campaigns</span>
                    </div>
                  </div>
                  {campaignRows.map(c => (
                    <div key={c.id} className="flex items-center px-4 border-b border-gray-50 hover:bg-gray-50" style={{ height: ROW_HEIGHT }}>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate">{c.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${CAMPAIGN_COLORS[c.status]}20`, color: CAMPAIGN_COLORS[c.status] }}>{c.status}</span>
                          <span className="text-xs text-gray-400">{c.platform}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {taskRows.length === 0 && campaignRows.length === 0 && (
                <div className="h-48" />
              )}
            </div>

            {/* Gantt chart area */}
            <div className="flex-1 overflow-x-auto">
              <div style={{ minWidth: view === "month" ? 800 : 1200 }}>
                {/* Date header */}
                <div className="h-10 border-b border-gray-100 relative bg-gray-50">
                  {/* Month labels */}
                  {monthMarkers.map((d, i) => (
                    <div key={i} className="absolute top-0 h-full flex flex-col justify-between"
                      style={{ left: `${getLeft(d)}%` }}>
                      <div className="px-2 pt-1 text-xs font-bold text-gray-600 whitespace-nowrap">
                        {d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                      </div>
                    </div>
                  ))}
                  {/* Day labels for month view */}
                  {view === "month" && days.map((d, i) => (
                    <div key={i} className="absolute bottom-0 text-center"
                      style={{ left: `${(i / totalDays) * 100}%`, width: `${(1 / totalDays) * 100}%` }}>
                      <span className={`text-xs ${d.getDay() === 0 || d.getDay() === 6 ? "text-gray-300" : "text-gray-400"}`}>
                        {d.getDate()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid + bars */}
                <div className="relative">
                  {/* Background grid */}
                  <div className="absolute inset-0 pointer-events-none">
                    {days.map((d, i) => (
                      <div key={i} className="absolute top-0 bottom-0 border-r border-gray-50"
                        style={{ left: `${((i + 1) / totalDays) * 100}%` }} />
                    ))}
                    {/* Weekend shading */}
                    {days.map((d, i) => (d.getDay() === 0 || d.getDay() === 6) && (
                      <div key={`w${i}`} className="absolute top-0 bottom-0 bg-gray-50 opacity-60"
                        style={{ left: `${(i / totalDays) * 100}%`, width: `${(1 / totalDays) * 100}%` }} />
                    ))}
                    {/* Today line */}
                    {showToday && (
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                        style={{ left: `${todayLeft}%` }}>
                        <div className="absolute -top-0 -translate-x-1/2 bg-red-400 text-white text-xs px-1 rounded whitespace-nowrap">Today</div>
                      </div>
                    )}
                  </div>

                  {/* Task rows */}
                  {(filter === "all" || filter === "tasks") && taskRows.length > 0 && (
                    <>
                      <div className="bg-gray-50 border-b border-gray-100" style={{ height: 33 }} />
                      {taskRows.map(t => {
                        const start = t.startDate ? new Date(t.startDate) : new Date(t.dueDate!);
                        const end = t.dueDate ? new Date(t.dueDate) : new Date(t.startDate!);
                        const left = getLeft(start);
                        const width = getWidth(start, end);
                        const color = PRIORITY_COLORS[t.priority || "Medium"] || "#3b82f6";
                        return (
                          <div key={t.id} className="relative border-b border-gray-50" style={{ height: ROW_HEIGHT }}>
                            <div className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 text-white text-xs font-medium truncate shadow-sm cursor-pointer hover:opacity-90 transition"
                              style={{ left: `${left}%`, width: `${Math.max(width, 2)}%`, background: color, height: 26 }}
                              title={`${t.title} | ${t.priority} | ${t.status}`}>
                              {width > 5 && t.title.slice(0, 20)}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Campaign rows */}
                  {(filter === "all" || filter === "campaigns") && campaignRows.length > 0 && (
                    <>
                      <div className="bg-gray-50 border-b border-gray-100" style={{ height: 33 }} />
                      {campaignRows.map(c => {
                        const start = c.startDate ? new Date(c.startDate) : new Date(c.endDate!);
                        const end = c.endDate ? new Date(c.endDate) : new Date(c.startDate!);
                        const left = getLeft(start);
                        const width = getWidth(start, end);
                        const color = CAMPAIGN_COLORS[c.status] || "#6366f1";
                        return (
                          <div key={c.id} className="relative border-b border-gray-50" style={{ height: ROW_HEIGHT }}>
                            <div className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 text-white text-xs font-medium truncate shadow-sm cursor-pointer hover:opacity-90 transition"
                              style={{ left: `${left}%`, width: `${Math.max(width, 2)}%`, background: color, height: 26 }}
                              title={`${c.name} | ${c.platform} | ${c.status}`}>
                              {width > 5 && c.name.slice(0, 20)}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {taskRows.length === 0 && campaignRows.length === 0 && (
                    <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                      No items with dates in this period. Add start/due dates to tasks or dates to campaigns.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return <DashboardWrapper><TimelineContent /></DashboardWrapper>;
}

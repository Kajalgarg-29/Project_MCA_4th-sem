"use client";

import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetTasksQuery, useGetCampaignsQuery, useGetProjectsQuery } from "@/state/api";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Radio, CheckSquare } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const PRIORITY_COLORS: Record<string, string> = { Urgent: "#ef4444", High: "#f97316", Medium: "#3b82f6", Low: "#10b981" };
const CAMPAIGN_STATUS_COLORS: Record<string, string> = { Active: "#10b981", Draft: "#94a3b8", Paused: "#f59e0b", Completed: "#6366f1" };

function CalendarContent() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "list">("month");

  const { data: projects = [] } = useGetProjectsQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: tasks = [] } = useGetTasksQuery({ projectId: projects[0]?.id }, { skip: !projects[0]?.id });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today); };

  // Build events map: dateStr -> events[]
  const eventsMap: Record<string, { type: "task" | "campaign-start" | "campaign-end" | "campaign-active"; label: string; color: string; priority?: string; status?: string }[]> = {};

  const addEvent = (dateStr: string, event: any) => {
    if (!eventsMap[dateStr]) eventsMap[dateStr] = [];
    eventsMap[dateStr].push(event);
  };

  tasks.forEach(t => {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      addEvent(key, { type: "task", label: t.title, color: PRIORITY_COLORS[t.priority || "Medium"] || "#3b82f6", priority: t.priority, status: t.status });
    }
  });

  campaigns.forEach(c => {
    if (c.startDate) {
      const d = new Date(c.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      addEvent(key, { type: "campaign-start", label: `🚀 ${c.name}`, color: CAMPAIGN_STATUS_COLORS[c.status] || "#6366f1", status: c.status });
    }
    if (c.endDate) {
      const d = new Date(c.endDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      addEvent(key, { type: "campaign-end", label: `🏁 ${c.name}`, color: "#94a3b8", status: c.status });
    }
  });

  const getKey = (y: number, m: number, d: number) => `${y}-${m}-${d}`;

  // Calendar grid cells
  const cells: { day: number; curMonth: boolean; date: Date }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: daysInPrev - firstDay + 1 + i, curMonth: false, date: new Date(year, month - 1, daysInPrev - firstDay + 1 + i) });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, curMonth: true, date: new Date(year, month, i) });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, curMonth: false, date: new Date(year, month + 1, i) });

  const selectedKey = selectedDay ? getKey(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate()) : null;
  const selectedEvents = selectedKey ? (eventsMap[selectedKey] || []) : [];

  // List view: all events this month sorted by date
  const listEvents: { date: Date; events: any[] }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const key = getKey(year, month, i);
    if (eventsMap[key]?.length) listEvents.push({ date: new Date(year, month, i), events: eventsMap[key] });
  }

  const isToday = (d: Date) => d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  const isSelected = (d: Date) => selectedDay && d.getFullYear() === selectedDay.getFullYear() && d.getMonth() === selectedDay.getMonth() && d.getDate() === selectedDay.getDate();

  // Upcoming events (next 7 days)
  const upcoming: { date: Date; events: any[] }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = getKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (eventsMap[key]?.length) upcoming.push({ date: d, events: eventsMap[key] });
  }

  return (
    <div className="space-y-0 -m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <CalendarDays size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Calendar</h1>
            <p className="text-xs text-gray-400">Task deadlines & campaign timeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Today</button>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView("month")} className={`px-3 py-1.5 text-xs font-medium transition ${view === "month" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Month</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium transition ${view === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>List</button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Legend */}
        <div className="flex items-center gap-5 flex-wrap">
          {[
            { color: "#ef4444", label: "Urgent Task" },
            { color: "#f97316", label: "High Task" },
            { color: "#3b82f6", label: "Medium Task" },
            { color: "#10b981", label: "Campaign Start / Low Task" },
            { color: "#94a3b8", label: "Campaign End" },
            { color: "#f59e0b", label: "Paused Campaign" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {view === "month" ? (
          <div className="grid grid-cols-3 gap-4">
            {/* Calendar */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><ChevronLeft size={16} className="text-gray-500" /></button>
                <h2 className="font-bold text-gray-800">{MONTHS[month]} {year}</h2>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><ChevronRight size={16} className="text-gray-500" /></button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400">{d}</div>)}
              </div>
              {/* Cells */}
              <div className="grid grid-cols-7">
                {cells.map((cell, idx) => {
                  const key = getKey(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate());
                  const events = eventsMap[key] || [];
                  const today_ = isToday(cell.date);
                  const selected_ = isSelected(cell.date);
                  return (
                    <div key={idx} onClick={() => setSelectedDay(cell.date)}
                      className={`min-h-[80px] p-1.5 border-b border-r border-gray-50 cursor-pointer transition
                        ${!cell.curMonth ? "bg-gray-50" : "hover:bg-blue-50"}
                        ${selected_ ? "bg-blue-50 ring-1 ring-inset ring-blue-400" : ""}`}>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 mx-auto
                        ${today_ ? "bg-blue-600 text-white" : cell.curMonth ? "text-gray-700" : "text-gray-300"}`}>
                        {cell.day}
                      </div>
                      <div className="space-y-0.5">
                        {events.slice(0, 2).map((e, i) => (
                          <div key={i} className="text-xs px-1 py-0.5 rounded truncate text-white font-medium leading-tight" style={{ background: e.color }}>
                            {e.type === "task" ? "📋" : ""}{e.label.replace("🚀 ", "").replace("🏁 ", "").slice(0, 12)}
                          </div>
                        ))}
                        {events.length > 2 && <div className="text-xs text-gray-400 px-1">+{events.length - 2} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {/* Selected day events */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {selectedDay ? selectedDay.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "Select a day"}
                  </h3>
                </div>
                {!selectedDay ? (
                  <div className="p-8 text-center text-gray-300 text-sm">Click on a date to see events</div>
                ) : selectedEvents.length === 0 ? (
                  <div className="p-8 text-center text-gray-300 text-sm">No events on this day</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {selectedEvents.map((e, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-3">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: e.color }} />
                        <div>
                          <div className="text-sm font-medium text-gray-700">{e.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {e.type === "task" ? `Task · ${e.priority || "No priority"} · ${e.status || ""}` :
                             e.type === "campaign-start" ? `Campaign starts · ${e.status}` :
                             `Campaign ends · ${e.status}`}
                          </div>
                        </div>
                        {e.type === "task" ? <CheckSquare size={14} className="text-gray-300 ml-auto flex-shrink-0 mt-0.5" /> :
                         <Radio size={14} className="text-gray-300 ml-auto flex-shrink-0 mt-0.5" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming 7 days */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Clock size={14} className="text-gray-400" /> Next 7 Days</h3>
                </div>
                {upcoming.length === 0 ? (
                  <div className="p-6 text-center text-gray-300 text-sm">No upcoming events</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {upcoming.map(({ date, events }, i) => (
                      <div key={i} className="px-5 py-3">
                        <div className="text-xs font-semibold text-gray-400 mb-1.5">
                          {isToday(date) ? "Today" : date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </div>
                        <div className="space-y-1">
                          {events.map((e, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                              <span className="text-xs text-gray-600 truncate">{e.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded transition"><ChevronLeft size={14} className="text-gray-500" /></button>
                  <h2 className="font-bold text-gray-800 text-sm">{MONTHS[month]} {year}</h2>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded transition"><ChevronRight size={14} className="text-gray-500" /></button>
                </div>
                <span className="text-xs text-gray-400">{listEvents.length} days with events</span>
              </div>
              {listEvents.length === 0 ? (
                <div className="p-16 text-center">
                  <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No events this month</p>
                  <p className="text-gray-300 text-xs mt-1">Add due dates to tasks or dates to campaigns</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {listEvents.map(({ date, events }, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isToday(date) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                          {date.getDate()}
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          {isToday(date) ? "Today · " : ""}{date.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
                        </span>
                        <span className="text-xs text-gray-400">{events.length} event{events.length > 1 ? "s" : ""}</span>
                      </div>
                      <div className="space-y-2 ml-11">
                        {events.map((e, j) => (
                          <div key={j} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: e.color }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700 truncate">{e.label}</div>
                              <div className="text-xs text-gray-400">
                                {e.type === "task" ? `Task · ${e.priority || "No priority"} · ${e.status}` :
                                 e.type === "campaign-start" ? `Campaign starts · ${e.status}` : `Campaign ends · ${e.status}`}
                              </div>
                            </div>
                            {e.type === "task" ? <CheckSquare size={14} className="text-gray-300 flex-shrink-0" /> : <Radio size={14} className="text-gray-300 flex-shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary sidebar in list view */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">This Month Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Task Deadlines", value: tasks.filter(t => { if (!t.dueDate) return false; const d = new Date(t.dueDate); return d.getMonth() === month && d.getFullYear() === year; }).length, color: "bg-blue-500" },
                    { label: "Campaign Starts", value: campaigns.filter(c => { if (!c.startDate) return false; const d = new Date(c.startDate); return d.getMonth() === month && d.getFullYear() === year; }).length, color: "bg-green-500" },
                    { label: "Campaign Ends", value: campaigns.filter(c => { if (!c.endDate) return false; const d = new Date(c.endDate); return d.getMonth() === month && d.getFullYear() === year; }).length, color: "bg-gray-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-xs text-gray-600">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-3"><Clock size={14} className="text-gray-400" /> Next 7 Days</h3>
                {upcoming.length === 0 ? (
                  <p className="text-gray-300 text-xs">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {upcoming.map(({ date, events }, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isToday(date) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{date.getDate()}</div>
                        <div className="flex-1 min-w-0">
                          {events.slice(0, 2).map((e, j) => (
                            <div key={j} className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                              <span className="text-xs text-gray-600 truncate">{e.label.replace("🚀 ", "").replace("🏁 ", "")}</span>
                            </div>
                          ))}
                          {events.length > 2 && <span className="text-xs text-gray-400">+{events.length - 2} more</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return <DashboardWrapper><CalendarContent /></DashboardWrapper>;
}

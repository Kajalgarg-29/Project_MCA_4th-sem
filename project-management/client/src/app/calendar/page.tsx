"use client";
import { useState, useMemo } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetProjectsQuery, useGetCampaignsQuery,
  useGetAllCalendarEventsQuery, useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation, useDeleteCalendarEventMutation,
} from "@/state/api";
import {
  ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2,
  Clock, MapPin, Users, Bell, FolderOpen, Megaphone, Calendar,
  Menu, SidebarOpen
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const EVENT_TYPES = ["Meeting", "Deadline", "Review", "Presentation", "Workshop", "Call", "Reminder", "Other"];
const COLORS = [
  { name: "blue",   bg: "bg-blue-500",   light: "bg-blue-100",   text: "text-blue-700" },
  { name: "green",  bg: "bg-green-500",  light: "bg-green-100",  text: "text-green-700" },
  { name: "red",    bg: "bg-red-500",    light: "bg-red-100",    text: "text-red-700" },
  { name: "purple", bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
  { name: "orange", bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" },
  { name: "pink",   bg: "bg-pink-500",   light: "bg-pink-100",   text: "text-pink-700" },
  { name: "teal",   bg: "bg-teal-500",   light: "bg-teal-100",   text: "text-teal-700" },
  { name: "yellow", bg: "bg-yellow-500", light: "bg-yellow-100", text: "text-yellow-700" },
];

const getColorClasses = (colorName: string) => COLORS.find(c => c.name === colorName) || COLORS[0];

const emptyForm = {
  title: "", description: "", type: "Meeting", date: "",
  startTime: "", endTime: "", location: "", attendees: "",
  color: "blue", allDay: false, reminder: "",
};

type ViewType = "month" | "week" | "day";

export default function CalendarPage() {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [view, setView] = useState<ViewType>("month");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  // Mobile panel toggles
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const { data: projects = [] } = useGetProjectsQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: customEvents = [] } = useGetAllCalendarEventsQuery();
  const [createEvent] = useCreateCalendarEventMutation();
  const [updateEvent] = useUpdateCalendarEventMutation();
  const [deleteEvent] = useDeleteCalendarEventMutation();

  const allEvents = useMemo(() => {
    const events: any[] = [];
    customEvents.forEach((e: any) => {
      events.push({
        id: `custom-${e.id}`, rawId: e.id, title: e.title,
        date: new Date(e.date), type: e.type, color: e.color,
        startTime: e.startTime, endTime: e.endTime, location: e.location,
        attendees: e.attendees, description: e.description, allDay: e.allDay,
        reminder: e.reminder, source: "custom",
      });
    });
    projects.forEach((p: any) => {
      if (p.startDate) events.push({ id: `proj-s-${p.id}`, title: p.name, date: new Date(p.startDate), type: "Project Start", color: "blue",  source: "project",  label: "Start" });
      if (p.endDate)   events.push({ id: `proj-e-${p.id}`, title: p.name, date: new Date(p.endDate),   type: "Deadline",      color: "red",   source: "project",  label: "Deadline" });
    });
    campaigns.forEach((c: any) => {
      if (c.startDate) events.push({ id: `camp-s-${c.id}`, title: c.name, date: new Date(c.startDate), type: "Campaign Launch", color: "pink",   source: "campaign", label: "Launch" });
      if (c.endDate)   events.push({ id: `camp-e-${c.id}`, title: c.name, date: new Date(c.endDate),   type: "Campaign End",   color: "orange", source: "campaign", label: "End" });
    });
    return events;
  }, [customEvents, projects, campaigns]);

  const getEventsForDate = (date: Date) =>
    allEvents.filter(e =>
      e.date.getDate() === date.getDate() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getFullYear() === date.getFullYear()
    ).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const daysInMonth     = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay        = new Date(current.year, current.month, 1).getDay();
  const daysInPrevMonth = new Date(current.year, current.month, 0).getDate();

  const prevMonth = () => setCurrent(c => c.month === 0  ? { month: 11, year: c.year - 1 } : { month: c.month - 1, year: c.year });
  const nextMonth = () => setCurrent(c => c.month === 11 ? { month: 0,  year: c.year + 1 } : { month: c.month + 1, year: c.year });
  const goToToday = () => { setCurrent({ month: today.getMonth(), year: today.getFullYear() }); setSelectedDate(today); };

  const openCreate = (date?: Date) => {
    const d = date || selectedDate;
    setForm({ ...emptyForm, date: d.toISOString().split("T")[0] });
    setEditingEvent(null);
    setShowModal(true);
  };

  const openEdit = (event: any) => {
    if (event.source !== "custom") return;
    setForm({
      title: event.title, description: event.description || "",
      type: event.type, date: event.date.toISOString().split("T")[0],
      startTime: event.startTime || "", endTime: event.endTime || "",
      location: event.location || "", attendees: event.attendees || "",
      color: event.color, allDay: event.allDay || false, reminder: event.reminder || "",
    });
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date) return alert("Title and date are required");
    const payload = { ...form, reminder: form.reminder ? Number(form.reminder) : undefined };
    if (editingEvent) {
      await updateEvent({ id: editingEvent.rawId, ...payload });
    } else {
      await createEvent(payload);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleDelete = async (event: any) => {
    if (event.source !== "custom") return alert("Project and Campaign events cannot be deleted here.");
    if (!confirm("Delete this event?")) return;
    await deleteEvent(event.rawId);
    setSelectedEvent(null);
    setShowRightPanel(false);
  };

  const getWeekDays = () => {
    const day = selectedDate.getDay();
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  };
  const weekDays = getWeekDays();

  const upcomingEvents = allEvents
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6);

  const selectedDateEvents = getEventsForDate(selectedDate);

  // Open event detail (also opens right panel on mobile)
  const openEventDetail = (event: any) => {
    setSelectedEvent(event);
    setShowRightPanel(true);
  };

  return (
    <DashboardWrapper>
      <div className="flex h-[calc(100dvh-56px)] overflow-hidden bg-gray-50 relative">

        {/* ── Mobile: Left sidebar backdrop ── */}
        {showLeftSidebar && (
          <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setShowLeftSidebar(false)} />
        )}

        {/* ── Left Sidebar ── */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
          w-64 bg-white border-r border-gray-100 flex flex-col p-4 overflow-y-auto shrink-0
          transition-transform duration-300
          ${showLeftSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Close on mobile */}
          <button onClick={() => setShowLeftSidebar(false)} className="lg:hidden absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={16} className="text-gray-400" />
          </button>

          <button
            onClick={() => { openCreate(); setShowLeftSidebar(false); }}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition mb-5 shadow-sm"
          >
            <Plus size={16} /> New Event
          </button>

          {/* Mini Calendar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">{MONTHS[current.month].slice(0,3)} {current.year}</span>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={12} /></button>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={12} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs text-gray-300 font-medium">{d[0]}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`p${i}`} className="text-center">
                  <span className="text-xs text-gray-200">{daysInPrevMonth - firstDay + i + 1}</span>
                </div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(current.year, current.month, day);
                const isToday    = date.toDateString() === today.toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const hasEvents  = getEventsForDate(date).length > 0;
                return (
                  <button key={day} onClick={() => { setSelectedDate(date); setShowLeftSidebar(false); }}
                    className={`relative text-xs w-7 h-7 mx-auto flex items-center justify-center rounded-full transition font-medium
                      ${isToday ? "bg-blue-600 text-white" : isSelected ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-600"}`}
                  >
                    {day}
                    {hasEvents && !isToday && !isSelected && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-300 text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(event => {
                  const color = getColorClasses(event.color);
                  const daysUntil = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={event.id}
                      onClick={() => { setSelectedDate(event.date); setCurrent({ month: event.date.getMonth(), year: event.date.getFullYear() }); openEventDetail(event); setShowLeftSidebar(false); }}
                      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color.bg}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{event.title}</p>
                        <p className="text-xs text-gray-400">{event.type}</p>
                        <p className="text-xs text-blue-500 font-medium">
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sources</h3>
            <div className="space-y-1.5">
              {[{ label: "My Events", color: "bg-blue-500" }, { label: "Project Dates", color: "bg-red-500" }, { label: "Campaigns", color: "bg-pink-500" }].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-xs text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 flex justify-between items-center shrink-0 gap-2">
            <div className="flex items-center gap-2">
              {/* Hamburger for left sidebar — mobile only */}
              <button onClick={() => setShowLeftSidebar(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <Menu size={18} />
              </button>
              <button onClick={goToToday} className="px-2.5 sm:px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600">Today</button>
              <div className="flex items-center">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={15} /></button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={15} /></button>
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-gray-800 whitespace-nowrap">
                <span className="hidden sm:inline">{MONTHS[current.month]} </span>
                <span className="sm:hidden">{MONTHS[current.month].slice(0,3)} </span>
                {current.year}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* View switcher */}
              <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1">
                {(["month", "week", "day"] as ViewType[]).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium capitalize transition
                      ${view === v ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    {v === "month" ? <span><span className="hidden sm:inline">Month</span><span className="sm:hidden">Mo</span></span>
                    : v === "week" ? <span><span className="hidden sm:inline">Week</span><span className="sm:hidden">Wk</span></span>
                    : <span><span className="hidden sm:inline">Day</span><span className="sm:hidden">Dy</span></span>}
                  </button>
                ))}
              </div>
              {/* Add event */}
              <button onClick={() => openCreate()}
                className="flex items-center gap-1 bg-blue-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition">
                <Plus size={14} />
                <span className="hidden sm:inline">New Event</span>
              </button>
            </div>
          </div>

          {/* Calendar body */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">

            {/* MONTH VIEW */}
            {view === "month" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {DAYS_SHORT.map((d, i) => (
                    <div key={d} className={`text-center py-2 text-xs font-semibold ${i === 0 || i === 6 ? "text-red-400" : "text-gray-400"}`}>
                      <span className="hidden sm:inline">{d}</span>
                      <span className="sm:hidden">{d[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7" style={{ gridAutoRows: "minmax(70px, 1fr)" }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`p${i}`} className="border-r border-b border-gray-50 p-1 bg-gray-50/40">
                      <span className="text-xs text-gray-200">{daysInPrevMonth - firstDay + i + 1}</span>
                    </div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(current.year, current.month, day);
                    const isToday    = date.toDateString() === today.toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isWeekend  = date.getDay() === 0 || date.getDay() === 6;
                    const dayEvents  = getEventsForDate(date);
                    return (
                      <div key={day} onClick={() => setSelectedDate(date)}
                        className={`border-r border-b border-gray-50 p-1 sm:p-1.5 cursor-pointer hover:bg-blue-50/20 transition group
                          ${isSelected ? "bg-blue-50/40 ring-2 ring-inset ring-blue-300" : ""}
                          ${isWeekend && !isSelected ? "bg-gray-50/30" : ""}`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full
                            ${isToday ? "bg-blue-600 text-white" : isWeekend ? "text-gray-300" : "text-gray-500"}`}>
                            {day}
                          </span>
                          <button onClick={e => { e.stopPropagation(); openCreate(date); }}
                            className="hidden sm:flex opacity-0 group-hover:opacity-100 w-4 h-4 items-center justify-center rounded-full hover:bg-blue-100 text-blue-500 transition">
                            <Plus size={10} />
                          </button>
                        </div>
                        {/* Desktop: show event pills */}
                        <div className="hidden sm:block space-y-0.5">
                          {dayEvents.slice(0, 2).map(event => {
                            const color = getColorClasses(event.color);
                            return (
                              <div key={event.id}
                                onClick={e => { e.stopPropagation(); openEventDetail(event); }}
                                className={`text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-90 ${color.bg}`}>
                                {event.startTime && <span className="opacity-75 mr-1">{event.startTime}</span>}
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && <div className="text-xs text-blue-500 font-medium px-1">+{dayEvents.length - 2}</div>}
                        </div>
                        {/* Mobile: just dots */}
                        {dayEvents.length > 0 && (
                          <div className="sm:hidden flex gap-0.5 flex-wrap mt-0.5">
                            {dayEvents.slice(0, 3).map((e, j) => (
                              <div key={j} className={`w-1.5 h-1.5 rounded-full ${getColorClasses(e.color).bg}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                    <div key={`n${i}`} className="border-r border-b border-gray-50 p-1 bg-gray-50/40">
                      <span className="text-xs text-gray-200">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {view === "week" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {weekDays.map((d, i) => {
                    const isToday    = d.toDateString() === today.toDateString();
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    return (
                      <div key={i} onClick={() => setSelectedDate(d)} className={`p-2 text-center cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
                        <p className={`text-xs font-medium mb-1 ${i === 0 || i === 6 ? "text-red-400" : "text-gray-400"}`}>
                          <span className="hidden sm:inline">{DAYS_SHORT[d.getDay()]}</span>
                          <span className="sm:hidden">{DAYS_SHORT[d.getDay()][0]}</span>
                        </p>
                        <div className={`text-sm sm:text-base font-bold w-7 sm:w-8 h-7 sm:h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : "text-gray-700"}`}>
                          {d.getDate()}
                        </div>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {getEventsForDate(d).slice(0, 3).map((e, j) => (
                            <div key={j} className={`w-1.5 h-1.5 rounded-full ${getColorClasses(e.color).bg}`} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 divide-x divide-gray-50 min-h-64">
                  {weekDays.map((d, i) => {
                    const events = getEventsForDate(d);
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <div key={i} className={`p-1 sm:p-2 space-y-1 ${isToday ? "bg-blue-50/20" : ""}`}>
                        {events.map(event => {
                          const color = getColorClasses(event.color);
                          return (
                            <div key={event.id} onClick={() => openEventDetail(event)}
                              className={`p-1.5 sm:p-2 rounded-lg text-xs cursor-pointer hover:opacity-90 ${color.light}`}>
                              <p className={`font-semibold truncate ${color.text}`}>{event.title}</p>
                              {event.startTime && (
                                <p className={`${color.text} opacity-70 hidden sm:block`}>{event.startTime}{event.endTime && ` - ${event.endTime}`}</p>
                              )}
                            </div>
                          );
                        })}
                        {events.length === 0 && (
                          <button onClick={() => { setSelectedDate(d); openCreate(d); }}
                            className="w-full h-8 flex items-center justify-center text-gray-200 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition text-xs">
                            <Plus size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {view === "day" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold
                      ${selectedDate.toDateString() === today.toDateString() ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                      {selectedDate.getDate()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm sm:text-base">{DAYS_FULL[selectedDate.getDay()]}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}</p>
                    </div>
                  </div>
                  <button onClick={() => openCreate(selectedDate)}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700">
                    <Plus size={14} /> <span className="hidden sm:inline">Add Event</span>
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-12 text-gray-300">
                      <Calendar size={36} className="mx-auto mb-3" />
                      <p className="text-sm font-medium">No events scheduled</p>
                      <p className="text-xs mt-1">Click "Add Event" to schedule something</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map(event => {
                        const color = getColorClasses(event.color);
                        return (
                          <div key={event.id} className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border ${color.light} border-opacity-50`}>
                            <div className={`w-1 rounded-full ${color.bg} shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className={`font-semibold text-sm ${color.text}`}>{event.title}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} text-white mt-1 inline-block`}>{event.type}</span>
                                </div>
                                {event.source === "custom" && (
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => openEdit(event)} className="p-1.5 hover:bg-white rounded-lg"><Pencil size={13} className="text-gray-400" /></button>
                                    <button onClick={() => handleDelete(event)} className="p-1.5 hover:bg-white rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 space-y-1">
                                {(event.startTime || event.endTime) && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Clock size={11} />{event.startTime}{event.endTime && ` — ${event.endTime}`}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin size={11} /> {event.location}
                                  </div>
                                )}
                                {event.description && <p className="text-xs text-gray-400 mt-1">{event.description}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile: selected day events below month grid */}
            {view === "month" && selectedDateEvents.length > 0 && (
              <div className="sm:hidden mt-3 bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {selectedDateEvents.length} event{selectedDateEvents.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-2">
                  {selectedDateEvents.map(event => {
                    const color = getColorClasses(event.color);
                    return (
                      <div key={event.id} onClick={() => openEventDetail(event)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${color.light}`}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${color.bg}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${color.text}`}>{event.title}</p>
                          {event.startTime && <p className={`text-xs opacity-70 ${color.text}`}>{event.startTime}</p>}
                        </div>
                        <ChevronRight size={12} className={color.text} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile: Right panel backdrop ── */}
        {showRightPanel && selectedEvent && (
          <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => { setShowRightPanel(false); setSelectedEvent(null); }} />
        )}

        {/* ── Event Detail Panel ── */}
        {selectedEvent && (
          <div className={`
            fixed lg:relative inset-y-0 right-0 z-40 lg:z-auto
            w-[85vw] sm:w-72 lg:w-72 bg-white border-l border-gray-100 p-5 overflow-y-auto shrink-0
            transition-transform duration-300
            ${showRightPanel || typeof window !== "undefined" && window.innerWidth >= 1024 ? "translate-x-0" : "translate-x-full"}
            lg:translate-x-0
          `}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Event Details</h3>
              <div className="flex gap-1">
                {selectedEvent.source === "custom" && (
                  <>
                    <button onClick={() => openEdit(selectedEvent)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil size={14} className="text-gray-400" /></button>
                    <button onClick={() => handleDelete(selectedEvent)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
                  </>
                )}
                <button onClick={() => { setSelectedEvent(null); setShowRightPanel(false); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            {(() => {
              const color = getColorClasses(selectedEvent.color);
              return (
                <div>
                  <div className={`w-full h-2 rounded-full ${color.bg} mb-4`} />
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">{selectedEvent.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${color.bg} text-white font-medium`}>{selectedEvent.type}</span>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400 shrink-0" />
                      <span className="text-xs sm:text-sm">{selectedEvent.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                    {(selectedEvent.startTime || selectedEvent.endTime) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400 shrink-0" />
                        {selectedEvent.startTime}{selectedEvent.endTime && ` — ${selectedEvent.endTime}`}
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400 shrink-0" /> {selectedEvent.location}
                      </div>
                    )}
                    {selectedEvent.attendees && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Users size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Attendees</p>
                          <p className="text-xs sm:text-sm">{selectedEvent.attendees}</p>
                        </div>
                      </div>
                    )}
                    {selectedEvent.reminder && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bell size={14} className="text-gray-400 shrink-0" />
                        Reminder: {selectedEvent.reminder} min before
                      </div>
                    )}
                    {selectedEvent.description && (
                      <div className="bg-gray-50 rounded-lg p-3 text-xs sm:text-sm text-gray-600">
                        {selectedEvent.description}
                      </div>
                    )}
                    {selectedEvent.source !== "custom" && (
                      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${color.light} ${color.text}`}>
                        {selectedEvent.source === "project" ? <FolderOpen size={13} /> : <Megaphone size={13} />}
                        From {selectedEvent.source === "project" ? "Project" : "Campaign"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Create/Edit Modal — bottom sheet on mobile */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg rounded-t-2xl shadow-xl max-h-[92dvh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 sticky top-0 bg-white shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">{editingEvent ? "Edit Event" : "Schedule New Event"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Event Title *</label>
                <input type="text" placeholder="e.g. Team Meeting..." value={form.title}
                  onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Event Type</label>
                  <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Color</label>
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {COLORS.map(c => (
                      <button key={c.name} onClick={() => setForm((f: any) => ({ ...f, color: c.name }))}
                        className={`w-6 h-6 rounded-full ${c.bg} transition ${form.color === c.name ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm((f: any) => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm((f: any) => ({ ...f, allDay: !f.allDay }))}
                  className={`w-10 h-5 rounded-full transition relative ${form.allDay ? "bg-blue-600" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.allDay ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-sm text-gray-600">All Day Event</span>
              </div>
              {!form.allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Start Time</label>
                    <input type="time" value={form.startTime} onChange={e => setForm((f: any) => ({ ...f, startTime: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">End Time</label>
                    <input type="time" value={form.endTime} onChange={e => setForm((f: any) => ({ ...f, endTime: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Location / Link</label>
                <input type="text" placeholder="Office, Zoom link..." value={form.location}
                  onChange={e => setForm((f: any) => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Attendees</label>
                <input type="text" placeholder="John, Sarah..." value={form.attendees}
                  onChange={e => setForm((f: any) => ({ ...f, attendees: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Reminder</label>
                <select value={form.reminder} onChange={e => setForm((f: any) => ({ ...f, reminder: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                  <option value="">No reminder</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Notes / Description</label>
                <textarea placeholder="Add agenda, notes..." value={form.description}
                  onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 p-4 sm:p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 font-medium">
                {editingEvent ? "Save Changes" : "Schedule Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}
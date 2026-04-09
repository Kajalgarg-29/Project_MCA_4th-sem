"use client";
import { useState, useMemo } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetProjectsQuery, useGetTasksQuery } from "@/state/api";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_COLORS = [
  {
    bg: "bg-blue-500",
    light: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  {
    bg: "bg-purple-500",
    light: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  {
    bg: "bg-green-500",
    light: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  {
    bg: "bg-orange-500",
    light: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  {
    bg: "bg-pink-500",
    light: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-300",
  },
  {
    bg: "bg-teal-500",
    light: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-300",
  },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getBarStyle(
  startDate: Date | null,
  endDate: Date | null,
  viewStart: Date,
  totalDays: number,
) {
  if (!startDate && !endDate) return null;
  const now = new Date();
  const effectiveStart = startDate || now;
  const effectiveEnd =
    endDate || new Date(effectiveStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const viewEnd = new Date(
    viewStart.getTime() + totalDays * 24 * 60 * 60 * 1000,
  );

  if (effectiveEnd < viewStart || effectiveStart > viewEnd) return null;

  const clampedStart = effectiveStart < viewStart ? viewStart : effectiveStart;
  const clampedEnd = effectiveEnd > viewEnd ? viewEnd : effectiveEnd;

  const startOffset = Math.max(
    0,
    (clampedStart.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  const duration = Math.max(
    1,
    (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  const left = (startOffset / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
}

export default function TimelinePage() {
  const { data: projects = [] } = useGetProjectsQuery();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const viewStart = new Date(viewYear, viewMonth, 1);
  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const todayOffset =
    viewYear === today.getFullYear() && viewMonth === today.getMonth()
      ? ((today.getDate() - 1) / daysInMonth) * 100
      : null;

  const projectsWithDates = projects.filter(
    (p: any) => p.startDate || p.endDate,
  );
  const projectsWithoutDates = projects.filter(
    (p: any) => !p.startDate && !p.endDate,
  );

  const getProgress = (p: any) => {
    if (!p.startDate || !p.endDate) return 0;
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.endDate).getTime();
    const now = today.getTime();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getStatus = (p: any) => {
    if (!p.endDate)
      return { label: "No deadline", color: "bg-gray-100 text-gray-500" };
    const end = new Date(p.endDate);
    if (end < today)
      return { label: "Overdue", color: "bg-red-100 text-red-600" };
    const daysLeft = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft <= 7)
      return {
        label: `${daysLeft}d left`,
        color: "bg-orange-100 text-orange-600",
      };
    if (daysLeft <= 30)
      return {
        label: `${daysLeft}d left`,
        color: "bg-yellow-100 text-yellow-600",
      };
    return { label: `${daysLeft}d left`, color: "bg-green-100 text-green-600" };
  };

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black?text-white">
              Timeline
            </h1>
            <p className="text-black?text-white text-sm mt-0.5">
              Project schedule and Gantt view
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-white"
            >
              Today
            </button>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <span
                className="px-3 py-1.5 text-sm font-medium text-gray-700 The class `min-w-[130px]` can be written as `min-w-32.5`(suggestCanonicalClasses)
.min-w-\[130px\] {
    min-width: 130px;
} text-center"
              >
                {FULL_MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Projects",
              value: projects.length,
              icon: Calendar,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "With Timeline",
              value: projectsWithDates.length,
              icon: Clock,
              color: "text-green-600 bg-green-50",
            },
            {
              label: "Overdue",
              value: projects.filter(
                (p: any) => p.endDate && new Date(p.endDate) < today,
              ).length,
              icon: AlertCircle,
              color: "text-red-600 bg-red-50",
            },
            {
              label: "No Dates Set",
              value: projectsWithoutDates.length,
              icon: Calendar,
              color: "text-gray-600 bg-gray-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color} mb-2`}
              >
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
            <Calendar size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-medium">No projects yet</p>
            <p className="text-gray-300 text-sm mt-1">
              Create projects with start and end dates to see the timeline
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Gantt Header */}
            <div className="flex border-b border-gray-100">
              <div className="w-64 shrink-0 px-4 py-3 border-r border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Project
                </p>
              </div>
              <div className="flex-1 relative bg-gray-50">
                <div className="flex">
                  {dayHeaders.map((day) => {
                    const date = new Date(viewYear, viewMonth, day);
                    const isWeekend =
                      date.getDay() === 0 || date.getDay() === 6;
                    const isToday =
                      day === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear();
                    return (
                      <div
                        key={day}
                        className={`flex-1 py-2 text-center text-xs border-r border-gray-100 last:border-0 font-medium
                          ${isToday ? "text-blue-600 bg-blue-50" : isWeekend ? "text-gray-300 bg-gray-50" : "text-gray-400"}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="w-28 shrink-0 px-3 py-3 bg-gray-50 border-l border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </p>
              </div>
            </div>

            {/* Project Rows */}
            {projects.map((project: any, idx: number) => {
              const color = STATUS_COLORS[idx % STATUS_COLORS.length];
              const startDate = project.startDate
                ? new Date(project.startDate)
                : null;
              const endDate = project.endDate
                ? new Date(project.endDate)
                : null;
              const barStyle = getBarStyle(
                startDate,
                endDate,
                viewStart,
                daysInMonth,
              );
              const progress = getProgress(project);
              const status = getStatus(project);

              return (
                <div
                  key={project.id}
                  className="flex border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer transition"
                  onClick={() =>
                    setSelectedProject(
                      selectedProject?.id === project.id ? null : project,
                    )
                  }
                >
                  {/* Project Name */}
                  <div className="w-64 shrink-0 px-4 py-3 border-r border-gray-100 flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${color.bg} shrink-0`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {startDate
                          ? startDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "No start"}
                        {" → "}
                        {endDate
                          ? endDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "No end"}
                      </p>
                    </div>
                  </div>

                  {/* Bar Area */}
                  <div className="flex-1 relative py-3 px-0">
                    {/* Day grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {dayHeaders.map((day) => {
                        const date = new Date(viewYear, viewMonth, day);
                        const isWeekend =
                          date.getDay() === 0 || date.getDay() === 6;
                        return (
                          <div
                            key={day}
                            className={`flex-1 border-r border-gray-50 last:border-0 ${isWeekend ? "bg-gray-50/50" : ""}`}
                          />
                        );
                      })}
                    </div>

                    {/* Today line */}
                    {todayOffset !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-blue-400 z-10 pointer-events-none"
                        style={{ left: `${todayOffset}%` }}
                      />
                    )}

                    {/* Project bar */}
                    {barStyle ? (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-7 rounded-full overflow-hidden shadow-sm"
                        style={barStyle}
                      >
                        <div
                          className={`h-full w-full ${color.light} border ${color.border} relative flex items-center`}
                        >
                          {/* Progress fill */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 ${color.bg} opacity-40 rounded-full transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                          <span
                            className={`relative z-10 px-2 text-xs font-semibold ${color.text} truncate`}
                          >
                            {project.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs text-gray-300 italic">
                          {!project.startDate && !project.endDate
                            ? "No dates"
                            : "Outside view"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="w-28 shrink-0 px-3 py-3 border-l border-gray-100 flex items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Project Detail Panel */}
        {selectedProject && (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {selectedProject.name}
                </h3>
                {selectedProject.description && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {selectedProject.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-300 hover:text-gray-500 text-lg"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-700">
                  {selectedProject.startDate
                    ? new Date(selectedProject.startDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "Not set"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">End Date</p>
                <p className="text-sm font-medium text-gray-700">
                  {selectedProject.endDate
                    ? new Date(selectedProject.endDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "Not set"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${getProgress(selectedProject)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {getProgress(selectedProject)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No-date projects list */}
        {projectsWithoutDates.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-medium text-gray-600 text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={15} className="text-gray-400" />
              Projects without dates ({projectsWithoutDates.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {projectsWithoutDates.map((p: any) => (
                <span
                  key={p.id}
                  className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}

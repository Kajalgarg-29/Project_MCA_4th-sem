"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardWrapper from "@/app/dashboardWrapper";
import {
  useGetAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetUsersQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useMarkAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetTodayAttendanceQuery,
} from "@/state/api";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  Plus, X, ChevronLeft, ChevronRight,
  Calendar, TrendingUp, Award
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  Present: "bg-green-100 text-green-700 border-green-200",
  Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Absent: "bg-red-100 text-red-700 border-red-200",
  "Half Day": "bg-orange-100 text-orange-700 border-orange-200",
  WFH: "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_DOT: Record<string, string> = {
  Present: "bg-green-500",
  Late: "bg-yellow-500",
  Absent: "bg-red-500",
  "Half Day": "bg-orange-500",
  WFH: "bg-blue-500",
};

const STATUSES = ["Present", "Late", "Absent", "Half Day", "WFH"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function AttendancePage() {
  const today = new Date();
  const { data: session } = useSession();
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [markForm, setMarkForm] = useState({
    date: today.toISOString().split("T")[0],
    status: "Present", notes: "", checkIn: "", checkOut: "",
  });

  const { data: users = [] } = useGetUsersQuery();
  const { data: todayData = [], refetch: refetchToday } = useGetTodayAttendanceQuery();

  // Resolve logged-in user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        setResolvedUserId(parsed.userId);
        return;
      } catch {}
    }
    if (session?.user?.email && users.length > 0) {
      const found = users.find((u: any) => u.email === session.user?.email);
      if (found) {
        setCurrentUser(found);
        setResolvedUserId(found.userId);
      }
    }
  }, [session, users]);

  // Fetch only MY attendance
  const { data: myAttendance = [], refetch } = useGetAttendanceQuery(
    { userId: resolvedUserId!, month: viewMonth, year: viewYear },
    { skip: !resolvedUserId }
  );

  const { data: summaryData = [] } = useGetAttendanceSummaryQuery({ month: viewMonth, year: viewYear });
  const mySummary = summaryData.find((s: any) => s.user?.userId === resolvedUserId);

  const [checkIn] = useCheckInMutation();
  const [checkOut] = useCheckOutMutation();
  const [markAttendance] = useMarkAttendanceMutation();
  const [deleteAttendance] = useDeleteAttendanceMutation();

  const myTodayRecord = todayData.find((a: any) => a.userId === resolvedUserId);

  const handleCheckIn = async () => {
    if (!resolvedUserId) return;
    await checkIn({ userId: resolvedUserId });
    refetchToday();
    refetch();
  };

  const handleCheckOut = async () => {
    if (!myTodayRecord) return;
    await checkOut(myTodayRecord.id);
    refetchToday();
    refetch();
  };

  const handleMark = async () => {
    if (!resolvedUserId || !markForm.date || !markForm.status) return;
    await markAttendance({ ...markForm, userId: resolvedUserId });
    setShowMarkModal(false);
    setMarkForm({ date: today.toISOString().split("T")[0], status: "Present", notes: "", checkIn: "", checkOut: "" });
    refetch();
    refetchToday();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    await deleteAttendance(id);
    refetch();
    refetchToday();
  };

  const formatTime = (dt?: string | null) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();

  const getRecordForDay = (day: number) => {
    return myAttendance.find((a: any) => {
      const d = new Date(a.date);
      return d.getDate() === day && d.getMonth() === viewMonth - 1 && d.getFullYear() === viewYear;
    });
  };

  const workingDays = daysInMonth;
  const presentCount = mySummary ? mySummary.present + mySummary.late + mySummary.wfh : 0;
  const attendancePct = workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 0;
  const displayName = currentUser?.username || session?.user?.name || "User";
  const totalHours = mySummary?.totalHours || 0;

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowMarkModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus size={16} /> Add Record
          </button>
        </div>

        {/* Today's Check-in Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium mb-1">TODAY — {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
              <p className="text-xl font-bold">{displayName}</p>
              <div className="flex gap-6 mt-3">
                <div>
                  <p className="text-blue-200 text-xs">Check In</p>
                  <p className="text-base font-semibold">{myTodayRecord ? formatTime(myTodayRecord.checkIn) : "—"}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Check Out</p>
                  <p className="text-base font-semibold">{myTodayRecord ? formatTime(myTodayRecord.checkOut) : "—"}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Hours Worked</p>
                  <p className="text-base font-semibold">{myTodayRecord?.workHours ? `${myTodayRecord.workHours}h` : "—"}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Status</p>
                  <p className="text-base font-semibold">{myTodayRecord?.status || "Not marked"}</p>
                </div>
              </div>
            </div>
            <div>
              {!myTodayRecord ? (
                <button onClick={handleCheckIn} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-lg">
                  ✅ Check In
                </button>
              ) : !myTodayRecord.checkOut ? (
                <button onClick={handleCheckOut} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-lg">
                  🚪 Check Out
                </button>
              ) : (
                <div className="bg-white/20 px-6 py-3 rounded-xl text-sm font-semibold text-center">
                  ✅ Completed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Present", value: mySummary?.present || 0, icon: CheckCircle, color: "text-green-600 bg-green-50", sub: "days" },
            { label: "Late", value: mySummary?.late || 0, icon: AlertCircle, color: "text-yellow-600 bg-yellow-50", sub: "days" },
            { label: "Absent", value: mySummary?.absent || 0, icon: XCircle, color: "text-red-600 bg-red-50", sub: "days" },
            { label: "Hours Worked", value: `${totalHours}h`, icon: Clock, color: "text-blue-600 bg-blue-50", sub: "this month" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color} mb-3`}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xs text-gray-300">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">Attendance Rate — {MONTHS[viewMonth - 1]} {viewYear}</h3>
            </div>
            <span className={`text-lg font-bold ${attendancePct >= 80 ? "text-green-600" : attendancePct >= 60 ? "text-yellow-600" : "text-red-600"}`}>
              {attendancePct}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${attendancePct >= 80 ? "bg-green-500" : attendancePct >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(attendancePct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span>
            <span className={attendancePct < 80 ? "text-red-400" : "text-gray-400"}>Min: 80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Month Navigation + View Toggle */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={16} /></button>
            <span className="text-sm font-semibold text-gray-700 w-36 text-center">{MONTHS[viewMonth - 1]} {viewYear}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={16} /></button>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView("calendar")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${activeView === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${activeView === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              List
            </button>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        {activeView === "calendar" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-3">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="h-20 border-r border-b border-gray-50" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const record = getRecordForDay(day);
                const isToday = day === today.getDate() && viewMonth === today.getMonth() + 1 && viewYear === today.getFullYear();
                const date = new Date(viewYear, viewMonth - 1, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isFuture = date > today;

                return (
                  <div
                    key={day}
                    className={`h-20 border-r border-b border-gray-50 p-2 relative
                      ${isWeekend && !record ? "bg-gray-50/50" : ""}
                      ${isFuture ? "opacity-40" : ""}
                      ${isToday ? "ring-2 ring-inset ring-blue-400" : ""}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center" : isWeekend ? "text-gray-300" : "text-gray-500"}`}>
                      {day}
                    </span>
                    {record && (
                      <div className="mt-1">
                        <div className={`text-xs px-1.5 py-0.5 rounded font-medium border ${STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"}`}>
                          {record.status}
                        </div>
                        {record.checkIn && (
                          <p className="text-xs text-gray-400 mt-0.5">{formatTime(record.checkIn)}</p>
                        )}
                      </div>
                    )}
                    {!record && !isFuture && !isWeekend && (
                      <div className="mt-1">
                        <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-red-50 text-red-400 border border-red-100">
                          Absent
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex gap-4 p-3 border-t border-gray-100 flex-wrap">
              {Object.entries(STATUS_STYLES).map(([status, style]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} />
                  <span className="text-xs text-gray-500">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {activeView === "list" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {myAttendance.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                <p>No records for {MONTHS[viewMonth - 1]} {viewYear}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Check In</th>
                    <th className="text-left p-4">Check Out</th>
                    <th className="text-left p-4">Hours</th>
                    <th className="text-left p-4">Notes</th>
                    <th className="text-right p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...myAttendance].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{formatTime(record.checkIn)}</td>
                      <td className="p-4 text-sm text-gray-600">{formatTime(record.checkOut)}</td>
                      <td className="p-4 text-sm text-gray-600">{record.workHours ? `${record.workHours}h` : "—"}</td>
                      <td className="p-4 text-sm text-gray-400">{record.notes || "—"}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 hover:bg-red-50 rounded">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add Attendance Record</h2>
              <button onClick={() => setShowMarkModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date *</label>
                <input
                  type="date"
                  value={markForm.date}
                  max={today.toISOString().split("T")[0]}
                  onChange={e => setMarkForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setMarkForm(f => ({ ...f, status: s }))}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition
                        ${markForm.status === s ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {markForm.status !== "Absent" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Check In</label>
                    <input
                      type="time"
                      onChange={e => setMarkForm(f => ({ ...f, checkIn: e.target.value ? `${f.date}T${e.target.value}` : "" }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Check Out</label>
                    <input
                      type="time"
                      onChange={e => setMarkForm(f => ({ ...f, checkOut: e.target.value ? `${f.date}T${e.target.value}` : "" }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Doctor appointment, WFH reason..."
                  value={markForm.notes}
                  onChange={e => setMarkForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowMarkModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm">Cancel</button>
              <button onClick={handleMark} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 font-medium">Save Record</button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

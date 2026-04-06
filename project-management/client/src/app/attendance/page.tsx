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
  useUpdateAttendanceMutation, // NEW — add this to your API slice
} from "@/state/api";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  Edit2,
  Trash2,
  Users,
  Search,
  ChevronDown,
  UserCheck,
  History,
} from "lucide-react";

interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workHours?: number | null;
  notes?: string | null;
}

interface User {
  userId: number;
  username: string;
  email: string;
  role?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Present: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Late: "bg-amber-50 text-amber-700 border-amber-200",
  Absent: "bg-red-50 text-red-700 border-red-200",
  "Half Day": "bg-orange-50 text-orange-700 border-orange-200",
  WFH: "bg-sky-50 text-sky-700 border-sky-200",
};
const STATUS_DOT: Record<string, string> = {
  Present: "bg-emerald-500",
  Late: "bg-amber-500",
  Absent: "bg-red-500",
  "Half Day": "bg-orange-500",
  WFH: "bg-sky-500",
};
const STATUSES = ["Present", "Late", "Absent", "Half Day", "WFH"];
const MONTHS = [
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
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  status: "Present",
  notes: "",
  checkIn: "",
  checkOut: "",
};

const formatTime = (dt?: string | null) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (date: string, time: string) =>
  time ? `${date}T${time}:00` : "";

interface RecordModalProps {
  title: string;
  initialValues?: typeof EMPTY_FORM & { id?: number };
  onSave: (form: typeof EMPTY_FORM & { id?: number }) => void;
  onClose: () => void;
  maxDate?: string;
  allowFutureBlock?: boolean;
}

function RecordModal({
  title,
  initialValues,
  onSave,
  onClose,
  maxDate,
}: RecordModalProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });

  const checkInTime = form.checkIn
    ? form.checkIn.split("T")[1]?.slice(0, 5)
    : "";
  const checkOutTime = form.checkOut
    ? form.checkOut.split("T")[1]?.slice(0, 5)
    : "";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Date *
            </label>
            <input
              type="date"
              value={form.date}
              max={maxDate}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    form.status === s
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {form.status !== "Absent" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Check In
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      checkIn: e.target.value
                        ? `${f.date}T${e.target.value}:00`
                        : "",
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Check Out
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      checkOut: e.target.value
                        ? `${f.date}T${e.target.value}:00`
                        : "",
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Doctor appointment, WFH reason, forgot to check in..."
              value={form.notes || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
}

interface UserSelectorProps {
  users: User[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  currentUserId: number | null;
  isAdmin: boolean;
}
function UserSelector({
  users,
  selectedId,
  onSelect,
  currentUserId,
  isAdmin,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = users.find((u) => u.userId === selectedId);
  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
      >
        <Users size={15} className="text-blue-500" />
        <span
          className=".max-w-\[160px\] {
    max-width: 160px;
} truncate"
        >
          {selected?.username || "Select User"}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                autoFocus
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((u) => (
              <button
                key={u.userId}
                onClick={() => {
                  onSelect(u.userId);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition ${
                  u.userId === selectedId ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {u.username}
                    {u.userId === currentUserId && (
                      <span className="ml-2 text-xs font-normal text-blue-500">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {u.userId === selectedId && (
                  <CheckCircle
                    size={14}
                    className="text-blue-500 ml-auto flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { data: session } = useSession();
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");

  const [resolvedUserId, setResolvedUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);

  // ── API ──
  const { data: users = [] } = useGetUsersQuery();
  const { data: todayData = [], refetch: refetchToday } =
    useGetTodayAttendanceQuery();

  const effectiveUserId = viewingUserId ?? resolvedUserId;

  const { data: attendance = [], refetch } = useGetAttendanceQuery(
    { userId: effectiveUserId!, month: viewMonth, year: viewYear },
    { skip: !effectiveUserId },
  );
  const { data: summaryData = [] } = useGetAttendanceSummaryQuery({
    month: viewMonth,
    year: viewYear,
  });

  const [checkIn] = useCheckInMutation();
  const [checkOut] = useCheckOutMutation();
  const [markAttendance] = useMarkAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation?.() ?? [
    async () => {},
  ];
  const [deleteAttendance] = useDeleteAttendanceMutation();

  // ── Resolve logged-in user ──
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        setResolvedUserId(parsed.userId);
        setViewingUserId(parsed.userId);
        return;
      } catch {}
    }
    if (session?.user?.email && users.length > 0) {
      const found = users.find((u: User) => u.email === session.user?.email);
      if (found) {
        setCurrentUser(found);
        setResolvedUserId(found.userId);
        setViewingUserId(found.userId);
      }
    }
  }, [session, users]);

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "ADMIN";
  const viewingUser = users.find((u: User) => u.userId === effectiveUserId);
  const myTodayRecord = todayData.find(
    (a: AttendanceRecord) => a.userId === resolvedUserId,
  );
  const mySummary = summaryData.find(
    (s: any) => s.user?.userId === effectiveUserId,
  );

  // ── Check in/out ──
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

  // ── Add / Edit save ──
  const handleSave = async (form: typeof EMPTY_FORM & { id?: number }) => {
    if (!effectiveUserId || !form.date || !form.status) return;

    if (form.id) {
      // EDIT existing
      await updateAttendance({ id: form.id, ...form, userId: effectiveUserId });
    } else {
      // CREATE new
      await markAttendance({ ...form, userId: effectiveUserId });
    }

    setShowAddModal(false);
    setEditRecord(null);
    refetch();
    refetchToday();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this attendance record?")) return;
    await deleteAttendance(id);
    refetch();
    refetchToday();
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditRecord(record);
  };

  // ── Calendar helpers ──
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();

  const getRecordForDay = (day: number) =>
    attendance.find((a: AttendanceRecord) => {
      const d = new Date(a.date);
      return (
        d.getDate() === day &&
        d.getMonth() === viewMonth - 1 &&
        d.getFullYear() === viewYear
      );
    });

  // ── Stats ──
  const workingDays = daysInMonth;
  const presentCount = mySummary
    ? (mySummary.present ?? 0) + (mySummary.late ?? 0) + (mySummary.wfh ?? 0)
    : 0;
  const attendancePct =
    workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 0;
  const totalHours = mySummary?.totalHours || 0;
  const displayName =
    viewingUser?.username ||
    currentUser?.username ||
    session?.user?.name ||
    "User";

  // ── Missed days (weekdays with no record before today) ──
  const missedDays = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1,
  ).filter((day) => {
    const date = new Date(viewYear, viewMonth - 1, day);
    const isFuture = date > today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const hasRecord = !!getRecordForDay(day);
    return !isFuture && !isWeekend && !hasRecord;
  });

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Admin: user switcher */}
            <UserSelector
              users={users}
              selectedId={effectiveUserId}
              onSelect={(id) => setViewingUserId(id)}
              currentUserId={resolvedUserId}
              isAdmin={isAdmin}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-sm transition"
            >
              <Plus size={16} /> Add Record
            </button>
          </div>
        </div>

        {/* ── Today Banner (only for own view) ── */}
        {effectiveUserId === resolvedUserId && (
          <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-blue-200 text-xs font-semibold mb-1 uppercase tracking-wider">
                  Today —{" "}
                  {today.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xl font-bold">{displayName}</p>
                <div className="flex gap-6 mt-3 flex-wrap">
                  {[
                    {
                      label: "Check In",
                      value: formatTime(myTodayRecord?.checkIn),
                    },
                    {
                      label: "Check Out",
                      value: formatTime(myTodayRecord?.checkOut),
                    },
                    {
                      label: "Hours",
                      value: myTodayRecord?.workHours
                        ? `${myTodayRecord.workHours}h`
                        : "—",
                    },
                    {
                      label: "Status",
                      value: myTodayRecord?.status || "Not marked",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-blue-200 text-xs">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {!myTodayRecord ? (
                  <>
                    <button
                      onClick={handleCheckIn}
                      className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-md"
                    >
                      ✅ Check In
                    </button>
                    {/* Quick "I forgot" link */}
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition text-center"
                      title="Add past attendance"
                    >
                      <History size={16} />
                    </button>
                  </>
                ) : !myTodayRecord.checkOut ? (
                  <button
                    onClick={handleCheckOut}
                    className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-md"
                  >
                    🚪 Check Out
                  </button>
                ) : (
                  <div className="bg-white/20 px-5 py-2.5 rounded-xl text-sm font-semibold">
                    ✅ Day Complete
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Viewing someone else */}
        {effectiveUserId !== resolvedUserId && viewingUser && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-4 mb-6 text-white flex items-center gap-3 shadow-lg shadow-violet-100">
            <UserCheck size={20} />
            <div>
              <p className="font-bold text-sm">
                Viewing: {viewingUser.username}
              </p>
              <p className="text-violet-200 text-xs">{viewingUser.email}</p>
            </div>
            <button
              onClick={() => setViewingUserId(resolvedUserId)}
              className="ml-auto text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition"
            >
              Back to mine
            </button>
          </div>
        )}

        {/* ── Missed Days Alert ── */}
        {missedDays.length > 0 && effectiveUserId === resolvedUserId && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle
              size={18}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {missedDays.length} day{missedDays.length > 1 ? "s" : ""}{" "}
                missing this month
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Days {missedDays.slice(0, 5).join(", ")}
                {missedDays.length > 5
                  ? ` and ${missedDays.length - 5} more`
                  : ""}{" "}
                have no records.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-600 transition flex-shrink-0"
            >
              Add Record
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Present",
              value: mySummary?.present ?? 0,
              icon: CheckCircle,
              color: "text-emerald-600 bg-emerald-50",
              sub: "days",
            },
            {
              label: "Late",
              value: mySummary?.late ?? 0,
              icon: AlertCircle,
              color: "text-amber-600 bg-amber-50",
              sub: "days",
            },
            {
              label: "Absent",
              value: mySummary?.absent ?? 0,
              icon: XCircle,
              color: "text-red-600 bg-red-50",
              sub: "days",
            },
      
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color} mb-3`}
              >
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs font-semibold text-gray-500">{s.label}</p>
              <p className="text-xs text-gray-300">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Award size={17} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm">
                Attendance Rate — {MONTHS[viewMonth - 1]} {viewYear}
              </h3>
            </div>
            <span
              className={`text-base font-bold ${attendancePct >= 80 ? "text-emerald-600" : attendancePct >= 60 ? "text-amber-600" : "text-red-600"}`}
            >
              {attendancePct}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${attendancePct >= 80 ? "bg-emerald-500" : attendancePct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(attendancePct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span>
            <span
              className={attendancePct < 80 ? "text-red-400 font-medium" : ""}
            >
              Min: 80%
            </span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-800 w-36 text-center">
              {MONTHS[viewMonth - 1]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["calendar", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  activeView === v
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {activeView === "calendar" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold text-gray-400 py-3 uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div
                  key={`e-${i}`}
                  className="h-20 border-r border-b border-gray-50"
                />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const record = getRecordForDay(day);
                const date = new Date(viewYear, viewMonth - 1, day);
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() + 1 &&
                  viewYear === today.getFullYear();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isFuture = date > today;

                return (
                  <div
                    key={day}
                    className={`h-20 border-r border-b border-gray-50 p-1.5 relative group
                      ${isWeekend && !record ? "bg-gray-50/60" : ""}
                      ${isFuture ? "opacity-30" : ""}
                      ${isToday ? "ring-2 ring-inset ring-blue-400" : ""}
                    `}
                  >
                    <span
                      className={`text-xs font-semibold flex items-center justify-center w-5 h-5 rounded-full
                      ${isToday ? "bg-blue-600 text-white" : isWeekend ? "text-gray-300" : "text-gray-500"}
                    `}
                    >
                      {day}
                    </span>

                    {record && (
                      <div className="mt-0.5">
                        <div
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {record.status}
                        </div>
                        {record.checkIn && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatTime(record.checkIn)}
                          </p>
                        )}
                      </div>
                    )}

                    {!record && !isFuture && !isWeekend && (
                      <div className="mt-0.5">
                        <div className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-red-50 text-red-400 border border-red-100">
                          Absent
                        </div>
                      </div>
                    )}

                    {record && !isFuture && (
                      <button
                        onClick={() => handleEdit(record)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition w-5 h-5 bg-white rounded shadow flex items-center justify-center border border-gray-200"
                        title="Edit"
                      >
                        <Edit2 size={10} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 p-3 border-t border-gray-100 flex-wrap">
              {Object.entries(STATUS_STYLES).map(([status]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`}
                  />
                  <span className="text-xs text-gray-400">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {attendance.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  No records for {MONTHS[viewMonth - 1]} {viewYear}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  + Add First Record
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Date",
                      "Status",
                      "Check In",
                      "Check Out",
                      "Hours",
                      "Notes",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...attendance]
                    .sort(
                      (a: AttendanceRecord, b: AttendanceRecord) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((record: AttendanceRecord) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatTime(record.checkOut)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.workHours ? `${record.workHours}h` : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-[140px] truncate">
                          {record.notes || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50 transition"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <RecordModal
          title="Add Attendance Record"
          onSave={handleSave}
          onClose={() => setShowAddModal(false)}
          maxDate={todayStr}
        />
      )}

      {/* ── Edit Modal ── */}
      {editRecord && (
        <RecordModal
          title="Edit Attendance Record"
          initialValues={{
            id: editRecord.id,
            date: new Date(editRecord.date).toISOString().split("T")[0],
            status: editRecord.status,
            notes: editRecord.notes || "",
            checkIn: editRecord.checkIn || "",
            checkOut: editRecord.checkOut || "",
          }}
          onSave={handleSave}
          onClose={() => setEditRecord(null)}
          maxDate={todayStr}
        />
      )}
    </DashboardWrapper>
  );
}

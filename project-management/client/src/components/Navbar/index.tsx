"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, Settings, LogOut, X, MapPin, Users, FolderOpen, CheckSquare } from "lucide-react";
import { useGetAllCalendarEventsQuery, useGetProjectsQuery, useGetUsersQuery } from "@/state/api";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [now, setNow] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: events = [] } = useGetAllCalendarEventsQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) try { setUser(JSON.parse(stored)); } catch {}
    const d = localStorage.getItem("dismissed_notifications");
    if (d) try { setDismissed(JSON.parse(d)); } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search results
  const searchResults = searchQuery.trim().length > 1 ? [
    ...projects.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3).map((p: any) => ({ type: "project", label: p.name, href: `/projects/${p.id}`, icon: "📁" })),
    ...users.filter((u: any) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3).map((u: any) => ({ type: "user", label: u.username, sub: u.email, href: "/users", icon: "👤" })),
  ] : [];

  // Notifications
  const notifications = events
    .filter((e: any) => !dismissed.includes(e.id) && e.reminder)
    .map((e: any) => {
      const dateStr = e.date.split("T")[0];
      const eventDateTime = e.startTime ? new Date(`${dateStr}T${e.startTime}:00`) : new Date(`${dateStr}T09:00:00`);
      const reminderStart = new Date(eventDateTime.getTime() - Number(e.reminder) * 60 * 1000);
      const diffMins = (eventDateTime.getTime() - now.getTime()) / (1000 * 60);
      const isInWindow = now >= reminderStart && now <= eventDateTime;
      if (!isInWindow) return null;
      return { ...e, eventDateTime, diffMins, timeLabel: diffMins < 1 ? "Starting now!" : diffMins < 60 ? `In ${Math.round(diffMins)} min` : `In ${Math.round(diffMins / 60)}h` };
    }).filter(Boolean);

  const dismissNotification = (id: number) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (session) await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.username || session?.user?.name || "User";
  const displayInitial = displayName?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-100 shrink-0 relative z-20">
      {/* Search */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 w-80 border border-gray-100 focus-within:border-blue-300 focus-within:bg-white transition">
          <Search className="text-gray-400 shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search projects, users..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowSearch(false); }}>
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && searchQuery.trim().length > 1 && (
          <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No results for "{searchQuery}"
              </div>
            ) : (
              <>
                {searchResults.map((result: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => { router.push(result.href); setShowSearch(false); setSearchQuery(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                  >
                    <span className="text-lg">{result.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{result.label}</p>
                      {result.sub && <p className="text-xs text-gray-400">{result.sub}</p>}
                      <p className="text-xs text-blue-400 capitalize">{result.type}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-gray-100 rounded-xl transition">
            <Bell size={18} className={notifications.length > 0 ? "text-blue-600" : "text-gray-500"} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50" style={{ width: "340px" }}>
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-800 text-sm">Reminders</h3>
                  {notifications.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>}
                </div>
                {notifications.length > 0 && (
                  <button onClick={() => { notifications.forEach((n: any) => dismissNotification(n.id)); setShowNotifications(false); }} className="text-xs text-blue-500 font-medium">Dismiss all</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Bell size={28} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">No active reminders</p>
                    <p className="text-xs text-gray-300 mt-0.5">Reminders appear when events are about to start</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 bg-blue-50/50">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${notif.diffMins < 5 ? "bg-red-500 animate-pulse" : "bg-blue-500"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-800 truncate">{notif.title}</p>
                          <button onClick={() => dismissNotification(notif.id)} className="text-gray-300 hover:text-gray-500 ml-2 shrink-0"><X size={12} /></button>
                        </div>
                        <p className="text-xs text-gray-500">{notif.type}</p>
                        <p className={`text-xs font-bold mt-1 ${notif.diffMins < 5 ? "text-red-600" : "text-blue-600"}`}>⏰ {notif.timeLabel}</p>
                        {notif.startTime && <p className="text-xs text-gray-400">🕐 {notif.startTime}{notif.endTime ? ` - ${notif.endTime}` : ""}</p>}
                        {notif.location && <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={9} />{notif.location}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                <button onClick={() => { router.push("/calendar"); setShowNotifications(false); }} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Open Calendar →</button>
              </div>
            </div>
          )}
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-xl transition" onClick={() => router.push("/settings")}>
          <Settings size={18} className="text-gray-500" />
        </button>

        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {displayInitial}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700 max-w-[90px] truncate leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400">{user?.role || "Member"}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl ml-1 transition">
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
}

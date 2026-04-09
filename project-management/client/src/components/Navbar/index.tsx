"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, Settings, LogOut, X, MapPin, Sun, Moon, Menu } from "lucide-react";
import { useGetAllCalendarEventsQuery, useGetProjectsQuery, useGetUsersQuery } from "@/state/api";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [now, setNow] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: events = [] } = useGetAllCalendarEventsQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
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

  const searchResults = searchQuery.trim().length > 1 ? [
    ...projects.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3).map((p: any) => ({ type: "project", label: p.name, href: `/projects/${p.id}`, icon: "📁" })),
    ...users.filter((u: any) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3).map((u: any) => ({ type: "user", label: u.username, sub: u.email, href: "/users", icon: "👤" })),
  ] : [];

  const notifications = events
    .filter((e: any) => !dismissed.includes(e.id) && e.reminder)
    .map((e: any) => {
      try {
        const datePart = e.date.split("T")[0];
        const [year, month, day] = datePart.split("-").map(Number);
        let eventDateTime: Date;
        if (e.startTime) {
          const [hours, minutes] = e.startTime.split(":").map(Number);
          eventDateTime = new Date(year, month - 1, day, hours, minutes, 0);
        } else {
          eventDateTime = new Date(year, month - 1, day, 9, 0, 0);
        }
        const reminderMs = Number(e.reminder) * 60 * 1000;
        const reminderStart = new Date(eventDateTime.getTime() - reminderMs);
        const isInWindow = now >= reminderStart && now <= eventDateTime;
        if (!isInWindow) return null;
        const diffMs = eventDateTime.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);
        let timeLabel: string;
        if (diffMins <= 0) timeLabel = "Starting now!";
        else if (diffMins < 60) timeLabel = `In ${Math.round(diffMins)} min`;
        else timeLabel = `In ${Math.round(diffMins / 60)}h`;
        return { ...e, eventDateTime, diffMins, timeLabel };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

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
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-3 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-20 transition-colors duration-200 gap-2">

      {/* Left: Hamburger (mobile) + Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 dark:text-gray-400 shrink-0"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-xs" ref={searchRef}>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700 focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-750 transition">
            <Search className="text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="bg-transparent outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setShowSearch(false); }}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery.trim().length > 1 && (
            <div className="absolute top-full mt-2 left-0 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No results for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((result: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => { router.push(result.href); setShowSearch(false); setSearchQuery(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left border-b border-gray-50 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-lg">{result.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{result.label}</p>
                      {result.sub && <p className="text-xs text-gray-400 dark:text-gray-500">{result.sub}</p>}
                      <p className="text-xs text-blue-400 capitalize">{result.type}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="relative w-[18px] h-[18px]">
            <Sun size={18} className={`absolute inset-0 text-amber-500 transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
            <Moon size={18} className={`absolute inset-0 text-slate-500 dark:text-slate-400 transition-all duration-300 ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
          </div>
        </button>

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <Bell size={18} className={notifications.length > 0 ? "text-blue-600" : "text-gray-500 dark:text-gray-400"} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 w-[min(340px,calc(100vw-1rem))]">
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Reminders</h3>
                  {notifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={() => { notifications.forEach((n: any) => dismissNotification(n.id)); setShowNotifications(false); }}
                    className="text-xs text-blue-500 font-medium"
                  >
                    Dismiss all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Bell size={28} className="mx-auto mb-2 text-gray-200 dark:text-gray-600" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No active reminders</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Reminders appear when events are about to start</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${notif.diffMins < 5 ? "bg-red-500 animate-pulse" : "bg-blue-500"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{notif.title}</p>
                          <button onClick={() => dismissNotification(notif.id)} className="text-gray-300 dark:text-gray-600 hover:text-gray-500 ml-2 shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notif.type}</p>
                        <p className={`text-xs font-bold mt-1 ${notif.diffMins < 5 ? "text-red-600" : "text-blue-600"}`}>⏰ {notif.timeLabel}</p>
                        {notif.startTime && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">🕐 {notif.startTime}{notif.endTime ? ` - ${notif.endTime}` : ""}</p>
                        )}
                        {notif.location && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><MapPin size={9} />{notif.location}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
                <button
                  onClick={() => { router.push("/calendar"); setShowNotifications(false); }}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                >
                  Open Calendar →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings — hidden on very small screens */}
        <button
          className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          onClick={() => router.push("/settings")}
        >
          <Settings size={18} className="text-gray-500 dark:text-gray-400" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 ml-1 pl-2 sm:pl-3 border-l border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {displayInitial}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[90px] truncate leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user?.role || "Member"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 sm:px-3 py-1.5 rounded-xl ml-1 transition"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
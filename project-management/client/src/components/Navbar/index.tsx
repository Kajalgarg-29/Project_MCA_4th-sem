"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, Settings, LogOut, X, MapPin, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useGetAllCalendarEventsQuery, useGetProjectsQuery, useGetUsersQuery } from "@/state/api";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [user, setUser]                       = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissed, setDismissed]             = useState<number[]>([]);
  const [now, setNow]                         = useState(new Date());
  const [searchQuery, setSearchQuery]         = useState("");
  const [showSearch, setShowSearch]           = useState(false);
  const [isDark, setIsDark]                   = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const notifRef       = useRef<HTMLDivElement>(null);
  const searchRef      = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const { data: events   = [] } = useGetAllCalendarEventsQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users    = [] } = useGetUsersQuery();

  /* ── Theme ── */
  useEffect(() => {
    const savedTheme  = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark        = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  /* ── Clock tick ── */
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── Restore user & dismissed ── */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) try { setUser(JSON.parse(stored)); } catch {}
    const d = localStorage.getItem("dismissed_notifications");
    if (d) try { setDismissed(JSON.parse(d)); } catch {}
  }, []);

  /* ── Click-outside to close dropdowns ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current       && !notifRef.current.contains(e.target as Node))       setShowNotifications(false);
      if (searchRef.current      && !searchRef.current.contains(e.target as Node))      setShowSearch(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) setShowMobileSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Search ── */
  const searchResults = searchQuery.trim().length > 1 ? [
    ...projects
      .filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((p: any) => ({ type: "project", label: p.name, href: `/projects/${p.id}`, icon: "📁" })),
    ...users
      .filter((u: any) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((u: any) => ({ type: "user", label: u.username, sub: u.email, href: "/users", icon: "👤" })),
  ] : [];

  /* ── Notifications ── */
  const notifications = events
    .filter((e: any) => !dismissed.includes(e.id) && e.reminder)
    .map((e: any) => {
      try {
        const [year, month, day] = e.date.split("T")[0].split("-").map(Number);
        const eventDateTime = e.startTime
          ? (() => { const [h, m] = e.startTime.split(":").map(Number); return new Date(year, month - 1, day, h, m, 0); })()
          : new Date(year, month - 1, day, 9, 0, 0);
        const reminderMs    = Number(e.reminder) * 60 * 1000;
        const reminderStart = new Date(eventDateTime.getTime() - reminderMs);
        if (!(now >= reminderStart && now <= eventDateTime)) return null;
        const diffMins = (eventDateTime.getTime() - now.getTime()) / 60000;
        const timeLabel = diffMins <= 0 ? "Starting now!" : diffMins < 60 ? `In ${Math.round(diffMins)} min` : `In ${Math.round(diffMins / 60)}h`;
        return { ...e, eventDateTime, diffMins, timeLabel };
      } catch { return null; }
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

  const displayName    = user?.username || session?.user?.name || "User";
  const displayInitial = displayName?.[0]?.toUpperCase() || "U";

  /* ── Shared search dropdown ── */
  const SearchDropdown = () => (
    <div className="absolute top-full mt-2 left-0 w-[min(320px,calc(100vw-2rem))] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
      {searchResults.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          No results for "{searchQuery}"
        </div>
      ) : (
        searchResults.map((result: any, idx: number) => (
          <button
            key={idx}
            onClick={() => { router.push(result.href); setShowSearch(false); setShowMobileSearch(false); setSearchQuery(""); }}
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
  );

  return (
    <>
      {/* ════════════════════════════════════════
          Main navbar bar
      ════════════════════════════════════════ */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-3 sm:px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-20 transition-colors duration-200 gap-2">

        {/* ── Left: Hamburger + Desktop Search ── */}
        <div className="flex items-center gap-2 flex-1 min-w-0">

          {/* Hamburger — mobile/tablet only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 dark:text-gray-400 shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Desktop search — md+ */}
          <div className="relative hidden md:block flex-1 max-w-xs" ref={searchRef}>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700 focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-750 transition">
              <Search className="text-gray-400 shrink-0" size={15} />
              <input
                type="text"
                placeholder="Search projects, users…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="bg-transparent outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowSearch(false); }}>
                  <X size={13} className="text-gray-400" />
                </button>
              )}
            </div>
            {showSearch && searchQuery.trim().length > 1 && <SearchDropdown />}
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

          {/* Mobile search icon — shows on < md */}
          <button
            onClick={() => setShowMobileSearch(v => !v)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 dark:text-gray-400"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="relative w-[18px] h-[18px]">
              <Sun  size={18} className={`absolute inset-0 text-amber-500 transition-all duration-300 ${isDark  ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
              <Moon size={18} className={`absolute inset-0 text-slate-500 dark:text-slate-400 transition-all duration-300 ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
            </div>
          </button>

          {/* Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              aria-label="Notifications"
            >
              <Bell size={18} className={notifications.length > 0 ? "text-blue-600" : "text-gray-500 dark:text-gray-400"} />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 sm:left-auto top-[56px] sm:top-full sm:mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[100] sm:w-[340px]">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Bell size={13} className="text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Reminders</h3>
                    {notifications.length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>
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

                {/* Body */}
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-7 px-4">
                      <Bell size={26} className="mx-auto mb-2 text-gray-200 dark:text-gray-600" />
                      <p className="text-sm text-gray-400 dark:text-gray-500">No active reminders</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Reminders appear when events are about to start</p>
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div key={notif.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${notif.diffMins < 5 ? "bg-red-500 animate-pulse" : "bg-blue-500"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate pr-1">{notif.title}</p>
                            <button onClick={() => dismissNotification(notif.id)} className="text-gray-300 dark:text-gray-600 hover:text-gray-500 shrink-0"><X size={12} /></button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{notif.type}</p>
                          <p className={`text-xs font-bold mt-1 ${notif.diffMins < 5 ? "text-red-600" : "text-blue-600"}`}>⏰ {notif.timeLabel}</p>
                          {notif.startTime && <p className="text-xs text-gray-400 dark:text-gray-500">🕐 {notif.startTime}{notif.endTime ? ` - ${notif.endTime}` : ""}</p>}
                          {notif.location  && <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><MapPin size={9} />{notif.location}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
                  <button onClick={() => { router.push("/calendar"); setShowNotifications(false); }} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                    Open Calendar →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings — hidden on xs, shown on sm+ */}
          <button
            className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
            onClick={() => router.push("/settings")}
            aria-label="Settings"
          >
            <Settings size={18} className="text-gray-500 dark:text-gray-400" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-100 dark:bg-gray-700 mx-0.5 sm:mx-1" />

          {/* User avatar + name */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {displayInitial}
            </div>
            {/* Name — shown on lg+ */}
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[90px] truncate leading-tight">{displayName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{user?.role || "Member"}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 sm:px-3 sm:py-1.5 rounded-xl transition ml-0.5"
            aria-label="Logout"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          Mobile search bar — slides in below navbar
      ════════════════════════════════════════ */}
      {showMobileSearch && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-3 py-2.5 relative z-10" ref={mobileSearchRef}>
          <div className="relative">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-gray-700 focus-within:border-blue-300 transition">
              <Search className="text-gray-400 shrink-0" size={15} />
              <input
                type="text"
                placeholder="Search projects, users…"
                value={searchQuery}
                autoFocus
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="bg-transparent outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
              <button onClick={() => { setSearchQuery(""); setShowMobileSearch(false); setShowSearch(false); }}>
                <X size={14} className="text-gray-400" />
              </button>
            </div>
            {showSearch && searchQuery.trim().length > 1 && <SearchDropdown />}
          </div>
        </div>
      )}
    </>
  );
}
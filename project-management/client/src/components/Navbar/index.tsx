"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, Settings, LogOut, X, MapPin, Users } from "lucide-react";
import { useGetAllCalendarEventsQuery } from "@/state/api";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [now, setNow] = useState(new Date());
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: events = [] } = useGetAllCalendarEventsQuery();

  // Update time every minute
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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ONLY show notification if current time is within reminder window
  const notifications = events
    .filter((e: any) => !dismissed.includes(e.id) && e.reminder)
    .map((e: any) => {
      const dateStr = e.date.split("T")[0];
      // Build exact event datetime
      const eventDateTime = e.startTime
        ? new Date(`${dateStr}T${e.startTime}:00`)
        : new Date(`${dateStr}T09:00:00`);

      const reminderMinutes = Number(e.reminder);
      const reminderStart = new Date(eventDateTime.getTime() - reminderMinutes * 60 * 1000);
      const diffMins = (eventDateTime.getTime() - now.getTime()) / (1000 * 60);

      // Only show if: current time is AFTER reminder window start AND event hasn't passed yet
      const isInWindow = now >= reminderStart && now <= eventDateTime;
      if (!isInWindow) return null;

      let timeLabel = "";
      if (diffMins < 1) timeLabel = "Starting now!";
      else if (diffMins < 60) timeLabel = `In ${Math.round(diffMins)} min`;
      else timeLabel = `In ${Math.round(diffMins / 60)}h`;

      return { ...e, eventDateTime, diffMins, timeLabel };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.diffMins - b.diffMins);

  const dismissNotification = (id: number) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    const allIds = notifications.map((n: any) => n.id);
    const updated = [...dismissed, ...allIds];
    setDismissed(updated);
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
    setShowNotifications(false);
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

  const getUrgencyColor = (diffMins: number) => {
    if (diffMins < 5) return { dot: "bg-red-500 animate-pulse", text: "text-red-600", bg: "bg-red-50 border-red-100" };
    if (diffMins < 30) return { dot: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50 border-orange-100" };
    return { dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50 border-blue-100" };
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-100 shrink-0 relative z-20">
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 w-72 border border-gray-100">
        <Search className="text-gray-400 shrink-0" size={16} />
        <input
          type="text"
          placeholder="Search projects, tasks..."
          className="bg-transparent outline-none text-sm w-full text-gray-600 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Bell size={18} className={notifications.length > 0 ? "text-blue-600" : "text-gray-500"} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-88 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50" style={{ width: "360px" }}>
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-800 text-sm">Reminders</h3>
                  {notifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Dismiss all</button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Bell size={32} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400 font-medium">No active reminder</p>
                    <p className="text-xs text-gray-300 mt-1">Reminders appear when events are about to start</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const colors = getUrgencyColor(notif.diffMins);
                    return (
                      <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 border ${colors.bg}`}>
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-bold text-gray-800 truncate">{notif.title}</p>
                            <button onClick={() => dismissNotification(notif.id)} className="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5">
                              <X size={13} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">{notif.type}</p>
                          <p className={`text-xs font-bold mt-1 ${colors.text}`}>⏰ {notif.timeLabel}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {notif.startTime && (
                              <span className="text-xs text-gray-400">🕐 {notif.startTime}{notif.endTime ? ` - ${notif.endTime}` : ""}</span>
                            )}
                            {notif.location && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin size={10} /> {notif.location}
                              </span>
                            )}
                          </div>
                          {notif.attendees && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Users size={10} /> {notif.attendees}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
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

        <button className="p-2 hover:bg-gray-100 rounded-lg transition" onClick={() => router.push("/settings")}>
          <Settings size={18} className="text-gray-500" />
        </button>

        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {displayInitial}
          </div>
          <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{displayName}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg ml-1 transition"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}

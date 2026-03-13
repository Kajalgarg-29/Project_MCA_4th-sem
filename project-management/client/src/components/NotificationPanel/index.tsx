"use client";

import { useRef, useEffect } from "react";
import { Bell, X, CheckCheck, Trash2, AlertCircle, Clock, UserCheck } from "lucide-react";
import { useNotifications, Notification } from "@/context/NotificationContext";

const TYPE_CONFIG = {
  overdue:   { icon: AlertCircle, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  due_today: { icon: Clock,       color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  assigned:  { icon: UserCheck,   color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20",  badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
};

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[notif.type];
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => onRead(notif.id)}
      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        notif.read ? "opacity-60" : cfg.bg
      } hover:opacity-100`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
            {notif.title}
          </span>
          {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{notif.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {notif.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-gray-700 dark:text-gray-300" />
          <span className="font-semibold text-gray-800 dark:text-gray-100">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} title="Mark all read"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <CheckCheck size={16} className="text-blue-500" />
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} title="Clear all"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <Trash2 size={16} className="text-gray-400" />
            </button>
          )}
          <button onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto p-3 space-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotifItem key={n.id} notif={n} onRead={markAsRead} />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-center">
          <span className="text-xs text-gray-400">{notifications.length} total · {unreadCount} unread</span>
        </div>
      )}
    </div>
  );
}

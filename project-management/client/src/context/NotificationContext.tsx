"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useGetUsersQuery } from "@/state/api";

export type NotificationType = "overdue" | "due_today" | "assigned";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: users = [] } = useGetUsersQuery();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    // Fetch ALL tasks directly (no projectId filter)
       fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks`)
      .then(r => r.json())
      .then((tasks: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newNotifs: Notification[] = [];

        tasks.forEach((task: any) => {
          // Assigned notification for every task with assignee
          if (task.assignedUserId) {
            const assignee = users.find((u: any) => u.userId === task.assignedUserId);
            const name = assignee?.username || `User #${task.assignedUserId}`;
            newNotifs.push({
              id: `assigned-${task.id}`,
              type: "assigned",
              title: "Task Assigned",
              message: `"${task.title}" is assigned to ${name}`,
              read: false,
              createdAt: new Date(),
            });
          }

          if (!task.dueDate) return;

          const due = new Date(task.dueDate);
          due.setHours(0, 0, 0, 0);

          if (due < today && task.status !== "Completed") {
            newNotifs.push({
              id: `overdue-${task.id}`,
              type: "overdue",
              title: "Task Overdue",
              message: `"${task.title}" was due on ${due.toLocaleDateString("en-IN")}`,
              read: false,
              createdAt: new Date(),
            });
          } else if (due.getTime() === today.getTime() && task.status !== "Completed") {
            newNotifs.push({
              id: `due_today-${task.id}`,
              type: "due_today",
              title: "Due Today",
              message: `"${task.title}" is due today!`,
              read: false,
              createdAt: new Date(),
            });
          }
        });

        setNotifications(newNotifs);
        setLoaded(true);
      })
      .catch(err => console.error("Notification fetch error:", err));
  }, [users, loaded]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setLoaded(false); // allow reload
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

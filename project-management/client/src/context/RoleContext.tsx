"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Role = "Admin" | "Manager" | "Member";

interface RoleContextType {
  role: Role;
  userId: number | null;
  username: string;
  email: string;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  can: (action: string) => boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: "Member",
  userId: null,
  username: "",
  email: "",
  isAdmin: false,
  isManager: false,
  isMember: true,
  can: () => false,
});

// Define what each role can do
const PERMISSIONS: Record<Role, string[]> = {
  Admin: [
    "view_all", "manage_users", "change_roles", "delete_users",
    "manage_projects", "delete_projects", "manage_tasks", "delete_tasks",
    "manage_teams", "manage_campaigns", "view_reports", "export_reports",
    "manage_attendance", "view_all_attendance", "manage_settings",
    "view_analytics", "manage_events",
  ],
  Manager: [
    "view_all", "manage_projects", "manage_tasks", "delete_tasks",
    "manage_teams", "manage_campaigns", "view_reports", "export_reports",
    "view_all_attendance", "view_analytics", "manage_events",
  ],
  Member: [
    "view_projects", "manage_tasks", "view_campaigns",
    "view_own_attendance", "manage_own_attendance", "manage_events",
  ],
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("Member");
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setRole((user.role as Role) || "Member");
        setUserId(user.userId || null);
        setUsername(user.username || "");
        setEmail(user.email || "");
      } catch {}
    }
  }, []);

  const can = (action: string) => {
    return PERMISSIONS[role]?.includes(action) || false;
  };

  return (
    <RoleContext.Provider value={{
      role,
      userId,
      username,
      email,
      isAdmin: role === "Admin",
      isManager: role === "Manager",
      isMember: role === "Member",
      can,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);

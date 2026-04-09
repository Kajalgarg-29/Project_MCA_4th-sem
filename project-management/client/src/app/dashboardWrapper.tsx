"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !session) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [status, session, router]);

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Sidebar receives open state + toggle handler */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar width on desktop only */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
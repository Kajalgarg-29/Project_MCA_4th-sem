"use client";

import { Search, Bell, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2 w-72">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search projects, tasks..."
          className="bg-transparent outline-none text-sm w-full text-gray-600"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Settings size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.username || "User"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { Settings, User, Bell, Shield, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your preferences</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User size={18} /> Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Username</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Your username" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Your email" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell size={18} /> Notifications</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive updates via email</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition ${notifications ? "bg-blue-600" : "bg-gray-200"} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${notifications ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield size={18} /> Security</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">New Password</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="••••••••" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

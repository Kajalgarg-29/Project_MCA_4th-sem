"use client";
import { useState, useEffect } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetUsersQuery, useUpdateUserMutation } from "@/state/api";
import { User, Bell, Shield, Moon, Sun, Save, Camera, Key, Palette } from "lucide-react";

export default function SettingsPage() {
  const { data: users = [] } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        setProfileForm({ username: u.username || "", email: u.email || "" });
      } catch {}
    }
    const dm = localStorage.getItem("darkMode") === "true";
    setDarkMode(dm);
    if (dm) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem("darkMode", String(newVal));
    if (newVal) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    await updateUser({ userId: currentUser.userId, data: profileForm });
    const updated = { ...currentUser, ...profileForm };
    localStorage.setItem("user", JSON.stringify(updated));
    setCurrentUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <DashboardWrapper>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your account preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="w-48 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-0.5
                    ${activeTab === tab.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-5">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {currentUser?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Camera size={13} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{currentUser?.username}</p>
                    <p className="text-sm text-gray-400">{currentUser?.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
                      ${currentUser?.role === "Admin" ? "bg-red-100 text-red-600" :
                        currentUser?.role === "Manager" ? "bg-purple-100 text-purple-600" :
                        "bg-gray-100 text-gray-500"}`}>
                      {currentUser?.role || "Member"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Role</label>
                    <input
                      type="text"
                      value={currentUser?.role || "Member"}
                      disabled
                      className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Role can only be changed by Admin</p>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition
                      ${saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    <Save size={15} />
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-5">Appearance</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-yellow-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                        <p className="text-xs text-gray-400">Switch between light and dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${darkMode ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-800 mb-3">Theme Preview</p>
                    <div className={`rounded-xl p-4 border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                      <div className={`text-sm font-medium mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>ManageX Dashboard</div>
                      <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>This is how your app will look</div>
                      <div className="flex gap-2 mt-2">
                        <div className="w-16 h-6 bg-blue-500 rounded-lg" />
                        <div className={`w-16 h-6 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-5">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: "In-app notifications", desc: "Show bell icon alerts for events and reminders", value: notifications, set: setNotifications },
                    { label: "Email notifications", desc: "Receive updates and reminders via email", value: emailNotifs, set: setEmailNotifs },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${item.value ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${item.value ? "left-6" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-5">Security Settings</h2>
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-4">Password updated successfully!</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPass}
                      onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat new password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPasswordError("");
                      if (!passwordForm.current) return setPasswordError("Enter current password");
                      if (passwordForm.newPass.length < 6) return setPasswordError("New password must be 6+ characters");
                      if (passwordForm.newPass !== passwordForm.confirm) return setPasswordError("Passwords do not match");
                      setPasswordSuccess(true);
                      setPasswordForm({ current: "", newPass: "", confirm: "" });
                      setTimeout(() => setPasswordSuccess(false), 3000);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700"
                  >
                    <Key size={15} /> Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

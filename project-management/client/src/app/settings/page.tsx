"use client";
import { useState, useEffect } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { useGetUsersQuery, useUpdateUserMutation } from "@/state/api";
import { User, Bell, Shield, Moon, Sun, Save, Camera, Key, Palette, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const { data: users = [] } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  const [currentUser, setCurrentUser]     = useState<any>(null);
  const [darkMode, setDarkMode]           = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs]     = useState(false);
  const [activeTab, setActiveTab]         = useState("profile");
  const [saved, setSaved]                 = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profileForm, setProfileForm]     = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm]   = useState({ current: "", newPass: "", confirm: "" });
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
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "profile",       label: "Profile",        icon: User,    desc: "Name & email" },
    { id: "appearance",    label: "Appearance",     icon: Palette, desc: "Theme & display" },
    { id: "notifications", label: "Notifications",  icon: Bell,    desc: "Alerts & emails" },
    { id: "security",      label: "Security",       icon: Shield,  desc: "Password & access" },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${value ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );

  const InputField = ({ label, type = "text", value, onChange, placeholder, disabled = false, hint = "" }: any) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all
          ${disabled
            ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-200 bg-white text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300"
          }`}
      />
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );

  const roleColors: Record<string, string> = {
    Admin:   "bg-red-100 text-red-600 border-red-200",
    Manager: "bg-violet-100 text-violet-600 border-violet-200",
    Member:  "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <DashboardWrapper>
      <div className="min-h-screen bg-gray-50/60">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* Page header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your account, appearance, and security preferences.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

            {/* ── Sidebar (desktop) / Tab bar (mobile) ── */}

            {/* Mobile: horizontal scrolling pill tabs */}
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border shrink-0
                      ${activeTab === tab.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                      }`}
                  >
                    <tab.icon size={15} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sticky top-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 group
                      ${activeTab === tab.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                      ${activeTab === tab.id ? "bg-blue-100" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                      <tab.icon size={15} className={activeTab === tab.id ? "text-blue-600" : "text-gray-500"} />
                    </div>
                    <div className="text-left">
                      <p className="leading-tight">{tab.label}</p>
                      <p className={`text-xs font-normal leading-tight mt-0.5 ${activeTab === tab.id ? "text-blue-400" : "text-gray-400"}`}>{tab.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0">

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Card top bar */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-20 sm:h-24 relative" />

                  {/* Avatar + user info — overlaps the gradient */}
                  <div className="px-5 sm:px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 mb-6">
                      <div className="relative self-start">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                          {currentUser?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center shadow-md transition">
                          <Camera size={13} className="text-white" />
                        </button>
                      </div>
                      <div className="pb-1 min-w-0">
                        <p className="font-bold text-gray-900 text-lg leading-tight truncate">{currentUser?.username || "—"}</p>
                        <p className="text-sm text-gray-400 truncate">{currentUser?.email || "—"}</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium mt-1.5 inline-block border ${roleColors[currentUser?.role] || roleColors.Member}`}>
                          {currentUser?.role || "Member"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <InputField label="Username" value={profileForm.username} onChange={(e: any) => setProfileForm(f => ({ ...f, username: e.target.value }))} placeholder="johndoe" />
                      <InputField label="Email Address" type="email" value={profileForm.email} onChange={(e: any) => setProfileForm(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" />
                      <InputField label="Role" value={currentUser?.role || "Member"} disabled hint="Role can only be changed by an Admin." />

                      <div className="pt-2">
                        <button
                          onClick={handleSaveProfile}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm
                            ${saved ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"}`}
                        >
                          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                          {saved ? "Saved!" : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Appearance</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Personalise how ManageX looks and feels.</p>
                  </div>

                  {/* Dark mode toggle */}
                  <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-100" : "bg-yellow-100"}`}>
                        {darkMode ? <Moon size={18} className="text-indigo-600" /> : <Sun size={18} className="text-yellow-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Dark Mode</p>
                        <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark theme</p>
                      </div>
                    </div>
                    <Toggle value={darkMode} onChange={toggleDarkMode} />
                  </div>

                  {/* Theme preview */}
                  <div className="p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
                    <div className={`rounded-xl p-4 sm:p-5 border transition-all ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>ManageX Dashboard</div>
                      <div className={`text-xs mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>This is how your interface will look</div>
                      <div className="flex gap-2">
                        <div className="h-7 w-20 bg-blue-500 rounded-lg" />
                        <div className={`h-7 w-20 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Notifications</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Choose what alerts and updates you receive.</p>
                  </div>

                  {[
                    {
                      icon: Bell,
                      iconBg: "bg-blue-100",
                      iconColor: "text-blue-600",
                      label: "In-app notifications",
                      desc: "Show bell icon alerts for events and reminders",
                      value: notifications,
                      set: setNotifications,
                    },
                    {
                      icon: Mail,
                      iconBg: "bg-purple-100",
                      iconColor: "text-purple-600",
                      label: "Email notifications",
                      desc: "Receive updates and reminders via email",
                      value: emailNotifs,
                      set: setEmailNotifs,
                    },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          <item.icon size={17} className={item.iconColor} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle value={item.value} onChange={() => item.set(!item.value)} />
                    </div>
                  ))}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Security</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Keep your account safe by updating your password regularly.</p>
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle size={16} className="shrink-0" />{passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                      <CheckCircle2 size={16} className="shrink-0" />Password updated successfully!
                    </div>
                  )}

                  <div className="space-y-4">
                    <InputField label="Current Password" type="password" value={passwordForm.current} onChange={(e: any) => setPasswordForm(f => ({ ...f, current: e.target.value }))} placeholder="Enter current password" />
                    <InputField label="New Password" type="password" value={passwordForm.newPass} onChange={(e: any) => setPasswordForm(f => ({ ...f, newPass: e.target.value }))} placeholder="Min 6 characters" />
                    <InputField label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={(e: any) => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" />

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setPasswordError("");
                          if (!passwordForm.current) return setPasswordError("Enter your current password");
                          if (passwordForm.newPass.length < 6) return setPasswordError("New password must be at least 6 characters");
                          if (passwordForm.newPass !== passwordForm.confirm) return setPasswordError("Passwords do not match");
                          setPasswordSuccess(true);
                          setPasswordForm({ current: "", newPass: "", confirm: "" });
                          setTimeout(() => setPasswordSuccess(false), 3000);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-100"
                      >
                        <Key size={15} /> Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

// tiny Mail icon used in notifications (lucide doesn't export Mail by default in all versions)
function Mail(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
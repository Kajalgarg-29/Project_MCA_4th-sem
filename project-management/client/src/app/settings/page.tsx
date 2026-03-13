"use client";
import { useState } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import { Settings, User, Bell, Shield, Palette, Globe, Save, Check } from "lucide-react";

function SettingsContent() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    appName: "ManageX",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    emailNotifications: true,
    taskReminders: true,
    campaignAlerts: true,
    weeklyReport: false,
    twoFactor: false,
    sessionTimeout: "30",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-blue-600" : "bg-gray-200"}`}>
      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${value ? "translate-x-5" : "translate-x-0.5"}`} style={{ width: 18, height: 18 }} />
    </button>
  );

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon size={16} className="text-blue-600" />
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, sub, children }: any) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-0 -m-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Settings</h1>
            <p className="text-xs text-gray-400">Configure your ProjectHub workspace</p>
          </div>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
          {saved ? <><Check size={15} />Saved!</> : <><Save size={15} />Save Changes</>}
        </button>
      </div>

      <div className="p-6 max-w-2xl space-y-5">
        <Section icon={Globe} title="General">
          <Field label="App Name" sub="Displayed in the sidebar and browser tab">
            <input value={form.appName} onChange={e => setForm(f => ({ ...f, appName: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
          <Field label="Timezone" sub="Used for dates and reminders">
            <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
            </select>
          </Field>
          <Field label="Date Format">
            <select value={form.dateFormat} onChange={e => setForm(f => ({ ...f, dateFormat: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </Field>
          <Field label="Currency" sub="Used in budget and analytics">
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </Field>
        </Section>

        <Section icon={Bell} title="Notifications">
          <Field label="Email Notifications" sub="Receive updates via email">
            <Toggle value={form.emailNotifications} onChange={() => setForm(f => ({ ...f, emailNotifications: !f.emailNotifications }))} />
          </Field>
          <Field label="Task Reminders" sub="Alerts for upcoming task due dates">
            <Toggle value={form.taskReminders} onChange={() => setForm(f => ({ ...f, taskReminders: !f.taskReminders }))} />
          </Field>
          <Field label="Campaign Alerts" sub="Notify when campaigns go live or end">
            <Toggle value={form.campaignAlerts} onChange={() => setForm(f => ({ ...f, campaignAlerts: !f.campaignAlerts }))} />
          </Field>
          <Field label="Weekly Summary Report" sub="Receive a report every Monday">
            <Toggle value={form.weeklyReport} onChange={() => setForm(f => ({ ...f, weeklyReport: !f.weeklyReport }))} />
          </Field>
        </Section>

        <Section icon={Shield} title="Security">
          <Field label="Two-Factor Authentication" sub="Add an extra layer of security">
            <Toggle value={form.twoFactor} onChange={() => setForm(f => ({ ...f, twoFactor: !f.twoFactor }))} />
          </Field>
          <Field label="Session Timeout" sub="Auto-logout after inactivity (minutes)">
            <select value={form.sessionTimeout} onChange={e => setForm(f => ({ ...f, sessionTimeout: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="480">8 hours</option>
            </select>
          </Field>
        </Section>

        <Section icon={User} title="Profile">
          <Field label="Display Name">
            <input defaultValue="Admin" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
          <Field label="Role">
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Admin</option>
              <option>Manager</option>
              <option>Marketer</option>
              <option>Viewer</option>
            </select>
          </Field>
        </Section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <DashboardWrapper><SettingsContent /></DashboardWrapper>;
}

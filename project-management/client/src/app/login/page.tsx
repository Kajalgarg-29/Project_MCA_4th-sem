"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token) { router.push("/"); return; }
    if (status === "authenticated" && session) { router.push("/"); return; }
  }, [session, status, router]);

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields");
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Please enter a valid email address");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Invalid email or password");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/" });

  if (status === "loading" || !mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f0f4ff;
        }

        /* ── Left Panel ── */
        .lp-left {
          display: none;
          width: 44%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 75%, #3b82f6 100%);
          padding: 52px 56px;
          flex-direction: column;
          justify-content: space-between;
        }
        @media (min-width: 1024px) { .lp-left { display: flex; } }

        .lp-left-circle1 {
          position: absolute; top: -100px; right: -100px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .lp-left-circle2 {
          position: absolute; bottom: -60px; left: -60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }
        .lp-left-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .lp-brand {
          display: flex; align-items: center; gap: 12px;
          position: relative; z-index: 1;
        }
        .lp-brand-icon {
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 20px; color: #fff;
          backdrop-filter: blur(6px);
          letter-spacing: -1px;
        }
        .lp-brand-name {
          font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.4px;
        }

        .lp-hero { position: relative; z-index: 1; }
        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 500;
          margin-bottom: 22px;
          backdrop-filter: blur(6px);
        }
        .lp-hero-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
        }
        .lp-hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: 44px; line-height: 1.13;
          color: #fff; margin-bottom: 18px;
        }
        .lp-hero-title em {
          font-style: italic; color: rgba(255,255,255,0.6);
        }
        .lp-hero-desc {
          font-size: 15px; color: rgba(255,255,255,0.68);
          line-height: 1.7; max-width: 300px;
        }

        .lp-stats {
          display: flex; gap: 36px;
          position: relative; z-index: 1;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .lp-stat-num {
          font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.8px;
        }
        .lp-stat-label {
          font-size: 11px; color: rgba(255,255,255,0.5);
          text-transform: uppercase; letter-spacing: 0.7px; margin-top: 3px;
        }

        /* ── Right Panel ── */
        .lp-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
          background: #f8faff;
          position: relative;
          overflow: hidden;
        }
        .lp-right-dots {
          position: absolute; top: 0; right: 0;
          width: 200px; height: 200px;
          background-image: radial-gradient(circle, #c7d7fe 1.5px, transparent 1.5px);
          background-size: 20px 20px;
          opacity: 0.6;
          pointer-events: none;
        }
        .lp-right-dots2 {
          position: absolute; bottom: 0; left: 0;
          width: 160px; height: 160px;
          background-image: radial-gradient(circle, #c7d7fe 1.5px, transparent 1.5px);
          background-size: 20px 20px;
          opacity: 0.4;
          pointer-events: none;
        }

        .lp-card {
          width: 100%; max-width: 420px;
          position: relative; z-index: 1;
          animation: lp-fadeup 0.45s cubic-bezier(0.22,1,0.36,1) both 0.05s;
        }
        @keyframes lp-fadeup {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-mobile-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 40px;
        }
        @media (min-width: 1024px) { .lp-mobile-brand { display: none; } }
        .lp-mobile-icon {
          width: 38px; height: 38px; background: #2563eb;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 17px; color: #fff;
        }
        .lp-mobile-name {
          font-size: 18px; font-weight: 700; color: #0f172a;
        }

        .lp-title {
          font-size: 27px; font-weight: 700; color: #0f172a;
          letter-spacing: -0.6px; margin-bottom: 6px;
        }
        .lp-subtitle {
          font-size: 14px; color: #64748b; margin-bottom: 30px; line-height: 1.5;
        }

        .lp-error {
          display: flex; align-items: center; gap: 8px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; padding: 11px 14px;
          border-radius: 10px; font-size: 13.5px; margin-bottom: 20px;
          animation: lp-shake 0.3s ease;
        }
        @keyframes lp-shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        .lp-field { margin-bottom: 16px; }
        .lp-label {
          display: block; font-size: 13px; font-weight: 500;
          color: #334155; margin-bottom: 7px;
        }
        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #0f172a; background: #fff; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        .lp-input::placeholder { color: #94a3b8; }
        .lp-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.13);
        }
        .lp-input.err { border-color: #fca5a5; }
        .lp-input-pr { padding-right: 46px; }

        .lp-eye {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #94a3b8; display: flex; align-items: center;
          padding: 3px; border-radius: 6px;
          transition: color 0.15s;
        }
        .lp-eye:hover { color: #475569; }

        .lp-btn {
          width: 100%; margin-top: 8px;
          background: #2563eb; color: #fff; border: none;
          border-radius: 12px; padding: 13.5px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; letter-spacing: -0.2px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.38);
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-btn:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 6px 22px rgba(37,99,235,0.46);
          transform: translateY(-1px);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .lp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: lp-spin 0.6s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        .lp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 22px 0;
        }
        .lp-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .lp-divider-txt { font-size: 12px; color: #94a3b8; font-weight: 500; white-space: nowrap; }

        .lp-google {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          border: 1.5px solid #e2e8f0; background: #fff;
          border-radius: 12px; padding: 12.5px;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: #374151; cursor: pointer;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
        }
        .lp-google:hover {
          background: #f8faff; border-color: #bfdbfe;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .lp-footer {
          text-align: center; font-size: 13.5px;
          color: #64748b; margin-top: 26px;
        }
        .lp-footer a {
          color: #2563eb; font-weight: 600; text-decoration: none;
        }
        .lp-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="lp-root">

        {/* ── Left decorative panel ── */}
        <div className="lp-left">
          <div className="lp-left-circle1" />
          <div className="lp-left-circle2" />
          <div className="lp-left-grid" />

          <div className="lp-brand">
            <div className="lp-brand-icon">M</div>
            <span className="lp-brand-name">ManageX</span>
          </div>

          <div className="lp-hero">
            <div className="lp-hero-tag">
              <span className="lp-hero-dot" />
              All systems operational
            </div>
            <h1 className="lp-hero-title">
              Manage smarter,<br />
              <em>ship faster.</em>
            </h1>
            <p className="lp-hero-desc">
              Your team's command center — tasks, projects, roles, and real-time collaboration, unified.
            </p>
          </div>

          <div className="lp-stats">
            {[
              { num: "12k+", label: "Teams" },
              { num: "98%",  label: "Uptime" },
              { num: "4.9★", label: "Rating" },
            ].map(s => (
              <div key={s.label}>
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="lp-right">
          <div className="lp-right-dots" />
          <div className="lp-right-dots2" />

          <div className="lp-card">
            <div className="lp-mobile-brand">
              <div className="lp-mobile-icon">M</div>
              <span className="lp-mobile-name">ManageX</span>
            </div>

            <h2 className="lp-title">Sign in to your account</h2>
            <p className="lp-subtitle">Welcome back — let's pick up where you left off.</p>

            {error && (
              <div className="lp-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="lp-field">
              <label className="lp-label">Email address</label>
              <div className="lp-input-wrap">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  autoComplete="email"
                  autoFocus
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className={`lp-input${error ? " err" : ""}`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  autoComplete="current-password"
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className={`lp-input lp-input-pr${error ? " err" : ""}`}
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading} className="lp-btn">
              {loading && <span className="lp-spinner" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span className="lp-divider-txt">or continue with</span>
              <div className="lp-divider-line" />
            </div>

            <button onClick={handleGoogle} className="lp-google">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continue with Google
            </button>

            <p className="lp-footer">
              Don't have an account?{" "}
              <Link href="/register">Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
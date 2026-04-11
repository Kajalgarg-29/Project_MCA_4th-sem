"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatMessage(text: string) {
  let html = text;
  // Section headers like "**Header:**" → styled label
  html = html.replace(/\*\*([^*]+):\*\*/g, '<div class="aria-section-label">$1</div>');
  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="aria-code">$1</code>');
  // Bullet points
  html = html.replace(/^[-•] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>(\n|$))+/g, (m) => `<ul class="aria-ul">${m}</ul>`);
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="aria-ol-item">$1</li>');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="aria-hr"/>');
  // Paragraphs
  html = html.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<ul') || p.startsWith('<div') || p.startsWith('<hr')) return p;
    return `<p class="aria-p">${p}</p>`;
  }).join('');
  return { __html: html };
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

.aria-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: flex-end; justify-content: flex-end;
  padding: 1.5rem; pointer-events: none;
}
.aria-panel {
  pointer-events: all; width: 420px;
  max-width: calc(100vw - 2rem); height: 620px;
  max-height: calc(100vh - 4rem);
  display: flex; flex-direction: column;
  border-radius: 20px; overflow: hidden;
  border: 1px solid rgba(99,102,241,0.25);
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
  background: #0d1117;
  font-family: 'Inter', sans-serif;
  animation: ariaIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes ariaIn {
  from { opacity:0; transform:translateY(20px) scale(0.97); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}

/* ── Header ── */
.aria-header {
  display: flex; align-items: center; gap: 11px;
  padding: 15px 18px;
  background: linear-gradient(135deg, #131929 0%, #0d1117 100%);
  border-bottom: 1px solid rgba(99,102,241,0.12);
  flex-shrink: 0;
}
.aria-logo-wrap {
  width: 38px; height: 38px; border-radius: 11px;
  background: #1a1f3c;
  border: 1px solid rgba(99,102,241,0.35);
  display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0;
}
.aria-logo-wrap::after {
  content: ''; position: absolute; bottom: -2px; right: -2px;
  width: 10px; height: 10px; background: #22c55e;
  border-radius: 50%; border: 2px solid #0d1117;
}
.aria-header-info { flex: 1; min-width: 0; }
.aria-header-name { font-size: 13.5px; font-weight: 600; color: #f1f5f9; }
.aria-header-sub { font-size: 10px; color: #6366f1; margin-top: 1px; letter-spacing: 0.04em; font-weight: 500; }
.aria-badge {
  background: rgba(99,102,241,0.12); color: #818cf8;
  border: 1px solid rgba(99,102,241,0.28);
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
  padding: 3px 8px; border-radius: 5px; text-transform: uppercase;
}
.aria-close {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: #475569; width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.aria-close:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }

/* ── Messages ── */
.aria-messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.aria-messages::-webkit-scrollbar { width: 3px; }
.aria-messages::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 2px; }

.aria-msg-row { display: flex; gap: 9px; align-items: flex-start; }
.aria-msg-row.user { flex-direction: row-reverse; }
.aria-msg-avatar {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; flex-shrink: 0; margin-top: 2px;
}
.aria-msg-avatar.assistant { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
.aria-msg-avatar.user { background: rgba(255,255,255,0.07); color: #94a3b8; }

.aria-bubble {
  max-width: 82%; border-radius: 14px; padding: 11px 14px;
  line-height: 1.65; font-size: 13px;
}
.aria-bubble.assistant {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  color: #cbd5e1; border-bottom-left-radius: 3px;
}
.aria-bubble.user {
  background: linear-gradient(135deg, #4f46e5, #6d28d9);
  color: #f1f5f9; border-bottom-right-radius: 3px;
}
.aria-bubble.error {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: #fca5a5; border-bottom-left-radius: 3px;
}
.aria-bubble strong { color: #a5b4fc; font-weight: 600; }
.aria-section-label {
  font-size: 9.5px; color: #6366f1; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 6px; margin-top: 4px;
}
.aria-section-label:first-child { margin-top: 0; }
.aria-p { margin: 0 0 7px; }
.aria-p:last-child { margin-bottom: 0; }
.aria-ul { margin: 4px 0 7px 0; padding-left: 1.1rem; }
.aria-ul li { margin-bottom: 3px; color: #94a3b8; font-size: 12.5px; }
.aria-hr { border: none; border-top: 1px solid rgba(99,102,241,0.12); margin: 8px 0; }
.aria-code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(99,102,241,0.12); color: #a5b4fc;
  padding: 1px 5px; border-radius: 4px; font-size: 11.5px;
}
.aria-ts { font-size: 9.5px; color: #1e3a5f; margin-top: 3px; padding: 0 3px; }
.aria-msg-row.user .aria-ts { text-align: right; }

/* ── Typing ── */
.aria-typing {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; border-bottom-left-radius: 3px;
  padding: 13px 16px; display: inline-flex; align-items: center; gap: 5px;
}
.aria-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #6366f1;
  animation: ariaDot 1.2s infinite;
}
.aria-dot:nth-child(2) { animation-delay: 0.2s; }
.aria-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes ariaDot {
  0%,60%,100% { opacity:0.25; transform:scale(0.8); }
  30% { opacity:1; transform:scale(1.2); }
}

/* ── Welcome ── */
.aria-welcome {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 20px; flex: 1;
}
.aria-welcome-icon {
  width: 60px; height: 60px; border-radius: 18px;
  background: #1a1f3c; border: 1px solid rgba(99,102,241,0.35);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.aria-welcome-title { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 6px; }
.aria-welcome-desc { font-size: 12.5px; color: #64748b; line-height: 1.6; max-width: 270px; }
.aria-pills { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; margin-top: 16px; }
.aria-pill {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8; font-size: 11px; padding: 4px 11px; border-radius: 16px;
}

/* ── Suggestions ── */
.aria-chips { padding: 12px 14px 0; display: flex; gap: 7px; flex-wrap: wrap; flex-shrink: 0; }
.aria-chip {
  background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.18);
  color: #818cf8; font-size: 11px; font-family: 'Inter', sans-serif;
  padding: 5px 11px; border-radius: 16px; cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.aria-chip:hover { background: rgba(99,102,241,0.16); color: #a5b4fc; border-color: rgba(99,102,241,0.35); }

/* ── Input ── */
.aria-input-area {
  padding: 12px 14px;
  background: rgba(255,255,255,0.015);
  border-top: 1px solid rgba(99,102,241,0.1);
  flex-shrink: 0;
}
.aria-input-row {
  display: flex; align-items: flex-end; gap: 9px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,102,241,0.18);
  border-radius: 12px; padding: 9px 9px 9px 14px;
  transition: border-color 0.15s;
}
.aria-input-row:focus-within { border-color: rgba(99,102,241,0.45); }
.aria-textarea {
  flex: 1; background: transparent; border: none; outline: none;
  color: #f1f5f9; font-family: 'Inter', sans-serif;
  font-size: 13px; line-height: 1.5; resize: none;
  max-height: 100px; scrollbar-width: none;
}
.aria-textarea::placeholder { color: #2d3f5c; }
.aria-send {
  width: 32px; height: 32px; border-radius: 9px; border: none;
  background: linear-gradient(135deg, #4f46e5, #6d28d9); color: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.aria-send:hover:not(:disabled) { transform: scale(1.06); }
.aria-send:disabled { opacity: 0.35; cursor: not-allowed; }
.aria-footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 7px; }
.aria-footer-txt { font-size: 9.5px; color: #1e293b; letter-spacing: 0.03em; }
.aria-clear { background: none; border: none; color: #334155; font-size: 10.5px; font-family: 'Inter', sans-serif; cursor: pointer; padding: 3px 7px; border-radius: 5px; }
.aria-clear:hover { color: #64748b; }

/* ── Trigger ── */
.aria-trigger {
  position: fixed; bottom: 28px; right: 28px; z-index: 9998;
  width: 54px; height: 54px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #4f46e5, #6d28d9); color: white;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(79,70,229,0.5);
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  display: flex; align-items: center; justify-content: center;
}
.aria-trigger:hover { transform: scale(1.09); box-shadow: 0 12px 36px rgba(79,70,229,0.6); }
.aria-trigger:active { transform: scale(0.95); }
.aria-trigger-badge {
  position: absolute; top: -3px; right: -3px;
  width: 14px; height: 14px; background: #22c55e;
  border-radius: 50%; border: 2px solid white;
  animation: ariaP 2s infinite;
}
@keyframes ariaP {
  0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
  50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}
`;

const AriaLogo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5"/>
    <path d="M7 10 C7 7.2 13 7.2 13 10 C13 12.8 7 12.8 7 10Z" fill="#6366f1" opacity="0.5"/>
    <circle cx="10" cy="10" r="2.2" fill="#a5b4fc"/>
    <path d="M10 3.5 L10 5.5M10 14.5 L10 16.5M3.5 10 L5.5 10M14.5 10 L16.5 10" stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

function useStyles() {
  useEffect(() => {
    if (document.getElementById("aria-styles")) return;
    const s = document.createElement("style");
    s.id = "aria-styles";
    s.textContent = STYLES;
    document.head.appendChild(s);
  }, []);
}

const SYSTEM_PROMPT = `You are Aria, an expert AI assistant embedded in ManageX — a digital marketing project management platform.

You specialise in:
- Digital marketing strategy (SEO, PPC, social media, email, content marketing)
- Campaign planning, sprint management, and timelines
- Marketing KPIs, analytics, and performance tracking
- Copywriting briefs, content calendars, brand voice
- Team coordination and workflow optimisation
- Project and task management best practices

Formatting rules (IMPORTANT):
- Use **bold** for key terms and important concepts
- Use **Section Name:** before grouped content to create labeled sections
- Use bullet points (- ) for lists
- Use --- for dividers between major sections
- Keep responses concise and actionable
- Structure longer responses with clear sections

Tone: professional yet friendly, sharp, and practical. You are part of the ManageX platform which has projects, tasks (with priority/status/tags), campaigns, teams, SEO tools, attendance tracking, and analytics.`;

const SUGGESTIONS = [
  "📅 Plan a campaign sprint",
  "📊 Suggest KPIs to track",
  "✍️ Write a content brief",
  "🔁 Improve our workflow",
  "📣 Social media strategy",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const AIChatbot = ({ isOpen, onClose }: ChatbotProps) => {
  useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
  }, [input]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    const snapshot = messages;

    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [
        ...snapshot.map(m => ({ role: m.role, content: m.content })),
        { role: "user" as const, content },
      ];

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: history }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || err.message || `HTTP ${res.status}`);
      }

      const data: any = await res.json();
      const text2 = data?.content?.[0]?.type === "text"
        ? data.content[0].text
        : "I couldn't generate a response. Please try again.";

      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: "assistant", content: text2, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: "assistant", content: `⚠️ ${err.message}`, timestamp: new Date(), isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="aria-overlay">
      <div className="aria-panel">
        <div className="aria-header">
          <div className="aria-logo-wrap"><AriaLogo size={20} /></div>
          <div className="aria-header-info">
            <div className="aria-header-name">Bingo</div>
            <div className="aria-header-sub">Marketing Intelligence</div>
          </div>
          <div className="aria-badge">AI</div>
          <button className="aria-close" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="aria-messages">
          {messages.length === 0 ? (
            <div className="aria-welcome">
              <div className="aria-welcome-icon"><AriaLogo size={28} /></div>
              <div className="aria-welcome-title">Hi, I'm Aria</div>
              <div className="aria-welcome-desc">Your AI co-pilot for digital marketing & project management in ManageX.</div>
              <div className="aria-pills">
                <span className="aria-pill">Campaigns</span>
                <span className="aria-pill">Tasks</span>
                <span className="aria-pill">Analytics</span>
                <span className="aria-pill">Strategy</span>
              </div>
            </div>
          ) : messages.map(msg => (
            <div key={msg.id} className={`aria-msg-row ${msg.role}`}>
              <div className={`aria-msg-avatar ${msg.role}`}>
                {msg.role === "assistant"
                  ? <AriaLogo size={14} />
                  : <span>A</span>}
              </div>
              <div>
                {msg.role === "assistant"
                  ? <div className={`aria-bubble ${msg.isError ? "error" : "assistant"}`} dangerouslySetInnerHTML={formatMessage(msg.content)} />
                  : <div className="aria-bubble user">{msg.content}</div>}
                <div className="aria-ts">{fmt(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="aria-msg-row assistant">
              <div className="aria-msg-avatar assistant"><AriaLogo size={14} /></div>
              <div className="aria-typing">
                <div className="aria-dot"/><div className="aria-dot"/><div className="aria-dot"/>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length === 0 && (
          <div className="aria-chips">
            {SUGGESTIONS.map(s => (
              <button key={s} className="aria-chip" onClick={() => sendMessage(s.replace(/^[^\s]+\s/, ""))}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="aria-input-area">
          <div className="aria-input-row">
            <textarea
              ref={taRef} className="aria-textarea"
              placeholder="Ask about campaigns, tasks, strategy…"
              rows={1} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={loading}
            />
            <button className="aria-send" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="white"/>
              </svg>
            </button>
          </div>
          <div className="aria-footer-row">
            <div className="aria-footer-txt">Aria · ManageX AI · Shift+Enter for new line</div>
            {messages.length > 0 && <button className="aria-clear" onClick={() => setMessages([])}>Clear</button>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AIChatbot;

export function ChatbotTrigger() {
  const [open, setOpen] = useState(false);
  useStyles();
  return (
    <>
      <button className="aria-trigger" onClick={() => setOpen(true)} style={{ position: "fixed", bottom: 28, right: 28 }}>
        <span className="aria-trigger-badge" />
        <AriaLogo size={24} />
      </button>
      <AIChatbot isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
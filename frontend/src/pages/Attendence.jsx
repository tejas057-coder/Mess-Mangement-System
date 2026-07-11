import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import API_BASE from "../api";

const MEALS          = ["Breakfast", "Lunch", "Dinner"];
const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

function today() { return new Date().toISOString().split("T")[0]; }
function fmt(d)  { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const AVATAR_PALETTES = [
  "linear-gradient(135deg,#2563eb,#7c3aed)",
  "linear-gradient(135deg,#059669,#34d399)",
  "linear-gradient(135deg,#db2777,#f43f5e)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#0891b2,#06b6d4)",
];

/* ── Animated KPI Card — Billing Style ── */
function AttendStatCard({ label, value, icon, iconBg, iconColor, iconBorder, glowColor, sub, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 22, padding: "22px 20px",
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        cursor: "default",
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, opacity 0.5s ease",
        transform: visible ? (hovered ? "translateY(-5px) scale(1.02)" : "translateY(0)") : "translateY(20px) scale(0.96)",
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0) 100%)", pointerEvents: "none", borderRadius: "22px 22px 0 0" }} />
      <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: glowColor, filter: "blur(22px)", pointerEvents: "none" }} />

      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, marginBottom: 16,
        boxShadow: `0 6px 16px ${glowColor}`,
        position: "relative", zIndex: 1,
      }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>

      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", position: "relative", zIndex: 1 }}>
        {label}
      </p>
      <h3 style={{ margin: "8px 0 6px", fontSize: 30, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1, position: "relative", zIndex: 1 }}>
        {value}
      </h3>
      {sub && <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 600, position: "relative", zIndex: 1 }}>{sub}</span>}
    </div>
  );
}

export default function Attendance() {
  const { accent, isDark } = useTheme();

  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [date,       setDate]       = useState(today());
  const [meal,       setMeal]       = useState("Lunch");
  const [attendance, setAttendance] = useState({});
  const [search,     setSearch]     = useState("");
  const [saved,      setSaved]      = useState(false);
  const [visible,    setVisible]    = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/members`)
      .then(r => r.json())
      .then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!members.length) return;
    const init = {};
    members.forEach(m => { init[m.id] = "Present"; });
    setAttendance(init);
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter(m => !q || m.name?.toLowerCase().includes(q) || String(m.phone || "").includes(q));
  }, [members, search]);

  const stats = useMemo(() => {
    const vals    = Object.values(attendance);
    const total   = members.length;
    const present = vals.filter(s => s === "Present").length;
    const absent  = vals.filter(s => s === "Absent").length;
    const leave   = vals.filter(s => s === "Leave").length;
    return { total, present, absent, leave };
  }, [attendance, members]);

  const markAll = (status) => {
    const next = {};
    filtered.forEach(m => { next[m.id] = status; });
    setAttendance(prev => ({ ...prev, ...next }));
  };

  const toggle = (id) => {
    setAttendance(prev => {
      const cur = prev[id] || "Present";
      const idx = STATUS_OPTIONS.indexOf(cur);
      return { ...prev, [id]: STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length] };
    });
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  const attendPct = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

  /* Status meta — dark-mode aware */
  const statusMeta = (isDark) => ({
    Present: { color: "#16a34a", bg: isDark ? "rgba(34,197,94,0.15)"  : "#dcfce7", border: isDark ? "rgba(34,197,94,0.35)"  : "#86efac", dot: "🟢" },
    Absent:  { color: "#dc2626", bg: isDark ? "rgba(239,68,68,0.15)"  : "#fee2e2", border: isDark ? "rgba(239,68,68,0.35)"  : "#fca5a5", dot: "🔴" },
    Leave:   { color: "#d97706", bg: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7", border: isDark ? "rgba(245,158,11,0.35)" : "#fcd34d", dot: "🟡" },
  });

  const SM = statusMeta(isDark);

  const kpiCards = [
    { label: "Total Members", value: stats.total,   icon: "👥", sub: `${stats.total} total members`,  iconBg: isDark ? "rgba(124,58,237,0.18)" : "#f3f0ff", iconColor: "#7c3aed", iconBorder: "rgba(124,58,237,0.25)", glowColor: "rgba(124,58,237,0.18)", delay: 50  },
    { label: "Present Today", value: stats.present, icon: "✅", sub: `${stats.present} present today`, iconBg: isDark ? "rgba(5,150,105,0.18)"  : "#ecfdf5", iconColor: "#059669", iconBorder: "rgba(5,150,105,0.25)",  glowColor: "rgba(5,150,105,0.18)",  delay: 130 },
    { label: "Absent Today",  value: stats.absent,  icon: "❌", sub: `${stats.absent} absent today`,  iconBg: isDark ? "rgba(239,68,68,0.18)"  : "#fee2e2",   iconColor: "#dc2626", iconBorder: "rgba(239,68,68,0.25)",   glowColor: "rgba(239,68,68,0.18)",   delay: 210 },
    { label: "On Leave",      value: stats.leave,   icon: "🏖️", sub: `${stats.leave} on leave today`, iconBg: isDark ? "rgba(245,158,11,0.18)" : "#fff5e8",  iconColor: "#d97706", iconBorder: "rgba(245,158,11,0.25)",  glowColor: "rgba(245,158,11,0.18)",  delay: 290 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", fontFamily: "Inter,system-ui,sans-serif", transition: "background 0.3s ease, opacity 0.4s ease", opacity: visible ? 1 : 0 }}>

      {/* ── Gradient Header Banner ── */}
      <div style={{
        borderRadius: 28, marginBottom: 24,
        background: `linear-gradient(135deg,${accent.hex}f0,${accent.dark}d0,${isDark?"#1e1b4b":"#1e3a5f"}cc)`,
        padding: "26px 30px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        position: "relative", overflow: "hidden",
        boxShadow: `0 24px 64px ${accent.shadow}, inset 0 0 0 1px rgba(255,255,255,0.1)`,
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0) 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -50, right: 100, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Daily Tracking</p>
          <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>Attendance</h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Track daily meal attendance for all members</p>
        </div>
        <button onClick={handleSave}
          style={{ position: "relative", zIndex: 1, background: saved ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", border: `1px solid ${saved ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.3)"}`, padding: "12px 22px", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", transition: "all 0.3s ease" }}>
          {saved ? "✓ Saved!" : "💾 Save Attendance"}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {kpiCards.map(c => <AttendStatCard key={c.label} {...c} />)}
      </div>

      {/* ── Controls Card ── */}
      <div style={{ background: "var(--bg-card)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--border)", borderRadius: 22, padding: "18px 22px", marginBottom: 18, boxShadow: "var(--shadow-md)", transition: "background 0.3s ease" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>

          {/* Left: Date + Meal Selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {/* Date Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 16px", transition: "all 0.2s ease" }}>
              <span style={{ fontSize: 16, color: accent.hex }}>📅</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, fontWeight: 700, color: "var(--text)", cursor: "pointer" }}
              />
            </div>

            {/* Meal Tabs */}
            <div style={{ display: "flex", gap: 4, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)", border: "1px solid var(--border)", borderRadius: 14, padding: 4 }}>
              {MEALS.map(m => {
                const isActive = meal === m;
                return (
                  <button key={m} onClick={() => setMeal(m)}
                    style={{ border: "none", background: isActive ? `linear-gradient(135deg,${accent.hex},${accent.dark})` : "transparent", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", color: isActive ? "#fff" : "var(--text-3)", transition: "all 0.2s ease", boxShadow: isActive ? `0 4px 14px ${accent.shadow}` : "none" }}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Search + Mark All */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <input type="text" placeholder="🔍 Search member..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", fontSize: 13, outline: "none", background: "var(--bg-input)", color: "var(--text)", minWidth: 180, transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(st => (
                <button key={st} onClick={() => markAll(st)}
                  style={{ border: `1px solid ${SM[st].border}`, background: SM[st].bg, color: SM[st].color, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease" }}>
                  {SM[st].dot} All {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
          <div style={{ flex: 1, height: 10, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${attendPct}%`, background: `linear-gradient(90deg,${accent.hex},${accent.dark},#06b6d4)`, borderRadius: 999, transition: "width 0.6s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 10px ${accent.shadow}` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: accent.hex, whiteSpace: "nowrap" }}>{attendPct}% attendance</span>
        </div>
      </div>

      {/* ── Members Grid ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, gap: 14, color: "var(--text-4)" }}>
          <div className="spinner" style={{ width: 44, height: 44, border: `4px solid var(--border)`, borderTop: `4px solid ${accent.hex}`, borderRadius: "50%" }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Loading members…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, color: "var(--text-4)" }}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <p style={{ margin: 0, color: "var(--text-3)", fontSize: 14, fontWeight: 600 }}>No members found</p>
        </div>
      ) : (
        <div className="attendance-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 22 }}>
          {filtered.map((member, idx) => {
            const status = attendance[member.id] || "Present";
            const meta   = SM[status];
            return (
              <div
                key={member.id}
                onClick={() => toggle(member.id)}
                style={{
                  background: "var(--bg-card)",
                  backdropFilter: "var(--glass-blur)",
                  WebkitBackdropFilter: "var(--glass-blur)",
                  borderRadius: 22,
                  border: `2px solid ${meta.border}`,
                  padding: "20px",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 12,
                  userSelect: "none",
                  boxShadow: `0 6px 28px ${meta.bg}80`,
                  overflow: "hidden",
                }}
              >
                {/* Subtle status glow background */}
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${meta.bg}60, transparent 70%)`, pointerEvents: "none" }} />

                {/* Avatar */}
                <div style={{ position: "relative", width: 62, height: 62, borderRadius: "50%", background: AVATAR_PALETTES[idx % AVATAR_PALETTES.length], color: "#fff", fontWeight: 900, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", flexShrink: 0, border: `3px solid ${meta.border}` }}>
                  {member.name?.slice(0,2)?.toUpperCase() || "NA"}
                </div>

                {/* Info */}
                <div style={{ position: "relative", width: "100%" }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{member.name || "Unknown"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-3)" }}>{member.phone || "—"}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--text-4)" }}>Joined: {fmt(member.starting_date)}</p>
                </div>

                {/* Status Badge */}
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${meta.border}`, borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 800, background: meta.bg, color: meta.color, backdropFilter: "blur(8px)" }}>
                  {meta.dot} {status}
                </div>

                {/* Tap hint */}
                <div style={{ position: "relative", fontSize: 10, color: "var(--text-4)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>tap to change</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Summary ── */}
      <div style={{ background: "var(--bg-card)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", borderRadius: 18, border: "1px solid var(--border)", padding: "14px 22px", textAlign: "center", boxShadow: "var(--shadow-sm)", transition: "background 0.3s ease" }}>
        <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>
          {fmt(date)} &nbsp;·&nbsp; {meal} &nbsp;·&nbsp;
          <span style={{ color: "#16a34a", fontWeight: 800 }}>{stats.present} Present</span> &nbsp;·&nbsp;
          <span style={{ color: "#dc2626", fontWeight: 800 }}>{stats.absent} Absent</span> &nbsp;·&nbsp;
          <span style={{ color: "#d97706", fontWeight: 800 }}>{stats.leave} on Leave</span>
        </span>
      </div>
    </div>
  );
}

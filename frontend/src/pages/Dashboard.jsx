import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import RecentMembers from "../components/ui/RecentMembers";
import MemberGrowth from "../components/ui/MemberGrowth";
import QuickSummary from "../components/ui/QuickSummary";
import API_BASE from "../api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Individual KPI Stat Card — Billing Style ── */
function StatCard({ label, value, icon, iconBg, iconColor, iconBorder, glowColor, sub, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 22,
        padding: "22px 20px",
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        cursor: "default",
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, opacity 0.5s ease",
        transform: visible ? (hovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)") : "translateY(20px) scale(0.96)",
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
      }}
    >
      {/* Top sheen */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0) 100%)", pointerEvents: "none", borderRadius: "22px 22px 0 0" }} />
      {/* Glow blob */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: glowColor, filter: "blur(22px)", pointerEvents: "none" }} />

      {/* Icon */}
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

/* ── Quick Stats Mini-Bar Item ── */
function MiniStat({ icon, value, label, accent, isLast }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, minWidth: 100, textAlign: "center", padding: "12px 16px",
        borderRight: !isLast ? "1px solid var(--border-2)" : "none",
        transition: "background 0.2s ease",
        borderRadius: 14,
        background: hovered ? "var(--bg-hover)" : "transparent",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { accent, isDark } = useTheme();
  const [members, setMembers] = useState([]);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/members`)
      .then(r => r.json())
      .then(d => setMembers(Array.isArray(d) ? d : []))
      .catch(() => {});

    const t1 = setTimeout(() => setBannerVisible(true), 50);
    const t2 = setTimeout(() => setStatsVisible(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const kpiCards = [
    { label: "Total Members",   value: members.length, icon: "👥", sub: `${members.length} registered`,      iconBg: isDark ? "rgba(124,58,237,0.18)" : "#f3f0ff", iconColor: "#7c3aed", iconBorder: "rgba(124,58,237,0.25)", glowColor: "rgba(124,58,237,0.18)", delay: 50  },
    { label: "Available Rooms", value: 0,              icon: "🏠", sub: "rooms available",                   iconBg: isDark ? "rgba(5,150,105,0.18)"  : "#ecfdf5", iconColor: "#059669", iconBorder: "rgba(5,150,105,0.25)",  glowColor: "rgba(5,150,105,0.18)",  delay: 130 },
    { label: "Monthly Revenue", value: "₹0",           icon: "💰", sub: "this month",                        iconBg: isDark ? "rgba(37,99,235,0.18)"  : "#eff6ff", iconColor: "#2563eb", iconBorder: "rgba(37,99,235,0.25)",  glowColor: "rgba(37,99,235,0.18)",  delay: 210 },
    { label: "Meals Today",     value: 0,              icon: "🍱", sub: "served today",                      iconBg: isDark ? "rgba(225,29,72,0.18)"  : "#fff1f2", iconColor: "#e11d48", iconBorder: "rgba(225,29,72,0.25)",  glowColor: "rgba(225,29,72,0.18)",  delay: 290 },
  ];

  const miniStats = [
    { icon: "✅", label: "Active Members",   value: members.filter(m => m.status === "active").length },
    { icon: "⏳", label: "Pending Payments", value: members.filter(m => m.billing_status === "pending").length },
    { icon: "🆕", label: "New This Month",   value: members.filter(m => { const d = new Date(m.starting_date), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length },
    { icon: "📊", label: "Attendance Rate",  value: "—" },
  ];

  return (
    <div style={{
      background: "var(--bg)", minHeight: "100vh",
      padding: "24px", fontFamily: "Inter, sans-serif",
      transition: "background 0.3s ease",
    }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: 28,
        background: `linear-gradient(135deg, ${accent.hex}f0 0%, ${accent.dark}d0 50%, ${isDark ? "#1e1b4b" : "#312e81"}cc 100%)`,
        padding: "28px 32px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 24px 64px ${accent.shadow}, 0 0 0 1px rgba(255,255,255,0.1) inset`,
        backdropFilter: "blur(20px)",
        transition: "all 0.5s ease",
        transform: bannerVisible ? "translateY(0)" : "translateY(-16px)",
        opacity: bannerVisible ? 1 : 0,
      }}>
        {/* Glass shimmer */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)", pointerEvents: "none" }} />
        {/* Animated orbs */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.07)", animation: "pulseOrb 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -70, right: 100, width: 170, height: 170, borderRadius: "50%", background: "rgba(255,255,255,0.04)", animation: "pulseOrb 7s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", top: 20, left: "40%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.02em" }}>{today}</p>
          <h1 style={{ margin: "8px 0 4px", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
            {getGreeting()}, Admin 👋
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            Here's what's happening at your mess today.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {["Mess Mgmt", "Live Stats", `${members.length} Members`].map(tag => (
              <span key={tag} style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff", letterSpacing: "0.04em", backdropFilter: "blur(6px)",
              }}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, fontSize: 80, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}>🍽</div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {kpiCards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 80 + 200} />
        ))}
      </div>

      {/* ── Quick Stats Glass Bar ── */}
      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: 22,
        padding: "8px 8px",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.1)",
        display: "flex",
        gap: 0,
        marginBottom: 24,
        flexWrap: "wrap",
        transition: "background 0.3s ease",
        opacity: statsVisible ? 1 : 0,
        transform: statsVisible ? "translateY(0)" : "translateY(10px)",
      }}>
        {miniStats.map((s, i) => (
          <MiniStat key={s.label} {...s} accent={accent} isLast={i === miniStats.length - 1} />
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid-2" style={{ gap: 22 }}>
        <div>
          <RecentMembers />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <MemberGrowth />
          <QuickSummary />
        </div>
      </div>

      {/* Pulse animation for orbs */}
      <style>{`
        @keyframes pulseOrb {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.07; }
          50% { transform: scale(1.12) translate(6px, -8px); opacity: 0.12; }
        }
      `}</style>
    </div>
  );
}
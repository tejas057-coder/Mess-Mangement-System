import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const data = [
  { month: "Jan", members: 75 },
  { month: "Feb", members: 82 },
  { month: "Mar", members: 90 },
  { month: "Apr", members: 98 },
  { month: "May", members: 108 },
  { month: "Jun", members: 118 },
  { month: "Jul", members: 128 },
];

const MemberGrowth = () => {
  const { accent, isDark } = useTheme();
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 350);
    return () => clearTimeout(t);
  }, []);

  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor  = isDark ? "#6e7681" : "#94a3b8";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.45s cubic-bezier(.34,1.56,.64,1)",
        transform: animate ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(16px)",
        opacity: animate ? 1 : 0,
        boxShadow: hovered
          ? `var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.08) inset`
          : "var(--shadow-md)",
      }}
    >
      {/* Glass top-sheen */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none", borderRadius: "24px 24px 0 0",
      }} />

      {/* Decorative glow blobs */}
      <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: `${accent.hex}20`, filter: "blur(36px)", top: -60, right: -40, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: `${accent.dark}18`, filter: "blur(28px)", bottom: -40, left: -20, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)" }}>Performance</p>
          <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>Member Growth</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)" }}>Monthly active members</p>
        </div>

        <span style={{
          background: isDark ? "rgba(34,197,94,0.15)" : "#dcfce7",
          color: "#15803d", padding: "6px 12px", borderRadius: 999,
          fontSize: 12, fontWeight: 800, border: "1px solid rgba(34,197,94,0.25)",
          whiteSpace: "nowrap", backdropFilter: "blur(8px)",
        }}>
          +42% ↑
        </span>
      </div>

      {/* Big number */}
      <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.05em",
          background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>128</span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: accent.hex,
          background: accent.light, border: `1px solid ${accent.hex}22`,
          borderRadius: 999, padding: "5px 10px",
        }}>
          ▲ 15 this month
        </span>
      </div>
      <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--text-3)" }}>Active Members</p>

      {/* Chart */}
      <div style={{
        width: "100%", height: 200,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        borderRadius: 18,
        border: "1px solid var(--border-2)",
        padding: "8px 4px 0",
        position: "relative",
        backdropFilter: "blur(4px)",
      }}>
        <ResponsiveContainer width="100%" height={192}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={accent.hex} />
                <stop offset="100%" stopColor={accent.dark} />
              </linearGradient>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={accent.hex} stopOpacity={0.25} />
                <stop offset="100%" stopColor={accent.hex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: isDark ? "rgba(13,17,23,0.9)" : "rgba(15,23,42,0.92)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
                boxShadow: "0 20px 48px rgba(0,0,0,0.35)",
                backdropFilter: "blur(16px)",
              }}
              labelStyle={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}
              itemStyle={{ color: "#fff", fontSize: 13, fontWeight: 800 }}
              formatter={(v) => [`${v} members`, ""]}
            />
            <Area
              type="monotone" dataKey="members"
              stroke={`url(#lineGrad)`} strokeWidth={2.5}
              fill="url(#areaFill)"
              dot={{ r: 4, fill: "var(--bg-card)", stroke: accent.hex, strokeWidth: 2 }}
              activeDot={{ r: 7, fill: accent.hex, stroke: "var(--bg-card)", strokeWidth: 2 }}
              isAnimationActive animationDuration={1600} animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MemberGrowth;
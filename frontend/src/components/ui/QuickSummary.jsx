import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const QuickSummary = () => {
  const { accent, isDark } = useTheme();
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(false);
  const occupancy = 79.6;

  const items = [
    { icon: "🥗", label: "Veg Meals",     value: 64,  color: "#22c55e" },
    { icon: "🍗", label: "Non-Veg Meals", value: 38,  color: "#f97316" },
    { icon: "🚫", label: "Absent Today",  value: 26,  color: "#f43f5e" },
  ];

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 24,
        padding: "24px",
        background: `linear-gradient(135deg, ${accent.hex}f2 0%, ${accent.dark}e0 60%, ${isDark ? "#1e1b4b" : "#312e81"}d8 100%)`,
        boxShadow: hovered
          ? `0 32px 72px ${accent.shadow}, 0 0 0 1px rgba(255,255,255,0.18) inset`
          : `0 20px 52px ${accent.shadow}`,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(.34,1.56,.64,1)",
        transform: animate ? (hovered ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)") : "translateY(20px)",
        opacity: animate ? 1 : 0,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Glassy top sheen */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none", borderRadius: "24px 24px 0 0",
      }} />
      {/* Background blobs */}
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.09)", top: -70, right: -50, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: -40, left: 20 }} />
      <div style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.08)", top: "40%", right: "20%" }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900, letterSpacing: "-0.03em" }}>Quick Summary</h3>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            background: "rgba(255,255,255,0.18)", padding: "4px 10px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
          }}>Today</span>
        </div>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Today's mess at a glance</p>

        {/* Stats */}
        {items.map(({ icon, label, value, color }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", marginBottom: 8,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(6px)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>{icon}</span>
              {label}
            </span>
            <strong style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>{value}</strong>
          </div>
        ))}

        {/* Occupancy */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Occupancy Rate</span>
            <strong style={{ fontSize: 18, fontWeight: 900 }}>{occupancy}%</strong>
          </div>
          {/* Track */}
          <div style={{ height: 10, background: "rgba(255,255,255,0.18)", borderRadius: 999, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%", width: `${occupancy}%`,
              background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
              borderRadius: 999,
              boxShadow: "0 0 14px rgba(255,255,255,0.5)",
              transition: "width 1.4s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>96 of 120 rooms</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>occupied</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSummary;
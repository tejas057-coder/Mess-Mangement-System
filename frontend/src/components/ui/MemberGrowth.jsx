import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

const data = [
  { month: "Jan", members: 75 },
  { month: "Feb", members: 82 },
  { month: "Mar", members: 90 },
  { month: "Apr", members: 98 },
  { month: "May", members: 108 },
  { month: "Jun", members: 118 },
  { month: "Jul", members: 128 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        <p style={styles.tooltipValue}>{payload[0].value} Active Members</p>
      </div>
    );
  }
  return null;
};

const MemberGrowth = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        ...styles.growthCard,
        transform: animate ? "translateY(0px)" : "translateY(14px)",
        opacity: animate ? 1 : 0,
      }}
    >
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div style={styles.growthHeader}>
        <div>
          <p style={styles.badgeText}>Performance overview</p>
          <h3 style={styles.growthHeaderTitle}>Member Growth</h3>
          <p style={styles.growthHeaderText}>Monthly active members trend</p>
        </div>

        <span style={styles.growthBadge}>+42%</span>
      </div>

      <div style={styles.numberRow}>
        <h1 style={styles.growthNumber}>128</h1>
        <span style={styles.growthUp}>▲ 15 this month</span>
      </div>

      <p style={styles.growthText}>Active Members</p>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="members"
              stroke="url(#lineColor)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#2563eb" }}
              activeDot={{
                r: 7,
                fill: "#2563eb",
                stroke: "#fff",
                strokeWidth: 3,
              }}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  growthCard: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #f8fbff 100%)",
    padding: "24px",
    borderRadius: "24px",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    transition: "all 0.5s ease",
  },

  glow1: {
    position: "absolute",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(37, 99, 235, 0.12)",
    filter: "blur(30px)",
    top: "-60px",
    right: "-40px",
    pointerEvents: "none",
  },

  glow2: {
    position: "absolute",
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "rgba(124, 58, 237, 0.10)",
    filter: "blur(26px)",
    bottom: "-40px",
    left: "-30px",
    pointerEvents: "none",
  },

  growthHeader: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },

  badgeText: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  growthHeaderTitle: {
    margin: "6px 0 0",
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },

  growthHeaderText: {
    color: "#64748b",
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "13px",
  },

  growthBadge: {
    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
    color: "#15803d",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: 800,
    fontSize: "13px",
    border: "1px solid rgba(34,197,94,0.18)",
    boxShadow: "0 8px 18px rgba(34,197,94,0.12)",
    position: "relative",
    zIndex: 1,
  },

  numberRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    marginTop: "18px",
  },

  growthNumber: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.05em",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  growthUp: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#2563eb",
    background: "#eff6ff",
    border: "1px solid rgba(37,99,235,0.14)",
    padding: "6px 10px",
    borderRadius: "999px",
  },

  growthText: {
    position: "relative",
    zIndex: 1,
    color: "#64748b",
    margin: "8px 0 18px",
    fontSize: "14px",
    fontWeight: 500,
  },

  chartContainer: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    height: "220px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(248,251,255,0.75))",
    border: "1px solid rgba(226,232,240,0.8)",
    borderRadius: "18px",
    padding: "8px 8px 0",
  },

  tooltip: {
    background: "rgba(15, 23, 42, 0.96)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: "12px",
    boxShadow: "0 16px 30px rgba(15,23,42,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  tooltipLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: 700,
  },

  tooltipValue: {
    margin: "4px 0 0",
    fontSize: "13px",
    fontWeight: 800,
    color: "#fff",
  },
};

export default MemberGrowth;
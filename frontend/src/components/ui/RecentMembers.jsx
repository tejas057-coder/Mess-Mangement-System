import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import API_BASE from "../../api";

const GRADIENTS = [
  "linear-gradient(135deg,#2563eb,#7c3aed)",
  "linear-gradient(135deg,#059669,#10b981)",
  "linear-gradient(135deg,#db2777,#f43f5e)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#0891b2,#06b6d4)",
];

const RecentMembers = () => {
  const { accent } = useTheme();
  const [members, setMembers] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/members`)
      .then(r => r.json())
      .then(d => setMembers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const sorted = [...members].sort((a, b) =>
    new Date(b.starting_date || 0) - new Date(a.starting_date || 0)
  );
  const visible = showAll ? sorted : sorted.slice(0, 5);

  const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase();

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: 22,
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      transition: "background 0.3s ease, border-color 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 22px 16px", flexWrap: "wrap", gap: 12,
        borderBottom: "1px solid var(--border-2)",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
            Recent Members
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-4)" }}>
            {showAll ? `All ${members.length} members` : `${visible.length} most recent`}
          </p>
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            background: `linear-gradient(135deg,${accent.hex},${accent.dark})`,
            color: "#fff", border: "none", padding: "9px 16px",
            borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
            boxShadow: `0 8px 18px ${accent.shadow}`,
            transition: "all 0.2s ease",
          }}
        >
          {showAll ? "Show Recent" : "View All"}
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }} className="recent-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead>
            <tr>
              {["#", "Member", "Phone", "Amount Due", "Joined"].map(h => (
                <th key={h} style={{
                  textAlign: "left", padding: "12px 18px",
                  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
                  color: "var(--text-4)", fontWeight: 800,
                  background: "var(--bg-hover)",
                  borderBottom: "1px solid var(--border-2)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "var(--text-4)", fontSize: 14 }}>
                  No members yet. Add members to get started!
                </td>
              </tr>
            )}
            {visible.map((m, i) => (
              <tr
                key={m.id || i}
                style={{ borderBottom: "1px solid var(--border-2)", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 18px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 30, height: 30, borderRadius: 8,
                    background: "var(--accent-light)", color: "var(--accent)",
                    fontWeight: 800, fontSize: 13,
                  }}>{i + 1}</span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: GRADIENTS[i % GRADIENTS.length],
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    }}>
                      {getInitials(m.name)}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                      {m.name || "—"}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-3)" }}>
                  {m.phone || "—"}
                </td>
                <td style={{ padding: "14px 18px", fontWeight: 700, fontSize: 14, color: Number(m.amount_remain) > 0 ? "#dc2626" : "#16a34a" }}>
                  ₹{m.amount_remain ?? 0}
                </td>
                <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-4)" }}>
                  {fmtDate(m.starting_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view cards */}
      <div className="recent-mobile-cards" style={{ padding: "8px 16px 16px" }}>
        {visible.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px 0", color: "var(--text-4)", fontSize: 13 }}>
            No members yet.
          </p>
        )}
        {visible.map((m, i) => (
          <div
            key={m.id || i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: i < visible.length - 1 ? "1px solid var(--border-2)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: GRADIENTS[i % GRADIENTS.length],
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 13, flexShrink: 0,
                boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
              }}>
                {getInitials(m.name)}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                  {m.name || "—"}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>
                  Joined: {fmtDate(m.starting_date)}
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: Number(m.amount_remain) > 0 ? "#dc2626" : "#16a34a" }}>
                ₹{m.amount_remain ?? 0}
              </span>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--text-3)" }}>
                {m.phone || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMembers;
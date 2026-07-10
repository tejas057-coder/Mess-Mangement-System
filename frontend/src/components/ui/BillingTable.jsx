import { useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

/* ── Status meta ──────────────────────────────────────────── */
function getStatusMeta(status, isDark) {
  const map = {
    paid:    {
      color:  "#16a34a",
      bg:     isDark ? "rgba(34,197,94,0.15)"  : "#dcfce7",
      border: isDark ? "rgba(34,197,94,0.3)"   : "#86efac",
      label:  "Paid",
      dot:    "🟢",
    },
    pending: {
      color:  "#d97706",
      bg:     isDark ? "rgba(245,158,11,0.15)" : "#fef3c7",
      border: isDark ? "rgba(245,158,11,0.3)"  : "#fcd34d",
      label:  "Pending",
      dot:    "🟡",
    },
    overdue: {
      color:  "#dc2626",
      bg:     isDark ? "rgba(239,68,68,0.15)"  : "#fee2e2",
      border: isDark ? "rgba(239,68,68,0.3)"   : "#fca5a5",
      label:  "Overdue",
      dot:    "🔴",
    },
  };
  return map[status] || { color: "var(--text-4)", bg: "var(--bg-hover)", border: "var(--border)", label: status || "Unknown", dot: "⚪" };
}

/* ── Helpers ──────────────────────────────────────────────── */
function fmt(val) {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  return Number.isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function normalizeDate(input) {
  const d = input ? new Date(input) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDerivedStatus(member) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = normalizeDate(member.due_date);
  const rem   = Number(member.amount_remain || 0);
  if (rem <= 0 || member.status === "paid") return "paid";
  if (due && due < today) return "overdue";
  return "pending";
}

const AVATAR_PALETTES = [
  "linear-gradient(135deg,#2563eb,#7c3aed)",
  "linear-gradient(135deg,#059669,#10b981)",
  "linear-gradient(135deg,#db2777,#f43f5e)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#0891b2,#06b6d4)",
];
const getAvatar = (name, idx) => AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

/* ── Main Component ──────────────────────────────────────── */
export default function BillingTable({ members = [], loading, error, onRecordPayment }) {
  const { accent, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch]             = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter(m => {
      const status      = getDerivedStatus(m);
      const matchStatus = activeFilter === "all" || status === activeFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        String(m.id ?? "").includes(q) ||
        (m.name  ?? "").toLowerCase().includes(q) ||
        String(m.phone ?? "").includes(q)
      );
    });
  }, [members, activeFilter, search]);

  const FILTERS = [
    { key: "all",     label: "All",     count: members.length },
    { key: "paid",    label: "Paid",    count: members.filter(m => getDerivedStatus(m) === "paid").length },
    { key: "pending", label: "Pending", count: members.filter(m => getDerivedStatus(m) === "pending").length },
    { key: "overdue", label: "Overdue", count: members.filter(m => getDerivedStatus(m) === "overdue").length },
  ];

  return (
    <div style={{
      background: "var(--bg-card)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      borderRadius: 22,
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-md)",
      overflow: "hidden",
      transition: "background 0.3s ease",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 22px 16px",
        flexWrap: "wrap", gap: 12,
        borderBottom: "1px solid var(--border-2)",
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
            Payment Records
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-4)" }}>
            This month's billing overview
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search member..."
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13,
            outline: "none",
            background: "var(--bg-input)",
            color: "var(--text)",
            width: "min(240px, 100%)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
          onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* ── Filter tabs ── */}
      <div style={{
        display: "flex", gap: 6, padding: "12px 22px",
        borderBottom: "1px solid var(--border-2)",
        flexWrap: "wrap",
        background: isDark ? "rgba(255,255,255,0.01)" : "rgba(248,250,252,0.8)",
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              border: activeFilter === f.key ? "1px solid transparent" : "1px solid var(--border)",
              background: activeFilter === f.key
                ? `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`
                : "var(--bg-hover)",
              color: activeFilter === f.key ? "#fff" : "var(--text-3)",
              padding: "7px 14px", borderRadius: 999,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: activeFilter === f.key ? `0 6px 18px ${accent.shadow}` : "none",
            }}
          >
            {f.label}
            <span style={{
              background: activeFilter === f.key ? "rgba(255,255,255,0.25)" : "var(--border)",
              color: activeFilter === f.key ? "#fff" : "var(--text-4)",
              borderRadius: 999, padding: "2px 8px",
              fontSize: 11, fontWeight: 800,
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "44px 20px", fontSize: 14, color: "var(--text-4)" }}>
          <div className="spinner" style={{ width: 32, height: 32, border: `3px solid var(--border)`, borderTop: `3px solid ${accent.hex}`, borderRadius: "50%" }} />
          <span>Loading billing data...</span>
        </div>
      ) : error ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "36px 20px", color: "#dc2626", fontSize: 14 }}>
          <span style={{ fontSize: 36 }}>⚠️</span>
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "44px 20px", color: "var(--text-4)" }}>
          <span style={{ fontSize: 40 }}>🧾</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>No records found</span>
          <span style={{ fontSize: 13 }}>Try a different filter or search term</span>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }} className="billing-table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr>
                  {["Member", "Total", "Paid", "Remaining", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", fontSize: 11,
                      color: "var(--text-4)", textTransform: "uppercase",
                      letterSpacing: "0.08em", padding: "14px 18px",
                      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(248,250,252,0.9)",
                      fontWeight: 800,
                      borderBottom: "1px solid var(--border-2)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => {
                  const status = getDerivedStatus(m);
                  const meta   = getStatusMeta(status, isDark);
                  const hasDue = Number(m.amount_remain) > 0;
                  return (
                    <tr
                      key={m.id || idx}
                      style={{ borderBottom: "1px solid var(--border-2)", transition: "background 0.15s ease" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Member cell */}
                      <td style={{ padding: "15px 18px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: getAvatar(m.name, idx),
                            color: "#fff", fontWeight: 800, fontSize: 13,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
                          }}>
                            {m.name?.slice(0, 2)?.toUpperCase() || "NA"}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{m.name || "—"}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-4)" }}>{m.phone || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Amount cells */}
                      <td style={{ padding: "15px 18px", fontSize: 14, fontWeight: 700, color: "var(--text)", verticalAlign: "middle" }}>
                        {fmt(m.total_amount)}
                      </td>
                      <td style={{ padding: "15px 18px", fontSize: 14, fontWeight: 700, color: "#16a34a", verticalAlign: "middle" }}>
                        {fmt(m.amount_paid)}
                      </td>
                      <td style={{ padding: "15px 18px", fontSize: 14, fontWeight: 700, color: hasDue ? "#dc2626" : "#16a34a", verticalAlign: "middle" }}>
                        {fmt(m.amount_remain)}
                      </td>
                      <td style={{ padding: "15px 18px", fontSize: 13, color: "var(--text-3)", verticalAlign: "middle" }}>
                        {fmtDate(m.due_date)}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "15px 18px", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "5px 12px", borderRadius: 999,
                          fontSize: 12, fontWeight: 800,
                          background: meta.bg, color: meta.color,
                          border: `1px solid ${meta.border}`,
                          backdropFilter: "blur(4px)",
                          whiteSpace: "nowrap",
                        }}>
                          • {meta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "15px 18px", verticalAlign: "middle" }}>
                        {hasDue ? (
                          <button
                            type="button"
                            onClick={() => onRecordPayment(m)}
                            style={{
                              padding: "6px 12px", borderRadius: 10,
                              background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
                              border: "none", color: "#fff",
                              fontSize: 12, fontWeight: 800, cursor: "pointer",
                              boxShadow: `0 4px 12px ${accent.shadow}`,
                              transition: "all 0.2s ease",
                            }}
                          >
                            💳 Pay
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>✓ Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="billing-mobile-cards" style={{ display: "none" }}>
            {filtered.map((m, idx) => {
              const status = getDerivedStatus(m);
              const meta   = getStatusMeta(status, isDark);
              const hasDue = Number(m.amount_remain) > 0;
              return (
                <div key={m.id || idx} style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid var(--border-2)",
                  transition: "background 0.15s ease",
                }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: getAvatar(m.name, idx),
                        color: "#fff", fontWeight: 800, fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
                      }}>
                        {m.name?.slice(0, 2)?.toUpperCase() || "NA"}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{m.name || "—"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-4)" }}>{m.phone || "—"}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: "5px 12px", borderRadius: 999,
                      fontSize: 12, fontWeight: 800,
                      background: meta.bg, color: meta.color,
                      border: `1px solid ${meta.border}`,
                    }}>
                      • {meta.label}
                    </span>
                  </div>

                  {/* Amount rows */}
                  {[
                    { label: "Total",     value: fmt(m.total_amount), color: "var(--text)" },
                    { label: "Paid",      value: fmt(m.amount_paid),  color: "#16a34a" },
                    { label: "Remaining", value: fmt(m.amount_remain), color: hasDue ? "#dc2626" : "#16a34a" },
                    { label: "Due Date",  value: fmtDate(m.due_date), color: "var(--text-3)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "8px 0",
                      borderTop: "1px solid var(--border-2)",
                    }}>
                      <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, color, fontWeight: 800 }}>{value}</span>
                    </div>
                  ))}

                  {/* Pay button for mobile */}
                  <div style={{ marginTop: 10, borderTop: "1px solid var(--border-2)", paddingTop: 10 }}>
                    {hasDue ? (
                      <button
                        type="button"
                        onClick={() => onRecordPayment(m)}
                        style={{
                          width: "100%", padding: "10px", borderRadius: 12,
                          background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
                          border: "none", color: "#fff",
                          fontSize: 13, fontWeight: 800, cursor: "pointer",
                          boxShadow: `0 4px 10px ${accent.shadow}`,
                        }}
                      >
                        💳 Record Payment
                      </button>
                    ) : (
                      <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: 13 }}>
                        ✓ Fully Paid
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "14px 22px", fontSize: 13, color: "var(--text-4)",
            borderTop: "1px solid var(--border-2)",
            background: isDark ? "rgba(255,255,255,0.01)" : "rgba(248,250,252,0.7)",
          }}>
            Showing <strong style={{ color: "var(--text-2)" }}>{filtered.length}</strong> of{" "}
            <strong style={{ color: "var(--text-2)" }}>{members.length}</strong> records
          </div>
        </>
      )}
    </div>
  );
}
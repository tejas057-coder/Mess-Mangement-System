import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import API_BASE from "../api";

const AVATAR_PALETTES = [
  "linear-gradient(135deg,#2563eb,#7c3aed)",
  "linear-gradient(135deg,#059669,#10b981)",
  "linear-gradient(135deg,#db2777,#f43f5e)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#0891b2,#06b6d4)",
];
const getAvatarBg = (name, idx) => AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

/* ── KPI Stat Card — Billing Style ── */
function StatCard({ label, value, icon, iconBg, iconColor, iconBorder, glowColor, sub, delay = 0 }) {
  const [visible,  setVisible]  = useState(false);
  const [hovered,  setHovered]  = useState(false);
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
        transform: visible ? (hovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)") : "translateY(20px) scale(0.96)",
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

/* ── Main Members Component ──────────────────────────────── */
function Members() {
  const { accent, isDark } = useTheme();

  const [members,        setMembers]        = useState([]);
  const [name,           setName]           = useState("");
  const [phone,          setPhone]          = useState("");
  const [amountPaid,     setAmountPaid]     = useState("");
  const [amountRemain,   setAmountRemain]   = useState("");
  const [dueDate,        setDueDate]        = useState("");
  const [paidOn,         setPaidOn]         = useState("");
  const [status,         setStatus]         = useState("pending");
  const [totalAmount,    setTotalAmount]    = useState("");
  const [startingDate,   setStartingDate]   = useState(new Date().toISOString().split("T")[0]);
  const [editingMember,  setEditingMember]  = useState(null);
  const [deleteMember,   setDeleteMember]   = useState(null);
  const [showForm,       setShowForm]       = useState(false);
  const [activeFilter,   setActiveFilter]   = useState("all");
  const [searchTerm,     setSearchTerm]     = useState("");
  const [visible,        setVisible]        = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/members`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.log(err));
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  const totalMembers       = members.length;
  const activeMembers      = members.filter(m => (m.status || "").toLowerCase() === "paid").length;
  const inactiveMembers    = members.filter(m => (m.status || "").toLowerCase() !== "paid").length;
  const newMembersThisMonth = members.filter(m => {
    const d = new Date(m.starting_date || m.startingDate);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const handleEdit = (member) => {
    setEditingMember(member);
    setName(member.name ?? ""); setPhone(member.phone ?? "");
    setAmountPaid(member.amount_paid ?? ""); setAmountRemain(member.amount_remain ?? "");
    setDueDate(member.due_date ? member.due_date.split("T")[0] : "");
    setPaidOn(member.paid_on ? member.paid_on.split("T")[0] : "");
    setStatus(member.status ?? "pending"); setTotalAmount(member.total_amount ?? "");
    setStartingDate(member.starting_date ? member.starting_date.split("T")[0] : new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };

  const handleAddMember = () => {
    setEditingMember(null); setName(""); setPhone(""); setAmountPaid(""); setAmountRemain("");
    setDueDate(""); setPaidOn(""); setStatus("pending"); setTotalAmount("");
    setStartingDate(new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    const member = { name, phone, starting_date: startingDate, amount_paid: amountPaid, amount_remain: amountRemain, due_date: dueDate, paid_on: paidOn, status, total_amount: totalAmount };
    try {
      let res;
      if (editingMember) {
        res = await fetch(`${API_BASE}/members/${editingMember.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(member) });
        const updData = await res.json();
        if (!res.ok) { toast.error(updData.message || "Failed to update member"); return; }
        setMembers(prev => prev.map(m => m.id === editingMember.id ? updData : m));
        toast.success("Member updated successfully!");
      } else {
        res = await fetch(`${API_BASE}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(member) });
        const newData = await res.json();
        if (!res.ok) { toast.error(newData.message || "Failed to add member"); return; }
        setMembers(prev => [...prev, newData]);
        toast.success("Member added successfully!");
      }
      setName(""); setPhone(""); setAmountPaid(""); setAmountRemain(""); setDueDate(""); setPaidOn(""); setStatus("pending"); setTotalAmount("");
      setStartingDate(new Date().toISOString().split("T")[0]);
      setEditingMember(null); setShowForm(false);
    } catch (err) { console.error(err); toast.error("⚠️ Network error: Could not reach server. Make sure the backend is running on port 5000."); }
  };

  const handleDelete  = (member) => setDeleteMember(member);
  const cancelDelete  = () => setDeleteMember(null);
  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/members/${deleteMember.id}`, { method: "DELETE" });
      const delData = await res.json();
      if (!res.ok) { toast.error(delData.message || "Failed to delete member"); return; }
      setMembers(prev => prev.filter(m => m.id !== deleteMember.id));
      setDeleteMember(null);
      toast.success("Member deleted successfully!");
    } catch (error) { console.error(error); toast.error("⚠️ Network error: Could not reach server."); }
  };

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return members.filter(m => {
      const ms = (m.status || "pending").toLowerCase();
      if (activeFilter !== "all" && ms !== activeFilter) return false;
      if (!q) return true;
      return String(m.id ?? "").toLowerCase().includes(q) || String(m.name ?? "").toLowerCase().includes(q) || String(m.phone ?? "").toLowerCase().includes(q);
    });
  }, [members, activeFilter, searchTerm]);

  /* Shared input style */
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14,
    border: "1px solid var(--border)", outline: "none",
    background: "var(--bg-input)", color: "var(--text)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const FILTERS = [
    { key: "all",     label: "All Members", count: members.length },
    { key: "paid",    label: "Paid",         count: members.filter(m => (m.status||"").toLowerCase() === "paid").length },
    { key: "pending", label: "Pending",      count: members.filter(m => (m.status||"").toLowerCase() === "pending").length },
    { key: "overdue", label: "Overdue",      count: members.filter(m => (m.status||"").toLowerCase() === "overdue").length },
  ];

  const kpiCards = [
    { label: "Total Members",    value: totalMembers,        icon: "👥", sub: `${totalMembers} registered`,       iconBg: isDark ? "rgba(124,58,237,0.18)" : "#f3f0ff", iconColor: "#7c3aed", iconBorder: "rgba(124,58,237,0.25)", glowColor: "rgba(124,58,237,0.18)", delay: 50  },
    { label: "Active Members",   value: activeMembers,       icon: "✅", sub: `${activeMembers} paid status`,     iconBg: isDark ? "rgba(5,150,105,0.18)"  : "#ecfdf5", iconColor: "#059669", iconBorder: "rgba(5,150,105,0.25)",  glowColor: "rgba(5,150,105,0.18)",  delay: 130 },
    { label: "Inactive Members", value: inactiveMembers,     icon: "⏸️", sub: `${inactiveMembers} unpaid status`,   iconBg: isDark ? "rgba(37,99,235,0.18)"  : "#eff6ff", iconColor: "#2563eb", iconBorder: "rgba(37,99,235,0.25)",  glowColor: "rgba(37,99,235,0.18)",  delay: 210 },
    { label: "New This Month",   value: newMembersThisMonth, icon: "🆕", sub: `${newMembersThisMonth} this month`,   iconBg: isDark ? "rgba(225,29,72,0.18)"  : "#fff1f2", iconColor: "#e11d48", iconBorder: "rgba(225,29,72,0.25)",  glowColor: "rgba(225,29,72,0.18)",  delay: 290 },
  ];

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  const getStatusBadge = (s, isDark) => {
    const map = {
      paid:    { color: "#16a34a", bg: isDark ? "rgba(34,197,94,0.15)"  : "#dcfce7", border: isDark ? "rgba(34,197,94,0.3)"  : "#86efac"  },
      pending: { color: "#d97706", bg: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7", border: isDark ? "rgba(245,158,11,0.3)" : "#fcd34d"  },
      overdue: { color: "#dc2626", bg: isDark ? "rgba(239,68,68,0.15)"  : "#fee2e2", border: isDark ? "rgba(239,68,68,0.3)"  : "#fca5a5"  },
    };
    return map[(s||"pending").toLowerCase()] || map.pending;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", fontFamily: "Inter,system-ui,sans-serif", transition: "background 0.3s ease, opacity 0.4s ease", opacity: visible ? 1 : 0 }}>

      {/* ── Header Banner ── */}
      <div style={{
        borderRadius: 28, marginBottom: 24,
        background: `linear-gradient(135deg,${accent.hex}f0,${accent.dark}d0,${isDark?"#1e1b4b":"#312e81"}cc)`,
        padding: "26px 30px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        position: "relative", overflow: "hidden",
        boxShadow: `0 24px 64px ${accent.shadow}, inset 0 0 0 1px rgba(255,255,255,0.1)`,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -60, right: 80, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Management</p>
          <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>Members</h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Manage resident profiles, contact details and joining dates</p>
        </div>
        <button
          onClick={handleAddMember}
          style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "12px 22px", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", transition: "all 0.2s ease" }}
        >
          + Add Member
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {kpiCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── Member Directory Table Card ── */}
      <div style={{ background: "var(--bg-card)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-md)", transition: "background 0.3s ease" }}>

        {/* Table Top Bar */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-2)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>Member Directory</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-4)" }}>All registered mess members</p>
            </div>
            <input
              type="text"
              placeholder="🔍 Search by name, phone, or ID"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: "min(280px,100%)", background: "var(--bg-input)" }}
              onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key;
              return (
                <button key={f.key} type="button" onClick={() => setActiveFilter(f.key)}
                  style={{ display: "flex", alignItems: "center", gap: 7, border: isActive ? "1px solid transparent" : "1px solid var(--border)", background: isActive ? `linear-gradient(135deg,${accent.hex},${accent.dark})` : "var(--bg-hover)", color: isActive ? "#fff" : "var(--text-3)", padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", boxShadow: isActive ? `0 6px 18px ${accent.shadow}` : "none" }}>
                  {f.label}
                  <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : "var(--border)", color: isActive ? "#fff" : "var(--text-4)", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>{f.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Table */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }} className="members-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr>
                {["ID","Member","Mobile Number","Total","Amount Paid","Remaining","Joined","Due Date","Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "13px 18px", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(248,250,252,0.9)", borderBottom: "1px solid var(--border-2)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.map((member, idx) => {
                const badge = getStatusBadge(member.status, isDark);
                return (
                  <tr key={member.id}
                    style={{ borderBottom: "1px solid var(--border-2)", transition: "background 0.15s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-4)", fontWeight: 600 }}>{member.id}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: getAvatarBg(member.name, idx), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.16)" }}>
                          {member.name ? member.name.slice(0,2).toUpperCase() : "NA"}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{member.name}</p>
                          <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>Mess Member</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-3)" }}>{member.phone}</td>
                    <td style={{ padding: "14px 18px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>₹{member.total_amount || "—"}</td>
                    <td style={{ padding: "14px 18px", fontSize: 14, fontWeight: 700, color: "#16a34a" }}>₹{member.amount_paid || "—"}</td>
                    <td style={{ padding: "14px 18px", fontSize: 14, fontWeight: 700, color: Number(member.amount_remain) > 0 ? "#dc2626" : "#16a34a" }}>₹{member.amount_remain || "—"}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-3)" }}>{fmtDate(member.starting_date || member.startingDate)}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-3)" }}>{fmtDate(member.due_date)}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { label: "✎", title: "Edit",   action: () => handleEdit(member),   bg: isDark ? "rgba(37,99,235,0.18)" : "#eff6ff",   color: "#2563eb", border: "rgba(37,99,235,0.25)" },
                          { label: "🗑", title: "Delete", action: () => handleDelete(member), bg: isDark ? "rgba(239,68,68,0.18)" : "#fee2e2",   color: "#dc2626", border: "rgba(239,68,68,0.25)" },
                        ].map(btn => (
                          <button key={btn.title} type="button" title={btn.title} onClick={btn.action}
                            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${btn.border}`, background: btn.bg, color: btn.color, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}
                          >{btn.label}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-4)", fontSize: 14 }}>No members found matching your search</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="members-mobile-list" style={{ padding: "8px 16px 16px" }}>
          {filteredMembers.length > 0 ? filteredMembers.map((member, idx) => {
            const sl = (member.status || "").toLowerCase();
            const badge = getStatusBadge(sl, isDark);
            return (
              <div key={member.id} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", border: "1px solid var(--border)", borderRadius: 20, padding: "18px", marginBottom: 12, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 14, transition: "all 0.2s ease" }}>
                {/* Top Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: getAvatarBg(member.name, idx), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, boxShadow: `0 4px 14px ${accent.shadow}` }}>
                      {member.name ? member.name.slice(0,2).toUpperCase() : "NA"}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{member.name}</h4>
                      <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>ID: {member.id}</span>
                    </div>
                  </div>
                  <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {(member.status || "PENDING").toUpperCase()}
                  </span>
                </div>
                {/* Financial Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: 12, textAlign: "center", border: "1px solid var(--border-2)" }}>
                  {[
                    { l: "Total", v: `₹${member.total_amount || 0}`, c: "var(--text)" },
                    { l: "Paid",  v: `₹${member.amount_paid  || 0}`, c: "#16a34a" },
                    { l: "Rem",   v: `₹${member.amount_remain|| 0}`, c: Number(member.amount_remain) > 0 ? "#dc2626" : "var(--text)" },
                  ].map(({ l, v, c }) => (
                    <div key={l}>
                      <p style={{ margin: 0, fontSize: 10, color: "var(--text-4)", fontWeight: 700, textTransform: "uppercase" }}>{l}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 800, color: c }}>{v}</p>
                    </div>
                  ))}
                </div>
                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--text-3)" }}>
                  {[
                    { l: "Phone", v: member.phone || "—", c: "var(--text)" },
                    { l: "Joined", v: fmtDate(member.starting_date), c: "var(--text)" },
                    ...(member.due_date ? [{ l: "Due", v: fmtDate(member.due_date), c: "#d97706" }] : []),
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{l}:</span><strong style={{ color: c }}>{v}</strong>
                    </div>
                  ))}
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border-2)", paddingTop: 12 }}>
                  <button type="button" onClick={() => handleEdit(member)}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: `1px solid ${accent.hex}33`, background: isDark ? `${accent.hex}22` : `${accent.hex}12`, color: accent.hex, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ✎ Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(member)}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)", background: isDark ? "rgba(239,68,68,0.15)" : "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          }) : (
            <p style={{ textAlign: "center", padding: "30px 0", color: "var(--text-4)" }}>No members found</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", fontSize: 13, color: "var(--text-4)", borderTop: "1px solid var(--border-2)", background: isDark ? "rgba(255,255,255,0.01)" : "rgba(248,250,252,0.7)" }}>
          Showing <strong style={{ color: "var(--text-2)" }}>{filteredMembers.length}</strong> of <strong style={{ color: "var(--text-2)" }}>{members.length}</strong> members
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div className="members-modal">
          <div className="members-modal-inner" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 22 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  {editingMember ? "Update Member" : "Add New Member"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)" }}>Fill in member details below</p>
              </div>
              <button onClick={() => setShowForm(false)} type="button"
                style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-3)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handlesubmit}>
              <div className="form-grid-2" style={{ gap: 16, marginBottom: 20 }}>
                {[
                  { label: "Name",           type: "text",   val: name,         set: setName,         ph: "Enter member name"  },
                  { label: "Phone Number",   type: "text",   val: phone,        set: setPhone,        ph: "Enter mobile number" },
                  { label: "Starting Date",  type: "date",   val: startingDate, set: setStartingDate, ph: ""                    },
                  { label: "Amount Paid",    type: "number", val: amountPaid,   set: setAmountPaid,   ph: "0", readOnly: true  },
                  { label: "Amount Remain",  type: "number", val: amountRemain, set: setAmountRemain, ph: "0", readOnly: true  },
                  { label: "Due Date",       type: "date",   val: dueDate,      set: setDueDate,      ph: ""                    },
                  { label: "Paid On",        type: "date",   val: paidOn,       set: setPaidOn,       ph: ""                    },
                  { label: "Total Amount",   type: "number", val: totalAmount,  set: setTotalAmount,  ph: "0"                   },
                ].map(({ label, type, val, set, ph, readOnly }) => (
                  <div key={label}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {label} {readOnly && <span style={{ fontSize: 10, color: accent.hex, textTransform: "none", fontWeight: 500 }}>(Locked)</span>}
                    </label>
                    <input 
                      type={type} 
                      value={val} 
                      placeholder={ph} 
                      readOnly={readOnly}
                      onChange={e => !readOnly && set(e.target.value)} 
                      style={{ 
                        ...inputStyle, 
                        ...(readOnly ? { background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", cursor: "not-allowed", opacity: 0.8 } : {}) 
                      }}
                      onFocus={e => { if (!readOnly) { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; } }}
                      onBlur={e  => { if (!readOnly) { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; } }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: "11px 22px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-2)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ padding: "11px 26px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${accent.hex},${accent.dark})`, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: `0 10px 24px ${accent.shadow}` }}>
                  {editingMember ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteMember && (
        <div className="members-modal">
          <div className="members-modal-inner" style={{ maxWidth: 420, textAlign: "center", backdropFilter: "blur(20px)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: isDark ? "rgba(239,68,68,0.2)" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🗑</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900, color: "var(--text)" }}>Remove Member</h3>
            <p style={{ margin: "0 0 24px", color: "var(--text-3)", fontSize: 14 }}>
              Are you sure you want to remove <strong style={{ color: "var(--text)" }}>{deleteMember.name}</strong> from the Mess? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={cancelDelete}
                style={{ padding: "11px 22px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-2)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 10px 24px rgba(239,68,68,0.35)" }}>
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
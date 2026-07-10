import React, { useEffect, useMemo, useState } from "react";
import BillingTable from "../components/ui/BillingTable.jsx";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";

const trendMonths  = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const trendHeights = [72, 62, 60, 58, 59, 53, 55];

/* ─── Helper ──────────────────────────────────────────────── */
function normalizeDate(input) {
  const d = input ? new Date(input) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ─── KPI Stat Card ───────────────────────────────────────── */
function StatCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: 22,
        padding: "22px 20px",
        border: "1px solid var(--border)",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease",
        transform: hovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* Top sheen */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0) 100%)",
        pointerEvents: "none", borderRadius: "22px 22px 0 0",
      }} />
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 80, height: 80,
        borderRadius: "50%", background: item.glowColor || "rgba(37,99,235,0.12)",
        filter: "blur(20px)", pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: item.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 16,
        boxShadow: `0 6px 16px ${item.glowColor || "rgba(0,0,0,0.1)"}`,
        border: `1px solid ${item.iconBorder || "rgba(255,255,255,0.2)"}`,
        position: "relative", zIndex: 1,
      }}>
        <span style={{ color: item.iconColor }}>{item.icon}</span>
      </div>

      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", position: "relative", zIndex: 1 }}>
        {item.title}
      </p>
      <h3 style={{ margin: "8px 0 6px", fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", position: "relative", zIndex: 1 }}>
        {item.value}
      </h3>
      <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 600, position: "relative", zIndex: 1 }}>
        {item.sub}
      </span>
    </div>
  );
}

/* ─── Sidebar Panel ──────────────────────────────────────── */
function SidebarPanel({ members, accent, isDark }) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const thisMonthMembers = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthStart.setHours(0, 0, 0, 0); monthEnd.setHours(23, 59, 59, 999);
    return members.filter(m => {
      const sd = normalizeDate(m.starting_date);
      return sd && sd >= monthStart && sd <= monthEnd;
    });
  }, [members, today]);

  const summary = useMemo(() => {
    const totalExpected     = thisMonthMembers.reduce((s, m) => s + Number(m.total_amount   || 0), 0);
    const collected         = thisMonthMembers.reduce((s, m) => s + Number(m.amount_paid    || 0), 0);
    const pending           = thisMonthMembers.reduce((s, m) => s + Number(m.amount_remain  || 0), 0);
    const overdue           = thisMonthMembers.reduce((s, m) => {
      const due = normalizeDate(m.due_date), remain = Number(m.amount_remain || 0);
      return (due && due < today && m.status !== "paid" && remain > 0) ? s + remain : s;
    }, 0);
    const paidCount         = thisMonthMembers.filter(m => Number(m.amount_remain || 0) === 0).length;
    const pendingCount      = thisMonthMembers.filter(m => Number(m.amount_remain || 0) > 0).length;
    const collectedPercent  = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;
    return { totalExpected, collected, pending, overdue, paidCount, pendingCount, collectedPercent };
  }, [thisMonthMembers, today]);

  const summaryRows = [
    { label: "Monthly Revenue", value: `₹${summary.totalExpected.toLocaleString("en-IN")}`, color: "var(--text)" },
    { label: "Collected",       value: `₹${summary.collected.toLocaleString("en-IN")}`,     color: "#16a34a" },
    { label: "Pending",         value: `₹${summary.pending.toLocaleString("en-IN")}`,       color: "#d97706" },
    { label: "Overdue",         value: `₹${summary.overdue.toLocaleString("en-IN")}`,       color: "#ef4444" },
    { label: "Payments",        value: `${summary.paidCount} paid`,                          color: "var(--text)" },
    { label: "Pending Members", value: `${summary.pendingCount}`,                            color: "var(--text)" },
  ];

  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Revenue Trend Card */}
      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: 22,
        padding: 22,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-md)",
        position: "relative", overflow: "hidden",
        transition: "background 0.3s ease",
      }}>
        {/* Glow blob */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 130, height: 130, borderRadius: "50%", background: `${accent.hex}18`, filter: "blur(30px)", pointerEvents: "none" }} />

        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)" }}>Revenue Trend</h3>
        <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--text-4)" }}>Last 7 months</p>

        <div style={{ position: "relative", height: 150, marginBottom: 10 }}>
          {/* Grid lines */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: "absolute", left: 0, right: 0,
              top: `${i * 33}%`,
              borderTop: `1px dashed ${gridColor}`,
            }} />
          ))}
          {/* Points and lines */}
          <div style={{ position: "absolute", inset: 0 }}>
            {trendHeights.map((h, i) => (
              <div key={i} style={{ position: "absolute", left: `${i * 15.5}%`, top: `${h}%`, display: "flex", alignItems: "center" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: accent.hex,
                  border: "2px solid var(--bg-card)",
                  boxShadow: `0 0 0 3px ${accent.hex}33`,
                  flexShrink: 0,
                  zIndex: 1,
                }} />
                {i < trendHeights.length - 1 && (
                  <div style={{
                    width: 46, height: 2.5,
                    background: `linear-gradient(90deg, ${accent.hex}, ${accent.dark})`,
                    marginLeft: 2, borderRadius: 999,
                    opacity: 0.8,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {trendMonths.map(m => (
            <span key={m} style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Payment Summary Card */}
      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: 22,
        padding: 22,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-md)",
        position: "relative", overflow: "hidden",
        transition: "background 0.3s ease",
      }}>
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${accent.hex}14`, filter: "blur(20px)", pointerEvents: "none" }} />

        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "var(--text)" }}>Payment Summary</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-4)" }}>This month's overview</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {summaryRows.map(({ label, value, color }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "11px 0",
              borderBottom: "1px solid var(--border-2)",
            }}>
              <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 600 }}>Collection Rate</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: accent.hex }}>{summary.collectedPercent}%</span>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${summary.collectedPercent}%`,
              background: `linear-gradient(90deg, ${accent.hex}, ${accent.dark})`,
              borderRadius: 999,
              boxShadow: `0 0 10px ${accent.shadow}`,
              transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-4)", textAlign: "right" }}>
            collected this month
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Billing Page ──────────────────────────────────── */
export default function Billing() {
  const { accent, isDark } = useTheme();
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [visible,  setVisible]  = useState(false);

  // Payment Recording State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember]     = useState(null);
  const [payAmount, setPayAmount]               = useState("");
  const [payMethod, setPayMethod]               = useState("UPI");
  const [payTxId, setPayTxId]                   = useState("");
  const [payDate, setPayDate]                   = useState(new Date().toISOString().split("T")[0]);

  const fetchMembers = () => {
    setLoading(true);
    fetch("http://localhost:5000/members")
      .then(res => { if (!res.ok) throw new Error("Failed to fetch members"); return res.json(); })
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message || "Something went wrong"); setLoading(false); });
  };

  useEffect(() => {
    fetchMembers();
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const thisMonthMembers = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthStart.setHours(0, 0, 0, 0); monthEnd.setHours(23, 59, 59, 999);
    return members.filter(m => {
      const sd = normalizeDate(m.starting_date);
      return sd && sd >= monthStart && sd <= monthEnd;
    });
  }, [members, today]);

  const totalExpected = thisMonthMembers.reduce((s, m) => s + Number(m.total_amount  || 0), 0);
  const collected     = thisMonthMembers.reduce((s, m) => s + Number(m.amount_paid   || 0), 0);
  const pending       = thisMonthMembers.reduce((s, m) => s + Number(m.amount_remain || 0), 0);
  const overdue       = thisMonthMembers.reduce((s, m) => {
    const due = normalizeDate(m.due_date), remain = Number(m.amount_remain || 0);
    return (due && due < today && m.status !== "paid" && remain > 0) ? s + remain : s;
  }, 0);
  const paidCount     = thisMonthMembers.filter(m => Number(m.amount_remain || 0) === 0).length;
  const pendingCount  = thisMonthMembers.filter(m => Number(m.amount_remain || 0) > 0).length;
  const overdueCount  = thisMonthMembers.filter(m => {
    const due = normalizeDate(m.due_date);
    return due && due < today && m.status !== "paid" && Number(m.amount_remain || 0) > 0;
  }).length;

  const statsData = [
    {
      title: "Monthly Revenue",
      value: `₹${totalExpected.toLocaleString("en-IN")}`,
      sub: `${thisMonthMembers.length} members billed`,
      icon: "📈",
      iconBg: isDark ? "rgba(59,130,246,0.18)" : "#eaf2ff",
      iconColor: "#3b82f6",
      iconBorder: "rgba(59,130,246,0.25)",
      glowColor: "rgba(59,130,246,0.2)",
    },
    {
      title: "Collected This Month",
      value: `₹${collected.toLocaleString("en-IN")}`,
      sub: `${paidCount} payments cleared`,
      icon: "💵",
      iconBg: isDark ? "rgba(34,197,94,0.18)" : "#e8f9f0",
      iconColor: "#22c55e",
      iconBorder: "rgba(34,197,94,0.25)",
      glowColor: "rgba(34,197,94,0.2)",
    },
    {
      title: "Pending Amount",
      value: `₹${pending.toLocaleString("en-IN")}`,
      sub: `${pendingCount} members pending`,
      icon: "⏳",
      iconBg: isDark ? "rgba(245,158,11,0.18)" : "#fff5e8",
      iconColor: "#f59e0b",
      iconBorder: "rgba(245,158,11,0.25)",
      glowColor: "rgba(245,158,11,0.2)",
    },
    {
      title: "Overdue",
      value: `₹${overdue.toLocaleString("en-IN")}`,
      sub: `${overdueCount} members overdue`,
      icon: "⚠️",
      iconBg: isDark ? "rgba(239,68,68,0.18)" : "#ffecef",
      iconColor: "#ef4444",
      iconBorder: "rgba(239,68,68,0.25)",
      glowColor: "rgba(239,68,68,0.2)",
    },
  ];

  const handleOpenPaymentModal = (member = null) => {
    setSelectedMember(member);
    if (member) {
      setPayAmount(String(member.amount_remain || ""));
    } else {
      setPayAmount("");
    }
    setPayMethod("UPI");
    setPayTxId("");
    setPayDate(new Date().toISOString().split("T")[0]);
    setShowPaymentModal(true);
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();

    const targetMember = selectedMember || members.find(m => String(m.id) === payAmount);
    if (!targetMember) {
      toast.error("Please select a member");
      return;
    }

    const numericAmount = Number(payAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (numericAmount > Number(targetMember.amount_remain)) {
      toast.error(`Amount exceeds remaining due of ₹${targetMember.amount_remain}`);
      return;
    }

    const payload = {
      member_id: targetMember.id,
      member_name: targetMember.name,
      amount_paid: numericAmount,
      payment_method: payMethod,
      transaction_id: payTxId,
      paid_on: payDate
    };

    fetch("http://localhost:5000/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Payment record failed");
        return res.json();
      })
      .then(() => {
        toast.success("Payment recorded successfully!");
        setShowPaymentModal(false);
        fetchMembers();
      })
      .catch(err => {
        console.error(err);
        toast.error("Unable to record payment");
      });
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14,
    border: "1px solid var(--border)", outline: "none",
    background: "var(--bg-input)", color: "var(--text)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      background: "var(--bg)",
      minHeight: "100vh",
      padding: "24px",
      fontFamily: "Inter, sans-serif",
      color: "var(--text)",
      transition: "background 0.3s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.4s ease, transform 0.4s ease, background 0.3s ease",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24,
        gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)" }}>
            Finance
          </p>
          <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Payment Records
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-3)" }}>Track payments, dues & billing history</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button style={{
            background: "var(--bg-card)",
            backdropFilter: "var(--glass-blur)",
            border: "1px solid var(--border)",
            borderRadius: 14, padding: "10px 20px",
            fontSize: 13, fontWeight: 700, color: "var(--text-2)",
            cursor: "pointer", boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s ease",
          }}>
            📤 Export
          </button>
          <button 
            onClick={() => handleOpenPaymentModal(null)}
            style={{
              background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
              border: "none", borderRadius: 14,
              padding: "10px 20px", fontSize: 13, fontWeight: 800,
              color: "#fff", cursor: "pointer",
              boxShadow: `0 10px 24px ${accent.shadow}`,
              transition: "all 0.2s ease",
            }}
          >
            💳 Record Payment
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid-4" style={{ marginBottom: 22 }}>
        {statsData.map((item, i) => (
          <StatCard key={i} item={item} />
        ))}
      </div>

      {/* ── Billing Table + Sidebar ── */}
      <div className="grid-billing" style={{ gap: 18, alignItems: "start" }}>
        <BillingTable 
          members={thisMonthMembers} 
          loading={loading} 
          error={error} 
          isDark={isDark} 
          accent={accent} 
          onRecordPayment={handleOpenPaymentModal}
        />
        <SidebarPanel members={members} accent={accent} isDark={isDark} />
      </div>

      {/* ── Record Payment Modal ── */}
      {showPaymentModal && (
        <div className="members-modal">
          <div className="members-modal-inner" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", maxWidth: selectedMember ? 680 : 500, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 22 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  Record Payment & Checkout
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)" }}>Scan QR Code or log manual transaction</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)} 
                type="button"
                style={{
                  width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--bg-hover)", color: "var(--text-3)", cursor: "pointer",
                  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: selectedMember ? "220px 1fr" : "1fr", 
                gap: 24, 
                marginBottom: 20,
                alignItems: "start"
              }}>
                {/* Left Column: QR Code */}
                {selectedMember && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                    borderRadius: 16,
                    padding: "16px 12px",
                    border: "1px solid var(--border)",
                    gap: 12,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      UPI Scan & Pay
                    </span>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(
                        `upi://pay?pa=messmate@paytm&pn=MessMate%20System&am=${payAmount || selectedMember.amount_remain}&cu=INR&tn=Payment_Member_${selectedMember.id}`
                      )}`} 
                      alt="Payment QR Code" 
                      style={{ 
                        width: 156,
                        height: 156,
                        borderRadius: 10,
                        border: "3px solid #fff",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      }} 
                    />
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: "var(--text-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        GPay / PhonePe / Paytm
                      </p>
                      <p style={{ margin: "6px 0 0", fontSize: 14, color: "#16a34a", fontWeight: 900 }}>
                        Amount: ₹{payAmount || selectedMember.amount_remain}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "var(--text-4)", fontWeight: 600 }}>
                        Remaining Due: ₹{selectedMember.amount_remain}
                      </p>
                    </div>
                  </div>
                )}

                {/* Right Column: Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Member selection */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Select Member
                    </label>
                    {selectedMember ? (
                      <input 
                        type="text" 
                        readOnly 
                        value={`${selectedMember.name} (ID: ${selectedMember.id})`}
                        style={{ ...inputStyle, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", cursor: "not-allowed", opacity: 0.8 }}
                      />
                    ) : (
                      <select 
                        required 
                        value="" 
                        onChange={e => {
                          const mId = e.target.value;
                          const target = members.find(m => String(m.id) === mId);
                          setSelectedMember(target);
                          if (target) setPayAmount(String(target.amount_remain));
                        }} 
                        style={inputStyle}
                      >
                        <option value="">-- Choose Member --</option>
                        {members.filter(m => Number(m.amount_remain) > 0).map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (Remaining Due: ₹{m.amount_remain})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Amount Paid */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Amount to Pay (₹)
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="Enter amount paid"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
                      onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Payment Method
                    </label>
                    <select 
                      value={payMethod} 
                      onChange={e => setPayMethod(e.target.value)} 
                      style={inputStyle}
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Transaction ID (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. UPI Ref, Bank Txn Number"
                      value={payTxId}
                      onChange={e => setPayTxId(e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
                      onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Payment Date
                    </label>
                    <input 
                      type="date" 
                      required
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
                      onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid var(--border-2)", paddingTop: 16 }}>
                <button 
                  type="button" 
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    padding: "11px 22px", borderRadius: 12, border: "1px solid var(--border)",
                    background: "var(--bg-hover)", color: "var(--text-2)", fontWeight: 700,
                    fontSize: 14, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: "11px 26px", borderRadius: 12, border: "none",
                    background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
                    color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: `0 10px 24px ${accent.shadow}`
                  }}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
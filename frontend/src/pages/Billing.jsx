import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import BillingTable from "../components/ui/BillingTable.jsx";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import ImageWithFallback from "../components/ImageWithFallback.jsx";
import API_BASE from "../api";

// Load Razorpay checkout.js script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  const [verifying, setVerifying]               = useState(false);
  const [razorpayLoading, setRazorpayLoading]   = useState(false);

  // Opens Razorpay checkout popup — amount is pre-filled, payment auto-recorded on success
  const openRazorpayCheckout = useCallback(async () => {
    const targetMember = selectedMember;
    if (!targetMember) { toast.error("Please select a member first"); return; }
    const numericAmount = Number(payAmount);
    if (!numericAmount || numericAmount <= 0) { toast.error("Please enter a valid amount"); return; }
    if (numericAmount > Number(targetMember.amount_remain)) {
      toast.error(`Amount exceeds remaining due of ₹${targetMember.amount_remain}`); return;
    }

    setRazorpayLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay. Check your internet connection.");
      setRazorpayLoading(false); return;
    }

    // Create order on our backend
    let orderData;
    try {
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: targetMember.id, member_name: targetMember.name, amount: numericAmount }),
      });
      orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Order creation failed");
    } catch (err) {
      toast.error(err.message || "Could not create payment order");
      setRazorpayLoading(false); return;
    }

    setRazorpayLoading(false);

    // Open Razorpay checkout modal
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: localStorage.getItem("messmate_name") || "MessMate System",
      description: `Payment for ${targetMember.name}`,
      order_id: orderData.order_id,
      prefill: { name: targetMember.name, contact: targetMember.phone || "" },
      notes: { member_id: String(targetMember.id), member_name: targetMember.name },
      theme: { color: accent.hex },
      modal: {
        ondismiss: () => toast.info("Payment cancelled"),
      },
      handler: function(response) {
        // Payment success — record it in our DB (also handled by webhook automatically)
        const payload = {
          member_id: targetMember.id,
          member_name: targetMember.name,
          amount_paid: numericAmount,
          payment_method: "UPI",
          transaction_id: response.razorpay_payment_id,
          paid_on: new Date().toISOString().split("T")[0],
        };
        fetch(`${API_BASE}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(r => r.json().then(d => ({ ok: r.ok, d })))
          .then(({ ok, d }) => {
            if (ok) {
              toast.success(`✅ ₹${numericAmount} payment received from ${targetMember.name}! (Ref: ${response.razorpay_payment_id})`);
              setShowPaymentModal(false);
              fetchMembers();
            } else {
              // May already be recorded by webhook — still show success
              toast.success(`✅ Payment of ₹${numericAmount} confirmed! (Razorpay: ${response.razorpay_payment_id})`);
              setShowPaymentModal(false);
              fetchMembers();
            }
          })
          .catch(() => {
            toast.success(`✅ Payment received! Recording... (Ref: ${response.razorpay_payment_id})`);
            fetchMembers();
          });
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function(response) {
      toast.error(`Payment failed: ${response.error.description}`);
    });
    rzp.open();
  }, [selectedMember, payAmount, accent.hex, fetchMembers]);

  function fetchMembers() {
    setLoading(true);
    fetch(`${API_BASE}/members`)
      .then(res => { if (!res.ok) throw new Error("Server returned an error"); return res.json(); })
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false); setError(""); })
      .catch(err => {
        setError("⚠️ Cannot connect to backend. Please ensure the server is running.");
        setLoading(false);
      });
  }

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

    // Require transaction reference ID for online methods
    if (payMethod !== "Cash" && !payTxId.trim()) {
      toast.error("Please enter the UTR / Transaction Reference ID from your payment app receipt");
      return;
    }

    setVerifying(true);

    // 2-second verification simulation before DB commit
    setTimeout(() => {
      const payload = {
        member_id: targetMember.id,
        member_name: targetMember.name,
        amount_paid: numericAmount,
        payment_method: payMethod,
        transaction_id: payTxId.trim(),
        paid_on: payDate
      };

      fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(res => {
          // Always parse JSON first so we can show the real backend message
          return res.json().then(data => ({ ok: res.ok, data }));
        })
        .then(({ ok, data }) => {
          setVerifying(false);
          if (!ok) {
            // Show exact backend error (e.g. duplicate UTR, member not found)
            toast.error(data.message || "Payment failed. Please try again.");
            return;
          }
          toast.success(`✅ ₹${numericAmount} payment verified & recorded for ${targetMember.name}!`);
          setShowPaymentModal(false);
          fetchMembers();
        })
        .catch(err => {
          setVerifying(false);
          console.error(err);
          toast.error("⚠️ Network error: Could not reach the server. Please ensure the backend is running.");
        });
    }, 2000);
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
          <div className="members-modal-inner" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", maxWidth: selectedMember ? Math.min(680, window.innerWidth - 16) : Math.min(500, window.innerWidth - 16), width: "100%" }}>
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
              <fieldset disabled={verifying} style={{ border: "none", padding: 0, margin: 0, display: "contents" }}>
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
                      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      borderRadius: 20,
                      padding: "20px 16px",
                      border: "1px dashed var(--border)",
                      position: "relative",
                      gap: 14,
                      minHeight: 320,
                      justifyContent: "center",
                      boxShadow: "inset 0 0 12px rgba(0,0,0,0.05)"
                    }}>
                      {/* Ticket Header */}
                      <div style={{ width: "100%", borderBottom: "1px dashed var(--border-2)", paddingBottom: 10, marginBottom: 4, textAlign: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: accent.hex, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          Payment Invoice
                        </span>
                        <h4 style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
                          {selectedMember.name}
                        </h4>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>
                          Ref ID: #MM-{selectedMember.id}
                        </p>
                      </div>

                      {payMethod === "Cash" ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 36 }}>💵</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Collect Offline Cash
                          </span>
                          <p style={{ margin: 0, fontSize: 18, color: "var(--text)", fontWeight: 900 }}>
                            ₹{payAmount || selectedMember.amount_remain}
                          </p>
                          <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 500 }}>
                            No QR Code scan required.
                          </span>
                        </div>
                      ) : (
                        <>
                        <ImageWithFallback 
                          src={process.env.PUBLIC_URL + "/payment_qr.jpg"} 
                          alt="Real Payment QR" 
                          style={{ 
                            width: 140,
                            height: 140,
                            borderRadius: 8,
                            border: "4px solid #fff",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                            objectFit: "contain"
                          }} 
                          fallback={<div style={{ width: 140, height: 140, background: "var(--bg-card)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>Image unavailable</div>}
                        />
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 10, color: "var(--text-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Scan to pay exact amount
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: 18, color: "#16a34a", fontWeight: 900 }}>
                              ₹{payAmount || selectedMember.amount_remain}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Ticket Footer */}
                      <div style={{ width: "100%", borderTop: "1px dashed var(--border-2)", paddingTop: 10, marginTop: 4, textAlign: "center", fontSize: 10, color: "var(--text-4)", fontWeight: 600 }}>
                        Outstanding Due: ₹{selectedMember.amount_remain}
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
                        <option value="Cash">Cash (Offline)</option>
                        <option value="Card">Credit / Debit Card</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </div>

                    {/* Transaction ID */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        Transaction Ref / UTR ID {payMethod !== "Cash" && <span style={{ color: "#ef4444" }}>*</span>}
                      </label>
                      <input 
                        type="text" 
                        required={payMethod !== "Cash"}
                        placeholder={payMethod === "UPI" ? "Enter 12-digit UPI reference ID" : "e.g. Bank reference number"}
                        value={payTxId}
                        onChange={e => setPayTxId(e.target.value)}
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = accent.hex; e.target.style.boxShadow = `0 0 0 3px ${accent.hex}22`; }}
                        onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                      />
                      {payMethod === "UPI" && (
                        <p style={{ margin: "4px 0 0", fontSize: 10, color: "var(--text-4)", fontStyle: "italic" }}>
                          *Check GPay/PhonePe receipt for 12-digit UTR reference.
                        </p>
                      )}
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

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid var(--border-2)", paddingTop: 16, flexWrap: "wrap" }}>
                  <button 
                    type="button" 
                    disabled={verifying || razorpayLoading}
                    onClick={() => setShowPaymentModal(false)}
                    style={{
                      padding: "11px 22px", borderRadius: 12, border: "1px solid var(--border)",
                      background: "var(--bg-hover)", color: "var(--text-2)", fontWeight: 700,
                      fontSize: 14, cursor: (verifying || razorpayLoading) ? "not-allowed" : "pointer"
                    }}
                  >
                    Cancel
                  </button>

                  {/* Razorpay online payment button — opens checkout popup */}
                  {payMethod !== "Cash" && selectedMember && (
                    <button 
                      type="button"
                      disabled={verifying || razorpayLoading || !payAmount}
                      onClick={openRazorpayCheckout}
                      style={{
                        padding: "11px 26px", borderRadius: 12, border: "none",
                        background: razorpayLoading ? "var(--border)" : "linear-gradient(135deg, #528ff0, #3160c0)",
                        color: razorpayLoading ? "var(--text-4)" : "#fff", fontWeight: 800, fontSize: 14,
                        cursor: (verifying || razorpayLoading || !payAmount) ? "not-allowed" : "pointer",
                        boxShadow: razorpayLoading ? "none" : "0 10px 24px rgba(82,143,240,0.4)",
                        display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      {razorpayLoading ? (
                        "⏳ Opening Razorpay..."
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M22 9V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zm-4 10H4V5h14v14z"/>
                            <path d="M6 13h5v4H6zm0-6h12v4H6z"/>
                          </svg>
                          Pay ₹{payAmount || "?"} via Razorpay
                        </>
                      )}
                    </button>
                  )}

                  {/* Manual confirm for Cash payments */}
                  {payMethod === "Cash" && (
                    <button 
                      type="submit"
                      disabled={verifying}
                      style={{
                        padding: "11px 26px", borderRadius: 12, border: "none",
                        background: verifying ? "var(--border)" : `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
                        color: verifying ? "var(--text-4)" : "#fff", fontWeight: 800, fontSize: 14,
                        cursor: verifying ? "not-allowed" : "pointer",
                        boxShadow: verifying ? "none" : `0 10px 24px ${accent.shadow}`
                      }}
                    >
                      {verifying ? "🔄 Recording..." : "✓ Mark Cash Received"}
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import BillingTable from "../components/ui/BillingTable.jsx";

const trendMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const trendHeights = [72, 62, 60, 58, 59, 53, 55];

function StatCard({ item }) {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
          backgroundColor: item.iconBg,
          color: item.iconColor,
        }}
      >
        {item.icon}
      </div>
      <p style={styles.statTitle}>{item.title}</p>
      <h3 style={styles.statValue}>{item.value}</h3>
      <span style={styles.statSub}>{item.sub}</span>
    </div>
  );
}

function normalizeDate(input) {
  const d = input ? new Date(input) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDerivedStatus(member, today) {
  const dueDate = normalizeDate(member.due_date);
  const remain = Number(member.amount_remain || 0);

  if (remain <= 0 || member.status === "paid") return "paid";
  if (dueDate && dueDate < today) return "overdue";
  return "pending";
}

function SidebarPanel({ members }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const thisMonthMembers = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(23, 59, 59, 999);

    return members.filter((member) => {
      const startDate = normalizeDate(member.starting_date);
      return startDate && startDate >= monthStart && startDate <= monthEnd;
    });
  }, [members, today]);

  const summary = useMemo(() => {
    const totalExpected = thisMonthMembers.reduce(
      (sum, member) => sum + Number(member.total_amount || 0),
      0
    );

    const collected = thisMonthMembers.reduce(
      (sum, member) => sum + Number(member.amount_paid || 0),
      0
    );

    const pending = thisMonthMembers.reduce(
      (sum, member) => sum + Number(member.amount_remain || 0),
      0
    );

    const overdue = thisMonthMembers.reduce((sum, member) => {
      const dueDate = normalizeDate(member.due_date);
      const remain = Number(member.amount_remain || 0);

      const isOverdue =
        dueDate &&
        dueDate < today &&
        member.status !== "paid" &&
        remain > 0;

      return isOverdue ? sum + remain : sum;
    }, 0);

    const paidCount = thisMonthMembers.filter(
      (member) => Number(member.amount_remain || 0) === 0
    ).length;

    const pendingCount = thisMonthMembers.filter(
      (member) => Number(member.amount_remain || 0) > 0
    ).length;

    const collectedPercent =
      totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;

    return {
      totalExpected,
      collected,
      pending,
      overdue,
      paidCount,
      pendingCount,
      collectedPercent,
    };
  }, [thisMonthMembers, today]);

  return (
    <div style={styles.sidebar}>
      <div style={styles.sideCard}>
        <h3 style={styles.sideHeading}>Revenue Trend</h3>
        <p style={styles.sideSubheading}>Last 7 months</p>

        <div style={styles.chartBox}>
          <div style={styles.chartGrid}>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} style={styles.gridLine} />
            ))}
          </div>

          <div style={styles.lineArea}>
            {trendHeights.map((h, i) => (
              <div
                key={i}
                style={{
                  ...styles.pointWrap,
                  left: `${i * 15}%`,
                  top: `${h}%`,
                }}
              >
                <div style={styles.chartPoint} />
                {i < trendHeights.length - 1 && <div style={styles.fakeLine} />}
              </div>
            ))}
          </div>

          <div style={styles.chartLabels}>
            {trendMonths.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.sideCard}>
        <h3 style={styles.sideHeading}>Payment Summary</h3>

        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Monthly Revenue</span>
          <span style={styles.summaryValue}>
            ₹{summary.totalExpected.toLocaleString("en-IN")}
          </span>
        </div>

        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Collected</span>
          <span style={{ ...styles.summaryValue, color: "#16a34a" }}>
            ₹{summary.collected.toLocaleString("en-IN")}
          </span>
        </div>

        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Pending</span>
          <span style={{ ...styles.summaryValue, color: "#d97706" }}>
            ₹{summary.pending.toLocaleString("en-IN")}
          </span>
        </div>

        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Overdue</span>
          <span style={{ ...styles.summaryValue, color: "#ef4444" }}>
            ₹{summary.overdue.toLocaleString("en-IN")}
          </span>
        </div>

        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Payments</span>
          <span style={styles.summaryValue}>{summary.paidCount} paid</span>
        </div>

        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Pending Members</span>
          <span style={styles.summaryValue}>{summary.pendingCount}</span>
        </div>

        <div style={styles.progressBar}>
          <div
            style={{ ...styles.progressFill, width: `${summary.collectedPercent}%` }}
          />
        </div>

        <span style={styles.progressText}>
          {summary.collectedPercent}% collected
        </span>
      </div>
    </div>
  );
}

export default function Billing() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/members")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setLoading(false);
      });
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const thisMonthMembers = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(23, 59, 59, 999);

    return members.filter((member) => {
      const startDate = normalizeDate(member.starting_date);
      return startDate && startDate >= monthStart && startDate <= monthEnd;
    });
  }, [members, today]);

  const totalExpected = thisMonthMembers.reduce(
    (sum, member) => sum + Number(member.total_amount || 0),
    0
  );

  const collected = thisMonthMembers.reduce(
    (sum, member) => sum + Number(member.amount_paid || 0),
    0
  );

  const pending = thisMonthMembers.reduce(
    (sum, member) => sum + Number(member.amount_remain || 0),
    0
  );

  const overdue = thisMonthMembers.reduce((sum, member) => {
    const dueDate = normalizeDate(member.due_date);
    const remain = Number(member.amount_remain || 0);

    const isOverdue =
      dueDate &&
      dueDate < today &&
      member.status !== "paid" &&
      remain > 0;

    return isOverdue ? sum + remain : sum;
  }, 0);

  const paidCount = thisMonthMembers.filter(
    (member) => Number(member.amount_remain || 0) === 0
  ).length;

  const pendingCount = thisMonthMembers.filter(
    (member) => Number(member.amount_remain || 0) > 0
  ).length;

  const overdueCount = thisMonthMembers.filter((member) => {
    const dueDate = normalizeDate(member.due_date);
    return (
      dueDate &&
      dueDate < today &&
      member.status !== "paid" &&
      Number(member.amount_remain || 0) > 0
    );
  }).length;

  const statsData = [
    {
      title: "Monthly Revenue",
      value: `₹${totalExpected.toLocaleString("en-IN")}`,
      sub: `${thisMonthMembers.length} members`,
      icon: "↗",
      iconBg: "#eaf2ff",
      iconColor: "#3b82f6",
    },
    {
      title: "Collected This Month",
      value: `₹${collected.toLocaleString("en-IN")}`,
      sub: `${paidCount} payments`,
      icon: "💵",
      iconBg: "#e8f9f0",
      iconColor: "#22c55e",
    },
    {
      title: "Pending Amount",
      value: `₹${pending.toLocaleString("en-IN")}`,
      sub: `${pendingCount} members`,
      icon: "◔",
      iconBg: "#fff5e8",
      iconColor: "#f59e0b",
    },
    {
      title: "Overdue",
      value: `₹${overdue.toLocaleString("en-IN")}`,
      sub: `${overdueCount} members`,
      icon: "!",
      iconBg: "#ffecef",
      iconColor: "#ef4444",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Billing</h1>
          <p style={styles.subtitle}>Track payments and dues</p>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.exportBtn}>Export</button>
          <button style={styles.invoiceBtn}>+ New Invoice</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {statsData.map((item, index) => (
          <StatCard key={index} item={item} />
        ))}
      </div>

      <div style={styles.contentGrid}>
        <BillingTable members={thisMonthMembers} loading={loading} error={error} />
        <SidebarPanel members={members} />
      </div>
    </div>
  );
}
const styles = {
  page: {
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "Inter, sans-serif",
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  exportBtn: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#4b5563",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  invoiceBtn: {
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
    border: "1px solid #eef2f7",
  },
  statIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    marginBottom: "18px",
  },
  statTitle: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#9ca3af",
  },
  statValue: {
    margin: "8px 0 6px",
    fontSize: "34px",
    fontWeight: 700,
    color: "#111827",
  },
  statSub: {
    fontSize: "13px",
    color: "#9ca3af",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 3fr) 300px",
    gap: "18px",
    alignItems: "start",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  sideCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid #eef2f7",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
  },
  sideHeading: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
  sideSubheading: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#9ca3af",
  },
  chartBox: {
    marginTop: "18px",
  },
  chartGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    marginBottom: "-110px",
  },
  gridLine: {
    borderTop: "1px dashed #e5e7eb",
  },
  lineArea: {
    position: "relative",
    height: "140px",
    marginTop: "10px",
    marginBottom: "16px",
  },
  pointWrap: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
  },
  chartPoint: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    border: "2px solid #ffffff",
    boxShadow: "0 0 0 2px #bfdbfe",
  },
  fakeLine: {
    width: "42px",
    height: "2px",
    backgroundColor: "#2563eb",
    marginLeft: "2px",
    borderRadius: "999px",
  },
  chartLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#9ca3af",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "18px",
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#111827",
  },
  progressBar: {
    marginTop: "20px",
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: "999px",
  },
  progressText: {
    display: "inline-block",
    marginTop: "8px",
    fontSize: "12px",
    color: "#9ca3af",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid #eef2f7",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
  },
  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterTabs: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  filterBtn: {
    border: "none",
    background: "transparent",
    color: "#6b7280",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  filterBtnActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
  tableMonth: {
    fontSize: "13px",
    color: "#9ca3af",
    fontWeight: 600,
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "860px",
  },
  th: {
    textAlign: "left",
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "16px 18px",
    backgroundColor: "#f8fafc",
    fontWeight: 700,
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "16px 18px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "middle",
  },
  tdMuted: {
    padding: "16px 18px",
    fontSize: "14px",
    color: "#9ca3af",
    verticalAlign: "middle",
  },
  amountText: {
    fontWeight: 700,
    color: "#111827",
  },
  memberCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0,
  },
  memberName: {
    fontWeight: 600,
    color: "#1f2937",
  },
  roomBadge: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  statusDot: {
    fontSize: "14px",
    lineHeight: 1,
  },
  tableFooter: {
    padding: "14px 18px",
    fontSize: "13px",
    color: "#9ca3af",
  },
  messageBox: {
    padding: "24px 18px",
    fontSize: "14px",
    color: "#6b7280",
  },
  emptyCell: {
    textAlign: "center",
    padding: "24px",
    color: "#9ca3af",
    fontSize: "14px",
  },
};
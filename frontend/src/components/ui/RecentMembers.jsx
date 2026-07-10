import { useEffect, useState } from "react";

const RecentMembers = () => {
  const [members, setMembers] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/members")
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Database data:", data);
        setMembers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.log("Fetch error:", err));
  }, []);

  const sortedMembers = [...members].sort((a, b) => {
    const dateA = new Date(a.starting_date || a.startingDate || 0).getTime();
    const dateB = new Date(b.starting_date || b.startingDate || 0).getTime();
    return dateB - dateA;
  });

  const visibleMembers = showAll ? sortedMembers : sortedMembers.slice(0, 4);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Recent Members</h2>
          <p style={styles.subtitle}>
            {showAll
              ? `Showing all ${members.length} members`
              : `Showing top ${visibleMembers.length} recent members`}
          </p>
        </div>

        <button style={styles.viewBtn} onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Recent" : "View All"}
        </button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>S.No</th>
              <th style={styles.th}>Member Name</th>
              <th style={styles.th}>Phone Number</th>
              <th style={styles.th}>Amount Remain</th>
              <th style={styles.th}>Starting Date</th>
            </tr>
          </thead>

          <tbody>
            {visibleMembers.map((member, index) => (
              <tr key={member.id || index} style={styles.row}>
                <td style={styles.td}>
                  <span style={styles.serialBadge}>{index + 1}</span>
                </td>

                <td style={styles.td}>
                  <div style={styles.memberInfo}>
                    <div style={styles.avatar}>{getInitials(member.name)}</div>
                    <div style={styles.memberName}>{member.name}</div>
                  </div>
                </td>

                <td style={styles.td}>{member.phone || "-"}</td>
                <td style={styles.td}>₹ {member.amount_remain || 0}</td>

                <td style={styles.td}>
                  {member.starting_date || member.startingDate
                    ? new Date(member.starting_date || member.startingDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "16px",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  viewBtn: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#94a3b8",
    fontWeight: 700,
  },
  row: {
    background: "#fff",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
    borderRadius: "14px",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#1e293b",
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
  },
  memberInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 700,
    fontSize: "14px",
    flexShrink: 0,
    border: "3px solid rgba(59, 130, 246, 0.18)",
  },
  memberName: {
    fontWeight: 600,
    color: "#0f172a",
  },
  serialBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: "14px",
  },
};

export default RecentMembers;
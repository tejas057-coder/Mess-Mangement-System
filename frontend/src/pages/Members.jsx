import { useEffect, useState } from "react";

function Members() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fee, setFee] = useState("");
  const [startingDate, setStartingDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetch("http://localhost:5000/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.log(err));
  }, []);

  const handlesubmit = async (e) => {
    e.preventDefault();
    const member = { name, phone, fee, startingDate };

    try {
      const res = await fetch("http://localhost:5000/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(member),
      });

      const data = await res.json();

      setMembers((prev) => [...prev, data]);

      setName("");
      setPhone("");
      setFee("");
      setStartingDate(new Date().toISOString().split("T")[0]);
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleView = (member) => {
    console.log("View member:", member);
  };

  const handleEdit = (member) => {
    console.log("Edit member:", member);
  };

  const handleDelete = (member) => {
    console.log("Delete member:", member);
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <div>
          <h1 style={styles.heading}>Members</h1>
          <p style={styles.subheading}>
            Manage resident profiles, contact details and joining dates
          </p>
        </div>

        <button style={styles.primaryButton} onClick={() => setShowForm(true)}>
          + Add Member
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statCardAccent}></div>
          <span style={styles.statLabel}>Total Members</span>
          <h3 style={styles.statValue}>{members.length}</h3>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardAccent}></div>
          <span style={styles.statLabel}>Active Records</span>
          <h3 style={styles.statValue}>{members.length}</h3>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardAccent}></div>
          <span style={styles.statLabel}>Latest Join Date</span>
          <h3 style={styles.statValueSmall}>
            {members.length > 0
              ? new Date(
                members[members.length - 1]?.starting_date ||
                members[members.length - 1]?.startingDate
              ).toLocaleDateString("en-IN")
              : "--"}
          </h3>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>Member Directory</h2>
            <p style={styles.tableSubtitle}>All registered mess members</p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Mobile Number</th>
                <th style={styles.th}>Monthly Fee</th>
                <th style={styles.th}>Starting Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} style={styles.row}>
                    <td style={styles.td}>#{member.id}</td>

                    <td style={styles.td}>
                      <div style={styles.memberCell}>
                        <div style={styles.avatar}>
                          {member.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p style={styles.memberName}>{member.name}</p>
                          <span style={styles.memberMeta}>Mess Member</span>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{member.phone}</td>
                    <td style={styles.td}>₹{member.fee || "--"}</td>
                    <td style={styles.td}>
                      {member.starting_date || member.startingDate
                        ? new Date(
                          member.starting_date || member.startingDate
                        ).toLocaleDateString("en-IN")
                        : "--"}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          type="button"
                          style={styles.viewActionBtn}
                          onClick={() => handleView(member)}
                          title="View"
                        >
                          👁
                        </button>

                        <button
                          type="button"
                          style={styles.editActionBtn}
                          onClick={() => handleEdit(member)}
                          title="Edit"
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          style={styles.deleteActionBtn}
                          onClick={() => handleDelete(member)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.emptyCell}>
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalTop}>
              <div>
                <h2 style={styles.modalTitle}>Add New Member</h2>
                <p style={styles.modalSubtitle}>
                  Fill in member details below
                </p>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() => setShowForm(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlesubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    style={styles.input}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="text"
                    placeholder="10-digit number"
                    value={phone}
                    style={styles.input}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Monthly Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3000"
                    value={fee}
                    style={styles.input}
                    onChange={(e) => setFee(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Starting Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={startingDate}
                    onChange={(e) => setStartingDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.saveBtn}>
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
    padding: "24px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  headerCard: {
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  heading: {
    fontSize: "32px",
    fontWeight: 800,
    margin: 0,
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  subheading: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.22)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
    position: "relative",
    overflow: "hidden",
  },
  statCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #2563eb, #7c3aed, #06b6d4)",
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    marginBottom: "8px",
    fontWeight: 700,
  },
  statValue: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  statValueSmall: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },
  tableCard: {
    background: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  tableHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #eef2f7",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  },
  tableTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
  },
  tableSubtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
    minWidth: "760px",
    padding: "0 12px 12px",
  },
  th: {
    color: "#94a3b8",
    padding: "14px 18px",
    textAlign: "left",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 800,
    background: "transparent",
  },
  row: {
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },
  td: {
    padding: "18px 18px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
  },
  memberCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #8b5cf6)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
    flexShrink: 0,
    border: "3px solid rgba(59, 130, 246, 0.18)",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.18)",
  },
  memberName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },
  memberMeta: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  viewActionBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    border: "1px solid rgba(37, 99, 235, 0.25)",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(37, 99, 235, 0.08)",
  },
  editActionBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    background: "#fffbeb",
    color: "#d97706",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(245, 158, 11, 0.08)",
  },
  deleteActionBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(239, 68, 68, 0.08)",
  },
  emptyCell: {
    textAlign: "center",
    padding: "36px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.48)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "540px",
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 30px 70px rgba(15, 23, 42, 0.24)",
    border: "1px solid #eef2f7",
  },
  modalTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f172a",
  },
  modalSubtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "14px",
  },
  closeBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    padding: "13px 14px",
    border: "1px solid #dbe3ee",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },
};

export default Members;
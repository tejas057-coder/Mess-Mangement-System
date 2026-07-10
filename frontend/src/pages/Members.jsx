import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function Members() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [amountRemain, setAmountRemain] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paidOn, setPaidOn] = useState("");
  const [status, setStatus] = useState("pending");
  const [totalAmount, setTotalAmount] = useState("");
  const [startingDate, setStartingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingMember, setEditingMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.log(err));
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalMembers = members.length;

  const activeMembers = members.filter(
    (m) => (m.status || "").toLowerCase() === "paid"
  ).length;

  const inactiveMembers = members.filter(
    (m) => (m.status || "").toLowerCase() !== "paid"
  ).length;

  const newMembersThisMonth = members.filter((m) => {
    const d = new Date(m.starting_date || m.startingDate);
    return (
      !isNaN(d.getTime()) &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  }).length;

  const handleEdit = (member) => {
    setEditingMember(member);
    setName(member.name ?? "");
    setPhone(member.phone ?? "");
    setAmountPaid(member.amount_paid ?? "");
    setAmountRemain(member.amount_remain ?? "");
    setDueDate(member.due_date ? member.due_date.split("T")[0] : "");
    setPaidOn(member.paid_on ? member.paid_on.split("T")[0] : "");
    setStatus(member.status ?? "pending");
    setTotalAmount(member.total_amount ?? "");
    setStartingDate(
      member.starting_date
        ? member.starting_date.split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setShowForm(true);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setName("");
    setPhone("");
    setAmountPaid("");
    setAmountRemain("");
    setDueDate("");
    setPaidOn("");
    setStatus("pending");
    setTotalAmount("");
    setStartingDate(new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    const member = {
      name,
      phone,
      starting_date: startingDate,
      amount_paid: amountPaid,
      amount_remain: amountRemain,
      due_date: dueDate,
      paid_on: paidOn,
      status,
      total_amount: totalAmount,
    };

    try {
      let res;
      if (editingMember) {
        res = await fetch(`http://localhost:5000/members/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        });

        if (!res.ok) throw new Error("Failed to update member");

        const updatedMember = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? updatedMember : m))
        );
        toast.success("Member updated successfully!");
      } else {
        res = await fetch("http://localhost:5000/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        });

        if (!res.ok) throw new Error("Failed to add member");

        const newMember = await res.json();
        setMembers((prev) => [...prev, newMember]);
        toast.success("Member added successfully!");
      }

      setName("");
      setPhone("");
      setAmountPaid("");
      setAmountRemain("");
      setDueDate("");
      setPaidOn("");
      setStatus("pending");
      setTotalAmount("");
      setStartingDate(new Date().toISOString().split("T")[0]);
      setEditingMember(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const handleView = (member) => {
    console.log("View member:", member);
  };

  const handleDelete = (member) => {
    setDeleteMember(member);
  };

  const cancelDelete = () => {
    setDeleteMember(null);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/members/${deleteMember.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete member");

      setMembers((prev) => prev.filter((member) => member.id !== deleteMember.id));
      setDeleteMember(null);
      toast.success("Member deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Unable to delete member.");
    }
  };

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return members.filter((member) => {
      const memberStatus = (member.status || "pending").toLowerCase();
      const matchesStatus =
        activeFilter === "all" ? true : memberStatus === activeFilter;

      if (!matchesStatus) return false;

      if (!q) return true;

      const idText = String(member.id ?? "").toLowerCase();
      const nameText = String(member.name ?? "").toLowerCase();
      const phoneText = String(member.phone ?? "").toLowerCase();

      return idText.includes(q) || nameText.includes(q) || phoneText.includes(q);
    });
  }, [members, activeFilter, searchTerm]);

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <div>
          <h1 style={styles.heading}>Members</h1>
          <p style={styles.subheading}>
            Manage resident profiles, contact details and joining dates
          </p>
        </div>

        <button style={styles.primaryButton} onClick={handleAddMember}>
          + Add Member
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.cardPurple }}>
          <span style={styles.statLabel}>Total Members</span>
          <h3 style={styles.statValue}>{totalMembers}</h3>
          <div style={styles.cardIcon}>↗</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.cardGreen }}>
          <span style={styles.statLabel}>Active Members</span>
          <h3 style={styles.statValue}>{activeMembers}</h3>
          <div style={styles.cardIcon}>↗</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.cardBlue }}>
          <span style={styles.statLabel}>Inactive Members</span>
          <h3 style={styles.statValue}>{inactiveMembers}</h3>
          <div style={styles.cardIcon}>↗</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.cardPink }}>
          <span style={styles.statLabel}>New Members This Month</span>
          <h3 style={styles.statValue}>{newMembersThisMonth}</h3>
          <div style={styles.cardIcon}>↗</div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.tableHeaderTop}>
            <div>
              <h2 style={styles.tableTitle}>Member Directory</h2>
              <p style={styles.tableSubtitle}>All registered mess members</p>
            </div>

            <input
              type="text"
              placeholder="Search by name, mobile number, or id"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterTabs}>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              style={{
                ...styles.filterBtn,
                ...(activeFilter === "all" ? styles.filterBtnActive : {}),
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("paid")}
              style={{
                ...styles.filterBtn,
                ...(activeFilter === "paid" ? styles.filterBtnActive : {}),
              }}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("pending")}
              style={{
                ...styles.filterBtn,
                ...(activeFilter === "pending" ? styles.filterBtnActive : {}),
              }}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("overdue")}
              style={{
                ...styles.filterBtn,
                ...(activeFilter === "overdue" ? styles.filterBtnActive : {}),
              }}
            >
              Overdue
            </button>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Mobile Number</th>
                <th style={styles.th}>Total Amount</th>
                <th style={styles.th}>Amount Paid</th>
                <th style={styles.th}>Amount Remain</th>
                <th style={styles.th}>Starting Date</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} style={styles.row}>
                    <td style={styles.td}>{member.id}</td>

                    <td style={styles.td}>
                      <div style={styles.memberCell}>
                        <div style={styles.avatar}>
                          {member.name ? member.name.slice(0, 2).toUpperCase() : "NA"}
                        </div>
                        <div>
                          <p style={styles.memberName}>{member.name}</p>
                          <span style={styles.memberMeta}>Mess Member</span>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{member.phone}</td>
                    <td style={styles.td}>₹{member.total_amount || "--"}</td>
                    <td style={styles.td}>₹{member.amount_paid || "--"}</td>
                    <td style={styles.td}>₹{member.amount_remain || "--"}</td>
                    <td style={styles.td}>
                      {member.starting_date || member.startingDate
                        ? new Date(
                          member.starting_date || member.startingDate
                        ).toLocaleDateString("en-IN")
                        : "--"}
                    </td>
                    <td style={styles.td}>
                      {member.due_date
                        ? new Date(member.due_date).toLocaleDateString("en-IN")
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
                  <td colSpan="9" style={styles.emptyCell}>
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
                <h2 style={styles.modalTitle}>
                  {editingMember ? "Update Member" : "Add New Member"}
                </h2>
                <p style={styles.modalSubtitle}>Fill in member details below</p>
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
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    value={name}
                    style={styles.input}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter member name"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    style={styles.input}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Starting Date</label>
                  <input
                    type="date"
                    value={startingDate}
                    style={styles.input}
                    onChange={(e) => setStartingDate(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount Paid</label>
                  <input
                    type="number"
                    value={amountPaid}
                    style={styles.input}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount Remain</label>
                  <input
                    type="number"
                    value={amountRemain}
                    style={styles.input}
                    onChange={(e) => setAmountRemain(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    style={styles.input}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Paid On</label>
                  <input
                    type="date"
                    value={paidOn}
                    style={styles.input}
                    onChange={(e) => setPaidOn(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={status}
                    style={styles.input}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="overdue">overdue</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Amount</label>
                  <input
                    type="number"
                    value={totalAmount}
                    style={styles.input}
                    onChange={(e) => setTotalAmount(e.target.value)}
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
                  {editingMember ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteMember && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Remove Member</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>{deleteMember.name}</strong> from the Mess?
            </p>

            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={cancelDelete}>
                Cancel
              </button>

              <button style={styles.deleteButton} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;


const styles = {
  page: {
    height: "100vh",
    // overflowY: "auto",
    scrollBehavior: "smooth",
    // WebkitOverflowScrolling: "touch",
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
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },
  statCard: {
    position: "relative",
    minHeight: "100px",
    borderRadius: "28px",
    padding: "22px",
    color: "#fff",
    overflow: "hidden",
    boxShadow: "0 18px 30px rgba(15, 23, 42, 0.16)",
  },
  cardPurple: {
    background: "linear-gradient(135deg, #b46ac9, #8b5cf6)",
  },
  cardGreen: {
    background: "linear-gradient(135deg, #7dd37f, #22c55e)",
  },
  cardBlue: {
    background: "linear-gradient(135deg, #76b7e8, #3b82f6)",
  },
  cardPink: {
    background: "linear-gradient(135deg, #df6c9d, #e11d48)",
  },
  statLabel: {
    display: "block",
    fontSize: "15px",
    fontWeight: 700,
    opacity: 0.96,
    marginBottom: "10px",
  },
  statValue: {
    margin: 0,
    fontSize: "54px",
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },
  cardIcon: {
    position: "absolute",
    top: "16px",
    right: "18px",
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
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
  tableHeaderTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  searchInput: {
    minWidth: "260px",
    maxWidth: "360px",
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #dbe3ee",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
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
  filterTabs: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "14px",
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "24px",
    borderRadius: "10px",
    width: "380px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
  },
  cancelButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#dc3545",
    color: "#fff",
    cursor: "pointer",
  },
};
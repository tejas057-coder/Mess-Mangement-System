import { useMemo, useState } from "react";
import { toast } from "react-toastify";

function BillingTable({ members = [], loading, error }) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusStyle = (status) => {
        if (status === "paid") {
            return {
                color: "#16a34a",
                backgroundColor: "#eafaf0",
                border: "1px solid #ccefd9",
            };
        }

        if (status === "pending") {
            return {
                color: "#d97706",
                backgroundColor: "#fff7e6",
                border: "1px solid #fde7b0",
            };
        }

        if (status === "overdue") {
            return {
                color: "#dc2626",
                backgroundColor: "#fff0f0",
                border: "1px solid #fecaca",
            };
        }

        return {
            color: "#6b7280",
            backgroundColor: "#f3f4f6",
            border: "1px solid #e5e7eb",
        };
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
    };

    const formatAmount = (value) => {
        if (value === null || value === undefined || value === "") return "—";
        const num = Number(value);
        return Number.isNaN(num) ? "—" : `₹${num.toLocaleString("en-IN")}`;
    };

    const filteredMembers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();

        return members.filter((member) => {
            const status = (member.status || "pending").toLowerCase();
            const matchesStatus =
                activeFilter === "all" ? true : status === activeFilter;

            if (!matchesStatus) return false;
            if (!q) return true;

            const idText = String(member.id ?? "").toLowerCase();
            const nameText = String(member.name ?? "").toLowerCase();
            const phoneText = String(member.phone ?? "").toLowerCase();

            return (
                idText.includes(q) ||
                nameText.includes(q) ||
                phoneText.includes(q)
            );
        });
    }, [members, activeFilter, searchTerm]);

    return (
        <div style={styles.tableCard}>
            <div style={styles.tableTop}>
                <div style={styles.leftTop}>
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

                <div style={styles.rightTop}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, mobile, or id"
                        style={styles.searchInput}
                    />
                    <span style={styles.tableMonth}>July 2026</span>
                </div>
            </div>

            {loading ? (
                <div style={styles.messageBox}>Loading members...</div>
            ) : error ? (
                <div style={{ ...styles.messageBox, color: "#dc2626" }}>{error}</div>
            ) : (
                <>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Id</th>
                                    <th style={styles.th}>Member</th>
                                    <th style={styles.th}>Total Amount</th>
                                    <th style={styles.th}>Amount Paid</th>
                                    <th style={styles.th}>Amount Remain</th>
                                    <th style={styles.th}>Due Date</th>
                                    <th style={styles.th}>Paid On</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map((member, index) => {
                                        const status = member.status || "unknown";

                                        return (
                                            <tr key={member.id || index} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <span style={styles.roomBadge}>{member.id || "—"}</span>
                                                </td>

                                                <td style={styles.td}>
                                                    <div style={styles.memberCell}>
                                                        <div
                                                            style={{
                                                                ...styles.avatar,
                                                                backgroundColor:
                                                                    member.avatarBg ||
                                                                    (index % 2 === 0 ? "#2f6fed" : "#22c55e"),
                                                            }}
                                                        >
                                                            {member.initials ||
                                                                member.name?.slice(0, 2)?.toUpperCase() ||
                                                                "NA"}
                                                        </div>
                                                        <span style={styles.memberName}>
                                                            {member.name || "Unknown Member"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td style={{ ...styles.td, ...styles.amountText }}>
                                                    {formatAmount(member.total_amount)}
                                                </td>

                                                <td style={{ ...styles.td, ...styles.amountText }}>
                                                    {formatAmount(member.amount_paid)}
                                                </td>

                                                <td style={{ ...styles.td, ...styles.amountText }}>
                                                    {formatAmount(member.amount_remain)}
                                                </td>

                                                <td style={styles.tdMuted}>{formatDate(member.due_date)}</td>

                                                <td style={styles.tdMuted}>{formatDate(member.paid_on)}</td>

                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            ...styles.statusBadge,
                                                            ...getStatusStyle(status),
                                                        }}
                                                    >
                                                        <span style={styles.statusDot}>•</span>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td style={styles.tdMuted}>View</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={styles.emptyCell}>
                                            No billing records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.tableFooter}>
                        Showing {filteredMembers.length} of {members.length} invoices
                    </div>
                </>
            )}
        </div>
    );
}

export default BillingTable;

const styles = {
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
        gap: "12px",
    },
    leftTop: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
    },
    rightTop: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginLeft: "auto",
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    searchInput: {
        minWidth: "280px",
        border: "1px solid #dbe3ee",
        borderRadius: "999px",
        padding: "10px 14px",
        fontSize: "14px",
        outline: "none",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
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
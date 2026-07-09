import { useState } from "react";
import { FaSearch, FaBell, FaTimes } from "react-icons/fa";

function Navbar({ members = [], setFilteredMembers, onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const value = query.trim().toLowerCase();

    if (!value) {
      setFilteredMembers?.(members);
      onSearch?.("");
      return;
    }

    const filtered = members.filter((member) => {
      const name = (member.name || "").toLowerCase();
      const phone = String(member.phone || "").toLowerCase();
      return name.includes(value) || phone.includes(value);
    });

    setFilteredMembers?.(filtered);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    setFilteredMembers?.(members);
    onSearch?.("");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.searchBox}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name or mobile number..."
          style={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        {query && (
          <button type="button" style={styles.clearBtn} onClick={handleClear}>
            <FaTimes />
          </button>
        )}

        <button type="button" style={styles.searchBtn} onClick={handleSearch}>
          Search
        </button>
      </div>

      <div style={styles.right}>
        <button style={styles.bell}>
          <FaBell />
          <span style={styles.dot}></span>
        </button>

        <div style={styles.profile}>
          <div style={styles.avatar}>MO</div>
          <div>
            <p style={styles.name}>Mess Owner</p>
            <p style={styles.role}>Admin</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    height: "84px",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 28px",
    borderBottom: "1px solid rgba(226,232,240,0.9)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },

  searchBox: {
    width: "min(560px, 100%)",
    height: "48px",
    background: "#f8fbff",
    border: "1px solid #dbe3ee",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px 0 14px",
    gap: "10px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  },

  searchIcon: {
    color: "#94a3b8",
    fontSize: "14px",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    color: "#0f172a",
  },

  clearBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  searchBtn: {
    height: "36px",
    padding: "0 16px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.16)",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  bell: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#f8fbff",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    position: "relative",
    fontSize: "16px",
    color: "#475569",
  },

  dot: {
    width: "8px",
    height: "8px",
    background: "#ef4444",
    borderRadius: "50%",
    position: "absolute",
    top: "9px",
    right: "9px",
    border: "2px solid #fff",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "8px 10px",
    borderRadius: "16px",
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #06b6d4)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 800,
    fontSize: "15px",
    border: "3px solid rgba(59, 130, 246, 0.18)",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.18)",
  },

  name: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
  },

  role: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },
};

export default Navbar;
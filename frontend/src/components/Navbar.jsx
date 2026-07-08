import { FaSearch, FaBell } from "react-icons/fa";

function Navbar() {
  

  return (
    <nav style={styles.navbar}>
      <div style={styles.searchBox}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search members, rooms..."
          style={styles.input}
        />
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
      height: "80px",
      background: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 35px",
      borderBottom: "1px solid #e5e7eb",
    },

    searchBox: {
      width: "420px",
      height: "48px",
      background: "#f7f8fc",
      border: "1px solid #e5e7eb",
      borderRadius: "30px",
      display: "flex",
      alignItems: "center",
      padding: "0 18px",
    },

    searchIcon: {
      color: "#9ca3af",
      marginRight: "12px",
      fontSize: "15px",
    },

    input: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: "15px",
    },

    right: {
      display: "flex",
      alignItems: "center",
      gap: "25px",
    },

    bell: {
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      background: "#fff",
      border: "none",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      position: "relative",
      fontSize: "18px",
      color: "#6b7280",
    },

    dot: {
      width: "8px",
      height: "8px",
      background: "#2563eb",
      borderRadius: "50%",
      position: "absolute",
      top: "10px",
      right: "10px",
    },

    profile: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
    },

    avatar: {
      width: "46px",
      height: "46px",
      borderRadius: "50%",
      background: "#2563eb",
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      fontSize: "15px",
    },

    name: {
      margin: 0,
      fontSize: "15px",
      fontWeight: "600",
      color: "#111827",
    },

    role: {
      margin: 0,
      fontSize: "13px",
      color: "#6b7280",
    },
};
  

export default Navbar;
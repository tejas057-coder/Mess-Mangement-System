import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/",
    },
    {
      name: "Members",
      icon: <FaUsers />,
      path: "/members",
    },
    {
      name: "Attendance",
      icon: <FaCalendarAlt />,
      path: "/attendance",
    },
    {
      name: "Billing",
      icon: <FaMoneyBill />,
      path: "/billing",
    },
    {
      name: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        `}
      </style>

      <aside style={styles.sidebar}>
        <div style={styles.topSection}>
          <div style={styles.brandWrap}>
            <div style={styles.logoIcon}>🍽</div>
            <div>
              <h2 style={styles.logoText}>MessMate</h2>
              <p style={styles.logoSubtext}>Mess Management</p>
            </div>
          </div>

          <div style={styles.sectionLabel}>Main Menu</div>

          <nav style={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.item,
                  ...(isActive ? styles.active : {}),
                  textDecoration: "none",
                  color: isActive ? "#ffffff" : "#475569",
                })}
              >
                <span style={styles.iconWrap}>{item.icon}</span>
                <span style={styles.itemText}>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={styles.bottomArea}>
          <div style={styles.profileCard}>
            <div style={styles.profileAvatar}>M</div>
            <div style={styles.profileInfo}>
              <p style={styles.profileName}>Mess Admin</p>
              <span style={styles.profileRole}>Administrator</span>
            </div>
          </div>

          <button style={styles.logout}>
            <span style={styles.logoutIcon}>
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    position: "sticky",
    top: 0,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    borderRight: "1px solid #e5edf5",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "20px 16px 16px",
    boxSizing: "border-box",
    boxShadow: "4px 0 20px rgba(15, 23, 42, 0.04)",
    fontFamily: "'Inter', sans-serif",
  },

  topSection: {
    minHeight: 0,
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "10px 10px 24px 10px",
    borderBottom: "1px solid #edf2f7",
    marginBottom: "20px",
  },

  logoIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.18)",
    flexShrink: 0,
  },

  logoText: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },

  logoSubtext: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 500,
  },

  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#94a3b8",
    padding: "0 10px",
    marginBottom: "12px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
    transition: "all 0.25s ease",
    background: "transparent",
  },

  iconWrap: {
    width: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },

  itemText: {
    flex: 1,
  },

  active: {
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#ffffff",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
  },

  bottomArea: {
    position: "sticky",
    bottom: 0,
    background: "linear-gradient(180deg, rgba(248,251,255,0) 0%, #f8fbff 18%, #f8fbff 100%)",
    paddingTop: "18px",
    marginTop: "18px",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    border: "1px solid #e5edf5",
    borderRadius: "18px",
    padding: "12px",
    marginBottom: "12px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },

  profileAvatar: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0f172a, #334155)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "16px",
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.16)",
  },

  profileInfo: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  profileName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.2,
  },

  profileRole: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px",
    fontWeight: 500,
  },

  logout: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #fee2e2",
    background: "linear-gradient(180deg, #fff5f5 0%, #ffecec 100%)",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 6px 16px rgba(220, 38, 38, 0.08)",
  },

  logoutIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
  },
};

export default Sidebar;
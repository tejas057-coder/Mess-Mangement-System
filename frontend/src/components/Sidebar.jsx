import { useEffect, useState } from "react";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(getScreenSize());

  function getScreenSize() {
    if (window.innerWidth < 768) return "mobile";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  }

  useEffect(() => {
    const handleResize = () => {
      const nextScreen = getScreenSize();
      setScreenSize(nextScreen);

      if (nextScreen !== "mobile") {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize === "mobile" && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [screenSize, isOpen]);

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/" },
    { name: "Members", icon: <FaUsers />, path: "/members" },
    { name: "Attendance", icon: <FaCalendarAlt />, path: "/attendance" },
    { name: "Billing", icon: <FaMoneyBill />, path: "/billing" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const sidebarDynamicStyle = {
    ...styles.sidebar,
    ...(isMobile
      ? {
        position: "fixed",
        top: 0,
        left: 0,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        boxShadow: "8px 0 30px rgba(15, 23, 42, 0.18)",
      }
      : isTablet
        ? styles.sidebarTablet
        : styles.sidebarDesktop),
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          ...styles.mobileToggle,
          display: isMobile ? "flex" : "none",
        }}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      <div
        onClick={() => setIsOpen(false)}
        style={{
          ...styles.backdrop,
          opacity: isMobile && isOpen ? 1 : 0,
          pointerEvents: isMobile && isOpen ? "auto" : "none",
        }}
      />

      <aside style={sidebarDynamicStyle}>
        <div style={styles.topSection}>
          {isMobile && (
            <div style={styles.mobileHeader}>
              <div style={styles.brandWrap}>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={styles.closeBtn}
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <div
            style={{
              ...styles.brandWrapDesktop,
              ...(isTablet ? styles.brandWrapDesktopTablet : {}),
            }}
          >
            <div style={styles.logoIcon}>🍽</div>

            {!isTablet && (
              <div>
                <h2 style={styles.logoText}>MessMate</h2>
                <p style={styles.logoSubtext}>Mess Management</p>
              </div>
            )}
          </div>

          {!isTablet && <div style={styles.sectionLabel}>Main Menu</div>}

          <nav style={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
                style={({ isActive }) => ({
                  ...styles.item,
                  ...(isTablet ? styles.itemTablet : {}),
                  ...(isActive ? styles.active : {}),
                  textDecoration: "none",
                  color: isActive ? "#ffffff" : "#475569",
                  justifyContent: isTablet ? "center" : "flex-start",
                })}
              >
                <span style={styles.iconWrap}>{item.icon}</span>
                {!isTablet && <span style={styles.itemText}>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={styles.bottomArea}>
          {!isTablet && (
            <div style={styles.profileCard}>
              <div style={styles.profileAvatar}>M</div>
              <div style={styles.profileInfo}>
                <p style={styles.profileName}>Mess Admin</p>
                <span style={styles.profileRole}>Administrator</span>
              </div>
            </div>
          )}

          <button
            style={{
              ...styles.logout,
              ...(isTablet ? styles.logoutTablet : {}),
            }}
            type="button"
          >
            <span style={styles.logoutIcon}>
              <FaSignOutAlt />
            </span>
            {!isTablet && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

const styles = {
  mobileToggle: {
    position: "fixed",
    top: "16px",
    left: "16px",
    zIndex: 1300,
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "16px",
    color: "#0f172a",
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.5)",
    zIndex: 1190,
    transition: "opacity 0.25s ease",
  },

  sidebar: {
    width: "280px",
    minWidth: "280px",
    height: "100dvh",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px 16px",
    overflowY: "auto",
    overflowX: "hidden",
    zIndex: 1200,
    transition: "transform 0.3s ease, width 0.3s ease, min-width 0.3s ease",
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },

  sidebarDesktop: {
    position: "sticky",
    top: 0,
  },

  sidebarTablet: {
    position: "sticky",
    top: 0,
    width: "88px",
    minWidth: "88px",
    padding: "20px 12px",
  },

  topSection: {
    flex: 1,
    minHeight: 0,
  },

  mobileHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "16px",
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandWrapDesktop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 8px 20px",
    borderBottom: "1px solid #edf2f7",
    marginBottom: "20px",
  },

  brandWrapDesktopTablet: {
    justifyContent: "center",
    padding: "8px 0 12px",
    borderBottom: "none",
  },

  closeBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    cursor: "pointer",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },

  logoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    color: "#ffffff",
    flexShrink: 0,
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.2)",
  },

  logoText: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
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
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.25s ease",
    background: "transparent",
  },

  itemTablet: {
    padding: "14px 10px",
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
    whiteSpace: "nowrap",
  },

  active: {
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#ffffff",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
  },

  bottomArea: {
    flexShrink: 0,
    paddingTop: "18px",
    marginTop: "18px",
    borderTop: "1px solid #edf2f7",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "12px",
    marginBottom: "12px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },

  profileAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0f172a, #334155)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "16px",
    flexShrink: 0,
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

  logoutTablet: {
    padding: "14px",
  },

  logoutIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
  },
};
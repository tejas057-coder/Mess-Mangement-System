import { useEffect, useState } from "react";
import {
  FaHome, FaUsers, FaCalendarAlt, FaMoneyBill,
  FaCog, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Sidebar() {
  const { isDark, accent } = useTheme();
  const ownerName = localStorage.getItem("owner_full_name") || "Mess Owner";
  const ownerRole = localStorage.getItem("owner_role") || "Admin";
  const messName = localStorage.getItem("messmate_name") || "MessMate Pro";
  const [isOpen, setIsOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(getScreenSize());

  function getScreenSize() {
    if (window.innerWidth < 768) return "mobile";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  }

  useEffect(() => {
    const handleResize = () => {
      const next = getScreenSize();
      setScreenSize(next);
      if (next !== "mobile") setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = screenSize === "mobile" && isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [screenSize, isOpen]);

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/" },
    { name: "Members",   icon: <FaUsers />, path: "/members" },
    { name: "Menu Management", icon: <span style={{ fontSize: 16 }}>🍽️</span>, path: "/menu" },
    { name: "Billing",   icon: <FaMoneyBill />, path: "/billing" },
    { name: "Settings",  icon: <FaCog />, path: "/settings" },
  ];

  const sidebarStyle = {
    width: isTablet ? "88px" : "280px",
    minWidth: isTablet ? "88px" : "280px",
    height: "100dvh",
    background: "var(--sidebar-bg)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: isTablet ? "20px 12px" : "18px 16px",
    overflowY: "auto",
    overflowX: "hidden",
    zIndex: 1200,
    transition: "transform 0.3s ease, background 0.3s ease, border-color 0.3s ease",
    flexShrink: 0,
    ...(isMobile ? {
      position: "fixed", top: 0, left: 0,
      width: "280px", minWidth: "280px",
      transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      boxShadow: "8px 0 40px rgba(0,0,0,0.2)",
    } : { position: "sticky", top: 0 }),
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 1300,
          width: 44, height: 44,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-md)",
          display: isMobile ? "flex" : "none",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 16,
          color: "var(--text)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1190,
          backdropFilter: "blur(2px)",
          opacity: isMobile && isOpen ? 1 : 0,
          pointerEvents: isMobile && isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Top: logo + nav */}
        <div style={{ flex: 1, minHeight: 0 }}>

          {/* Mobile header */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--bg-hover)",
                  cursor: "pointer", color: "var(--text-3)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Brand */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: isTablet ? "center" : "flex-start",
            gap: 12,
            padding: isTablet ? "8px 0 16px" : "8px 8px 20px",
            borderBottom: isTablet ? "none" : "1px solid var(--border-2)",
            marginBottom: 20,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#fff", flexShrink: 0,
              boxShadow: `0 10px 24px ${accent.shadow}`,
              transition: "background 0.3s ease, box-shadow 0.3s ease",
            }}>🍽</div>
            {!isTablet && (
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  {messName}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--text-4)", fontWeight: 500 }}>
                  Mess Management
                </p>
              </div>
            )}
          </div>

          {!isTablet && (
            <div style={{
              fontSize: 10, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.14em", color: "var(--text-4)", padding: "0 10px", marginBottom: 10,
            }}>
              Main Menu
            </div>
          )}

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: isTablet ? "13px 10px" : "13px 14px",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  justifyContent: isTablet ? "center" : "flex-start",
                  transition: "all 0.2s ease",
                  background: isActive
                    ? `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`
                    : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-3)",
                  boxShadow: isActive ? `0 12px 24px ${accent.shadow}` : "none",
                })}
              >
                <span style={{ width: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  {item.icon}
                </span>
                {!isTablet && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: profile + logout */}
        <div style={{
          flexShrink: 0, paddingTop: 16, marginTop: 16,
          borderTop: "1px solid var(--border-2)",
        }}>
          {!isTablet && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-hover)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "10px 12px", marginBottom: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 15, flexShrink: 0,
              }}>{ownerName.charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{ownerName}</p>
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>{ownerRole}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10,
              padding: isTablet ? "13px" : "13px 16px",
              borderRadius: 14,
              border: "1px solid rgba(220,38,38,0.22)",
              background: isDark ? "rgba(220,38,38,0.1)" : "linear-gradient(180deg,#fff5f5,#ffecec)",
              color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 14,
              boxShadow: "0 4px 12px rgba(220,38,38,0.1)",
            }}
          >
            <FaSignOutAlt style={{ fontSize: 14 }} />
            {!isTablet && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
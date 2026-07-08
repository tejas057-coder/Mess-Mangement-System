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
    <div style={styles.sidebar}>
      <div>
        <div style={styles.logo}>🍽 MessMate</div>

        <div style={styles.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.item,
                ...(isActive ? styles.active : {}),
                textDecoration: "none",
                color: isActive ? "#fff" : "#374151",
              })}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div style={styles.logout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2563eb",
    padding: "30px",
  },

  menu: {
    padding: "10px 20px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "500",
    transition: "0.3s",
  },

  active: {
    background: "#2563eb",
    color: "#fff",
  },

  logout: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "25px",
    color: "#ef4444",
    borderTop: "1px solid #eee",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Sidebar;
import React, { useState } from "react";

const tabs = [
  "Profile",
  "Mess Details",
  "Notifications",
  "Security",
  "Appearance",
];

function SettingsHeader() {
  return (
    <div style={styles.header}>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Manage your account and preferences</p>
    </div>
  );
}

function SettingsSidebar({ activeTab, setActiveTab }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarCard}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.sidebarItem,
              ...(activeTab === tab ? styles.sidebarItemActive : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileCard() {
  return (
    <div style={styles.contentCard}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Profile Information</h2>
        <p style={styles.cardSubtitle}>Update your personal details</p>
      </div>

      <div style={styles.profileTop}>
        <div style={styles.profileIdentity}>
          <div style={styles.avatarLarge}>MO</div>
          <div>
            <h3 style={styles.profileName}>Mess Owner</h3>
            <p style={styles.profileMeta}>Admin · MessMate Pro</p>
          </div>
        </div>

        <button style={styles.secondaryBtn}>Change photo</button>
      </div>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} defaultValue="Mess Owner" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} defaultValue="owner@messmate.com" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Phone</label>
          <input style={styles.input} defaultValue="+91 98765 43210" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Address</label>
          <input style={styles.input} defaultValue="Pune, Maharashtra" />
        </div>
      </div>

      <div style={styles.cardFooter}>
        <button style={styles.primaryBtn}>Save Changes</button>
      </div>
    </div>
  );
}

function MessDetailsCard() {
  return (
    <div style={styles.contentCard}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Mess Configuration</h2>
        <p style={styles.cardSubtitle}>Configure your mess details and pricing</p>
      </div>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Mess Name</label>
          <input style={styles.input} defaultValue="MessMate Pro" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Registration No.</label>
          <input style={styles.input} defaultValue="MH-PUNE-2024-1142" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Total Capacity</label>
          <input style={styles.input} defaultValue="120" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Current Occupancy</label>
          <input style={styles.input} defaultValue="96" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Base Monthly Fee (₹)</label>
          <input style={styles.input} defaultValue="3000" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>WiFi Charges (₹)</label>
          <input style={styles.input} defaultValue="300" />
        </div>
      </div>

      <div style={styles.innerBox}>
        <h3 style={styles.sectionMiniTitle}>Meal Timings</h3>

        <div style={styles.timingRow}>
          <span style={styles.timingLabel}>Breakfast</span>
          <span style={styles.timingValue}>7:00 AM – 9:00 AM</span>
        </div>

        <div style={styles.timingRow}>
          <span style={styles.timingLabel}>Lunch</span>
          <span style={styles.timingValue}>12:00 PM – 2:00 PM</span>
        </div>

        <div style={styles.timingRow}>
          <span style={styles.timingLabel}>Dinner</span>
          <span style={styles.timingValue}>7:30 PM – 9:30 PM</span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <button style={styles.primaryBtn}>Save Configuration</button>
      </div>
    </div>
  );
}

function NotificationsCard() {
  const items = [
    ["Email Notifications", "Receive updates via email", true],
    ["SMS Alerts", "Get SMS for critical events", false],
    ["Push Notifications", "Browser push alerts", true],
    ["Billing Reminders", "Payment due date alerts", true],
    ["Attendance Reports", "Daily attendance summary", false],
  ];

  return (
    <div style={styles.contentCard}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Notification Preferences</h2>
        <p style={styles.cardSubtitle}>Control how you receive alerts</p>
      </div>

      <div style={styles.listCard}>
        {items.map(([title, sub, active], index) => (
          <div
            key={title}
            style={{
              ...styles.preferenceRow,
              borderTop: index === 0 ? "none" : "1px solid #f1f5f9",
            }}
          >
            <div>
              <p style={styles.preferenceTitle}>{title}</p>
              <span style={styles.preferenceSub}>{sub}</span>
            </div>

            <div style={active ? styles.toggleActive : styles.toggleInactive}>
              <div style={styles.toggleDot} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityCard() {
  return (
    <div style={styles.contentCard}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Change Password</h2>
        <p style={styles.cardSubtitle}>Keep your account secure</p>
      </div>

      <div style={styles.formGridSingle}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Current Password</label>
          <input type="password" style={styles.input} defaultValue="password" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>New Password</label>
          <input type="password" style={styles.input} defaultValue="newpassword" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm New Password</label>
          <input type="password" style={styles.input} defaultValue="newpassword" />
        </div>
      </div>

      <div style={styles.cardFooter}>
        <button style={styles.primaryBtn}>Update Password</button>
      </div>

      <div style={styles.innerBox}>
        <h3 style={styles.sectionMiniTitle}>Active Sessions</h3>

        <div style={styles.sessionRow}>
          <div>
            <p style={styles.preferenceTitle}>Chrome on Windows</p>
            <span style={styles.preferenceSub}>Pune, Maharashtra · Now (current)</span>
          </div>
        </div>

        <div style={styles.sessionRow}>
          <div>
            <p style={styles.preferenceTitle}>Safari on iPhone</p>
            <span style={styles.preferenceSub}>Mumbai, Maharashtra · 2 hours ago</span>
          </div>
          <button style={styles.secondaryBtn}>Revoke</button>
        </div>
      </div>
    </div>
  );
}

function AppearanceCard() {
  return (
    <div style={styles.contentCard}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Appearance</h2>
        <p style={styles.cardSubtitle}>Customize your dashboard look</p>
      </div>

      <div style={styles.appearanceStack}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Theme</label>
          <div style={styles.optionRow}>
            <button style={{ ...styles.optionBtn, ...styles.optionBtnActive }}>Light</button>
            <button style={styles.optionBtn}>Dark</button>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Accent Color</label>
          <div style={styles.colorRow}>
            <span style={{ ...styles.colorDot, backgroundColor: "#2563eb" }} />
            <span style={{ ...styles.colorDot, backgroundColor: "#10b981" }} />
            <span style={{ ...styles.colorDot, backgroundColor: "#f59e0b" }} />
            <span style={{ ...styles.colorDot, backgroundColor: "#8b5cf6" }} />
            <span style={{ ...styles.colorDot, backgroundColor: "#ef4444" }} />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Language & Region</label>
          <div style={styles.optionRow}>
            <button style={{ ...styles.optionBtn, ...styles.optionBtnActive }}>
              English (India)
            </button>
            <button style={styles.optionBtn}>हिन्दी</button>
            <button style={styles.optionBtn}>मराठी</button>
          </div>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <button style={styles.primaryBtn}>Save Preferences</button>
      </div>
    </div>
  );
}

function TabContent({ activeTab }) {
  switch (activeTab) {
    case "Profile":
      return <ProfileCard />;
    case "Mess Details":
      return <MessDetailsCard />;
    case "Notifications":
      return <NotificationsCard />;
    case "Security":
      return <SecurityCard />;
    case "Appearance":
      return <AppearanceCard />;
    default:
      return <ProfileCard />;
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div style={styles.page}>
      <SettingsHeader />

      <div style={styles.layout}>
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={styles.mainPanel}>
          <TabContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "Inter, sans-serif",
    color: "#111827",
  },

  header: {
    marginBottom: "18px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
    color: "#111827",
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "start",
  },

  sidebar: {
    position: "sticky",
    top: "24px",
  },

  sidebarCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "10px",
    border: "1px solid #eef2f7",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  sidebarItem: {
    border: "none",
    backgroundColor: "transparent",
    color: "#6b7280",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "left",
    cursor: "pointer",
  },

  sidebarItemActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.16)",
  },

  mainPanel: {
    minWidth: 0,
  },

  contentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #eef2f7",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
  },

  cardHeader: {
    marginBottom: "22px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#111827",
  },

  cardSubtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  profileTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    paddingBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "20px",
  },

  profileIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  avatarLarge: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 700,
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },

  profileName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },

  profileMeta: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  formGridSingle: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#6b7280",
  },

  input: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
    padding: "0 14px",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
  },

  cardFooter: {
    marginTop: "22px",
    display: "flex",
    justifyContent: "flex-start",
  },

  primaryBtn: {
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },

  secondaryBtn: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
  },

  innerBox: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #eef2f7",
  },

  sectionMiniTitle: {
    margin: "0 0 14px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
  },

  timingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid #e5e7eb",
  },

  timingLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
  },

  timingValue: {
    fontSize: "14px",
    color: "#6b7280",
  },

  listCard: {
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #eef2f7",
    overflow: "hidden",
  },

  preferenceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "16px 18px",
  },

  preferenceTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
  },

  preferenceSub: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  toggleActive: {
    width: "46px",
    height: "26px",
    borderRadius: "999px",
    backgroundColor: "#2563eb",
    padding: "3px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexShrink: 0,
  },

  toggleInactive: {
    width: "46px",
    height: "26px",
    borderRadius: "999px",
    backgroundColor: "#e5e7eb",
    padding: "3px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexShrink: 0,
  },

  toggleDot: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
  },

  sessionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "14px 0",
    borderTop: "1px solid #e5e7eb",
  },

  appearanceStack: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  optionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  optionBtn: {
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
  },

  optionBtnActive: {
    backgroundColor: "#eaf2ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
  },

  colorRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  colorDot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    cursor: "pointer",
    border: "3px solid #ffffff",
    boxShadow: "0 0 0 1px #dbe3ee",
  },
};
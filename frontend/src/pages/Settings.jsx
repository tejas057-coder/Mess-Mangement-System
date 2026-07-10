import React, { useState } from "react";
import { useTheme, ACCENTS } from "../context/ThemeContext";

const TABS = ["Profile", "Mess Details", "Notifications", "Security", "Appearance"];

/* ── reusable primitives ── */
const Card = ({ children, style }) => (
  <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: "22px 24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", ...style }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
    {children}
  </label>
);

const Input = ({ ...props }) => (
  <input style={{
    height: 46, borderRadius: 12, border: "1px solid var(--border)",
    background: "var(--bg-input)", padding: "0 14px",
    fontSize: 14, color: "var(--text)", outline: "none", width: "100%",
    transition: "border-color 0.2s ease",
  }} {...props} />
);

const PrimaryBtn = ({ children, style, ...props }) => {
  const { accent } = useTheme();
  return (
    <button style={{
      background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
      border: "none", borderRadius: 12, padding: "11px 20px",
      fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
      boxShadow: `0 10px 24px ${accent.shadow}`,
      transition: "all 0.2s ease",
      ...style,
    }} {...props}>{children}</button>
  );
};

/* ── Profile tab ── */
function ProfileTab() {
  const { accent } = useTheme();
  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Profile Information</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-3)" }}>Update your personal details</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, paddingBottom: 20, borderBottom: "1px solid var(--border-2)", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: `linear-gradient(135deg,${accent.hex},${accent.dark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, boxShadow: `0 12px 24px ${accent.shadow}`, flexShrink: 0, transition: "all 0.3s ease" }}>
            MO
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)" }}>Mess Owner</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>Admin · MessMate Pro</p>
          </div>
        </div>
        <button style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>
          Change photo
        </button>
      </div>

      <div className="form-grid-2" style={{ gap: 16 }}>
        {[["Full Name","Mess Owner"],["Email","owner@messmate.com"],["Phone","+91 98765 43210"],["Address","Pune, Maharashtra"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label>{l}</Label>
            <Input defaultValue={v} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <PrimaryBtn>Save Changes</PrimaryBtn>
      </div>
    </Card>
  );
}

/* ── Mess Details tab ── */
function MessDetailsTab() {
  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Mess Configuration</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-3)" }}>Configure your mess details and pricing</p>

      <div className="form-grid-2" style={{ gap: 16, marginBottom: 22 }}>
        {[
          ["Mess Name","MessMate Pro"],
          ["Registration No.","MH-PUNE-2024-1142"],
          ["Total Capacity","120"],
          ["Current Occupancy","96"],
          ["Base Monthly Fee (₹)","3000"],
          ["WiFi Charges (₹)","300"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label>{l}</Label>
            <Input defaultValue={v} />
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-hover)", borderRadius: 16, padding: 18, border: "1px solid var(--border-2)" }}>
        <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Meal Timings</p>
        {[["Breakfast","7:00 AM – 9:00 AM"],["Lunch","12:00 PM – 2:00 PM"],["Dinner","7:30 PM – 9:30 PM"]].map(([m, t]) => (
          <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border)", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m}</span>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>{t}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}><PrimaryBtn>Save Configuration</PrimaryBtn></div>
    </Card>
  );
}

/* ── Notifications tab ── */
function NotificationsTab() {
  const { accent } = useTheme();
  const [states, setStates] = useState({ email: true, sms: false, push: true, billing: true, attendance: false });
  const items = [
    ["email",      "Email Notifications",  "Receive updates via email"],
    ["sms",        "SMS Alerts",           "Get SMS for critical events"],
    ["push",       "Push Notifications",   "Browser push alerts"],
    ["billing",    "Billing Reminders",    "Payment due date alerts"],
    ["attendance", "Attendance Reports",   "Daily attendance summary"],
  ];
  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Notification Preferences</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-3)" }}>Control how you receive alerts</p>

      <div style={{ borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
        {items.map(([key, title, sub], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderTop: i === 0 ? "none" : "1px solid var(--border-2)", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>{sub}</p>
            </div>
            <div
              onClick={() => setStates(s => ({ ...s, [key]: !s[key] }))}
              style={{
                width: 46, height: 26, borderRadius: 999, padding: 3, cursor: "pointer", flexShrink: 0,
                background: states[key] ? `linear-gradient(135deg,${accent.hex},${accent.dark})` : "var(--border)",
                display: "flex", alignItems: "center",
                justifyContent: states[key] ? "flex-end" : "flex-start",
                transition: "all 0.25s ease",
                boxShadow: states[key] ? `0 4px 12px ${accent.shadow}` : "none",
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Security tab ── */
function SecurityTab() {
  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Change Password</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-3)" }}>Keep your account secure</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 22 }}>
        {["Current Password","New Password","Confirm New Password"].map(l => (
          <div key={l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label>{l}</Label>
            <Input type="password" defaultValue="password" />
          </div>
        ))}
      </div>
      <PrimaryBtn style={{ marginBottom: 22 }}>Update Password</PrimaryBtn>

      <div style={{ background: "var(--bg-hover)", borderRadius: 16, padding: 18, border: "1px solid var(--border-2)" }}>
        <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Active Sessions</p>
        {[["Chrome on Windows","Pune, Maharashtra · Now (current)", true],
          ["Safari on iPhone","Mumbai · 2 hours ago", false]].map(([name, info, current]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border)", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{name}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>{info}</p>
            </div>
            {!current && <button style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>Revoke</button>}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Appearance tab ── */
function AppearanceTab() {
  const { theme, setTheme, accentKey, setAccentKey, isDark } = useTheme();

  const accentList = [
    { key: "blue",   hex: "#2563eb", label: "Blue"   },
    { key: "green",  hex: "#10b981", label: "Green"  },
    { key: "amber",  hex: "#f59e0b", label: "Amber"  },
    { key: "purple", hex: "#8b5cf6", label: "Purple" },
    { key: "red",    hex: "#ef4444", label: "Red"    },
  ];

  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Appearance</h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--text-3)" }}>Customize your dashboard look and feel</p>

      {/* Theme Toggle */}
      <div style={{ marginBottom: 28 }}>
        <Label>Theme Mode</Label>
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { key: "light", icon: "☀️", label: "Light Mode", desc: "Clean and bright" },
            { key: "dark",  icon: "🌙", label: "Dark Mode",  desc: "Easy on the eyes" },
          ].map(opt => {
            const isActive = theme === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 20px",
                  borderRadius: 16,
                  border: isActive ? `2px solid var(--accent)` : "2px solid var(--border)",
                  background: isActive ? "var(--accent-light)" : "var(--bg-hover)",
                  cursor: "pointer", textAlign: "left", flex: 1, minWidth: 160,
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 8px 24px var(--accent-shadow)" : "none",
                }}
              >
                <span style={{ fontSize: 28 }}>{opt.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isActive ? "var(--accent)" : "var(--text)" }}>
                    {opt.label}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-4)" }}>{opt.desc}</p>
                </div>
                {isActive && (
                  <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <Label>Accent Color</Label>
        <p style={{ margin: "2px 0 14px", fontSize: 12, color: "var(--text-4)" }}>
          Changes buttons, links, and active states across the whole app
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {accentList.map(ac => {
            const isActive = accentKey === ac.key;
            return (
              <button
                key={ac.key}
                onClick={() => setAccentKey(ac.key)}
                title={ac.label}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  border: "none", background: "transparent", cursor: "pointer", padding: 6,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: ac.hex, cursor: "pointer",
                  boxShadow: isActive ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${ac.hex}` : `0 4px 12px ${ac.hex}44`,
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.2s ease",
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? ac.hex : "var(--text-4)" }}>
                  {ac.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live preview */}
        <div style={{ marginTop: 22, padding: 18, background: "var(--bg-hover)", borderRadius: 16, border: "1px solid var(--border-2)" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Live Preview
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button style={{
              background: `linear-gradient(135deg, var(--accent), var(--accent-dark))`,
              color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 20px var(--accent-shadow)",
            }}>Primary Button</button>
            <span style={{ padding: "7px 14px", borderRadius: 999, background: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 700, border: "1px solid var(--accent)", opacity: 0.8 }}>
              Badge
            </span>
            <span style={{ fontSize: 14, color: "var(--accent)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Link Text</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TabContent({ tab }) {
  switch (tab) {
    case "Profile":       return <ProfileTab />;
    case "Mess Details":  return <MessDetailsTab />;
    case "Notifications": return <NotificationsTab />;
    case "Security":      return <SecurityTab />;
    case "Appearance":    return <AppearanceTab />;
    default:              return <ProfileTab />;
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { accent } = useTheme();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: 24, fontFamily: "Inter,sans-serif", transition: "background 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Settings
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text-3)" }}>
          Manage your account, appearance, and preferences
        </p>
      </div>

      {/* Mobile horizontal tab bar */}
      <div className="settings-tabs-mobile">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              border: activeTab === tab ? `1px solid ${accent.hex}` : "1px solid var(--border)",
              background: activeTab === tab ? `linear-gradient(135deg,${accent.hex},${accent.dark})` : "var(--bg-card)",
              color: activeTab === tab ? "#fff" : "var(--text-3)",
              padding: "9px 16px", borderRadius: 999,
              fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: activeTab === tab ? `0 6px 16px ${accent.shadow}` : "none",
              transition: "all 0.2s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid-settings" style={{ gap: 18, alignItems: "start" }}>

        {/* Sidebar (desktop) */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 10, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", position: "sticky", top: 24 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                width: "100%", border: "none", padding: "13px 14px", borderRadius: 12,
                fontSize: 14, fontWeight: 600, textAlign: "left", cursor: "pointer",
                marginBottom: 4, display: "block",
                background: activeTab === tab
                  ? `linear-gradient(135deg,${accent.hex},${accent.dark})`
                  : "transparent",
                color: activeTab === tab ? "#fff" : "var(--text-3)",
                boxShadow: activeTab === tab ? `0 8px 20px ${accent.shadow}` : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{ minWidth: 0 }}>
          <TabContent tab={activeTab} />
        </div>
      </div>
    </div>
  );
}
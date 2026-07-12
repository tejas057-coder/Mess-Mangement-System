import React, { useState, useEffect } from "react";
import { useTheme, ACCENTS } from "../context/ThemeContext";
import { toast } from "react-toastify";
import API_BASE from "../api";

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
  const [fullName, setFullName] = useState(localStorage.getItem("owner_full_name") || "Mess Owner");
  const [role, setRole] = useState(localStorage.getItem("owner_role") || "Admin");
  const [email, setEmail] = useState(localStorage.getItem("owner_email") || "owner@messmate.com");
  const [phone, setPhone] = useState(localStorage.getItem("owner_phone") || "+91 98765 43210");
  const [address, setAddress] = useState(localStorage.getItem("owner_address") || "Pune, Maharashtra");

  const handleSave = () => {
    localStorage.setItem("owner_full_name", fullName);
    localStorage.setItem("owner_role", role);
    localStorage.setItem("owner_email", email);
    localStorage.setItem("owner_phone", phone);
    localStorage.setItem("owner_address", address);
    toast.success("Owner profile saved successfully!");
  };

  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Profile Information</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-3)" }}>Update your personal details</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, paddingBottom: 20, borderBottom: "1px solid var(--border-2)", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: `linear-gradient(135deg,${accent.hex},${accent.dark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, boxShadow: `0 12px 24px ${accent.shadow}`, flexShrink: 0, transition: "all 0.3s ease" }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{fullName}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>{role} · MessMate Pro</p>
          </div>
        </div>
        <button style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>
          Change photo
        </button>
      </div>

      <div className="form-grid-2" style={{ gap: 16 }}>
        {[
          ["Full Name", fullName, setFullName],
          ["Role", role, setRole],
          ["Email", email, setEmail],
          ["Phone", phone, setPhone],
          ["Address", address, setAddress]
        ].map(([label, value, setter]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label>{label}</Label>
            <Input value={value} onChange={e => setter(e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <PrimaryBtn onClick={handleSave}>Save Changes</PrimaryBtn>
      </div>
    </Card>
  );
}


function MessDetailsTab() {
  const [messName, setMessName] = useState(localStorage.getItem("messmate_name") || "MessMate Pro");
  const [regNo, setRegNo] = useState(localStorage.getItem("messmate_reg_no") || "MH-PUNE-2024-1142");
  const [capacity, setCapacity] = useState(localStorage.getItem("messmate_capacity") || "120");
  const [occupancy, setOccupancy] = useState(localStorage.getItem("messmate_occupancy") || "96");
  const [baseFee, setBaseFee] = useState(localStorage.getItem("messmate_base_fee") || "3000");
  const [wifiCharges, setWifiCharges] = useState(localStorage.getItem("messmate_wifi_charges") || "300");
  const [upiId, setUpiId] = useState(localStorage.getItem("messmate_upi_id") || "8767471502@paytm");

  const handleSave = () => {
    localStorage.setItem("messmate_name", messName);
    localStorage.setItem("messmate_reg_no", regNo);
    localStorage.setItem("messmate_capacity", capacity);
    localStorage.setItem("messmate_occupancy", occupancy);
    localStorage.setItem("messmate_base_fee", baseFee);
    localStorage.setItem("messmate_wifi_charges", wifiCharges);
    localStorage.setItem("messmate_upi_id", upiId);
    toast.success("Mess details and payment settings saved successfully!");
  };

  return (
    <Card>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Mess Configuration</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-3)" }}>Configure your mess details and payment settings</p>

      <div className="form-grid-2" style={{ gap: 16, marginBottom: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Mess Name</Label>
          <Input value={messName} onChange={e => setMessName(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Registration No.</Label>
          <Input value={regNo} onChange={e => setRegNo(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Total Capacity</Label>
          <Input value={capacity} onChange={e => setCapacity(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Current Occupancy</Label>
          <Input value={occupancy} onChange={e => setOccupancy(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Base Monthly Fee (₹)</Label>
          <Input value={baseFee} onChange={e => setBaseFee(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>WiFi Charges (₹)</Label>
          <Input value={wifiCharges} onChange={e => setWifiCharges(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Merchant UPI ID for Payments</Label>
          <Input value={upiId} placeholder="e.g. 8767471502@paytm" onChange={e => setUpiId(e.target.value)} />
          <span style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>*Scanned QR Codes will credit this account directly.</span>
        </div>
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

      <div style={{ marginTop: 22 }}><PrimaryBtn onClick={handleSave}>Save Configuration</PrimaryBtn></div>
    </Card>
  );
}

/* ── Notifications tab ── */
function NotificationsTab() {
  const { accent } = useTheme();
  const [smsConfig, setSmsConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState(false);
  const [inAppStates, setInAppStates] = useState({
    push: true, billing: true, attendance: false,
  });

  useEffect(() => {
    fetch(`${API_BASE}/sms-settings`)
      .then(r => r.json())
      .then(d => { setSmsConfig(d); setLoading(false); })
      .catch(() => { setSmsConfig(null); setLoading(false); });
  }, []);

  const handleTestSMS = () => {
    setTesting(true);
    fetch(`${API_BASE}/sms-settings/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone }),
    })
      .then(r => r.json())
      .then(d => { toast.success(d.message); setTesting(false); })
      .catch(() => { toast.error("Failed to reach backend"); setTesting(false); });
  };

  const Toggle = ({ on, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: 46, height: 26, borderRadius: 999, padding: 3, cursor: "pointer", flexShrink: 0,
        background: on ? `linear-gradient(135deg,${accent.hex},${accent.dark})` : "var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: on ? "flex-end" : "flex-start",
        transition: "all 0.25s ease",
        boxShadow: on ? `0 4px 12px ${accent.shadow}` : "none",
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── SMS Alerts Card ── */}
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>📱 SMS Alerts</h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-3)" }}>Get real-time SMS for payments &amp; member updates</p>
          </div>
          {/* Status badge */}
          {!loading && (
            <span style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: smsConfig?.configured ? "#dcfce7" : "#fef3c7",
              color: smsConfig?.configured ? "#16a34a" : "#92400e",
              border: `1px solid ${smsConfig?.configured ? "#86efac" : "#fcd34d"}`,
              flexShrink: 0,
            }}>
              {smsConfig?.configured ? "✅ Connected" : "⚠️ Not Configured"}
            </span>
          )}
        </div>

        {/* Info box */}
        <div style={{ background: "var(--bg-hover)", borderRadius: 14, padding: "14px 16px", border: "1px solid var(--border-2)", marginBottom: 20 }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>How to enable SMS alerts:</p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-3)", lineHeight: 2 }}>
            <li>Sign up free at <strong style={{ color: "var(--accent)" }}>fast2sms.com</strong></li>
            <li>Go to <strong>Dev API → Quick SMS</strong> and copy your API key</li>
            <li>Open <code style={{ background: "var(--border)", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>backend/.env</code> and set:</li>
          </ol>
          <pre style={{ margin: "10px 0 0", background: "var(--bg-card)", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "var(--text-2)", border: "1px solid var(--border)", overflowX: "auto" }}>
{`SMS_API_KEY=your_fast2sms_api_key_here
SMS_OWNER_PHONE=your_10_digit_phone
SMS_ON_PAYMENT=true
SMS_ON_MEMBER_ADD=true
SMS_ON_MEMBER_UPDATE=true`}
          </pre>
        </div>

        {/* Current config status */}
        {!loading && smsConfig && (
          <div style={{ borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
            {[
              ["API Key", smsConfig.configured ? smsConfig.apiKeyMasked : "Not set", smsConfig.configured ? "var(--accent)" : "var(--text-4)"],
              ["Owner Phone", smsConfig.ownerPhone || "Not set", smsConfig.ownerPhone ? "var(--text)" : "var(--text-4)"],
            ].map(([label, val, color], i) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border-2)", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)" }}>{label}</span>
                <code style={{ fontSize: 12, color, background: "var(--bg-hover)", padding: "3px 10px", borderRadius: 6 }}>{val}</code>
              </div>
            ))}
          </div>
        )}

        {/* SMS event toggles */}
        {!loading && smsConfig && (
          <div style={{ borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
            {[
              ["smsOnPayment",      "💰 Payment Received",   "SMS when a member makes a payment"],
              ["smsOnMemberAdd",    "👤 New Member Added",   "SMS when a new member is registered"],
              ["smsOnMemberUpdate", "✏️ Member Updated",     "SMS when a member's profile is updated"],
            ].map(([key, title, sub], i) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border-2)", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>{sub}</p>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: smsConfig[key] ? "#dcfce7" : "var(--bg-hover)",
                  color: smsConfig[key] ? "#16a34a" : "var(--text-4)",
                  border: `1px solid ${smsConfig[key] ? "#86efac" : "var(--border)"}`,
                  flexShrink: 0,
                }}>
                  {smsConfig[key] ? "ON" : "OFF"}
                </div>
              </div>
            ))}
            <div style={{ padding: "10px 16px", background: "var(--bg-hover)", borderTop: "1px solid var(--border-2)" }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-4)" }}>
                💡 To change these, update <code style={{ background: "var(--border)", padding: "1px 5px", borderRadius: 4 }}>backend/.env</code> and restart the server.
              </p>
            </div>
          </div>
        )}

        {/* Test SMS */}
        <div style={{ background: "var(--bg-hover)", borderRadius: 14, padding: "16px", border: "1px solid var(--border-2)" }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>🔔 Send Test SMS</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              style={{
                flex: 1, minWidth: 180, height: 44, borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--bg-input)", padding: "0 14px",
                fontSize: 14, color: "var(--text)", outline: "none",
              }}
            />
            <button
              onClick={handleTestSMS}
              disabled={testing || !testPhone}
              style={{
                height: 44, padding: "0 20px", borderRadius: 10, border: "none",
                background: testing || !testPhone
                  ? "var(--border)"
                  : `linear-gradient(135deg,${accent.hex},${accent.dark})`,
                color: testing || !testPhone ? "var(--text-4)" : "#fff",
                fontSize: 13, fontWeight: 700, cursor: testing || !testPhone ? "not-allowed" : "pointer",
                boxShadow: testing || !testPhone ? "none" : `0 6px 16px ${accent.shadow}`,
                flexShrink: 0,
              }}
            >
              {testing ? "Sending..." : "Send Test"}
            </button>
          </div>
        </div>
      </Card>

      {/* ── In-App Notifications Card ── */}
      <Card>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>🔔 In-App Notifications</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-3)" }}>Control dashboard &amp; browser notifications</p>
        <div style={{ borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
          {[
            ["push",       "Push Notifications",   "Browser push alerts for new events"],
            ["billing",    "Billing Reminders",    "Payment due date reminders"],
            ["attendance", "Attendance Reports",   "Daily attendance summary"],
          ].map(([key, title, sub], i) => (
            <div key={key} className="notification-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderTop: i === 0 ? "none" : "1px solid var(--border-2)", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-4)" }}>{sub}</p>
              </div>
              <Toggle
                on={inAppStates[key]}
                onChange={() => setInAppStates(s => ({ ...s, [key]: !s[key] }))}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
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
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import API_BASE from "../api";

function StatCard({ label, value, icon, iconBg, iconColor, iconBorder, glowColor, sub, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 22, padding: "22px 20px",
        background: "var(--bg-card)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        cursor: "default",
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, opacity 0.5s ease",
        transform: visible ? (hovered ? "translateY(-5px) scale(1.02)" : "translateY(0)") : "translateY(20px) scale(0.96)",
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: glowColor, filter: "blur(22px)", pointerEvents: "none" }} />
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, marginBottom: 16,
        boxShadow: `0 6px 16px ${glowColor}`,
        position: "relative", zIndex: 1,
      }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-4)", position: "relative", zIndex: 1 }}>
        {label}
      </p>
      <h3 style={{ margin: "8px 0 4px", fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", position: "relative", zIndex: 1 }}>
        {value}
      </h3>
      {sub && <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 600, position: "relative", zIndex: 1 }}>{sub}</span>}
    </div>
  );
}

const initialMealState = {
  roti: "",
  sabji: "",
  dal: "",
  rice: "",
  salad: "",
  papad: "",
  sweet: "",
  special_dish: ""
};

export default function MenuPage() {
  const { accent, isDark } = useTheme();
  
  // Tab selector: "admin" vs "student"
  const [activeTab, setActiveTab] = useState("admin");

  // Core state variables
  const [menuId, setMenuId] = useState(null);
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split("T")[0]);
  const [lunch, setLunch] = useState({ ...initialMealState });
  const [dinner, setDinner] = useState({ ...initialMealState });
  
  const [chefNote, setChefNote] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [specialDish, setSpecialDish] = useState("");
  const [menuType, setMenuType] = useState("Regular");
  const [status, setStatus] = useState("Draft");
  const [image, setImage] = useState("");

  // Statistics indicators
  const [todayStatus, setTodayStatus] = useState("Not Created");
  const [lastUpdated, setLastUpdated] = useState("—");
  const [todaySpecialDish, setTodaySpecialDish] = useState("No Special Dish");
  const [todayMenuType, setTodayMenuType] = useState("Regular");

  // History & templates lists
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const historyLimit = 5;

  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Student view interactive rating / comments
  const [studentRating, setStudentRating] = useState(5);
  const [studentFeedback, setStudentFeedback] = useState("");
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [feedbacksList, setFeedbacksList] = useState([]);

  // Local image upload helper
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Base64 encoding
    };
    reader.readAsDataURL(file);
  };

  // Reset core input states
  const handleResetForm = () => {
    setMenuId(null);
    setLunch({ ...initialMealState });
    setDinner({ ...initialMealState });
    setChefNote("");
    setAnnouncement("");
    setSpecialDish("");
    setMenuType("Regular");
    setStatus("Draft");
    setImage("");
    toast.info("Form reset successfully");
  };

  // Fetch today's menu metrics & template catalog
  const loadTemplates = () => {
    fetch(`${API_BASE}/api/menu/templates`)
      .then(r => r.json())
      .then(d => setTemplates(Array.isArray(d) ? d : []))
      .catch(err => console.error("Error loading templates:", err));
  };

  const loadHistory = (page = 0, queryDate = "") => {
    fetch(`${API_BASE}/api/menu/history?limit=${historyLimit}&offset=${page * historyLimit}&date=${queryDate}`)
      .then(r => r.json())
      .then(d => {
        setHistory(Array.isArray(d.menus) ? d.menus : []);
        setTotalHistoryCount(d.totalCount || 0);
      })
      .catch(err => console.error("Error loading history:", err));
  };

  const fetchTodayData = () => {
    fetch(`${API_BASE}/api/menu/today?date=${menuDate}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.menu) {
          const m = d.menu;
          setTodayStatus(m.status || "Draft");
          setTodaySpecialDish(m.special_dish || "No Special Dish");
          setTodayMenuType(m.menu_type || "Regular");
          
          const formattedTime = new Date(m.updated_at || m.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
          const formattedDate = new Date(m.menu_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
          setLastUpdated(`${formattedDate} @ ${formattedTime}`);

          setAvgRating(d.avgRating || 0);
          setTotalRatings(d.totalRatings || 0);
          setFeedbacksList(Array.isArray(d.feedback) ? d.feedback : []);
        } else {
          setTodayStatus("Not Created");
          setLastUpdated("—");
          setTodaySpecialDish("No Special Dish");
          setTodayMenuType("Regular");
          setAvgRating(0);
          setTotalRatings(0);
          setFeedbacksList([]);
        }
      })
      .catch(err => console.error("Error loading today data:", err));
  };

  useEffect(() => {
    loadTemplates();
    loadHistory(0, "");
    fetchTodayData();
  }, [menuDate]);

  // Load a menu for editing
  const loadMenuToEdit = (menu) => {
    setMenuId(menu.id);
    setMenuDate(menu.menu_date.split("T")[0]);
    setLunch(typeof menu.lunch === "string" ? JSON.parse(menu.lunch) : menu.lunch || { ...initialMealState });
    setDinner(typeof menu.dinner === "string" ? JSON.parse(menu.dinner) : menu.dinner || { ...initialMealState });
    setChefNote(menu.chef_note || "");
    setAnnouncement(menu.announcement || "");
    setSpecialDish(menu.special_dish || "");
    setMenuType(menu.menu_type || "Regular");
    setStatus(menu.status || "Draft");
    setImage(menu.image || "");
    toast.success(`Loaded menu for ${menu.menu_date.split("T")[0]}`);
  };

  // Submit Rating / Feedback
  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!menuId) {
      toast.warning("Cannot rate! No menu exists for this date.");
      return;
    }
    fetch(`${API_BASE}/api/menu/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu_id: menuId,
        rating: studentRating,
        feedback: studentFeedback
      })
    })
      .then(r => r.json())
      .then(() => {
        toast.success("Thank you for your rating & feedback!");
        setStudentFeedback("");
        fetchTodayData();
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to submit feedback");
      });
  };

  // Save or Publish menu handler
  const handleSaveMenu = (targetStatus) => {
    if (!menuDate) {
      toast.error("Please select a date");
      return;
    }
    setSavingMenu(true);
    const payload = {
      menu_date: menuDate,
      lunch,
      dinner,
      chef_note: chefNote,
      announcement: announcement,
      special_dish: specialDish,
      menu_type: menuType,
      image,
      status: targetStatus
    };

    const method = menuId ? "PUT" : "POST";
    const url = menuId ? `${API_BASE}/api/menu/${menuId}` : `${API_BASE}/api/menu`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(d => {
        setSavingMenu(false);
        toast.success(targetStatus === "Published" ? "🎉 Menu Published successfully!" : "💾 Menu Draft saved!");
        fetchTodayData();
        loadHistory(historyPage, searchDate);
        if (!menuId && d.id) {
          setMenuId(d.id);
        }
      })
      .catch(err => {
        setSavingMenu(false);
        console.error(err);
        toast.error("Network error: Failed to save menu");
      });
  };

  // Save current menu settings as template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.warning("Please enter a name for the template");
      return;
    }
    setSavingTemplate(true);
    fetch(`${API_BASE}/api/menu/template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_name: templateName,
        lunch,
        dinner
      })
    })
      .then(r => r.json())
      .then(() => {
        setSavingTemplate(false);
        setTemplateName("");
        toast.success(`Template "${templateName}" saved!`);
        loadTemplates();
      })
      .catch(err => {
        setSavingTemplate(false);
        console.error(err);
        toast.error("Failed to save template");
      });
  };

  // Apply template inputs to current lunch/dinner fields
  const handleApplyTemplate = (tpl) => {
    const l = typeof tpl.lunch === "string" ? JSON.parse(tpl.lunch) : tpl.lunch;
    const d = typeof tpl.dinner === "string" ? JSON.parse(tpl.dinner) : tpl.dinner;
    setLunch({ ...initialMealState, ...l });
    setDinner({ ...initialMealState, ...d });
    toast.success(`Applied template: ${tpl.template_name}`);
  };

  // Delete template handler
  const handleDeleteMenu = (id) => {
    if (!window.confirm("Are you sure you want to delete this menu? This cannot be undone.")) return;
    fetch(`${API_BASE}/api/menu/${id}`, { method: "DELETE" })
      .then(r => r.json())
      .then(() => {
        toast.success("Menu deleted successfully");
        if (id === menuId) handleResetForm();
        loadHistory(historyPage, searchDate);
        fetchTodayData();
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to delete menu");
      });
  };

  // Copy yesterday's menu
  const handleCopyYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    fetch(`${API_BASE}/api/menu/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: yesterdayStr })
    })
      .then(r => r.json())
      .then(data => {
        const l = typeof data.lunch === "string" ? JSON.parse(data.lunch) : data.lunch;
        const d = typeof data.dinner === "string" ? JSON.parse(data.dinner) : data.dinner;
        setLunch({ ...initialMealState, ...l });
        setDinner({ ...initialMealState, ...d });
        setChefNote(data.chef_note || "");
        setAnnouncement(data.announcement || "");
        setSpecialDish(data.special_dish || "");
        setMenuType(data.menu_type || "Regular");
        setImage(data.image || "");
        toast.success("Successfully copied yesterday's menu!");
      })
      .catch(() => {
        toast.info("No menu found for yesterday to copy.");
      });
  };

  // Format menu item display strings
  const getMenuSummary = (meal) => {
    return Object.entries(meal)
      .filter(([k, v]) => v && k !== "special_dish" && k !== "sweet")
      .map(([, v]) => v)
      .join(", ") || "—";
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "Published": return { color: "#16a34a", bg: isDark ? "rgba(34,197,94,0.15)" : "#dcfce7", border: "rgba(34,197,94,0.3)" };
      case "Draft":     return { color: "#d97706", bg: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7", border: "rgba(245,158,11,0.3)" };
      default:          return { color: "#6b7280", bg: isDark ? "rgba(107,114,128,0.15)" : "#f3f4f6", border: "rgba(107,114,128,0.3)" };
    }
  };

  const menuTypeBadges = {
    Regular:  { color: "#3b82f6", bg: isDark ? "rgba(59,130,246,0.15)" : "#eff6ff", border: "rgba(59,130,246,0.3)" },
    Festival: { color: "#ec4899", bg: isDark ? "rgba(236,72,153,0.15)" : "#fdf2f8", border: "rgba(236,72,153,0.3)" },
    Special:  { color: "#8b5cf6", bg: isDark ? "rgba(139,92,246,0.15)" : "#f5f3ff", border: "rgba(139,92,246,0.3)" },
    Holiday:  { color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.15)" : "#fffbeb", border: "rgba(245,158,11,0.3)" }
  };

  const statsCards = [
    { label: "Today's Status", value: todayStatus, icon: "📋", iconBg: getStatusColor(todayStatus).bg, iconColor: getStatusColor(todayStatus).color, iconBorder: getStatusColor(todayStatus).border, glowColor: getStatusColor(todayStatus).color, sub: `For: ${menuDate}`, delay: 50 },
    { label: "Last Updated", value: lastUpdated, icon: "⏱️", iconBg: isDark ? "rgba(8,145,178,0.18)" : "#ecfeff", iconColor: "#0891b2", iconBorder: "rgba(8,145,178,0.25)", glowColor: "rgba(8,145,178,0.18)", delay: 130 },
    { label: "Special Dish", value: todaySpecialDish.slice(0,20) + (todaySpecialDish.length > 20 ? "..." : ""), icon: "⭐", iconBg: isDark ? "rgba(225,29,72,0.18)" : "#fff1f2", iconColor: "#e11d48", iconBorder: "rgba(225,29,72,0.25)", glowColor: "rgba(225,29,72,0.18)", delay: 210 },
    { label: "Menu Type", value: todayMenuType, icon: "🏷️", iconBg: (menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).bg, iconColor: (menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).color, iconBorder: (menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).border, glowColor: (menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).color, delay: 290 }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", fontFamily: "Inter, sans-serif" }}>
      
      {/* ── Gradient Header ── */}
      <div style={{
        borderRadius: 28, marginBottom: 24,
        background: `linear-gradient(135deg, ${accent.hex}f0, ${accent.dark}d0, ${isDark ? "#1e1b4b" : "#1e3a8a"}cc)`,
        padding: "26px 30px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        position: "relative", overflow: "hidden",
        boxShadow: `0 24px 64px ${accent.shadow}, inset 0 0 0 1px rgba(255,255,255,0.1)`,
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Mess Catering</p>
          <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>Menu Management</h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Manage daily Lunch and Dinner menus, templates, and feedbacks</p>
        </div>

        {/* Tab switch controller */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", padding: 4, borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", position: "relative", zIndex: 1 }}>
          <button
            onClick={() => setActiveTab("admin")}
            style={{
              border: "none", background: activeTab === "admin" ? "#fff" : "transparent",
              color: activeTab === "admin" ? accent.hex : "#fff",
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            ⚙️ Admin Panel
          </button>
          <button
            onClick={() => setActiveTab("student")}
            style={{
              border: "none", background: activeTab === "student" ? "#fff" : "transparent",
              color: activeTab === "student" ? accent.hex : "#fff",
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            🎓 Student Portal
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statsCards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* ── MAIN CONTENT ACCORDING TO SELECTED TAB ── */}
      {activeTab === "admin" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Main Form & Preview section split */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }} className="grid-billing">
            
            {/* Left Column: Form */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 26, boxShadow: "var(--shadow-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>🍳 Daily Menu Builder</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleCopyYesterday} style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "var(--text)", cursor: "pointer" }}>
                    📋 Copy Yesterday
                  </button>
                  <button onClick={handleResetForm} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#dc2626", cursor: "pointer" }}>
                    🔄 Reset
                  </button>
                </div>
              </div>

              {/* Date Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", marginBottom: 6 }}>Menu Date</label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14 }}
                />
              </div>

              {/* Lunch Form Fields */}
              <div style={{ border: "1px solid var(--border-2)", borderRadius: 18, padding: 18, marginBottom: 20, background: "rgba(255,255,255,0.01)" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: accent.hex }}>☀️ Lunch Section</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="form-grid-2">
                  {Object.keys(lunch).map((key) => (
                    <div key={`lunch-${key}`}>
                      <label style={{ display: "block", fontSize: 11, textTransform: "capitalize", color: "var(--text-3)", marginBottom: 4 }}>
                        {key.replace("_", " ")} {key === "sweet" || key === "special_dish" ? "(Optional)" : ""}
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${key === "sabji" ? "Paneer Masala" : key === "rice" ? "Jeera Rice" : "Enter item"}`}
                        value={lunch[key]}
                        onChange={(e) => {
                          setLunch(prev => ({ ...prev, [key]: e.target.value }));
                          if (key === "special_dish" && e.target.value) setSpecialDish(e.target.value);
                        }}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dinner Form Fields */}
              <div style={{ border: "1px solid var(--border-2)", borderRadius: 18, padding: 18, marginBottom: 20, background: "rgba(255,255,255,0.01)" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: accent.hex }}>🌙 Dinner Section</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="form-grid-2">
                  {Object.keys(dinner).map((key) => (
                    <div key={`dinner-${key}`}>
                      <label style={{ display: "block", fontSize: 11, textTransform: "capitalize", color: "var(--text-3)", marginBottom: 4 }}>
                        {key.replace("_", " ")} {key === "sweet" || key === "special_dish" ? "(Optional)" : ""}
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${key === "sabji" ? "Aloo Gobhi" : key === "dal" ? "Dal Tadka" : "Enter item"}`}
                        value={dinner[key]}
                        onChange={(e) => {
                          setDinner(prev => ({ ...prev, [key]: e.target.value }));
                          if (key === "special_dish" && e.target.value && !specialDish) setSpecialDish(e.target.value);
                        }}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Parameters */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }} className="form-grid-2">
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Menu Category Badge</label>
                  <select
                    value={menuType}
                    onChange={(e) => setMenuType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13 }}
                  >
                    <option value="Regular">Regular Menu</option>
                    <option value="Festival">Festival Special</option>
                    <option value="Special">Special Day</option>
                    <option value="Holiday">Holiday Menu</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Special Highlight Dish</label>
                  <input
                    type="text"
                    placeholder="e.g. Kadhai Paneer, Gulab Jamun"
                    value={specialDish}
                    onChange={(e) => setSpecialDish(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Chef Notes & Announcements */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Chef Note</label>
                <textarea
                  placeholder="e.g. Today dinner will be served after 8:30 PM due to special preparation."
                  rows="2"
                  value={chefNote}
                  onChange={(e) => setChefNote(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13, resize: "none" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Special Announcement</label>
                <textarea
                  placeholder="e.g. Tomorrow the mess will be closed for maintenance services."
                  rows="2"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13, resize: "none" }}
                />
              </div>

              {/* Image Upload section */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Menu Food Showcase Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}
                />
                {image && (
                  <div style={{ position: "relative", width: 140, height: 100, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={image} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(220,38,38,0.85)", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 12, borderTop: "1px solid var(--border-2)", paddingTop: 18 }}>
                <button
                  onClick={() => handleSaveMenu("Draft")}
                  disabled={savingMenu}
                  style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-2)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  💾 Save Draft
                </button>
                <button
                  onClick={() => handleSaveMenu("Published")}
                  disabled={savingMenu}
                  style={{ flex: 1.5, padding: "12px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: `0 8px 24px ${accent.shadow}` }}
                >
                  {savingMenu ? "Saving..." : "🚀 Publish Menu"}
                </button>
              </div>
            </div>

            {/* Right Column: Live Mockup Preview */}
            <div style={{ position: "sticky", top: 20 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 26, boxShadow: "var(--shadow-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>👁️ Student View Live Preview</h3>
                  <span style={{
                    padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                    background: status === "Published" ? "#dcfce7" : "#fef3c7",
                    color: status === "Published" ? "#16a34a" : "#92400e",
                    border: `1px solid ${status === "Published" ? "#86efac" : "#fcd34d"}`
                  }}>
                    {status.toUpperCase()}
                  </span>
                </div>

                {/* Published card look */}
                <div style={{ background: "var(--bg-hover)", borderRadius: 20, padding: 20, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 800, textTransform: "uppercase" }}>MENU DATE</span>
                      <h4 style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{menuDate || "—"}</h4>
                    </div>
                    
                    <span style={{
                      padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                      background: (menuTypeBadges[menuType] || menuTypeBadges.Regular).bg,
                      color: (menuTypeBadges[menuType] || menuTypeBadges.Regular).color,
                      border: `1px solid ${(menuTypeBadges[menuType] || menuTypeBadges.Regular).border}`
                    }}>
                      {menuType.toUpperCase()}
                    </span>
                  </div>

                  {/* Highlights */}
                  {specialDish && (
                    <div style={{ background: `linear-gradient(135deg, ${accent.hex}15, ${accent.dark}08)`, borderLeft: `4px solid ${accent.hex}`, padding: "10px 14px", borderRadius: "0 12px 12px 0", marginBottom: 18 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: accent.hex, textTransform: "uppercase" }}>⭐ TODAY'S SPECIAL</p>
                      <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{specialDish}</p>
                    </div>
                  )}

                  {/* Menu Image Preview */}
                  {image && (
                    <div style={{ width: "100%", height: 160, borderRadius: 14, overflow: "hidden", marginBottom: 18, border: "1px solid var(--border)" }}>
                      <img src={image} alt="Menu showcase" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  {/* Lunch Card */}
                  <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: 14, border: "1px solid var(--border)", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>☀️</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-3)" }}>LUNCH MENU</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
                      {getMenuSummary(lunch)}
                    </p>
                    {lunch.sweet && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#db2777", fontWeight: 700 }}>🍰 Sweet: {lunch.sweet}</p>}
                  </div>

                  {/* Dinner Card */}
                  <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: 14, border: "1px solid var(--border)", marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>🌙</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-3)" }}>DINNER MENU</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
                      {getMenuSummary(dinner)}
                    </p>
                    {dinner.sweet && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#db2777", fontWeight: 700 }}>🍰 Sweet: {dinner.sweet}</p>}
                  </div>

                  {/* Chef Note Display */}
                  {chefNote && (
                    <div style={{ borderTop: "1px solid var(--border-2)", paddingTop: 12, marginBottom: 8 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "var(--text-4)", textTransform: "uppercase" }}>👨‍🍳 CHEF'S NOTE</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>"{chefNote}"</p>
                    </div>
                  )}

                  {/* Announcement Display */}
                  {announcement && (
                    <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", padding: 10, borderRadius: 10, marginTop: 12 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase" }}>📢 ANNOUNCEMENT</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>{announcement}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 26, boxShadow: "var(--shadow-md)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>📁 Menu Templates Catalog</h3>
            
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Template Name (e.g. Special Sunday, Holiday Fest)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13 }}
              />
              <button
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                style={{ background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`, border: "none", color: "#fff", padding: "11px 22px", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: `0 6px 16px ${accent.shadow}` }}
              >
                {savingTemplate ? "Saving..." : "💾 Save Current As Template"}
              </button>
            </div>

            {/* Template Catalog Grid */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {templates.length > 0 ? templates.map((tpl) => (
                <div
                  key={tpl.id}
                  style={{
                    background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: 14,
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 12
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{tpl.template_name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-4)" }}>Lunch &amp; Dinner configured</p>
                  </div>
                  <button
                    onClick={() => handleApplyTemplate(tpl)}
                    style={{ background: accent.hex, border: "none", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                  >
                    Apply
                  </button>
                </div>
              )) : (
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-4)" }}>No templates created yet. Enter template name above to save today's configuration.</p>
              )}
            </div>
          </div>

          {/* History Log Table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 26, boxShadow: "var(--shadow-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>📅 Weekly Menu History</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-4)" }}>Track and manage all past menu sheets</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value);
                    loadHistory(0, e.target.value);
                  }}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 12 }}
                />
                {searchDate && (
                  <button
                    onClick={() => {
                      setSearchDate("");
                      loadHistory(0, "");
                    }}
                    style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "var(--text-3)", cursor: "pointer" }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Table wrap */}
            <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 800, color: "var(--text-3)" }}>Date</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 800, color: "var(--text-3)" }}>Lunch Summary</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 800, color: "var(--text-3)" }}>Dinner Summary</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--text-3)" }}>Category</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--text-3)" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--text-3)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? history.map((item) => {
                    const l = typeof item.lunch === "string" ? JSON.parse(item.lunch) : item.lunch || {};
                    const d = typeof item.dinner === "string" ? JSON.parse(item.dinner) : item.dinner || {};
                    const statusColor = getStatusColor(item.status);
                    const typeColor = menuTypeBadges[item.menu_type] || menuTypeBadges.Regular;
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border-2)", background: "transparent" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.menu_date.split("T")[0]}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-3)" }}>{getMenuSummary(l)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-3)" }}>{getMenuSummary(d)}</td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: typeColor.color, background: typeColor.bg }}>
                            {item.menu_type}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: statusColor.color, background: statusColor.bg }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button onClick={() => loadMenuToEdit(item)} style={{ background: "rgba(59,130,246,0.1)", border: "none", color: "#3b82f6", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                            <button onClick={() => handleDeleteMenu(item.id)} style={{ background: "rgba(220,38,38,0.1)", border: "none", color: "#dc2626", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" style={{ padding: "30px 0", textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>No menus recorded in history log</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalHistoryCount > historyLimit && (
              <div style={{ display: "flex", justifySelf: "flex-end", gap: 10, marginTop: 14 }}>
                <button
                  disabled={historyPage === 0}
                  onClick={() => {
                    setHistoryPage(p => p - 1);
                    loadHistory(historyPage - 1, searchDate);
                  }}
                  style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", opacity: historyPage === 0 ? 0.5 : 1 }}
                >
                  ◀ Previous
                </button>
                <button
                  disabled={(historyPage + 1) * historyLimit >= totalHistoryCount}
                  onClick={() => {
                    setHistoryPage(p => p + 1);
                    loadHistory(historyPage + 1, searchDate);
                  }}
                  style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", opacity: (historyPage + 1) * historyLimit >= totalHistoryCount ? 0.5 : 1 }}
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── STUDENT VIEW ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680, margin: "0 auto" }}>
          
          {/* Main Showcase Panel */}
          {todayStatus === "Published" ? (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 26, boxShadow: "var(--shadow-md)" }}>
              
              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 800, textTransform: "uppercase" }}>TODAY'S MENU SHEET</span>
                  <h3 style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>{menuDate}</h3>
                </div>
                
                <span style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800,
                  background: (menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).bg,
                  color: (menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).color,
                  border: `1px solid ${(menuTypeBadges[todayMenuType] || menuTypeBadges.Regular).border}`
                }}>
                  {todayMenuType.toUpperCase()}
                </span>
              </div>

              {/* Special highlight */}
              {todaySpecialDish !== "No Special Dish" && (
                <div style={{ background: `linear-gradient(135deg, ${accent.hex}18, ${accent.dark}08)`, borderLeft: `4px solid ${accent.hex}`, padding: "12px 18px", borderRadius: "0 14px 14px 0", marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: accent.hex, textTransform: "uppercase", letterSpacing: "0.06em" }}>⭐ TODAY'S SPECIAL HIGHLIGHT</p>
                  <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 900, color: "var(--text)" }}>{todaySpecialDish}</p>
                </div>
              )}

              {/* Food Photo */}
              {image && (
                <div style={{ width: "100%", height: 220, borderRadius: 16, overflow: "hidden", marginBottom: 20, border: "1px solid var(--border)" }}>
                  <img src={image} alt="Showcase Today Menu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              {/* Lunch Showcase Card */}
              <div style={{ background: "var(--bg-hover)", borderRadius: 18, padding: 18, border: "1px solid var(--border)", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>☀️</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-2)" }}>LUNCH MEAL</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="form-grid-2">
                  {Object.entries(lunch).filter(([, v]) => v).map(([k, v]) => (
                    <div key={`student-lunch-${k}`} style={{ background: "var(--bg-card)", border: "1px solid var(--border-2)", borderRadius: 10, padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 700, textTransform: "uppercase" }}>{k}</span>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dinner Showcase Card */}
              <div style={{ background: "var(--bg-hover)", borderRadius: 18, padding: 18, border: "1px solid var(--border)", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>🌙</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-2)" }}>DINNER MEAL</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="form-grid-2">
                  {Object.entries(dinner).filter(([, v]) => v).map(([k, v]) => (
                    <div key={`student-dinner-${k}`} style={{ background: "var(--bg-card)", border: "1px solid var(--border-2)", borderRadius: 10, padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 700, textTransform: "uppercase" }}>{k}</span>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert note boxes */}
              {chefNote && (
                <div style={{ borderLeft: "4px solid var(--text-4)", padding: "4px 14px", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "var(--text-4)", textTransform: "uppercase" }}>Chef's Message</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>"{chefNote}"</p>
                </div>
              )}

              {announcement && (
                <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)", padding: 14, borderRadius: 12, marginTop: 14 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#dc2626", textTransform: "uppercase" }}>📢 Mess Notice</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#dc2626", fontWeight: 700 }}>{announcement}</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: "40px 20px", textAlign: "center", boxShadow: "var(--shadow-md)" }}>
              <span style={{ fontSize: 48 }}>🍽️</span>
              <h3 style={{ margin: "14px 0 6px", fontSize: 18, fontWeight: 800 }}>No Menu Published Yet</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-4)" }}>The mess coordinator has not published today's meal sheet yet.</p>
            </div>
          )}

          {/* Rating & Feedback Section (Only active if menu exists) */}
          {menuId && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: 26, boxShadow: "var(--shadow-md)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>⭐ Rate Today's Menu</h3>
              
              {/* Avg rating score */}
              <div style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--bg-hover)", borderRadius: 16, padding: "14px 18px", border: "1px solid var(--border)", marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: accent.hex }}>{avgRating.toFixed(1)}</span>
                <div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} style={{ color: s <= Math.round(avgRating) ? "#e11d48" : "var(--text-4)", fontSize: 14 }}>★</span>
                    ))}
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-4)", fontWeight: 700 }}>Average of {totalRatings} ratings</p>
                </div>
              </div>

              {/* Input rating form */}
              <form onSubmit={handleSubmitFeedback} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Your Score</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setStudentRating(stars)}
                        style={{
                          flex: 1, padding: "10px 0", borderRadius: 10, border: studentRating === stars ? `1px solid ${accent.hex}` : "1px solid var(--border)",
                          background: studentRating === stars ? `linear-gradient(135deg, ${accent.hex}15, ${accent.dark}08)` : "var(--bg-input)",
                          color: studentRating === stars ? accent.hex : "var(--text-3)", fontSize: 15, fontWeight: 800, cursor: "pointer"
                        }}
                      >
                        {stars} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-4)", marginBottom: 6 }}>Feedback / Comments</label>
                  <textarea
                    placeholder="e.g. Sabji was delicious, but the dal had extra salt. Roti was hot and soft!"
                    rows="3"
                    value={studentFeedback}
                    onChange={(e) => setStudentFeedback(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13, resize: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ alignSelf: "flex-end", background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`, border: "none", color: "#fff", padding: "10px 24px", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: `0 6px 16px ${accent.shadow}` }}
                >
                  ✓ Submit Rating
                </button>
              </form>

              {/* Feedbacks comments history display */}
              {feedbacksList.length > 0 && (
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border-2)", paddingTop: 18 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, color: "var(--text-3)" }}>Recent Feedback logs:</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {feedbacksList.map((f) => (
                      <div key={f.id} style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: accent.hex }}>{f.rating} ★ Rating</span>
                          <span style={{ fontSize: 10, color: "var(--text-4)" }}>{new Date(f.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>
                          {f.feedback || <span style={{ fontStyle: "italic", color: "var(--text-4)" }}>No comment left</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

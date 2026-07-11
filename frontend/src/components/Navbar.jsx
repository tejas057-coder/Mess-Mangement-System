import { useEffect, useMemo, useState, useRef } from "react";
import { FaSearch, FaBell, FaTimes, FaCalendarAlt, FaCheckDouble, FaTrashAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import API_BASE from "../api";

function Navbar() {
  const { isDark, accent } = useTheme();
  const ownerName = localStorage.getItem("owner_full_name") || "Mess Owner";
  const ownerRole = localStorage.getItem("owner_role") || "Admin";
  const [query, setQuery] = useState("");
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertPermissionState, setAlertPermissionState] = useState(
    localStorage.getItem("messmate_alerts_configured") || "prompt"
  );

  const notifRef = useRef(null);
  const isInitialLoad = useRef(true);
  const lastNotifiedId = useRef(0);

  function getScreenSize() {
    if (window.innerWidth < 640) return "mobile";
    if (window.innerWidth < 992) return "tablet";
    return "desktop";
  }

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn("Audio chime play blocked:", err);
    }
  };

  const showNativeNotification = (title, message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  };

  const fetchNotifications = () => {
    fetch(`${API_BASE}/notifications`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setNotifications(list);
        if (list.length > 0) {
          const maxId = Math.max(...list.map(n => n.id));
          if (isInitialLoad.current) {
            lastNotifiedId.current = maxId;
            isInitialLoad.current = false;
          } else if (maxId > lastNotifiedId.current) {
            const newNotifs = list.filter(n => n.id > lastNotifiedId.current);
            lastNotifiedId.current = maxId;
            if (localStorage.getItem("messmate_alerts_configured") === "granted") {
              playChime();
              newNotifs.forEach(n => {
                showNativeNotification(n.title, n.message);
                toast.info(
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{n.title}</span>
                    <span style={{ fontSize: 12 }}>{n.message}</span>
                  </div>,
                  { icon: n.type === "payment" ? "💰" : n.type === "member" ? "👤" : "📢" }
                );
              });
            }
          }
        } else {
          isInitialLoad.current = false;
        }
      })
      .catch(err => console.error("Error fetching notifications:", err));
  };

  useEffect(() => {
    const handle = () => setScreenSize(getScreenSize());
    handle();
    window.addEventListener("resize", handle);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    // Close desktop dropdown when clicking outside (not needed for mobile bottom sheet)
    const clickOutside = (e) => {
      if (
        screenSize !== "mobile" &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);

    return () => {
      window.removeEventListener("resize", handle);
      clearInterval(interval);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);

  const handleEnableAlerts = () => {
    localStorage.setItem("messmate_alerts_configured", "granted");
    setAlertPermissionState("granted");
    playChime();
    if ("Notification" in window) Notification.requestPermission();
  };

  const handleDisableAlerts = () => {
    localStorage.setItem("messmate_alerts_configured", "dismissed");
    setAlertPermissionState("dismissed");
  };

  const markAsRead = (id) => {
    fetch(`${API_BASE}/notifications/${id}/read`, { method: "PUT" })
      .then(() => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: 1 } : n)))
      .catch(err => console.error(err));
  };

  const markAllRead = () => {
    fetch(`${API_BASE}/notifications/read-all`, { method: "PUT" })
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, read_status: 1 }))))
      .catch(err => console.error(err));
  };

  const clearAll = () => {
    fetch(`${API_BASE}/notifications`, { method: "DELETE" })
      .then(() => setNotifications([]))
      .catch(err => console.error(err));
  };

  const today = useMemo(() => new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  }), []);

  const unreadCount = notifications.filter(n => !n.read_status).length;
  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";

  /* ── Shared notification item renderer ── */
  const renderNotifItems = (large = false) => {
    if (notifications.length === 0) {
      return (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-4)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: large ? 36 : 24 }}>🔔</span>
          <span style={{ fontWeight: 600 }}>No notifications yet</span>
        </div>
      );
    }
    return notifications.map(n => {
      let typeIcon = "📢";
      if (n.type === "payment") typeIcon = "💰";
      if (n.type === "member") typeIcon = "👤";
      return (
        <div
          key={n.id}
          onClick={() => !n.read_status && markAsRead(n.id)}
          style={{
            padding: large ? "14px 16px" : "10px 12px",
            borderRadius: large ? 16 : 12,
            background: n.read_status ? "transparent" : "var(--bg-hover)",
            border: "1px solid var(--border-2)",
            cursor: n.read_status ? "default" : "pointer",
            transition: "background 0.2s",
            display: "flex", gap: large ? 14 : 10, alignItems: "flex-start",
            position: "relative",
          }}
        >
          <span style={{ fontSize: large ? 22 : 16, marginTop: 2 }}>{typeIcon}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: large ? 14 : 12, fontWeight: n.read_status ? 600 : 800, color: "var(--text)", wordBreak: "break-word" }}>
              {n.title}
            </span>
            <span style={{ fontSize: large ? 13 : 11, color: "var(--text-3)", wordBreak: "break-word" }}>
              {n.message}
            </span>
            <span style={{ fontSize: large ? 11 : 9, color: "var(--text-4)", alignSelf: "flex-end", marginTop: 4 }}>
              {new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {!n.read_status && (
            <div style={{ width: large ? 9 : 6, height: large ? 9 : 6, borderRadius: "50%", background: accent.hex, position: "absolute", top: large ? 16 : 12, right: large ? 16 : 12 }} />
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

      {/* ── Mobile Notification Bottom Sheet (rendered at top level so z-index works) ── */}
      {isMobile && showNotifications && (
        <div
          onClick={() => setShowNotifications(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Stop click from bubbling so tapping the sheet doesn't close it */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              background: "var(--bg-card)",
              borderRadius: "22px 22px 0 0",
              padding: "16px 16px 32px",
              boxShadow: "0 -10px 60px rgba(0,0,0,0.4)",
              border: "1px solid var(--border)",
              borderBottom: "none",
              maxHeight: "75vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 44, height: 5, background: "var(--border)", borderRadius: 99, margin: "0 auto 6px", flexShrink: 0 }} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <span style={{ fontWeight: 900, color: "var(--text)", fontSize: 18, display: "block" }}>Notifications</span>
                <span style={{ fontSize: 12, color: "var(--text-4)" }}>{notifications.length} total · {unreadCount} unread</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={markAllRead}
                  title="Mark all read"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--accent)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FaCheckDouble />
                </button>
                <button
                  onClick={clearAll}
                  title="Clear all"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", color: "#dc2626", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-3)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border-2)", flexShrink: 0 }} />

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {renderNotifItems(true)}
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Permission Banner ── */}
      {alertPermissionState === "prompt" && (
        <div style={{
          background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`,
          color: "#fff", padding: "10px 24px", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontSize: 13, fontWeight: 700, gap: 12,
          boxShadow: `0 8px 24px ${accent.shadow}`, transition: "all 0.3s ease", zIndex: 1400,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🔔 Would you like to enable live sound alerts & browser alerts for mess payments and member changes?
          </span>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={handleEnableAlerts} style={{ border: "none", background: "#fff", color: accent.hex, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
              Enable
            </button>
            <button onClick={handleDisableAlerts} style={{ border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
              Later
            </button>
          </div>
        </div>
      )}

      <nav style={{
        minHeight: isMobile ? "auto" : 76,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: isMobile ? "12px 12px 10px 60px" : isTablet ? "0 18px" : "0 24px",
        gap: 14,
        background: "var(--nav-bg)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--nav-border)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        flexShrink: 0,
        flexWrap: isMobile ? "wrap" : "nowrap",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}>

        {/* Search box */}
        <div style={{
          height: 46, background: "var(--bg-input)", border: "1px solid var(--border)",
          borderRadius: 14, display: "flex", alignItems: "center", padding: "0 12px", gap: 10,
          flex: 1, minWidth: isMobile ? 0 : 240, maxWidth: isMobile ? "100%" : 540,
          order: isMobile ? 2 : 0, width: isMobile ? "100%" : "auto",
          boxShadow: "var(--shadow-sm)", transition: "background 0.3s ease, border-color 0.3s ease",
        }}>
          <FaSearch style={{ color: "var(--text-4)", fontSize: 13, flexShrink: 0 }} />
          <input
            type="text"
            placeholder={isMobile ? "Search member..." : "Search members by name or phone..."}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text)", minWidth: 0 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 12 }}>
              <FaTimes />
            </button>
          )}
          <button type="button" style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 10, background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 14px ${accent.shadow}`, flexShrink: 0 }}>
            {isMobile ? "Go" : "Search"}
          </button>
        </div>

        {/* Right section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, order: isMobile ? 1 : 0, marginLeft: isMobile ? "auto" : 0, position: "relative" }}>

          {/* Date pill (hidden on mobile) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 12, background: "var(--bg-input)", border: "1px solid var(--border)" }}>
              <FaCalendarAlt style={{ color: "var(--accent)", fontSize: 13, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{today}</span>
            </div>
          )}

          {/* Bell Button */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowNotifications(prev => !prev)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--bg-input)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", fontSize: 15, color: "var(--text-3)",
                flexShrink: 0, transition: "all 0.2s ease",
              }}
            >
              <FaBell style={{ color: unreadCount > 0 ? "var(--accent)" : "inherit" }} />
              {unreadCount > 0 && (
                <span style={{
                  minWidth: 16, height: 16, background: "#ef4444", borderRadius: 8,
                  position: "absolute", top: -4, right: -4,
                  border: `2px solid var(--bg-card)`, color: "#fff",
                  fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0 4px",
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Desktop dropdown (not shown on mobile — handled above at top level) */}
            {!isMobile && showNotifications && (
              <div style={{
                position: "absolute", top: 48, right: 0, width: 330,
                background: "var(--bg-card)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)",
                border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-lg)",
                zIndex: 1500, padding: 14, display: "flex", flexDirection: "column", gap: 10,
                maxHeight: 380, overflowY: "auto",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-2)", paddingBottom: 10 }}>
                  <span style={{ fontWeight: 800, color: "var(--text)", fontSize: 14 }}>Notifications</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={markAllRead} title="Mark all read" style={{ border: "none", background: "transparent", color: "var(--accent)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <FaCheckDouble />
                    </button>
                    <button onClick={clearAll} title="Clear all" style={{ border: "none", background: "transparent", color: "#dc2626", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {renderNotifItems(false)}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: isMobile ? 0 : "6px 12px", borderRadius: 14, background: isMobile ? "transparent" : "var(--bg-card)", border: isMobile ? "none" : "1px solid var(--border)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${accent.hex}, ${accent.dark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, boxShadow: `0 6px 16px ${accent.shadow}`, flexShrink: 0 }}>
              {ownerName.charAt(0).toUpperCase()}
            </div>
            {!isMobile && (
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{ownerName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-4)" }}>{ownerRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile date row */}
        {isMobile && (
          <div style={{ width: "100%", order: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", width: "fit-content" }}>
              <FaCalendarAlt style={{ color: "var(--accent)", fontSize: 12 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{today}</span>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
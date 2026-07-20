import { useCallback, useEffect, useState } from "react";
import HeroDashboard from "./HeroDashboard.jsx";
import AboutDashboard from "./AboutDashboard.jsx";
import ProjectsDashboard from "./ProjectsDashboard.jsx";
import SkillsDashboard from "./SkillsDashboard.jsx";
import MessagesDashboard from "./MessagesDashboard.jsx";
import "../../style/admin/Dashboard.css";
import api from "../../api";

const SECTIONS = [
  { key: "hero", index: "01", label: "Hero", hint: "Landing intro" },
  { key: "about", index: "02", label: "About", hint: "Bio & stats" },
  { key: "projects", index: "03", label: "Work", hint: "Project cards" },
  { key: "skills", index: "04", label: "Skills", hint: "Toolkit tiles" },
  { key: "messages", index: "05", label: "Messages", hint: "Inbox" },
];

// How often to re-check for new messages while the dashboard is open,
// regardless of which tab is active. Bump this up if it's too chatty.
const UNREAD_POLL_MS = 20000;

export default function Dashboard() {
  const [active, setActive] = useState("hero");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Runs independently of which tab is open — MessagesDashboard only
  // exists in the DOM while you're actually on the Messages tab, so
  // relying on it alone means the badge never updates unless you're
  // already looking at it. This polls in the background instead.
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/messages/");
      const data = Array.isArray(response.data) ? response.data : response.data.results ?? [];
      setUnreadCount(data.filter((m) => !m.is_read).length);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Esc closes the modal, same as clicking the backdrop or "Cancel".
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowLogoutConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogoutConfirm]);

  const confirmLogout = async () => {
  try {
    const refresh = localStorage.getItem("refresh_token");

    if (refresh) {
      await api.post("/logout/", {
        refresh,
      });
    }
  } catch (error) {
    console.log(error);
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  delete api.defaults.headers.common["Authorization"];

  window.location.href = "/login";
};

  const renderSection = () => {
    switch (active) {
      case "hero":
        return <HeroDashboard />;
      case "about":
        return <AboutDashboard />;
      case "projects":
        return <ProjectsDashboard />;
      case "skills":
        return <SkillsDashboard />;
      case "messages":
        // Still wired to onUnreadChange so mark-read/delete actions taken
        // right here update the badge instantly, instead of waiting for
        // the next poll tick.
        return <MessagesDashboard onUnreadChange={setUnreadCount} />;
      default:
        return null;
    }
  };

  return (
    <div className="dash-shell">
      <aside className="dash-rail">
        <div className="dash-rail__brand">
          <span className="dash-rail__mark">P.</span>
          <div className="dash-rail__brandtext">
            <strong>Content Editor</strong>
            <span>Prabin.O — portfolio</span>
          </div>
        </div>

        <nav className="dash-rail__nav">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              className={`dash-rail__item ${active === section.key ? "is-active" : ""}`}
              onClick={() => setActive(section.key)}
            >
              <span className="dash-rail__index">§{section.index}</span>
              <span className="dash-rail__labels">
                <span className="dash-rail__label">{section.label}</span>
                <span className="dash-rail__hint">{section.hint}</span>
              </span>
              {section.key === "messages" && unreadCount > 0 && (
                <span className="dash-rail__badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="dash-rail__footer">
          <button
            className="dash-rail__logout"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Log out"
          >
            <span className="dash-rail__logout-icon" aria-hidden="true">⏻</span>
            <span className="dash-rail__logout-text">Log out</span>
          </button>
        </div>
      </aside>

      <main className="dash-main">{renderSection()}</main>

      {showLogoutConfirm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="logout-modal-title" className="modal-box__title">
              Log out
            </h3>
            <p className="modal-box__desc">
              You'll need to sign back in to edit the site content. Continue?
            </p>
            <div className="modal-box__actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
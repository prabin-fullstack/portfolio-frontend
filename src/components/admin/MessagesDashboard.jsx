import { useEffect, useState } from "react";
import "../../style/admin/MessagesDashboard.css";
import api from "../../api";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MessagesDashboard({ onUnreadChange }) {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unread
  const [confirmTarget, setConfirmTarget] = useState(null); // message pending delete
  const [toast, setToast] = useState(null); // { message }

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await api.get("/messages/");
        setMessages(
          response.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          ),
        );
      } catch (error) {
        console.log(error);
      }
    };
    getMessages();
  }, []);

  // toast auto-dismiss
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // let Escape close the delete confirmation
  useEffect(() => {
    if (!confirmTarget) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setConfirmTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmTarget]);

  const showToast = (message) => setToast({ message });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount, onUnreadChange]);

  const markRead = async (id, isRead) => {
    try {
      await api.patch(`/messages/${id}/`, {
        is_read: isRead,
      });

      setMessages((m) =>
        m.map((msg) => (msg.id === id ? { ...msg, is_read: isRead } : msg)),
      );
      showToast(isRead ? "Marked as read" : "Marked as unread");
    } catch (error) {
      console.log(error);
      showToast("Couldn't update — try again");
    }
  };

  const askDelete = (message) => setConfirmTarget(message);
  const cancelDelete = () => setConfirmTarget(null);

  const confirmDelete = async () => {
    if (!confirmTarget) return;

    try {
      await api.delete(`/messages/${confirmTarget.id}/`);
      setMessages((m) => m.filter((msg) => msg.id !== confirmTarget.id));
      showToast("Message deleted");
    } catch (error) {
      console.log(error);
      showToast("Couldn't delete — try again");
    } finally {
      setConfirmTarget(null);
    }
  };

  const visible =
    filter === "unread" ? messages.filter((m) => !m.is_read) : messages;

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-head__eyebrow">§05 — Inbox</span>
          <h1 className="section-head__title">Messages</h1>
          <p className="section-head__desc">
            Submissions from the Contact section, newest first.
          </p>
        </div>
        <div className="messages-filter">
          <button
            type="button"
            className={`messages-filter__btn ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            className={`messages-filter__btn ${filter === "unread" ? "is-active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty-note">
          {filter === "unread"
            ? "No unread messages — you're caught up."
            : "No messages yet."}
        </p>
      ) : (
        <div className="messages-list">
          {visible.map((msg) => (
            <details
              className={`message-card ${!msg.is_read ? "is-unread" : ""}`}
              key={msg.id}
              onToggle={(e) => {
                if (e.target.open && !msg.is_read) markRead(msg.id, true);
              }}
            >
              <summary className="message-card__summary">
                <span className="message-card__dot" aria-hidden="true" />
                <span className="message-card__from">
                  <span className="message-card__name">{msg.name}</span>
                  <span className="message-card__email">{msg.email}</span>
                </span>
                <span className="message-card__subject">
                  {msg.subject || "(no subject)"}
                </span>
                <span className="message-card__time">
                  {timeAgo(msg.created_at)}
                </span>
              </summary>

              <div className="message-card__body">
                <p className="message-card__text">{msg.message}</p>
                <div className="message-card__actions">
                  <a
                    className="btn btn-ghost btn-sm"
                    href={`mailto:${msg.email}`}
                  >
                    ↩ Reply
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => markRead(msg.id, !msg.is_read)}
                  >
                    {msg.is_read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => askDelete(msg)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      {confirmTarget && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <span className="modal__dot" aria-hidden="true" />
            <h3 className="modal__title">Delete message?</h3>
            <p className="modal__body">
              This will permanently remove the message from{" "}
              <strong>{confirmTarget.name || confirmTarget.email}</strong>. This can't be undone.
            </p>
            <div className="modal__actions">
              <button type="button" className="btn btn-ghost" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast__dot" aria-hidden="true" />
          {toast.message}
        </div>
      )}
    </section>
  );
}
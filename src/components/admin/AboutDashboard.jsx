import { useEffect, useState } from "react";
import "../../style/admin/AboutDashboard.css";
import api from "../../api";

let tempId = -1;

export default function AboutDashboard() {
  const [form, setForm] = useState({
    eyebrow: "",
    heading: "",
    bio: "",
    bio_secondary: "",
    status: "",
    stats: [],
  });
  const [status, setStatus] = useState("idle");
  const [confirmTarget, setConfirmTarget] = useState(null); // stat pending delete
  const [toast, setToast] = useState(null); // { message }

  useEffect(() => {
    const getAboutData = async () => {
      try {
        const response = await api.get("/about");
        setForm(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getAboutData();
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

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateStat = (id, key, value) =>
    setForm((f) => ({
      ...f,
      stats: f.stats.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    }));

  const addStat = () => {
    setForm((f) => ({
      ...f,
      stats: [
        ...f.stats,
        {
          id: tempId--,
          value: 0,
          suffix: "+",
          label: "",
          order: f.stats.length + 1,
        },
      ],
    }));
    showToast("Stat added");
  };

  const askRemoveStat = (stat) =>
    setConfirmTarget({ id: stat.id, label: stat.label || "this stat" });

  const cancelRemoveStat = () => setConfirmTarget(null);

  const confirmRemoveStat = () => {
    if (!confirmTarget) return;
    setForm((f) => ({ ...f, stats: f.stats.filter((s) => s.id !== confirmTarget.id) }));
    showToast("Stat removed");
    setConfirmTarget(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setStatus("saving");

    try {
      const response = await api.put("/about/", form);
      setForm(response.data);

      setStatus("saved");
      showToast("About section saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      showToast("Couldn't save — try again");
    }
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-head__eyebrow">§02 — Profile</span>
          <h1 className="section-head__title">About</h1>
          <p className="section-head__desc">The narrative and the numbers that back it up.</p>
        </div>
        <span className={`status-chip ${status === "saving" ? "is-saving" : status === "saved" ? "is-saved" : ""}`}>
          {status === "saving" && "saving…"}
          {status === "saved" && "synced"}
          {status === "idle" && "up to date"}
        </span>
      </div>

      <form onSubmit={save}>
        <div className="card">
          <h2 className="card__title">Copy</h2>
          <div className="field-grid">
            <div className="field">
              <label>Eyebrow</label>
              <input type="text" value={form.eyebrow} onChange={update("eyebrow")} maxLength={100} />
            </div>
            <div className="field">
              <label>Heading</label>
              <input type="text" value={form.heading} onChange={update("heading")} maxLength={150} />
            </div>
            <div className="field is-wide">
              <label>Bio</label>
              <textarea value={form.bio} onChange={update("bio")} rows={4} />
            </div>
            <div className="field is-wide">
              <label>Secondary bio</label>
              <textarea value={form.bio_secondary} onChange={update("bio_secondary")} rows={3} />
            </div>
            <div className="field is-wide">
              <label>Availability status</label>
              <input type="text" value={form.status} onChange={update("status")} maxLength={150} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="about-stats__head">
            <h2 className="card__title">Stats</h2>
            <button type="button" className="btn btn-ghost btn-sm add-row" onClick={addStat}>
              + Add stat
            </button>
          </div>

          {form.stats.length === 0 ? (
            <p className="empty-note">No stats yet — add one to show a number on the About section.</p>
          ) : (
            <div className="repeater">
              {form.stats.map((stat, i) => (
                <div className="repeater__row about-stats__row" key={stat.id}>
                  <div className="repeater__row-head">
                    <span className="repeater__badge">stat {i + 1}</span>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => askRemoveStat(stat)}>
                      Remove
                    </button>
                  </div>
                  <div className="about-stats__fields">
                    <div className="field">
                      <label>Value</label>
                      <input
                        type="number"
                        value={stat.value}
                        onChange={(e) => updateStat(stat.id, "value", Number(e.target.value))}
                      />
                    </div>
                    <div className="field">
                      <label>Suffix</label>
                      <input
                        type="text"
                        value={stat.suffix}
                        onChange={(e) => updateStat(stat.id, "suffix", e.target.value)}
                        maxLength={10}
                      />
                    </div>
                    <div className="field is-wide">
                      <label>Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(stat.id, "label", e.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div className="field">
                      <label>Order</label>
                      <input
                        type="number"
                        value={stat.order}
                        onChange={(e) => updateStat(stat.id, "order", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="about-form__actions">
          <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save about section"}
          </button>
        </div>
      </form>

      {confirmTarget && (
        <div className="modal-overlay" onClick={cancelRemoveStat}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <span className="modal__dot" aria-hidden="true" />
            <h3 className="modal__title">Remove stat?</h3>
            <p className="modal__body">
              This will remove <strong>{confirmTarget.label}</strong> from the list. It won't disappear from the
              live site until you hit "Save about section".
            </p>
            <div className="modal__actions">
              <button type="button" className="btn btn-ghost" onClick={cancelRemoveStat}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmRemoveStat}>
                Remove
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
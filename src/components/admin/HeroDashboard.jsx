import { useEffect, useState } from "react";
import "../../style/admin/HeroDashboard.css";
import api from "../../api";

export default function HeroDashboard() {
  const [form, setForm] = useState({
    eyebrow: "",
    name: "",
    role: "",
    tagline: "",
    description: "",
    primary_cta_label: "",
    secondary_cta_label: "",
    image: "",
    image_alt: "",
  });
  const [status, setStatus] = useState("idle"); // idle | saving | saved
  const [toast, setToast] = useState(null); // { message }

  useEffect(() => {
    const getHeroData = async () => {
      try {
        const response = await api.get("/hero");
        setForm(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getHeroData();
  }, []);

  // toast auto-dismiss
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message) => setToast({ message });

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setStatus("saving");

    try {
      const response = await api.patch("/hero/", form);
      setForm(response.data);

      setStatus("saved");
      showToast("Hero section saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.log(error);
      setStatus("idle");
      showToast("Couldn't save — try again");
    }
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-head__eyebrow">§01 — Landing</span>
          <h1 className="section-head__title">Hero</h1>
          <p className="section-head__desc">
            The first thing a visitor sees. Keep the tagline short — it sets the
            pace for everything below it.
          </p>
        </div>
        <span
          className={`status-chip ${status === "saving" ? "is-saving" : status === "saved" ? "is-saved" : ""}`}
        >
          {status === "saving" && "saving…"}
          {status === "saved" && "synced"}
          {status === "idle" && "up to date"}
        </span>
      </div>

      <form onSubmit={save} className="hero-form">
        <div className="hero-form__layout">
          <div className="card">
            <h2 className="card__title">Copy</h2>
            <div className="field-grid">
              <div className="field">
                <label>Eyebrow</label>
                <input
                  type="text"
                  value={form.eyebrow}
                  onChange={update("eyebrow")}
                  maxLength={100}
                />
              </div>
              <div className="field">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  maxLength={100}
                />
              </div>
              <div className="field">
                <label>Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={update("role")}
                  maxLength={150}
                />
              </div>
              <div className="field">
                <label>Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={update("tagline")}
                  maxLength={200}
                />
              </div>
              <div className="field is-wide">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={update("description")}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">Call to action</h2>
            <div className="field-grid">
              <div className="field">
                <label>Primary button label</label>
                <input
                  type="text"
                  value={form.primary_cta_label}
                  onChange={update("primary_cta_label")}
                  maxLength={50}
                />
              </div>
              <div className="field">
                <label>Secondary button label</label>
                <input
                  type="text"
                  value={form.secondary_cta_label}
                  onChange={update("secondary_cta_label")}
                  maxLength={50}
                />
              </div>

              
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">Portrait</h2>
            <div className="hero-form__image-row">
              <div className="hero-form__preview">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={form.image_alt || "Hero preview"}
                  />
                ) : (
                  <span>no image</span>
                )}
              </div>
              <div className="field-grid is-single hero-form__image-fields">
                <div className="field">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={update("image")}
                  />
                </div>
                <div className="field">
                  <label>Alt text</label>
                  <input
                    type="text"
                    value={form.image_alt}
                    onChange={update("image_alt")}
                    maxLength={200}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-form__actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save hero section"}
          </button>
        </div>
      </form>

      {toast && (
        <div className="toast" role="status">
          <span className="toast__dot" aria-hidden="true" />
          {toast.message}
        </div>
      )}
    </section>
  );
}

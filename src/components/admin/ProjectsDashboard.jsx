import { useCallback, useEffect, useState } from "react";
import "../../style/admin/ProjectsDashboard.css";
import api from "../../api";

const BLANK = {
  title: "",
  year: "",
  role: "",
  description: "",
  tags: "",
  image: "",
  live_url: "",
  code_url: "",
  order: 0,
};

// tags is stored as a comma-separated string on the model; split it for display.
const tagList = (tags) => (tags || "").split(",").map((t) => t.trim()).filter(Boolean);

export default function ProjectsDashboard() {
  const [projects, setProjects] = useState([]);
  const [openId, setOpenId] = useState(null); // "new" | project.id | null
  const [draft, setDraft] = useState(BLANK);
  const [confirmTarget, setConfirmTarget] = useState(null); // project pending delete
  const [toast, setToast] = useState(null); // { message }

  const getProjects = useCallback(async () => {
    try {
      const response = await api.get("/projects/");
      // Guards against DRF pagination ever being turned on, which would
      // return { count, next, previous, results } instead of a plain array.
      const data = Array.isArray(response.data) ? response.data : response.data.results ?? [];
      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

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

  const startNew = () => {
    setDraft(BLANK);
    setOpenId("new");
  };

  const startEdit = (project) => {
    setDraft(project);
    setOpenId(project.id);
  };

  const cancel = () => {
    setOpenId(null);
    setDraft(BLANK);
  };

  const updateDraft = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const updateDraftNumber = (key) => (e) => setDraft((d) => ({ ...d, [key]: Number(e.target.value) }));

  const save = async (e) => {
    e.preventDefault();
    const isNew = openId === "new";

    try {
      if (isNew) {
        await api.post("/projects/", draft);
      } else {
        await api.put(`/projects/${openId}/`, draft);
      }

      // Re-fetch instead of merging response.data into state — this way
      // the row always reflects the full, canonical record from the DB.
      await getProjects();
      cancel();
      showToast(isNew ? "New project added" : "Project updated");
    } catch (error) {
      console.log(error);
      showToast("Something went wrong — try again");
    }
  };

  const askDelete = (project) => setConfirmTarget(project);
  const cancelDelete = () => setConfirmTarget(null);

  const confirmDelete = async () => {
    if (!confirmTarget) return;

    try {
      await api.delete(`/projects/${confirmTarget.id}/`);
      setProjects((prev) => prev.filter((proj) => proj.id !== confirmTarget.id));
      showToast("Project deleted");
    } catch (error) {
      console.log(error);
      showToast("Couldn't delete — try again");
    } finally {
      setConfirmTarget(null);
    }
  };

  const sorted = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-head__eyebrow">§03 — Selected work</span>
          <h1 className="section-head__title">Projects</h1>
          <p className="section-head__desc">Rows shown on the Work section, ordered by the "order" field.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startNew}>
          + New project
        </button>
      </div>

      <div className="projects-list">
        {openId === "new" && (
          <ProjectForm draft={draft} updateDraft={updateDraft} updateDraftNumber={updateDraftNumber} onSave={save} onCancel={cancel} isNew />
        )}

        {projects.length === 0 && openId !== "new" && (
          <p className="empty-note">No projects yet — add your first one.</p>
        )}

        {sorted.map((project) =>
          openId === project.id ? (
            <ProjectForm key={project.id} draft={draft} updateDraft={updateDraft} updateDraftNumber={updateDraftNumber} onSave={save} onCancel={cancel} />
          ) : (
            <article className="project-row" key={project.id}>
              <div className="project-row__thumb">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <span className="project-row__thumb-fallback">
                    {(project.title || "?").trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="project-row__main">
                <div className="project-row__title-line">
                  <span className="project-row__order">#{project.order}</span>
                  <h3>{project.title || "Untitled project"}</h3>
                  {project.year && <span className="project-row__year">{project.year}</span>}
                </div>
                {project.role && <p className="project-row__role">{project.role}</p>}
                {project.description && <p className="project-row__desc">{project.description}</p>}
                {tagList(project.tags).length > 0 && (
                  <div className="project-row__tags">
                    {tagList(project.tags).map((tag) => (
                      <span key={tag} className="project-row__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="project-row__side">
                <div className="project-row__links">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer" className="project-row__link">
                      ↗ Live
                    </a>
                  )}
                  {project.code_url && (
                    <a href={project.code_url} target="_blank" rel="noreferrer" className="project-row__link">
                      {"</>"} Code
                    </a>
                  )}
                </div>
                <div className="project-row__actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(project)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => askDelete(project)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          )
        )}
      </div>

      {confirmTarget && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <span className="modal__dot" aria-hidden="true" />
            <h3 className="modal__title">Delete project?</h3>
            <p className="modal__body">
              This will permanently remove <strong>{confirmTarget.title || "this project"}</strong>. This can't be
              undone.
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

function ProjectForm({ draft, updateDraft, updateDraftNumber, onSave, onCancel, isNew }) {
  return (
    <form className="project-form" onSubmit={onSave}>
      <div className="project-form__head">
        <span className="project-form__dot" />
        <input
          className="project-form__title-input"
          type="text"
          value={draft.title}
          onChange={updateDraft("title")}
          required
          maxLength={150}
          placeholder={isNew ? "New project title" : "Project title"}
        />
        <div className="project-form__order">
          <label>Order</label>
          <input type="number" value={draft.order} onChange={updateDraftNumber("order")} />
        </div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>Year</label>
          <input type="text" value={draft.year} onChange={updateDraft("year")} maxLength={10} placeholder="2026" />
        </div>
        <div className="field">
          <label>Role</label>
          <input type="text" value={draft.role} onChange={updateDraft("role")} maxLength={150} placeholder="Lead frontend engineer" />
        </div>
        <div className="field is-wide">
          <label>Description</label>
          <textarea value={draft.description} onChange={updateDraft("description")} rows={3} />
        </div>
      </div>

      <details className="project-form__more" open={isNew}>
        <summary>More fields — tags, image &amp; links</summary>
        <div className="field-grid project-form__more-fields">
          <div className="field is-wide">
            <label>Tags</label>
            <span className="field-note">Comma-separated, e.g. "React, WebGL, Brand"</span>
            <input type="text" value={draft.tags} onChange={updateDraft("tags")} maxLength={300} />
          </div>
          <div className="field is-wide">
            <label>Image URL</label>
            <input type="url" value={draft.image} onChange={updateDraft("image")} />
          </div>
          <div className="field">
            <label>Live site URL</label>
            <input type="url" value={draft.live_url} onChange={updateDraft("live_url")} />
          </div>
          <div className="field">
            <label>Source code URL</label>
            <input type="url" value={draft.code_url} onChange={updateDraft("code_url")} />
          </div>
        </div>
      </details>

      <div className="project-form__actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save project
        </button>
      </div>
    </form>
  );
}
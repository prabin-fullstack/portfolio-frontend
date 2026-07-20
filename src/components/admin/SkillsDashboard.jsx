import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "../../style/admin/SkillsDashboard.css";
import api from "../../api";

let tempId = -1;

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SkillIcon({ icon, color, name }) {
  const [broken, setBroken] = useState(false);
  const hex = (color || "F5F1EA").replace("#", "");

  if (icon && !broken) {
    return (
      <span
        className="skill-tile__icon"
        style={{ background: `#${hex}22`, borderColor: `#${hex}55` }}
      >
        <img
          src={`https://cdn.simpleicons.org/${icon.trim().toLowerCase()}/${hex}`}
          alt=""
          onError={() => setBroken(true)}
        />
      </span>
    );
  }

  return (
    <span
      className="skill-tile__icon skill-tile__icon--letter"
      style={{ background: `#${hex}` }}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

export default function SkillsDashboard() {
  const [form, setForm] = useState({
    eyebrow: "",
    heading: "",
    intro: "",
    groups: [],
  });
  const [status, setStatus] = useState("idle");
  const [confirmTarget, setConfirmTarget] = useState(null); // { type: 'group'|'skill', groupId, skillId?, label }
  const [toast, setToast] = useState(null); // { message }

  // --- Sticky groups toolbar (JS-driven, not CSS position:sticky) ---
  // Plain `position: sticky` silently breaks if any ancestor clips
  // overflow or isn't the actual scroll container. This pins the
  // toolbar with `position: fixed` once a zero-height sentinel above
  // it scrolls past the top of the viewport, and measures the
  // section's own left/width so the fixed bar still lines up with
  // the content column instead of stretching edge-to-edge.
  const sectionRef = useRef(null);
  const sentinelRef = useRef(null);
  const toolbarRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);
  const [toolbarBox, setToolbarBox] = useState({ left: 0, width: 0 });
  const [toolbarHeight, setToolbarHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setToolbarBox({ left: rect.left, width: rect.width });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  useLayoutEffect(() => {
    if (toolbarRef.current) {
      setToolbarHeight(toolbarRef.current.getBoundingClientRect().height);
    }
  }, [isStuck]);
  // --------------------------------------------------------------------

  useEffect(() => {
    const getSkillsData = async () => {
      try {
        const response = await api.get("/section/");
        setForm(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getSkillsData();
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

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateGroup = (groupId, key, value) =>
    setForm((f) => ({
      ...f,
      groups: f.groups.map((g) =>
        g.id === groupId ? { ...g, [key]: value } : g,
      ),
    }));

  const addGroup = () => {
    setForm((f) => ({
      ...f,
      groups: [
        ...f.groups,
        {
          id: tempId--,
          title: "New group",
          note: "",
          order: f.groups.length,
          skills: [],
        },
      ],
    }));
    showToast("Group added");
  };

  const removeGroup = (groupId) =>
    setForm((f) => ({
      ...f,
      groups: f.groups.filter((g) => g.id !== groupId),
    }));

  const updateSkill = (groupId, skillId, key, value) =>
    setForm((f) => ({
      ...f,
      groups: f.groups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              skills: g.skills.map((s) =>
                s.id === skillId ? { ...s, [key]: value } : s,
              ),
            },
      ),
    }));

  const cycleLevel = (groupId, skillId, current) =>
    updateSkill(
      groupId,
      skillId,
      "level",
      current === "primary" ? "secondary" : "primary",
    );

  const addSkill = (groupId) => {
    setForm((f) => ({
      ...f,
      groups: f.groups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              skills: [
                ...g.skills,
                {
                  id: tempId--,
                  name: "New skill",
                  icon: "",
                  color: "E6182F",
                  level: "secondary",
                  note: "",
                  order: g.skills.length,
                },
              ],
            },
      ),
    }));
    showToast("Skill added");
  };

  const removeSkill = (groupId, skillId) =>
    setForm((f) => ({
      ...f,
      groups: f.groups.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, skills: g.skills.filter((s) => s.id !== skillId) },
      ),
    }));

  const askDeleteGroup = (group) =>
    setConfirmTarget({ type: "group", groupId: group.id, label: group.title || "this group" });

  const askDeleteSkill = (groupId, skill) =>
    setConfirmTarget({ type: "skill", groupId, skillId: skill.id, label: skill.name || "this skill" });

  const cancelConfirm = () => setConfirmTarget(null);

  const confirmDeleteAction = () => {
    if (!confirmTarget) return;

    if (confirmTarget.type === "group") {
      removeGroup(confirmTarget.groupId);
      showToast("Group deleted");
    } else {
      removeSkill(confirmTarget.groupId, confirmTarget.skillId);
      showToast("Skill deleted");
    }

    setConfirmTarget(null);
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      setStatus("saving");

      const response = await api.put("/section/", form);
      setForm(response.data);

      setStatus("saved");
      showToast("Skills section saved");

      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Error:", error.response?.data);
      console.log("Sent Data:", form);

      setStatus("idle");
      showToast("Couldn't save — try again");
    }
  };

  return (
    <section ref={sectionRef}>
      <div className="section-head">
        <div>
          <span className="section-head__eyebrow">§04 — Toolkit</span>
          <h1 className="section-head__title">Skills</h1>
          <p className="section-head__desc">
            Grouped tiles shown on the Skills section.
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

      <form onSubmit={save}>
        <div className="card">
          <h2 className="card__title">Section header</h2>
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
              <label>Heading</label>
              <input
                type="text"
                value={form.heading}
                onChange={update("heading")}
                maxLength={150}
              />
            </div>
            <div className="field is-wide">
              <label>Intro</label>
              <textarea
                value={form.intro}
                onChange={update("intro")}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* zero-height trigger — when this scrolls past the viewport top, the toolbar pins */}
        <div ref={sentinelRef} aria-hidden="true" />

        {/* placeholder that keeps the same page height once the toolbar goes fixed,
            so content doesn't jump upward underneath it */}
        {isStuck && <div style={{ height: toolbarHeight }} aria-hidden="true" />}

        <div
          ref={toolbarRef}
          className={`skills-groups__head ${isStuck ? "is-pinned" : ""}`}
          style={isStuck ? { left: toolbarBox.left, width: toolbarBox.width } : undefined}
        >
          <h2 className="card__title">Groups</h2>
          <div className="skills-toolbar">
            <button
              type="button"
              className="btn btn-ghost btn-sm add-row"
              onClick={addGroup}
            >
              + Add group
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={status === "saving"}
            >
              {status === "saving" ? "Saving…" : "Save skills section"}
            </button>
          </div>
        </div>

        {form.groups.length === 0 ? (
          <p className="empty-note">
            No groups yet — add one to hold skill tiles.
          </p>
        ) : (
          <div className="skills-groups-grid">
            {form.groups.map((group, gi) => (
              <div className="group-card" key={group.id}>
                <div className="group-card__head">
                  <span className="group-card__dot" />
                  <input
                    className="group-card__title-input"
                    type="text"
                    value={group.title}
                    onChange={(e) =>
                      updateGroup(group.id, "title", e.target.value)
                    }
                    maxLength={100}
                    placeholder="Group title"
                  />
                  <span className="group-card__count">
                    {group.skills.length}
                  </span>
                  <button
                    type="button"
                    className="group-card__remove"
                    onClick={() => askDeleteGroup(group)}
                    title="Remove group"
                    aria-label="Remove group"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="group-card__meta">
                  <input
                    className="group-card__note-input"
                    type="text"
                    value={group.note}
                    onChange={(e) =>
                      updateGroup(group.id, "note", e.target.value)
                    }
                    maxLength={150}
                    placeholder="Note, e.g. Daily drivers"
                  />
                  <div className="group-card__order">
                    <label>Order</label>
                    <input
                      type="number"
                      value={group.order}
                      onChange={(e) =>
                        updateGroup(group.id, "order", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {group.skills.length === 0 ? (
                  <p className="empty-note">No skills yet.</p>
                ) : (
                  <div className="skills-tile-grid">
                    {group.skills.map((skill) => (
                      <div
                        className={`skill-tile ${skill.level === "primary" ? "is-primary" : ""}`}
                        key={skill.id}
                      >
                        <button
                          type="button"
                          className="skill-tile__remove"
                          onClick={() => askDeleteSkill(group.id, skill)}
                          title="Remove skill"
                          aria-label="Remove skill"
                        >
                          <TrashIcon />
                        </button>

                        <div className="skill-tile__head">
                          <SkillIcon
                            icon={skill.icon}
                            color={skill.color}
                            name={skill.name}
                          />
                          <input
                            className="skill-tile__name"
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(
                                group.id,
                                skill.id,
                                "name",
                                e.target.value,
                              )
                            }
                            maxLength={100}
                            placeholder="Skill name"
                          />
                        </div>

                        <button
                          type="button"
                          className={`skill-tile__level-pill level-${skill.level}`}
                          onClick={() =>
                            cycleLevel(group.id, skill.id, skill.level)
                          }
                        >
                          {skill.level === "primary"
                            ? "★ Primary"
                            : "Secondary"}
                        </button>

                        <details className="skill-tile__more">
                          <summary>More fields</summary>
                          <div className="skill-tile__more-fields">
                            <div className="field">
                              <label>Icon slug</label>
                              <input
                                type="text"
                                value={skill.icon}
                                onChange={(e) =>
                                  updateSkill(
                                    group.id,
                                    skill.id,
                                    "icon",
                                    e.target.value,
                                  )
                                }
                                maxLength={50}
                                placeholder="e.g. react"
                              />
                            </div>
                            <div className="field">
                              <label>Color</label>
                              <div className="skill-tile__color-input">
                                <span
                                  className="skill-tile__color-swatch"
                                  style={{
                                    background: `#${skill.color || "F5F1EA"}`,
                                  }}
                                />
                                <input
                                  type="text"
                                  value={skill.color}
                                  onChange={(e) =>
                                    updateSkill(
                                      group.id,
                                      skill.id,
                                      "color",
                                      e.target.value,
                                    )
                                  }
                                  maxLength={6}
                                />
                              </div>
                            </div>
                            <div className="field">
                              <label>Order</label>
                              <input
                                type="number"
                                value={skill.order}
                                onChange={(e) =>
                                  updateSkill(
                                    group.id,
                                    skill.id,
                                    "order",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <div className="field">
                              <label>Note</label>
                              <input
                                type="text"
                                value={skill.note}
                                onChange={(e) =>
                                  updateSkill(
                                    group.id,
                                    skill.id,
                                    "note",
                                    e.target.value,
                                  )
                                }
                                maxLength={150}
                                placeholder="Primary only"
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="group-card__add-skill"
                  onClick={() => addSkill(group.id)}
                >
                  + Add skill
                </button>
              </div>
            ))}
          </div>
        )}
      </form>

      {confirmTarget && (
        <div className="modal-overlay" onClick={cancelConfirm}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <span className="modal__dot" aria-hidden="true" />
            <h3 className="modal__title">
              Delete {confirmTarget.type === "group" ? "group" : "skill"}?
            </h3>
            <p className="modal__body">
              This will remove <strong>{confirmTarget.label}</strong>
              {confirmTarget.type === "group" ? " and everything inside it. " : ". "}
              It won't disappear from the live site until you hit "Save skills section".
            </p>
            <div className="modal__actions">
              <button type="button" className="btn btn-ghost" onClick={cancelConfirm}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDeleteAction}>
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
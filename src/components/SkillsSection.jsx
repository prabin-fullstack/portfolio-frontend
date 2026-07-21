import { useEffect, useRef, useState } from "react";
import "../style/Skills.css";
import "../style/Skeleton.css";
import api from "../api";

function useReveal() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function SkillIcon({ icon, color, name }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Fallback: first letters of the name, so a missing/renamed slug
    // never leaves an empty box.
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
    return <span className="skills__icon-fallback">{initials}</span>;
  }

  return (
    <img
      className="skills__icon-img"
      src={`https://cdn.simpleicons.org/${icon}/${color}`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function SkillTile({ skill, delay }) {
  return (
    <div
      className={`skills__tile skills__tile--${skill.level} skills__reveal`}
      style={{ "--d": delay }}
    >
      <span className="skills__tile-icon">
        <SkillIcon icon={skill.icon} color={skill.color} name={skill.name} />
      </span>
      <span className="skills__tile-text">
        <span className="skills__tile-name">{skill.name}</span>
        {skill.note && skill.level === "primary" && (
          <span className="skills__tile-note">{skill.note}</span>
        )}
      </span>
    </div>
  );
}

function SkillGroup({ group, groupIndex, baseDelay }) {
  const num = String(groupIndex + 1).padStart(2, "0");

  return (
    <div className="skills__group">
      <div
        className="skills__group-head skills__reveal"
        style={{ "--d": `${baseDelay}ms` }}
      >
        <span className="skills__group-index">{num}</span>
        <div>
          <h3 className="skills__group-title">{group.title}</h3>
          <p className="skills__group-note">{group.note}</p>
        </div>
      </div>

      <div className="skills__grid">
        {group.skills.map((skill, i) => (
          <SkillTile
            key={skill.id}
            skill={skill}
            delay={`${baseDelay + 80 + i * 60}ms`}
          />
        ))}
      </div>
    </div>
  );
}

export default function SkillsSection() {
  const [sectionRef, visible] = useReveal();

  const [section, setSection] = useState(null);
  const loading = section === null;

  useEffect(() => {
    const getSection = async () => {
      try {
        const response = await api.get("section/");
        setSection(response.data);
      } catch (error) {
        console.log(error);
        setSection({ eyebrow: "", heading: "", intro: "", groups: [] });
      }
    };
    getSection();
  }, []);

  return (
    <section
      className={`skills ${visible ? "is-in" : ""}`}
      ref={sectionRef}
      id="skills"
    >
      <div className="skills__inner">
        {loading ? (
          <div aria-hidden="true" aria-label="Loading">
            <div style={{ maxWidth: "62ch", marginBottom: "3rem" }}>
              <span className="skel skel--pill" style={{ width: "130px", height: "0.8rem", marginBottom: "1.1rem" }} />
              <span className="skel" style={{ width: "70%", height: "2.6rem", marginBottom: "1.1rem" }} />
              <span className="skel" style={{ width: "90%", height: "0.95rem" }} />
            </div>

            {[0, 1].map((g) => (
              <div key={g} style={{ marginBottom: "2.75rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "1.1rem", marginBottom: "1.4rem" }}>
                  <span className="skel" style={{ width: "22px", height: "0.85rem" }} />
                  <span className="skel" style={{ width: "180px", height: "1.3rem" }} />
                </div>
                <div className="skills__grid">
                  {Array.from({ length: 6 }).map((_, t) => (
                    <span
                      key={t}
                      className="skel skel--tile"
                      style={{ height: "3.6rem" }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <header className="skills__header">
              <p
                className="skills__eyebrow skills__reveal"
                style={{ "--d": "0ms" }}
              >
                <span className="skills__dot" aria-hidden="true" />
                {section?.eyebrow}
              </p>
              <h2
                className="skills__heading skills__reveal"
                style={{ "--d": "80ms" }}
              >
                {section?.heading}
              </h2>
              <p
                className="skills__intro skills__reveal"
                style={{ "--d": "150ms" }}
              >
                {section?.intro}
              </p>
            </header>

            <div className="skills__groups">
              {section.groups?.map((group, i) => (
                <SkillGroup
                  key={group.id}
                  group={group}
                  groupIndex={i}
                  baseDelay={220 + i * 140}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
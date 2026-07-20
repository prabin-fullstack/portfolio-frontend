import { useEffect, useRef, useState, useCallback } from 'react';
import '../style/Work.css';
import api from '../api'



function useReveal() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function ProjectRow({ project, index, onEnter, onLeave, onMove, onOpen }) {
  const num = String(index + 1).padStart(2, '0');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(index);
    }
  };

  return (
    <li
      className="projects__row"
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      <div
        className="projects__row-link"
        role="button"
        tabIndex={0}
        onClick={() => onOpen(index)}
        onKeyDown={handleKeyDown}
      >
        <span className="projects__row-index">{num}</span>

        <span className="projects__row-main">
          <span className="projects__row-title">{project.title}</span>
          <span className="projects__row-tags">
            {project.tag_list?.map((tag) => (
              <span className="projects__tag" key={tag}>
                {tag}
              </span>
            ))}
          </span>
        </span>

        <span className="projects__row-thumb" aria-hidden="true">
          {project.image && (
    <img src={project.image} alt={project.title} />
)}
        </span>

        <span className="projects__row-meta">
          <span className="projects__row-role">{project.role}</span>
          <span className="projects__row-year">{project.year}</span>
        </span>

        <span className="projects__row-arrow" aria-hidden="true">
          &#8594;
        </span>
      </div>
    </li>
  );
}

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      className="projects__modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="projects__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="projects-modal-title"
      >
        <button
          type="button"
          className="projects__modal-close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close project details"
        >
          &#10005;
        </button>

        <div className="projects__modal-media">
          <img src={project.image} alt={`${project.title} preview`} />
        </div>

        <div className="projects__modal-body">
          <p className="projects__modal-eyebrow">
            {project.role} &middot; {project.year}
          </p>
          <h3 id="projects-modal-title" className="projects__modal-title">
            {project.title}
          </h3>

          {project.description && (
            <p className="projects__modal-desc">{project.description}</p>
          )}

          <span className="projects__row-tags projects__modal-tags">
            {project.tag_list?.map((tag) => (
              <span className="projects__tag" key={tag}>
                {tag}
              </span>
            ))}
          </span>

          <div className="projects__modal-actions">
            {project.live_url && (
              <a
                className="projects__modal-btn projects__modal-btn--primary"
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View live site &#8599;
              </a>
            )}
            {project.code_url && (
              <a
                className="projects__modal-btn"
                href={project.code_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source &#8599;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Work() {

  const [sectionRef, visible] = useReveal();
  const [hoverIndex, setHoverIndex] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const listRef = useRef(null);
  const innerRef = useRef(null);
  const [ProjectSection, setProjectSection] = useState({ 
    eyebrow: "",
    heading: "",
    intro: "",
    projects: [],
  })

  useEffect(()=>{
    const getProjects = async() =>{
      try{
        const response = await api.get('project-section/')
        setProjectSection(response.data)
        

      }catch(error){
        console.log(error)
      }
    }
    getProjects()
  },[])

  const handleMove = (e) => {
    // Measure against the same element .projects__preview is positioned
    // relative to (.projects__inner), not the <ul>, so the box tracks
    // the cursor exactly instead of drifting by the header's height/offset.
    const bounds = innerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setPointer({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
  };

  const openModal = useCallback((index) => setModalIndex(index), []);
  const closeModal = useCallback(() => setModalIndex(null), []);

  const hoverProject = hoverIndex !== null ? ProjectSection.projects[hoverIndex] : null;
  const modalProject = modalIndex !== null ? ProjectSection.projects[modalIndex] : null;

  return (
    <section className={`projects ${visible ? 'is-in' : ''}`} ref={sectionRef} id="projects">
      <div className="projects__inner" ref={innerRef}>
        <header className="projects__header">
          <p className="projects__eyebrow projects__reveal" style={{ '--d': '0ms' }}>
            <span className="projects__dot" aria-hidden="true" />
            {ProjectSection.eyebrow}
          </p>
          <h2 className="projects__heading projects__reveal" style={{ '--d': '80ms' }}>
            {ProjectSection.heading}
          </h2>
          <p className="projects__intro projects__reveal" style={{ '--d': '150ms' }}>
            {ProjectSection.intro}
          </p>
        </header>

        <ul
          className="projects__list"
          ref={listRef}
          onMouseMove={handleMove}
          style={{ '--count': ProjectSection.length }}
        >
          {ProjectSection.projects?.map((project, i) => (
            <div
              className="projects__reveal"
              style={{ '--d': `${220 + i * 90}ms` }}
              key={project.title}
            >
              <ProjectRow
                project={project}
                index={i}
                onEnter={setHoverIndex}
                onLeave={() => setHoverIndex(null)}
                onMove={handleMove}
                onOpen={openModal}
              />
            </div>
          ))}
        </ul>

        {/* Cursor-following preview panel — desktop only, hidden via CSS on touch/narrow */}
        <div
          className={`projects__preview ${hoverProject ? 'is-active' : ''}`}
          style={{
            transform: `translate(${pointer.x}px, ${pointer.y}px) translate(-50%, -60%)`,
          }}
          aria-hidden="true"
        >
          {hoverProject && <img src={hoverProject.image} alt="" />}
        </div>
      </div>

      {modalProject && <ProjectModal project={modalProject} onClose={closeModal} />}
    </section>
  );
}
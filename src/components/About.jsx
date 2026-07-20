import { useEffect, useRef, useState } from "react";
import "../style/About.css";
import api from "../api";

const DEFAULT_STATS = [
  { value: 24, suffix: "+", label: "Projects completed" },
  { value: 12, suffix: "", label: "Skills & tools" },
];

function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return undefined;
    }

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration]);

  return value;
}

function StatBlock({ value, suffix, label, active, delay, isLast }) {
  const count = useCountUp(value, active);
  return (
    <div
      className={`about__stat about__reveal ${isLast ? "about__stat--last" : ""}`}
      style={{ "--d": delay }}
    >
      <span className="about__stat-value">
        {count}
        {suffix}
      </span>
      <span className="about__stat-label">{label}</span>
    </div>
  );
}

export default function AboutSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const [AboutData, setAboutData] = useState(null);

  useEffect(() => {
    const getAboutData = async () => {
      try {
        const response = await api.get("/about");
        setAboutData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getAboutData();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
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
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`about ${visible ? "is-in" : ""}`}
      ref={sectionRef}
      id="about"
    >
      <div className="about__inner">
        {/* Sticky left rail: number-plate style identity block */}
        <div className="about__rail">
          <p className="about__eyebrow about__reveal" style={{ "--d": "0ms" }}>
            <span className="about__dot" aria-hidden="true" />
            {AboutData?.eyebrow}
          </p>

          <h2
            className="about__heading about__reveal"
            style={{ "--d": "90ms" }}
          >
            {AboutData?.heading}
          </h2>

          <span
            className="about__rail-mark about__reveal"
            aria-hidden="true"
            style={{ "--d": "160ms" }}
          >
            AB/26
          </span>
        </div>

        {/* Right content: two-column magazine copy, stats as a horizontal strip beneath */}
        <div className="about__content">
          <div className="about__copy">
            <p
              className="about__bio about__bio--lead about__reveal"
              style={{ "--d": "180ms" }}
            >
              {AboutData?.bio}
            </p>

            {AboutData?.bio_secondary && (
              <p
                className="about__bio about__reveal"
                style={{ "--d": "250ms" }}
              >
                {AboutData?.bio_secondary}
              </p>
            )}
          </div>

          <div className="about__stats" role="list">
            {AboutData?.stats?.map((stat, i) => (
              <StatBlock
                key={stat.id}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                active={visible}
                delay={`${320 + i * 130}ms`}
                isLast={i === AboutData?.stats.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

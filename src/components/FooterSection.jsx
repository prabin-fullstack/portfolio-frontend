import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css';

const DEFAULT_SITEMAP = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

const DEFAULT_SOCIALS = [
  {
    name: "GitHub",
    icon: "github",
    color: "F5F1EA",
    url: "https://github.com/prabin-fullstack",
  },
 
  {
    name: "Instagram",
    icon: "instagram",
    color: "E4405F",
    url: "https://instagram.com/prabinn.__",
  },
  {
    name: "WhatsApp",
    icon: "whatsapp",
    color: "25D366",
    url: "https://wa.me/917994809308",
  },
];

function SocialIcon({ icon, color, name }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="footer__social-fallback">{name[0]}</span>;
  return (
    <img
      className="footer__social-img"
      src={`https://cdn.simpleicons.org/${icon}/${color}`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

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
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export default function FooterSection({
  name = 'Prabin',
  eyebrow = "Let's build something",
  email = 'prabin.official007@gmail.com',
  sitemap = DEFAULT_SITEMAP,
  socials = DEFAULT_SOCIALS,
  location = 'Kerala, IN',
}) {
  const [sectionRef, visible] = useReveal();
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  return (
    <footer className={`footer ${visible ? 'is-in' : ''}`} ref={sectionRef}>
      <div className="footer__inner">
        <div className="footer__top">
          <p className="footer__eyebrow footer__reveal" style={{ '--d': '0ms' }}>
            <span className="footer__dot" aria-hidden="true" />
            {eyebrow}
          </p>

          <a className="footer__cta footer__reveal" href={`mailto:${email}`} style={{ '--d': '70ms' }}>
            {email}
          </a>
        </div>

        <a href="#top" className="footer__wordmark footer__reveal" style={{ '--d': '130ms' }} onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
          {name}
        </a>

        <div className="footer__grid">
          <div className="footer__col footer__col--sitemap footer__reveal" style={{ '--d': '180ms' }}>
            <span className="footer__col-title">Sitemap</span>
            <nav className="footer__links">
              {sitemap.map((item) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer__col footer__col--socials footer__reveal" style={{ '--d': '230ms' }}>
            <span className="footer__col-title">Elsewhere</span>
            <ul className="footer__socials">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                    <SocialIcon icon={s.icon} color={s.color} name={s.name} />
                    <span className="footer__social-label">{s.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__col--location footer__reveal" style={{ '--d': '280ms' }}>
            <span className="footer__col-title">Based in</span>
            <p className="footer__location">{location}</p>
            <p className="footer__available">
              <span className="footer__pulse" aria-hidden="true" />
              Open to new projects
            </p>
          </div>
        </div>

        <div className="footer__bottom footer__reveal" style={{ '--d': '330ms' }}>
          <p className="footer__copyright">
            &copy; {year} {name}. All rights reserved.
          </p>

          <div className="footer__bottom-actions">
            <Link to="/login" className="footer__admin-link" aria-label="Admin login">
              <svg
                className="footer__admin-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              </svg>
              <span>Prabin</span>
            </Link>

            <button type="button" className="footer__top-btn" onClick={scrollToTop}>
              Back to top
              <span aria-hidden="true">&#8593;</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
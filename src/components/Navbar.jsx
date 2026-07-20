import { useEffect, useState } from 'react';
import '../style/Navbar.css';

const DEFAULT_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({
  brand = 'Prabin',
  links = DEFAULT_LINKS,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(links[0]?.href ?? '#');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Scroll-spy: track which section is currently most in view and mark
  // its matching nav link active. Sections are found from link hrefs
  // that look like "#id"; "#" (home) is handled by proximity to the top.
  useEffect(() => {
    const sectionEntries = links
      .map((link) => {
        if (link.href === '#') return null;
        const id = link.href.replace('#', '');
        const el = document.getElementById(id);
        return el ? { href: link.href, el } : null;
      })
      .filter(Boolean);

    if (sectionEntries.length === 0) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ratios = new Map(sectionEntries.map((s) => [s.href, 0]));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const match = sectionEntries.find((s) => s.el === entry.target);
          if (match) ratios.set(match.href, entry.intersectionRatio);
        });

        // Pick the section with the greatest visible ratio right now.
        let bestHref = null;
        let bestRatio = 0;
        ratios.forEach((ratio, href) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestHref = href;
          }
        });

        if (bestHref && bestRatio > 0) {
          setActiveHref(bestHref);
        } else if (window.scrollY < 80) {
          // Nothing meaningfully in view yet and we're near the top —
          // fall back to the home link if one exists.
          const home = links.find((l) => l.href === '#');
          if (home) setActiveHref('#');
        }
      },
      {
        threshold: prefersReduced ? [0, 1] : [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-96px 0px -55% 0px',
      }
    );

    sectionEntries.forEach((s) => observer.observe(s.el));
    return () => observer.disconnect();
  }, [links]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="navbar__bar">
        <a
          className="navbar__brand"
          href="#top"
          onClick={() => {
            closeMenu();
            setActiveHref('#');
          }}
        >
          {brand}
        </a>

        <nav className="navbar__links" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              className={`navbar__link ${activeHref === link.href ? 'is-active' : ''}`}
              href={link.href}
              aria-current={activeHref === link.href ? 'true' : undefined}
              onClick={() => setActiveHref(link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>
      </div>

      <div className="navbar__mobile" aria-hidden={!menuOpen}>
        <nav className="navbar__mobile-links" aria-label="Mobile">
          {links.map((link, i) => (
            <a
              key={link.href}
              className={`navbar__mobile-link ${activeHref === link.href ? 'is-active' : ''}`}
              href={link.href}
              style={{ '--d': `${i * 50}ms` }}
              aria-current={activeHref === link.href ? 'true' : undefined}
              onClick={() => {
                setActiveHref(link.href);
                closeMenu();
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
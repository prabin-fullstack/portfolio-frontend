import '../style/TechMarquee.css';

/**
 * TechMarquee — an infinite auto-scrolling strip of tech/tool badges.
 * Matches the red + black + brown theme used across HeroSection/Navbar.
 *
 * - Scrolls continuously, pauses on hover (desktop) so the user can read.
 * - Grayscale badges brighten to the red accent on hover.
 * - Edges fade into the section background via a mask gradient.
 * - Duplicates the list once internally to create a seamless loop —
 *   you only ever pass the items once.
 * - Respects prefers-reduced-motion by freezing the strip in place.
 *
 * Usage:
 *   <TechMarquee
 *     items={[
 *       { label: 'Next.js', mark: 'N' },
 *       { label: 'TypeScript', mark: 'TS', shape: 'square' },
 *       { label: 'Tailwind CSS', mark: 'TW' },
 *       { label: 'Vercel', mark: '▲', shape: 'plain' },
 *       { label: 'GitHub', mark: 'GH' },
 *       { label: 'Docker', mark: 'DK', shape: 'square' },
 *     ]}
 *     speed={28}
 *   />
 *
 * `shape` accepts 'circle' (default), 'square', or 'plain' (no badge outline,
 * for glyph-style marks like the Vercel triangle).
 */

const DEFAULT_ITEMS = [
  { label: 'Django', mark: 'D' },
  { label: 'Python', mark: 'PY', shape: 'square' },
  { label: 'Tailwind CSS', mark: 'TW' },
  { label: 'Vercel', mark: '▲', shape: 'plain' },
  { label: 'GitHub', mark: 'GH' },
  { label: 'Django rest Framework', mark: 'DRF', shape: 'square' },
  { label: 'React', mark: '⚛' },
  { label: 'Node.js', mark: 'JS', shape: 'square' },
];

export default function TechMarquee({
  items = DEFAULT_ITEMS,
  speed = 28,
  label = 'Tools & technologies',
}) {
  // duplicate once so the CSS animation can loop seamlessly at -50%
  const track = [...items, ...items];

  return (
    <section className="marquee" aria-label={label}>
      <div className="marquee__viewport">
        <div className="marquee__track" style={{ '--speed': `${speed}s` }}>
          {track.map((item, i) => (
            <div
              className={`marquee__badge marquee__badge--${item.shape || 'circle'}`}
              key={`${item.label}-${i}`}
              aria-hidden={i >= items.length}
            >
              <span className="marquee__mark">{item.mark}</span>
              <span className="marquee__label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import '../style/Techmarquee.css'




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
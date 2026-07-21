import { useEffect, useRef, useState } from 'react';
import '../style/HeroSection.css';
import '../style/Skeleton.css';
import TechMarquee from '../components/Techmarquee'
import api from '../api'


export default function HeroSection() {

  const [mounted, setMounted] = useState(false);
  const imageRef = useRef(null);
  const heroRef = useRef(null);
  const [HeroData, setHeroData] = useState(null)
  const loading = HeroData === null;

  useEffect(() =>{
    const getHeroData = async() => {
      try{
        const response = await api.get('/hero/')
        setHeroData(response.data)
      }catch(error){
        console.log(error)
        setHeroData({})
      }
    }
    getHeroData()
  },[])


  // staggered entrance on load
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // scroll parallax on the image panel — disabled for reduced-motion users
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;

    let ticking = false;

    const applyParallax = () => {
      ticking = false;
      const hero = heroRef.current;
      const img = imageRef.current;
      if (!hero || !img) return;

      const rect = hero.getBoundingClientRect();
      // progress: 0 when hero top is at viewport top, grows as it scrolls up/out
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      const shift = progress * 60; // px of parallax travel
      const scale = 1.08 + progress * 0.05;

      img.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    };

    applyParallax();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef} aria-label="Introduction">
      <div className="hero__panel hero__panel--image">
        <div className="hero__image-frame">
          {loading ? (
            <div ref={imageRef} className="hero__photo-skel skel" aria-hidden="true" />
          ) : HeroData.image ? (
            <img ref={imageRef} className="hero__photo" src={HeroData.image} alt={HeroData.image_alt} />
          ) : (
            <div ref={imageRef} className="hero__photo-placeholder" aria-hidden="true">
              NO IMAGE — pass an `imageSrc` prop to load your photo here
            </div>
          )}
          <div className="hero__image-overlay" aria-hidden="true" />
          <span className="hero__corner hero__corner--tl" />
          <span className="hero__corner hero__corner--tr" />
          <span className="hero__corner hero__corner--bl" />
          <span className="hero__corner hero__corner--br" />
        </div>
      </div>

      <div className="hero__panel hero__panel--text">
        <div className={`hero__copy ${mounted ? 'is-in' : ''}`}>

          {loading ? (
            <div className="hero__reveal" style={{ '--d': '0ms' }} aria-hidden="true" aria-label="Loading">
              <span className="skel skel--pill" style={{ width: '150px', height: '0.8rem', marginBottom: '1.5rem' }} />

              <span className="skel" style={{ width: '85%', height: '3.2rem', marginBottom: '0.5rem' }} />
              <span className="skel" style={{ width: '55%', height: '3.2rem', marginBottom: '1.1rem' }} />

              <span className="skel" style={{ width: '220px', height: '1.1rem', marginBottom: '1.4rem' }} />

              <span className="skel" style={{ width: '260px', height: '0.9rem', marginBottom: '1.25rem' }} />

              <span className="skel" style={{ width: '100%', height: '0.95rem', marginBottom: '0.55rem' }} />
              <span className="skel" style={{ width: '92%', height: '0.95rem', marginBottom: '0.55rem' }} />
              <span className="skel" style={{ width: '68%', height: '0.95rem', marginBottom: '2rem' }} />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="skel skel--pill" style={{ width: '150px', height: '3rem' }} />
                <span className="skel skel--pill" style={{ width: '120px', height: '3rem' }} />
              </div>
            </div>
          ) : (
            <>
              <p className="hero__eyebrow hero__reveal" style={{ '--d': '0ms' }}>
                <span className="hero__dot" aria-hidden="true" />
                {HeroData?.eyebrow}
              </p>

              <h1 className="hero__headline hero__reveal" style={{ '--d': '90ms' }}>
                {HeroData?.name}
              </h1>

              <p className="hero__role hero__reveal" style={{ '--d': '180ms' }}>
                {HeroData?.role}
              </p>

              <p className="hero__tagline hero__reveal" style={{ '--d': '260ms' }}>
                {HeroData?.tagline}
              </p>

              <p className="hero__description hero__reveal" style={{ '--d': '340ms' }}>
                {HeroData?.description}
              </p>

              <div className="hero__ctas hero__reveal" style={{ '--d': '420ms' }}>
                <a className="hero__cta hero__cta--primary"  href="#projects">
                  {HeroData?.primary_cta_label} 
                  <span className="hero__cta-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
                <a className="hero__cta hero__cta--secondary" href="#contact">
                  {HeroData?.secondary_cta_label}
                </a>
              </div>
            </>
          )}
        </div>

        <a className="hero__scroll-cue" href="#work" aria-label="Scroll to work">
          <span className="hero__scroll-line" />
          SCROLL
        </a>
  
      </div>
    </section>
      
  );
}
import { useRef, useState } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '../../animation/gsapConfig';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

const PANELS = [
  { title: 'Asset Directory', desc: 'Centralized registry for every vehicle, container, and operational asset.' },
  { title: 'Allocation & Transfer', desc: 'Move custody between departments with validated handover tracking.' },
  { title: 'Resource Booking', desc: 'Prevent scheduling conflicts with real-time grid checks.' },
  { title: 'Maintenance Log', desc: 'Log work, track parts cost, and coordinate with shop schedules.' },
  { title: 'Compliance Audit', desc: 'Verify checklists, licenses, and safety logs instantly.' },
  { title: 'Operational Reporting', desc: 'Export PDF audits and query utilization metrics.' },
];

export default function HorizontalStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const level = getResolvedMotionLevel();
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    if (level !== 'full' || !containerRef.current || !triggerRef.current) return;

    const panels = containerRef.current.querySelectorAll('.horizontal-panel');
    const totalPanels = panels.length;
    
    const pin = gsap.to(containerRef.current, {
      xPercent: -100 * (totalPanels - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: triggerRef.current,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${containerRef.current?.offsetWidth}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(
            totalPanels - 1,
            Math.floor(self.progress * totalPanels)
          );
          setActiveIndex(idx);
        }
      }
    });

    return () => {
      pin.scrollTrigger?.kill();
    };
  }, { scope: triggerRef, dependencies: [level] });

  const scrollToIndex = (idx: number) => {
    if (level !== 'full' || !triggerRef.current) return;
    const triggers = ScrollTrigger.getAll();
    const st = triggers.find(t => t.trigger === triggerRef.current);
    if (!st) return;
    const start = st.start;
    const end = st.end;
    const progress = idx / (PANELS.length - 1);
    const scrollPos = start + (end - start) * progress;
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
  };

  if (level !== 'full') {
    return (
      <div style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>
        <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.06em' }}>
          OPERATIONAL SPECS
        </span>
        <h3 style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--font-size-h1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
          Platform Capabilities
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {PANELS.map((panel, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border)',
                borderLeft: `4px solid var(--accent)`,
                borderRadius: 0,
                background: 'var(--background-surface)',
                padding: 'var(--space-6)',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                SPECIFICATION 0{idx + 1}
              </span>
              <h4 style={{ fontWeight: 600, textTransform: 'uppercase', margin: 'var(--space-2) 0 var(--space-3) 0', fontSize: 'var(--font-size-h3)' }}>
                {panel.title}
              </h4>
              <p className="text-secondary" style={{ fontSize: 'var(--font-size-small)', lineHeight: 1.6, margin: 0 }}>
                {panel.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={triggerRef} style={{ overflow: 'hidden', background: 'var(--background-page)', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        height: '100vh',
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        {/* Left Side: Sticky Title and Progress */}
        <div style={{
          width: '35%',
          borderRight: '1px solid var(--border)',
          padding: 'var(--space-10) var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box',
          background: 'var(--background-surface)',
          zIndex: 2,
        }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.06em' }}>
              OPERATIONAL SPECS
            </span>
            <h3 style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.0,
              margin: 'var(--space-4) 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '-0.03em'
            }}>
              PLATFORM<br />CAPABILITIES
            </h3>
          </div>

          <div>
            {/* Huge Index Counter */}
            <div style={{ fontSize: 'clamp(64px, 10vw, 120px)', fontWeight: 900, color: 'var(--accent)', lineHeight: 0.8, letterSpacing: '-0.05em' }}>
              0{activeIndex + 1}
            </div>
            <div style={{ height: '2px', background: 'var(--border)', width: '100%', margin: 'var(--space-4) 0 var(--space-2) 0', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--accent)',
                  width: `${((activeIndex + 1) / PANELS.length) * 100}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-caption)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              <span>PROGRESSION</span>
              <span>0{PANELS.length} TOTAL</span>
            </div>

            {/* Prev/Next buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
              <button
                className="button button-secondary button-small"
                disabled={activeIndex === 0}
                onClick={() => scrollToIndex(activeIndex - 1)}
                style={{ flex: 1, fontFamily: 'monospace', borderRadius: 0, border: '1px solid var(--border-strong)' }}
              >
                ← PREV
              </button>
              <button
                className="button button-secondary button-small"
                disabled={activeIndex === PANELS.length - 1}
                onClick={() => scrollToIndex(activeIndex + 1)}
                style={{ flex: 1, fontFamily: 'monospace', borderRadius: 0, border: '1px solid var(--border-strong)' }}
              >
                NEXT →
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Viewport (Overflow hidden, width 65%) */}
        <div style={{
          width: '65%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--background-page)',
        }}>
          {/* Scroll Track (This is animated by GSAP) */}
          <div
            ref={containerRef}
            style={{
              display: 'flex',
              width: `${PANELS.length * 100}%`,
              height: '100%',
              alignItems: 'center',
            }}
          >
            {PANELS.map((panel, idx) => (
              <div
                key={idx}
                className="horizontal-panel"
                style={{
                  width: `${100 / PANELS.length}%`,
                  padding: '0 var(--space-8)',
                  boxSizing: 'border-box',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 'min(520px, 90%)',
                    background: 'var(--background-surface)',
                    border: '1px solid var(--border)',
                    borderLeft: activeIndex === idx ? '4px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 0, // Sharp Swiss corners
                    padding: 'var(--space-8)',
                    boxSizing: 'border-box',
                    boxShadow: activeIndex === idx ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
                    transition: 'border-left-width 0.2s, border-left-color 0.2s, box-shadow 0.3s'
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-caption)', color: activeIndex === idx ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    SPECIFICATION 0{idx + 1}
                  </span>
                  <h4 style={{
                    fontSize: 'var(--font-size-h2)',
                    margin: 'var(--space-3) 0 var(--space-4) 0',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    color: activeIndex === idx ? 'var(--accent)' : 'var(--text-primary)',
                    transition: 'color 0.2s'
                  }}>
                    {panel.title}
                  </h4>
                  <p className="text-secondary" style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6, margin: 0 }}>
                    {panel.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

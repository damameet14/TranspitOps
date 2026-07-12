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
      <div style={{ padding: 'var(--space-6) 0' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-h2)', color: 'var(--accent)' }}>
          Platform Capabilities
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {PANELS.map((panel, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                background: 'var(--background-surface)',
                padding: 'var(--space-5)'
              }}
            >
              <h4 style={{ fontWeight: 600 }}>{panel.title}</h4>
              <p className="text-secondary" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-small)' }}>
                {panel.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={triggerRef} style={{ overflow: 'hidden', background: 'var(--background-page)' }}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'var(--space-8) 0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--accent)', fontWeight: 600 }}>
            Capabilities
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="button button-secondary button-small"
              disabled={activeIndex === 0}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              ← Prev
            </button>
            <button
              className="button button-secondary button-small"
              disabled={activeIndex === PANELS.length - 1}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              Next →
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          style={{
            display: 'flex',
            width: `${PANELS.length * 100}%`,
            height: '60vh',
            alignItems: 'center'
          }}
        >
          {PANELS.map((panel, idx) => (
            <div
              key={idx}
              className="horizontal-panel"
              style={{
                width: `${100 / PANELS.length}%`,
                padding: '0 var(--space-8)',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: 'min(640px, 90%)',
                  background: 'var(--background-surface)',
                  border: activeIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--space-8)',
                  transition: 'border-color 0.3s ease'
                }}
              >
                <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', fontWeight: 'bold' }}>
                  0{idx + 1}
                </span>
                <h4 style={{ fontSize: 'var(--font-size-h1)', margin: 'var(--space-2) 0', fontWeight: 500 }}>
                  {panel.title}
                </h4>
                <p className="text-secondary" style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}>
                  {panel.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 var(--space-8)' }}>
          <div style={{ height: '2px', background: 'var(--border)', width: '100%', position: 'relative' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--accent)',
                width: `${((activeIndex + 1) / PANELS.length) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-small)', color: 'var(--text-secondary)' }}>
            <span>Module progression</span>
            <span>{activeIndex + 1} of {PANELS.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

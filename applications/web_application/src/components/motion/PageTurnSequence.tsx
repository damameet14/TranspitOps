import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../../animation/gsapConfig';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

const PAGES = [
  { num: '01', title: 'Asset Record', content: 'Immutable hardware logging, telemetry credentials, and metadata tags.' },
  { num: '02', title: 'Allocation Record', content: 'Validated department handovers, driver validation checks, and route definitions.' },
  { num: '03', title: 'Booking Record', content: 'Calendar reservations, capacity matching, and priority dispatch queues.' },
  { num: '04', title: 'Maintenance Record', content: 'Parts tracking, mechanic assignments, work order approvals, and shop schedules.' },
  { num: '05', title: 'Audit Record', content: 'Compliance verification logs, safety scores, and supervisor signature blocks.' }
];

export default function PageTurnSequence() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_currentPage, setCurrentPage] = useState(0);
  const level = getResolvedMotionLevel();

  useGSAP(() => {
    if (level !== 'full' || !triggerRef.current || !containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.sheet-page');
    const total = cards.length;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(total - 1, Math.floor(self.progress * total));
          setCurrentPage(idx);
        }
      }
    });

    cards.forEach((card, idx) => {
      if (idx === 0) return;
      tl.fromTo(card,
        {
          rotateY: 8,
          rotateX: 4,
          z: -100 * idx,
          opacity: 0,
        },
        {
          rotateY: 0,
          rotateX: 0,
          z: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 1
        },
        idx - 0.7
      );
    });

    return () => {
      tl.scrollTrigger?.kill();
    };
  }, { scope: triggerRef, dependencies: [level] });

  if (level !== 'full') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6) 0' }}>
        <h3 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--accent)', marginBottom: 'var(--space-2)' }}>
          Traceable Operations Log
        </h3>
        {PAGES.map((page, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              background: 'var(--background-surface)',
              padding: 'var(--space-5)'
            }}
          >
            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', fontWeight: 'bold' }}>
              Sheet {page.num}
            </div>
            <h4 style={{ fontWeight: 600, margin: 'var(--space-1) 0' }}>{page.title}</h4>
            <p className="text-secondary" style={{ fontSize: 'var(--font-size-small)' }}>{page.content}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={triggerRef} style={{ height: '300vh', background: 'var(--background-page)', overflow: 'hidden' }}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-8)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--accent)', fontWeight: 600 }}>
            Traceable Lifecycle Sheets
          </h3>
          <p className="text-secondary" style={{ fontSize: 'var(--font-size-small)', marginTop: 'var(--space-2)' }}>
            Scroll to flip through operational records.
          </p>
        </div>

        <div
          ref={containerRef}
          className="perspective-container"
          style={{
            position: 'relative',
            width: '460px',
            height: '320px',
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {PAGES.map((page, idx) => (
            <div
              key={idx}
              className="sheet-page"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transformOrigin: 'left center',
                zIndex: PAGES.length - idx
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', fontWeight: 'bold' }}>
                  SHEET {page.num}
                </span>
                <span className="status-badge status-badge-closed">LOGGED</span>
              </div>

              <div>
                <h4 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  {page.title}
                </h4>
                <p className="text-secondary" style={{ fontSize: 'var(--font-size-small)', lineHeight: 1.6 }}>
                  {page.content}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>
                <span>TRANSITOPS LEDGER</span>
                <span>ID: TO-{1000 + idx}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { gsap, useGSAP } from '../../animation/gsapConfig';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

export default function ImmersiveZoom() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const level = getResolvedMotionLevel();

  useGSAP(() => {
    if (level !== 'full' || !triggerRef.current || !zoomRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      }
    });

    tl.to(zoomRef.current, {
      scale: 1.12,
      transformOrigin: '70% 30%',
      ease: 'none',
    })
    .to(sidebarRef.current, {
      xPercent: -30,
      opacity: 0.3,
      ease: 'none',
    }, 0)
    .to(contentRef.current, {
      borderColor: 'var(--accent)',
      ease: 'none'
    }, 0.5);

    return () => {
      tl.scrollTrigger?.kill();
    };
  }, { scope: triggerRef, dependencies: [level] });

  if (level !== 'full') {
    return (
      <div style={{ padding: 'var(--space-10) 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h3 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--accent)', fontWeight: 600 }}>
              Operational Detail
            </h3>
            <p className="text-secondary" style={{ marginTop: 'var(--space-3)' }}>
              Zoom into regional KPI grids, track fleet allocation metrics, and resolve dispatch exceptions.
            </p>
          </div>
          <div style={{ flex: 2, minWidth: '320px', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', background: 'var(--background-surface)', padding: 'var(--space-5)' }}>
            <span className="status-badge status-badge-on_trip" style={{ marginBottom: 'var(--space-3)' }}>Live Preview</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={{ border: '1px solid var(--border)', padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>Utilization</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>87.4%</div>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>Dispatch Status</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--state-available-text)' }}>Normal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={triggerRef} style={{ height: '200vh', background: 'var(--background-page)', overflow: 'hidden' }}>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={zoomRef}
          style={{
            width: '90%',
            maxWidth: '1000px',
            height: '80%',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            background: 'var(--background-surface)',
            display: 'flex',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div
            ref={sidebarRef}
            style={{
              width: '180px',
              borderRight: '1px solid var(--border)',
              background: 'var(--background-page)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            <div style={{ width: '80px', height: '12px', background: 'var(--accent)', borderRadius: '2px' }} />
            <div style={{ width: '100px', height: '10px', background: 'var(--border-strong)', borderRadius: '2px' }} />
            <div style={{ width: '90px', height: '10px', background: 'var(--border)', borderRadius: '2px' }} />
            <div style={{ width: '95px', height: '10px', background: 'var(--border)', borderRadius: '2px' }} />
          </div>

          <div
            ref={contentRef}
            style={{
              flex: 1,
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              border: '2px solid transparent',
              transition: 'border-color 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '18px', background: 'var(--text-primary)', borderRadius: '2px' }} />
              <span className="status-badge status-badge-available">Online</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {[
                { label: 'Utilization', value: '87.4%', color: 'var(--text-primary)' },
                { label: 'Active Trips', value: '42', color: 'var(--state-on-trip-text)' },
                { label: 'In Shop', value: '3', color: 'var(--state-in-shop-text)' },
              ].map((kpi, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-control)', padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>{kpi.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, marginTop: 'var(--space-2)', color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-control)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80%', height: '80%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '2px' }} />
                <div style={{ width: '90%', height: '8px', background: 'var(--border)', borderRadius: '2px' }} />
                <div style={{ width: '95%', height: '8px', background: 'var(--border)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

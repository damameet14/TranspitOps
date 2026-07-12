import { useState } from 'react';
import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

const ITEMS = [
  { id: 'assets', label: 'Assets', desc: 'Enterprise asset tracking' },
  { id: 'transfers', label: 'Transfers', desc: 'Department transfers' },
  { id: 'bookings', label: 'Bookings', desc: 'Resource booking scheduler' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Audit-ready maintenance log' },
  { id: 'audits', label: 'Audits', desc: 'Verification checklist' },
  { id: 'reports', label: 'Reports', desc: 'Data visualization summaries' },
];

export default function ThreeDCarousel() {
  const [index, setIndex] = useState(0);
  const level = getResolvedMotionLevel();

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % ITEMS.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + ITEMS.length) % ITEMS.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  if (level !== 'full') {
    return (
      <div style={{ width: '100%', overflow: 'hidden', padding: 'var(--space-4) 0' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 'var(--space-2)' }}>
          {ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                flex: '0 0 280px',
                scrollSnapAlign: 'start',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                background: 'var(--background-surface)',
                padding: 'var(--space-5)'
              }}
            >
              <h4 style={{ color: 'var(--accent)', fontWeight: 600 }}>{item.label}</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--font-size-small)', marginTop: 'var(--space-2)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <button className="button button-secondary button-small" onClick={handlePrev}>←</button>
          <button className="button button-secondary button-small" onClick={handleNext}>→</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Operational modules carousel"
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
        perspective: 1200
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: '0'
        }}
      >
        Active module: {ITEMS[index].label}. {ITEMS[index].desc}. Slide {index + 1} of {ITEMS.length}.
      </span>

      <div style={{ position: 'relative', width: '380px', height: '220px', transformStyle: 'preserve-3d' }}>
        {ITEMS.map((item, idx) => {
          let diff = idx - index;
          if (diff < -ITEMS.length / 2) diff += ITEMS.length;
          if (diff > ITEMS.length / 2) diff -= ITEMS.length;

          const isCenter = diff === 0;
          const isLeft = diff === -1 || (index === 0 && idx === ITEMS.length - 1);
          const isRight = diff === 1 || (index === ITEMS.length - 1 && idx === 0);
          const isVisible = isCenter || isLeft || isRight;

          if (!isVisible) return null;

          const rotateY = isCenter ? 0 : isLeft ? 12 : -12;
          const translateX = isCenter ? 0 : isLeft ? -140 : 140;
          const translateZ = isCenter ? 0 : -80;
          const opacity = isCenter ? 1.0 : 0.65;
          const zIndex = isCenter ? 10 : 5;

          return (
            <motion.div
              key={item.id}
              animate={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
                zIndex
              }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'var(--background-surface)',
                border: isCenter ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => setIndex(idx)}
            >
              <h4 style={{ color: 'var(--accent)', fontSize: 'var(--font-size-h3)', fontWeight: 600 }}>
                {item.label}
              </h4>
              <p className="text-secondary" style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--space-3)' }}>
                {item.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <span className="status-badge status-badge-available">Node active</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
        <button className="button button-secondary button-small" onClick={handlePrev} aria-label="Previous slide">
          ←
        </button>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-small)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {index + 1} / {ITEMS.length}
        </div>
        <button className="button button-secondary button-small" onClick={handleNext} aria-label="Next slide">
          →
        </button>
      </div>
    </div>
  );
}

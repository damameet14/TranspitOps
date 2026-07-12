import { useState } from 'react';
import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

const COLUMNS = [
  { id: 'admin', title: 'Admin', desc: 'System configuration, user roles, permission audits, and global security policies.', color: 'var(--accent)' },
  { id: 'manager', title: 'Asset Manager', desc: 'Fleet registry, vehicle procurement, lifecycle logging, and real-time utilization.', color: 'var(--state-on-trip-text)' },
  { id: 'head', title: 'Department Head', desc: 'Allocation requests, budget reviews, cost approvals, and regional team management.', color: 'var(--state-in-shop-text)' },
  { id: 'employee', title: 'Employee', desc: 'Vehicle check-ins, trip reporting, license renewals, and personal scheduling.', color: 'var(--state-available-text)' }
];

export default function VerticalColumnStory() {
  const [selected, setSelected] = useState<string | null>(null);
  const level = getResolvedMotionLevel();

  const handleSelect = (id: string) => {
    setSelected(selected === id ? null : id);
  };

  if (level !== 'full') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-control)',
              background: 'var(--background-surface)',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => handleSelect(col.id)}
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontWeight: 600,
                color: selected === col.id ? 'var(--accent)' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--font-size-body)'
              }}
            >
              <span>{col.title}</span>
              <span>{selected === col.id ? '−' : '+'}</span>
            </button>
            {selected === col.id && (
              <div style={{ padding: '0 var(--space-4) var(--space-4)', fontSize: 'var(--font-size-small)', color: 'var(--text-secondary)' }}>
                {col.desc}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', height: '380px', width: '100%' }}>
      {COLUMNS.map((col, idx) => {
        const isOdd = idx % 2 !== 0;
        const isSelected = selected === col.id;
        const hasSelection = selected !== null;

        let flexVal = 1;
        if (hasSelection) {
          flexVal = isSelected ? 2 : 0.6;
        }

        return (
          <motion.div
            key={col.id}
            layout
            initial={{
              opacity: 0,
              y: isOdd ? 24 : -24
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{
              layout: { type: 'spring', stiffness: 220, damping: 28 },
              opacity: { duration: 0.48, delay: idx * 0.07 },
              y: { duration: 0.48, delay: idx * 0.07 }
            }}
            style={{
              flex: flexVal,
              background: 'var(--background-surface)',
              border: '1px solid',
              borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: 'var(--space-5)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden'
            }}
            onClick={() => handleSelect(col.id)}
          >
            <div>
              <span style={{ fontSize: 'var(--font-size-caption)', textTransform: 'uppercase', color: col.color, fontWeight: 'bold' }}>
                Role 0{idx + 1}
              </span>
              <h4 style={{ fontSize: 'var(--font-size-h3)', marginTop: 'var(--space-2)', fontWeight: 600 }}>
                {col.title}
              </h4>
            </div>

            <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
              <p className="text-secondary" style={{ fontSize: 'var(--font-size-small)', opacity: hasSelection && !isSelected ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                {col.desc}
              </p>
            </div>

            <div style={{ alignSelf: 'flex-start' }}>
              <span className="status-badge" style={{ background: 'var(--background-page)', color: 'var(--text-secondary)' }}>
                {isSelected ? 'Click to collapse' : 'Expand role'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

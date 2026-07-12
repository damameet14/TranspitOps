import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

export default function LottieIllustration() {
  const level = getResolvedMotionLevel();

  if (level !== 'full') {
    return (
      <svg
        width="240"
        height="240"
        viewBox="0 0 200 200"
        fill="none"
        style={{
          background: 'var(--background-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)'
        }}
      >
        <rect x="20" y="20" width="160" height="160" stroke="var(--border)" strokeWidth="1" rx="8" />
        <line x1="40" y1="100" x2="160" y2="100" stroke="var(--accent)" strokeWidth="1.5" />
        <rect x="38" y="98" width="5" height="5" fill="var(--accent)" />
        <rect x="98" y="98" width="5" height="5" fill="var(--accent)" />
        <rect x="158" y="98" width="5" height="5" fill="var(--accent)" />
        <text x="100" y="145" fill="var(--text-secondary)" fontSize="11" textAnchor="middle" fontFamily="var(--font-family)">
          Operational Flow
        </text>
      </svg>
    );
  }

  return (
    <div style={{ position: 'relative', width: 240, height: 240 }}>
      <svg
        width="240"
        height="240"
        viewBox="0 0 200 200"
        fill="none"
        style={{
          background: 'var(--background-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)',
          overflow: 'visible'
        }}
      >
        <rect x="20" y="20" width="160" height="160" stroke="var(--border)" strokeWidth="1" rx="8" />

        <motion.path
          d="M 30 50 H 170"
          stroke="var(--border-strong)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        <motion.rect
          x="30"
          y="48"
          width="5"
          height="5"
          fill="var(--accent)"
          animate={{ x: [30, 165, 30] }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        />

        <motion.path
          d="M 40 100 Q 100 40 160 100"
          stroke="var(--accent)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        <rect x="37" y="97" width="6" height="6" fill="var(--text-primary)" />
        <rect x="157" y="97" width="6" height="6" fill="var(--text-primary)" />

        <motion.circle
          cx="100"
          cy="70"
          r="12"
          stroke="var(--state-in-shop-text)"
          strokeWidth="1.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 70px' }}
        />
        <rect x="97" y="67" width="6" height="6" fill="var(--state-in-shop-text)" />

        <text x="100" y="150" fill="var(--text-secondary)" fontSize="11" textAnchor="middle" fontWeight="500" fontFamily="var(--font-family)">
          SYSTEM LIFE-FLOW
        </text>
      </svg>
    </div>
  );
}

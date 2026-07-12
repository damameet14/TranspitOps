import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

export default function RouteLineAnimation() {
  const level = getResolvedMotionLevel();

  return (
    <svg width="100%" height="200" viewBox="0 0 600 200" fill="none" style={{ overflow: 'visible' }}>
      {/* Background route grids */}
      <path d="M 50 100 Q 200 40 350 100 T 550 100" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M 50 140 Q 200 80 350 140 T 550 140" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Main active operational route */}
      <motion.path
        d="M 50 80 Q 200 160 350 80 T 550 80"
        stroke="var(--accent)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={level === 'full' ? { duration: 0.9, ease: 'easeOut', delay: 0.5 } : { duration: 0 }}
      />

      {/* Square nodes */}
      <g>
        <rect x="47" y="77" width="6" height="6" fill="var(--accent)" />
        <rect x="197" y="127" width="6" height="6" fill="var(--accent)" />
        <rect x="347" y="77" width="6" height="6" fill="var(--accent)" />
        <rect x="547" y="77" width="6" height="6" fill="var(--accent)" />
      </g>
    </svg>
  );
}

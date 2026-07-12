import { motion, useScroll } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const level = getResolvedMotionLevel();

  if (level === 'static') return null;

  return (
    <div className="scroll-progress-bar">
      <motion.div
        className="scroll-progress-indicator"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  );
}

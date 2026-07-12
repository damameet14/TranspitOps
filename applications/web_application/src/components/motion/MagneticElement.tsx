import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

export default function MagneticElement({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const level = getResolvedMotionLevel();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (level !== 'full' || !ref.current) return;

    const { clientX, clientY } = e;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    const radius = 60;
    if (distance < radius) {
      const strength = 4; // Max translation 4px
      const x = (distanceX / radius) * strength;
      const y = (distanceY / radius) * strength;
      setPosition({ x, y });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (level !== 'full') return children;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.18 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

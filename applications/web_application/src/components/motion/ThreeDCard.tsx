import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ThreeDCard({ children, className, style }: ThreeDCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const level = getResolvedMotionLevel();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (level !== 'full' || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Max rotateX 3 degrees, max rotateY 4 degrees
    const rx = ((y / rect.height) - 0.5) * -6;
    const ry = ((x / rect.width) - 0.5) * 8;
    setRotate({ x: rx, y: ry });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  if (level !== 'full') {
    return (
      <div
        className={className}
        style={{
          ...style,
          border: '1px solid',
          borderColor: hovered ? 'var(--accent)' : 'var(--border)',
          borderRadius: 'var(--radius-card)',
          background: 'var(--background-surface)',
          padding: 'var(--space-5)',
          transition: 'border-color 0.15s ease'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...style,
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
          y: hovered ? -2 : 0,
          borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.18 }}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          background: 'var(--background-surface)',
          padding: 'var(--space-5)',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

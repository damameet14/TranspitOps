import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  depth: 1 | 2 | 3;
  className?: string;
  style?: React.CSSProperties;
}

export default function ParallaxLayer({ children, depth, className, style }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const level = getResolvedMotionLevel();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // 2%, 5%, or 8% relative vertical offset translation
  const range = depth === 1 ? [-15, 15] : depth === 2 ? [-35, 35] : [-60, 60];
  const y = useTransform(scrollYProgress, [0, 1], range);

  if (level !== 'full') {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ ...style, position: 'relative' }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

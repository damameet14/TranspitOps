import React from 'react';
import { motion } from 'motion/react';
import { fadeInUpVariants } from '../../animation/motionVariants';

export default function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

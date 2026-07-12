import React from 'react';
import { motion } from 'motion/react';
import { staggerContainerVariants } from '../../animation/motionVariants';

export default function StaggerGroup({ children, stagger = 0.06, className }: { children: React.ReactNode; stagger?: number; className?: string }) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      custom={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

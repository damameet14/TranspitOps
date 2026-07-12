import { getResolvedMotionLevel } from './reducedMotion';
import { easeTokens, springTokens } from './motionTokens';

// Adapt transition based on active motion level
export function getTransition(type: 'spring' | 'standard' | 'quick', delay = 0) {
  const level = getResolvedMotionLevel();
  if (level === 'static') {
    return { type: 'tween' as const, duration: 0, delay: 0 };
  }
  if (level === 'reduced') {
    return { type: 'tween' as const, duration: 0.15, ease: 'linear' as const, delay };
  }

  // Full motion
  if (type === 'spring') {
    return {
      ...springTokens,
      delay
    };
  }
  if (type === 'quick') {
    return {
      type: 'tween' as const,
      ease: easeTokens.standard,
      duration: 0.12,
      delay
    };
  }
  return {
    type: 'tween' as const,
    ease: easeTokens.standard,
    duration: 0.22,
    delay
  };
}

export const pageVariants = {
  initial: () => {
    const level = getResolvedMotionLevel();
    if (level === 'static') return { opacity: 1 };
    return {
      opacity: 0,
      y: level === 'reduced' ? 0 : 6
    };
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween' as const,
      ease: easeTokens.standard,
      duration: 0.18
    }
  },
  exit: () => {
    const level = getResolvedMotionLevel();
    if (level === 'static') return { opacity: 1 };
    return {
      opacity: 0,
      y: level === 'reduced' ? 0 : -3,
      transition: {
        type: 'tween' as const,
        ease: easeTokens.standard,
        duration: 0.12
      }
    };
  }
};

export const fadeInUpVariants = {
  hidden: () => {
    const level = getResolvedMotionLevel();
    return {
      opacity: 0,
      y: level === 'full' ? 16 : 0
    };
  },
  visible: (custom: { delay?: number } = {}) => ({
    opacity: 1,
    y: 0,
    transition: getTransition('standard', custom.delay || 0)
  })
};

export const staggerContainerVariants = {
  hidden: {},
  visible: (custom: { staggerChildren?: number } = {}) => ({
    transition: {
      staggerChildren: getResolvedMotionLevel() === 'full' ? (custom.staggerChildren ?? 0.05) : 0,
      delayChildren: 0
    }
  })
};

export const scaleOnPress = {
  tap: () => {
    const level = getResolvedMotionLevel();
    if (level !== 'full') return {};
    return { scale: 0.98 };
  }
};

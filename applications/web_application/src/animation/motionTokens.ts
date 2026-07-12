// Swiss Motion Tokens for Framer Motion / Motion for React

export const durationTokens = {
  instant: 0.08,  // 80ms
  quick: 0.12,    // 120ms
  fast: 0.16,     // 160ms
  standard: 0.22, // 220ms
  medium: 0.32,   // 320ms
  slow: 0.48,     // 480ms
  story: 0.72,    // 720ms
  cinematic: 1.0  // 1000ms
};

export const easeTokens = {
  linear: 'linear' as const,
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  enter: [0, 0, 0, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  emphasized: [0.16, 1, 0.3, 1] as [number, number, number, number],
  soft: [0.22, 1, 0.36, 1] as [number, number, number, number]
};

// Critically damped spring configuration with zero visible oscillation
export const springTokens = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 38,
  mass: 0.8
};

import Lenis from 'lenis';
import { ScrollTrigger } from './gsapConfig';
import { getResolvedMotionLevel } from './reducedMotion';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll(): Lenis | null {
  const level = getResolvedMotionLevel();
  if (level !== 'full') return null;

  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  });

  // Synchronize GSAP ScrollTrigger
  lenisInstance.on('scroll', () => {
    ScrollTrigger.update();
  });

  function tick(time: number) {
    lenisInstance?.raf(time);
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  return lenisInstance;
}

export function destroySmoothScroll() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

import { ScrollTrigger } from './gsapConfig';
import { getResolvedMotionLevel } from './reducedMotion';

const activeTimelines = new Set<any>();
let isHydrated = false;

export function markAsHydrated() {
  isHydrated = true;
}

export function canAnimate(): boolean {
  if (!isHydrated) return false;
  return getResolvedMotionLevel() !== 'static';
}

export function registerTimeline(tl: any) {
  activeTimelines.add(tl);
  return () => {
    activeTimelines.delete(tl);
    tl.kill();
  };
}

export function cleanRouteTimelines() {
  activeTimelines.forEach((tl) => {
    if (tl && typeof tl.kill === 'function') {
      tl.kill();
    }
  });
  activeTimelines.clear();

  // Clear local ScrollTriggers (preserving global ones if any, but usually kill all on page transition)
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill();
  });
}

export function refreshLayoutTriggers() {
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 150);
}

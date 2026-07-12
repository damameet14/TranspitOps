import { getResolvedMotionLevel } from './reducedMotion';

export type CursorState = {
  size: 'default' | 'link' | 'interactive';
  arrow?: boolean;
  label?: string;
};

type CursorListener = (state: CursorState) => void;
const listeners = new Set<CursorListener>();
let currentState: CursorState = { size: 'default' };

export function updateCursorState(state: CursorState) {
  currentState = state;
  listeners.forEach((l) => l(currentState));
}

export function subscribeToCursorState(listener: CursorListener) {
  listeners.add(listener);
  listener(currentState);
  return () => {
    listeners.delete(listener);
  };
}

export function isCursorFollowerEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const level = getResolvedMotionLevel();
  if (level !== 'full') return false;

  const hasPointer = window.matchMedia('(pointer: fine)').matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  const isDesktopWidth = window.innerWidth >= 1024;

  return hasPointer && supportsHover && isDesktopWidth;
}

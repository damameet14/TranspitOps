// Reduced Motion Mode state management

export type MotionLevel = 'full' | 'reduced' | 'static' | 'system';

export function getSystemMotionPreference(): 'full' | 'reduced' {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches ? 'reduced' : 'full';
}

export function getResolvedMotionLevel(): 'full' | 'reduced' | 'static' {
  const saved = localStorage.getItem('transitops_motion_level') as MotionLevel;
  if (!saved || saved === 'system') {
    const sys = getSystemMotionPreference();
    return sys;
  }
  if (saved === 'static') return 'static';
  if (saved === 'reduced') return 'reduced';
  return 'full';
}

export function setMotionLevelPreference(level: MotionLevel): void {
  localStorage.setItem('transitops_motion_level', level);
  // Dispatch custom event to notify listeners
  window.dispatchEvent(new Event('transitops_motion_level_change'));
}

export function getMotionLevelPreference(): MotionLevel {
  return (localStorage.getItem('transitops_motion_level') as MotionLevel) || 'system';
}

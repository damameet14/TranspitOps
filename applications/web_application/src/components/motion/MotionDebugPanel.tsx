import { useState, useEffect } from 'react';
import { getResolvedMotionLevel, getMotionLevelPreference, setMotionLevelPreference, type MotionLevel } from '../../animation/reducedMotion';
import { isCursorFollowerEnabled } from '../../animation/cursorManager';

export default function MotionDebugPanel() {
  const [motionLevel, setMotionLevel] = useState<MotionLevel>(getMotionLevelPreference());
  const [speed, setSpeed] = useState('1');

  useEffect(() => {
    if (!import.meta.env.DEV) return;
  }, []);

  if (!import.meta.env.DEV) return null;

  const handleMotionChange = (level: MotionLevel) => {
    setMotionLevel(level);
    setMotionLevelPreference(level);
  };

  const handleSpeedChange = (val: string) => {
    setSpeed(val);
    const scale = parseFloat(val);
    const globalGsap = (window as any).gsap;
    if (globalGsap) {
      globalGsap.globalTimeline.timeScale(scale);
    }
  };

  return (
    <div className="motion-debug-panel" aria-label="Animation debugging panel">
      <div className="motion-debug-title">TransitOps Motion Debug</div>
      
      <div className="motion-debug-row">
        <span>Motion Level:</span>
        <select
          className="motion-debug-select"
          value={motionLevel}
          onChange={(e) => handleMotionChange(e.target.value as MotionLevel)}
        >
          <option value="system">Follow System</option>
          <option value="full">Full Motion</option>
          <option value="reduced">Reduced Motion</option>
          <option value="static">No Motion (Static)</option>
        </select>
      </div>

      <div className="motion-debug-row">
        <span>Playback Speed:</span>
        <select
          className="motion-debug-select"
          value={speed}
          onChange={(e) => handleSpeedChange(e.target.value)}
        >
          <option value="0.25">0.25×</option>
          <option value="0.5">0.5×</option>
          <option value="1">1×</option>
          <option value="2">2×</option>
        </select>
      </div>

      <div className="motion-debug-row">
        <span>Cursor Follower:</span>
        <span>{isCursorFollowerEnabled() ? 'ENABLED' : 'DISABLED'}</span>
      </div>

      <div className="motion-debug-row">
        <span>Lenis status:</span>
        <span>{getResolvedMotionLevel() === 'full' ? 'RUNNING' : 'DISABLED'}</span>
      </div>

      <button
        className="motion-debug-button"
        style={{ width: '100%', marginTop: '8px' }}
        onClick={() => window.location.reload()}
      >
        Force Reload Page
      </button>
    </div>
  );
}

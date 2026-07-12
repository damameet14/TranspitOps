import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { isCursorFollowerEnabled, subscribeToCursorState, type CursorState } from '../../animation/cursorManager';

export default function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>({ size: 'default' });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Lag config ~60ms matching critically damped spring
  const springConfig = { damping: 38, stiffness: 420, mass: 0.8 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const checkStatus = () => {
      setEnabled(isCursorFollowerEnabled());
    };
    checkStatus();

    window.addEventListener('resize', checkStatus);
    window.addEventListener('transitops_motion_level_change', checkStatus);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const unsubscribe = subscribeToCursorState((s) => {
      setState(s);
    });

    return () => {
      window.removeEventListener('resize', checkStatus);
      window.removeEventListener('transitops_motion_level_change', checkStatus);
      window.removeEventListener('mousemove', handleMouseMove);
      unsubscribe();
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  let size = 18;
  if (state.size === 'link') size = 32;
  if (state.size === 'interactive') size = 44;

  return (
    <motion.div
      className="cursor-follower"
      style={{
        left: cursorX,
        top: cursorY,
      }}
      animate={{
        width: size,
        height: size,
      }}
      transition={{ type: 'spring', damping: 35, stiffness: 350 }}
    >
      {state.arrow && (
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '9px',
          color: 'var(--accent)',
          fontWeight: 'bold',
          lineHeight: 1
        }}>
          →
        </span>
      )}
    </motion.div>
  );
}

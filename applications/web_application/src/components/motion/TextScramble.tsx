import { useState, useRef } from 'react';
import { animate } from 'animejs';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

interface TextScrambleProps {
  text: string;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function TextScramble({ text, className }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [hovered, setHovered] = useState(false);
  const animationRef = useRef<any>(null);
  const level = getResolvedMotionLevel();

  const handleMouseEnter = () => {
    setHovered(true);
    if (level !== 'full') return;

    if (animationRef.current) {
      animationRef.current.pause();
    }

    const obj = { progress: 0 };
    animationRef.current = animate(obj, {
      progress: 1,
      duration: 280,
      ease: 'linear',
      onUpdate: () => {
        const progress = obj.progress;
        const result = Array.from(text).map((char, index) => {
          if (char === ' ') return ' ';
          if ((index === 0 || index === text.length - 1) && progress < 0.5) {
            return char;
          }
          if (Math.random() > progress) {
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          return char;
        }).join('');
        setDisplayText(result);
      },
      onComplete: () => {
        setDisplayText(text);
      }
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (animationRef.current) {
      animationRef.current.pause();
    }
    setDisplayText(text);
  };

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: 'pointer',
        color: hovered ? 'var(--accent)' : 'inherit',
        transition: 'color var(--duration-quick) var(--ease-standard)'
      }}
    >
      {displayText}
    </span>
  );
}

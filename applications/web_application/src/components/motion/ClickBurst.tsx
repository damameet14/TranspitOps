import React, { useRef } from 'react';
import { animate } from 'animejs';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

export default function ClickBurst({ children }: { children: React.ReactElement }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const level = getResolvedMotionLevel();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (level !== 'full' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.width = '3px';
      p.style.height = '3px';
      p.style.backgroundColor = 'var(--accent)';
      p.style.pointerEvents = 'none';
      p.style.zIndex = '999';
      containerRef.current.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const distance = 8 + Math.random() * 8;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      animate(p, {
        translateX: tx,
        translateY: ty,
        opacity: [1, 0],
        duration: 240,
        ease: 'outQuad',
        onComplete: () => {
          p.remove();
        }
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      {children}
    </div>
  );
}

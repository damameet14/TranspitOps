import React, { useState, useRef } from 'react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

interface PixelHoverProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export default function PixelHover({ children, label, className }: PixelHoverProps) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [cells, setCells] = useState<{ x: number; y: number; ox: number; oy: number }[]>([]);
  const level = getResolvedMotionLevel();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (level !== 'full' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cellSize = 12;
    const cols = Math.ceil(rect.width / cellSize);
    const rows = Math.ceil(rect.height / cellSize);

    const newCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Random offset 2px to 6px
        const ox = (Math.random() - 0.5) * 12;
        const oy = (Math.random() - 0.5) * 12;
        newCells.push({
          x: c * cellSize,
          y: r * cellSize,
          ox,
          oy,
        });
      }
    }
    setCells(newCells);
    setActive(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setActive(true);
      });
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setActive(false);
    setCells([]);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        position: 'relative',
        border: '1px solid',
        borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        background: 'var(--background-surface)',
        transition: 'border-color var(--duration-quick) var(--ease-standard)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <div style={{ opacity: hovered && level === 'full' ? 0.25 : 1, transition: 'opacity 0.2s' }}>
        {children}
      </div>

      {hovered && level === 'full' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {cells.map((cell, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cell.x,
                top: cell.y,
                width: 12,
                height: 12,
                backgroundColor: 'var(--accent-background)',
                border: '1px solid var(--accent)',
                transform: active ? 'translate(0, 0)' : `translate(${cell.ox}px, ${cell.oy}px)`,
                opacity: active ? 0 : 0.8,
                transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>
      )}

      {label && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            fontWeight: 500,
            fontSize: 'var(--font-size-small)',
            color: hovered ? 'var(--accent)' : 'var(--text-primary)',
            transition: 'color 0.2s'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

import { motion } from 'motion/react';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';

interface TextRevealProps {
  text: string;
  pattern: 'line' | 'word' | 'char';
  className?: string;
  style?: React.CSSProperties;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function TextReveal({ text, pattern, className, style, tag = 'p' }: TextRevealProps) {
  const level = getResolvedMotionLevel();
  const Tag = tag;

  if (level === 'static') {
    return <Tag className={className} style={style}>{text}</Tag>;
  }

  const srText = (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        border: '0'
      }}
    >
      {text}
    </span>
  );

  if (pattern === 'line') {
    const lines = text.split('\n');
    return (
      <Tag className={className} style={style} aria-label={text}>
        {srText}
        <span aria-hidden="true">
          {lines.map((line, idx) => (
            <span key={idx} className="text-mask-reveal" style={{ display: 'block', overflow: 'hidden' }}>
              <motion.span
                className="text-mask-reveal-line"
                style={{ display: 'inline-block' }}
                initial={{ y: '105%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: 'tween',
                  ease: [0.16, 1, 0.3, 1], // expo.out
                  duration: 0.72,
                  delay: idx * 0.07,
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </span>
      </Tag>
    );
  }

  if (pattern === 'word') {
    const words = text.split(' ');
    return (
      <Tag className={className} style={style} aria-label={text}>
        {srText}
        <span aria-hidden="true">
          {words.map((word, idx) => (
            <motion.span
              key={idx}
              style={{ display: 'inline-block', marginRight: '0.25em' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: 'tween',
                duration: 0.32,
                delay: idx * 0.05,
              }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      </Tag>
    );
  }

  // Character reveal
  const chars = Array.from(text);
  return (
    <Tag className={className} style={style} aria-label={text}>
      {srText}
      <span aria-hidden="true">
        {chars.map((char, idx) => (
          <motion.span
            key={idx}
            style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              type: 'tween',
              duration: 0.22,
              delay: idx * 0.02,
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </Tag>
  );
}

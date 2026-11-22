import React, { useEffect, useRef, useState } from 'react';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
  tone?: 'dark' | 'light';
  immediate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  as: Tag = 'h2',
  tone = 'dark',
  immediate = false,
  className = '',
  style,
}) => {
  const [revealed, setRevealed] = useState(immediate);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (immediate) {
      setRevealed(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setRevealed(true);
      return;
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  const words = text.trim().split(/\s+/).filter(Boolean);

  const gradientClass =
    tone === 'light'
      ? 'bg-gradient-to-r from-[#FAF8F5] via-[#F2DE9B] to-[#D4AF37] bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-[#181715] via-[#4D3B1A] to-[#9A7B3E] bg-clip-text text-transparent';

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={style}
      aria-label={text}
    >
      {words.map((word, idx) => (
        <React.Fragment key={`${idx}-${word}`}>
          <span
            aria-hidden="true"
            className="inline-block overflow-hidden align-bottom py-[0.08em] -my-[0.08em]"
          >
            <span
              className={`inline-block transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none will-change-transform ${gradientClass} ${
                revealed ? 'translate-y-0 opacity-100' : 'translate-y-[0.55em] opacity-0'
              }`}
              style={{
                transitionDelay: revealed ? `${Math.min(idx * 55, 550)}ms` : '0ms',
              }}
            >
              {word}
            </span>
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Tag>
  );
};

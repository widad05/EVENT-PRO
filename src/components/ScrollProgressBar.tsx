import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ScrollProgressBar: React.FC = () => {
  const { lang } = useApp();
  const { pathname } = useLocation();
  const barRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      rafRef.current = null;
      const el = barRef.current;
      if (!el) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

      el.style.transform = `scaleX(${progress})`;
    };

    const scheduleUpdate = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2.5px] bg-transparent"
    >
      <div
        ref={barRef}
        className={`h-full w-full bg-gradient-to-r from-[#9A7B3E] via-[#D4AF37] to-[#9A7B3E] will-change-transform ${
          lang === 'ar' ? 'origin-right' : 'origin-left'
        }`}
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';

type LoaderPhase = 'drawing' | 'fading' | 'done';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState<LoaderPhase>('drawing');

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const drawDuration = prefersReducedMotion ? 120 : 1150;
    const totalDuration = prefersReducedMotion ? 320 : 1500;

    const fadeTimer = window.setTimeout(() => {
      setPhase((prev) => (prev === 'drawing' ? 'fading' : prev));
    }, drawDuration);

    const doneTimer = window.setTimeout(() => {
      setPhase('done');
    }, totalDuration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhase('fading');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (phase === 'done') return null;

  const dismiss = () => {
    if (phase === 'drawing') {
      setPhase('fading');
      window.setTimeout(() => setPhase('done'), 320);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement EVENT PRO"
      onClick={dismiss}
      className={`no-print fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0C0B] transition-opacity duration-300 ease-out ${
        phase === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        <svg
          viewBox="0 0 220 220"
          className="h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="eventpro-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9A7B3E" />
              <stop offset="50%" stopColor="#E4C674" />
              <stop offset="100%" stopColor="#B89242" />
            </linearGradient>
          </defs>

          {/* Subtle dark gold guide track */}
          <circle
            cx="110"
            cy="110"
            r="96"
            fill="none"
            stroke="rgba(212, 175, 55, 0.14)"
            strokeWidth="1.5"
          />

          {/* Progressively drawn golden circle */}
          <circle
            cx="110"
            cy="110"
            r="96"
            fill="none"
            stroke="url(#eventpro-gold-ring)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeDasharray="604"
            strokeDashoffset="0"
            className="animate-circle-draw"
          />
        </svg>

        {/* Centered EVENT PRO Wordmark */}
        <div className="animate-logo-reveal absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="font-serif text-3xl font-semibold tracking-[0.14em] text-[#FAF8F5] sm:text-4xl">
            EVENT PRO
          </span>
          <span aria-hidden="true" className="my-2.5 h-px w-10 bg-[#D4AF37]/65" />
          <span className="text-[11px] font-medium tracking-[0.24em] text-[#D6BC88] uppercase">
            Casablanca
          </span>
        </div>
      </div>
    </div>
  );
};

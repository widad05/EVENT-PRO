import React, { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'action' | 'media' | 'input';

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');

  const ringRef = useRef<HTMLDivElement | null>(null);
  const targetPosRef = useRef({ x: -100, y: -100 });
  const currentPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const pointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluateSupport = () => {
      const canUse = pointerQuery.matches && !motionQuery.matches;
      setEnabled(canUse);
      if (!canUse) {
        visibleRef.current = false;
        setVisible(false);
      }
    };

    evaluateSupport();
    pointerQuery.addEventListener('change', evaluateSupport);
    motionQuery.addEventListener('change', evaluateSupport);

    return () => {
      pointerQuery.removeEventListener('change', evaluateSupport);
      motionQuery.removeEventListener('change', evaluateSupport);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const resolveVariant = (target: EventTarget | null): CursorVariant => {
      if (!(target instanceof Element)) return 'default';
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        return 'input';
      }
      if (target.closest('button, a, [role="button"], summary')) {
        return 'action';
      }
      if (target.closest('img, picture, [data-cursor="media"]')) {
        return 'media';
      }
      return 'default';
    };

    const animate = () => {
      const target = targetPosRef.current;
      const current = currentPosRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;

      current.x += dx * 0.24;
      current.y += dy * 0.24;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        current.x = target.x;
        current.y = target.y;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
        }
        rafRef.current = null;
      }
    };

    const scheduleLoop = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        if (visibleRef.current) {
          visibleRef.current = false;
          setVisible(false);
        }
        return;
      }

      targetPosRef.current = { x: e.clientX, y: e.clientY };

      if (!visibleRef.current) {
        currentPosRef.current = { x: e.clientX, y: e.clientY };
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
        visibleRef.current = true;
        setVisible(true);
      } else {
        scheduleLoop();
      }

      const nextVariant = resolveVariant(e.target);
      setVariant((prev) => (prev === nextVariant ? prev : nextVariant));
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        setPressed(true);
      }
    };

    const handlePointerUp = () => {
      setPressed(false);
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setVisible(false);
      setPressed(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const scaleClass = pressed
    ? 'scale-[0.88]'
    : variant === 'media'
      ? 'scale-[1.9]'
      : variant === 'action'
        ? 'scale-[1.6]'
        : variant === 'input'
          ? 'scale-[0.65] opacity-30'
          : 'scale-100';

  const appearanceClass =
    variant === 'media'
      ? 'border-[#D4AF37] bg-[#D4AF37]/12 shadow-[0_0_18px_rgba(212,175,55,0.22)]'
      : variant === 'action'
        ? 'border-[#D4AF37] bg-[#9A7B3E]/15 shadow-[0_0_14px_rgba(154,123,62,0.2)]'
        : 'border-[#9A7B3E]/80 bg-[#D4AF37]/5';

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className={`no-print pointer-events-none fixed left-0 top-0 z-[9999] transition-opacity duration-200 will-change-transform ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`-ml-3.5 -mt-3.5 h-7 w-7 rounded-full border transition-[transform,background-color,border-color,opacity,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${scaleClass} ${appearanceClass}`}
      />
    </div>
  );
};

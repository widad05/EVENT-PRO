import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MousePointer2, MoveHorizontal } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

interface TransformationCase {
  id: string;
  indexLabel: string;
  titleFr: string;
  titleAr: string;
  categoryFr: string;
  categoryAr: string;
  venueFr: string;
  venueAr: string;
  beforeImage: string;
  beforeAltFr: string;
  afterImage: string;
  afterAltFr: string;
  setupTimeFr: string;
  setupTimeAr: string;
  capacityFr: string;
  capacityAr: string;
  highlightsFr: string;
  highlightsAr: string;
}

const TRANSFORMATIONS: TransformationCase[] = [
  {
    id: 'salon-anfa',
    indexLabel: '01',
    titleFr: 'Salon Royal d’Anfa — Scénographie de Mariage',
    titleAr: 'قاعة أنفا الملكية — تصميم حفل زفاف',
    categoryFr: 'Mariage de prestige · Anfa, Casablanca',
    categoryAr: 'زفاف فاخر · أنفا، الدار البيضاء',
    venueFr: 'Grand Salon Anfa · 420 m²',
    venueAr: 'القاعة الكبرى أنفا · 420 م²',
    beforeImage: '/src/assets/images/before_salon_anfa_1795279924305.jpg',
    beforeAltFr: 'Salon de réception vide en marbre et arcades marocaines avant décoration à Casablanca',
    afterImage: '/src/assets/images/after_salon_anfa_1795279923765.jpg',
    afterAltFr: 'Même salon de réception métamorphosé avec drapé ivoire, lustres, art floral blanc et tables dorées',
    setupTimeFr: '14 heures de montage · 18 spécialistes',
    setupTimeAr: '14 ساعة تركيب · 18 مختصاً',
    capacityFr: '280 convives · Dîner assis',
    capacityAr: '280 ضيفاً · مأدبة عشاء',
    highlightsFr:
      'Voilage intégral sous plafond, arche florale sur mesure, lustres cristal, bougies et arts de la table dorés.',
    highlightsAr:
      'ستائر سقف فاخرة، قوس زهور طبيعية، ثريات كريستال، إضاءة دافئة وأواني مائدة مذهبة.',
  },
  {
    id: 'terrasse-corniche',
    indexLabel: '02',
    titleFr: 'Pavillon Corniche Océan — Dîner de Gala',
    titleAr: 'جناح الكورنيش — حفل عشاء رسمي',
    categoryFr: 'Événement professionnel · Aïn Diab, Casablanca',
    categoryAr: 'فعالية شركات · عين الذئاب، الدار البيضاء',
    venueFr: 'Pavillon Atlantique · 360 m²',
    venueAr: 'جناح المحيط · 360 م²',
    beforeImage: '/src/assets/images/before_terrasse_gala_1795279924228.jpg',
    beforeAltFr: 'Pavillon architectural en pierre face à l’océan avant installation à Casablanca',
    afterImage: '/src/assets/images/after_terrasse_gala_1795279925507.jpg',
    afterAltFr: 'Même pavillon aménagé pour un gala nocturne avec éclairage ambré sur colonnes et tables de réception',
    setupTimeFr: '10 heures de régie · 12 techniciens',
    setupTimeAr: '10 ساعات تجهيز · 12 تقنياً',
    capacityFr: '190 invités · Gala corporate',
    capacityAr: '190 مدعواً · عشاء مؤسساتي',
    highlightsFr:
      'Mise en lumière architecturale ambrée des colonnades, nappage noir et or, compositions florales basses et sonorisation.',
    highlightsAr:
      'إضاءة معمارية دافئة للأعمدة، مفارش سوداء وذهبية، تنسيقات زهور ونظام صوتي متكامل.',
  },
];

export const BeforeAfterSection: React.FC = () => {
  const { lang } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverFollow, setHoverFollow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [displayPos, setDisplayPos] = useState(50);

  const targetPosRef = useRef(50);
  const displayPosRef = useRef(50);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const activeCase = TRANSFORMATIONS[activeIndex];

  const startSmoothLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      const target = targetPosRef.current;
      const current = displayPosRef.current;
      const diff = target - current;

      if (prefersReducedMotion || Math.abs(diff) < 0.08) {
        displayPosRef.current = target;
        setDisplayPos(target);
        rafRef.current = null;
        return;
      }

      const next = current + diff * 0.22;
      displayPosRef.current = next;
      setDisplayPos(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const setTargetPosition = useCallback(
    (pct: number, immediate = false) => {
      const clamped = Math.max(0, Math.min(100, pct));
      targetPosRef.current = clamped;
      if (immediate) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        displayPosRef.current = clamped;
        setDisplayPos(clamped);
      } else {
        startSmoothLoop();
      }
    },
    [startSmoothLoop]
  );

  const updateFromClientX = useCallback(
    (clientX: number, immediate = false) => {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setTargetPosition(pct, immediate);
    },
    [setTargetPosition]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX, false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromClientX(e.clientX, true);
      return;
    }
    if (hoverFollow && e.pointerType === 'mouse') {
      updateFromClientX(e.clientX, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setTargetPosition(targetPosRef.current - step, false);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setTargetPosition(targetPosRef.current + step, false);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setTargetPosition(0, false);
    } else if (e.key === 'End') {
      e.preventDefault();
      setTargetPosition(100, false);
    }
  };

  const handleSelectCase = (idx: number) => {
    setActiveIndex(idx);
    setTargetPosition(52, false);
  };

  const beforePct = Math.round(displayPos);
  const afterPct = 100 - beforePct;

  return (
    <section
      id="avant-apres"
      aria-label={lang === 'ar' ? 'معرض قبل وبعد' : 'Galerie Avant et Après'}
      className="border-y border-[#E5E0D8] bg-[#F2EFE9]/55 py-20"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#E5E0D8] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
              {lang === 'ar' ? 'تحول الفضاءات' : 'Métamorphose scénographique'}
            </p>
            <TextReveal
              as="h2"
              text={
                lang === 'ar'
                  ? 'معرض قبل وبعد — شاهدوا تحول القاعات'
                  : 'Galerie Avant & Après — La métamorphose des lieux'
              }
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
            <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
              {lang === 'ar'
                ? 'مرّروا المؤشر أفقياً لمقارنة القاعة قبل التجهيز وبعد إتمام الديكور والإضاءة والضيافة.'
                : 'Déplacez le curseur sur la scène pour révéler en direct la transformation complète d’une salle nue en réception d’exception.'}
            </p>
          </div>

          {/* Case Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {TRANSFORMATIONS.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectCase(idx)}
                  className={`flex items-center gap-2.5 rounded-md border px-4 py-2.5 text-left text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'border-[#181715] bg-[#181715] text-[#FAF8F5]'
                      : 'border-[#E5E0D8] bg-white text-[#4A453E] hover:border-[#9A7B3E]'
                  }`}
                >
                  <span className="font-mono text-[#D4AF37] tabular-nums">{item.indexLabel}</span>
                  <span>
                    {idx === 0
                      ? lang === 'ar'
                        ? 'قاعة أنفا'
                        : 'Salon Anfa'
                      : lang === 'ar'
                        ? 'جناح الكورنيش'
                        : 'Pavillon Corniche'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Comparison Stage */}
        <div className="mt-10">
          <div
            ref={stageRef}
            dir="ltr"
            role="slider"
            tabIndex={0}
            aria-label={
              lang === 'ar'
                ? 'مؤشر المقارنة بين قبل وبعد التزيين'
                : 'Curseur de comparaison Avant et Après décoration'
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={beforePct}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            style={{ touchAction: 'pan-y' }}
            className="group relative aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-xl border border-[#DED8CE] bg-[#181715] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A7B3E] focus-visible:ring-offset-2"
          >
            {/* Base Layer: AFTER (Decorated Hall) */}
            <SafeImage
              src={activeCase.afterImage}
              alt={activeCase.afterAltFr}
              draggable={false}
              loading="eager"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />

            {/* Clipped Reveal Layer: BEFORE (Bare Hall) */}
            <div
              className="pointer-events-none absolute inset-0 will-change-[clip-path]"
              style={{ clipPath: `inset(0 ${100 - displayPos}% 0 0)` }}
            >
              <SafeImage
                src={activeCase.beforeImage}
                alt={activeCase.beforeAltFr}
                draggable={false}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Subtle Top/Bottom Contrast Scrim for Labels */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent"
            />

            {/* Corner Reference Captions */}
            <div
              className={`pointer-events-none absolute left-4 top-4 rounded-md bg-[#181715]/80 px-3 py-1.5 text-xs font-medium text-[#FAF8F5] backdrop-blur-xs transition-opacity duration-200 ${
                displayPos < 14 ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {lang === 'ar' ? 'قبل · القاعة فارغة' : 'Avant · Salle nue'}
            </div>

            <div
              className={`pointer-events-none absolute right-4 top-4 rounded-md bg-[#181715]/80 px-3 py-1.5 text-xs font-medium text-[#D6BC88] backdrop-blur-xs transition-opacity duration-200 ${
                displayPos > 86 ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {lang === 'ar' ? 'بعد · التصميم الكامل' : 'Après · Scénographie finale'}
            </div>

            {/* Vertical Golden Divider & Tactile Handle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-[#D4AF37] shadow-[0_0_14px_rgba(24,23,21,0.6)]"
              style={{ left: `${displayPos}%` }}
            >
              <div
                className={`absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#181715]/95 text-[#FAF8F5] shadow-lg transition-transform duration-150 ${
                  isDragging ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <MoveHorizontal className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Interactive Controls Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E5E0D8] bg-white px-5 py-3.5">
            <div className="flex items-center gap-3 text-xs text-[#5C564E]">
              <span className="font-mono font-medium text-[#181715] tabular-nums">
                {lang === 'ar' ? 'قبل' : 'Avant'} {beforePct}%
              </span>
              <span aria-hidden="true" className="text-[#C5B9A5]">
                ·
              </span>
              <span className="font-mono font-medium text-[#9A7B3E] tabular-nums">
                {lang === 'ar' ? 'بعد' : 'Après'} {afterPct}%
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetPosition(0, false)}
                className="rounded-md border border-[#E5E0D8] px-3 py-1.5 text-xs font-medium text-[#4A453E] transition-colors hover:border-[#9A7B3E] hover:text-[#181715] whitespace-nowrap shrink-0"
              >
                {lang === 'ar' ? 'عرض قبل' : 'Voir Avant'}
              </button>
              <button
                type="button"
                onClick={() => setTargetPosition(50, false)}
                className="rounded-md border border-[#E5E0D8] px-3 py-1.5 text-xs font-medium text-[#4A453E] transition-colors hover:border-[#9A7B3E] hover:text-[#181715] whitespace-nowrap shrink-0"
              >
                50 / 50
              </button>
              <button
                type="button"
                onClick={() => setTargetPosition(100, false)}
                className="rounded-md border border-[#E5E0D8] px-3 py-1.5 text-xs font-medium text-[#4A453E] transition-colors hover:border-[#9A7B3E] hover:text-[#181715] whitespace-nowrap shrink-0"
              >
                {lang === 'ar' ? 'عرض بعد' : 'Voir Après'}
              </button>

              <button
                type="button"
                onClick={() => setHoverFollow((v) => !v)}
                aria-pressed={hoverFollow}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  hoverFollow
                    ? 'border-[#9A7B3E] bg-[#FAF6EE] text-[#7D622F]'
                    : 'border-[#E5E0D8] bg-white text-[#5C564E] hover:border-[#9A7B3E]'
                }`}
              >
                <MousePointer2 className="h-3.5 w-3.5" />
                <span>
                  {hoverFollow
                    ? lang === 'ar'
                      ? 'تتبع المؤشر: مفعل'
                      : 'Suivi au survol : actif'
                    : lang === 'ar'
                      ? 'سحب يدوي'
                      : 'Glisser manuellement'}
                </span>
              </button>
            </div>
          </div>

          {/* Case Details & Action */}
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-[#E5E0D8] bg-white p-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5">
              <p className="text-xs font-medium text-[#9A7B3E]">
                {lang === 'ar' ? activeCase.categoryAr : activeCase.categoryFr}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-[#181715]">
                {lang === 'ar' ? activeCase.titleAr : activeCase.titleFr}
              </h3>
              <p className="mt-2 text-xs text-[#6B655C]">
                {lang === 'ar' ? activeCase.venueAr : activeCase.venueFr} ·{' '}
                {lang === 'ar' ? activeCase.capacityAr : activeCase.capacityFr}
              </p>
            </div>

            <div className="border-t border-[#F0ECE4] pt-4 md:col-span-4 md:border-s md:border-t-0 md:ps-6 md:pt-0">
              <p className="text-xs font-medium text-[#181715]">
                {lang === 'ar' ? activeCase.setupTimeAr : activeCase.setupTimeFr}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5C564E]">
                {lang === 'ar' ? activeCase.highlightsAr : activeCase.highlightsFr}
              </p>
            </div>

            <div className="flex md:col-span-3 md:justify-end">
              <Link
                to={`/devis?service=${encodeURIComponent('Décoration événementielle')}`}
                className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-5 py-2.5 text-xs font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
              >
                <span>
                  {lang === 'ar' ? 'اطلب تصميماً مماثلاً' : 'Demander un devis similaire'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

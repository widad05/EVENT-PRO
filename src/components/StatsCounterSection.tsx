import React, { useEffect, useRef, useState } from 'react';
import { Award, CalendarCheck2, Handshake, Sparkles } from 'lucide-react';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

interface StatConfig {
  id: string;
  target: number;
  suffix: string;
  labelFr: string;
  labelAr: string;
  sublabelFr: string;
  sublabelAr: string;
  icon: React.ElementType;
}

const STATS_DATA: StatConfig[] = [
  {
    id: 'events',
    target: 320,
    suffix: '+',
    labelFr: 'Événements organisés',
    labelAr: 'مناسبة منظمة',
    sublabelFr: 'Mariages, galas et réceptions à Casablanca',
    sublabelAr: 'حفلات زفاف وفعاليات بالدار البيضاء',
    icon: Sparkles,
  },
  {
    id: 'clients',
    target: 98,
    suffix: '%',
    labelFr: 'Clients satisfaits',
    labelAr: 'عملاء راضون',
    sublabelFr: 'Taux de satisfaction et de recommandation',
    sublabelAr: 'نسبة الرضا والتوصية من عملائنا',
    icon: Award,
  },
  {
    id: 'partners',
    target: 65,
    suffix: '+',
    labelFr: 'Prestataires partenaires',
    labelAr: 'شركاء وموردون',
    sublabelFr: 'Lieux, traiteurs, fleuristes et régies vérifiés',
    sublabelAr: 'قاعات وممونون ومزودون معتمدون',
    icon: Handshake,
  },
  {
    id: 'bookings',
    target: 450,
    suffix: '+',
    labelFr: 'Réservations',
    labelAr: 'حجوزات منجزة',
    sublabelFr: 'Dossiers planifiés et accompagnés sur mesure',
    sublabelAr: 'ملفات وحجوزات مواكبة باحترافية',
    icon: CalendarCheck2,
  },
];

export const StatsCounterSection: React.FC = () => {
  const { lang } = useApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>(() => STATS_DATA.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCounts(STATS_DATA.map((s) => s.target));
      return;
    }

    const duration = 1600;
    let startTime: number | null = null;
    let rafId = 0;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(STATS_DATA.map((s) => Math.round(s.target * eased)));

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        setCounts(STATS_DATA.map((s) => s.target));
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      aria-label={lang === 'ar' ? 'إحصائيات EVENT PRO' : 'Statistiques clés EVENT PRO'}
      className="border-y border-[#242424] bg-[#0A0A0A] py-20 text-white"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#D4AF37] uppercase">
              {lang === 'ar' ? 'أرقام ومؤشرات الثقة' : 'Repères & Savoir-faire'}
            </p>
            <TextReveal
              as="h2"
              tone="light"
              text={
                lang === 'ar'
                  ? 'خبرة ميدانية في تنظيم المناسبات'
                  : 'L’expérience événementielle en chiffres'
              }
              className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl"
            />
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#B3B3B3]">
            {lang === 'ar'
              ? 'نرافق عملاءنا في الدار البيضاء عبر شبكة مختارة من أفضل القاعات والممونين.'
              : 'Un réseau éprouvé à Casablanca et un suivi rigoureux pour chaque célébration privée ou professionnelle.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_DATA.map((item, idx) => {
            const Icon = item.icon;
            const currentValue = counts[idx] ?? 0;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-lg border border-white/15 bg-[#111111] p-6 transition-colors hover:border-[#D4AF37]/60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#D4AF37]/35 bg-black text-[#D4AF37]">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <span className="font-mono text-xs text-[#7A7A7A] tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="font-serif text-4xl font-semibold tracking-tight text-white tabular-nums sm:text-5xl">
                    {currentValue}
                    <span className="text-[#D4AF37]">{item.suffix}</span>
                  </p>
                  <h3 className="mt-3 text-base font-semibold text-white">
                    {lang === 'ar' ? item.labelAr : item.labelFr}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#A3A3A3]">
                    {lang === 'ar' ? item.sublabelAr : item.sublabelFr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

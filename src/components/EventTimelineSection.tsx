import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Compass,
  Flower2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

interface TimelineMilestone {
  step: string;
  timeframeFr: string;
  timeframeAr: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  deliverableFr: string;
  deliverableAr: string;
  icon: React.ElementType;
}

const TIMELINE_STEPS: TimelineMilestone[] = [
  {
    step: '01',
    timeframeFr: 'Étape initiale · Réservation',
    timeframeAr: 'المرحلة الأولى · الحجز',
    titleFr: 'Demande de réservation & premier échange',
    titleAr: 'طلب الحجز واللقاء الأول',
    descFr:
      'Vous précisez la date souhaitée, le type de réception, le nombre d’invités et vos priorités. Notre équipe vous contacte sous 24h pour structurer votre brief.',
    descAr:
      'تحددون التاريخ ونوع المناسبة وعدد الضيوف وأولوياتكم، ويتواصل معكم فريقنا خلال 24 ساعة.',
    deliverableFr: 'Référence dossier · Cadrage budget MAD',
    deliverableAr: 'مرجع الملف · تحديد الميزانية بالدرهم',
    icon: CalendarCheck,
  },
  {
    step: '02',
    timeframeFr: 'Phase de repérage · Devis',
    timeframeAr: 'مرحلة المعاينة · العرض المالي',
    titleFr: 'Visite des lieux & devis personnalisé',
    titleAr: 'زيارة القاعات وإعداد العرض المفصل',
    descFr:
      'Nous organisons des visites ciblées de salles, villas ou domaines à Casablanca et vous remettons un devis détaillé poste par poste sans frais cachés.',
    descAr:
      'ننظم زيارات خاصة للقاعات أو الفيلات بالدار البيضاء ونقدم عرضاً مالياً مفصلاً وشفافاً.',
    deliverableFr: 'Sélection de lieux · Devis détaillé',
    deliverableAr: 'مختارات الفضاءات · عرض مالي واضح',
    icon: Compass,
  },
  {
    step: '03',
    timeframeFr: 'Direction artistique · J-45',
    timeframeAr: 'التوجيه الفني · قبل 45 يوماً',
    titleFr: 'Scénographie, art floral & dégustation',
    titleAr: 'تصميم الديكور والزهور وتذوق القائمة',
    descFr:
      'Validation de l’identité visuelle, des compositions florales, des arts de la table, du mobilier et du menu gastronomique avec notre pôle traiteur.',
    descAr:
      'اعتماد الهوية البصرية وتنسيق الزهور وفنون المائدة والأثاث وقائمة الضيافة.',
    deliverableFr: 'Planche d’ambiance · Menu validé',
    deliverableAr: 'لوحة التصميم · اعتماد القائمة',
    icon: Flower2,
  },
  {
    step: '04',
    timeframeFr: 'Ingénierie & Prestataires · J-21',
    timeframeAr: 'التنسيق التقني · قبل 21 يوماً',
    titleFr: 'Coordination technique & prestataires',
    titleAr: 'التنسيق التقني وإدارة المزودين',
    descFr:
      'Briefing des équipes son, éclairage architectural, photographie, vidéographie, DJ ou orchestre, et élaboration du plan d’implantation précis.',
    descAr:
      'التنسيق مع فرق الصوت والإضاءة والتصوير والموسيقى وإعداد مخطط القاعة الدقيق.',
    deliverableFr: 'Plan de salle · Fiches techniques',
    deliverableAr: 'مخطط القاعة · البطاقات التقنية',
    icon: SlidersHorizontal,
  },
  {
    step: '05',
    timeframeFr: 'Préparation finale · J-3 à J-1',
    timeframeAr: 'التحضير النهائي · قبل 3 أيام',
    titleFr: 'Conducteur détaillé & montage sur site',
    titleAr: 'البرنامج الزمني والتركيب الميداني',
    descFr:
      'Remise du conducteur minute par minute, contrôle qualité des livraisons et supervision du montage floral, technique et mobilier sur le lieu.',
    descAr:
      'إعداد الجدول الزمني الدقيق ومراقبة جودة التجهيزات والإشراف على التركيب في الموقع.',
    deliverableFr: 'Conducteur horaire · Contrôle qualité',
    deliverableAr: 'البرنامج الدقيق · مراقبة الجودة',
    icon: ClipboardList,
  },
  {
    step: '06',
    timeframeFr: 'Célébration · Jour J',
    timeframeAr: 'يوم الاحتفال · اليوم الموعود',
    titleFr: 'Orchestration complète le Jour J',
    titleAr: 'الإدارة الكاملة يوم الحفل',
    descFr:
      'Accueil attentif de vos invités, gestion discrète des temps forts et coordination continue en coulisses afin que vous profitiez pleinement de chaque instant.',
    descAr:
      'استقبال الضيوف وإدارة كل تفاصيل الحفل بسلاسة خلف الكواليس لتستمتعوا بكل لحظة.',
    deliverableFr: 'Présence équipe dédiée · Sérénité totale',
    deliverableAr: 'حضور طاقم مخصص · راحة بال تامة',
    icon: Sparkles,
  },
];

export const EventTimelineSection: React.FC = () => {
  const { lang } = useApp();
  const [visibleSteps, setVisibleSteps] = useState<Record<number, boolean>>({ 0: true });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const all: Record<number, boolean> = {};
      TIMELINE_STEPS.forEach((_, i) => {
        all[i] = true;
      });
      setVisibleSteps(all);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute('data-step-index');
            const idx = idxAttr ? Number(idxAttr) : -1;
            if (idx >= 0) {
              setVisibleSteps((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const revealedCount = Object.values(visibleSteps).filter(Boolean).length;
  const progressRatio = Math.min(1, Math.max(0.15, revealedCount / TIMELINE_STEPS.length));

  return (
    <section
      aria-label="Event Timeline"
      className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
            {lang === 'ar' ? 'مسار التحضير للمناسبات' : 'Accompagnement pas à pas'}
          </p>
          <TextReveal
            as="h2"
            text={
              lang === 'ar'
                ? 'الجدول الزمني للتحضير من الحجز إلى يوم الحفل'
                : 'Event Timeline — De la réservation au Jour J'
            }
            className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
          />
        </div>
        <Link
          to="/reserver"
          className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-5 py-2.5 text-xs font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
        >
          <span>{lang === 'ar' ? 'ابدأ خطوتك الأولى' : 'Lancer ma réservation'}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Animated Vertical Timeline */}
      <div className="relative mt-12">
        {/* Background Rail + Gold Progress Rail */}
        <div
          aria-hidden="true"
          className="absolute bottom-4 left-5 top-4 w-px bg-[#E5E0D8] md:left-1/2 md:-translate-x-px"
        >
          <div
            className="h-full w-full origin-top bg-[#9A7B3E] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ transform: `scaleY(${progressRatio})` }}
          />
        </div>

        <div className="space-y-8 md:space-y-10">
          {TIMELINE_STEPS.map((item, idx) => {
            const Icon = item.icon;
            const isVisible = Boolean(visibleSteps[idx]);
            const isRightColumn = idx % 2 === 1;

            return (
              <div
                key={item.step}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                data-step-index={idx}
                className={`relative flex items-start md:items-center ${
                  isRightColumn ? 'md:justify-end' : 'md:justify-start'
                }`}
              >
                {/* Node Marker */}
                <div
                  className={`absolute left-0 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 ${
                    isVisible
                      ? 'border-[#9A7B3E] bg-[#181715] text-[#D4AF37] scale-100'
                      : 'border-[#D9D2C5] bg-[#FAF8F5] text-[#8A8277] scale-95'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>

                {/* Milestone Card */}
                <div
                  className={`ml-14 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:ml-0 md:w-[calc(50%-2.5rem)] ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-6'
                  }`}
                >
                  <article className="rounded-xl border border-[#E5E0D8] bg-white p-6 transition-colors hover:border-[#C5B9A5]">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-medium text-[#9A7B3E] tabular-nums">
                        {item.step}
                      </span>
                      <span className="text-[#6B655C]">
                        {lang === 'ar' ? item.timeframeAr : item.timeframeFr}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-2xl font-semibold text-[#181715]">
                      {lang === 'ar' ? item.titleAr : item.titleFr}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5C564E]">
                      {lang === 'ar' ? item.descAr : item.descFr}
                    </p>

                    <div className="mt-4 border-t border-[#F0ECE4] pt-3 text-xs font-medium text-[#4A453E]">
                      {lang === 'ar' ? item.deliverableAr : item.deliverableFr}
                    </div>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

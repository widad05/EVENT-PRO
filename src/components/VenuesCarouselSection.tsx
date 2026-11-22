import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

interface VenueSlide {
  id: string;
  nameFr: string;
  nameAr: string;
  district: string;
  capacity: string;
  setting: string;
  descFr: string;
  descAr: string;
  image: string;
}

const VENUES: VenueSlide[] = [
  {
    id: 'anfa-salon',
    nameFr: 'Salon Impérial d’Anfa',
    nameAr: 'قاعة أنفا الكبرى',
    district: 'Anfa, Casablanca',
    capacity: '150 à 450 invités',
    setting: 'Salle voûtée & marbre',
    descFr:
      'Volumes architecturaux majestueux, lustres en cristal, draperies ivoire et acoustique soignée pour mariages de prestige et dîners de gala.',
    descAr:
      'فضاء معماري فاخر بثريات الكريستال والرخام، مثالي لحفلات الزفاف الكبرى وحفلات العشاء الرسمية.',
    image: '/src/assets/images/venue_anfa_palace_salon_1795279159403.jpg',
  },
  {
    id: 'bouskoura-estate',
    nameFr: 'Domaine & Pavillon Cristallin de Bouskoura',
    nameAr: 'ضيعة وجناح بوسكورة الزجاجي',
    district: 'Bouskoura, Grand Casablanca',
    capacity: '100 à 350 invités',
    setting: 'Jardins d’oliviers & verrière',
    descFr:
      'Pavillon vitré niché au cœur d’un parc arboré d’oliviers centenaires, offrant une réception lumineuse en plein air à l’abri des aléas climatiques.',
    descAr:
      'جناح زجاجي وسط حدائق الزيتون، يجمع بين سحر الطبيعة والراحة الفاخرة لحفلاتكم.',
    image: '/src/assets/images/venue_bouskoura_estate_1795279155497.jpg',
  },
  {
    id: 'corniche-rooftop',
    nameFr: 'Terrasse Panoramique de la Corniche',
    nameAr: 'تراس الكورنيش البانورامي',
    district: 'Ain Diab, Casablanca',
    capacity: '60 à 220 invités',
    setting: 'Rooftop face à l’Atlantique',
    descFr:
      'Vue dégagée sur l’océan Atlantique et la skyline casablancaise au coucher du soleil, idéale pour cocktails chics, fiançailles et soirées privées.',
    descAr:
      'إطلالة بانورامية على المحيط الأطلسي عند الغروب، مثالية لحفلات الكوكتيل والخطوبة والسهرات الخاصة.',
    image: '/src/assets/images/venue_corniche_rooftop_1795279156434.jpg',
  },
  {
    id: 'atrium-corporate',
    nameFr: 'Atrium Exécutif & Conférences',
    nameAr: 'أتريوم المؤتمرات والشركات',
    district: 'Casablanca Finance City',
    capacity: '80 à 300 participants',
    setting: 'Auditoire & dîner assis',
    descFr:
      'Architecture contemporaine baignée de lumière, scène modulable et régie audiovisuelle intégrée pour séminaires, lancements et galas corporate.',
    descAr:
      'قاعة عصرية مجهزة بأحدث تقنيات الصوت والصورة للمؤتمرات واللقاءات المهنية.',
    image: '/src/assets/images/category_corporate_gala_1795278181060.jpg',
  },
];

export const VenuesCarouselSection: React.FC = () => {
  const { lang } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + VENUES.length) % VENUES.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % VENUES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 45) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  return (
    <section
      aria-label="Salles de réception à Casablanca"
      className="border-b border-[#E5E0D8] bg-white py-20"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
              {lang === 'ar' ? 'فضاءات الاستقبال بالدار البيضاء' : 'Lieux & Salles d’exception'}
            </p>
            <TextReveal
              as="h2"
              text={
                lang === 'ar'
                  ? 'مختاراتنا من قاعات الحفلات والضيوف'
                  : 'Nos salles de réception partenaires'
              }
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-[#6B655C] tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')} / {String(VENUES.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Salle précédente"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D9D2C5] bg-[#FAF8F5] text-[#181715] transition-colors hover:border-[#9A7B3E] hover:text-[#9A7B3E]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Salle suivante"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D9D2C5] bg-[#FAF8F5] text-[#181715] transition-colors hover:border-[#9A7B3E] hover:text-[#9A7B3E]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Viewport */}
        <div
          className="relative mt-8 overflow-hidden rounded-xl border border-[#E5E0D8] bg-[#181715]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{
              transform: `translateX(${lang === 'ar' ? activeIndex * 100 : -activeIndex * 100}%)`,
            }}
          >
            {VENUES.map((venue, idx) => {
              const isActive = idx === activeIndex;
              return (
                <article
                  key={venue.id}
                  aria-hidden={!isActive}
                  className="relative w-full shrink-0 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10]"
                >
                  <SafeImage
                    src={venue.image}
                    alt={venue.nameFr}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none ${
                      isActive ? 'scale-100' : 'scale-[1.03]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#D6BC88]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{venue.district}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{venue.capacity}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{venue.setting}</span>
                        </div>

                        <h3 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
                          {lang === 'ar' ? venue.nameAr : venue.nameFr}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#E5DFD5] line-clamp-3 sm:line-clamp-none">
                          {lang === 'ar' ? venue.descAr : venue.descFr}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                          to={`/reserver?type=${encodeURIComponent('Mariage')}`}
                          tabIndex={isActive ? 0 : -1}
                          className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-5 py-2.5 text-xs font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
                        >
                          <span>Visiter &amp; réserver</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          to={`/devis?service=${encodeURIComponent('Location de salles & Lieux')}`}
                          tabIndex={isActive ? 0 : -1}
                          className="inline-flex items-center rounded-md border border-white/40 bg-black/35 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-xs transition-colors hover:border-white whitespace-nowrap shrink-0"
                        >
                          Demander un devis
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Horizontal Venue Selector Strip */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VENUES.map((venue, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={venue.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                  active
                    ? 'border-[#9A7B3E] bg-[#FAF8F5]'
                    : 'border-[#E5E0D8] bg-white hover:border-[#C5B9A5]'
                }`}
              >
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-[#F2EFE9]">
                  <SafeImage
                    src={venue.image}
                    alt={venue.nameFr}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#181715]">
                    {lang === 'ar' ? venue.nameAr : venue.nameFr}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[#6B655C]">
                    {venue.district} · {venue.capacity}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

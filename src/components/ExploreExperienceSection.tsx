import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

interface ExperienceCard {
  id: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  image: string;
  to: string;
}

const EXPERIENCE_CARDS: ExperienceCard[] = [
  {
    id: 'salles',
    titleFr: 'Salles',
    titleAr: 'القاعات والفضاءات',
    subtitleFr: 'Villas d’Anfa, domaines à Bouskoura & terrasses sur la Corniche',
    subtitleAr: 'فيلات أنفا وضيعات بوسكورة وتراسات الكورنيش',
    image: '/src/assets/images/venue_anfa_palace_salon_1795279159403.jpg',
    to: '/services#location-salles',
  },
  {
    id: 'photographes',
    titleFr: 'Photographes',
    titleAr: 'التصوير الفوتوغرافي',
    subtitleFr: 'Reportages éditoriaux, lumière naturelle et films haute définition',
    subtitleAr: 'تغطية احترافية بإضاءة طبيعية وأفلام عالية الدقة',
    image: '/src/assets/images/experience_photographer_1795279298288.jpg',
    to: '/services#photographie-videographie',
  },
  {
    id: 'traiteurs',
    titleFr: 'Traiteurs',
    titleAr: 'الضيافة والبوفيه',
    subtitleFr: 'Gastronomie marocaine et méditerranéenne, service en salle dédié',
    subtitleAr: 'مأكولات مغربية ومتوسطية راقية مع خدمة طاقم متكامل',
    image: '/src/assets/images/service_catering_buffet_1795278181357.jpg',
    to: '/services#traiteur-buffet',
  },
  {
    id: 'dj',
    titleFr: 'DJ',
    titleAr: 'الدي جي والصوتيات',
    subtitleFr: 'Programmation musicale, régie sonore et éclairage architectural',
    subtitleAr: 'تنسيق موسيقي وتقنيات صوت وإضاءة معمارية',
    image: '/src/assets/images/gallery_sound_lighting_1795278181682.jpg',
    to: '/services#sonorisation-eclairage-dj',
  },
  {
    id: 'decoration',
    titleFr: 'Décoration',
    titleAr: 'الديكور والزهور',
    subtitleFr: 'Scénographie florale fraîche, bougies, draperies et arts de la table',
    subtitleAr: 'تصميم الزهور الطبيعية وفنون المائدة والإضاءة',
    image: '/src/assets/images/service_floral_decor_1795278181542.jpg',
    to: '/services#decoration-florale',
  },
  {
    id: 'organisation',
    titleFr: 'Organisation',
    titleAr: 'التنظيم الشامل',
    subtitleFr: 'Direction artistique et coordination intégrale le jour J à Casablanca',
    subtitleAr: 'إدارة فنية وتنسيق كامل ليوم الحفل بالدار البيضاء',
    image: '/src/assets/images/hero_casablanca_event_1795278178624.jpg',
    to: '/services#organisation-mariage',
  },
];

export const ExploreExperienceSection: React.FC = () => {
  const { lang } = useApp();

  return (
    <section
      aria-label="Explore by Experience"
      className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
            {lang === 'ar' ? 'استكشف حسب التجربة' : 'Métiers & Savoir-faire · Casablanca'}
          </p>
          <TextReveal
            as="h2"
            text={lang === 'ar' ? 'اكتشف كل تجربة على حدة' : 'Explore by Experience'}
            className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
          />
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#5C564E]">
          {lang === 'ar'
            ? 'اختر القطب الذي يناسب مناسبتك من القاعات إلى التنظيم الشامل.'
            : 'Survolez chaque univers pour découvrir nos pôles d’expertise et composer votre réception.'}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERIENCE_CARDS.map((card, idx) => (
          <Link
            key={card.id}
            to={card.to}
            className="group relative block aspect-[4/4] min-h-[340px] overflow-hidden rounded-xl border border-[#E5E0D8] bg-[#181715] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A7B3E]"
          >
            {/* Background Photograph with smooth zoom */}
            <SafeImage
              src={card.image}
              alt={card.titleFr}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />

            {/* Base legibility gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

            {/* Progressive dark veil on hover */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />

            {/* Card Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span className="font-mono tracking-wider tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white transition-all duration-300 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <div>
                {/* Gold hover title */}
                <h3 className="font-serif text-3xl font-semibold tracking-tight text-[#D4AF37] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100 motion-reduce:transition-none">
                  {lang === 'ar' ? card.titleAr : card.titleFr}
                </h3>

                {/* Subtle label always visible at rest, recedes smoothly on hover on desktop */}
                <p className="mt-1 text-sm font-medium text-white transition-opacity duration-300 md:group-hover:text-[#E5DFD5]">
                  <span className="md:group-hover:hidden">
                    {lang === 'ar' ? card.titleAr : card.titleFr} —{' '}
                  </span>
                  <span className="text-xs font-normal text-[#DFD8CE]">
                    {lang === 'ar' ? card.subtitleAr : card.subtitleFr}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

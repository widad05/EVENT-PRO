import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';

interface OfferItem {
  id: string;
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  scopeFr: string;
  scopeAr: string;
  oldPriceDh: number;
  newPriceDh: number;
  savingsLabelFr: string;
  savingsLabelAr: string;
  image: string;
  includedFr: string[];
  includedAr: string[];
  featured?: boolean;
}

const OFFERS: OfferItem[] = [
  {
    id: 'henna-fiancailles',
    tagFr: 'Offre Cérémonie · Jusqu’à 80 invités',
    tagAr: 'عرض الحفلات · حتى 80 مدعواً',
    titleFr: 'Pack Henné & Fiançailles',
    titleAr: 'باقة الحناء والخطوبة',
    scopeFr: 'Réception familiale clé en main à domicile ou en salon privé à Casablanca.',
    scopeAr: 'استقبال عائلي متكامل بالمنزل أو بقاعة خاصة بالدار البيضاء.',
    oldPriceDh: 28000,
    newPriceDh: 22500,
    savingsLabelFr: 'Avantage 5 500 DH',
    savingsLabelAr: 'توفير 5,500 درهم',
    image: '/src/assets/images/category_henna_ceremony_1795278182712.jpg',
    includedFr: [
      'Salon marocain brodé & luminaires en laiton',
      'Décor floral roses blanches & fleurs d’oranger',
      'Service thé cérémoniel & assortiment pâtisseries',
      'Reportage photo 4 heures',
    ],
    includedAr: [
      'صالون مغربي مطرز وإضاءة تقليدية',
      'تنسيق زهور بيضاء وزهر البرتقال',
      'تقديم الشاي المغربي والحلويات التقليدية',
      'تغطية تصوير فوتوغرافي لمدة 4 ساعات',
    ],
  },
  {
    id: 'mariage-signature',
    tagFr: 'Offre Saisonnière · Jusqu’à 180 invités',
    tagAr: 'عرض موسمي · حتى 180 مدعواً',
    titleFr: 'Pack Mariage Signature',
    titleAr: 'باقة الزفاف المتكاملة',
    scopeFr: 'Direction artistique, coordination jour J, gastronomie et mise en lumière.',
    scopeAr: 'إدارة فنية وتنسيق كامل ليوم الزفاف مع الضيافة والإضاءة.',
    oldPriceDh: 95000,
    newPriceDh: 79000,
    savingsLabelFr: 'Avantage 16 000 DH',
    savingsLabelAr: 'توفير 16,000 درهم',
    image: '/src/assets/images/category_moroccan_wedding_1795278178133.jpg',
    featured: true,
    includedFr: [
      'Organisation complète & présence coordinatrice jour J',
      'Arche florale, centres de table & arts de la table',
      'Menu dîner marocain raffiné & brigade de service',
      'Sonorisation, éclairage architectural & DJ',
    ],
    includedAr: [
      'تنظيم شامل وحضور طاقم التنسيق يوم الحفل',
      'قوس زهور وتنسيق طاولات الضيوف',
      'قائمة عشاء مغربية راقية مع طاقم الخدمة',
      'صوتيات وإضاءة معمارية ودي جي',
    ],
  },
  {
    id: 'corporate-gala',
    tagFr: 'Offre Entreprise · Jusqu’à 120 participants',
    tagAr: 'عرض الشركات · حتى 120 مشاركاً',
    titleFr: 'Pack Séminaire & Gala Corporate',
    titleAr: 'باقة المؤتمرات وحفلات الشركات',
    scopeFr: 'Solution complète pour conférences, lancements et dîners de direction.',
    scopeAr: 'حل متكامل للمؤتمرات وإطلاق المنتجات وعشاء الأعمال.',
    oldPriceDh: 42000,
    newPriceDh: 34500,
    savingsLabelFr: 'Avantage 7 500 DH',
    savingsLabelAr: 'توفير 7,500 درهم',
    image: '/src/assets/images/category_corporate_gala_1795278181060.jpg',
    includedFr: [
      'Régie technique, sonorisation conférence & micros HF',
      'Pauses café & déjeuner d’affaires ou cocktail',
      'Signalétique d’accueil & coordination hôtesses',
      'Reportage photo corporate livré sous 48h',
    ],
    includedAr: [
      'إدارة تقنية وصوتيات المؤتمر وميكروفونات لاسلكية',
      'استراحات قهوة وغداء عمل أو كوكتيل',
      'تنظيم الاستقبال ومضيفات الترحيب',
      'تصوير احترافي يسلم خلال 48 ساعة',
    ],
  },
];

function formatDh(value: number): string {
  return `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value)} DH`;
}

export const ExclusiveOffersSection: React.FC = () => {
  const { lang } = useApp();

  return (
    <section
      aria-label="Exclusive Offers"
      className="border-t border-[#E5E0D8] bg-[#FAF8F5] py-20"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
              {lang === 'ar' ? 'عروض حصرية · الدار البيضاء' : 'Conditions Privilèges · Casablanca'}
            </p>
            <TextReveal
              as="h2"
              text={lang === 'ar' ? 'عروضنا الحصرية' : 'Exclusive Offers'}
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[#6B655C]">
            {lang === 'ar'
              ? 'باقات موسمية استرشادية بالدرهم المغربي قابلة للتعديل حسب تاريخ ومكان الحفل.'
              : 'Formules promotionnelles indicatives en dirhams (DH), valables selon disponibilité et personnalisables sur devis.'}
          </p>
        </div>

        {/* 3 Offer Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {OFFERS.map((offer) => {
            const included = lang === 'ar' ? offer.includedAr : offer.includedFr;
            return (
              <article
                key={offer.id}
                className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-colors ${
                  offer.featured
                    ? 'border-[#9A7B3E]'
                    : 'border-[#E5E0D8] hover:border-[#C5B9A5]'
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#F2EFE9]">
                  <SafeImage
                    src={offer.image}
                    alt={offer.titleFr}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {/* Unboxed metadata line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B655C]">
                      <span>{lang === 'ar' ? offer.tagAr : offer.tagFr}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#9A7B3E]">
                        {lang === 'ar' ? offer.savingsLabelAr : offer.savingsLabelFr}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-2xl font-semibold text-[#181715]">
                      {lang === 'ar' ? offer.titleAr : offer.titleFr}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5C564E]">
                      {lang === 'ar' ? offer.scopeAr : offer.scopeFr}
                    </p>

                    {/* Old & New Prices in DH */}
                    <div className="mt-5 flex flex-wrap items-baseline gap-3 border-y border-[#F0ECE4] py-4">
                      <span className="font-mono text-sm text-[#8A8277] line-through tabular-nums">
                        {formatDh(offer.oldPriceDh)}
                      </span>
                      <span className="font-serif text-3xl font-semibold text-[#181715] tabular-nums">
                        {formatDh(offer.newPriceDh)}
                      </span>
                      <span className="text-xs text-[#6B655C]">TTC indicatif</span>
                    </div>

                    <ul className="mt-5 space-y-2 text-xs leading-relaxed text-[#4A453E]">
                      {included.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-[#F0ECE4] pt-5">
                    <Link
                      to={`/devis?service=${encodeURIComponent(offer.titleFr)}`}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        offer.featured
                          ? 'bg-[#9A7B3E] text-[#FAF8F5] hover:bg-[#7D622F]'
                          : 'bg-[#181715] text-[#FAF8F5] hover:bg-[#2F2C27]'
                      }`}
                    >
                      <span>{lang === 'ar' ? 'استفد من العرض' : 'Profiter de l’offre'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/reserver"
                      className="inline-flex items-center justify-center rounded-md border border-[#D9D2C5] px-4 py-2.5 text-xs font-medium text-[#181715] transition-colors hover:border-[#9A7B3E] whitespace-nowrap shrink-0"
                    >
                      {lang === 'ar' ? 'حجز' : 'Réserver'}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

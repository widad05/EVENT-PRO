import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Camera,
  ChefHat,
  Flower2,
  Music,
  Sofa,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { StatsCounterSection } from '../components/StatsCounterSection';
import { MasonryGallerySection } from '../components/MasonryGallerySection';
import { VenuesCarouselSection } from '../components/VenuesCarouselSection';
import { ExploreExperienceSection } from '../components/ExploreExperienceSection';
import { ExclusiveOffersSection } from '../components/ExclusiveOffersSection';
import { ClientLoveStoriesSection } from '../components/ClientLoveStoriesSection';
import { EventTimelineSection } from '../components/EventTimelineSection';
import { BeforeAfterSection } from '../components/BeforeAfterSection';
import { DiscoverCasablancaSection } from '../components/DiscoverCasablancaSection';
import { TextReveal } from '../components/TextReveal';
import { useApp } from '../context/AppContext';

const EVENT_CATEGORIES = [
  {
    title: 'Mariages',
    desc: 'Direction artistique, coordination des prestataires et mise en scène de votre réception à Casablanca.',
    image: '/src/assets/images/category_moroccan_wedding_1795278178133.jpg',
    typeParam: 'Mariage',
  },
  {
    title: 'Fiançailles',
    desc: 'Réceptions familiales intimes, salons brodés et accueil raffiné à domicile ou en salon privé.',
    image: '/src/assets/images/category_henna_ceremony_1795278182712.jpg',
    typeParam: 'Fiançailles',
  },
  {
    title: 'Anniversaires',
    desc: 'Dîners privés en jardin, soirées festives sur terrasse et scénographies sur mesure.',
    image: '/src/assets/images/gallery_birthday_garden_1795278181192.jpg',
    typeParam: 'Anniversaire',
  },
  {
    title: 'Événements professionnels',
    desc: 'Séminaires, conférences, team building et dîners de gala d’entreprise à Casablanca.',
    image: '/src/assets/images/category_corporate_gala_1795278181060.jpg',
    typeParam: 'Événement professionnel',
  },
  {
    title: 'Cérémonies marocaines',
    desc: 'Soirées henné, berza et réceptions patrimoniales portées par le savoir-faire marocain.',
    image: '/src/assets/images/category_henna_ceremony_1795278182712.jpg',
    typeParam: 'Cérémonie marocaine',
  },
  {
    title: 'Fêtes privées',
    desc: 'Remises de diplômes, baby showers et célébrations sur mesure clés en main.',
    image: '/src/assets/images/gallery_sound_lighting_1795278181682.jpg',
    typeParam: 'Fête privée',
  },
];

const HOME_SERVICES = [
  {
    title: 'Organisation complète',
    desc: 'Pilotage intégral du cahier des charges jusqu’à la coordination le jour J.',
    image: '/src/assets/images/hero_casablanca_event_1795278178624.jpg',
    icon: Sparkles,
    slug: 'organisation-mariage',
  },
  {
    title: 'Décoration événementielle',
    desc: 'Scénographie florale, nappages nobles, bougeoirs et arts de la table.',
    image: '/src/assets/images/service_floral_decor_1795278181542.jpg',
    icon: Flower2,
    slug: 'decoration-florale',
  },
  {
    title: 'Traiteur et buffet',
    desc: 'Gastronomie marocaine et méditerranéenne servie par une brigade dédiée.',
    image: '/src/assets/images/service_catering_buffet_1795278181357.jpg',
    icon: ChefHat,
    slug: 'traiteur-buffet',
  },
  {
    title: 'Location de salles',
    desc: 'Villas d’Anfa, domaines à Bouskoura, terrasses sur la Corniche et hôtels.',
    image: '/src/assets/images/category_corporate_gala_1795278181060.jpg',
    icon: Building2,
    slug: 'location-salles',
  },
  {
    title: 'Photographie et vidéo',
    desc: 'Reportages naturels et films haute définition de vos temps forts.',
    image: '/src/assets/images/category_moroccan_wedding_1795278178133.jpg',
    icon: Camera,
    slug: 'photographie-videographie',
  },
  {
    title: 'Sonorisation et éclairage',
    desc: 'Systèmes audio calibrés et mise en lumière architecturale chaleureuse.',
    image: '/src/assets/images/gallery_sound_lighting_1795278181682.jpg',
    icon: Volume2,
    slug: 'sonorisation-eclairage-dj',
  },
  {
    title: 'Animation et DJ',
    desc: 'Programmation musicale personnalisée, DJ et formations acoustiques.',
    image: '/src/assets/images/gallery_birthday_garden_1795278181192.jpg',
    icon: Music,
    slug: 'sonorisation-eclairage-dj',
  },
  {
    title: 'Mobilier et accessoires',
    desc: 'Tables en chêne, assises design, salons lounge et équipements techniques.',
    image: '/src/assets/images/service_floral_decor_1795278181542.jpg',
    icon: Sofa,
    slug: 'location-mobilier-equipement',
  },
];

const WHY_PILLARS = [
  {
    num: '01.',
    title: 'Organisation professionnelle',
    desc: 'Méthodologie rigoureuse, rétroplanning détaillé et interlocuteur unique du premier échange jusqu’au démontage.',
  },
  {
    num: '02.',
    title: 'Prestataires de qualité',
    desc: 'Réseau sélectif de traiteurs, fleuristes, techniciens et lieux vérifiés sur le Grand Casablanca.',
  },
  {
    num: '03.',
    title: 'Solutions personnalisées',
    desc: 'Chaque événement est conçu autour de vos envies, de votre nombre d’invités et de votre identité.',
  },
  {
    num: '04.',
    title: 'Accompagnement de A à Z',
    desc: 'Repérages, gestion des confirmations, régie technique et coordination sur place le jour de votre réception.',
  },
  {
    num: '05.',
    title: 'Transparence des devis',
    desc: 'Devis structurés poste par poste en dirhams marocains (MAD), sans frais cachés ni mauvaises surprises.',
  },
  {
    num: '06.',
    title: 'Expertise locale à Casablanca',
    desc: 'Maîtrise des lieux, accès et logistique entre Anfa, Ain Diab, Dar Bouazza, Bouskoura et Mohammedia.',
  },
];

export const HomePage: React.FC = () => {
  const { lang } = useApp();

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#181715] text-[#FAF8F5]">
        <div className="relative min-h-[580px] lg:min-h-[680px] flex items-end">
          <div className="absolute inset-0">
            <SafeImage
              src="/src/assets/images/hero_casablanca_event_1795278178624.jpg"
              alt="Réception de prestige organisée par EVENT PRO sur une terrasse à Casablanca"
              loading="eager"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181715]/90 via-[#181715]/55 to-[#181715]/25" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-14 pt-28 sm:px-6 lg:px-8 lg:pb-20">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-[0.14em] text-[#D6BC88] uppercase">
                Casablanca · Maroc — Événements Privés &amp; Corporate
              </p>
              <TextReveal
                as="h1"
                tone="light"
                immediate
                text={
                  lang === 'ar'
                    ? 'نمنح الحياة لأجمل مناسباتكم في الدار البيضاء.'
                    : 'Donnez vie à vos plus beaux événements.'
                }
                className="mt-4 font-serif font-semibold leading-[1.08] tracking-tight text-[#FAF8F5]"
                style={{ fontSize: 'clamp(2.25rem, 4.3vw, 3.85rem)' }}
              />
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#E7E1D8] sm:text-lg">
                {lang === 'ar'
                  ? 'ترافقكم EVENT PRO في تصميم وتنظيم وتنفيذ حفلاتكم وفعالياتكم بالدار البيضاء بدقة واهتمام بأدق التفاصيل.'
                  : "EVENT PRO vous accompagne dans la conception, l'organisation et la réalisation de vos événements à Casablanca. Chaque détail compte, chaque moment devient mémorable."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/reserver"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#9A7B3E] px-6 py-3 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
                >
                  <span>Organiser mon événement</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-md border border-[#FAF8F5]/45 bg-[#181715]/40 px-6 py-3 text-sm font-medium text-[#FAF8F5] backdrop-blur-xs transition-colors hover:border-[#FAF8F5] hover:bg-[#181715]/70 whitespace-nowrap shrink-0"
                >
                  Découvrir nos services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Event Categories */}
      <section id="evenements" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
              Univers événementiels
            </p>
            <TextReveal
              as="h2"
              text="Des réceptions pensées pour chaque occasion"
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
          </div>
          <Link
            to="/devis"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#181715] underline decoration-[#9A7B3E] underline-offset-4 hover:text-[#7D622F] whitespace-nowrap shrink-0"
          >
            <span>Demander un devis personnalisé</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_CATEGORIES.map((cat) => (
            <article
              key={cat.title}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#E5E0D8] bg-white transition-colors hover:border-[#C5B9A5]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F2EFE9]">
                <SafeImage
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#181715]">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5C564E]">{cat.desc}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#F0ECE4]">
                  <Link
                    to={`/reserver?type=${encodeURIComponent(cat.typeParam)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9A7B3E] hover:text-[#7D622F]"
                  >
                    <span>Découvrir</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2b. Explore by Experience */}
      <ExploreExperienceSection />

      {/* 3. Our Services Section */}
      <section className="border-y border-[#E5E0D8] bg-[#F2EFE9]/60 py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
                Savoir-faire &amp; Prestations
              </p>
              <TextReveal
                as="h2"
                text="Nos services sur mesure"
                className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
              />
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-md border border-[#181715] px-4 py-2 text-sm font-medium text-[#181715] transition-colors hover:bg-[#181715] hover:text-[#FAF8F5] whitespace-nowrap shrink-0"
            >
              <span>Voir tous nos services</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <article
                  key={svc.title}
                  className="flex flex-col overflow-hidden rounded-lg border border-[#E5E0D8] bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#E9E4DA]">
                    <SafeImage
                      src={svc.image}
                      alt={svc.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2 text-[#9A7B3E]">
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        <span className="text-xs font-medium">Prestation EVENT PRO</span>
                      </div>
                      <h3 className="mt-2 font-serif text-xl font-semibold text-[#181715]">
                        {svc.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#5C564E]">{svc.desc}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[#F0ECE4] pt-3.5 text-xs font-medium">
                      <Link
                        to={`/services#${svc.slug}`}
                        className="text-[#181715] hover:text-[#9A7B3E]"
                      >
                        En savoir plus
                      </Link>
                      <Link
                        to={`/devis?service=${encodeURIComponent(svc.title)}`}
                        className="text-[#9A7B3E] hover:text-[#7D622F]"
                      >
                        Demander un devis
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3b. Horizontal Reception Venues Carousel */}
      <VenuesCarouselSection />

      {/* 3c. Discover Casablanca Interactive Neighborhood Map */}
      <DiscoverCasablancaSection />

      {/* 4. Why Choose EVENT PRO */}
      <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
              Engagements
            </p>
            <TextReveal
              as="h2"
              text="Pourquoi choisir EVENT PRO ?"
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
            <p className="mt-4 text-sm leading-relaxed text-[#5C564E]">
              Vos événements, notre expertise. Vos moments, notre passion. Nous réunissons maîtrise
              logistique et sens du détail pour des réceptions sereines à Casablanca.
            </p>
            <div className="mt-6">
              <WhatsAppButton
                label="Discuter de mon événement"
                message="Bonjour EVENT PRO, je souhaite discuter de l'organisation de mon événement à Casablanca."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
            {WHY_PILLARS.map((item) => (
              <div
                key={item.num}
                className="rounded-lg border border-[#E5E0D8] bg-white p-6"
              >
                <span className="font-mono text-xs font-medium text-[#9A7B3E]">{item.num}</span>
                <h3 className="mt-2 font-serif text-xl font-semibold text-[#181715]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5C564E]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Masonry Gallery */}
      <MasonryGallerySection />

      {/* 5b. Interactive Before & After Venue Transformation Gallery */}
      <BeforeAfterSection />

      {/* 6. Animated Event Timeline */}
      <EventTimelineSection />

      {/* 6b. Premium Black & White Animated Statistics */}
      <StatsCounterSection />

      {/* 7. Client Love Stories */}
      <ClientLoveStoriesSection />

      {/* 7b. Exclusive Offers */}
      <ExclusiveOffersSection />

      {/* 8. Final Call to Action */}
      <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 rounded-xl border border-[#E5E0D8] bg-white p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <TextReveal
              as="h2"
              text="Vous avez un projet ? Nous sommes prêts à le réaliser."
              className="font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
            <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
              Planifiez votre événement en ligne en quelques étapes ou échangez directement avec
              notre équipe basée à Casablanca.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/reserver"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#9A7B3E] px-6 py-3 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
            >
              <span>Parlons de votre événement</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <WhatsAppButton
              label="Demander un devis via WhatsApp"
              message="Bonjour EVENT PRO, je souhaite obtenir un devis pour mon événement à Casablanca."
              variant="subtle"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

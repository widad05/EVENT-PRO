import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TextReveal } from '../components/TextReveal';

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      {/* Intro */}
      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
            À propos d’EVENT PRO
          </p>
          <TextReveal
            as="h1"
            immediate
            text="Une agence dédiée à l’art de recevoir à Casablanca"
            className="mt-3 font-serif text-4xl font-semibold text-[#181715] sm:text-5xl"
          />
          <p className="mt-5 text-base leading-relaxed text-[#4A453E]">
            EVENT PRO est une agence professionnelle spécialisée dans la conception, la
            planification et la coordination d’événements privés et d’entreprise à Casablanca et
            dans sa région.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#5C564E]">
            [Texte de présentation personnalisable depuis l’administration] — Notre maison a été
            fondée avec la conviction qu’un événement réussi repose autant sur la sensibilité
            esthétique que sur une organisation logistique rigoureuse.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E5E0D8] lg:col-span-6">
          <SafeImage
            src="/src/assets/images/service_floral_decor_1795278181542.jpg"
            alt="Scénographie florale et table de réception EVENT PRO à Casablanca"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="mt-16 grid grid-cols-1 gap-6 border-t border-[#E5E0D8] pt-14 md:grid-cols-3">
        <div className="rounded-lg border border-[#E5E0D8] bg-white p-6">
          <span className="font-mono text-xs text-[#9A7B3E]">01.</span>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[#181715]">Notre mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
            Offrir aux familles, particuliers et entreprises un accompagnement fluide, créatif et
            fiable pour transformer chaque projet en une réception mémorable et maîtrisée.
          </p>
        </div>

        <div className="rounded-lg border border-[#E5E0D8] bg-white p-6">
          <span className="font-mono text-xs text-[#9A7B3E]">02.</span>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[#181715]">Notre vision</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
            Allier l’hospitalité marocaine authentique aux exigences contemporaines de scénographie,
            de ponctualité et de transparence budgétaire.
          </p>
        </div>

        <div className="rounded-lg border border-[#E5E0D8] bg-white p-6">
          <span className="font-mono text-xs text-[#9A7B3E]">03.</span>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[#181715]">Nos valeurs</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
            Écoute attentive, exigence de qualité, respect des engagements, discrétion et clarté des
            devis à chaque étape de la préparation.
          </p>
        </div>
      </div>

      {/* Team, Expertise & Quality */}
      <div className="mt-14 grid grid-cols-1 gap-8 rounded-lg border border-[#E5E0D8] bg-white p-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#181715]">
            Notre équipe &amp; notre approche
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
            Notre équipe réunit des chefs de projet événementiel, coordinateurs de terrain et
            directeurs artistiques travaillant main dans la main avec un réseau sélectionné de
            partenaires à Casablanca (traiteurs, maîtres fleuristes, régisseurs son et lumière,
            photographes et propriétaires de domaines).
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
            Nous privilégions un nombre maîtrisé de projets par mois afin de garantir à chaque
            client une disponibilité réelle et une présence dédiée le jour J.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#181715]">
            Notre engagement qualité
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
            Chaque projet débute par une phase d’écoute et d’analyse technique du lieu, suivie d’une
            proposition budgétaire détaillée en dirhams marocains (MAD) et d’un conducteur précis
            validé avec vous avant le jour de la réception.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/reserver"
              className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-5 py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#7D622F]"
            >
              <span>Organiser mon événement</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <WhatsAppButton
              label="Échanger avec notre équipe"
              message="Bonjour EVENT PRO, je souhaite en savoir plus sur votre accompagnement à Casablanca."
              variant="subtle"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

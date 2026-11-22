import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => (
  <div className="mx-auto max-w-[820px] px-4 py-14 sm:px-6">
    <h1 className="font-serif text-4xl font-semibold text-[#181715]">
      Politique de confidentialité
    </h1>
    <p className="mt-2 text-xs text-[#6B655C]">
      EVENT PRO — Casablanca, Maroc · Protection des données personnelles
    </p>
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#4A453E]">
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          1. Collecte des données
        </h2>
        <p className="mt-2">
          Dans le cadre de ses services d’organisation d’événements, EVENT PRO collecte uniquement
          les informations nécessaires au traitement de vos demandes de réservation, de devis et de
          contact (nom, adresse email, numéro de téléphone, numéro WhatsApp et détails de
          l’événement).
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          2. Cadre marocain (Loi 09-08)
        </h2>
        <p className="mt-2">
          Le traitement des données à caractère personnel s’inscrit dans le respect des principes
          prévus par la loi marocaine n° 09-08 relative à la protection des personnes physiques à
          l’égard du traitement des données à caractère personnel et des obligations applicables
          auprès de la CNDP. Les formalités déclaratives ou d’autorisation spécifiques doivent être
          complétées par l’exploitant avant toute mise en production commerciale.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          3. Sécurité &amp; Conservation
        </h2>
        <p className="mt-2">
          Les données sont stockées sur une infrastructure sécurisée avec chiffrement des mots de
          passe et contrôle d’accès strict. Aucune donnée personnelle n’est vendue ni cédée à des
          tiers à des fins publicitaires.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          4. Vos droits
        </h2>
        <p className="mt-2">
          Conformément à la réglementation applicable, vous disposez d’un droit d’accès, de
          rectification et de suppression de vos données en nous écrivant via la page Contact.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          5. Services cartographiques (Google Maps)
        </h2>
        <p className="mt-2">
          La carte interactive Discover Casablanca intègre des fonctionnalités de Google Maps
          Platform, soumises aux règles de confidentialité de Google (
          <a
            href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#181715]"
          >
            Google Privacy Policy
          </a>
          ).
        </p>
      </section>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="mx-auto max-w-[820px] px-4 py-14 sm:px-6">
    <h1 className="font-serif text-4xl font-semibold text-[#181715]">
      Conditions générales d’utilisation et de réservation
    </h1>
    <p className="mt-2 text-xs text-[#6B655C]">EVENT PRO — Casablanca, Maroc</p>
    <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#4A453E]">
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          1. Nature des demandes en ligne
        </h2>
        <p className="mt-2">
          Toute demande soumise via le formulaire de réservation ou le formulaire de devis constitue
          une prise de contact et une demande d’étude. Elle ne vaut pas confirmation automatique de
          disponibilité ni engagement contractuel définitif avant validation écrite et versement de
          l’acompte convenu.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          2. Devise &amp; Tarification
        </h2>
        <p className="mt-2">
          Les devis et prestations proposés par EVENT PRO sont exprimés en dirhams marocains (MAD).
          Les éventuels montants affichés à titre indicatif peuvent varier selon la saison, le lieu
          choisi à Casablanca et le nombre effectif de convives.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          3. Modification et annulation
        </h2>
        <p className="mt-2">
          Les modalités de report, d’ajustement d’effectif et d’annulation sont précisées sur
          chaque devis contractuel accepté par le client.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl font-semibold text-[#181715]">
          4. Cartographie interactive
        </h2>
        <p className="mt-2">
          L’utilisation des fonctionnalités cartographiques intégrées sur la plateforme est soumise
          aux{' '}
          <a
            href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#181715]"
          >
            conditions d’utilisation supplémentaires de Google Maps
          </a>
          .
        </p>
      </section>
    </div>
  </div>
);

export const NotFoundPage: React.FC = () => (
  <div className="mx-auto flex max-w-[640px] flex-col items-center px-4 py-24 text-center">
    <p className="font-mono text-xs text-[#9A7B3E]">ERREUR 404</p>
    <h1 className="mt-2 font-serif text-4xl font-semibold text-[#181715]">
      Page introuvable
    </h1>
    <p className="mt-3 text-sm text-[#5C564E]">
      La page que vous recherchez n’existe pas ou a été déplacée.
    </p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#181715] px-5 py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#2F2C27]"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Retour à l’accueil</span>
    </Link>
  </div>
);

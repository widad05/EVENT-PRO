import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TextReveal } from '../components/TextReveal';

const EVENT_TYPES = [
  'Mariage',
  'Fiançailles',
  'Cérémonie marocaine (Henné / Baptême)',
  'Anniversaire',
  'Événement professionnel / Séminaire',
  'Conférence / Gala',
  'Team building',
  'Baby shower / Remise de diplôme',
  'Fête privée',
];

const SERVICE_OPTIONS: { name: string; options: string[] }[] = [
  { name: 'Décoration', options: ['Arche florale', 'Scénographie tables', 'Salon traditionnel'] },
  { name: 'Traiteur', options: ['Dîner assis', 'Cocktail dînatoire', 'Buffet marocain'] },
  { name: 'Photographie', options: ['Reportage journée', 'Double photographe', 'Album lin'] },
  { name: 'Vidéographie', options: ['Film long', 'Teaser court', 'Drone autorisé'] },
  { name: 'DJ', options: ['DJ généraliste & oriental', 'Set lounge cocktail'] },
  { name: 'Sonorisation', options: ['Système conférence', 'Façade soirée dansante'] },
  { name: 'Éclairage', options: ['Éclairage architectural', 'Guirlandes jardin', 'Bougies'] },
  { name: 'Lieu / Salle', options: ['Villa Anfa / Dar Bouazza', 'Domaine Bouskoura', 'Hôtel / Rooftop'] },
  { name: 'Mobilier', options: ['Tables & chaises design', 'Salons lounge', 'Tente caïdale'] },
  { name: 'Fleurs', options: ['Roses blanches & feuillage', 'Compositions saisonnières'] },
  { name: 'Animation', options: ['Issawa / Dakka', 'Orchestre acoustique', 'Photobooth'] },
  { name: 'Autre', options: ['Accueil hôtesses', 'Voiturier & sécurité'] },
];

const BUDGET_RANGES = [
  'Moins de 5 000 MAD',
  '5 000 à 10 000 MAD',
  '10 000 à 20 000 MAD',
  '20 000 à 50 000 MAD',
  'Plus de 50 000 MAD',
  'Budget personnalisé',
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'Mariage';

  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState(initialType);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('19:00');
  const [eventLocation, setEventLocation] = useState('Casablanca');
  const [venueChoice, setVenueChoice] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [eventDuration, setEventDuration] = useState('Soirée complète');

  const [selectedServices, setSelectedServices] = useState<
    Record<string, { selected: boolean; options: string[] }>
  >({});

  const [estimatedBudget, setEstimatedBudget] = useState('20 000 à 50 000 MAD');
  const [preferredStyle, setPreferredStyle] = useState('');
  const [colorTheme, setColorTheme] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'telephone' | 'email'>(
    'whatsapp'
  );

  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    referenceCode: string;
    message: string;
  } | null>(null);

  const toggleService = (name: string) => {
    setSelectedServices((prev) => {
      const curr = prev[name];
      return {
        ...prev,
        [name]: { selected: !curr?.selected, options: curr?.options || [] },
      };
    });
  };

  const toggleServiceOption = (serviceName: string, opt: string) => {
    setSelectedServices((prev) => {
      const curr = prev[serviceName] || { selected: true, options: [] };
      const exists = curr.options.includes(opt);
      return {
        ...prev,
        [serviceName]: {
          selected: true,
          options: exists ? curr.options.filter((o) => o !== opt) : [...curr.options, opt],
        },
      };
    });
  };

  const activeServicesList = Object.entries(selectedServices)
    .filter(([, val]) => val.selected)
    .map(([name, val]) => ({ name, options: val.options }));

  const validateStep = (currentStep: number): string => {
    if (currentStep === 1) {
      if (!eventType || !eventTitle.trim() || !eventDate || !eventLocation.trim()) {
        return "Veuillez compléter le type, le titre, la date et le lieu de l'événement.";
      }
      if (guestCount < 1) return 'Le nombre d’invités doit être supérieur à 0.';
    }
    if (currentStep === 2) {
      if (activeServicesList.length === 0) {
        return 'Sélectionnez au moins un pôle de prestation pour poursuivre.';
      }
    }
    if (currentStep === 3) {
      if (!estimatedBudget) return 'Veuillez sélectionner une tranche budgétaire.';
    }
    if (currentStep === 4) {
      if (!fullName.trim() || !email.includes('@') || phone.trim().length < 8) {
        return 'Veuillez renseigner votre nom, un email valide et un téléphone marocain (+212 ou 06/07/05).';
      }
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ referenceCode: string; message: string }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          eventType,
          eventTitle,
          eventDate,
          preferredTime,
          eventLocation,
          venueChoice,
          guestCount,
          eventDuration,
          selectedServices: activeServicesList,
          estimatedBudget,
          preferredStyle,
          colorTheme,
          specialRequirements,
          additionalNotes,
          fullName,
          email,
          phone,
          whatsapp: whatsapp || phone,
          preferredContact,
          turnstileToken,
        }),
      });
      setConfirmation(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi de votre demande.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-[#E5E0D8] bg-white p-8 sm:p-10">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="h-7 w-7 shrink-0" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Demande enregistrée
            </span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold text-[#181715]">
            Merci {fullName}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#4A453E]">{confirmation.message}</p>

          <div className="mt-6 rounded-md border border-[#E5E0D8] bg-[#FAF8F5] p-5">
            <p className="text-xs text-[#6B655C]">Numéro de référence de votre demande</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[#9A7B3E] tabular-nums">
              {confirmation.referenceCode}
            </p>
            <p className="mt-2 text-xs text-[#6B655C]">
              Statut actuel : Nouvelle demande (en attente de validation par notre équipe).
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <WhatsAppButton
              label="Confirmer les détails sur WhatsApp"
              message={`Bonjour EVENT PRO, je viens d'envoyer la demande de réservation ${confirmation.referenceCode} (${eventTitle} le ${eventDate}).`}
              variant="primary"
            />
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-[#D9D2C5] px-5 py-2.5 text-sm font-medium text-[#181715] hover:border-[#9A7B3E]"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const STEP_LABELS = [
    '1. Événement',
    '2. Prestations',
    '3. Budget & Style',
    '4. Coordonnées',
    '5. Confirmation',
  ];

  return (
    <div className="mx-auto max-w-[960px] px-4 py-14 sm:px-6 lg:px-8">
      <header className="border-b border-[#E5E0D8] pb-7">
        <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
          Réservation &amp; Planification · Casablanca
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Organiser mon événement"
          className="mt-2 font-serif text-4xl font-semibold text-[#181715]"
        />
        <p className="mt-2 text-sm text-[#5C564E]">
          Complétez ces 5 étapes pour nous permettre de préparer votre étude personnalisée.
        </p>
      </header>

      {/* Progress Steps */}
      <nav aria-label="Étapes de réservation" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STEP_LABELS.map((label, idx) => {
          const num = idx + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div
              key={label}
              className={`rounded-md border px-3 py-2.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-[#9A7B3E] bg-[#181715] text-[#FAF8F5]'
                  : done
                    ? 'border-[#9A7B3E]/40 bg-[#F2EFE9] text-[#181715]'
                    : 'border-[#E5E0D8] bg-white text-[#6B655C]'
              }`}
            >
              {label}
            </div>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-[#E5E0D8] bg-white p-6 sm:p-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">
              Informations sur l’événement
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#181715]">Type d’événement *</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Titre ou intitulé du projet *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ex. Mariage Salma & Karim, Séminaire annuel..."
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Date souhaitée *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Heure de début</label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Ville / Quartier *
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Anfa, Ain Diab, Bouskoura, Dar Bouazza..."
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Lieu ou salle envisagée (si connu)
                </label>
                <input
                  type="text"
                  value={venueChoice}
                  onChange={(e) => setVenueChoice(e.target.value)}
                  placeholder="À rechercher avec EVENT PRO, Villa privée..."
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Nombre d’invités estimé *
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Durée estimée</label>
                <select
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                >
                  <option value="Demi-journée (4h)">Demi-journée (4h)</option>
                  <option value="Journée complète">Journée complète</option>
                  <option value="Soirée complète">Soirée complète</option>
                  <option value="Plusieurs jours (ex. Henné + Mariage)">
                    Plusieurs jours (ex. Henné + Mariage)
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">
              Sélection des prestations
            </h2>
            <p className="mt-1 text-sm text-[#5C564E]">
              Cochez les services souhaités et précisez vos options éventuelles.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SERVICE_OPTIONS.map((svc) => {
                const state = selectedServices[svc.name];
                const isSelected = Boolean(state?.selected);
                return (
                  <div
                    key={svc.name}
                    className={`rounded-md border p-4 transition-colors ${
                      isSelected
                        ? 'border-[#9A7B3E] bg-[#FAF8F5]'
                        : 'border-[#E5E0D8] bg-white'
                    }`}
                  >
                    <label className="flex cursor-pointer items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#181715]">{svc.name}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(svc.name)}
                        className="h-4 w-4 accent-[#9A7B3E]"
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {svc.options.map((opt) => {
                        const optChecked = state?.options.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleServiceOption(svc.name, opt)}
                            className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                              optChecked
                                ? 'border-[#9A7B3E] bg-[#9A7B3E] text-white'
                                : 'border-[#D9D2C5] bg-white text-[#5C564E] hover:border-[#9A7B3E]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">
              Budget &amp; Personnalisation
            </h2>

            <div>
              <label className="block text-xs font-medium text-[#181715]">
                Budget global estimé (en MAD) *
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setEstimatedBudget(range)}
                    className={`rounded-md border px-4 py-3 text-left text-xs font-medium transition-colors tabular-nums ${
                      estimatedBudget === range
                        ? 'border-[#9A7B3E] bg-[#181715] text-[#FAF8F5]'
                        : 'border-[#D9D2C5] bg-[#FAF8F5] text-[#181715] hover:border-[#9A7B3E]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#181715]">Style souhaité</label>
                <input
                  type="text"
                  value={preferredStyle}
                  onChange={(e) => setPreferredStyle(e.target.value)}
                  placeholder="Minimaliste chic, traditionnel marocain, bohème..."
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Palette de couleurs</label>
                <input
                  type="text"
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  placeholder="Ivoire & or, blanc & olive, sable..."
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181715]">
                Exigences particulières
              </label>
              <textarea
                rows={3}
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Régimes alimentaires, accès PMR, horaires précis, équipements techniques..."
                className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181715]">Notes complémentaires</label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Toute information utile pour notre équipe..."
                className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">Vos coordonnées</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#181715]">Nom complet *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nom et prénom"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Adresse email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.ma"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Téléphone (+212) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Numéro WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181715]">
                Canal de contact privilégié
              </label>
              <div className="mt-2 flex flex-wrap gap-3">
                {(
                  [
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'telephone', label: 'Téléphone' },
                    { id: 'email', label: 'Email' },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setPreferredContact(ch.id)}
                    className={`rounded-md border px-4 py-2 text-xs font-medium ${
                      preferredContact === ch.id
                        ? 'border-[#9A7B3E] bg-[#181715] text-[#FAF8F5]'
                        : 'border-[#D9D2C5] bg-[#FAF8F5] text-[#181715]'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">
              Récapitulatif de votre demande
            </h2>

            <div className="grid grid-cols-1 gap-6 rounded-md border border-[#E5E0D8] bg-[#FAF8F5] p-5 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-semibold text-[#9A7B3E] uppercase">Événement</p>
                <p className="mt-1 font-semibold text-[#181715]">{eventTitle}</p>
                <p className="text-[#5C564E]">
                  {eventType} · {guestCount} invités
                </p>
                <p className="text-[#5C564E] tabular-nums">
                  Le {eventDate} à {preferredTime || '—'} ({eventDuration})
                </p>
                <p className="text-[#5C564E]">
                  {eventLocation} {venueChoice ? `· ${venueChoice}` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9A7B3E] uppercase">
                  Budget &amp; Coordonnées
                </p>
                <p className="mt-1 font-semibold text-[#181715] tabular-nums">
                  {estimatedBudget}
                </p>
                <p className="text-[#5C564E]">
                  {fullName} · {phone}
                </p>
                <p className="text-[#5C564E]">{email}</p>
                <p className="text-[#5C564E]">Contact préféré : {preferredContact}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#9A7B3E] uppercase">
                Prestations sélectionnées ({activeServicesList.length})
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[#181715]">
                {activeServicesList.map((s) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#9A7B3E]" />
                    <span className="font-medium">{s.name}</span>
                    {s.options.length > 0 && (
                      <span className="text-xs text-[#6B655C]">({s.options.join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <TurnstileWidget onVerify={setTurnstileToken} />

            <p className="text-xs text-[#6B655C]">
              Note : cette soumission constitue une demande de réservation sans engagement immédiat
              et ne vaut pas confirmation automatique de disponibilité.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-[#E5E0D8] pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep((s) => s - 1);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-[#D9D2C5] px-4 py-2.5 text-sm font-medium text-[#181715] hover:border-[#9A7B3E]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Étape précédente</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-6 py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#7D622F]"
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-md bg-[#181715] px-6 py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#2F2C27] disabled:opacity-60"
            >
              <span>{submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}</span>
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TextReveal } from '../components/TextReveal';

const SERVICES_CHECKLIST = [
  'Organisation complète',
  'Décoration & Art floral',
  'Traiteur & Buffet',
  'Location de salle',
  'Photographie',
  'Vidéographie',
  'Sonorisation & Éclairage',
  'DJ & Animation',
  'Mobilier & Équipement',
];

const BUDGET_RANGES = [
  'Moins de 5 000 MAD',
  '5 000 à 10 000 MAD',
  '10 000 à 20 000 MAD',
  '20 000 à 50 000 MAD',
  'Plus de 50 000 MAD',
  'Budget personnalisé',
];

export const QuotePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service');

  const [eventType, setEventType] = useState('Mariage');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('Casablanca');
  const [guestCount, setGuestCount] = useState(120);
  const [requestedServices, setRequestedServices] = useState<string[]>(
    initialService ? [initialService] : ['Organisation complète']
  );
  const [budgetRange, setBudgetRange] = useState('20 000 à 50 000 MAD');
  const [details, setDetails] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  const toggleService = (name: string) => {
    setRequestedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientName.trim() || !clientEmail.includes('@') || clientPhone.trim().length < 8) {
      setError('Veuillez renseigner un nom, un email valide et un téléphone marocain.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ referenceCode: string }>('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          eventType,
          eventDate,
          eventLocation,
          guestCount,
          requestedServices,
          budgetRange,
          details,
          clientName,
          clientEmail,
          clientPhone,
          turnstileToken,
        }),
      });
      setReferenceCode(res.referenceCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du devis.');
    } finally {
      setSubmitting(false);
    }
  };

  if (referenceCode) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-[#E5E0D8] bg-white p-8">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Demande de devis enregistrée
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#181715]">
            Votre demande est en cours d’étude
          </h1>
          <p className="mt-2 text-sm text-[#5C564E]">
            Notre équipe vous transmettra un devis détaillé en dirhams marocains (MAD) dans les
            plus brefs délais.
          </p>
          <div className="mt-5 rounded-md border border-[#E5E0D8] bg-[#FAF8F5] p-4">
            <p className="text-xs text-[#6B655C]">Référence devis</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[#9A7B3E] tabular-nums">
              {referenceCode}
            </p>
          </div>
          <div className="mt-6">
            <WhatsAppButton
              label="Suivre mon devis via WhatsApp"
              message={`Bonjour EVENT PRO, je viens de soumettre la demande de devis ${referenceCode} pour ${eventType} à ${eventLocation}.`}
              variant="primary"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl border-b border-[#E5E0D8] pb-7">
        <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
          Devis personnalisé · MAD
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Demander un devis sur mesure"
          className="mt-2 font-serif text-4xl font-semibold text-[#181715]"
        />
        <p className="mt-3 text-sm text-[#5C564E]">
          Recevez une estimation claire poste par poste en dirhams marocains (MAD) adaptée à
          votre réception à Casablanca.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-lg border border-[#E5E0D8] bg-white p-6 sm:p-8"
      >
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#181715]">Type d’événement *</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
            >
              <option value="Mariage">Mariage</option>
              <option value="Fiançailles">Fiançailles</option>
              <option value="Cérémonie marocaine">Cérémonie marocaine</option>
              <option value="Anniversaire">Anniversaire</option>
              <option value="Événement professionnel">Événement professionnel</option>
              <option value="Fête privée">Fête privée</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181715]">Date envisagée</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181715]">Lieu / Ville *</label>
            <input
              type="text"
              required
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181715]">Nombre d’invités *</label>
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#181715]">
            Prestations souhaitées
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {SERVICES_CHECKLIST.map((svc) => {
              const checked = requestedServices.includes(svc);
              return (
                <label
                  key={svc}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${
                    checked
                      ? 'border-[#9A7B3E] bg-[#FAF8F5] text-[#181715]'
                      : 'border-[#E5E0D8] bg-white text-[#5C564E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(svc)}
                    className="h-3.5 w-3.5 accent-[#9A7B3E]"
                  />
                  <span>{svc}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#181715]">Budget indicatif (MAD)</label>
          <select
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#181715]">
            Détails &amp; attentes
          </label>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Décrivez l'ambiance recherchée, les spécificités logistiques, le type de menu..."
            className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 border-t border-[#F0ECE4] pt-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-[#181715]">Nom complet *</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Email *</label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Téléphone (+212) *</label>
            <input
              type="tel"
              required
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+212 6 00 00 00 00"
              className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <TurnstileWidget onVerify={setTurnstileToken} />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-[#9A7B3E] px-6 py-3 text-sm font-medium text-[#FAF8F5] hover:bg-[#7D622F] disabled:opacity-60"
          >
            {submitting ? 'Envoi en cours...' : 'Envoyer ma demande de devis'}
          </button>
          <WhatsAppButton
            label="Demander un devis via WhatsApp"
            message={`Bonjour EVENT PRO, je souhaite demander un devis pour : ${eventType} (${guestCount} invités à ${eventLocation}).`}
            variant="subtle"
          />
        </div>
      </form>
    </div>
  );
};

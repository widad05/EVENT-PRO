import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TextReveal } from '../components/TextReveal';

export const ContactPage: React.FC = () => {
  const { settings } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !subject.trim() || message.trim().length < 10) {
      setError('Veuillez remplir tous les champs obligatoires (message min. 10 caractères).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, subject, message, turnstileToken }),
      });
      setSuccess(res.message);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer votre message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl border-b border-[#E5E0D8] pb-8">
        <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
          Contact · Casablanca, Maroc
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Parlons de votre prochain événement"
          className="mt-2 font-serif text-4xl font-semibold text-[#181715] sm:text-5xl"
        />
        <p className="mt-4 text-base leading-relaxed text-[#5C564E]">
          Notre équipe vous reçoit sur rendez-vous à Casablanca ou répond à vos demandes par
          téléphone, WhatsApp et email.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Direct Coordinates & Map Placeholder */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-lg border border-[#E5E0D8] bg-white p-6">
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">Coordonnées</h2>
            <ul className="mt-5 space-y-4 text-sm text-[#4A453E]">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7B3E]" />
                <div>
                  <p className="font-medium text-[#181715]">Zone d’intervention</p>
                  <p>{settings.address_fr}</p>
                  <p className="mt-0.5 text-xs text-[#6B655C]">{settings.service_area_fr}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7B3E]" />
                <div>
                  <p className="font-medium text-[#181715]">Téléphone</p>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="tabular-nums hover:text-[#9A7B3E]"
                  >
                    {settings.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7B3E]" />
                <div>
                  <p className="font-medium text-[#181715]">Email</p>
                  <a href={`mailto:${settings.email}`} className="hover:text-[#9A7B3E]">
                    {settings.email}
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-6 border-t border-[#F0ECE4] pt-5">
              <WhatsAppButton
                label="Contactez-nous sur WhatsApp"
                message="Bonjour EVENT PRO, je souhaite prendre rendez-vous pour un événement à Casablanca."
                variant="primary"
                className="w-full"
              />
            </div>
          </div>

          {/* Google Maps Placeholder Card */}
          <div className="rounded-lg border border-[#E5E0D8] bg-[#F2EFE9] p-6">
            <p className="text-xs font-medium tracking-wider text-[#9A7B3E] uppercase">
              Localisation · Casablanca
            </p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-[#181715]">
              Quartier Racine / Anfa, Casablanca
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#5C564E]">
              Emplacement prêt pour intégration Google Maps interactive avec clé API configurée.
              Déplacements et repérages assurés sur tout le Grand Casablanca.
            </p>
            <div className="mt-4 flex h-40 items-center justify-center rounded border border-[#D9D2C5] bg-white text-center text-xs text-[#6B655C]">
              <div>
                <MapPin className="mx-auto mb-2 h-6 w-6 text-[#9A7B3E]" />
                <p className="font-medium text-[#181715]">Casablanca · Anfa · Corniche · Bouskoura</p>
                <p className="mt-0.5 font-mono text-[11px]">33.5898° N, 7.6038° W</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-[#E5E0D8] bg-white p-6 sm:p-8"
          >
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">
              Envoyer un message
            </h2>
            <p className="mt-1 text-sm text-[#5C564E]">
              Nous répondons sous 24 heures ouvrées (heure de Casablanca).
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <span>{success}</span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#181715]" htmlFor="contact-name">
                  Nom complet *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Nadia El Amrani"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#181715] focus:border-[#9A7B3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#181715]" htmlFor="contact-email">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.ma"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#181715] focus:border-[#9A7B3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#181715]" htmlFor="contact-phone">
                  Téléphone (+212)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#181715] focus:border-[#9A7B3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#181715]" htmlFor="contact-subject">
                  Objet *
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Renseignements, disponibilité..."
                  className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#181715] focus:border-[#9A7B3E] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-medium text-[#181715]" htmlFor="contact-message">
                Votre message *
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre projet, la date envisagée et vos attentes..."
                className="mt-1.5 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#181715] focus:border-[#9A7B3E] focus:outline-none"
              />
            </div>

            <TurnstileWidget onVerify={setTurnstileToken} />

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-md bg-[#9A7B3E] px-6 py-3 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] disabled:opacity-60"
              >
                {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

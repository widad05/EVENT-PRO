import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, FileText, LogOut, User } from 'lucide-react';
import { apiFetch, formatDateFr, formatMad } from '../lib/api';
import { useApp } from '../context/AppContext';
import { WhatsAppButton } from '../components/WhatsAppButton';
import type {
  AuthUser,
  BookingRecord,
  ClientNotification,
  QuoteRecord,
} from '../types';

export const ClientDashboardPage: React.FC = () => {
  const { user, setSession, logout } = useApp();
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'recover'>('login');

  // Auth form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard data
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileSaved, setProfileSaved] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  const loadClientOverview = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await apiFetch<{
        profile: { full_name: string; phone: string; whatsapp: string };
        bookings: BookingRecord[];
        quotes: QuoteRecord[];
        notifications: ClientNotification[];
      }>('/api/client/overview');
      setBookings(data.bookings || []);
      setQuotes(data.quotes || []);
      setNotifications(data.notifications || []);
      if (data.profile) {
        setProfileName(data.profile.full_name || '');
        setProfilePhone(data.profile.phone || '');
        setProfileWhatsapp(data.profile.whatsapp || '');
      }
    } catch {
      // ignore if session expired
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadClientOverview();
    }
  }, [user, loadClientOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(res.token, res.user);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      setSession(res.token, res.user);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Inscription impossible.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/recover', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setAuthSuccess(res.message);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Demande impossible.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved('');
    try {
      await apiFetch('/api/client/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: profileName,
          phone: profilePhone,
          whatsapp: profileWhatsapp,
        }),
      });
      setProfileSaved('Profil mis à jour.');
    } catch {
      setProfileSaved('Erreur lors de la mise à jour.');
    }
  };

  const markNotificationsRead = async () => {
    await apiFetch('/api/client/notifications/read', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-[520px] px-4 py-14 sm:px-6">
        <div className="rounded-lg border border-[#E5E0D8] bg-white p-6 sm:p-8">
          <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
            Espace Client EVENT PRO
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#181715]">
            Suivez vos événements &amp; devis
          </h1>

          <div className="mt-6 flex gap-1 rounded-md bg-[#F2EFE9] p-1">
            {(
              [
                { id: 'login', label: 'Connexion' },
                { id: 'register', label: 'Créer un compte' },
                { id: 'recover', label: 'Mot de passe oublié' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setAuthTab(tab.id);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 rounded py-2 text-xs font-medium transition-colors ${
                  authTab === tab.id
                    ? 'bg-white text-[#181715] shadow-xs'
                    : 'text-[#5C564E] hover:text-[#181715]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {authError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              {authSuccess}
            </div>
          )}

          {authTab === 'login' && (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#181715]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-md bg-[#9A7B3E] py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#7D622F]"
              >
                {authLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {authTab === 'register' && (
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#181715]">Nom complet</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Téléphone (+212)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Mot de passe (8 caractères min.)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-md bg-[#9A7B3E] py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#7D622F]"
              >
                {authLoading ? 'Création...' : 'Créer mon espace client'}
              </button>
            </form>
          )}

          {authTab === 'recover' && (
            <form onSubmit={handleRecover} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Adresse email associée au compte
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-md bg-[#181715] py-2.5 text-sm font-medium text-[#FAF8F5]"
              >
                Envoyer les instructions
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
            Espace Client
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#181715]">
            Bonjour, {user.fullName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/reserver"
            className="rounded-md bg-[#9A7B3E] px-4 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#7D622F]"
          >
            Nouvelle réservation
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#D9D2C5] px-3.5 py-2 text-xs font-medium text-[#181715] hover:border-[#9A7B3E]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg bg-[#F2EFE9]" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Bookings & Quotes */}
          <div className="space-y-8 lg:col-span-8">
            <section className="rounded-lg border border-[#E5E0D8] bg-white p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#9A7B3E]" />
                <h2 className="font-serif text-2xl font-semibold text-[#181715]">
                  Mes demandes d’événements ({bookings.length})
                </h2>
              </div>

              {bookings.length === 0 ? (
                <div className="mt-4 rounded-md border border-[#F0ECE4] bg-[#FAF8F5] p-6 text-center">
                  <p className="text-sm text-[#5C564E]">
                    Aucune demande de réservation associée à votre compte pour le moment.
                  </p>
                  <Link
                    to="/reserver"
                    className="mt-3 inline-block text-xs font-medium text-[#9A7B3E] underline"
                  >
                    Créer ma première demande
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col justify-between gap-3 rounded-md border border-[#E5E0D8] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-mono text-xs text-[#9A7B3E] tabular-nums">
                          {b.reference_code}
                        </p>
                        <h3 className="mt-0.5 text-sm font-semibold text-[#181715]">
                          {b.event_title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#5C564E]">
                          {b.event_type} · {formatDateFr(b.event_date)} · {b.guest_count} invités ·{' '}
                          {b.event_location}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-xs font-semibold text-[#181715]">
                          Statut : {b.status}
                        </span>
                        <p className="mt-0.5 text-xs text-[#6B655C] tabular-nums">
                          {b.estimated_budget}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[#E5E0D8] bg-white p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#9A7B3E]" />
                <h2 className="font-serif text-2xl font-semibold text-[#181715]">
                  Mes devis ({quotes.length})
                </h2>
              </div>

              {quotes.length === 0 ? (
                <p className="mt-4 text-sm text-[#5C564E]">
                  Aucun devis émis pour l’instant.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {quotes.map((q) => (
                    <div
                      key={q.id}
                      className="flex flex-col justify-between gap-3 rounded-md border border-[#E5E0D8] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-mono text-xs text-[#9A7B3E] tabular-nums">
                          {q.reference_code}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-[#181715]">
                          {q.event_type} — {q.event_location}
                        </p>
                        <p className="text-xs text-[#5C564E]">
                          Statut : {q.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-[#181715] tabular-nums">
                          {q.total_mad > 0 ? formatMad(q.total_mad) : q.budget_range}
                        </p>
                        {q.valid_until && (
                          <p className="text-xs text-[#6B655C]">
                            Valable jusqu’au {formatDateFr(q.valid_until)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Notifications, Profile & Direct Contact */}
          <div className="space-y-6 lg:col-span-4">
            <section className="rounded-lg border border-[#E5E0D8] bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#9A7B3E]" />
                  <h2 className="font-serif text-xl font-semibold text-[#181715]">Notifications</h2>
                </div>
                {notifications.some((n) => !n.is_read) && (
                  <button
                    type="button"
                    onClick={markNotificationsRead}
                    className="text-xs text-[#9A7B3E] underline"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#6B655C]">Aucune notification.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded border p-3 text-xs ${
                        n.is_read
                          ? 'border-[#F0ECE4] bg-white text-[#6B655C]'
                          : 'border-[#9A7B3E]/40 bg-[#FAF8F5] text-[#181715]'
                      }`}
                    >
                      <p className="font-semibold">{n.title_fr}</p>
                      <p className="mt-0.5">{n.message_fr}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border border-[#E5E0D8] bg-white p-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#9A7B3E]" />
                <h2 className="font-serif text-xl font-semibold text-[#181715]">Mon profil</h2>
              </div>
              <form onSubmit={handleUpdateProfile} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#181715]">Nom complet</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#181715]">Téléphone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#181715]">WhatsApp</label>
                  <input
                    type="tel"
                    value={profileWhatsapp}
                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-xs"
                  />
                </div>
                {profileSaved && <p className="text-xs text-emerald-700">{profileSaved}</p>}
                <button
                  type="submit"
                  className="w-full rounded-md bg-[#181715] py-2 text-xs font-medium text-[#FAF8F5]"
                >
                  Enregistrer
                </button>
              </form>
              <div className="mt-4 border-t border-[#F0ECE4] pt-4">
                <WhatsAppButton
                  label="Contacter l'équipe EVENT PRO"
                  message={`Bonjour EVENT PRO, je suis ${user.fullName} (${user.email}) et je souhaite échanger sur mon dossier.`}
                  variant="subtle"
                  className="w-full text-xs"
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

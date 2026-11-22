import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarCheck,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
} from 'lucide-react';
import { apiFetch, formatDateFr, formatMad } from '../lib/api';
import { useApp } from '../context/AppContext';
import type {
  AuthUser,
  BookingRecord,
  CompanySettings,
  ContactMessage,
  CustomerRecord,
  GalleryImage,
  QuoteItem,
  QuoteRecord,
  ServiceCategory,
  ServiceItem,
} from '../types';
import { SafeImage } from '../components/SafeImage';
import { QuoteBuilderModal } from '../components/admin/QuoteBuilderModal';

type AdminTab =
  | 'overview'
  | 'bookings'
  | 'quotes'
  | 'services'
  | 'gallery'
  | 'customers'
  | 'messages'
  | 'settings';

const BOOKING_STATUSES = [
  'Nouvelle demande',
  "En cours d'étude",
  'Devis envoyé',
  'Confirmé',
  'Terminé',
  'Annulé',
];

export const AdminDashboardPage: React.FC = () => {
  const { user, setSession, logout, refreshSettings } = useApp();
  const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  const [setupStatus, setSetupStatus] = useState<{
    needsSetup: boolean;
    passcodeConfigured: boolean;
  } | null>(null);
  const [setupEmail, setSetupEmail] = useState('');
  const [setupName, setSetupName] = useState('Direction EVENT PRO');
  const [setupPassword, setSetupPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);

  // Overview
  const [stats, setStats] = useState({
    totalBookings: 0,
    newRequests: 0,
    pendingQuotes: 0,
    confirmedEvents: 0,
    upcomingEvents: 0,
    totalCustomers: 0,
    unreadMessages: 0,
  });
  const [byCategory, setByCategory] = useState<{ event_type: string; count: number }[]>([]);

  // Bookings
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('Tous');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Quotes
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [editingQuote, setEditingQuote] = useState<{
    quote: QuoteRecord | null;
    open: boolean;
  }>({ quote: null, open: false });

  // Services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [newService, setNewService] = useState({
    category_id: 1,
    title_fr: '',
    short_desc_fr: '',
    starting_price_mad: '',
    price_note_fr: 'Tarif sur devis',
  });

  // Gallery
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [newPhoto, setNewPhoto] = useState({
    title_fr: '',
    caption_fr: '',
    category: 'Mariages',
    image_url: '',
    r2_key: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Customers & Messages & Settings
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settingsForm, setSettingsForm] = useState<CompanySettings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState('');

  useEffect(() => {
    apiFetch<{ needsSetup: boolean; passcodeConfigured: boolean }>('/api/auth/admin-status')
      .then(setSetupStatus)
      .catch(() => setSetupStatus({ needsSetup: false, passcodeConfigured: false }));
  }, []);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [ov, bk, qt, sv, gl, cu, ms, st] = await Promise.all([
        apiFetch<{
          stats: typeof stats;
          byCategory: { event_type: string; count: number }[];
        }>('/api/admin/overview'),
        apiFetch<{ bookings: BookingRecord[] }>('/api/admin/bookings'),
        apiFetch<{ quotes: QuoteRecord[]; quoteItems: QuoteItem[] }>('/api/admin/quotes'),
        apiFetch<{ services: ServiceItem[]; categories: ServiceCategory[] }>('/api/admin/services'),
        apiFetch<{ images: GalleryImage[] }>('/api/admin/gallery'),
        apiFetch<{ customers: CustomerRecord[] }>('/api/admin/customers'),
        apiFetch<{ messages: ContactMessage[] }>('/api/admin/messages'),
        apiFetch<{ settings: CompanySettings }>('/api/admin/settings'),
      ]);
      setStats(ov.stats);
      setByCategory(ov.byCategory || []);
      setBookings(bk.bookings || []);
      setQuotes(qt.quotes || []);
      setQuoteItems(qt.quoteItems || []);
      setServices(sv.services || []);
      setCategories(sv.categories || []);
      setGallery(gl.images || []);
      setCustomers(cu.customers || []);
      setMessages(ms.messages || []);
      setSettingsForm(st.settings);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  const handleFirstSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/admin-setup', {
        method: 'POST',
        body: JSON.stringify({
          email: setupEmail,
          fullName: setupName,
          password: setupPassword,
        }),
      });
      setSession(res.token, res.user);
      setSetupStatus({ needsSetup: false, passcodeConfigured: false });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Erreur lors de la configuration.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(
          setupStatus?.passcodeConfigured
            ? { passcode: loginPasscode }
            : { email: loginEmail, password: loginPassword }
        ),
      });
      setSession(res.token, res.user);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Accès refusé.');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateBooking = async (
    id: number,
    patch: { status?: string; internal_notes?: string; assigned_to?: string; event_date?: string }
  ) => {
    await apiFetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    await loadAdminData();
  };

  const exportBookingsCsv = () => {
    const headers = [
      'Reference',
      'Statut',
      'Type',
      'Titre',
      'Date',
      'Lieu',
      'Invites',
      'Budget',
      'Client',
      'Email',
      'Telephone',
    ];
    const rows = bookings.map((b) =>
      [
        b.reference_code,
        b.status,
        b.event_type,
        b.event_title,
        b.event_date,
        b.event_location,
        b.guest_count,
        b.estimated_budget,
        b.full_name,
        b.email,
        b.phone,
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-event-pro.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify({
        category_id: newService.category_id,
        title_fr: newService.title_fr,
        short_desc_fr: newService.short_desc_fr,
        starting_price_mad: newService.starting_price_mad
          ? Number(newService.starting_price_mad)
          : null,
        price_note_fr: newService.price_note_fr,
      }),
    });
    setNewService({
      category_id: 1,
      title_fr: '',
      short_desc_fr: '',
      starting_price_mad: '',
      price_note_fr: 'Tarif sur devis',
    });
    await loadAdminData();
  };

  const handleR2Upload = async (file: File) => {
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiFetch<{ url: string; key: string }>('/api/admin/upload', {
        method: 'POST',
        body: form,
      });
      setNewPhoto((prev) => ({ ...prev, image_url: res.url, r2_key: res.key }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(newPhoto),
    });
    setNewPhoto({
      title_fr: '',
      caption_fr: '',
      category: 'Mariages',
      image_url: '',
      r2_key: '',
    });
    await loadAdminData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setSettingsSaved('');
    await apiFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsForm),
    });
    await refreshSettings();
    setSettingsSaved('Paramètres enregistrés et appliqués au site.');
  };

  // Auth Gate
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-[#E5E0D8] bg-white p-7">
          <div className="flex items-center gap-2 text-[#9A7B3E]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Portail Administration
            </span>
          </div>

          {setupStatus?.needsSetup ? (
            <>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-[#181715]">
                Initialiser l’accès administrateur
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-[#5C564E]">
                Aucun administrateur n’est encore configuré. Définissez le premier compte
                administrateur sécurisé pour gérer EVENT PRO.
              </p>
              {authError && (
                <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {authError}
                </div>
              )}
              <form onSubmit={handleFirstSetup} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#181715]">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="mt-1 w-full rounded border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#181715]">
                    Email administrateur
                  </label>
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="direction@eventpro-casablanca.ma"
                    className="mt-1 w-full rounded border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#181715]">
                    Mot de passe (8+ caractères)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="mt-1 w-full rounded border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-md bg-[#181715] py-2.5 text-sm font-medium text-[#FAF8F5]"
                >
                  {authLoading ? 'Initialisation...' : 'Créer et activer l’accès admin'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-[#181715]">
                Connexion Administrateur
              </h1>
              {authError && (
                <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {authError}
                </div>
              )}
              <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
                {setupStatus?.passcodeConfigured ? (
                  <div>
                    <label className="block text-xs font-medium text-[#181715]">
                      Code d’accès administrateur
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPasscode}
                      onChange={(e) => setLoginPasscode(e.target.value)}
                      className="mt-1 w-full rounded border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-sm"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#181715]">Email</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="mt-1 w-full rounded border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#181715]">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="mt-1 w-full rounded border border-[#D9D2C5] bg-[#FAF8F5] px-3 py-2 text-sm"
                      />
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-md bg-[#181715] py-2.5 text-sm font-medium text-[#FAF8F5]"
                >
                  {authLoading ? 'Vérification...' : 'Accéder au tableau de bord'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  const navTabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
    { id: 'bookings', label: 'Réservations', icon: CalendarCheck },
    { id: 'quotes', label: 'Devis', icon: FileSpreadsheet },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      bookingStatusFilter === 'Tous' || b.status === bookingStatusFilter;
    const q = bookingSearch.toLowerCase();
    const matchesSearch =
      !q ||
      b.reference_code.toLowerCase().includes(q) ||
      b.full_name.toLowerCase().includes(q) ||
      b.event_title.toLowerCase().includes(q) ||
      b.event_location.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const maxCategoryCount = Math.max(1, ...byCategory.map((c) => c.count));

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1400px] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full border-b border-[#E5E0D8] bg-white p-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r no-print">
        <div className="border-b border-[#F0ECE4] pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7B3E]">
            Administration
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#181715]">{user.fullName}</p>
        </div>

        <nav className="mt-4 flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#181715] text-[#FAF8F5]'
                    : 'text-[#4A453E] hover:bg-[#F2EFE9]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-[#F0ECE4] pt-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {loading && (
          <div className="mb-4 text-xs text-[#6B655C]">Actualisation des données...</div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#181715]">
                Tableau de bord EVENT PRO
              </h1>
              <p className="text-xs text-[#6B655C]">
                Activité événementielle · Casablanca (Fuseau Africa/Casablanca)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {[
                { label: 'Total réservations', value: stats.totalBookings },
                { label: 'Nouvelles demandes', value: stats.newRequests },
                { label: 'Devis en attente', value: stats.pendingQuotes },
                { label: 'Événements confirmés', value: stats.confirmedEvents },
                { label: 'Événements à venir', value: stats.upcomingEvents },
                { label: 'Clients', value: stats.totalCustomers },
                { label: 'Messages non lus', value: stats.unreadMessages },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-[#E5E0D8] bg-white p-4"
                >
                  <p className="text-[11px] font-medium text-[#6B655C]">{kpi.label}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-[#181715] tabular-nums">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-[#E5E0D8] bg-white p-6">
                <h2 className="font-serif text-xl font-semibold text-[#181715]">
                  Répartition par type d’événement
                </h2>
                <div className="mt-4 space-y-3">
                  {byCategory.length === 0 ? (
                    <p className="text-xs text-[#6B655C]">Aucune donnée.</p>
                  ) : (
                    byCategory.map((cat) => (
                      <div key={cat.event_type}>
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#181715]">{cat.event_type}</span>
                          <span className="font-mono tabular-nums text-[#6B655C]">
                            {cat.count}
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded bg-[#F2EFE9]">
                          <div
                            className="h-full bg-[#9A7B3E]"
                            style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#E5E0D8] bg-white p-6">
                <h2 className="font-serif text-xl font-semibold text-[#181715]">
                  Derniers messages reçus
                </h2>
                <div className="mt-4 space-y-3">
                  {messages.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between border-b border-[#F0ECE4] pb-3 text-xs last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-[#181715]">
                          {m.name} — {m.subject}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[#5C564E]">{m.message}</p>
                      </div>
                      <span className="ml-2 shrink-0 text-[11px] font-medium text-[#9A7B3E]">
                        {m.status === 'unread' ? 'Non lu' : m.status === 'replied' ? 'Répondu' : 'Lu'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-serif text-3xl font-semibold text-[#181715]">
                Gestion des réservations
              </h1>
              <button
                type="button"
                onClick={exportBookingsCsv}
                className="inline-flex items-center gap-2 rounded-md border border-[#181715] px-4 py-2 text-xs font-medium text-[#181715] hover:bg-[#181715] hover:text-[#FAF8F5]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exporter CSV</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                placeholder="Rechercher référence, client, lieu..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full max-w-xs rounded-md border border-[#D9D2C5] bg-white px-3.5 py-2 text-xs"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="rounded-md border border-[#D9D2C5] bg-white px-3 py-2 text-xs"
              >
                <option value="Tous">Tous les statuts</option>
                {BOOKING_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#E5E0D8] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E0D8] bg-[#FAF8F5] text-[#5C564E]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Référence</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Événement</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Invités</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE4]">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 font-mono text-[#9A7B3E] tabular-nums">
                        {b.reference_code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#181715]">{b.full_name}</p>
                        <p className="text-[#6B655C]">{b.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#181715]">{b.event_title}</p>
                        <p className="text-[#6B655C]">
                          {b.event_type} · {b.event_location}
                        </p>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{formatDateFr(b.event_date)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{b.guest_count}</td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => void updateBooking(b.id, { status: e.target.value })}
                          className="rounded border border-[#D9D2C5] bg-white px-2 py-1 text-xs"
                        >
                          {BOOKING_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="font-medium text-[#9A7B3E] underline"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedBooking && (
              <div className="rounded-lg border border-[#9A7B3E] bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-[#181715]">
                    Dossier {selectedBooking.reference_code} — {selectedBooking.event_title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="text-xs underline"
                  >
                    Fermer
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                  <div>
                    <p className="font-semibold">Style &amp; Couleurs</p>
                    <p>{selectedBooking.preferred_style || '—'} / {selectedBooking.color_theme || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Budget estimé</p>
                    <p>{selectedBooking.estimated_budget}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Responsable assigné</p>
                    <input
                      type="text"
                      defaultValue={selectedBooking.assigned_to}
                      onBlur={(e) =>
                        void updateBooking(selectedBooking.id, { assigned_to: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#D9D2C5] px-2 py-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold">Notes internes</label>
                  <textarea
                    rows={2}
                    defaultValue={selectedBooking.internal_notes}
                    onBlur={(e) =>
                      void updateBooking(selectedBooking.id, { internal_notes: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUOTES */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-serif text-3xl font-semibold text-[#181715]">
                Gestion des devis
              </h1>
              <button
                type="button"
                onClick={() => setEditingQuote({ quote: null, open: true })}
                className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-4 py-2 text-xs font-medium text-[#FAF8F5]"
              >
                <Plus className="h-4 w-4" />
                <span>Créer un devis</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#E5E0D8] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E0D8] bg-[#FAF8F5] text-[#5C564E]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Référence</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Événement</th>
                    <th className="px-4 py-3 font-medium">Total MAD</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE4]">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 font-mono text-[#9A7B3E] tabular-nums">
                        {q.reference_code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#181715]">{q.client_name}</p>
                        <p className="text-[#6B655C]">{q.client_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {q.event_type} · {q.guest_count} inv.
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                        {q.total_mad > 0 ? formatMad(q.total_mad) : q.budget_range}
                      </td>
                      <td className="px-4 py-3">{q.status}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setEditingQuote({ quote: q, open: true })}
                          className="font-medium text-[#9A7B3E] underline"
                        >
                          Éditer / PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingQuote.open && (
              <QuoteBuilderModal
                quote={editingQuote.quote}
                initialItems={
                  editingQuote.quote
                    ? quoteItems.filter((i) => i.quote_id === editingQuote.quote?.id)
                    : []
                }
                onClose={() => setEditingQuote({ quote: null, open: false })}
                onSaved={() => void loadAdminData()}
              />
            )}
          </div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <h1 className="font-serif text-3xl font-semibold text-[#181715]">
              Gestion des services &amp; tarifs (MAD)
            </h1>

            <form
              onSubmit={handleCreateService}
              className="grid grid-cols-1 gap-4 rounded-lg border border-[#E5E0D8] bg-white p-6 sm:grid-cols-2"
            >
              <h2 className="font-serif text-xl font-semibold text-[#181715] sm:col-span-2">
                Ajouter une prestation
              </h2>
              <select
                value={newService.category_id}
                onChange={(e) =>
                  setNewService((p) => ({ ...p, category_id: Number(e.target.value) }))
                }
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fr}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Titre du service"
                value={newService.title_fr}
                onChange={(e) => setNewService((p) => ({ ...p, title_fr: e.target.value }))}
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs"
              />
              <input
                type="text"
                required
                placeholder="Description courte"
                value={newService.short_desc_fr}
                onChange={(e) => setNewService((p) => ({ ...p, short_desc_fr: e.target.value }))}
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs sm:col-span-2"
              />
              <input
                type="number"
                placeholder="Prix indicatif MAD (laisser vide si sur devis)"
                value={newService.starting_price_mad}
                onChange={(e) =>
                  setNewService((p) => ({ ...p, starting_price_mad: e.target.value }))
                }
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs"
              />
              <input
                type="text"
                placeholder="Mention tarifaire (ex. Tarif sur devis)"
                value={newService.price_note_fr}
                onChange={(e) => setNewService((p) => ({ ...p, price_note_fr: e.target.value }))}
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="w-fit rounded-md bg-[#9A7B3E] px-5 py-2 text-xs font-medium text-[#FAF8F5]"
              >
                Créer le service
              </button>
            </form>

            <div className="space-y-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-[#E5E0D8] bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[#181715]">{s.title_fr}</h3>
                    <p className="text-xs text-[#5C564E]">{s.short_desc_fr}</p>
                    <p className="mt-1 font-mono text-xs text-[#9A7B3E] tabular-nums">
                      {s.starting_price_mad ? formatMad(s.starting_price_mad) : s.price_note_fr}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await apiFetch(`/api/admin/services/${s.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ is_available: !s.is_available }),
                        });
                        await loadAdminData();
                      }}
                      className={`rounded border px-3 py-1 text-xs font-medium ${
                        s.is_available
                          ? 'border-emerald-700 text-emerald-800'
                          : 'border-[#D9D2C5] text-[#6B655C]'
                      }`}
                    >
                      {s.is_available ? 'Disponible' : 'Masqué'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await apiFetch(`/api/admin/services/${s.id}`, { method: 'DELETE' });
                        await loadAdminData();
                      }}
                      className="text-red-700 hover:text-red-900"
                      aria-label="Supprimer service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <h1 className="font-serif text-3xl font-semibold text-[#181715]">
              Gestion de la galerie (Cloudflare R2)
            </h1>

            <form
              onSubmit={handleAddGallery}
              className="grid grid-cols-1 gap-4 rounded-lg border border-[#E5E0D8] bg-white p-6 sm:grid-cols-2"
            >
              <input
                type="text"
                required
                placeholder="Titre de la photo"
                value={newPhoto.title_fr}
                onChange={(e) => setNewPhoto((p) => ({ ...p, title_fr: e.target.value }))}
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs"
              />
              <select
                value={newPhoto.category}
                onChange={(e) => setNewPhoto((p) => ({ ...p, category: e.target.value }))}
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs"
              >
                {[
                  'Mariages',
                  'Décoration',
                  'Anniversaires',
                  'Événements professionnels',
                  'Traiteur',
                  'Cérémonies marocaines',
                  'Fêtes privées',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Légende"
                value={newPhoto.caption_fr}
                onChange={(e) => setNewPhoto((p) => ({ ...p, caption_fr: e.target.value }))}
                className="rounded border border-[#D9D2C5] px-3 py-2 text-xs sm:col-span-2"
              />
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Téléverser vers R2 (JPEG/PNG/WebP)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleR2Upload(file);
                  }}
                  className="mt-1 text-xs"
                />
                {uploadingImage && <p className="mt-1 text-xs text-[#9A7B3E]">Envoi en cours...</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#181715]">
                  Ou URL directe de l’image
                </label>
                <input
                  type="text"
                  required
                  value={newPhoto.image_url}
                  onChange={(e) => setNewPhoto((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="/api/media/... ou https://..."
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-fit rounded-md bg-[#9A7B3E] px-5 py-2 text-xs font-medium text-[#FAF8F5]"
              >
                Ajouter à la galerie
              </button>
            </form>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-lg border border-[#E5E0D8] bg-white"
                >
                  <div className="aspect-[4/3]">
                    <SafeImage
                      src={img.image_url}
                      alt={img.title_fr}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#181715]">{img.title_fr}</p>
                      <p className="text-[#6B655C]">{img.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await apiFetch(`/api/admin/gallery/${img.id}`, { method: 'DELETE' });
                        await loadAdminData();
                      }}
                      className="text-red-700"
                      aria-label="Supprimer photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl font-semibold text-[#181715]">
              Répertoire clients ({customers.length})
            </h1>
            <div className="overflow-x-auto rounded-lg border border-[#E5E0D8] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E0D8] bg-[#FAF8F5] text-[#5C564E]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Ville</th>
                    <th className="px-4 py-3 font-medium">Réservations</th>
                    <th className="px-4 py-3 font-medium">Devis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE4]">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-semibold text-[#181715]">
                        {c.full_name}
                        {c.company_name && (
                          <span className="block font-normal text-[#6B655C]">{c.company_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p>{c.email}</p>
                        <p className="text-[#6B655C]">{c.phone}</p>
                      </td>
                      <td className="px-4 py-3">{c.city}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{c.booking_count ?? 0}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{c.quote_count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl font-semibold text-[#181715]">
              Messages de contact ({messages.length})
            </h1>
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-[#E5E0D8] bg-white p-5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-sm text-[#181715]">{m.name}</span>
                      <span className="ml-2 text-[#6B655C]">
                        ({m.email} · {m.phone || 'Sans tél.'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={m.status}
                        onChange={async (e) => {
                          await apiFetch(`/api/admin/messages/${m.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: e.target.value }),
                          });
                          await loadAdminData();
                        }}
                        className="rounded border border-[#D9D2C5] px-2 py-1"
                      >
                        <option value="unread">Non lu</option>
                        <option value="read">Lu</option>
                        <option value="replied">Répondu</option>
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiFetch(`/api/admin/messages/${m.id}`, { method: 'DELETE' });
                          await loadAdminData();
                        }}
                        className="text-red-700"
                        aria-label="Supprimer message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 font-semibold text-[#9A7B3E]">{m.subject}</p>
                  <p className="mt-1 whitespace-pre-line text-[#4A453E]">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-5">
            <h1 className="font-serif text-3xl font-semibold text-[#181715]">
              Paramètres de l’agence
            </h1>
            {settingsSaved && (
              <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                {settingsSaved}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#E5E0D8] bg-white p-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium">Nom de l’entreprise</label>
                <input
                  type="text"
                  value={settingsForm.company_name}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, company_name: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Devise</label>
                <input
                  type="text"
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium">Slogan</label>
                <input
                  type="text"
                  value={settingsForm.slogan_fr}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slogan_fr: e.target.value })}
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Téléphone affiché (+212)</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">
                  Numéro WhatsApp (format +2126...)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsapp_number}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Email de contact</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Zone de service</label>
                <input
                  type="text"
                  value={settingsForm.service_area_fr}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, service_area_fr: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium">Adresse à Casablanca</label>
                <input
                  type="text"
                  value={settingsForm.address_fr}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address_fr: e.target.value })}
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">URL Instagram</label>
                <input
                  type="url"
                  value={settingsForm.instagram_url}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, instagram_url: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">URL Facebook</label>
                <input
                  type="url"
                  value={settingsForm.facebook_url}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, facebook_url: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-[#9A7B3E] px-6 py-2.5 text-xs font-medium text-[#FAF8F5]"
                >
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

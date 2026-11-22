import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, setAuthToken } from '../lib/api';
import type { AuthUser, CompanySettings } from '../types';

export type Language = 'fr' | 'ar';

interface AppContextValue {
  settings: CompanySettings;
  refreshSettings: () => Promise<void>;
  lang: Language;
  setLang: (lang: Language) => void;
  user: AuthUser | null;
  setSession: (token: string | null, user: AuthUser | null) => void;
  logout: () => Promise<void>;
  turnstileEnabled: boolean;
}

const DEFAULT_SETTINGS: CompanySettings = {
  company_name: 'EVENT PRO',
  slogan_fr: 'Vos événements, notre expertise. Vos moments, notre passion.',
  phone: '+212 6 00 00 00 00',
  whatsapp_number: '+212600000000',
  email: 'contact@eventpro-casablanca.ma',
  address_fr: "Boulevard d'Anfa, Quartier Racine, Casablanca, Maroc",
  service_area_fr: 'Casablanca, Ain Diab, Dar Bouazza, Bouskoura, Mohammedia',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  currency: 'MAD',
  booking_notice_fr:
    'Chaque réservation constitue une demande initiale étudiée par notre équipe avant confirmation définitive.',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [lang, setLangState] = useState<Language>('fr');
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await apiFetch<{
        settings: CompanySettings;
        turnstileEnabled?: boolean;
      }>('/api/public/settings');
      if (data.settings) setSettings(data.settings);
      if (typeof data.turnstileEnabled === 'boolean') {
        setTurnstileEnabled(data.turnstileEnabled);
      }
    } catch {
      // Keep defaults if offline
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    document.documentElement.lang = next === 'ar' ? 'ar' : 'fr';
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const setSession = useCallback((token: string | null, nextUser: AuthUser | null) => {
    setAuthToken(token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        refreshSettings,
        lang,
        setLang,
        user,
        setSession,
        logout,
        turnstileEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}

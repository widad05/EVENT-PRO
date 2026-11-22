import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { LoadingScreen } from './components/LoadingScreen';
import { WelcomePopup } from './components/WelcomePopup';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BookingPage } from './pages/BookingPage';
import { QuotePage } from './pages/QuotePage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage, PrivacyPolicyPage, TermsPage } from './pages/LegalPages';

const ROUTE_TITLES: Record<string, string> = {
  '/': "EVENT PRO — Organisation d'Événements & Wedding Planner à Casablanca",
  '/services': 'Nos Services — EVENT PRO Casablanca',
  '/reserver': 'Réserver un Événement — EVENT PRO Casablanca',
  '/devis': 'Demander un Devis (MAD) — EVENT PRO Casablanca',
  '/galerie': 'Galerie & Réalisations — EVENT PRO Casablanca',
  '/a-propos': 'À Propos — EVENT PRO Casablanca',
  '/contact': 'Contact — EVENT PRO Casablanca',
  '/client': 'Espace Client — EVENT PRO Casablanca',
  '/admin': 'Administration — EVENT PRO Casablanca',
  '/confidentialite': 'Politique de Confidentialité — EVENT PRO',
  '/conditions': 'Conditions Générales — EVENT PRO',
};

const RouteMetadataHandler: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = ROUTE_TITLES[pathname] || 'EVENT PRO — Casablanca, Maroc';
  }, [pathname]);

  return null;
};

export default function App() {
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = React.useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <RouteMetadataHandler />
        <LoadingScreen />
        <WelcomePopup />
        <ScrollProgressBar />
        <CustomCursor />
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#181715]">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/reserver" element={<BookingPage />} />
              <Route path="/devis" element={<QuotePage />} />
              <Route path="/galerie" element={<GalleryPage />} />
              <Route path="/a-propos" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/client" element={<ClientDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
              <Route path="/conditions" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

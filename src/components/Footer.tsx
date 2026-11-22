import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppUrl } from '../lib/api';

export const Footer: React.FC = () => {
  const { settings, lang, setLang } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E5E0D8] bg-[#181715] text-[#FAF8F5] no-print">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <Link to="/" className="font-serif text-2xl font-semibold tracking-[0.06em] text-[#FAF8F5]">
              {settings.company_name || 'EVENT PRO'}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#C9C2B8]">
              {settings.slogan_fr}
            </p>
            <p className="mt-4 text-xs text-[#A69E92]">
              {settings.service_area_fr}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsapp_number,
                  "Bonjour EVENT PRO, je souhaite échanger au sujet d'un événement à Casablanca."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#D6BC88] underline underline-offset-4 hover:text-[#FAF8F5]"
              >
                WhatsApp
              </a>
              <span aria-hidden="true" className="text-[#5A544C]">·</span>
              <a
                href={settings.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram EVENT PRO"
                className="inline-flex items-center gap-1 text-xs text-[#C9C2B8] hover:text-[#FAF8F5]"
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>Instagram</span>
              </a>
              <span aria-hidden="true" className="text-[#5A544C]">·</span>
              <a
                href={settings.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook EVENT PRO"
                className="inline-flex items-center gap-1 text-xs text-[#C9C2B8] hover:text-[#FAF8F5]"
              >
                <Facebook className="h-3.5 w-3.5" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-medium text-[#FAF8F5]">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#C9C2B8]">
              <li><Link to="/" className="hover:text-[#FAF8F5] transition-colors">Accueil</Link></li>
              <li><Link to="/services" className="hover:text-[#FAF8F5] transition-colors">Nos services</Link></li>
              <li><Link to="/reserver" className="hover:text-[#FAF8F5] transition-colors">Réserver un événement</Link></li>
              <li><Link to="/devis" className="hover:text-[#FAF8F5] transition-colors">Demander un devis</Link></li>
              <li><Link to="/galerie" className="hover:text-[#FAF8F5] transition-colors">Galerie</Link></li>
              <li><Link to="/a-propos" className="hover:text-[#FAF8F5] transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-[#FAF8F5] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-serif text-lg font-medium text-[#FAF8F5]">Prestations</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#C9C2B8]">
              <li><Link to="/services?cat=1" className="hover:text-[#FAF8F5] transition-colors">Organisation de mariage</Link></li>
              <li><Link to="/services?cat=2" className="hover:text-[#FAF8F5] transition-colors">Cérémonies marocaines &amp; Henné</Link></li>
              <li><Link to="/services?cat=4" className="hover:text-[#FAF8F5] transition-colors">Événements professionnels</Link></li>
              <li><Link to="/services?cat=5" className="hover:text-[#FAF8F5] transition-colors">Décoration florale &amp; Traiteur</Link></li>
              <li><Link to="/services?cat=6" className="hover:text-[#FAF8F5] transition-colors">Salles, Sonorisation &amp; Mobilier</Link></li>
              <li><Link to="/client" className="text-[#D6BC88] hover:text-[#FAF8F5] transition-colors">Espace Client</Link></li>
              <li><Link to="/admin" className="text-[#A69E92] hover:text-[#FAF8F5] transition-colors">Portail Administration</Link></li>
            </ul>
          </div>

          {/* Contact & Language */}
          <div>
            <h3 className="font-serif text-lg font-medium text-[#FAF8F5]">Casablanca</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#C9C2B8]">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D6BC88]" />
                <span>{settings.address_fr}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#D6BC88]" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="tabular-nums hover:text-[#FAF8F5]">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#D6BC88]" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#FAF8F5]">
                  {settings.email}
                </a>
              </li>
            </ul>

            <div className="mt-6 border-t border-[#2E2B27] pt-4">
              <button
                type="button"
                onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                className="inline-flex items-center gap-2 rounded border border-[#3E3A34] px-3 py-1.5 text-xs font-medium text-[#D6BC88] transition-colors hover:border-[#D6BC88]"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{lang === 'fr' ? 'Version العربية (RTL)' : 'Version Française (LTR)'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#2E2B27] pt-6 text-xs text-[#A69E92] sm:flex-row sm:items-center">
          <p>© {year} EVENT PRO — Casablanca, Maroc. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/confidentialite" className="hover:text-[#FAF8F5]">
              Politique de confidentialité
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/conditions" className="hover:text-[#FAF8F5]">
              Conditions générales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

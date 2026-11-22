import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang } = useApp();

  const navItems =
    lang === 'ar'
      ? [
          { to: '/', label: 'الرئيسية' },
          { to: '/services', label: 'خدماتنا' },
          { to: '/galerie', label: 'المعرض' },
          { to: '/a-propos', label: 'من نحن' },
          { to: '/contact', label: 'تواصل معنا' },
        ]
      : [
          { to: '/', label: 'Accueil' },
          { to: '/services', label: 'Services' },
          { to: '/galerie', label: 'Galerie' },
          { to: '/a-propos', label: 'À propos' },
          { to: '/contact', label: 'Contact' },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E0D8] bg-[#FAF8F5]/95 backdrop-blur-sm no-print">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <Link
          to="/"
          className="font-serif text-2xl font-semibold tracking-[0.06em] text-[#181715] whitespace-nowrap shrink-0"
        >
          EVENT PRO
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A453E]"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 transition-colors border-b ${
                  isActive
                    ? 'border-[#9A7B3E] text-[#181715]'
                    : 'border-transparent hover:text-[#181715] hover:border-[#D9D2C5]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: 1 primary action CTA (+ mobile menu button) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/reserver"
            className="hidden sm:inline-flex items-center justify-center rounded-md bg-[#9A7B3E] px-4 py-2 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'احجز مناسبتك' : 'Réserver un événement'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E0D8] text-[#181715] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E5E0D8] bg-[#FAF8F5] px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-2 text-base font-medium ${
                    isActive ? 'text-[#9A7B3E]' : 'text-[#181715]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[#E5E0D8] pt-4">
              <Link
                to="/reserver"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-md bg-[#9A7B3E] px-4 py-2.5 text-sm font-medium text-[#FAF8F5]"
              >
                Réserver un événement
              </Link>
              <Link
                to="/devis"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-md border border-[#181715] px-4 py-2.5 text-sm font-medium text-[#181715]"
              >
                Demander un devis
              </Link>
              <div className="mt-2 flex items-center justify-between text-xs text-[#6B655C]">
                <Link to="/client" onClick={() => setMobileOpen(false)} className="underline">
                  Espace Client
                </Link>
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="underline">
                  Administration
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

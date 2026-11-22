import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { useApp } from '../context/AppContext';

const STORAGE_KEY = 'eventpro_welcome_seen';

export const WelcomePopup: React.FC = () => {
  const { lang } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/client')) {
      return;
    }

    let alreadySeen = false;
    try {
      alreadySeen = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage may be unavailable in restricted contexts
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-[90] flex items-center justify-center bg-[#181715]/70 p-4 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-[780px] grid-cols-1 overflow-hidden rounded-xl border border-[#DED8CE] bg-[#FAF8F5] text-[#181715] shadow-2xl md:grid-cols-12"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label={lang === 'ar' ? 'إغلاق نافذة الترحيب' : 'Fermer la fenêtre de bienvenue'}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E0D8] bg-[#FAF8F5]/95 text-[#181715] transition-colors hover:border-[#9A7B3E] hover:text-[#9A7B3E]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Image Column */}
        <div className="relative hidden min-h-[340px] bg-[#181715] md:col-span-5 md:block">
          <SafeImage
            src="/src/assets/images/category_moroccan_wedding_1795278178133.jpg"
            alt="Scénographie d’exception signée EVENT PRO à Casablanca"
            loading="eager"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181715]/80 via-[#181715]/20 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 text-[#FAF8F5]">
            <p className="font-serif text-lg font-medium leading-snug">
              {lang === 'ar' ? 'الدار البيضاء · المغرب' : 'Casablanca · Maroc'}
            </p>
            <p className="mt-1 text-xs text-[#D6BC88]">
              {lang === 'ar'
                ? 'مناسبات خاصة واحتفالات شركات'
                : 'Réceptions privées & événements corporate'}
            </p>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="flex flex-col justify-between p-7 sm:p-9 md:col-span-7">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
              {lang === 'ar' ? 'مرحباً بكم في EVENT PRO' : 'Maison événementielle · Casablanca'}
            </p>
            <h2
              id="welcome-popup-title"
              className="mt-2.5 font-serif text-3xl font-semibold leading-tight text-[#181715] sm:text-4xl"
            >
              {lang === 'ar' ? 'مرحباً بكم في EVENT PRO' : 'Bienvenue chez EVENT PRO'}
            </h2>
            <p className="mt-3 font-serif text-lg italic text-[#7D622F]">
              {lang === 'ar'
                ? 'مناسباتكم، خبرتنا. لحظاتكم، شغفنا.'
                : '« Vos événements, notre expertise. Vos moments, notre passion. »'}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#5C564E]">
              {lang === 'ar'
                ? 'نرافقكم في الدار البيضاء لتنظيم حفلات الزفاف، الخطوبة، أعياد الميلاد وفعاليات الشركات بتخطيط متكامل وعروض مفصلة بالدرهم المغربي.'
                : 'Découvrez notre savoir-faire à Casablanca pour vos mariages, cérémonies marocaines, réceptions privées et galas d’entreprise, avec devis détaillés en MAD.'}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#E5E0D8] pt-5">
            <Link
              to="/devis"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-5 py-2.5 text-xs font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
            >
              <span>{lang === 'ar' ? 'اطلب عرض سعر' : 'Demander un devis'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md border border-[#E5E0D8] bg-white px-4 py-2.5 text-xs font-medium text-[#4A453E] transition-colors hover:border-[#9A7B3E] hover:text-[#181715] whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'استكشاف الموقع' : 'Explorer le site'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

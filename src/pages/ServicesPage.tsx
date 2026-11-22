import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { apiFetch, formatMad, parseJsonArray } from '../lib/api';
import type { ServiceCategory, ServiceItem } from '../types';
import { SafeImage } from '../components/SafeImage';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TextReveal } from '../components/TextReveal';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>(initialCat);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ categories: ServiceCategory[]; services: ServiceItem[] }>('/api/public/services')
      .then((res) => {
        setCategories(res.categories || []);
        setServices(res.services || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices =
    activeCat === 'all'
      ? services
      : services.filter((s) => String(s.category_id) === activeCat);

  const handleCategoryChange = (catId: string) => {
    setActiveCat(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: catId });
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl border-b border-[#E5E0D8] pb-8">
        <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
          Catalogue des prestations · Casablanca
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Nos services d’organisation et de production"
          className="mt-2 font-serif text-4xl font-semibold text-[#181715] sm:text-5xl"
        />
        <p className="mt-4 text-base leading-relaxed text-[#5C564E]">
          Chaque prestation peut être réservée individuellement ou intégrée à une organisation
          globale. Tous nos tarifs sont établis en dirhams marocains (MAD) sur mesure selon votre
          cahier des charges.
        </p>
      </header>

      {/* Interactive Category Filter */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            activeCat === 'all'
              ? 'bg-[#181715] text-[#FAF8F5]'
              : 'border border-[#E5E0D8] bg-white text-[#4A453E] hover:border-[#9A7B3E]'
          }`}
        >
          Toutes les prestations
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(String(cat.id))}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeCat === String(cat.id)
                ? 'bg-[#181715] text-[#FAF8F5]'
                : 'border border-[#E5E0D8] bg-white text-[#4A453E] hover:border-[#9A7B3E]'
            }`}
          >
            {cat.name_fr}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-10 grid grid-cols-1 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-lg border border-[#E5E0D8] bg-[#F2EFE9]" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-10 space-y-10">
          {filteredServices.map((svc, index) => {
            const benefits = parseJsonArray(svc.benefits_json);
            const included = parseJsonArray(svc.included_json);
            const options = parseJsonArray(svc.options_json);

            return (
              <article
                id={svc.slug}
                key={svc.id}
                className="grid grid-cols-1 overflow-hidden rounded-lg border border-[#E5E0D8] bg-white lg:grid-cols-12"
              >
                <div className="aspect-[4/3] lg:col-span-5 lg:aspect-auto">
                  <SafeImage
                    src={svc.cover_image}
                    alt={svc.title_fr}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B655C]">
                      <span className="font-mono text-[#9A7B3E]">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <span className="font-medium text-[#181715] tabular-nums">
                        {svc.starting_price_mad
                          ? `${formatMad(svc.starting_price_mad)} · ${svc.price_note_fr}`
                          : svc.price_note_fr || 'Tarif sur devis.'}
                      </span>
                    </div>

                    <h2 className="mt-2 font-serif text-3xl font-semibold text-[#181715]">
                      {svc.title_fr}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#4A453E]">
                      {svc.full_desc_fr}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-6 border-t border-[#F0ECE4] pt-5 sm:grid-cols-2">
                      {benefits.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold tracking-wider text-[#181715] uppercase">
                            Avantages clés
                          </h3>
                          <ul className="mt-2.5 space-y-1.5 text-sm text-[#5C564E]">
                            {benefits.map((b) => (
                              <li key={b} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {included.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold tracking-wider text-[#181715] uppercase">
                            Ce qui est inclus
                          </h3>
                          <ul className="mt-2.5 space-y-1.5 text-sm text-[#5C564E]">
                            {included.map((inc) => (
                              <li key={inc} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {options.length > 0 && (
                      <div className="mt-4 text-xs text-[#6B655C]">
                        <span className="font-semibold text-[#181715]">Options complémentaires : </span>
                        <span>{options.join(' · ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#F0ECE4] pt-5">
                    <Link
                      to={`/devis?service=${encodeURIComponent(svc.title_fr)}`}
                      className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-5 py-2.5 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
                    >
                      <span>Demander un devis</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <WhatsAppButton
                      label="Discuter sur WhatsApp"
                      message={`Bonjour EVENT PRO, je souhaite des informations sur la prestation : ${svc.title_fr}.`}
                      variant="subtle"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

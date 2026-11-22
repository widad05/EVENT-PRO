import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { Testimonial } from '../types';
import { SafeImage } from './SafeImage';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

function getStoryImage(eventType: string, idx: number): string {
  const lower = eventType.toLowerCase();
  if (lower.includes('séminaire') || lower.includes('entreprise') || lower.includes('corporate')) {
    return '/src/assets/images/category_corporate_gala_1795278181060.jpg';
  }
  if (lower.includes('henné') || lower.includes('fiançailles')) {
    return '/src/assets/images/category_henna_ceremony_1795278182712.jpg';
  }
  if (lower.includes('mariage')) {
    return '/src/assets/images/masonry_wedding_arch_1795278960981.jpg';
  }
  const fallbacks = [
    '/src/assets/images/category_moroccan_wedding_1795278178133.jpg',
    '/src/assets/images/gallery_birthday_garden_1795278181192.jpg',
    '/src/assets/images/masonry_evening_soir_e_1795278961707.jpg',
  ];
  return fallbacks[idx % fallbacks.length];
}

export const ClientLoveStoriesSection: React.FC = () => {
  const { lang } = useApp();
  const [stories, setStories] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ testimonials: Testimonial[] }>('/api/public/testimonials')
      .then((res) => setStories(res.testimonials || []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      aria-label="Client Love Stories"
      className="border-t border-[#E5E0D8] bg-[#F2EFE9]/55 py-20"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
              {lang === 'ar'
                ? 'تجارب وقصص عملائنا'
                : 'Témoignages & Récits · Casablanca'}
            </p>
            <TextReveal
              as="h2"
              text={lang === 'ar' ? 'قصص نجاح وثقة عملائنا' : 'Client Love Stories'}
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
          </div>

          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#181715] underline decoration-[#9A7B3E] underline-offset-4 hover:text-[#7D622F] whitespace-nowrap shrink-0"
          >
            <span>
              {lang === 'ar' ? 'ابدأ التخطيط لمناسبتك' : 'Imaginer votre réception'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-xl border border-[#E5E0D8] bg-white"
              />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#E5E0D8] bg-white p-10 text-center">
            <p className="text-sm text-[#5C564E]">
              Aucun témoignage publié pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {stories.map((item, idx) => {
              const rating = Math.max(1, Math.min(5, item.rating || 5));
              return (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E0D8] bg-white transition-colors hover:border-[#C5B9A5]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[#EAE4DA]">
                    <SafeImage
                      src={getStoryImage(item.event_type, idx)}
                      alt={item.event_type}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      {/* Rating & Quote Mark */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="flex items-center gap-1 text-[#9A7B3E]"
                          aria-label={`Note : ${rating} sur 5`}
                        >
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3.5 w-3.5 fill-[#9A7B3E]"
                              strokeWidth={1.5}
                            />
                          ))}
                          <span className="ml-1.5 font-mono text-xs text-[#6B655C] tabular-nums">
                            {rating}/5
                          </span>
                        </div>
                        <Quote
                          className="h-4 w-4 text-[#C5B9A5]"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Quote Prose */}
                      <blockquote className="mt-4 font-serif text-lg italic leading-relaxed text-[#181715]">
                        « {item.quote_fr} »
                      </blockquote>
                    </div>

                    {/* Unboxed Attribution Footer */}
                    <footer className="mt-6 border-t border-[#F0ECE4] pt-4">
                      <p className="text-sm font-semibold text-[#181715]">
                        {item.client_name}
                      </p>
                      <p className="mt-1 text-xs text-[#6B655C]">
                        <span>{item.event_type}</span>
                        {item.event_date_label && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span>{item.event_date_label}</span>
                          </>
                        )}
                      </p>
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

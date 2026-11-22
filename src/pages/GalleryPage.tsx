import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { GalleryImage } from '../types';
import { SafeImage } from '../components/SafeImage';
import { BeforeAfterSection } from '../components/BeforeAfterSection';
import { TextReveal } from '../components/TextReveal';

const GALLERY_CATEGORIES = [
  'Toutes',
  'Mariages',
  'Décoration',
  'Anniversaires',
  'Événements professionnels',
  'Traiteur',
  'Cérémonies marocaines',
  'Fêtes privées',
];

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const query =
      activeCategory !== 'Toutes' ? `?category=${encodeURIComponent(activeCategory)}` : '';
    apiFetch<{ images: GalleryImage[] }>(`/api/public/gallery${query}`)
      .then((res) => setImages(res.images || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + images.length) % images.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, images.length]);

  const activePhoto = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div>
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl border-b border-[#E5E0D8] pb-8">
        <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
          Portfolio visuel
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Galerie d’inspirations et d’événements"
          className="mt-2 font-serif text-4xl font-semibold text-[#181715] sm:text-5xl"
        />
        <p className="mt-4 text-base leading-relaxed text-[#5C564E]">
          Découvrez nos ambiances de mariages, cérémonies marocaines, réceptions d’entreprise,
          scénographies florales et tables gastronomiques à Casablanca.
        </p>
      </header>

      {/* Category Filter Bar */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === cat
                ? 'bg-[#181715] text-[#FAF8F5]'
                : 'border border-[#E5E0D8] bg-white text-[#4A453E] hover:border-[#9A7B3E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className={`break-inside-avoid animate-pulse rounded-lg bg-[#F2EFE9] ${
                n % 2 === 0 ? 'h-80' : 'h-60'
              }`}
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="mt-12 rounded-lg border border-[#E5E0D8] bg-white p-10 text-center">
          <p className="text-sm text-[#5C564E]">
            Aucune photographie enregistrée dans cette catégorie pour le moment.
          </p>
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
          {images.map((img, idx) => {
            const aspectClass = img.image_url.includes('masonry_')
              ? 'aspect-[3/4]'
              : img.image_url.includes('hero_casablanca')
                ? 'aspect-[16/10]'
                : idx % 3 === 0
                  ? 'aspect-[3/4]'
                  : 'aspect-[4/3]';
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group block w-full break-inside-avoid overflow-hidden rounded-lg border border-[#E5E0D8] bg-white text-left transition-colors hover:border-[#9A7B3E]"
              >
                <div className={`w-full overflow-hidden bg-[#F2EFE9] ${aspectClass}`}>
                  <SafeImage
                    src={img.image_url}
                    alt={img.title_fr}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#9A7B3E]">{img.category}</p>
                  <h2 className="mt-1 font-serif text-xl font-semibold text-[#181715]">
                    {img.title_fr}
                  </h2>
                  {img.caption_fr && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5C564E]">
                      {img.caption_fr}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title_fr}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Fermer l'aperçu"
            className="absolute right-4 top-4 rounded-md border border-white/20 bg-black/50 p-2 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
                }
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-black/50 p-2.5 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-black/50 p-2.5 text-white hover:bg-white/10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-[#181715]">
            <SafeImage
              src={activePhoto.image_url}
              alt={activePhoto.title_fr}
              className="max-h-[72vh] w-full object-contain"
            />
            <div className="border-t border-[#2E2B27] p-5 text-[#FAF8F5]">
              <p className="text-xs text-[#D6BC88]">
                {activePhoto.category} · {lightboxIndex + 1} / {images.length}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-medium">{activePhoto.title_fr}</h3>
              {activePhoto.caption_fr && (
                <p className="mt-1 text-sm text-[#C9C2B8]">{activePhoto.caption_fr}</p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      <BeforeAfterSection />
    </div>
  );
};

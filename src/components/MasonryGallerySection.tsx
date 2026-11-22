import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { GalleryImage } from '../types';
import { SafeImage } from './SafeImage';
import { TextReveal } from './TextReveal';

type MasonryFilter =
  | 'Toutes'
  | 'Mariages'
  | 'Décoration'
  | 'Soirées'
  | 'Événements professionnels';

const FILTER_TABS: { id: MasonryFilter; label: string }[] = [
  { id: 'Toutes', label: 'Toutes' },
  { id: 'Mariages', label: 'Mariages' },
  { id: 'Décoration', label: 'Décorations' },
  { id: 'Soirées', label: 'Soirées' },
  { id: 'Événements professionnels', label: 'Événements professionnels' },
];

const FALLBACK_HEIGHT_CLASSES = [
  'aspect-[3/4]',
  'aspect-[4/3]',
  'aspect-[16/10]',
  'aspect-[3/4]',
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-[4/3]',
  'aspect-[16/10]',
];

function matchesFilter(img: GalleryImage, filter: MasonryFilter): boolean {
  if (filter === 'Toutes') return true;
  if (filter === 'Mariages') return img.category === 'Mariages' || img.category === 'Cérémonies marocaines';
  if (filter === 'Décoration') return img.category === 'Décoration' || img.category === 'Traiteur';
  if (filter === 'Soirées') return img.category === 'Fêtes privées' || img.category === 'Anniversaires';
  if (filter === 'Événements professionnels') return img.category === 'Événements professionnels';
  return true;
}

function getMasonryAspectClass(img: GalleryImage, idx: number): string {
  if (img.image_url.includes('masonry_')) return 'aspect-[3/4]';
  if (img.image_url.includes('hero_casablanca')) return 'aspect-[16/10]';
  return FALLBACK_HEIGHT_CLASSES[idx % FALLBACK_HEIGHT_CLASSES.length];
}

export const MasonryGallerySection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeFilter, setActiveFilter] = useState<MasonryFilter>('Toutes');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ images: GalleryImage[] }>('/api/public/gallery')
      .then((res) => setImages(res.images || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredImages = images.filter((img) => matchesFilter(img, activeFilter));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredImages.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + filteredImages.length) % filteredImages.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  const activePhoto =
    lightboxIndex !== null && filteredImages[lightboxIndex]
      ? filteredImages[lightboxIndex]
      : null;

  return (
    <section className="border-y border-[#E5E0D8] bg-[#FAF8F5] py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-[#9A7B3E] uppercase">
              Portfolio &amp; Inspirations
            </p>
            <TextReveal
              as="h2"
              text="Galerie de nos réalisations"
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
          </div>
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#181715] underline decoration-[#9A7B3E] underline-offset-4 hover:text-[#7D622F] whitespace-nowrap shrink-0"
          >
            <span>Voir toute la galerie</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Filter Bar */}
        <div className="mt-7 flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilter(tab.id);
                setLightboxIndex(null);
              }}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-[#181715] text-[#FAF8F5]'
                  : 'border border-[#E5E0D8] bg-white text-[#4A453E] hover:border-[#9A7B3E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Masonry Columns */}
        {loading ? (
          <div className="mt-8 columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={`break-inside-avoid animate-pulse rounded-lg bg-[#EAE4DA] ${
                  n % 2 === 0 ? 'h-80' : 'h-60'
                }`}
              />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="mt-8 rounded-lg border border-[#E5E0D8] bg-white p-10 text-center">
            <p className="text-sm text-[#5C564E]">
              Aucune photographie disponible dans cette sélection pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-8 columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
            {filteredImages.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-lg border border-[#E5E0D8] bg-white text-left transition-colors hover:border-[#9A7B3E]"
              >
                <div className={`w-full overflow-hidden bg-[#F2EFE9] ${getMasonryAspectClass(img, idx)}`}>
                  <SafeImage
                    src={img.image_url}
                    alt={img.title_fr}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-xs text-[#9A7B3E]">
                      {img.category} · Casablanca
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-[#181715]">
                      {img.title_fr}
                    </h3>
                    {img.caption_fr && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5C564E]">
                        {img.caption_fr}
                      </p>
                    )}
                  </div>
                  <Expand
                    className="mt-1 h-4 w-4 shrink-0 text-[#8C8478] transition-colors group-hover:text-[#9A7B3E]"
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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

          {filteredImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
                  )
                }
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-black/50 p-2.5 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredImages.length)}
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
                {activePhoto.category} · {lightboxIndex + 1} / {filteredImages.length}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-medium">{activePhoto.title_fr}</h3>
              {activePhoto.caption_fr && (
                <p className="mt-1 text-sm text-[#C9C2B8]">{activePhoto.caption_fr}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

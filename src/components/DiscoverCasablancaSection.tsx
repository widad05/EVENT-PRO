/// <reference types="google.maps" />
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  ArrowRight,
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Star,
} from 'lucide-react';
import { TextReveal } from './TextReveal';
import { useApp } from '../context/AppContext';

const MAPS_API_KEY: string =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  (typeof process !== 'undefined' ? process.env?.GOOGLE_MAPS_API_KEY || '' : '');

const CASABLANCA_DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };

interface DistrictQueryConfig {
  id: string;
  district: string;
  categoryFr: string;
  categoryAr: string;
  primaryQuery: string;
  fallbackQuery: string;
}

const DISTRICT_CONFIGS: DistrictQueryConfig[] = [
  {
    id: 'maarif',
    district: 'Maarif',
    categoryFr: 'Décoration & Scénographie',
    categoryAr: 'الديكور وتنسيق الحفلات',
    primaryQuery: 'organisation événementielle décoration mariage Maarif Casablanca',
    fallbackQuery: 'hôtel réception Maarif Casablanca',
  },
  {
    id: 'anfa',
    district: 'Anfa',
    categoryFr: 'Salles de réception & Mariages',
    categoryAr: 'قاعات الأفراح والاستقبال',
    primaryQuery: 'salle de réception hôtel luxe Anfa Casablanca',
    fallbackQuery: 'hôtel Anfa Casablanca',
  },
  {
    id: 'ain-diab',
    district: 'Ain Diab',
    categoryFr: 'Terrasses & Soirées Corniche',
    categoryAr: 'شرفات وسهرات الكورنيش',
    primaryQuery: 'espace événementiel réception Ain Diab Corniche Casablanca',
    fallbackQuery: 'hôtel restaurant réception Ain Diab Casablanca',
  },
  {
    id: 'bouskoura',
    district: 'Bouskoura',
    categoryFr: 'Domaines & Réceptions plein air',
    categoryAr: 'فضاءات وحفلات في الهواء الطلق',
    primaryQuery: 'domaine villa réception événement Bouskoura Casablanca',
    fallbackQuery: 'club golf villa Bouskoura Casablanca',
  },
  {
    id: 'californie',
    district: 'Californie',
    categoryFr: 'Villas privées & Traiteur',
    categoryAr: 'فيلات خاصة وخدمات الضيافة',
    primaryQuery: 'traiteur réception villa Californie Casablanca',
    fallbackQuery: 'événementiel Californie Casablanca',
  },
];

interface ResolvedProviderPlace {
  id: string;
  district: string;
  categoryFr: string;
  categoryAr: string;
  name: string;
  googleCategory: string | null;
  address: string;
  phone: string | null;
  website: string | null;
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  position: { lat: number; lng: number };
  attributions: { provider: string; providerURI: string | null }[];
  zIndex: number;
}

interface DistrictMarkerProps {
  provider: ResolvedProviderPlace;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (
    provider: ResolvedProviderPlace,
    marker: google.maps.marker.AdvancedMarkerElement
  ) => void;
  onHoverChange: (id: string | null) => void;
  registerMarker: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void;
}

const DistrictAdvancedMarker: React.FC<DistrictMarkerProps> = ({
  provider,
  isSelected,
  isHovered,
  onSelect,
  onHoverChange,
  registerMarker,
}) => {
  const [markerRef, markerInstance] = useAdvancedMarkerRef();

  useEffect(() => {
    registerMarker(provider.id, markerInstance);
    return () => registerMarker(provider.id, null);
  }, [provider.id, markerInstance, registerMarker]);

  const zIndex = isSelected ? 1000 : isHovered ? 999 : provider.zIndex;

  return (
    <AdvancedMarker
      ref={markerRef}
      position={provider.position}
      title={`${provider.district} — ${provider.name}`}
      zIndex={zIndex}
      onClick={() => {
        if (markerInstance) {
          onSelect(provider, markerInstance);
        }
      }}
      onMouseEnter={() => onHoverChange(provider.id)}
      onMouseLeave={() => onHoverChange(null)}
    >
      <Pin
        background={isSelected ? '#9A7B3E' : '#181715'}
        borderColor={isSelected ? '#181715' : '#D4AF37'}
        glyphColor={isSelected ? '#FAF8F5' : '#D4AF37'}
        scale={isSelected ? 1.2 : 1.05}
      />
    </AdvancedMarker>
  );
};

interface MapViewportProps {
  lang: 'fr' | 'ar';
  providers: ResolvedProviderPlace[];
  setProviders: React.Dispatch<React.SetStateAction<ResolvedProviderPlace[]>>;
  loadingPlaces: boolean;
  setLoadingPlaces: React.Dispatch<React.SetStateAction<boolean>>;
  placesError: string | null;
  setPlacesError: React.Dispatch<React.SetStateAction<string | null>>;
  selectedId: string | null;
  onSelectProvider: (
    provider: ResolvedProviderPlace,
    marker: google.maps.marker.AdvancedMarkerElement | null
  ) => void;
  registerMarker: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void;
  selectedMarker: google.maps.marker.AdvancedMarkerElement | null;
  onCloseInfoWindow: () => void;
}

const CasablancaMapCanvas: React.FC<MapViewportProps> = ({
  lang,
  providers,
  setProviders,
  setLoadingPlaces,
  setPlacesError,
  selectedId,
  onSelectProvider,
  registerMarker,
  selectedMarker,
  onCloseInfoWindow,
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const coreLib = useMapsLibrary('core');
  const apiStatus = useApiLoadingStatus();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hasFittedBoundsRef = React.useRef(false);

  useEffect(() => {
    if (apiStatus === APILoadingStatus.AUTH_FAILURE) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      setPlacesError(
        lang === 'ar'
          ? 'تعذر تحميل خريطة Google Maps حالياً.'
          : 'Impossible d’authentifier le service Google Maps pour le moment.'
      );
      setLoadingPlaces(false);
    } else if (apiStatus === APILoadingStatus.FAILED) {
      setPlacesError(
        lang === 'ar'
          ? 'تعذر الاتصال بخدمة Google Maps.'
          : 'Impossible de charger la carte interactive Google Maps.'
      );
      setLoadingPlaces(false);
    }
  }, [apiStatus, lang, setLoadingPlaces, setPlacesError]);

  useEffect(() => {
    if (!placesLib) return;
    let cancelled = false;

    const loadDistrictProviders = async () => {
      setLoadingPlaces(true);
      setPlacesError(null);
      hasFittedBoundsRef.current = false;

      try {
        const searchDistrict = async (
          cfg: DistrictQueryConfig
        ): Promise<ResolvedProviderPlace | null> => {
          const fields = [
            'id',
            'displayName',
            'location',
            'formattedAddress',
            'nationalPhoneNumber',
            'internationalPhoneNumber',
            'websiteURI',
            'googleMapsURI',
            'primaryTypeDisplayName',
            'rating',
            'userRatingCount',
          ];

          const runTextSearch = async (query: string) => {
            return placesLib.Place.searchByText({
              textQuery: query,
              fields,
              language: lang === 'ar' ? 'ar' : 'fr',
              region: 'ma',
              maxResultCount: 3,
              internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
            } as google.maps.places.SearchByTextRequest);
          };

          let response = await runTextSearch(cfg.primaryQuery);
          let candidate = response.places?.find((p: google.maps.places.Place) => p.location != null);

          if (!candidate) {
            response = await runTextSearch(cfg.fallbackQuery);
            candidate = response.places?.find((p: google.maps.places.Place) => p.location != null);
          }

          if (!candidate || !candidate.location) {
            return null;
          }

          const lat =
            typeof candidate.location.lat === 'function'
              ? candidate.location.lat()
              : Number(candidate.location.lat);
          const lng =
            typeof candidate.location.lng === 'function'
              ? candidate.location.lng()
              : Number(candidate.location.lng);

          const attributions = (candidate.attributions || []).map(
            (attr: google.maps.places.Attribution) => ({
              provider: attr.provider || 'Google Maps',
              providerURI: attr.providerURI || null,
            })
          );

          return {
            id: cfg.id,
            district: cfg.district,
            categoryFr: cfg.categoryFr,
            categoryAr: cfg.categoryAr,
            name: candidate.displayName || cfg.district,
            googleCategory: candidate.primaryTypeDisplayName || null,
            address: candidate.formattedAddress || `${cfg.district}, Casablanca`,
            phone: candidate.nationalPhoneNumber || candidate.internationalPhoneNumber || null,
            website: candidate.websiteURI || null,
            googleMapsUri: candidate.googleMapsURI || null,
            rating: typeof candidate.rating === 'number' ? candidate.rating : null,
            userRatingCount:
              typeof candidate.userRatingCount === 'number' ? candidate.userRatingCount : null,
            position: { lat, lng },
            attributions,
            zIndex: 1,
          };
        };

        const resolved = await Promise.all(DISTRICT_CONFIGS.map((cfg) => searchDistrict(cfg)));
        if (cancelled) return;

        const valid = resolved
          .filter((item): item is ResolvedProviderPlace => item !== null)
          .sort((a, b) => b.position.lat - a.position.lat)
          .map((item, index) => ({ ...item, zIndex: index + 1 }));

        setProviders(valid);
        if (valid.length === 0) {
          setPlacesError(
            lang === 'ar'
              ? 'لم يتم العثور على معطيات المواقع حالياً.'
              : 'Aucun prestataire géolocalisé retourné pour le moment.'
          );
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setPlacesError(
          lang === 'ar'
            ? 'تعذر تحميل بيانات المزودين عبر Places API.'
            : 'Impossible de charger les fiches prestataires. Vérifiez votre quota ou connexion.'
        );
      } finally {
        if (!cancelled) {
          setLoadingPlaces(false);
        }
      }
    };

    void loadDistrictProviders();
    return () => {
      cancelled = true;
    };
  }, [placesLib, lang, setProviders, setLoadingPlaces, setPlacesError]);

  useEffect(() => {
    if (!map || !coreLib || providers.length === 0 || hasFittedBoundsRef.current) return;
    const bounds = new coreLib.LatLngBounds();
    providers.forEach((p) => bounds.extend(p.position));
    map.fitBounds(bounds, 48);
    hasFittedBoundsRef.current = true;
  }, [map, coreLib, providers]);

  const activeProvider = useMemo(
    () => providers.find((p) => p.id === selectedId) || null,
    [providers, selectedId]
  );

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      defaultCenter={CASABLANCA_DEFAULT_CENTER}
      defaultZoom={11}
      gestureHandling="cooperative"
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={true}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      onClick={() => onCloseInfoWindow()}
      style={{ width: '100%', height: '100%' }}
    >
      {providers.map((provider) => (
        <DistrictAdvancedMarker
          key={provider.id}
          provider={provider}
          isSelected={provider.id === selectedId}
          isHovered={provider.id === hoveredId}
          onSelect={(p, marker) => {
            if (map) {
              map.panTo(p.position);
              if ((map.getZoom() || 11) < 13) {
                map.setZoom(13);
              }
            }
            onSelectProvider(p, marker);
          }}
          onHoverChange={setHoveredId}
          registerMarker={registerMarker}
        />
      ))}

      {activeProvider && selectedMarker && (
        <InfoWindow
          anchor={selectedMarker}
          maxWidth={290}
          pixelOffset={[0, -4]}
          onCloseClick={onCloseInfoWindow}
        >
          <div className="p-1 text-[#181715]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p className="text-[11px] font-medium text-[#9A7B3E]">
              {activeProvider.district} ·{' '}
              {lang === 'ar' ? activeProvider.categoryAr : activeProvider.categoryFr}
            </p>
            <h4 className="mt-1 font-serif text-lg font-semibold leading-snug text-[#181715]">
              {activeProvider.name}
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5C564E]">
              {activeProvider.address}
            </p>
            {activeProvider.phone && (
              <p className="mt-1.5 font-mono text-xs text-[#181715] tabular-nums">
                {activeProvider.phone}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

interface MapFocusBridgeProps {
  focusTarget: ResolvedProviderPlace | null;
}

const MapFocusBridge: React.FC<MapFocusBridgeProps> = ({ focusTarget }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !focusTarget) return;
    map.panTo(focusTarget.position);
    map.setZoom(13);
  }, [map, focusTarget]);

  return null;
};

export const DiscoverCasablancaSection: React.FC = () => {
  const { lang } = useApp();
  const [providers, setProviders] = useState<ResolvedProviderPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(Boolean(MAPS_API_KEY));
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [focusTarget, setFocusTarget] = useState<ResolvedProviderPlace | null>(null);

  const markersRegistryRef = React.useRef<
    Record<string, google.maps.marker.AdvancedMarkerElement | null>
  >({});
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const registerMarker = useCallback(
    (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => {
      markersRegistryRef.current[id] = marker;
    },
    []
  );

  useEffect(() => {
    if (providers.length > 0 && !selectedId) {
      setSelectedId(providers[0].id);
    }
  }, [providers, selectedId]);

  const activeProvider = useMemo(
    () => providers.find((p) => p.id === selectedId) || providers[0] || null,
    [providers, selectedId]
  );

  const handleSelectDistrict = (districtId: string) => {
    const found = providers.find((p) => p.id === districtId);
    setSelectedId(districtId);
    if (found) {
      setFocusTarget(found);
      const marker = markersRegistryRef.current[districtId] || null;
      setSelectedMarker(marker);
      setInfoOpen(Boolean(marker));
    }
  };

  return (
    <section
      id="discover-casablanca"
      aria-label="Discover Casablanca"
      className="border-y border-[#E5E0D8] bg-[#F2EFE9]/45 py-20"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#E5E0D8] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#9A7B3E] uppercase">
              {lang === 'ar' ? 'شبكة شركائنا في الدار البيضاء' : 'Réseau local · Grand Casablanca'}
            </p>
            <TextReveal
              as="h2"
              text={
                lang === 'ar'
                  ? 'اكتشف الدار البيضاء — موزعو الحفلات حسب الأحياء'
                  : 'Discover Casablanca — Prestataires par quartier'
              }
              className="mt-2 font-serif text-3xl font-semibold text-[#181715] sm:text-4xl"
            />
            <p className="mt-3 text-sm leading-relaxed text-[#5C564E]">
              {lang === 'ar'
                ? 'اضغطوا على أحد المؤشرات في المعاريف أو أنفا أو عين الذئاب أو بوسكورة أو كاليفورنيا لعرض بطاقة المزود ومعلوماته.'
                : 'Explorez nos adresses partenaires réparties entre Maarif, Anfa, Ain Diab, Bouskoura et Californie. Cliquez sur un marqueur pour consulter sa fiche et ses coordonnées.'}
            </p>
          </div>

          {/* District Quick Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {DISTRICT_CONFIGS.map((cfg) => {
              const isSelected = activeProvider?.id === cfg.id;
              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => handleSelectDistrict(cfg.id)}
                  className={`rounded-md border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'border-[#181715] bg-[#181715] text-[#FAF8F5]'
                      : 'border-[#E5E0D8] bg-white text-[#4A453E] hover:border-[#9A7B3E]'
                  }`}
                >
                  {cfg.district}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map + Provider Card Split */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Interactive Google Map Canvas */}
          <div className="relative h-[440px] w-full overflow-hidden rounded-xl border border-[#E5E0D8] bg-[#E8E2D6] lg:col-span-7 lg:h-[520px]">
            {!MAPS_API_KEY ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <MapPin className="h-8 w-8 text-[#9A7B3E]" strokeWidth={1.5} />
                <h3 className="mt-3 font-serif text-2xl font-semibold text-[#181715]">
                  {lang === 'ar'
                    ? 'مفتاح خرائط Google غير مهيأ'
                    : 'Carte interactive Google Maps non configurée'}
                </h3>
                <p className="mt-2 max-w-md text-sm text-[#5C564E]">
                  {lang === 'ar'
                    ? 'يرجى تهيئة مفتاح Google Maps API لعرض الخريطة التفاعلية لمزودي الخدمات في الدار البيضاء.'
                    : 'Veuillez configurer la clé Google Maps Platform afin d’afficher la carte interactive des prestataires de Casablanca.'}
                </p>
              </div>
            ) : (
              <APIProvider
                key={lang}
                apiKey={MAPS_API_KEY}
                libraries={['places', 'marker', 'core']}
                language={lang === 'ar' ? 'ar' : 'fr'}
                region="MA"
              >
                <CasablancaMapCanvas
                  lang={lang}
                  providers={providers}
                  setProviders={setProviders}
                  loadingPlaces={loadingPlaces}
                  setLoadingPlaces={setLoadingPlaces}
                  placesError={placesError}
                  setPlacesError={setPlacesError}
                  selectedId={activeProvider?.id || null}
                  onSelectProvider={(provider, marker) => {
                    setSelectedId(provider.id);
                    setSelectedMarker(marker);
                    setInfoOpen(true);
                  }}
                  registerMarker={registerMarker}
                  selectedMarker={infoOpen ? selectedMarker : null}
                  onCloseInfoWindow={() => setInfoOpen(false)}
                />
                <MapFocusBridge focusTarget={focusTarget} />
              </APIProvider>
            )}

            {loadingPlaces && (
              <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border border-[#E5E0D8] bg-white/95 px-3 py-2 text-xs font-medium text-[#181715] shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9A7B3E]" />
                <span>
                  {lang === 'ar'
                    ? 'جاري تحميل مواقع الأحياء...'
                    : 'Chargement des marqueurs Casablanca...'}
                </span>
              </div>
            )}
          </div>

          {/* Right Panel: Selected Provider Card + Neighborhood List */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E5E0D8] bg-white p-6 lg:col-span-5">
            {placesError && !activeProvider ? (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <MapPin className="h-7 w-7 text-[#9A7B3E]" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium text-[#181715]">{placesError}</p>
              </div>
            ) : activeProvider ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0ECE4] pb-4">
                  <div className="text-xs font-medium text-[#9A7B3E]">
                    <span>{activeProvider.district}</span>
                    <span aria-hidden="true" className="mx-2 text-[#C5B9A5]">
                      ·
                    </span>
                    <span>
                      {lang === 'ar' ? activeProvider.categoryAr : activeProvider.categoryFr}
                    </span>
                  </div>
                  {activeProvider.rating !== null && (
                    <div className="flex items-center gap-1 text-xs font-medium text-[#181715] tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span>{activeProvider.rating.toFixed(1)}</span>
                      {activeProvider.userRatingCount !== null && (
                        <span className="text-[#6B655C]">({activeProvider.userRatingCount})</span>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="mt-4 font-serif text-2xl font-semibold text-[#181715]">
                  {activeProvider.name}
                </h3>

                {activeProvider.googleCategory && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6B655C]">
                    <Building2 className="h-3.5 w-3.5 text-[#9A7B3E]" />
                    <span>{activeProvider.googleCategory}</span>
                  </p>
                )}

                <dl className="mt-5 space-y-3.5 border-t border-[#F0ECE4] pt-5 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                    <div>
                      <dt className="text-xs font-medium text-[#6B655C]">
                        {lang === 'ar' ? 'العنوان' : 'Adresse'}
                      </dt>
                      <dd className="mt-0.5 text-[#181715]">{activeProvider.address}</dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                    <div>
                      <dt className="text-xs font-medium text-[#6B655C]">
                        {lang === 'ar' ? 'الهاتف' : 'Téléphone'}
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs text-[#181715] tabular-nums">
                        {activeProvider.phone ? (
                          <a
                            href={`tel:${activeProvider.phone.replace(/\s+/g, '')}`}
                            className="hover:text-[#9A7B3E] hover:underline"
                          >
                            {activeProvider.phone}
                          </a>
                        ) : (
                          <span className="font-sans text-[#6B655C]">
                            {lang === 'ar'
                              ? 'متوفر عبر خدمة التنسيق EVENT PRO'
                              : 'Coordonnées directes via conciergerie EVENT PRO'}
                          </span>
                        )}
                      </dd>
                    </div>
                  </div>

                  {activeProvider.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-[#6B655C]">
                          {lang === 'ar' ? 'الموقع الإلكتروني' : 'Site officiel'}
                        </dt>
                        <dd className="mt-0.5 truncate">
                          <a
                            href={activeProvider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#9A7B3E] hover:underline"
                          >
                            {activeProvider.website.replace(/^https?:\/\//, '')}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B3E]" />
                    <div>
                      <dt className="text-xs font-medium text-[#6B655C]">
                        {lang === 'ar' ? 'الإحداثيات الجغرافية' : 'Coordonnées GPS'}
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs text-[#4A453E] tabular-nums">
                        {activeProvider.position.lat.toFixed(5)},{' '}
                        {activeProvider.position.lng.toFixed(5)}
                      </dd>
                    </div>
                  </div>
                </dl>

                {activeProvider.attributions.length > 0 && (
                  <p className="mt-4 text-[11px] text-[#6B655C]">
                    Source :{' '}
                    {activeProvider.attributions.map((attr, idx) => (
                      <React.Fragment key={`${attr.provider}-${idx}`}>
                        {idx > 0 && ', '}
                        {attr.providerURI ? (
                          <a
                            href={attr.providerURI}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#181715]"
                          >
                            {attr.provider}
                          </a>
                        ) : (
                          attr.provider
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-center py-8 text-sm text-[#5C564E]">
                {loadingPlaces
                  ? lang === 'ar'
                    ? 'جاري جلب معطيات الشركاء في أحياء الدار البيضاء...'
                    : 'Recherche des prestataires dans les 5 quartiers de Casablanca...'
                  : lang === 'ar'
                    ? 'اختر علامة على الخريطة لعرض التفاصيل.'
                    : 'Sélectionnez un marqueur sur la carte pour afficher la fiche du prestataire.'}
              </div>
            )}

            {/* Footer Action Strip inside Provider Panel */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E0D8] pt-5">
              <Link
                to={`/devis?service=${encodeURIComponent(
                  activeProvider
                    ? `${activeProvider.categoryFr} (${activeProvider.district})`
                    : 'Organisation complète'
                )}`}
                className="inline-flex items-center gap-2 rounded-md bg-[#9A7B3E] px-4 py-2.5 text-xs font-medium text-[#FAF8F5] transition-colors hover:bg-[#7D622F] whitespace-nowrap shrink-0"
              >
                <span>
                  {lang === 'ar' ? 'طلب عرض لهذا الحي' : 'Demander un devis sur ce secteur'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {activeProvider?.googleMapsUri && (
                <a
                  href={activeProvider.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#181715] underline decoration-[#C5B9A5] underline-offset-4 hover:text-[#9A7B3E] whitespace-nowrap shrink-0"
                >
                  <span>{lang === 'ar' ? 'عرض في خرائط Google' : 'Ouvrir dans Google Maps'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

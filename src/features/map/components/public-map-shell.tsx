"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import logo from "@/assets/logo.png";

const MapCanvas = dynamic(
  () => import("@/features/map/components/map-canvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => <div className="h-[380px] w-full animate-pulse rounded-2xl bg-slate-100" />
  }
);

type Point = {
  id: string;
  publicSlug: string;
  latitude: number;
  longitude: number;
  operationalStatus: string;
  distanceKm: number;
  primaryPhone: string;
};

type GeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  locale: string;
  dict: Record<string, string>;
};

type LocationSource = "manual" | "search" | "map" | "gps";

const GLOBAL_CONFIRMED_ZOOM_THRESHOLD = 6;
type ViewMode = "nearby" | "all";

export function PublicMapShell({ locale, dict }: Props) {
  const [latitude, setLatitude] = useState("36.7538");
  const [longitude, setLongitude] = useState("3.0588");
  const [radius, setRadius] = useState("20");
  const [placeQuery, setPlaceQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(dict["public.selectedManual"]);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [places, setPlaces] = useState<GeocodeResult[]>([]);
  const [results, setResults] = useState<Point[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState("");
  const [placeError, setPlaceError] = useState("");
  const [activeSource, setActiveSource] = useState<LocationSource>("manual");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [selectedPointDetails, setSelectedPointDetails] = useState<{
    id: string;
    title: string;
    address: string;
    wilaya: string;
    commune: string;
    primaryPhone: string;
  } | null>(null);
  const [loadingPointDetails, setLoadingPointDetails] = useState(false);
  const [pointDetailsError, setPointDetailsError] = useState("");
  const pathname = usePathname();
  const nearbyRequestIdRef = useRef(0);
  const geocodeRequestIdRef = useRef(0);
  const initialLoadDoneRef = useRef(false);
  const nearbyAbortRef = useRef<AbortController | null>(null);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  const localeOptions = useMemo(
    () =>
      SUPPORTED_LOCALES.map((code) => ({
        code,
        label: dict[`locale.label.${code}`] ?? code
      })),
    [dict]
  );

  const hasResults = results.length > 0;
  const parsedLatitude = parseCoordinate(latitude, -90, 90);
  const parsedLongitude = parseCoordinate(longitude, -180, 180);
  const mapLatitude = parsedLatitude ?? 36.7538;
  const mapLongitude = parsedLongitude ?? 3.0588;
  const pointMarkers = useMemo(
    () =>
      results.map((point) => ({
        id: point.id,
        latitude: point.latitude,
        longitude: point.longitude,
        label: point.publicSlug
      })),
    [results]
  );

  const sideItems = useMemo(() => (hasResults ? results : places.map((p, index) => ({
    id: `geo-${index}`,
    publicSlug: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    operationalStatus: "OPEN",
    distanceKm: 0,
    primaryPhone: dict["public.samplePhone"]
  }))), [dict, hasResults, places, results]);

  const loadNearby = useCallback(
    async (lat: string, lng: string, nextRadius: string, label: string, source: LocationSource) => {
      nearbyRequestIdRef.current += 1;
      const requestId = nearbyRequestIdRef.current;
      nearbyAbortRef.current?.abort();
      const controller = new AbortController();
      nearbyAbortRef.current = controller;

      setLoadingNearby(true);
      setError("");

      try {
        const response = await fetch(
          `/api/aid-points/nearby?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&radius=${encodeURIComponent(nextRadius)}`,
          {
            headers: { "accept-language": locale },
            signal: controller.signal
          }
        );

        if (requestId !== nearbyRequestIdRef.current) {
          return;
        }

        const payload = (await response.json()) as {
          success: boolean;
          data?: Point[];
          error?: { message: string };
        };

        if (!payload.success) {
          setResults([]);
          setError(payload.error?.message ?? dict["common.error"]);
          return;
        }

        setResults(payload.data ?? []);
        setSelectedPoint(null);
        setSelectedLabel(label);
        setActiveSource(source);
      } catch {
        if (requestId !== nearbyRequestIdRef.current) {
          return;
        }
        setResults([]);
        setError(dict["common.networkError"]);
      } finally {
        if (requestId === nearbyRequestIdRef.current) {
          setLoadingNearby(false);
        }
      }
    },
    [dict, locale]
  );

  const loadConfirmed = useCallback(
    async (lat: string, lng: string, label: string, source: LocationSource) => {
      nearbyRequestIdRef.current += 1;
      const requestId = nearbyRequestIdRef.current;
      nearbyAbortRef.current?.abort();
      const controller = new AbortController();
      nearbyAbortRef.current = controller;

      setLoadingNearby(true);
      setError("");

      try {
        const response = await fetch(
          `/api/aid-points/confirmed?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}`,
          {
            headers: { "accept-language": locale },
            signal: controller.signal
          }
        );

        if (requestId !== nearbyRequestIdRef.current) {
          return;
        }

        const payload = (await response.json()) as {
          success: boolean;
          data?: Point[];
          error?: { message: string };
        };

        if (!payload.success) {
          setResults([]);
          setError(payload.error?.message ?? dict["common.error"]);
          return;
        }

        setResults(payload.data ?? []);
        setSelectedPoint(null);
        setSelectedLabel(label);
        setActiveSource(source);
      } catch {
        if (requestId !== nearbyRequestIdRef.current) {
          return;
        }
        setResults([]);
        setError(dict["common.networkError"]);
      } finally {
        if (requestId === nearbyRequestIdRef.current) {
          setLoadingNearby(false);
        }
      }
    },
    [dict, locale]
  );

  useEffect(() => {
    return () => {
      nearbyAbortRef.current?.abort();
      geocodeAbortRef.current?.abort();
    };
  }, []);

  const applyLocation = useCallback(
    (input: {
      lat: string;
      lng: string;
      label: string;
      source: LocationSource;
      gpsAccuracy?: number | null;
      keepPlaceQuery?: boolean;
    }) => {
      setLatitude(input.lat);
      setLongitude(input.lng);
      setSelectedLabel(input.label);
      setActiveSource(input.source);
      setGpsAccuracyMeters(input.gpsAccuracy ?? null);
      if (!input.keepPlaceQuery) {
        setPlaceQuery("");
      }
      setPlaces([]);
      setPlaceError("");
    },
    []
  );

  function getLocalizedPath(targetLocale: AppLocale) {
    if (!pathname) {
      return `/${targetLocale}`;
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as AppLocale)) {
      segments[0] = targetLocale;
      return `/${segments.join("/")}`;
    }

    return `/${targetLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  }

  async function onPlaceSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = placeQuery.trim();

    if (!query) {
      setPlaceError(dict["validation.invalidPlaceQuery"]);
      setPlaces([]);
      return;
    }

    geocodeRequestIdRef.current += 1;
    const requestId = geocodeRequestIdRef.current;
    geocodeAbortRef.current?.abort();
    const controller = new AbortController();
    geocodeAbortRef.current = controller;

    setLoadingPlaces(true);
    setPlaceError("");
    setError("");

    try {
      const response = await fetch(`/api/aid-points/geocode?q=${encodeURIComponent(query)}`, {
        headers: { "accept-language": locale },
        signal: controller.signal
      });

      if (requestId !== geocodeRequestIdRef.current) {
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: GeocodeResult[];
        error?: { message: string };
      };

      if (!payload.success) {
        setPlaceError(payload.error?.message ?? dict["common.error"]);
        setPlaces([]);
        return;
      }

      const nextPlaces = payload.data ?? [];
      setPlaces(nextPlaces);
      if (nextPlaces.length === 0) {
        setPlaceError(dict["public.placeSearchEmpty"]);
      }
    } catch {
      if (requestId !== geocodeRequestIdRef.current) {
        return;
      }
      setPlaceError(dict["common.networkError"]);
      setPlaces([]);
    } finally {
      if (requestId === geocodeRequestIdRef.current) {
        setLoadingPlaces(false);
      }
    }
  }

  function onPlacePick(place: GeocodeResult) {
    const lat = place.latitude.toFixed(6);
    const lng = place.longitude.toFixed(6);
    applyLocation({
      lat,
      lng,
      label: place.name,
      source: "search",
      gpsAccuracy: null,
      keepPlaceQuery: true
    });
    setPlaceQuery(place.name);
    if (viewMode === "all") {
      void loadConfirmed(lat, lng, place.name, "search");
      return;
    }
    void loadNearby(lat, lng, radius, place.name, "search");
  }

  const onMapSelect = useCallback(
    (lat: number, lng: number) => {
      const nextLat = lat.toFixed(6);
      const nextLng = lng.toFixed(6);
      applyLocation({
        lat: nextLat,
        lng: nextLng,
        label: dict["public.selectedFromMap"],
        source: "map",
        gpsAccuracy: null
      });
      if (viewMode === "all") {
        void loadConfirmed(nextLat, nextLng, dict["public.selectedFromMap"], "map");
        return;
      }
      void loadNearby(nextLat, nextLng, radius, dict["public.selectedFromMap"], "map");
    },
    [applyLocation, dict, loadConfirmed, loadNearby, radius, viewMode]
  );

  async function onUseMyLocation() {
    if (!window.confirm(dict["gps.consentPrompt"])) {
      return;
    }

    if (!navigator.geolocation) {
      setError(dict["gps.unsupported"]);
      return;
    }

    try {
      const position = await requestBestPosition();
      const outOfAlgeria = !isLikelyInAlgeria(position.coords.latitude, position.coords.longitude);
      if (outOfAlgeria) {
        setError(dict["gps.outsideAlgeria"]);
        return;
      }

      if (position.coords.accuracy > 1500) {
        setError(dict["gps.lowAccuracy"]);
        return;
      }

      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      applyLocation({
        lat,
        lng,
        label: dict["public.selectedFromGps"],
        source: "gps",
        gpsAccuracy: Math.round(position.coords.accuracy)
      });
      if (viewMode === "all") {
        void loadConfirmed(lat, lng, dict["public.selectedFromGps"], "gps");
        return;
      }
      void loadNearby(lat, lng, radius, dict["public.selectedFromGps"], "gps");
    } catch (geoError) {
      setError(resolveGeoErrorMessage(geoError, dict));
    }
  }

  function onRadiusChange(nextRadius: string) {
    setRadius(nextRadius);
    if (parsedLatitude === null || parsedLongitude === null) {
      setError(dict["validation.invalidNearbyQuery"]);
      return;
    }
    if (viewMode === "all") {
      void loadConfirmed(latitude, longitude, selectedLabel, activeSource);
      return;
    }
    void loadNearby(latitude, longitude, nextRadius, selectedLabel, activeSource);
  }

  function onViewModeChange(nextMode: ViewMode) {
    setViewMode(nextMode);

    if (parsedLatitude === null || parsedLongitude === null) {
      return;
    }

    const nextLat = parsedLatitude.toFixed(6);
    const nextLng = parsedLongitude.toFixed(6);

    if (nextMode === "all") {
      void loadConfirmed(nextLat, nextLng, selectedLabel, activeSource);
      return;
    }

    void loadNearby(nextLat, nextLng, radius, selectedLabel, activeSource);
  }

  const onMapZoomChange = useCallback(
    (zoom: number) => {
      if (parsedLatitude === null || parsedLongitude === null) {
        return;
      }

      const nextLat = parsedLatitude.toFixed(6);
      const nextLng = parsedLongitude.toFixed(6);

      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        if (viewMode === "all") {
          void loadConfirmed(nextLat, nextLng, selectedLabel, activeSource);
        } else {
          void loadNearby(nextLat, nextLng, radius, selectedLabel, activeSource);
        }
      }

      if (zoom <= GLOBAL_CONFIRMED_ZOOM_THRESHOLD) {
        if (viewMode === "all") {
          return;
        }

        setViewMode("all");
        void loadConfirmed(nextLat, nextLng, selectedLabel, activeSource);
        return;
      }

      if (viewMode !== "all") {
        return;
      }

      setViewMode("nearby");
      void loadNearby(nextLat, nextLng, radius, selectedLabel, activeSource);
    },
    [
      activeSource,
      loadConfirmed,
      loadNearby,
      parsedLatitude,
      parsedLongitude,
      radius,
      selectedLabel,
      viewMode
    ]
  );

  function onCoordinateInputChange(kind: "lat" | "lng", value: string) {
    if (kind === "lat") {
      setLatitude(value);
    } else {
      setLongitude(value);
    }

    setGpsAccuracyMeters(null);
    setError("");

    const nextLat = kind === "lat" ? parseCoordinate(value, -90, 90) : parsedLatitude;
    const nextLng = kind === "lng" ? parseCoordinate(value, -180, 180) : parsedLongitude;

    if (nextLat !== null && nextLng !== null) {
      setSelectedLabel(dict["public.selectedManual"]);
      setActiveSource("manual");
    }
  }

  function onManualCoordinatesSearch() {
    if (parsedLatitude === null || parsedLongitude === null) {
      setError(dict["validation.invalidNearbyQuery"]);
      return;
    }

    const nextLat = parsedLatitude.toFixed(6);
    const nextLng = parsedLongitude.toFixed(6);
    if (viewMode === "all") {
      void loadConfirmed(nextLat, nextLng, dict["public.selectedManual"], "manual");
      return;
    }
    void loadNearby(nextLat, nextLng, radius, dict["public.selectedManual"], "manual");
  }

  const onPointSelect = useCallback(
    async (pointId: string) => {
      const point = results.find((item) => item.id === pointId);
      if (!point) {
        return;
      }

      setSelectedPoint(point);
      setPointDetailsError("");
      setLoadingPointDetails(true);

      try {
        const response = await fetch(`/api/aid-points/${pointId}`, {
          headers: { "accept-language": locale }
        });

        const payload = (await response.json()) as {
          success: boolean;
          data?: {
            primaryPhone?: string;
            translations?: Array<{
              locale: string;
              name: string;
              address: string;
              wilaya: string;
              commune: string;
            }>;
          };
          error?: { message: string };
        };

        if (!payload.success || !payload.data) {
          setPointDetailsError(payload.error?.message ?? dict["common.error"]);
          setSelectedPointDetails(null);
          return;
        }

        const exact = payload.data.translations?.find((item) => item.locale === locale);
        const fallback = payload.data.translations?.[0];
        const chosen = exact ?? fallback;

        setSelectedPointDetails({
          id: point.id,
          title: chosen?.name ?? point.publicSlug,
          address: chosen?.address ?? "",
          wilaya: chosen?.wilaya ?? "",
          commune: chosen?.commune ?? "",
          primaryPhone: payload.data.primaryPhone ?? point.primaryPhone
        });
      } catch {
        setPointDetailsError(dict["common.networkError"]);
        setSelectedPointDetails(null);
      } finally {
        setLoadingPointDetails(false);
      }
    },
    [dict, locale, results]
  );

  return (
    <main className="min-h-dvh w-full bg-[#f6faf6] text-slate-900">
      <section className="w-full px-2 py-2 md:px-3 md:py-3">
        <header className="border-b border-[#dfe7df] pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image alt={dict["app.title"]} className="h-10 w-10 rounded-lg border border-[#dfe7df] bg-white p-1" priority src={logo} />
              <div>
                <h1 className="text-xl font-semibold text-[#006233] md:text-2xl">{dict["public.title"]}</h1>
                <p className="mt-0.5 text-sm text-slate-600">{dict["public.subtitle"]}</p>
              </div>
            </div>
            <div className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#dfe7df] bg-[#f4f8f4] p-1">
              {localeOptions.map((option) => {
                const isActive = option.code === locale;
                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition md:text-sm ${
                      isActive ? "bg-[#006233] text-white" : "text-slate-700 hover:bg-[#e7f2e9]"
                    }`}
                    href={getLocalizedPath(option.code)}
                    key={option.code}
                  >
                    {option.label}
                  </a>
                );
              })}
            </div>
          </div>

          <form className="mt-2 flex flex-col gap-2 xl:flex-row" onSubmit={onPlaceSearch}>
            <label className="sr-only" htmlFor="place-search">
              {dict["public.placeName"]}
            </label>
            <input
              className="min-h-11 w-full rounded-xl border border-[#d7e5d9] px-3 py-2 text-sm outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#dceedd]"
              id="place-search"
              onChange={(event) => setPlaceQuery(event.target.value)}
              placeholder={dict["public.placePlaceholder"]}
              value={placeQuery}
            />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#006233] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loadingPlaces}
              type="submit"
            >
              <SearchIcon className="h-4 w-4" />
              {loadingPlaces ? dict["public.searchingPlace"] : dict["public.searchPlace"]}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d21034] px-4 py-2 text-sm font-semibold text-[#d21034] hover:bg-[#fff2f5]"
              onClick={() => void onUseMyLocation()}
              type="button"
            >
              <LocateIcon className="h-4 w-4" />
              {dict["public.useMyLocation"]}
            </button>
          </form>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-slate-600" htmlFor="radius-select">
              {dict["public.radius"]}
            </label>
            <select
              className="min-h-10 rounded-lg border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
              id="radius-select"
              onChange={(event) => onRadiusChange(event.target.value)}
              value={radius}
            >
              <option value="10">{dict["public.radius.10km"]}</option>
              <option value="20">{dict["public.radius.20km"]}</option>
              <option value="50">{dict["public.radius.50km"]}</option>
              <option value="100">{dict["public.radius.100km"]}</option>
            </select>
            <span className="rounded-full border border-[#d7e5d9] bg-[#f4f8f4] px-3 py-1 text-xs text-slate-600">
              {selectedLabel}
            </span>
            <div className="inline-flex rounded-lg border border-[#d7e5d9] bg-white p-0.5">
              <button
                className={`min-h-9 rounded-md px-2.5 text-xs font-semibold ${viewMode === "nearby" ? "bg-[#006233] text-white" : "text-slate-700"}`}
                onClick={() => onViewModeChange("nearby")}
                type="button"
              >
                {dict["public.viewNearby"]}
              </button>
              <button
                className={`min-h-9 rounded-md px-2.5 text-xs font-semibold ${viewMode === "all" ? "bg-[#006233] text-white" : "text-slate-700"}`}
                onClick={() => onViewModeChange("all")}
                type="button"
              >
                {dict["public.viewAll"]}
              </button>
            </div>
            {gpsAccuracyMeters ? (
              <span className="rounded-full border border-[#f7c9d3] bg-[#fff2f5] px-3 py-1 text-xs text-[#8f1028]">
                {dict["public.gpsAccuracy"].replace("{meters}", String(gpsAccuracyMeters))}
              </span>
            ) : null}
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              aria-label={dict["public.latitude"]}
              className="min-h-10 rounded-lg border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
              onChange={(event) => onCoordinateInputChange("lat", event.target.value)}
              placeholder={dict["public.latitude"]}
              value={latitude}
            />
            <input
              aria-label={dict["public.longitude"]}
              className="min-h-10 rounded-lg border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
              onChange={(event) => onCoordinateInputChange("lng", event.target.value)}
              placeholder={dict["public.longitude"]}
              value={longitude}
            />
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#006233] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loadingNearby || parsedLatitude === null || parsedLongitude === null}
              onClick={onManualCoordinatesSearch}
              type="button"
            >
              {dict["public.search"]}
            </button>
          </div>

          {placeError ? <p className="mt-2 text-sm text-[#b91c1c]">{placeError}</p> : null}
          <p className="mt-2 text-xs text-slate-500">{dict["public.mapPickHint"]}</p>

          {places.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {places.map((place) => (
                <li key={`${place.name}:${place.latitude}:${place.longitude}`}>
                  <button
                    className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[#d7e5d9] bg-[#fafdfa] px-3 py-2 text-left text-sm hover:bg-[#eef7ef]"
                    onClick={() => onPlacePick(place)}
                    type="button"
                  >
                    <span className="line-clamp-1">{place.name}</span>
                    <span className="text-xs text-slate-500">{place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <section className="mt-2 grid w-full gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-xl border border-[#dfe7df] bg-white p-2">
            <MapCanvas
              className="h-[55vh] w-full rounded-lg border border-slate-200 md:h-[62vh] xl:h-[74vh]"
              latitude={mapLatitude}
              longitude={mapLongitude}
              onLocationSelect={onMapSelect}
              onPointSelect={onPointSelect}
              onZoomChange={onMapZoomChange}
              showAllMode={viewMode === "all"}
              points={pointMarkers}
            />
          </div>

          <aside aria-live="polite" className="rounded-xl border border-[#dfe7df] bg-white p-3 xl:h-[70vh] xl:overflow-y-auto">
            <p className="mb-2 text-sm font-semibold text-[#006233]">
              {dict["public.resultsCount"].replace("{count}", String(results.length))}
            </p>
            {viewMode === "all" ? <p className="mb-2 text-xs text-slate-600">{dict["public.allConfirmedVisible"]}</p> : null}
            {loadingNearby ? <p className="text-sm text-slate-700">{dict["common.loading"]}</p> : null}
            {!loadingNearby && error ? <p className="text-sm text-[#b91c1c]">{error}</p> : null}
            {!loadingNearby && !error && !hasResults ? <p className="text-sm text-slate-700">{dict["public.empty"]}</p> : null}
            {!loadingNearby && !error && hasResults ? (
              <ul className="space-y-1.5">
                {sideItems.map((point) => (
                  <li className="rounded-lg border border-[#d7e5d9] p-2" key={point.id}>
                    <button
                      className="w-full text-left"
                      onClick={() => {
                        if (point.id.startsWith("geo-")) return;
                        void onPointSelect(point.id);
                      }}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-[#0f5132]">{point.publicSlug}</span>
                        {!point.id.startsWith("geo-") ? <span className="text-xs text-slate-500">{point.distanceKm.toFixed(1)} km</span> : null}
                      </div>
                      {!point.id.startsWith("geo-") ? (
                        <p className="mt-1 text-xs text-slate-600">{dict[`aidPoint.status.${point.operationalStatus}`] ?? point.operationalStatus}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        </section>

        {selectedPoint ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3" onClick={() => setSelectedPoint(null)}>
            <article className="w-full max-w-md rounded-xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-[#006233]">{dict["public.pointDetails"]}</h2>
                <button className="rounded-md border border-[#d7e5d9] px-2 py-1 text-xs" onClick={() => setSelectedPoint(null)} type="button">
                  {dict["form.close"]}
                </button>
              </div>
              {loadingPointDetails ? <p className="mt-3 text-sm text-slate-700">{dict["common.loading"]}</p> : null}
              {!loadingPointDetails && pointDetailsError ? <p className="mt-3 text-sm text-[#b91c1c]">{pointDetailsError}</p> : null}
              {!loadingPointDetails && !pointDetailsError ? (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-semibold text-slate-900">{selectedPointDetails?.title ?? selectedPoint.publicSlug}</p>
                  {selectedPointDetails?.address ? <p className="text-slate-700">{selectedPointDetails.address}</p> : null}
                  <p className="text-slate-600">
                    {(selectedPointDetails?.wilaya ?? "").trim()} {(selectedPointDetails?.commune ?? "").trim()}
                  </p>
                  <p className="text-slate-700">{dict[`aidPoint.status.${selectedPoint.operationalStatus}`] ?? selectedPoint.operationalStatus}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <a
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#d7e5d9] px-3 py-2"
                      href={`tel:${selectedPointDetails?.primaryPhone ?? selectedPoint.primaryPhone ?? dict["public.samplePhone"]}`}
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                      {dict["public.call"]}
                    </a>
                    <a
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#d7e5d9] px-3 py-2"
                      href={`https://www.google.com/maps?q=${selectedPoint.latitude},${selectedPoint.longitude}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <MapIcon className="h-3.5 w-3.5" />
                      {dict["public.openMaps"]}
                    </a>
                    <a className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#d7e5d9] px-3 py-2" href={`/${locale}/aid-points/${selectedPoint.publicSlug}`}>
                      {dict["public.openDetails"]}
                    </a>
                  </div>
                </div>
              ) : null}
            </article>
          </div>
        ) : null}

        <section className="mt-2 text-center">
          <button
            className="w-full rounded-lg border border-[#cde4d2] bg-white px-3 py-3 text-sm leading-7 text-[#0f5132] hover:bg-[#f4faf5]"
            type="button"
          >
            <span className="block">{dict["public.quranVerse"]}</span>
            <span className="mt-1 block text-xs text-slate-500">{dict["public.quranVerseRef"]}</span>
          </button>
        </section>

        <footer className="mt-2 border-t border-[#dfe7df] pt-2 text-sm">
          <h2 className="font-semibold text-slate-900">{dict["legal.linksTitle"]}</h2>
          <nav className="mt-2 flex flex-wrap gap-3 text-slate-700">
            <a className="underline" href={`/${locale}/privacy`}>
              {dict["legal.privacy.title"]}
            </a>
            <a className="underline" href={`/${locale}/terms`}>
              {dict["legal.terms.title"]}
            </a>
            <a className="underline" href={`/${locale}/cookies`}>
              {dict["legal.cookies.title"]}
            </a>
            <a className="underline" href={`/${locale}/report-issue`}>
              {dict["nav.reportIssue"]}
            </a>
          </nav>
          <div className="mt-2 flex flex-wrap gap-3 text-slate-700">
            <a className="underline" href="https://wahid-slimani.com" rel="noreferrer" target="_blank">
              {dict["public.contactWebsite"]}
            </a>
            <a className="underline" href="https://instagram.com/wahid___slimani" rel="noreferrer" target="_blank">
              {dict["public.contactInstagram"]}
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

function parseCoordinate(value: string, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

function requestBestPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    let bestPosition: GeolocationPosition | null = null;

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        const inAlgeria = isLikelyInAlgeria(position.coords.latitude, position.coords.longitude);
        if (position.coords.accuracy <= 35 && inAlgeria) {
          navigator.geolocation.clearWatch(watcherId);
          window.clearTimeout(timeoutId);
          resolve(position);
        }
      },
      () => {
        navigator.geolocation.clearWatch(watcherId);
        window.clearTimeout(timeoutId);

        navigator.geolocation.getCurrentPosition(
          (fallback) => resolve(fallback),
          (fallbackError) => reject(fallbackError),
          { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 0
      }
    );

    const timeoutId = window.setTimeout(() => {
      navigator.geolocation.clearWatch(watcherId);
      if (bestPosition) {
        resolve(bestPosition);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (fallback) => resolve(fallback),
        () => reject(new DOMException("Location timeout", "TimeoutError")),
        { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 }
      );
    }, 12_000);
  });
}

function isLikelyInAlgeria(latitude: number, longitude: number) {
  return latitude >= 18.8 && latitude <= 37.4 && longitude >= -8.9 && longitude <= 12.3;
}

function resolveGeoErrorMessage(error: unknown, dict: Record<string, string>) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: number }).code;
    if (code === 1) {
      return dict["gps.permissionDenied"];
    }
    if (code === 3) {
      return dict["gps.timeout"];
    }
  }

  return dict["gps.unavailable"];
}

type IconProps = {
  className?: string;
};

function SearchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function LocateIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h1.7a1.5 1.5 0 0 1 1.46 1.16l.64 2.79a1.5 1.5 0 0 1-.43 1.42l-1.2 1.2a14.2 14.2 0 0 0 5.77 5.77l1.2-1.2a1.5 1.5 0 0 1 1.42-.43l2.79.64A1.5 1.5 0 0 1 21 15.8v1.7A2.5 2.5 0 0 1 18.5 20h-1C10.6 20 4 13.4 4 6.5v-1Z" />
    </svg>
  );
}

function MapIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z" />
      <path d="M9 4v14m6-12v14" />
    </svg>
  );
}

// Share icon intentionally removed from current compact list UI.

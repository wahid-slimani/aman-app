"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import dynamic from "next/dynamic";

const MapCanvas = dynamic(
  () => import("@/features/map/components/map-canvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full animate-pulse rounded-lg bg-slate-200" />
  }
);

type Point = {
  id: string;
  publicSlug: string;
  latitude: number;
  longitude: number;
  operationalStatus: string;
  distanceKm: number;
};

type Props = {
  locale: string;
  dict: Record<string, string>;
};

export function PublicMapShell({ locale, dict }: Props) {
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [radius, setRadius] = useState<string>("20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<Point[]>([]);

  const hasResults = useMemo(() => results.length > 0, [results.length]);

  async function loadNearby(lat: string, lng: string, r: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/aid-points/nearby?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&radius=${encodeURIComponent(r)}`,
        { headers: { "accept-language": locale } }
      );
      const payload = (await response.json()) as { success: boolean; data?: Point[]; error?: { message: string } };

      if (!payload.success) {
        setResults([]);
        setError(payload.error?.message ?? dict["common.error"]);
        return;
      }

      setResults(payload.data ?? []);
    } catch {
      setError(dict["common.networkError"]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function onManualSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadNearby(latitude, longitude, radius);
  }

  function onUseMyLocation() {
    if (!navigator.geolocation) {
      setError(dict["gps.unsupported"]);
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const lng = String(position.coords.longitude);
        setLatitude(lat);
        setLongitude(lng);
        void loadNearby(lat, lng, radius);
      },
      (geoError) => {
        const nextError =
          geoError.code === geoError.PERMISSION_DENIED
            ? dict["gps.permissionDenied"]
            : geoError.code === geoError.TIMEOUT
              ? dict["gps.timeout"]
              : dict["gps.unavailable"];
        setError(nextError);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8_000
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
        <header className="rounded-xl bg-white p-4 shadow-sm">
          <h1 className="text-xl font-semibold">{dict["public.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["public.subtitle"]}</p>
        </header>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={onManualSearch}>
            <input
              aria-label={dict["public.latitude"]}
              className="rounded-lg border border-slate-300 px-3 py-2"
              onChange={(event) => setLatitude(event.target.value)}
              placeholder={dict["public.latitude"]}
              value={latitude}
            />
            <input
              aria-label={dict["public.longitude"]}
              className="rounded-lg border border-slate-300 px-3 py-2"
              onChange={(event) => setLongitude(event.target.value)}
              placeholder={dict["public.longitude"]}
              value={longitude}
            />
            <select
              aria-label={dict["public.radius"]}
              className="rounded-lg border border-slate-300 px-3 py-2"
              onChange={(event) => setRadius(event.target.value)}
              value={radius}
            >
              <option value="10">{dict["public.radius.10km"]}</option>
              <option value="20">{dict["public.radius.20km"]}</option>
              <option value="50">{dict["public.radius.50km"]}</option>
              <option value="100">{dict["public.radius.100km"]}</option>
            </select>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" disabled={loading} type="submit">
              {dict["public.search"]}
            </button>
          </form>

          <div className="mt-3 flex gap-2">
            <button className="rounded-lg border border-slate-300 px-4 py-2" disabled={loading} onClick={onUseMyLocation} type="button">
              {dict["public.useMyLocation"]}
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <MapCanvas latitude={Number(latitude || 36.7538)} longitude={Number(longitude || 3.0588)} />
        </section>

        <section aria-live="polite" className="rounded-xl bg-white p-4 shadow-sm">
          {loading ? <p>{dict["common.loading"]}</p> : null}
          {!loading && error ? <p className="text-rose-700">{error}</p> : null}
          {!loading && !error && !hasResults ? <p>{dict["public.empty"]}</p> : null}
          {!loading && !error && hasResults ? (
            <ul className="space-y-2">
              {results.map((point) => (
                <li className="rounded-lg border border-slate-200 p-3" key={point.id}>
                  <div className="flex items-center justify-between gap-3">
                    <a className="font-medium underline" href={`/${locale}/aid-points/${point.publicSlug}`}>
                      {point.publicSlug}
                    </a>
                    <span className="text-sm text-slate-600">{point.distanceKm.toFixed(1)} km</span>
                  </div>
                  <p className="text-sm text-slate-700">{point.operationalStatus}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <a className="rounded border border-slate-300 px-2 py-1" href={`tel:${dict["public.samplePhone"]}`}>
                      {dict["public.call"]}
                    </a>
                    <a
                      className="rounded border border-slate-300 px-2 py-1"
                      href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {dict["public.openMaps"]}
                    </a>
                    <button className="rounded border border-slate-300 px-2 py-1" type="button">
                      {dict["public.share"]}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </main>
  );
}

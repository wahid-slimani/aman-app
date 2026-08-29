"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import dynamic from "next/dynamic";
import { SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

const MapCanvas = dynamic(
  () => import("@/features/map/components/map-canvas").then((m) => m.MapCanvas),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-slate-100" /> }
);

type Translation = {
  locale: "ar-DZ" | "fr-DZ" | "tzm-DZ";
  name: string;
  address: string;
  wilaya: string;
  commune: string;
  description: string;
  neededItems: string;
};

type Props = {
  dict: Record<string, string>;
  initialId?: string;
  initialData?: {
    publicSlug: string;
    primaryPhone: string;
    secondaryPhone?: string | null;
    whatsappPhone?: string | null;
    googleMapsUrl?: string | null;
    latitude: number;
    longitude: number;
    version: number;
    translations: Array<{ locale: string; name: string; address: string; wilaya: string; commune: string; description?: string | null; neededItems?: string | null }>;
  };
};

const DEFAULT_LAT = 36.7538;
const DEFAULT_LNG = 3.0588;

function buildLocaleScopedPath(pathname: string, target: string) {
  const [, maybeLocale] = pathname.split("/");
  if (SUPPORTED_LOCALES.includes(maybeLocale as AppLocale)) {
    return `/${maybeLocale}${target}`;
  }
  return target;
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function parseCoordinate(raw: string, min: number, max: number) {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
    return null;
  }

  return Number(numeric.toFixed(6));
}

function emptyTranslation(locale: "ar-DZ" | "fr-DZ" | "tzm-DZ"): Translation {
  return { locale, name: "", address: "", wilaya: "", commune: "", description: "", neededItems: "" };
}

function firstNonEmpty(values: string[]) {
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

function buildSubmissionTranslations(translations: Record<string, Translation>) {
  const entries = SUPPORTED_LOCALES.map((locale) => translations[locale]).filter(Boolean) as Translation[];
  const fallbackName = firstNonEmpty(entries.map((item) => item.name));
  const fallbackAddress = firstNonEmpty(entries.map((item) => item.address));
  const fallbackWilaya = firstNonEmpty(entries.map((item) => item.wilaya));
  const fallbackCommune = firstNonEmpty(entries.map((item) => item.commune));
  const fallbackDescription = firstNonEmpty(entries.map((item) => item.description));
  const fallbackNeededItems = firstNonEmpty(entries.map((item) => item.neededItems));

  return SUPPORTED_LOCALES.map((locale) => {
    const source = translations[locale] ?? emptyTranslation(locale);
    const name = source.name.trim() || fallbackName;
    const address = source.address.trim() || fallbackAddress;
    const wilaya = source.wilaya.trim() || fallbackWilaya;
    const commune = source.commune.trim() || fallbackCommune;
    const description = source.description.trim() || fallbackDescription;
    const neededItems = source.neededItems.trim() || fallbackNeededItems;

    return {
      locale,
      name,
      address,
      wilaya,
      commune,
      description: description || undefined,
      neededItems: neededItems || undefined
    };
  }).filter((item) => item.name && item.address && item.wilaya && item.commune);
}

async function requestBestPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    let bestPosition: GeolocationPosition | null = null;

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        if (position.coords.accuracy <= 40) {
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

export default function AidPointForm({ dict, initialId, initialData }: Props) {
  const isEdit = Boolean(initialId && initialData);

  const [publicSlug, setPublicSlug] = useState(initialData?.publicSlug ?? "");
  const [primaryPhone, setPrimaryPhone] = useState(initialData?.primaryPhone ?? "");
  const [secondaryPhone, setSecondaryPhone] = useState(initialData?.secondaryPhone ?? "");
  const [whatsappPhone, setWhatsappPhone] = useState(initialData?.whatsappPhone ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialData?.googleMapsUrl ?? "");
  const [latitude, setLatitude] = useState(initialData?.latitude ?? DEFAULT_LAT);
  const [longitude, setLongitude] = useState(initialData?.longitude ?? DEFAULT_LNG);
  const [latitudeInput, setLatitudeInput] = useState(formatCoordinate(initialData?.latitude ?? DEFAULT_LAT));
  const [longitudeInput, setLongitudeInput] = useState(formatCoordinate(initialData?.longitude ?? DEFAULT_LNG));
  const [activeTab, setActiveTab] = useState<"ar-DZ" | "fr-DZ" | "tzm-DZ">("ar-DZ");
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [translations, setTranslations] = useState<Record<string, Translation>>(
    () => {
      const base: Record<string, Translation> = {};
      for (const l of SUPPORTED_LOCALES) {
        const existing = initialData?.translations.find((t) => t.locale === l);
        base[l] = existing
          ? {
              locale: l,
              name: existing.name,
              address: existing.address,
              wilaya: existing.wilaya,
              commune: existing.commune,
              description: existing.description ?? "",
              neededItems: existing.neededItems ?? ""
            }
          : emptyTranslation(l);
      }
      return base;
    }
  );

  const onMapSelect = useCallback((lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));
    setLatitude(roundedLat);
    setLongitude(roundedLng);
    setLatitudeInput(formatCoordinate(roundedLat));
    setLongitudeInput(formatCoordinate(roundedLng));
  }, []);

  function onLatitudeChange(value: string) {
    setLatitudeInput(value);
    const parsed = parseCoordinate(value, -90, 90);
    if (parsed !== null) {
      setLatitude(parsed);
    }
  }

  function onLongitudeChange(value: string) {
    setLongitudeInput(value);
    const parsed = parseCoordinate(value, -180, 180);
    if (parsed !== null) {
      setLongitude(parsed);
    }
  }

  function setTranslationField(locale: string, field: keyof Translation, value: string) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale]!, [field]: value } }));
  }

  async function onUseCurrentLocation() {
    if (!navigator.geolocation || locating) {
      setError(dict["gps.unsupported"] ?? dict["common.error"]);
      return;
    }

    setLocating(true);
    setError("");

    try {
      const position = await requestBestPosition();
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));
      setLatitude(lat);
      setLongitude(lng);
      setLatitudeInput(formatCoordinate(lat));
      setLongitudeInput(formatCoordinate(lng));
      setSuccess(dict["aidPoint.form.locationApplied"] ?? "");
    } catch {
      setError(dict["gps.unavailable"] ?? dict["common.error"]);
    } finally {
      setLocating(false);
    }
  }

  function suggestSlug() {
    const arName = translations["ar-DZ"]?.name ?? translations["fr-DZ"]?.name ?? "";
    if (!arName.trim()) return;
    const frName = translations["fr-DZ"]?.name ?? "";
    const base = (frName || arName)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40);
    const suffix = Math.random().toString(36).slice(2, 6);
    setPublicSlug(`${base}-${suffix}`.replace(/^-+|-+$/g, ""));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const parsedLatitude = parseCoordinate(latitudeInput, -90, 90);
    const parsedLongitude = parseCoordinate(longitudeInput, -180, 180);
    if (parsedLatitude === null || parsedLongitude === null) {
      setSubmitting(false);
      setError(dict["validation.invalidPayload"] ?? dict["common.error"]);
      return;
    }

    const submissionTranslations = buildSubmissionTranslations(translations);
    if (submissionTranslations.length === 0) {
      setSubmitting(false);
      setError(dict["validation.invalidPayload"] ?? dict["common.error"]);
      return;
    }

    const body = {
      publicSlug,
      primaryPhone,
      secondaryPhone: secondaryPhone || undefined,
      whatsappPhone: whatsappPhone || undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      translations: submissionTranslations,
      ...(isEdit ? { expectedVersion: initialData!.version } : {})
    };

    try {
      const url = isEdit
        ? `/api/organiser/aid-points/${initialId}`
        : "/api/organiser/aid-points";
      const method = isEdit ? "PUT" : "POST";
      const res = await authenticatedFetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!payload.success) throw new Error(payload.error?.message ?? dict["common.error"]);
      setSuccess(isEdit ? dict["aidPoint.form.editSuccess"] : dict["aidPoint.form.createSuccess"]);
      setTimeout(() => {
        window.location.href = buildLocaleScopedPath(window.location.pathname, "/organiser/aid-points");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#dceedd]";
  const labelCls = "block text-xs font-semibold text-slate-700 mb-1";

  return (
    <form className="mx-auto w-full max-w-4xl space-y-5" onSubmit={onSubmit}>
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">
          {isEdit ? dict["aidPoint.form.editTitle"] : dict["aidPoint.form.createTitle"]}
        </h1>
      </header>

      <article className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-[#006233]">{dict["aidPoint.form.translationsTitle"]}</h2>

        <div className="inline-flex rounded-xl border border-[#d7e5d9] bg-[#f4f8f4] p-1 gap-1">
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${activeTab === loc ? "bg-[#006233] text-white" : "text-slate-700 hover:bg-[#e7f2e9]"}`}
              key={loc}
              onClick={() => setActiveTab(loc)}
              type="button"
            >
              {dict[`locale.label.${loc}`] ?? loc}
            </button>
          ))}
        </div>

        {SUPPORTED_LOCALES.map((loc) => (
          <div className={loc === activeTab ? "grid gap-3 sm:grid-cols-2" : "hidden"} key={loc}>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict["aidPoint.form.name"]} *</label>
              <input
                className={inputCls}
                onChange={(e) => setTranslationField(loc, "name", e.target.value)}
                placeholder={dict["aidPoint.form.name"]}
                value={translations[loc]?.name ?? ""}
              />
            </div>
            <div>
              <label className={labelCls}>{dict["aidPoint.form.wilaya"]} *</label>
              <input className={inputCls} onChange={(e) => setTranslationField(loc, "wilaya", e.target.value)} placeholder={dict["aidPoint.form.wilayaPlaceholder"]} value={translations[loc]?.wilaya ?? ""} />
            </div>
            <div>
              <label className={labelCls}>{dict["aidPoint.form.commune"]} *</label>
              <input className={inputCls} onChange={(e) => setTranslationField(loc, "commune", e.target.value)} placeholder={dict["aidPoint.form.communePlaceholder"]} value={translations[loc]?.commune ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict["aidPoint.form.address"]} *</label>
              <input className={inputCls} onChange={(e) => setTranslationField(loc, "address", e.target.value)} placeholder={dict["aidPoint.form.address"]} value={translations[loc]?.address ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict["aidPoint.form.description"]}</label>
              <textarea className={`${inputCls} min-h-24 resize-y`} onChange={(e) => setTranslationField(loc, "description", e.target.value)} value={translations[loc]?.description ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{dict["aidPoint.form.neededItems"]}</label>
              <p className="mb-1.5 text-xs text-slate-500">{dict["aidPoint.form.neededItemsHint"]}</p>
              <textarea className={`${inputCls} min-h-24 resize-y`} onChange={(e) => setTranslationField(loc, "neededItems", e.target.value)} value={translations[loc]?.neededItems ?? ""} />
            </div>
          </div>
        ))}
      </article>

      <article className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-[#006233]">{dict["aidPoint.form.contactSection"]}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{dict["aidPoint.form.primaryPhone"]} *</label>
            <input className={inputCls} onChange={(e) => setPrimaryPhone(e.target.value)} placeholder="+213555000000" type="tel" value={primaryPhone} />
          </div>
          <div>
            <label className={labelCls}>{dict["aidPoint.form.secondaryPhone"]}</label>
            <input className={inputCls} onChange={(e) => setSecondaryPhone(e.target.value)} placeholder="+213555000001" type="tel" value={secondaryPhone} />
          </div>
          <div>
            <label className={labelCls}>{dict["aidPoint.form.whatsapp"]}</label>
            <input className={inputCls} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="+213555000000" type="tel" value={whatsappPhone} />
          </div>
          <div>
            <label className={labelCls}>{dict["aidPoint.form.googleMapsUrl"]}</label>
            <input className={inputCls} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder={dict["aidPoint.form.mapsUrlPlaceholder"]} type="url" value={googleMapsUrl} />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-[#006233]">{dict["aidPoint.form.locationSection"]}</h2>
        <p className="text-xs text-slate-500">{dict["aidPoint.form.coordsHint"]}</p>
        <div>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#d7e5d9] bg-[#f4f8f4] px-3 py-2 text-sm font-semibold text-[#006233] hover:bg-[#e7f2e9] disabled:opacity-60"
            disabled={locating}
            onClick={() => void onUseCurrentLocation()}
            type="button"
          >
            {locating ? dict["aidPoint.form.detectingLocation"] : dict["aidPoint.form.useMyLocation"]}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{dict["aidPoint.form.latitude"]} *</label>
            <input
              className={inputCls}
              onBlur={() => setLatitudeInput(formatCoordinate(latitude))}
              onChange={(e) => onLatitudeChange(e.target.value)}
              step="0.000001"
              type="number"
              value={latitudeInput}
            />
          </div>
          <div>
            <label className={labelCls}>{dict["aidPoint.form.longitude"]} *</label>
            <input
              className={inputCls}
              onBlur={() => setLongitudeInput(formatCoordinate(longitude))}
              onChange={(e) => onLongitudeChange(e.target.value)}
              step="0.000001"
              type="number"
              value={longitudeInput}
            />
          </div>
        </div>
        <MapCanvas latitude={latitude} longitude={longitude} onLocationSelect={onMapSelect} />
      </article>

      <article className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className={labelCls}>{dict["aidPoint.form.publicSlug"]} *</label>
            <p className="mb-1.5 text-xs text-slate-500">{dict["aidPoint.form.publicSlugHint"]}</p>
            <input
              className={inputCls}
              onChange={(e) => setPublicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder={dict["aidPoint.form.slugPlaceholder"]}
              value={publicSlug}
            />
          </div>
          {!isEdit ? (
            <button
              className="min-h-11 rounded-xl border border-[#d7e5d9] bg-[#f4f8f4] px-3 py-2 text-sm font-semibold text-[#006233] hover:bg-[#e7f2e9]"
              onClick={suggestSlug}
              type="button"
            >
              {dict["aidPoint.form.autoSlug"]}
            </button>
          ) : null}
        </div>
      </article>

      {error ? <p className="rounded-xl border border-red-200 bg-[#fff2f5] px-4 py-3 text-sm text-[#b91c1c]">{error}</p> : null}
      {success ? <p className="rounded-xl border border-[#d7e5d9] bg-[#f4f8f4] px-4 py-3 text-sm text-[#006233]">{success}</p> : null}

      <div className="flex gap-3 pb-8">
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#006233] px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting
            ? isEdit ? dict["form.saving"] : dict["form.creating"]
            : isEdit ? dict["form.edit"] : dict["form.create"]}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7e5d9] px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => { window.location.href = buildLocaleScopedPath(window.location.pathname, "/organiser/aid-points"); }}
          type="button"
        >
          {dict["form.back"]}
        </button>
      </div>
    </form>
  );
}

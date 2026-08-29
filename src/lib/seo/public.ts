import type { AppLocale } from "@/i18n/config";

const FALLBACK_BASE_URL = "http://localhost:3000";

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_BASE_URL;
}

export function toAbsoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

export function localeAlternates(pathWithoutLocale: string) {
  const locales: AppLocale[] = ["ar-DZ", "fr-DZ", "tzm-DZ"];
  return Object.fromEntries(locales.map((locale) => [locale, `/${locale}${pathWithoutLocale}`]));
}

export function aidPointJsonLd(input: {
  locale: string;
  name: string;
  description?: string | null;
  address: string;
  wilaya: string;
  commune: string;
  latitude: number;
  longitude: number;
  phone: string;
  pagePath: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: input.name,
    description: input.description ?? undefined,
    url: toAbsoluteUrl(input.pagePath),
    telephone: input.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.commune,
      addressRegion: input.wilaya,
      streetAddress: input.address,
      addressCountry: "DZ"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: input.latitude,
      longitude: input.longitude
    },
    inLanguage: input.locale
  };
}
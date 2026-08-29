export const SUPPORTED_LOCALES = ["ar-DZ", "fr-DZ", "tzm-DZ"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "ar-DZ";

export function isSupportedLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function localeDirection(locale: AppLocale | string): "rtl" | "ltr" {
  if (locale === "ar-DZ") {
    return "rtl";
  }

  return "ltr";
}

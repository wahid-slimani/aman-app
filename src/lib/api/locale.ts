import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";

export function resolveLocale(input?: string | null): AppLocale {
  if (!input) {
    return DEFAULT_LOCALE;
  }

  const simple = input.split(",")[0]?.trim();
  if (simple && SUPPORTED_LOCALES.includes(simple as AppLocale)) {
    return simple as AppLocale;
  }

  return DEFAULT_LOCALE;
}

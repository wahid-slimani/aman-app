import arDZ from "@/i18n/locales/ar-DZ/common.json";
import frDZ from "@/i18n/locales/fr-DZ/common.json";
import tzmDZ from "@/i18n/locales/tzm-DZ/common.json";
import { DEFAULT_LOCALE, isSupportedLocale, type AppLocale } from "@/i18n/config";

const dictionaries: Record<AppLocale, Record<string, string>> = {
  "ar-DZ": arDZ,
  "fr-DZ": frDZ,
  "tzm-DZ": tzmDZ
};

export function getDictionary(locale: string): Record<string, string> {
  if (isSupportedLocale(locale)) {
    return dictionaries[locale];
  }

  return dictionaries[DEFAULT_LOCALE];
}

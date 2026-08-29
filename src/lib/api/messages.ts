import arDZ from "@/i18n/locales/ar-DZ/common.json";
import frDZ from "@/i18n/locales/fr-DZ/common.json";
import tzmDZ from "@/i18n/locales/tzm-DZ/common.json";
import type { AppLocale } from "@/i18n/config";

const dictionaries: Record<AppLocale, Record<string, string>> = {
  "ar-DZ": arDZ,
  "fr-DZ": frDZ,
  "tzm-DZ": tzmDZ
};

export function t(locale: AppLocale, key: string) {
  return dictionaries[locale][key] ?? key;
}

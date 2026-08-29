import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";
import { resolveLocale } from "@/lib/api/locale";

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (value && SUPPORTED_LOCALES.includes(value as AppLocale)) {
    return value as AppLocale;
  }

  const headerStore = await headers();
  const fromHeader = resolveLocale(headerStore.get("accept-language"));
  if (SUPPORTED_LOCALES.includes(fromHeader as AppLocale)) {
    return fromHeader as AppLocale;
  }

  return DEFAULT_LOCALE;
}

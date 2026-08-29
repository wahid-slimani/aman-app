import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { locale?: string } | null;
  const requested = body?.locale;
  const locale = requested && SUPPORTED_LOCALES.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : DEFAULT_LOCALE;

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/"
  });

  return response;
}

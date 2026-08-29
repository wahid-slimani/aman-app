import { NextRequest } from "next/server";
import { geocodeQuerySchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { isRateLimited } from "@/lib/api/rate-limit";

type NominatimRow = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`geocode:${ip}`, 30, 60_000)) {
    return apiError({ code: "RATE_LIMITED", messageKey: "common.rateLimited", status: 429 }, locale);
  }

  const parsed = geocodeQuerySchema.safeParse({
    q: request.nextUrl.searchParams.get("q")
  });

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPlaceQuery", status: 400 }, locale);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("q", parsed.data.q);
  url.searchParams.set("countrycodes", "dz");
  url.searchParams.set("addressdetails", "0");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "accept-language": locale,
        "user-agent": "aman-app/1.0"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return apiError({ code: "UPSTREAM_GEOCODE_FAILED", messageKey: "common.error", status: 502 }, locale);
    }

    const rows = (await response.json()) as NominatimRow[];
    const results = rows
      .map((row) => ({
        name: row.display_name,
        latitude: Number(row.lat),
        longitude: Number(row.lon)
      }))
      .filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));

    return apiSuccess(results);
  } catch {
    return apiError({ code: "UPSTREAM_GEOCODE_FAILED", messageKey: "common.networkError", status: 502 }, locale);
  }
}

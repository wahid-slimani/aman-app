import { NextRequest } from "next/server";
import { nearbyQuerySchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { isRateLimited } from "@/lib/api/rate-limit";
import { listNearbyAidPoints } from "@/domain/aid-points/service";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`nearby:${ip}`, 60, 60_000)) {
    return apiError({ code: "RATE_LIMITED", messageKey: "common.rateLimited", status: 429 }, locale);
  }

  const parsed = nearbyQuerySchema.safeParse({
    latitude: request.nextUrl.searchParams.get("latitude"),
    longitude: request.nextUrl.searchParams.get("longitude"),
    radius: request.nextUrl.searchParams.get("radius")
  });

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidNearbyQuery", status: 400 }, locale);
  }

  const points = await listNearbyAidPoints({
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    radiusKm: parsed.data.radius
  });

  return apiSuccess(points);
}

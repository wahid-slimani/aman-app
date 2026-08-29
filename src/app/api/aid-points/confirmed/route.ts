import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { isRateLimited } from "@/lib/api/rate-limit";
import { z } from "zod";
import { listConfirmedAidPoints } from "@/domain/aid-points/service";

const confirmedQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`confirmed:${ip}`, 60, 60_000)) {
    return apiError({ code: "RATE_LIMITED", messageKey: "common.rateLimited", status: 429 }, locale);
  }

  const parsed = confirmedQuerySchema.safeParse({
    latitude: request.nextUrl.searchParams.get("latitude"),
    longitude: request.nextUrl.searchParams.get("longitude")
  });

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidNearbyQuery", status: 400 }, locale);
  }

  const points = await listConfirmedAidPoints({
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude
  });

  return apiSuccess(points);
}

import { NextRequest } from "next/server";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { verificationThresholdSchema } from "@/lib/validation/schemas";
import {
  getVerificationThresholdSettings,
  updateVerificationThresholdSettings
} from "@/domain/operational-quality/settings";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const settings = await getVerificationThresholdSettings();
  return apiSuccess(settings);
}

export async function PATCH(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = verificationThresholdSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidThresholds", status: 400 }, locale);
  }

  const updated = await updateVerificationThresholdSettings(parsed.data);
  return apiSuccess(updated);
}

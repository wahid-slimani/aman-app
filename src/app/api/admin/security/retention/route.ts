import { NextRequest } from "next/server";
import { resolveLocale } from "@/lib/api/locale";
import { apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { runRetentionCleanup } from "@/domain/security/retention";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const result = await runRetentionCleanup();
  return apiSuccess(result);
}

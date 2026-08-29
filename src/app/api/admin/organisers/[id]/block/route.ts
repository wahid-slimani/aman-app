import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { revokeUserSessions } from "@/domain/authentication/service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const params = await context.params;

  const target = await prisma.user.findUnique({
    where: { id: params.id }
  });

  if (!target) {
    return apiError({ code: "USER_NOT_FOUND", messageKey: "auth.userNotFound", status: 404 }, locale);
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      status: "BLOCKED"
    }
  });

  await revokeUserSessions(target.id);

  return apiSuccess({ blocked: true, userId: target.id });
}

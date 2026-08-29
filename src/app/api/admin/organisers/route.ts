import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { loginSchema } from "@/lib/validation/schemas";
import { createUserForDev } from "@/domain/authentication/service";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const data = await prisma.organiserProfile.findMany({
    include: {
      user: true,
      aidPoints: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return apiSuccess(data);
}

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.extend({ displayName: loginSchema.shape.username }).safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const user = await createUserForDev({
    username: parsed.data.username,
    password: parsed.data.password,
    role: "ORGANISER",
    displayName: parsed.data.displayName
  });

  return apiSuccess({ created: true, id: user.id });
}

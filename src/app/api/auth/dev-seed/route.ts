import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { createUserForDev } from "@/domain/authentication/service";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));

  if (process.env.NODE_ENV === "production") {
    return apiError({ code: "FORBIDDEN_IN_PROD", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const superAdmin = await createUserForDev({
    username: "superadmin",
    password: "superadmin123",
    role: "SUPER_ADMIN"
  });

  const organiser = await createUserForDev({
    username: "organiser",
    password: "organiser123",
    role: "ORGANISER",
    displayName: "Default Organiser"
  });

  return apiSuccess({
    seeded: true,
    users: [superAdmin.username, organiser.username]
  });
}

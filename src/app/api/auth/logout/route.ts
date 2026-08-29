import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { REFRESH_COOKIE_NAME, ACCESS_COOKIE_NAME, CSRF_COOKIE_NAME } from "@/lib/constants/app";
import { revokeSession } from "@/domain/authentication/service";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    await revokeSession(refreshToken).catch(() => undefined);
  }

  const response = apiSuccess({ revoked: true });

  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });

  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/api/auth"
  });

  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });

  return response;
}

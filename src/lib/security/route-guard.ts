import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/constants/app";
import { verifyAccessToken } from "@/lib/security/token";

const LOGIN_PATH = "/ar-DZ/login";

export function guardPrivateRoute(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  try {
    const payload = verifyAccessToken(token);
    return payload;
  } catch {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
}

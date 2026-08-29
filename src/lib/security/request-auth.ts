import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME } from "@/lib/constants/app";
import { verifyAccessToken } from "@/lib/security/token";

export async function getRequestAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

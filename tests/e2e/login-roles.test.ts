import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_COOKIE_NAME, CSRF_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants/app";

const {
  isRateLimitedMock,
  trackAnalyticsEventMock,
  loginMock,
  createUserForDevMock
} = vi.hoisted(() => ({
  isRateLimitedMock: vi.fn(() => false),
  trackAnalyticsEventMock: vi.fn().mockResolvedValue(undefined),
  loginMock: vi.fn(),
  createUserForDevMock: vi.fn()
}));

vi.mock("@/lib/api/rate-limit", () => ({
  isRateLimited: isRateLimitedMock
}));

vi.mock("@/domain/analytics/service", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock
}));

vi.mock("@/domain/authentication/service", () => ({
  login: loginMock,
  createUserForDev: createUserForDevMock
}));

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as seedPost } from "@/app/api/auth/dev-seed/route";

describe("e2e login by role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isRateLimitedMock.mockReturnValue(false);

    createUserForDevMock
      .mockResolvedValueOnce({ username: "wahid-slimani" })
      .mockResolvedValueOnce({ username: "organiser" })
      .mockResolvedValueOnce({ username: "organiser-wahid" });

    loginMock.mockImplementation(async ({ username, password }: { username: string; password: string }) => {
      if (username === "wahid-slimani" && password === "12!?waHid21!?") {
        return {
          ok: true,
          user: { id: "u_admin", username: "wahid-slimani", role: "SUPER_ADMIN" },
          accessToken: "access-super",
          refreshToken: "refresh-super"
        };
      }

      if (username === "organiser-wahid" && password === "12!?orgaNiser21!?") {
        return {
          ok: true,
          user: { id: "u_org", username: "organiser-wahid", role: "ORGANISER" },
          accessToken: "access-org",
          refreshToken: "refresh-org"
        };
      }

      return { ok: false, reason: "AUTH_INVALID_CREDENTIALS" };
    });
  });

  it("seeds super-admin and organiser accounts", async () => {
    const request = new Request("http://localhost/api/auth/dev-seed", {
      method: "POST",
      headers: { "accept-language": "ar-DZ" }
    });

    const response = await seedPost(request as never);
    const payload = (await response.json()) as { success: boolean; data: { users: string[] } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.users).toEqual(["wahid-slimani", "organiser", "organiser-wahid"]);
  });

  it("logs in super admin successfully", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "accept-language": "ar-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: "wahid-slimani",
        password: "12!?waHid21!?"
      })
    });

    const response = await loginPost(request as never);
    const payload = (await response.json()) as { success: boolean; data?: { user: { role: string } } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.user.role).toBe("SUPER_ADMIN");
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(ACCESS_COOKIE_NAME);
    expect(setCookie).toContain(REFRESH_COOKIE_NAME);
    expect(setCookie).toContain(CSRF_COOKIE_NAME);
  });

  it("logs in organiser successfully", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "accept-language": "fr-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: "organiser-wahid",
        password: "12!?orgaNiser21!?"
      })
    });

    const response = await loginPost(request as never);
    const payload = (await response.json()) as { success: boolean; data?: { user: { role: string } } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.user.role).toBe("ORGANISER");
  });
});

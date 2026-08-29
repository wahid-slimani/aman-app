import { describe, expect, it, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getCorsHeaders, hasValidCsrf, isOriginAllowed, shouldCheckCsrf } from "@/lib/security/policy";

describe("security policy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.ALLOWED_ORIGINS = "http://localhost:3000,https://ops.example.dz";
  });

  it("allows configured origins and blocks unknown origins", () => {
    expect(isOriginAllowed("http://localhost:3000")).toBe(true);
    expect(isOriginAllowed("https://ops.example.dz")).toBe(true);
    expect(isOriginAllowed("https://evil.example")).toBe(false);
  });

  it("requires csrf checks for authenticated write api paths", () => {
    expect(shouldCheckCsrf("/api/admin/reports/abc", "PATCH")).toBe(true);
    expect(shouldCheckCsrf("/api/auth/login", "POST")).toBe(false);
    expect(shouldCheckCsrf("/api/aid-points/nearby", "GET")).toBe(false);
  });

  it("validates csrf token using cookie + header", () => {
    const request = new NextRequest("http://localhost/api/admin/reports/1", {
      method: "PATCH",
      headers: {
        cookie: "aman_csrf=token123",
        "x-csrf-token": "token123"
      }
    });

    expect(hasValidCsrf(request)).toBe(true);
  });

  it("builds credentialed cors headers", () => {
    const headers = getCorsHeaders("http://localhost:3000");
    expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:3000");
    expect(headers["Access-Control-Allow-Credentials"]).toBe("true");
  });
});

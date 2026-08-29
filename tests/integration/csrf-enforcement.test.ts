import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("csrf enforcement at proxy", () => {
  it("blocks authenticated mutating api request without csrf token", () => {
    const request = new NextRequest("http://localhost/api/admin/reports/abc", {
      method: "PATCH",
      headers: {
        cookie: "aman_access=fake-token"
      }
    });

    const response = proxy(request);

    expect(response.status).toBe(403);
  });

  it("allows excluded login path without csrf token", () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST"
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});

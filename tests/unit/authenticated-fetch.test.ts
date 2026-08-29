import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

describe("authenticatedFetch", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    Object.defineProperty(globalThis, "document", {
      value: { cookie: "aman_csrf=test-csrf-token" },
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
    Reflect.deleteProperty(globalThis, "document");
  });

  it("retries original request after successful refresh", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 }));

    global.fetch = fetchMock;

    const response = await authenticatedFetch("/api/organiser/aid-points", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ a: 1 })
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/refresh",
      expect.objectContaining({ method: "POST" })
    );

    const firstCallInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const firstHeaders = new Headers(firstCallInit.headers);
    expect(firstHeaders.get("x-csrf-token")).toBe("test-csrf-token");
  });

  it("does not retry when refresh fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 401 }));

    global.fetch = fetchMock;

    const response = await authenticatedFetch("/api/organiser/aid-points", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ a: 1 })
    });

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

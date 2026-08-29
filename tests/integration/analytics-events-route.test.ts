import { beforeEach, describe, expect, it, vi } from "vitest";

const { trackAnalyticsEventMock, getRequestAuthMock } = vi.hoisted(() => ({
  trackAnalyticsEventMock: vi.fn(),
  getRequestAuthMock: vi.fn()
}));

vi.mock("@/domain/analytics/service", () => ({
  parseAnalyticsEventType: (value: string) => (value === "REPORT_SUBMITTED" ? value : null),
  parseUserRole: (value?: string) => (value === "ORGANISER" || value === "SUPER_ADMIN" ? value : undefined),
  trackAnalyticsEvent: trackAnalyticsEventMock
}));

vi.mock("@/lib/security/request-auth", () => ({
  getRequestAuth: getRequestAuthMock
}));

import { POST } from "@/app/api/analytics/events/route";

describe("analytics ingestion route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestAuthMock.mockResolvedValue({ sub: "user_1", role: "ORGANISER" });
    trackAnalyticsEventMock.mockResolvedValue(null);
  });

  it("rejects invalid event type", async () => {
    const request = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: {
        "accept-language": "fr-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "INVALID",
        source: "api"
      })
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { success: boolean; error?: { code: string } };

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error?.code).toBe("ANALYTICS_EVENT_INVALID");
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("accepts valid events", async () => {
    const request = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: {
        "accept-language": "ar-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "REPORT_SUBMITTED",
        source: "api",
        locale: "ar-DZ"
      })
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { success: boolean; data?: { accepted: boolean } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.accepted).toBe(true);
    expect(trackAnalyticsEventMock).toHaveBeenCalledTimes(1);
  });
});

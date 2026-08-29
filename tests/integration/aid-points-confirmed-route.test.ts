import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { listConfirmedAidPointsMock, isRateLimitedMock } = vi.hoisted(() => ({
  listConfirmedAidPointsMock: vi.fn(),
  isRateLimitedMock: vi.fn()
}));

vi.mock("@/domain/aid-points/service", () => ({
  listConfirmedAidPoints: listConfirmedAidPointsMock
}));

vi.mock("@/lib/api/rate-limit", () => ({
  isRateLimited: isRateLimitedMock
}));

import { GET } from "@/app/api/aid-points/confirmed/route";

describe("GET /api/aid-points/confirmed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isRateLimitedMock.mockReturnValue(false);
  });

  it("returns 400 when coordinates are invalid", async () => {
    const request = new NextRequest("http://localhost/api/aid-points/confirmed?latitude=999&longitude=3");
    const response = await GET(request);
    const payload = (await response.json()) as { success: boolean; error?: { code: string } };

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error?.code).toBe("VALIDATION_FAILED");
  });

  it("returns confirmed points when request is valid", async () => {
    listConfirmedAidPointsMock.mockResolvedValue([
      {
        id: "p1",
        publicSlug: "test-oran-port-1",
        latitude: 35.70811,
        longitude: -0.634841,
        operationalStatus: "OPEN",
        distanceKm: 0,
        verificationFreshness: "FRESH"
      }
    ]);

    const request = new NextRequest("http://localhost/api/aid-points/confirmed?latitude=36.75&longitude=3.05");
    const response = await GET(request);
    const payload = (await response.json()) as { success: boolean; data?: Array<{ id: string }> };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.length).toBe(1);
    expect(listConfirmedAidPointsMock).toHaveBeenCalledWith({ latitude: 36.75, longitude: 3.05 });
  });
});

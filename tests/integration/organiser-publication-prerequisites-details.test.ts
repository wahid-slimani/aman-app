import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  requireRoleMock,
  organiserFindUniqueMock,
  aidPointFindUniqueMock
} = vi.hoisted(() => ({
  prismaMock: {
    organiserProfile: {
      findUnique: vi.fn()
    },
    aidPoint: {
      findUnique: vi.fn()
    }
  },
  requireRoleMock: vi.fn(),
  organiserFindUniqueMock: vi.fn(),
  aidPointFindUniqueMock: vi.fn()
}));

prismaMock.organiserProfile.findUnique = organiserFindUniqueMock;
prismaMock.aidPoint.findUnique = aidPointFindUniqueMock;

vi.mock("@/lib/security/authorization", () => ({
  requireRole: requireRoleMock
}));

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: prismaMock
}));

import { POST } from "@/app/api/organiser/aid-points/[id]/publication/route";

describe("organiser publication prerequisites details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleMock.mockResolvedValue({ ok: true, auth: { sub: "user_1" } });
    organiserFindUniqueMock.mockResolvedValue({ id: "org_1" });
  });

  it("returns detailed missing prerequisites", async () => {
    aidPointFindUniqueMock.mockResolvedValue({
      id: "point_1",
      organiserId: "org_1",
      operationalStatus: "NEEDS_VERIFICATION",
      primaryPhone: "",
      lastVerifiedAt: null,
      translations: [
        {
          locale: "ar-DZ",
          name: "",
          address: "",
          wilaya: "",
          commune: ""
        }
      ]
    });

    const request = new Request("http://localhost/api/organiser/aid-points/point_1/publication", {
      method: "POST",
      headers: {
        "accept-language": "ar-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({ expectedVersion: 1 })
    });

    const response = await POST(request as never, { params: Promise.resolve({ id: "point_1" }) });
    const payload = (await response.json()) as {
      success: boolean;
      error?: {
        code?: string;
        details?: Array<{ code: string; message: string }>;
      };
    };

    expect(response.status).toBe(422);
    expect(payload.success).toBe(false);
    expect(payload.error?.code).toBe("PUBLICATION_PREREQUISITES_MISSING");
    expect(payload.error?.details?.length).toBeGreaterThan(0);
    expect(payload.error?.details?.some((item) => item.code === "MISSING_PRIMARY_PHONE")).toBe(true);
    expect(payload.error?.details?.some((item) => item.code === "MISSING_VERIFICATION")).toBe(true);
    expect(payload.error?.details?.some((item) => item.code === "INVALID_OPERATIONAL_STATUS")).toBe(true);
    expect(payload.error?.details?.some((item) => item.code === "MISSING_TRANSLATIONS")).toBe(true);
  });
});

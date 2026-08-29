import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  requireRoleMock,
  organiserFindUniqueMock,
  aidPointFindUniqueMock,
  executeRawMock,
  translationCreateManyMock
} = vi.hoisted(() => ({
  prismaMock: {
    organiserProfile: {
      findUnique: vi.fn()
    },
    aidPoint: {
      findUnique: vi.fn()
    },
    aidPointTranslation: {
      createMany: vi.fn()
    },
    $executeRaw: vi.fn()
  },
  requireRoleMock: vi.fn(),
  organiserFindUniqueMock: vi.fn(),
  aidPointFindUniqueMock: vi.fn(),
  executeRawMock: vi.fn(),
  translationCreateManyMock: vi.fn()
}));

prismaMock.organiserProfile.findUnique = organiserFindUniqueMock;
prismaMock.aidPoint.findUnique = aidPointFindUniqueMock;
prismaMock.$executeRaw = executeRawMock;
prismaMock.aidPointTranslation.createMany = translationCreateManyMock;

vi.mock("@/lib/security/authorization", () => ({
  requireRole: requireRoleMock
}));

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: prismaMock
}));

import { POST } from "@/app/api/organiser/aid-points/route";

const validPayload = {
  publicSlug: "point-alger-test",
  primaryPhone: "+213555000000",
  secondaryPhone: "+213555000001",
  whatsappPhone: "+213555000000",
  googleMapsUrl: "https://maps.google.com/?q=36.7538,3.0588",
  latitude: 36.7538,
  longitude: 3.0588,
  translations: [
    {
      locale: "ar-DZ",
      name: "Point Test",
      address: "Address",
      wilaya: "Alger",
      commune: "Bab El Oued",
      description: "Description"
    }
  ]
};

describe("organiser aid point POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organiserFindUniqueMock.mockReset();
    aidPointFindUniqueMock.mockReset();
    executeRawMock.mockReset();
    translationCreateManyMock.mockReset();
    requireRoleMock.mockResolvedValue({ ok: true, auth: { sub: "user_1" } });
    organiserFindUniqueMock.mockResolvedValue({ id: "org_1" });
    executeRawMock.mockResolvedValue(1);
    translationCreateManyMock.mockResolvedValue({ count: 1 });
  });

  it("returns 409 when public slug already exists", async () => {
    aidPointFindUniqueMock.mockResolvedValue({ id: "existing_1" });

    const request = new Request("http://localhost/api/organiser/aid-points", {
      method: "POST",
      headers: {
        "accept-language": "fr-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { success: boolean; error?: { code: string } };

    expect(response.status).toBe(409);
    expect(payload.success).toBe(false);
    expect(payload.error?.code).toBe("SLUG_TAKEN");
  });

  it("creates aid point for organiser when payload is valid", async () => {
    aidPointFindUniqueMock.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "point_1" });

    const request = new Request("http://localhost/api/organiser/aid-points", {
      method: "POST",
      headers: {
        "accept-language": "ar-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { success: boolean; data?: { id: string; publicSlug: string } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.publicSlug).toBe(validPayload.publicSlug);
    expect(executeRawMock).toHaveBeenCalledTimes(1);
    expect(translationCreateManyMock).toHaveBeenCalledTimes(1);
  });
});

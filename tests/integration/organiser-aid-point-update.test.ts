import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  requireRoleMock,
  organiserFindUniqueMock,
  aidPointFindUniqueMock,
  txUpdateManyMock,
  txFindUniqueMock,
  txAuditCreateMock
} = vi.hoisted(() => ({
  prismaMock: {
    organiserProfile: {
      findUnique: vi.fn()
    },
    aidPoint: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  },
  requireRoleMock: vi.fn(),
  organiserFindUniqueMock: vi.fn(),
  aidPointFindUniqueMock: vi.fn(),
  txUpdateManyMock: vi.fn(),
  txFindUniqueMock: vi.fn(),
  txAuditCreateMock: vi.fn()
}));

prismaMock.organiserProfile.findUnique = organiserFindUniqueMock;
prismaMock.aidPoint.findUnique = aidPointFindUniqueMock;
prismaMock.$transaction = vi.fn(async (callback: (tx: unknown) => unknown) =>
  callback({
    aidPoint: {
      updateMany: txUpdateManyMock,
      findUnique: txFindUniqueMock
    },
    auditLog: {
      create: txAuditCreateMock
    }
  })
);

vi.mock("@/lib/security/authorization", () => ({
  requireRole: requireRoleMock
}));

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: prismaMock
}));

import { PATCH } from "@/app/api/organiser/aid-points/[id]/route";

describe("organiser aid point PATCH", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleMock.mockResolvedValue({ ok: true, auth: { sub: "user_1" } });
    organiserFindUniqueMock.mockResolvedValue({ id: "org_1" });
    aidPointFindUniqueMock.mockResolvedValue({ id: "point_1", organiserId: "org_1" });
  });

  it("returns 409 on version conflict", async () => {
    txUpdateManyMock.mockResolvedValue({ count: 0 });

    const request = new Request("http://localhost/api/organiser/aid-points/point_1", {
      method: "PATCH",
      headers: {
        "accept-language": "fr-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({ expectedVersion: 1, operationalStatus: "OPEN" })
    });

    const response = await PATCH(request as never, { params: Promise.resolve({ id: "point_1" }) });
    const payload = (await response.json()) as { success: boolean; error?: { code: string } };

    expect(response.status).toBe(409);
    expect(payload.success).toBe(false);
    expect(payload.error?.code).toBe("VERSION_CONFLICT");
  });

  it("updates status and writes audit log when version matches", async () => {
    txUpdateManyMock.mockResolvedValue({ count: 1 });
    txFindUniqueMock.mockResolvedValue({ id: "point_1", operationalStatus: "OPEN", version: 2 });

    const request = new Request("http://localhost/api/organiser/aid-points/point_1", {
      method: "PATCH",
      headers: {
        "accept-language": "ar-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({ expectedVersion: 1, operationalStatus: "OPEN" })
    });

    const response = await PATCH(request as never, { params: Promise.resolve({ id: "point_1" }) });
    const payload = (await response.json()) as { success: boolean; data?: { version: number } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.version).toBe(2);
    expect(txAuditCreateMock).toHaveBeenCalledTimes(1);
  });
});

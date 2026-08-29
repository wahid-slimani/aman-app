import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  requireRoleMock,
  pointFindUniqueMock,
  txUpdateMock,
  txAuditCreateMock,
  createDatasetVersionChangeMock
} = vi.hoisted(() => ({
  prismaMock: {
    aidPoint: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  },
  requireRoleMock: vi.fn(),
  pointFindUniqueMock: vi.fn(),
  txUpdateMock: vi.fn(),
  txAuditCreateMock: vi.fn(),
  createDatasetVersionChangeMock: vi.fn()
}));

prismaMock.aidPoint.findUnique = pointFindUniqueMock;
prismaMock.$transaction = vi.fn(async (callback: (tx: unknown) => unknown) =>
  callback({
    aidPoint: {
      update: txUpdateMock
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

vi.mock("@/domain/operational-quality/workflows", () => ({
  checkPublicationPrerequisites: vi.fn(() => ({ ok: false, missing: ["MISSING_TRANSLATIONS"] })),
  createDatasetVersionChange: createDatasetVersionChangeMock
}));

import { PATCH } from "@/app/api/admin/aid-points/[id]/publication/route";

describe("admin publication workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleMock.mockResolvedValue({ ok: true, auth: { sub: "admin_1" } });
    pointFindUniqueMock.mockResolvedValue({
      id: "point_1",
      organiserId: "org_1",
      publishedAt: null,
      archivedAt: null,
      translations: [],
      publicationStatus: "PENDING_REVIEW",
      operationalStatus: "OPEN",
      latitude: 36.7,
      longitude: 3.0,
      primaryPhone: "+213555000000",
      lastVerifiedAt: null,
      publicSlug: "slug"
    });
  });

  it("blocks publish when prerequisites are missing", async () => {
    const request = new Request("http://localhost/api/admin/aid-points/point_1/publication", {
      method: "PATCH",
      headers: {
        "accept-language": "fr-DZ",
        "content-type": "application/json"
      },
      body: JSON.stringify({ action: "PUBLISH" })
    });

    const response = await PATCH(request as never, { params: Promise.resolve({ id: "point_1" }) });
    const payload = (await response.json()) as { success: boolean; error?: { code: string } };

    expect(response.status).toBe(422);
    expect(payload.success).toBe(false);
    expect(payload.error?.code).toBe("PUBLICATION_PREREQUISITES_MISSING");
    expect(txUpdateMock).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireRoleMock, revokeUserSessionsMock, userFindUniqueMock, userUpdateMock } = vi.hoisted(() => ({
  requireRoleMock: vi.fn(),
  revokeUserSessionsMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  userUpdateMock: vi.fn()
}));

vi.mock("@/lib/security/authorization", () => ({
  requireRole: requireRoleMock
}));

vi.mock("@/domain/authentication/service", () => ({
  revokeUserSessions: revokeUserSessionsMock
}));

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
      update: userUpdateMock
    }
  }
}));

import { POST } from "@/app/api/admin/organisers/[id]/block/route";

describe("block organiser route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleMock.mockResolvedValue({ ok: true, auth: { sub: "admin_1" } });
  });

  it("returns 404 when user is missing", async () => {
    userFindUniqueMock.mockResolvedValue(null);

    const request = new Request("http://localhost/api/admin/organisers/u404/block", {
      method: "POST",
      headers: { "accept-language": "fr-DZ" }
    });

    const response = await POST(request as never, { params: Promise.resolve({ id: "u404" }) });
    expect(response.status).toBe(404);
  });

  it("blocks user and revokes all active sessions", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "u1" });
    userUpdateMock.mockResolvedValue({ id: "u1", status: "BLOCKED" });
    revokeUserSessionsMock.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/admin/organisers/u1/block", {
      method: "POST",
      headers: { "accept-language": "ar-DZ" }
    });

    const response = await POST(request as never, { params: Promise.resolve({ id: "u1" }) });
    const payload = (await response.json()) as { success: boolean; data?: { blocked: boolean } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.blocked).toBe(true);
    expect(revokeUserSessionsMock).toHaveBeenCalledWith("u1");
  });
});

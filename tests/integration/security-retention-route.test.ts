import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireRoleMock, runRetentionCleanupMock } = vi.hoisted(() => ({
  requireRoleMock: vi.fn(),
  runRetentionCleanupMock: vi.fn()
}));

vi.mock("@/lib/security/authorization", () => ({
  requireRole: requireRoleMock
}));

vi.mock("@/domain/security/retention", () => ({
  runRetentionCleanup: runRetentionCleanupMock
}));

import { POST } from "@/app/api/admin/security/retention/route";

describe("admin retention route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns auth response when role is denied", async () => {
    requireRoleMock.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ success: false }), { status: 403 })
    });

    const request = new Request("http://localhost/api/admin/security/retention", { method: "POST" });
    const response = await POST(request as never);

    expect(response.status).toBe(403);
  });

  it("runs cleanup for super admin", async () => {
    requireRoleMock.mockResolvedValue({ ok: true, auth: { sub: "admin_1" } });
    runRetentionCleanupMock.mockResolvedValue({
      refreshSessions: 1,
      analyticsEvents: 2,
      auditLogs: 3,
      policy: { refreshSessionsDays: 30, analyticsEventsDays: 180, auditLogsDays: 365 }
    });

    const request = new Request("http://localhost/api/admin/security/retention", {
      method: "POST",
      headers: { "accept-language": "fr-DZ" }
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { success: boolean; data?: { auditLogs: number } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.auditLogs).toBe(3);
    expect(runRetentionCleanupMock).toHaveBeenCalledTimes(1);
  });
});

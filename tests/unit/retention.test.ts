import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  refreshDeleteManyMock,
  analyticsDeleteManyMock,
  auditDeleteManyMock
} = vi.hoisted(() => ({
  refreshDeleteManyMock: vi.fn(),
  analyticsDeleteManyMock: vi.fn(),
  auditDeleteManyMock: vi.fn(),
  prismaMock: {
    refreshSession: {
      deleteMany: vi.fn()
    },
    analyticsEvent: {
      deleteMany: vi.fn()
    },
    auditLog: {
      deleteMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

prismaMock.refreshSession.deleteMany = refreshDeleteManyMock;
prismaMock.analyticsEvent.deleteMany = analyticsDeleteManyMock;
prismaMock.auditLog.deleteMany = auditDeleteManyMock;
prismaMock.$transaction = vi.fn(async () => [{ count: 2 }, { count: 4 }, { count: 6 }]);

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: prismaMock
}));

import { runRetentionCleanup } from "@/domain/security/retention";

describe("retention cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction = vi.fn(async () => [{ count: 2 }, { count: 4 }, { count: 6 }]);
  });

  it("returns deleted counts and policy days", async () => {
    const result = await runRetentionCleanup({
      refreshSessionsDays: 10,
      analyticsEventsDays: 20,
      auditLogsDays: 30
    });

    expect(result.refreshSessions).toBe(2);
    expect(result.analyticsEvents).toBe(4);
    expect(result.auditLogs).toBe(6);
    expect(result.policy.refreshSessionsDays).toBe(10);
  });
});

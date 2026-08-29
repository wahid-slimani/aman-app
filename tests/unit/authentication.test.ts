import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  userFindUniqueMock,
  refreshFindUniqueMock,
  refreshUpdateManyMock,
  verifyRefreshTokenMock
} = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
  refreshFindUniqueMock: vi.fn(),
  refreshUpdateManyMock: vi.fn(),
  verifyRefreshTokenMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    refreshSession: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

prismaMock.user.findUnique = userFindUniqueMock;
prismaMock.refreshSession.findUnique = refreshFindUniqueMock;
prismaMock.refreshSession.updateMany = refreshUpdateManyMock;

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("@/lib/security/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn().mockResolvedValue(true)
}));

vi.mock("@/lib/security/token", () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: verifyRefreshTokenMock
}));

import { login, refreshSession } from "@/domain/authentication/service";

describe("authentication service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies blocked account login", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "u1",
      usernameNorm: "organiser",
      passwordHash: "hash",
      role: "ORGANISER",
      status: "BLOCKED"
    });

    const result = await login({ username: "organiser", password: "password123" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("AUTH_ACCOUNT_BLOCKED");
    }
  });

  it("revokes refresh family on token reuse detection", async () => {
    verifyRefreshTokenMock.mockReturnValue({ sub: "u1", role: "ORGANISER", sessionId: "s1" });
    refreshFindUniqueMock.mockResolvedValue({
      id: "s1",
      userId: "u1",
      familyId: "f1",
      tokenHash: "expected-hash",
      revokedAt: null,
      user: {
        id: "u1",
        role: "ORGANISER",
        status: "ACTIVE"
      }
    });

    const result = await refreshSession("tampered-refresh-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("AUTH_REFRESH_REUSE_DETECTED");
    }
    expect(refreshUpdateManyMock).toHaveBeenCalledTimes(1);
  });
});

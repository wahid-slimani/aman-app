import crypto from "node:crypto";
import { prisma } from "@/infrastructure/database/prisma";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/security/token";
import { REFRESH_TOKEN_TTL_SECONDS } from "@/lib/constants/app";
import { UserStatus } from "@prisma/client";

function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createUserForDev(options: {
  username: string;
  password: string;
  role: "SUPER_ADMIN" | "ORGANISER";
  displayName?: string;
}) {
  const usernameNorm = options.username.trim().toLowerCase();
  const passwordHash = await hashPassword(options.password);

  return prisma.user.upsert({
    where: { usernameNorm },
    create: {
      username: options.username,
      usernameNorm,
      passwordHash,
      role: options.role,
      status: "ACTIVE",
      organiser:
        options.role === "ORGANISER"
          ? {
              create: {
                displayName: options.displayName ?? options.username
              }
            }
          : undefined
    },
    update: {
      username: options.username,
      passwordHash,
      role: options.role,
      status: "ACTIVE",
      organiser:
        options.role === "ORGANISER"
          ? {
              upsert: {
                create: {
                  displayName: options.displayName ?? options.username
                },
                update: {
                  displayName: options.displayName ?? options.username
                }
              }
            }
          : undefined
    },
    include: {
      organiser: true
    }
  });
}

export async function login(options: {
  username: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const usernameNorm = options.username.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { usernameNorm }
  });

  if (!user) {
    return { ok: false as const, reason: "AUTH_INVALID_CREDENTIALS" as const };
  }

  if (user.status !== UserStatus.ACTIVE) {
    return { ok: false as const, reason: "AUTH_ACCOUNT_BLOCKED" as const };
  }

  const valid = await verifyPassword(options.password, user.passwordHash);
  if (!valid) {
    return { ok: false as const, reason: "AUTH_INVALID_CREDENTIALS" as const };
  }

  const session = await prisma.refreshSession.create({
    data: {
      userId: user.id,
      familyId: crypto.randomUUID(),
      tokenHash: "temp",
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      userAgent: options.userAgent,
      ipAddress: options.ipAddress
    }
  });

  const payload = { sub: user.id, role: user.role, sessionId: session.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(refreshToken)
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date()
    }
  });

  return {
    ok: true as const,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      role: user.role
    }
  };
}

export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const oldSession = await prisma.refreshSession.findUnique({
    where: { id: payload.sessionId },
    include: { user: true }
  });

  if (!oldSession || oldSession.revokedAt || oldSession.user.status !== UserStatus.ACTIVE) {
    return { ok: false as const, reason: "AUTH_REFRESH_INVALID" as const };
  }

  if (hashToken(refreshToken) !== oldSession.tokenHash) {
    await prisma.refreshSession.updateMany({
      where: { familyId: oldSession.familyId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    return { ok: false as const, reason: "AUTH_REFRESH_REUSE_DETECTED" as const };
  }

  const replacement = await prisma.refreshSession.create({
    data: {
      userId: oldSession.userId,
      familyId: oldSession.familyId,
      tokenHash: "temp",
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000)
    }
  });

  const nextPayload = {
    sub: oldSession.userId,
    role: oldSession.user.role,
    sessionId: replacement.id
  };

  const accessToken = signAccessToken(nextPayload);
  const nextRefresh = signRefreshToken(nextPayload);

  await prisma.$transaction([
    prisma.refreshSession.update({
      where: { id: replacement.id },
      data: { tokenHash: hashToken(nextRefresh) }
    }),
    prisma.refreshSession.update({
      where: { id: oldSession.id },
      data: {
        revokedAt: new Date(),
        replacedById: replacement.id
      }
    })
  ]);

  return {
    ok: true as const,
    accessToken,
    refreshToken: nextRefresh,
    user: {
      id: oldSession.user.id,
      role: oldSession.user.role
    }
  };
}

export async function revokeSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  await prisma.refreshSession.updateMany({
    where: { id: payload.sessionId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function revokeUserSessions(userId: string) {
  await prisma.refreshSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

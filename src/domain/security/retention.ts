import { prisma } from "@/infrastructure/database/prisma";
import { RETENTION_DAYS } from "@/lib/constants/app";

type RetentionInput = {
  refreshSessionsDays?: number;
  analyticsEventsDays?: number;
  auditLogsDays?: number;
};

function cutoff(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function runRetentionCleanup(input: RetentionInput = {}) {
  const refreshSessionsDays = input.refreshSessionsDays ?? RETENTION_DAYS.refreshSessions;
  const analyticsEventsDays = input.analyticsEventsDays ?? RETENTION_DAYS.analyticsEvents;
  const auditLogsDays = input.auditLogsDays ?? RETENTION_DAYS.auditLogs;

  const [refreshSessions, analyticsEvents, auditLogs] = await prisma.$transaction([
    prisma.refreshSession.deleteMany({
      where: {
        OR: [
          { revokedAt: { lt: cutoff(refreshSessionsDays) } },
          { expiresAt: { lt: cutoff(refreshSessionsDays) } }
        ]
      }
    }),
    prisma.analyticsEvent.deleteMany({
      where: {
        eventDate: {
          lt: cutoff(analyticsEventsDays)
        }
      }
    }),
    prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoff(auditLogsDays)
        }
      }
    })
  ]);

  return {
    refreshSessions: refreshSessions.count,
    analyticsEvents: analyticsEvents.count,
    auditLogs: auditLogs.count,
    policy: {
      refreshSessionsDays,
      analyticsEventsDays,
      auditLogsDays
    }
  };
}

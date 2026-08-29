import { AnalyticsEventType, Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";

const ALLOWED_EVENT_TYPES: AnalyticsEventType[] = [
  AnalyticsEventType.AUTH_LOGIN_SUCCESS,
  AnalyticsEventType.AUTH_REFRESH_SUCCESS,
  AnalyticsEventType.REPORT_SUBMITTED,
  AnalyticsEventType.AID_POINT_NEARBY_SEARCH,
  AnalyticsEventType.AID_POINT_VERIFIED,
  AnalyticsEventType.AID_POINT_PUBLICATION_SUBMITTED,
  AnalyticsEventType.AID_POINT_PUBLISHED,
  AnalyticsEventType.AID_POINT_ARCHIVED,
  AnalyticsEventType.REPORT_REVIEWED
];

const NON_BLOCKING_EVENTS = new Set<AnalyticsEventType>([
  AnalyticsEventType.AUTH_LOGIN_SUCCESS,
  AnalyticsEventType.AUTH_REFRESH_SUCCESS,
  AnalyticsEventType.AID_POINT_NEARBY_SEARCH
]);

type TrackEventInput = {
  type: AnalyticsEventType;
  source: string;
  locale?: string;
  userRole?: UserRole;
  userId?: string;
  aidPointId?: string;
  wilaya?: string;
  payload?: Prisma.InputJsonValue;
};

function normalizeDate(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function parseAnalyticsEventType(value: string) {
  if (!ALLOWED_EVENT_TYPES.includes(value as AnalyticsEventType)) {
    return null;
  }
  return value as AnalyticsEventType;
}

export function parseUserRole(value?: string | null) {
  if (value === "SUPER_ADMIN" || value === "ORGANISER") {
    return value as UserRole;
  }
  return undefined;
}

export function isMeaningfulEventType(type: AnalyticsEventType) {
  return ALLOWED_EVENT_TYPES.includes(type);
}

export function trackAnalyticsEvent(input: TrackEventInput) {
  if (!isMeaningfulEventType(input.type)) {
    return Promise.resolve(null);
  }

  const action = prisma.analyticsEvent.create({
    data: {
      type: input.type,
      source: input.source,
      locale: input.locale,
      userRole: input.userRole,
      userId: input.userId,
      aidPointId: input.aidPointId,
      wilaya: input.wilaya,
      eventDate: new Date(),
      payload: input.payload
    }
  });

  if (NON_BLOCKING_EVENTS.has(input.type)) {
    queueMicrotask(() => {
      void action.catch(() => {
        return;
      });
    });
    return Promise.resolve(null);
  }

  return action;
}

export type AnalyticsRange = {
  start: Date;
  end: Date;
};

export function resolveRange(range: "today" | "7d" | "30d" | "90d" | "custom", custom?: { start?: string; end?: string }) {
  const now = new Date();
  const end = now;
  if (range === "today") {
    const start = normalizeDate(now);
    return { start, end };
  }

  if (range === "custom") {
    const start = custom?.start ? new Date(custom.start) : null;
    const customEnd = custom?.end ? new Date(custom.end) : null;
    if (!start || !customEnd || Number.isNaN(start.getTime()) || Number.isNaN(customEnd.getTime())) {
      return null;
    }
    return { start, end: customEnd };
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function refreshAnalyticsAggregates(range: AnalyticsRange) {
  const rows = await prisma.$queryRaw<Array<{ day: Date; type: AnalyticsEventType; count: number }>>(Prisma.sql`
    SELECT
      date_trunc('day', "eventDate") AS day,
      type,
      COUNT(*)::int AS count
    FROM "AnalyticsEvent"
    WHERE "eventDate" BETWEEN ${range.start} AND ${range.end}
    GROUP BY day, type
  `);

  const entries = rows.map((row) => ({
    metricKey: `event.${row.type}`,
    bucketDate: normalizeDate(row.day),
    period: "day",
    dimension: "global",
    value: row.count
  }));

  if (entries.length === 0) {
    return;
  }

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.analyticsAggregate.upsert({
        where: {
          metricKey_bucketDate_period_dimension: {
            metricKey: entry.metricKey,
            bucketDate: entry.bucketDate,
            period: entry.period,
            dimension: entry.dimension
          }
        },
        update: { value: entry.value },
        create: entry
      })
    )
  );
}

export async function getAdminAnalyticsSnapshot(range: AnalyticsRange) {
  const [events, reportsOpen, stalePoints, geoRows, organisers] = await Promise.all([
    prisma.analyticsEvent.count({
      where: {
        eventDate: { gte: range.start, lte: range.end }
      }
    }),
    prisma.aidPointReport.count({
      where: {
        status: { in: ["OPEN", "UNDER_REVIEW"] }
      }
    }),
    prisma.aidPoint.count({
      where: {
        OR: [
          { lastVerifiedAt: null },
          { lastVerifiedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        ]
      }
    }),
    prisma.$queryRaw<Array<{ wilaya: string; total: number }>>(Prisma.sql`
      SELECT apt.wilaya, COUNT(*)::int AS total
      FROM "AidPointTranslation" apt
      INNER JOIN "AidPoint" ap ON ap.id = apt."aidPointId"
      WHERE apt.locale = 'ar-DZ'
      GROUP BY apt.wilaya
      ORDER BY total DESC
      LIMIT 10
    `),
    prisma.aidPoint.groupBy({
      by: ["organiserId"],
      _count: {
        _all: true
      },
      where: {
        updatedAt: {
          gte: range.start,
          lte: range.end
        }
      },
      orderBy: {
        _count: {
          organiserId: "desc"
        }
      },
      take: 8
    })
  ]);

  return {
    kpis: {
      events,
      reportsOpen,
      stalePoints
    },
    geo: geoRows,
    organiserActivity: organisers.map((row) => ({
      organiserId: row.organiserId,
      updates: row._count._all
    }))
  };
}

export async function getOrganiserAnalyticsSnapshot(range: AnalyticsRange, userId: string) {
  const organiser = await prisma.organiserProfile.findUnique({
    where: { userId },
    select: { id: true }
  });

  if (!organiser) {
    return null;
  }

  const [points, reportsOpen, recentlyVerified] = await Promise.all([
    prisma.aidPoint.count({
      where: {
        organiserId: organiser.id
      }
    }),
    prisma.aidPointReport.count({
      where: {
        aidPoint: {
          organiserId: organiser.id
        },
        status: {
          in: ["OPEN", "UNDER_REVIEW"]
        }
      }
    }),
    prisma.aidPointVerification.count({
      where: {
        aidPoint: {
          organiserId: organiser.id
        },
        createdAt: {
          gte: range.start,
          lte: range.end
        }
      }
    })
  ]);

  return {
    points,
    reportsOpen,
    recentlyVerified
  };
}

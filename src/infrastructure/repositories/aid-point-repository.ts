import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import { MAX_NEARBY_RESULTS } from "@/lib/constants/app";

export type NearbyAidPoint = {
  id: string;
  publicSlug: string;
  latitude: number;
  longitude: number;
  operationalStatus: string;
  distanceKm: number;
  lastVerifiedAt: Date | null;
  primaryPhone: string;
};

export async function findNearbyAidPoints(input: {
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  const rows = await prisma.$queryRaw<NearbyAidPoint[]>(Prisma.sql`
    SELECT
      ap.id,
      ap."publicSlug",
      ap.latitude::float8 AS latitude,
      ap.longitude::float8 AS longitude,
      ap."operationalStatus",
      ap."lastVerifiedAt",
      ap."primaryPhone",
      ST_Distance(
        ap.location,
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
      ) / 1000.0 AS "distanceKm"
    FROM "AidPoint" ap
    WHERE ap."publicationStatus" = 'PUBLISHED'
      AND ap."operationalStatus" IN ('OPEN', 'FULL', 'NEEDS_VERIFICATION', 'TEMPORARILY_CLOSED')
      AND ST_DWithin(
        ap.location,
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography,
        ${input.radiusKm * 1000}
      )
    ORDER BY "distanceKm" ASC
    LIMIT ${MAX_NEARBY_RESULTS}
  `);

  return rows;
}

export async function findPublishedAidPoints(input: {
  latitude: number;
  longitude: number;
}) {
  const rows = await prisma.$queryRaw<NearbyAidPoint[]>(Prisma.sql`
    SELECT
      ap.id,
      ap."publicSlug",
      ap.latitude::float8 AS latitude,
      ap.longitude::float8 AS longitude,
      ap."operationalStatus",
      ap."lastVerifiedAt",
      ap."primaryPhone",
      ST_Distance(
        ap.location,
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
      ) / 1000.0 AS "distanceKm"
    FROM "AidPoint" ap
    WHERE ap."publicationStatus" = 'PUBLISHED'
      AND ap."operationalStatus" IN ('OPEN', 'FULL', 'NEEDS_VERIFICATION', 'TEMPORARILY_CLOSED')
    ORDER BY "distanceKm" ASC
    LIMIT ${MAX_NEARBY_RESULTS}
  `);

  return rows;
}

export async function getAidPointByPublicSlug(slug: string) {
  return prisma.aidPoint.findFirst({
    where: {
      publicationStatus: "PUBLISHED",
      OR: [{ publicSlug: slug }, { id: slug }]
    },
    include: {
      translations: true,
      organiser: {
        include: {
          user: true
        }
      }
    }
  });
}

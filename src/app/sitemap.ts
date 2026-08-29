import type { MetadataRoute } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { getBaseUrl } from "@/lib/seo/public";

const LOCALES = ["ar-DZ", "fr-DZ", "tzm-DZ"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticUrls: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${base}/${locale}`,
    changeFrequency: "hourly",
    priority: 1
  }));

  const points = await prisma.aidPoint.findMany({
    where: {
      publicationStatus: "PUBLISHED",
      operationalStatus: "OPEN"
    },
    select: {
      publicSlug: true,
      updatedAt: true
    }
  });

  const detailUrls: MetadataRoute.Sitemap = points.flatMap((point) =>
    LOCALES.map((locale) => ({
      url: `${base}/${locale}/aid-points/${point.publicSlug}`,
      lastModified: point.updatedAt,
      changeFrequency: "daily",
      priority: 0.8
    }))
  );

  return [...staticUrls, ...detailUrls];
}

import type { MetadataRoute } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { getBaseUrl } from "@/lib/seo/public";

const LOCALES = ["ar-DZ", "fr-DZ", "tzm-DZ"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticUrls: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    {
      url: `${base}/${locale}`,
      changeFrequency: "hourly" as const,
      priority: 1
    },
    {
      url: `${base}/${locale}/privacy`,
      changeFrequency: "monthly" as const,
      priority: 0.4
    },
    {
      url: `${base}/${locale}/terms`,
      changeFrequency: "monthly" as const,
      priority: 0.4
    },
    {
      url: `${base}/${locale}/cookies`,
      changeFrequency: "monthly" as const,
      priority: 0.4
    }
  ]);

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

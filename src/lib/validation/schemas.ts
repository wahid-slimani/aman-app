import { z } from "zod";
import { ALLOWED_RADIUS_KM } from "@/lib/constants/app";

const unsafePattern = /<|>|javascript:|onerror=|onload=/i;

const safeText = (schema: z.ZodString) =>
  schema.refine((value) => !unsafePattern.test(value), {
    message: "validation.unsafeText"
  });

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128)
});

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().refine((value) => ALLOWED_RADIUS_KM.includes(value as (typeof ALLOWED_RADIUS_KM)[number]), {
    message: "validation.invalidRadius"
  })
});

export const geocodeQuerySchema = z.object({
  q: safeText(z.string().trim().min(2).max(120))
});

export const submitReportSchema = z.object({
  aidPointId: z.string().min(3).max(64),
  reason: safeText(z.string().min(3).max(80)),
  details: safeText(z.string().min(10).max(2000)),
  reporterName: safeText(z.string().min(2).max(120)).optional(),
  reporterPhone: z.string().min(8).max(30).optional()
});

export const reportReviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "RESOLVED", "DISMISSED"]),
  resolutionNote: safeText(z.string().min(2).max(500)).optional()
});

export const optimisticVersionSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  operationalStatus: z.enum(["OPEN", "TEMPORARILY_CLOSED", "FULL", "NEEDS_VERIFICATION"]).optional(),
  verificationNote: safeText(z.string().min(2).max(500)).optional()
});

export const publicationReviewSchema = z.object({
  action: z.enum(["SUBMIT_REVIEW", "PUBLISH", "REJECT", "ARCHIVE"]),
  note: safeText(z.string().min(2).max(500)).optional()
});

export const ownershipTransferSchema = z.object({
  newOrganiserId: z.string().min(3).max(64),
  reason: safeText(z.string().min(2).max(500)).optional()
});

export const rollbackSchema = z.object({
  datasetChangeId: z.string().min(3).max(64),
  note: safeText(z.string().min(2).max(500)).optional()
});

export const publicationSubmitSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  note: safeText(z.string().min(2).max(500)).optional()
});

export const verificationThresholdSchema = z
  .object({
    staleDays: z.coerce.number().int().min(1).max(365),
    criticalDays: z.coerce.number().int().min(1).max(730)
  })
  .refine((value) => value.criticalDays >= value.staleDays, {
    message: "validation.invalidThresholds",
    path: ["criticalDays"]
  });

export const analyticsEventSchema = z.object({
  type: z.string().min(3).max(80),
  source: z.enum(["api", "web", "admin", "organiser"]),
  locale: z.string().min(2).max(16).optional(),
  userRole: z.enum(["SUPER_ADMIN", "ORGANISER"]).optional(),
  aidPointId: z.string().min(3).max(64).optional(),
  wilaya: z.string().min(2).max(120).optional(),
  payload: z.record(z.string(), z.unknown()).optional()
});

export const analyticsRangeSchema = z.object({
  range: z.enum(["today", "7d", "30d", "90d", "custom"]).default("30d"),
  start: z.string().optional(),
  end: z.string().optional()
});

const translationSchema = z.object({
  locale: z.enum(["ar-DZ", "fr-DZ", "tzm-DZ"]),
  name: safeText(z.string().min(2).max(200)),
  address: safeText(z.string().min(2).max(300)),
  wilaya: safeText(z.string().min(2).max(100)),
  commune: safeText(z.string().min(2).max(100)),
  description: safeText(z.string().max(1000)).optional(),
  neededItems: safeText(z.string().max(1000)).optional()
});

export const createAidPointSchema = z.object({
  publicSlug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/),
  primaryPhone: safeText(z.string().min(8).max(30)),
  secondaryPhone: safeText(z.string().min(8).max(30)).optional(),
  whatsappPhone: safeText(z.string().min(8).max(30)).optional(),
  googleMapsUrl: z.string().url().max(500).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  translations: z.array(translationSchema).min(1).max(3)
});

export const updateAidPointSchema = createAidPointSchema.extend({
  expectedVersion: z.coerce.number().int().positive()
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(128)
});

import type { Prisma, PublicationStatus, DatasetChangeAction } from "@prisma/client";
import { SUPPORTED_LOCALES } from "@/i18n/config";

type AidPointForPolicies = {
  id: string;
  publicSlug: string;
  organiserId: string;
  publicationStatus: PublicationStatus;
  operationalStatus: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  primaryPhone: string;
  lastVerifiedAt: Date | null;
  translations: Array<{
    locale: string;
    name: string;
    address: string;
    wilaya: string;
    commune: string;
  }>;
};

export type PublicationPrerequisiteCode =
  | "MISSING_OWNER"
  | "MISSING_PRIMARY_PHONE"
  | "MISSING_VERIFICATION"
  | "INVALID_OPERATIONAL_STATUS"
  | "MISSING_TRANSLATIONS";

export function checkPublicationPrerequisites(point: AidPointForPolicies): {
  ok: boolean;
  missing: PublicationPrerequisiteCode[];
} {
  const missing: PublicationPrerequisiteCode[] = [];

  if (!point.organiserId) {
    missing.push("MISSING_OWNER");
  }

  if (!point.primaryPhone?.trim()) {
    missing.push("MISSING_PRIMARY_PHONE");
  }

  if (!point.lastVerifiedAt) {
    missing.push("MISSING_VERIFICATION");
  }

  if (point.operationalStatus === "NEEDS_VERIFICATION") {
    missing.push("INVALID_OPERATIONAL_STATUS");
  }

  const translationLocales = new Set(
    point.translations
      .filter((t) => t.name.trim() && t.address.trim() && t.wilaya.trim() && t.commune.trim())
      .map((t) => t.locale)
  );

  const hasAllLocales = SUPPORTED_LOCALES.every((locale) => translationLocales.has(locale));
  if (!hasAllLocales) {
    missing.push("MISSING_TRANSLATIONS");
  }

  return { ok: missing.length === 0, missing };
}

export async function createDatasetVersionChange(
  tx: Prisma.TransactionClient,
  input: {
    actorUserId?: string;
    aidPointId: string;
    action: DatasetChangeAction;
    note?: string;
  }
) {
  const aidPoint = await tx.aidPoint.findUnique({
    where: { id: input.aidPointId },
    include: {
      translations: true
    }
  });

  if (!aidPoint) {
    throw new Error("AID_POINT_NOT_FOUND");
  }

  const maxVersion = await tx.datasetVersion.aggregate({
    _max: {
      version: true
    }
  });

  const datasetVersion = await tx.datasetVersion.create({
    data: {
      version: (maxVersion._max.version ?? 0) + 1,
      createdById: input.actorUserId,
      note: input.note
    }
  });

  const snapshot = {
    aidPoint: {
      id: aidPoint.id,
      publicSlug: aidPoint.publicSlug,
      organiserId: aidPoint.organiserId,
      publicationStatus: aidPoint.publicationStatus,
      operationalStatus: aidPoint.operationalStatus,
      primaryPhone: aidPoint.primaryPhone,
      secondaryPhone: aidPoint.secondaryPhone,
      whatsappPhone: aidPoint.whatsappPhone,
      lastVerifiedAt: aidPoint.lastVerifiedAt,
      version: aidPoint.version
    },
    translations: aidPoint.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
      address: t.address,
      wilaya: t.wilaya,
      commune: t.commune
    }))
  };

  const change = await tx.datasetChange.create({
    data: {
      datasetVersionId: datasetVersion.id,
      aidPointId: aidPoint.id,
      action: input.action,
      publicationStatus: aidPoint.publicationStatus,
      operationalStatus: aidPoint.operationalStatus,
      snapshot
    }
  });

  return {
    datasetVersion,
    change
  };
}

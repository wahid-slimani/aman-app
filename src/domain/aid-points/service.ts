import { getAidPointByPublicSlug, findNearbyAidPoints } from "@/infrastructure/repositories/aid-point-repository";
import { classifyVerificationFreshness } from "@/domain/operational-quality/freshness";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";

export async function listNearbyAidPoints(input: {
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  const points = await findNearbyAidPoints(input);
  const thresholds = await getVerificationThresholdSettings();
  return points.map((point) => ({
    ...point,
    verificationFreshness: classifyVerificationFreshness(point.lastVerifiedAt, thresholds)
  }));
}

export async function getPublicAidPoint(slug: string) {
  return getAidPointByPublicSlug(slug);
}

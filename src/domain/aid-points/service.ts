import { getAidPointByPublicSlug, findNearbyAidPoints } from "@/infrastructure/repositories/aid-point-repository";

export async function listNearbyAidPoints(input: {
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  return findNearbyAidPoints(input);
}

export async function getPublicAidPoint(slug: string) {
  return getAidPointByPublicSlug(slug);
}

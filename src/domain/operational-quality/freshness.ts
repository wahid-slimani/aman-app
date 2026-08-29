export const DEFAULT_STALE_DAYS = 30;
export const DEFAULT_CRITICAL_DAYS = 90;

type FreshnessState = "FRESH" | "STALE" | "CRITICAL" | "UNKNOWN";

type FreshnessThresholds = {
  staleDays: number;
  criticalDays: number;
};

function getThresholdDays(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export function classifyVerificationFreshness(
  lastVerifiedAt: Date | null | undefined,
  thresholds?: Partial<FreshnessThresholds>
): FreshnessState {
  if (!lastVerifiedAt) {
    return "UNKNOWN";
  }

  const staleDays = Math.max(
    1,
    Math.floor(
      thresholds?.staleDays ?? getThresholdDays(process.env.VERIFICATION_STALE_AFTER_DAYS, DEFAULT_STALE_DAYS)
    )
  );
  const criticalDays = Math.max(
    staleDays,
    Math.floor(
      thresholds?.criticalDays ??
        getThresholdDays(process.env.VERIFICATION_CRITICAL_AFTER_DAYS, DEFAULT_CRITICAL_DAYS)
    )
  );
  const ageMs = Date.now() - lastVerifiedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays >= criticalDays) {
    return "CRITICAL";
  }

  if (ageDays >= staleDays) {
    return "STALE";
  }

  return "FRESH";
}

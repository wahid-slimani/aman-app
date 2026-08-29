import { prisma } from "@/infrastructure/database/prisma";
import { DEFAULT_CRITICAL_DAYS, DEFAULT_STALE_DAYS } from "@/domain/operational-quality/freshness";

const STALE_KEY = "verification.staleDays";
const CRITICAL_KEY = "verification.criticalDays";

function parsePositiveInt(value: string | null | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export type VerificationThresholdSettings = {
  staleDays: number;
  criticalDays: number;
};

export async function getVerificationThresholdSettings(): Promise<VerificationThresholdSettings> {
  const settings = await prisma.operationalSetting.findMany({
    where: {
      key: {
        in: [STALE_KEY, CRITICAL_KEY]
      }
    }
  });

  const staleSetting = settings.find((item) => item.key === STALE_KEY)?.value;
  const criticalSetting = settings.find((item) => item.key === CRITICAL_KEY)?.value;

  const staleDays = parsePositiveInt(staleSetting, DEFAULT_STALE_DAYS);
  const criticalDays = Math.max(staleDays, parsePositiveInt(criticalSetting, DEFAULT_CRITICAL_DAYS));

  return {
    staleDays,
    criticalDays
  };
}

export async function updateVerificationThresholdSettings(input: VerificationThresholdSettings) {
  const staleDays = Math.max(1, Math.floor(input.staleDays));
  const criticalDays = Math.max(staleDays, Math.floor(input.criticalDays));

  await prisma.$transaction([
    prisma.operationalSetting.upsert({
      where: { key: STALE_KEY },
      update: { value: String(staleDays) },
      create: { key: STALE_KEY, value: String(staleDays) }
    }),
    prisma.operationalSetting.upsert({
      where: { key: CRITICAL_KEY },
      update: { value: String(criticalDays) },
      create: { key: CRITICAL_KEY, value: String(criticalDays) }
    })
  ]);

  return {
    staleDays,
    criticalDays
  };
}

type Entry = {
  count: number;
  resetAt: number;
};

const bucket = new Map<string, Entry>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = bucket.get(key);

  if (!existing || existing.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  existing.count += 1;
  if (existing.count > limit) {
    return true;
  }

  bucket.set(key, existing);
  return false;
}

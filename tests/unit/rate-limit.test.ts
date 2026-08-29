import { describe, expect, it } from "vitest";
import { isRateLimited } from "@/lib/api/rate-limit";

describe("isRateLimited", () => {
  it("blocks requests exceeding the threshold", () => {
    const key = `k_${Date.now()}`;
    expect(isRateLimited(key, 1, 5_000)).toBe(false);
    expect(isRateLimited(key, 1, 5_000)).toBe(true);
  });
});

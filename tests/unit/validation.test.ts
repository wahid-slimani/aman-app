import { describe, expect, it } from "vitest";
import { nearbyQuerySchema } from "@/lib/validation/schemas";

describe("nearbyQuerySchema", () => {
  it("accepts allowed radius", () => {
    const parsed = nearbyQuerySchema.safeParse({ latitude: 36.75, longitude: 3.05, radius: 20 });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid radius", () => {
    const parsed = nearbyQuerySchema.safeParse({ latitude: 36.75, longitude: 3.05, radius: 15 });
    expect(parsed.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { shouldCheckCsrf } from "@/lib/security/policy";

describe("performance hot paths", () => {
  it("csrf decision helper runs fast under load", () => {
    const started = performance.now();

    for (let index = 0; index < 10000; index += 1) {
      shouldCheckCsrf("/api/admin/reports/abc", "PATCH");
      shouldCheckCsrf("/api/aid-points/nearby", "GET");
    }

    const elapsed = performance.now() - started;
    expect(elapsed).toBeLessThan(150);
  });
});

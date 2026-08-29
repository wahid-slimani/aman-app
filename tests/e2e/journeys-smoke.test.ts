import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("e2e smoke journeys", () => {
  it("public discovery routes are present and indexable in sitemap", async () => {
    const map = await sitemap();
    const ar = map.find((entry) => entry.url.endsWith("/ar-DZ"));
    const fr = map.find((entry) => entry.url.endsWith("/fr-DZ"));
    const tzm = map.find((entry) => entry.url.endsWith("/tzm-DZ"));

    expect(ar).toBeDefined();
    expect(fr).toBeDefined();
    expect(tzm).toBeDefined();
  });

  it("private surfaces are non-indexable via robots policy", () => {
    const policy = robots();
    const rule = Array.isArray(policy.rules) ? policy.rules[0] : policy.rules;

    expect(rule.disallow).toContain("/admin");
    expect(rule.disallow).toContain("/organiser");
    expect(rule.disallow).toContain("/api/");
  });
});

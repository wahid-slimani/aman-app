import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("disallows private and api routes", () => {
    const policy = robots();
    const firstRule = Array.isArray(policy.rules) ? policy.rules[0] : policy.rules;

    expect(firstRule.disallow).toContain("/admin");
    expect(firstRule.disallow).toContain("/organiser");
    expect(firstRule.disallow).toContain("/api/");
  });

  it("declares sitemap", () => {
    const policy = robots();
    expect(String(policy.sitemap)).toContain("sitemap.xml");
  });
});

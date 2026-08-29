import { describe, expect, it } from "vitest";
import { classifyVerificationFreshness } from "@/domain/operational-quality/freshness";
import { checkPublicationPrerequisites } from "@/domain/operational-quality/workflows";

describe("classifyVerificationFreshness", () => {
  it("returns UNKNOWN when no timestamp exists", () => {
    expect(classifyVerificationFreshness(null)).toBe("UNKNOWN");
  });

  it("returns FRESH for recently verified points", () => {
    const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(classifyVerificationFreshness(recent)).toBe("FRESH");
  });

  it("returns STALE for points older than stale threshold", () => {
    const stale = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    expect(classifyVerificationFreshness(stale)).toBe("STALE");
  });

  it("returns CRITICAL for points older than critical threshold", () => {
    const critical = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    expect(classifyVerificationFreshness(critical)).toBe("CRITICAL");
  });
});

describe("checkPublicationPrerequisites", () => {
  it("fails when translations are incomplete", () => {
    const result = checkPublicationPrerequisites({
      id: "p1",
      publicSlug: "p1",
      organiserId: "org1",
      publicationStatus: "DRAFT",
      operationalStatus: "OPEN",
      latitude: { toString: () => "36.7" } as never,
      longitude: { toString: () => "3.0" } as never,
      primaryPhone: "+213555000000",
      lastVerifiedAt: new Date(),
      translations: [
        {
          locale: "ar-DZ",
          name: "Point",
          address: "Addr",
          wilaya: "Alger",
          commune: "Commune"
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.missing).toContain("MISSING_TRANSLATIONS");
  });
});

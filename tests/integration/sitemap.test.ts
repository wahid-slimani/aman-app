import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn()
}));

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    aidPoint: {
      findMany: findManyMock
    }
  }
}));

import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockResolvedValue([
      {
        publicSlug: "point-a",
        updatedAt: new Date("2026-08-29T10:00:00.000Z")
      }
    ]);
  });

  it("returns localized public routes and excludes private paths", async () => {
    const entries = await sitemap();

    expect(entries.some((entry) => entry.url.endsWith("/ar-DZ"))).toBe(true);
    expect(entries.some((entry) => entry.url.endsWith("/fr-DZ"))).toBe(true);
    expect(entries.some((entry) => entry.url.endsWith("/tzm-DZ"))).toBe(true);
    expect(entries.some((entry) => entry.url.includes("/admin"))).toBe(false);
    expect(entries.some((entry) => entry.url.includes("/organiser"))).toBe(false);
  });

  it("includes localized detail urls for published open points", async () => {
    const entries = await sitemap();
    const detailEntries = entries.filter((entry) => entry.url.includes("/aid-points/point-a"));

    expect(detailEntries).toHaveLength(3);
    expect(detailEntries.every((entry) => entry.changeFrequency === "daily")).toBe(true);
  });
});

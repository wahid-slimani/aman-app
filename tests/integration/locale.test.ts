import { describe, expect, it } from "vitest";
import { resolveLocale } from "@/lib/api/locale";

describe("resolveLocale", () => {
  it("returns default locale for unsupported language", () => {
    expect(resolveLocale("en-US")).toBe("ar-DZ");
  });

  it("returns supported locale", () => {
    expect(resolveLocale("fr-DZ")).toBe("fr-DZ");
  });
});

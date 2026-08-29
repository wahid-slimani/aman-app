import { describe, expect, it } from "vitest";
import arDZ from "@/i18n/locales/ar-DZ/common.json";
import frDZ from "@/i18n/locales/fr-DZ/common.json";
import tzmDZ from "@/i18n/locales/tzm-DZ/common.json";

type Dict = Record<string, string>;

function sortedKeys(dict: Dict) {
  return Object.keys(dict).sort();
}

describe("locale dictionaries consistency", () => {
  it("all locales expose the same translation keys", () => {
    const arKeys = sortedKeys(arDZ as Dict);
    const frKeys = sortedKeys(frDZ as Dict);
    const tzmKeys = sortedKeys(tzmDZ as Dict);

    expect(frKeys).toEqual(arKeys);
    expect(tzmKeys).toEqual(arKeys);
  });

  it("translations are non-empty for all locales", () => {
    const dictionaries = [arDZ as Dict, frDZ as Dict, tzmDZ as Dict];

    for (const dict of dictionaries) {
      for (const [key, value] of Object.entries(dict)) {
        expect(key.length).toBeGreaterThan(0);
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

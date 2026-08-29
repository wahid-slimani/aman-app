import { describe, expect, it } from "vitest";
import { parseAnalyticsEventType, parseUserRole, resolveRange } from "@/domain/analytics/service";

describe("analytics service helpers", () => {
  it("accepts known event types only", () => {
    expect(parseAnalyticsEventType("REPORT_SUBMITTED")).toBe("REPORT_SUBMITTED");
    expect(parseAnalyticsEventType("UNKNOWN_EVENT")).toBeNull();
  });

  it("parses user roles safely", () => {
    expect(parseUserRole("SUPER_ADMIN")).toBe("SUPER_ADMIN");
    expect(parseUserRole("ORGANISER")).toBe("ORGANISER");
    expect(parseUserRole("PUBLIC")).toBeUndefined();
  });

  it("resolves today range", () => {
    const range = resolveRange("today");
    expect(range).not.toBeNull();
    expect(range!.start.getUTCHours()).toBe(0);
  });

  it("rejects invalid custom range", () => {
    const range = resolveRange("custom", { start: "x", end: "y" });
    expect(range).toBeNull();
  });
});

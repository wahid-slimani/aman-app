import { describe, expect, it } from "vitest";
import {
  nearbyQuerySchema,
  optimisticVersionSchema,
  ownershipTransferSchema,
  publicationReviewSchema,
  publicationSubmitSchema,
  rollbackSchema,
  submitReportSchema,
  verificationThresholdSchema
} from "@/lib/validation/schemas";

describe("nearbyQuerySchema", () => {
  it("accepts allowed radius", () => {
    const parsed = nearbyQuerySchema.safeParse({ latitude: 36.75, longitude: 3.05, radius: 20 });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid radius", () => {
    const parsed = nearbyQuerySchema.safeParse({ latitude: 36.75, longitude: 3.05, radius: 15 });
    expect(parsed.success).toBe(false);
  });

  it("rejects malformed coordinate input", () => {
    const parsed = nearbyQuerySchema.safeParse({ latitude: "36.75", longitude: "3.05;DROP TABLE", radius: "20" });
    expect(parsed.success).toBe(false);
  });
});

describe("submitReportSchema", () => {
  it("accepts valid report payload", () => {
    const parsed = submitReportSchema.safeParse({
      aidPointId: "cp1",
      reason: "wrong phone",
      details: "The listed phone does not connect and needs update.",
      reporterName: "A User"
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short details", () => {
    const parsed = submitReportSchema.safeParse({
      aidPointId: "cp1",
      reason: "x",
      details: "short"
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects html/script-like payloads", () => {
    const parsed = submitReportSchema.safeParse({
      aidPointId: "cp1",
      reason: "<script>alert(1)</script>",
      details: "The listed phone does not connect and needs update."
    });
    expect(parsed.success).toBe(false);
  });
});

describe("optimisticVersionSchema", () => {
  it("accepts expected version and status", () => {
    const parsed = optimisticVersionSchema.safeParse({ expectedVersion: 3, operationalStatus: "OPEN" });
    expect(parsed.success).toBe(true);
  });

  it("rejects missing expectedVersion", () => {
    const parsed = optimisticVersionSchema.safeParse({ operationalStatus: "OPEN" });
    expect(parsed.success).toBe(false);
  });
});

describe("publication schemas", () => {
  it("accepts publication review action", () => {
    const parsed = publicationReviewSchema.safeParse({ action: "PUBLISH", note: "ready" });
    expect(parsed.success).toBe(true);
  });

  it("accepts publication submission with expected version", () => {
    const parsed = publicationSubmitSchema.safeParse({ expectedVersion: 2, note: "submit" });
    expect(parsed.success).toBe(true);
  });
});

describe("ownership/rollback schemas", () => {
  it("accepts ownership transfer payload", () => {
    const parsed = ownershipTransferSchema.safeParse({ newOrganiserId: "org_123", reason: "handover" });
    expect(parsed.success).toBe(true);
  });

  it("accepts rollback payload", () => {
    const parsed = rollbackSchema.safeParse({ datasetChangeId: "chg_123", note: "rollback" });
    expect(parsed.success).toBe(true);
  });
});

describe("verificationThresholdSchema", () => {
  it("accepts valid stale/critical thresholds", () => {
    const parsed = verificationThresholdSchema.safeParse({ staleDays: 30, criticalDays: 90 });
    expect(parsed.success).toBe(true);
  });

  it("rejects critical threshold below stale threshold", () => {
    const parsed = verificationThresholdSchema.safeParse({ staleDays: 30, criticalDays: 10 });
    expect(parsed.success).toBe(false);
  });
});

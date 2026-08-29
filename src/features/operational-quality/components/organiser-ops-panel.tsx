"use client";

import { useMemo, useState } from "react";
import { getCsrfTokenFromCookie } from "@/lib/security/csrf-client";

type Dict = Record<string, string>;

type OwnPoint = {
  id: string;
  title: string;
  publicSlug: string;
  publicationStatus: string;
  operationalStatus: string;
  version: number;
  freshness: "FRESH" | "STALE" | "CRITICAL" | "UNKNOWN";
  openReports: number;
};

export function OrganiserOpsPanel({
  dict,
  initialPoints
}: {
  dict: Dict;
  initialPoints: OwnPoint[];
}) {
  const [points, setPoints] = useState<OwnPoint[]>(initialPoints);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadPoints(showLoader: boolean) {
    if (showLoader) {
      setLoading(true);
      setError("");
    }

    try {
      const response = await fetch("/api/organiser/aid-points", { cache: "no-store" });
      const payload = (await response.json()) as {
        success: boolean;
        data?: OwnPoint[];
        error?: { message: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      setPoints(payload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : dict["common.error"]);
    } finally {
      setLoading(false);
    }
  }

  const staleCount = useMemo(
    () => points.filter((point) => point.freshness === "STALE" || point.freshness === "CRITICAL").length,
    [points]
  );

  async function verifyPoint(point: OwnPoint) {
    setBusyId(point.id);
    setError("");
    try {
      const response = await fetch(`/api/organiser/aid-points/${point.id}/verify`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie()
        },
        body: JSON.stringify({
          expectedVersion: point.version,
          verificationNote: dict["organiser.ops.defaultVerificationNote"]
        })
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: { message: string; code?: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      await loadPoints(false);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : dict["common.error"]);
    } finally {
      setBusyId("");
    }
  }

  async function submitForReview(point: OwnPoint) {
    setBusyId(point.id);
    setError("");
    try {
      const response = await fetch(`/api/organiser/aid-points/${point.id}/publication`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie()
        },
        body: JSON.stringify({
          expectedVersion: point.version,
          note: dict["organiser.ops.defaultReviewNote"]
        })
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: { message: string; code?: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      await loadPoints(false);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : dict["common.error"]);
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">{dict["common.loading"]}</p>;
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        <p>{error}</p>
        <button className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-white" onClick={() => void loadPoints(true)} type="button">
          {dict["common.retry"]}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{dict["organiser.ops.summaryTitle"]}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {dict["organiser.ops.totalPoints"]}: {points.length} | {dict["organiser.ops.stalePoints"]}: {staleCount}
        </p>
      </article>

      {points.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">{dict["organiser.ops.empty"]}</p>
      ) : (
        <ul className="space-y-3">
          {points.map((point) => (
            <li className="rounded-2xl border border-slate-200 bg-white p-4" key={point.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{point.title}</p>
                  <p className="text-xs text-slate-600">/{point.publicSlug}</p>
                </div>
                <span className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-700">
                  {dict[`organiser.ops.freshness.${point.freshness}`] ?? point.freshness}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {dict["organiser.ops.openReports"]}: {point.openReports}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
                  disabled={busyId === point.id}
                  onClick={() => void verifyPoint(point)}
                  type="button"
                >
                  {dict["organiser.ops.verify"]}
                </button>
                <button
                  className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-50"
                  disabled={busyId === point.id || point.publicationStatus === "PUBLISHED"}
                  onClick={() => void submitForReview(point)}
                  type="button"
                >
                  {dict["organiser.ops.submitReview"]}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

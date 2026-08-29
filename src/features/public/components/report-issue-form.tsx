"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type PointOption = {
  id: string;
  publicSlug: string;
};

type Props = {
  locale: string;
  dict: Record<string, string>;
};

const ALGERIA_CENTER = {
  latitude: 28.0339,
  longitude: 1.6596
};

export default function ReportIssueForm({ locale, dict }: Props) {
  const [points, setPoints] = useState<PointOption[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [selectedAidPointId, setSelectedAidPointId] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPoints() {
      setLoadingPoints(true);
      setError("");

      try {
        const response = await fetch(
          `/api/aid-points/confirmed?latitude=${ALGERIA_CENTER.latitude}&longitude=${ALGERIA_CENTER.longitude}`,
          { headers: { "accept-language": locale } }
        );
        const payload = (await response.json()) as {
          success: boolean;
          data?: Array<{ id: string; publicSlug: string }>;
          error?: { message?: string };
        };

        if (!payload.success) {
          throw new Error(payload.error?.message ?? dict["common.error"]);
        }

        if (cancelled) {
          return;
        }

        const options = (payload.data ?? []).map((item) => ({ id: item.id, publicSlug: item.publicSlug }));
        setPoints(options);
        setSelectedAidPointId(options[0]?.id ?? "");
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : dict["common.error"]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPoints(false);
        }
      }
    }

    void loadPoints();

    return () => {
      cancelled = true;
    };
  }, [dict, locale]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAidPointId || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept-language": locale
        },
        body: JSON.stringify({
          aidPointId: selectedAidPointId,
          reason,
          details,
          reporterName: reporterName || undefined,
          reporterPhone: reporterPhone || undefined
        })
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      setReason("");
      setDetails("");
      setReporterName("");
      setReporterPhone("");
      setSuccessMessage(dict["reportIssue.success"]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : dict["common.error"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      {loadingPoints ? <p className="text-sm text-slate-600">{dict["common.loading"]}</p> : null}

      {!loadingPoints && points.length > 0 ? (
        <label className="block text-sm text-slate-700">
          {dict["reportIssue.pointLabel"]}
          <select
            className="mt-1 min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
            onChange={(event) => setSelectedAidPointId(event.target.value)}
            value={selectedAidPointId}
          >
            {points.map((point) => (
              <option key={point.id} value={point.id}>
                {point.publicSlug}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="block text-sm text-slate-700">
        {dict["reportIssue.reasonLabel"]}
        <input
          className="mt-1 min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
          minLength={3}
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
        />
      </label>

      <label className="block text-sm text-slate-700">
        {dict["reportIssue.detailsLabel"]}
        <textarea
          className="mt-1 min-h-24 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
          minLength={10}
          onChange={(event) => setDetails(event.target.value)}
          required
          value={details}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-700">
          {dict["reportIssue.nameLabel"]}
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
            onChange={(event) => setReporterName(event.target.value)}
            value={reporterName}
          />
        </label>
        <label className="block text-sm text-slate-700">
          {dict["reportIssue.phoneLabel"]}
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm"
            onChange={(event) => setReporterPhone(event.target.value)}
            value={reporterPhone}
          />
        </label>
      </div>

      {error ? <p className="text-sm text-[#b91c1c]">{error}</p> : null}
      {successMessage ? <p className="text-sm text-[#006233]">{successMessage}</p> : null}

      <button
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#006233] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        disabled={submitting || loadingPoints || points.length === 0}
        type="submit"
      >
        {submitting ? dict["form.saving"] : dict["reportIssue.submit"]}
      </button>
    </form>
  );
}

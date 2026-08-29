type ApiErrorDetails = Array<string | { code?: string; message?: string }>;

type ApiErrorShape = {
  message?: string;
  details?: ApiErrorDetails;
};

export function explainApiError(error: ApiErrorShape | undefined, fallback: string) {
  const base = error?.message?.trim() || fallback;
  const details = error?.details;

  if (!details || details.length === 0) {
    return base;
  }

  const lines = details
    .map((detail) => {
      if (typeof detail === "string") {
        return detail.trim();
      }

      return detail.message?.trim() || detail.code?.trim() || "";
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return base;
  }

  return `${base}\n- ${lines.join("\n- ")}`;
}

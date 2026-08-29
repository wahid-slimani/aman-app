import { NextResponse } from "next/server";
import type { AppLocale } from "@/i18n/config";
import { createRequestId } from "@/lib/utils/request-id";
import { t } from "@/lib/api/messages";

type ApiError = {
  code: string;
  messageKey: string;
  status: number;
  details?: unknown;
};

export function apiSuccess<T>(data: T, requestId = createRequestId()) {
  return NextResponse.json({
    success: true,
    data,
    requestId
  });
}

export function apiError(error: ApiError, locale: AppLocale, requestId = createRequestId()) {
  const errorPayload: {
    code: string;
    message: string;
    details?: unknown;
  } = {
    code: error.code,
    message: t(locale, error.messageKey)
  };

  if (error.details !== undefined) {
    errorPayload.details = error.details;
  }

  return NextResponse.json(
    {
      success: false,
      error: errorPayload,
      requestId
    },
    { status: error.status }
  );
}

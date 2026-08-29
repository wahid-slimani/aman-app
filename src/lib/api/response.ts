import { NextResponse } from "next/server";
import type { AppLocale } from "@/i18n/config";
import { createRequestId } from "@/lib/utils/request-id";
import { t } from "@/lib/api/messages";

type ApiError = {
  code: string;
  messageKey: string;
  status: number;
};

export function apiSuccess<T>(data: T, requestId = createRequestId()) {
  return NextResponse.json({
    success: true,
    data,
    requestId
  });
}

export function apiError(error: ApiError, locale: AppLocale, requestId = createRequestId()) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: t(locale, error.messageKey)
      },
      requestId
    },
    { status: error.status }
  );
}

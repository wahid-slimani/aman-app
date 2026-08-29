import { getCsrfTokenFromCookie } from "@/lib/security/csrf-client";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getLocaleFromCookie() {
  if (typeof document === "undefined") {
    return "";
  }

  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("aman_locale="));

  return value ? decodeURIComponent(value.split("=")[1] ?? "") : "";
}

function normalizeMethod(method?: string) {
  return (method ?? "GET").toUpperCase();
}

function withCsrfHeaders(init: RequestInit, includeCsrf: boolean) {
  const method = normalizeMethod(init.method);
  const headers = new Headers(init.headers);

  if (includeCsrf && MUTATING_METHODS.has(method) && !headers.has("x-csrf-token")) {
    const csrf = getCsrfTokenFromCookie();
    if (csrf) {
      headers.set("x-csrf-token", csrf);
    }
  }

  if (!headers.has("accept-language")) {
    const locale = getLocaleFromCookie();
    if (locale) {
      headers.set("accept-language", locale);
    }
  }

  return headers;
}

async function refreshAccessToken() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin"
  });

  return response.ok;
}

export async function authenticatedFetch(input: string, init: RequestInit = {}, includeCsrf = true) {
  const firstResponse = await fetch(input, {
    ...init,
    credentials: init.credentials ?? "same-origin",
    headers: withCsrfHeaders(init, includeCsrf)
  });

  if (firstResponse.status !== 401 || input === "/api/auth/refresh") {
    return firstResponse;
  }

  const refreshed = await refreshAccessToken().catch(() => false);
  if (!refreshed) {
    return firstResponse;
  }

  return fetch(input, {
    ...init,
    credentials: init.credentials ?? "same-origin",
    headers: withCsrfHeaders(init, includeCsrf)
  });
}

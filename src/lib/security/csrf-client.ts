export function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") {
    return "";
  }

  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("aman_csrf="));

  if (!value) {
    return "";
  }

  return decodeURIComponent(value.split("=")[1] ?? "");
}

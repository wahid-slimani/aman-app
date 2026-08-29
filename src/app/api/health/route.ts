import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  return apiSuccess({
    status: "ok",
    service: "aman-app",
    timestamp: new Date().toISOString()
  });
}

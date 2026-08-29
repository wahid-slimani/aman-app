import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  return apiSuccess({
    status: "ready",
    timestamp: new Date().toISOString()
  });
}

import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { requireRole } from "@/lib/security/authorization";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  const data = await prisma.aidPointReport.findMany({
    where: status
      ? {
          status: status as never
        }
      : undefined,
    include: {
      aidPoint: {
        select: {
          id: true,
          publicSlug: true,
          organiserId: true
        }
      },
      reviewedBy: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 200
  });

  return apiSuccess(data);
}

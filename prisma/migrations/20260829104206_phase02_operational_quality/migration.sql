-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "AidPointReport" (
    "id" TEXT NOT NULL,
    "aidPointId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidPointReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidPointVerification" (
    "id" TEXT NOT NULL,
    "aidPointId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AidPointVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AidPointReport_aidPointId_status_idx" ON "AidPointReport"("aidPointId", "status");

-- CreateIndex
CREATE INDEX "AidPointReport_createdAt_idx" ON "AidPointReport"("createdAt");

-- CreateIndex
CREATE INDEX "AidPointVerification_aidPointId_createdAt_idx" ON "AidPointVerification"("aidPointId", "createdAt");

-- CreateIndex
CREATE INDEX "AidPointVerification_actorUserId_idx" ON "AidPointVerification"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "AidPointReport" ADD CONSTRAINT "AidPointReport_aidPointId_fkey" FOREIGN KEY ("aidPointId") REFERENCES "AidPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPointReport" ADD CONSTRAINT "AidPointReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPointVerification" ADD CONSTRAINT "AidPointVerification_aidPointId_fkey" FOREIGN KEY ("aidPointId") REFERENCES "AidPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPointVerification" ADD CONSTRAINT "AidPointVerification_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('AUTH_LOGIN_SUCCESS', 'AUTH_REFRESH_SUCCESS', 'REPORT_SUBMITTED', 'AID_POINT_NEARBY_SEARCH', 'AID_POINT_VERIFIED', 'AID_POINT_PUBLICATION_SUBMITTED', 'AID_POINT_PUBLISHED', 'AID_POINT_ARCHIVED', 'REPORT_REVIEWED');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "source" TEXT NOT NULL,
    "locale" TEXT,
    "userRole" "UserRole",
    "userId" TEXT,
    "aidPointId" TEXT,
    "wilaya" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsAggregate" (
    "id" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "bucketDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_eventDate_idx" ON "AnalyticsEvent"("type", "eventDate");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_source_eventDate_idx" ON "AnalyticsEvent"("source", "eventDate");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userRole_eventDate_idx" ON "AnalyticsEvent"("userRole", "eventDate");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_wilaya_eventDate_idx" ON "AnalyticsEvent"("wilaya", "eventDate");

-- CreateIndex
CREATE INDEX "AnalyticsAggregate_period_bucketDate_idx" ON "AnalyticsAggregate"("period", "bucketDate");

-- CreateIndex
CREATE INDEX "AnalyticsAggregate_metricKey_period_bucketDate_idx" ON "AnalyticsAggregate"("metricKey", "period", "bucketDate");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsAggregate_metricKey_bucketDate_period_dimension_key" ON "AnalyticsAggregate"("metricKey", "bucketDate", "period", "dimension");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_aidPointId_fkey" FOREIGN KEY ("aidPointId") REFERENCES "AidPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

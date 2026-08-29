-- CreateEnum
CREATE TYPE "DatasetChangeAction" AS ENUM ('PUBLISH', 'ARCHIVE', 'ROLLBACK', 'TRANSFER_OWNERSHIP', 'VERIFY', 'UPDATE_STATUS');

-- CreateTable
CREATE TABLE "DatasetVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetChange" (
    "id" TEXT NOT NULL,
    "datasetVersionId" TEXT NOT NULL,
    "aidPointId" TEXT NOT NULL,
    "action" "DatasetChangeAction" NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL,
    "operationalStatus" "OperationalStatus" NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasetChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatasetVersion_version_key" ON "DatasetVersion"("version");

-- CreateIndex
CREATE INDEX "DatasetVersion_createdAt_idx" ON "DatasetVersion"("createdAt");

-- CreateIndex
CREATE INDEX "DatasetChange_datasetVersionId_idx" ON "DatasetChange"("datasetVersionId");

-- CreateIndex
CREATE INDEX "DatasetChange_aidPointId_createdAt_idx" ON "DatasetChange"("aidPointId", "createdAt");

-- AddForeignKey
ALTER TABLE "DatasetVersion" ADD CONSTRAINT "DatasetVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetChange" ADD CONSTRAINT "DatasetChange_datasetVersionId_fkey" FOREIGN KEY ("datasetVersionId") REFERENCES "DatasetVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetChange" ADD CONSTRAINT "DatasetChange_aidPointId_fkey" FOREIGN KEY ("aidPointId") REFERENCES "AidPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

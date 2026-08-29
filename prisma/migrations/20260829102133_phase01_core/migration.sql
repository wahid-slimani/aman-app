CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ORGANISER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OperationalStatus" AS ENUM ('OPEN', 'TEMPORARILY_CLOSED', 'FULL', 'NEEDS_VERIFICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "usernameNorm" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganiserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "organisationName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganiserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidPoint" (
    "id" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "organiserId" TEXT NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "operationalStatus" "OperationalStatus" NOT NULL DEFAULT 'NEEDS_VERIFICATION',
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "location" geography(Point,4326) NOT NULL,
    "googleMapsUrl" TEXT,
    "primaryPhone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "whatsappPhone" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AidPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidPointTranslation" (
    "id" TEXT NOT NULL,
    "aidPointId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "wilaya" TEXT NOT NULL,
    "commune" TEXT NOT NULL,

    CONSTRAINT "AidPointTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameNorm_key" ON "User"("usernameNorm");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");

-- CreateIndex
CREATE INDEX "RefreshSession_familyId_idx" ON "RefreshSession"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganiserProfile_userId_key" ON "OrganiserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AidPoint_publicSlug_key" ON "AidPoint"("publicSlug");

-- CreateIndex
CREATE INDEX "AidPoint_organiserId_idx" ON "AidPoint"("organiserId");

-- CreateIndex
CREATE INDEX "AidPoint_publicationStatus_operationalStatus_idx" ON "AidPoint"("publicationStatus", "operationalStatus");

-- CreateIndex
CREATE INDEX "AidPointTranslation_locale_idx" ON "AidPointTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "AidPointTranslation_aidPointId_locale_key" ON "AidPointTranslation"("aidPointId", "locale");

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganiserProfile" ADD CONSTRAINT "OrganiserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPoint" ADD CONSTRAINT "AidPoint_organiserId_fkey" FOREIGN KEY ("organiserId") REFERENCES "OrganiserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPointTranslation" ADD CONSTRAINT "AidPointTranslation_aidPointId_fkey" FOREIGN KEY ("aidPointId") REFERENCES "AidPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

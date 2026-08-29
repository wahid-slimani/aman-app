-- CreateTable
CREATE TABLE "OperationalSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalSetting_pkey" PRIMARY KEY ("key")
);

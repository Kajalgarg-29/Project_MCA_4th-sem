-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "type" TEXT NOT NULL DEFAULT 'Social Media',
    "budget" DOUBLE PRECISION,
    "spent" DOUBLE PRECISION DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "target" TEXT,
    "reach" INTEGER DEFAULT 0,
    "clicks" INTEGER DEFAULT 0,
    "conversions" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

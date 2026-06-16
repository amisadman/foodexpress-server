-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "image" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0;

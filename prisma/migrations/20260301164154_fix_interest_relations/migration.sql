/*
  Warnings:

  - The values [SELF] on the enum `ProfileFor` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ProfileFor_new" AS ENUM ('MYSELF', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'NEPHEW', 'NIECE', 'FRIEND', 'OTHER');
ALTER TABLE "Biodata" ALTER COLUMN "profileFor" TYPE "ProfileFor_new" USING ("profileFor"::text::"ProfileFor_new");
ALTER TYPE "ProfileFor" RENAME TO "ProfileFor_old";
ALTER TYPE "ProfileFor_new" RENAME TO "ProfileFor";
DROP TYPE "public"."ProfileFor_old";
COMMIT;

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderBiodataId" TEXT NOT NULL,
    "receiverBiodataId" TEXT NOT NULL,
    "message" TEXT,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interest_senderBiodataId_receiverBiodataId_key" ON "Interest"("senderBiodataId", "receiverBiodataId");

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_senderBiodataId_fkey" FOREIGN KEY ("senderBiodataId") REFERENCES "Biodata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_receiverBiodataId_fkey" FOREIGN KEY ("receiverBiodataId") REFERENCES "Biodata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

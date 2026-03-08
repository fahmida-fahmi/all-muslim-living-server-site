/*
  Warnings:

  - A unique constraint covering the columns `[customId]` on the table `Biodata` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Biodata" ADD COLUMN     "customId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Biodata_customId_key" ON "Biodata"("customId");

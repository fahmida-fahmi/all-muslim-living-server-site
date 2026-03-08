/*
  Warnings:

  - You are about to drop the column `biodataId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Biodata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Biodata` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_biodataId_fkey";

-- AlterTable
ALTER TABLE "Biodata" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "biodataId";

-- CreateIndex
CREATE UNIQUE INDEX "Biodata_userId_key" ON "Biodata"("userId");

-- AddForeignKey
ALTER TABLE "Biodata" ADD CONSTRAINT "Biodata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

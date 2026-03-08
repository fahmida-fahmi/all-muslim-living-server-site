-- CreateTable
CREATE TABLE "shortlists" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "biodataId" TEXT NOT NULL,

    CONSTRAINT "shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shortlists_userId_idx" ON "shortlists"("userId");

-- CreateIndex
CREATE INDEX "shortlists_biodataId_idx" ON "shortlists"("biodataId");

-- CreateIndex
CREATE UNIQUE INDEX "shortlists_userId_biodataId_key" ON "shortlists"("userId", "biodataId");

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_biodataId_fkey" FOREIGN KEY ("biodataId") REFERENCES "Biodata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

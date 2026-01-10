-- CreateTable
CREATE TABLE "JobStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalJobsPosted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JobStats_pkey" PRIMARY KEY ("id")
);

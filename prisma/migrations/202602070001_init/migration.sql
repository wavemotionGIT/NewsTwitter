-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('watching', 'draft', 'published');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('running', 'success', 'failed');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "embedding" TEXT,
    "similarityHash" TEXT,
    "lastTweetId" TEXT,
    "updateCount" INTEGER NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "snippet" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "accessible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL,
    "metrics" JSONB NOT NULL,
    "logs" JSONB NOT NULL,
    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Story_status_createdAt_idx" ON "Story"("status", "createdAt");
CREATE INDEX "Source_domain_idx" ON "Source"("domain");
CREATE UNIQUE INDEX "Source_storyId_url_key" ON "Source"("storyId", "url");
CREATE INDEX "JobRun_status_startedAt_idx" ON "JobRun"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

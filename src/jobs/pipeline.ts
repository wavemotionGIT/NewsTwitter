import crypto from "node:crypto";
import { prisma } from "../utils/prisma.js";
import { loadSources } from "../config/sourceLoader.js";
import { fetchRssFeed } from "../ingest/rssFetcher.js";
import { extractFullText } from "../ingest/extractor.js";
import { isPubliclyAccessible } from "../ingest/validator.js";
import { clusterItems, selectDistinctSources } from "../cluster/clustering.js";
import { embedText, cosineSimilarity } from "../cluster/embeddings.js";
import { generateThread } from "../writer/threadGenerator.js";
import { postThread } from "../twitter/client.js";
import { isDomainAllowed, DEFAULT_ALLOWLIST, DEFAULT_BLOCKLIST } from "../config/domains.js";
import { logger } from "../utils/logger.js";

export async function runPipeline() {
  const startedAt = new Date();
  const run = await prisma.jobRun.create({ data: { status: "running", startedAt, metrics: {}, logs: {} } });
  try {
    const feeds = loadSources();
    const collected = [];
    for (const feed of feeds) {
      const items = await fetchRssFeed(feed);
      for (const item of items.slice(0, 10)) {
        if (!isDomainAllowed(item.domain, DEFAULT_ALLOWLIST, DEFAULT_BLOCKLIST)) continue;
        const accessible = await isPubliclyAccessible(item.url);
        if (!accessible) continue;
        const fullText = await extractFullText(item.url);
        collected.push({ ...item, accessible, fullText });
      }
    }

    const candidates = clusterItems(collected);
    for (const candidate of candidates) {
      const selected = selectDistinctSources(candidate.items, 3, 10);
      const signatureText = selected.map((s) => `${s.title}|${s.domain}`).join("\n");
      const similarityHash = crypto.createHash("sha1").update(signatureText).digest("hex");

      if (selected.length < 3) {
        await prisma.story.create({
          data: {
            status: "watching",
            title: candidate.items[0]?.title ?? "Watching story",
            summary: "Insufficient validated sources yet",
            topic: candidate.topic,
            similarityHash,
            confidence: 0.3,
            sources: {
              create: candidate.items.map((s) => ({
                url: s.url,
                domain: s.domain,
                publisher: s.publisher,
                title: s.title,
                publishedAt: s.publishedAt,
                snippet: s.snippet,
                accessible: s.accessible,
                fetchedAt: new Date()
              }))
            }
          }
        });
        continue;
      }

      const draft = await generateThread(selected);
      const embedding = await embedText(`${draft.title}\n${draft.tweets.join("\n")}`);
      const recentStories = await prisma.story.findMany({
        where: { status: "published", createdAt: { gte: new Date(Date.now() - 72 * 3600 * 1000) } },
        select: { id: true, embedding: true, updateCount: true, lastTweetId: true }
      });

      let duplicateOf: string | null = null;
      for (const story of recentStories) {
        const old = JSON.parse(story.embedding ?? "[]") as number[];
        if (old.length && cosineSimilarity(old, embedding) >= Number(process.env.SIMILARITY_THRESHOLD ?? 0.83)) {
          duplicateOf = story.id;
          break;
        }
      }

      if (duplicateOf) {
        await prisma.story.update({
          where: { id: duplicateOf },
          data: {
            updatedAt: new Date(),
            sources: {
              create: selected.map((s) => ({
                url: s.url,
                domain: s.domain,
                publisher: s.publisher,
                title: s.title,
                publishedAt: s.publishedAt,
                snippet: s.snippet,
                accessible: s.accessible,
                fetchedAt: new Date()
              }))
            }
          }
        });
        continue;
      }

      const tweetId = await postThread(draft.tweets);
      await prisma.story.create({
        data: {
          status: tweetId ? "published" : "draft",
          title: draft.title,
          summary: draft.tweets.join("\n\n"),
          topic: candidate.topic,
          publishedAt: tweetId ? new Date() : null,
          embedding: JSON.stringify(embedding),
          similarityHash,
          lastTweetId: tweetId,
          updateCount: 0,
          confidence: draft.confidence,
          sources: {
            create: selected.map((s) => ({
              url: s.url,
              domain: s.domain,
              publisher: s.publisher,
              title: s.title,
              publishedAt: s.publishedAt,
              snippet: s.snippet,
              accessible: s.accessible,
              fetchedAt: new Date()
            }))
          }
        }
      });
    }

    await prisma.jobRun.update({ where: { id: run.id }, data: { status: "success", finishedAt: new Date(), metrics: { candidates: candidates.length } } });
  } catch (error) {
    logger.error({ error }, "Pipeline failed");
    await prisma.jobRun.update({ where: { id: run.id }, data: { status: "failed", finishedAt: new Date(), logs: { error: String(error) } } });
  }
}

import crypto from "node:crypto";
import { IngestedItem, StoryCandidate } from "../types.js";
import { detectTopic } from "../config/topics.js";

const ENTITY_RE = /\b([A-Z]{2,5}|BTC|ETH|CPI|PPI|FOMC|GDP|SEC|ETF)\b/g;

export function clusterItems(items: IngestedItem[]): StoryCandidate[] {
  const buckets = new Map<string, IngestedItem[]>();

  for (const item of items) {
    const entities = ((item.title + " " + (item.snippet ?? "")).match(ENTITY_RE) ?? []).slice(0, 5);
    const timeBucket = Math.floor(item.publishedAt.getTime() / (1000 * 60 * 60 * 6));
    const keySeed = `${entities.sort().join("|")}|${timeBucket}|${detectTopic(item.title)}`;
    const key = crypto.createHash("md5").update(keySeed).digest("hex");
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(item);
  }

  return Array.from(buckets.entries()).map(([key, bucket]) => ({
    key,
    items: bucket,
    topic: detectTopic(bucket.map((b) => b.title).join(" ")),
    score: bucket.length
  }));
}

export function selectDistinctSources(items: IngestedItem[], min = 3, max = 10): IngestedItem[] {
  const out: IngestedItem[] = [];
  const seenDomains = new Set<string>();
  for (const item of items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())) {
    if (!item.accessible) continue;
    if (seenDomains.has(item.domain)) continue;
    seenDomains.add(item.domain);
    out.push(item);
    if (out.length >= max) break;
  }
  return out.length >= min ? out : [];
}

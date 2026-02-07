import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { FeedSource, IngestedItem } from "../types.js";

const parser = new XMLParser({ ignoreAttributes: false });

function toArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function parseDate(input?: string): Date {
  if (!input) return new Date();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function fetchRssFeed(source: FeedSource): Promise<IngestedItem[]> {
  const { data } = await axios.get<string>(source.url, { timeout: 20000, headers: { "User-Agent": "NewsTwitterBot/1.0" } });
  const doc = parser.parse(data);

  const rawItems = toArray(doc?.rss?.channel?.item)
    .concat(toArray(doc?.feed?.entry));

  return rawItems
    .map((item: any) => {
      const link = typeof item.link === "string" ? item.link : item.link?.href;
      if (!link) return null;
      const url = new URL(link);
      return {
        title: item.title?.["#text"] ?? item.title ?? "Untitled",
        url: link,
        domain: url.hostname.replace(/^www\./, ""),
        publisher: source.name,
        publishedAt: parseDate(item.pubDate ?? item.published ?? item.updated),
        tags: toArray(item.category).map((c) => (typeof c === "string" ? c : c?.["#text"] ?? "")).filter(Boolean),
        snippet: item.description ?? item.summary,
        accessible: true
      } satisfies IngestedItem;
    })
    .filter((x): x is IngestedItem => x !== null);
}

import OpenAI from "openai";
import { DraftThread, IngestedItem } from "../types.js";
import { env } from "../env.js";
import { compactSources } from "./citationLinker.js";
import { splitLongText } from "./charCounter.js";

const client = env.llmApiKey ? new OpenAI({ apiKey: env.llmApiKey }) : null;

export async function generateThread(items: IngestedItem[]): Promise<DraftThread> {
  const sources = compactSources(items.map((i) => i.url));
  const headline = items[0]?.title ?? "Market-moving development";

  if (!client) {
    return heuristicThread(headline, items, sources);
  }

  const prompt = `Create a 2-4 tweet English thread in neutral analytical tone.
Rules: factual only from provided sources, no fabrication, include why it matters, key points, what to watch, and a Sources line with links. Last line: Not investment advice.
Items:\n${items.map((i, idx) => `${idx + 1}. ${i.title} | ${i.publisher} | ${i.url} | ${i.snippet ?? ""}`).join("\n")}`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });
  const text = response.output_text || "";
  const rawTweets = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const tweets = rawTweets.flatMap((t) => splitLongText(t)).slice(0, 4);
  return {
    title: headline,
    tweets,
    sourceUrls: sources,
    confidence: Math.min(1, 0.6 + items.length * 0.05)
  };
}

function heuristicThread(headline: string, items: IngestedItem[], sources: string[]): DraftThread {
  const points = items.slice(0, 5).map((i) => `• ${i.publisher}: ${i.title}`);
  const t1 = `${headline}. ${items.length} public sources are converging on this development. Why it matters: potential impact on macro risk pricing and cross-asset sentiment.`;
  const t2 = `Key points:\n${points.join("\n")}`;
  const t3 = `What to watch next:\n• Follow-up official statements\n• Market reaction in rates, USD, and BTC\nSources: ${sources.join(" ")}\nNot investment advice.`;
  return { title: headline, tweets: [t1, t2, ...splitLongText(t3)].slice(0, 4), sourceUrls: sources, confidence: 0.55 };
}

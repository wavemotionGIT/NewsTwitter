import OpenAI from "openai";
import crypto from "node:crypto";
import { env } from "../env.js";

const client = env.llmApiKey ? new OpenAI({ apiKey: env.llmApiKey }) : null;

export async function embedText(text: string): Promise<number[]> {
  if (!client) {
    return deterministicEmbedding(text);
  }
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 4000)
  });
  return response.data[0].embedding;
}

function deterministicEmbedding(text: string): number[] {
  const hash = crypto.createHash("sha256").update(text).digest();
  return Array.from(hash).slice(0, 32).map((b) => b / 255);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / ((Math.sqrt(aa) * Math.sqrt(bb)) || 1);
}

import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL,
  pollIntervalSeconds: Number(process.env.POLL_INTERVAL_SECONDS ?? 120),
  similarityThreshold: Number(process.env.SIMILARITY_THRESHOLD ?? 0.83),
  llmApiKey: process.env.LLM_API_KEY,
  xApiKey: process.env.X_API_KEY,
  xApiSecret: process.env.X_API_SECRET,
  xAccessToken: process.env.X_ACCESS_TOKEN,
  xAccessSecret: process.env.X_ACCESS_SECRET
};

export function isDryRunMode(): boolean {
  return !(env.xApiKey && env.xApiSecret && env.xAccessToken && env.xAccessSecret);
}

import { TwitterApi } from "twitter-api-v2";
import { isDryRunMode, env } from "../env.js";
import { logger } from "../utils/logger.js";

export async function postThread(tweets: string[], replyToId?: string): Promise<string | null> {
  if (isDryRunMode()) {
    logger.info({ tweets }, "Dry-run mode: thread not posted to X");
    return null;
  }

  const client = new TwitterApi({
    appKey: env.xApiKey!,
    appSecret: env.xApiSecret!,
    accessToken: env.xAccessToken!,
    accessSecret: env.xAccessSecret!
  }).readWrite;

  let lastId = replyToId;
  for (const tweet of tweets) {
    const res = await client.v2.tweet({ text: tweet, reply: lastId ? { in_reply_to_tweet_id: lastId } : undefined });
    lastId = res.data.id;
  }
  return lastId ?? null;
}

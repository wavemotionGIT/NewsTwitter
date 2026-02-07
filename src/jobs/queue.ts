import { Queue } from "bullmq";
import { env } from "../env.js";

export const queueName = "news-ingestion";

export const queue = new Queue(queueName, {
  connection: env.redisUrl ? { url: env.redisUrl } : undefined
});

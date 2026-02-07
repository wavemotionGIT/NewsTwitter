import { Worker } from "bullmq";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";
import { queueName } from "./queue.js";
import { runPipeline } from "./pipeline.js";

if (!env.redisUrl) {
  logger.warn("REDIS_URL missing; worker cannot start. Use `npm run scheduler` for direct mode.");
  process.exit(0);
}

const worker = new Worker(queueName, async () => runPipeline(), {
  connection: { url: env.redisUrl }
});

worker.on("completed", () => logger.info("Ingestion job completed"));
worker.on("failed", (_job, err) => logger.error({ err }, "Ingestion job failed"));

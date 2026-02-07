import { env } from "../env.js";
import { logger } from "../utils/logger.js";
import { queue } from "./queue.js";
import { runPipeline } from "./pipeline.js";

async function schedule() {
  if (!env.redisUrl) {
    logger.info("Scheduler running in direct mode (no Redis)");
    await runPipeline();
    setInterval(() => void runPipeline(), env.pollIntervalSeconds * 1000);
    return;
  }

  logger.info("Scheduler running with BullMQ");
  await queue.add(
    "ingest",
    {},
    {
      repeat: { every: env.pollIntervalSeconds * 1000 },
      removeOnComplete: 50,
      removeOnFail: 50
    }
  );
}

void schedule();

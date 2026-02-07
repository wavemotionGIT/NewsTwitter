# NewsTwitter Autoposter

Production-oriented Node.js + TypeScript service that monitors accredited public news/press feeds, clusters near-real-time stories, drafts Perplexity-style source-backed threads, and posts to X (or dry-runs if keys are missing).

## Features
- Polling ingestion every `POLL_INTERVAL_SECONDS` (default 120s)
- Public-source validation (robots + paywall keyword checks)
- Story clustering by entities + time windows
- Enforces 3–10 distinct domains before publish
- 72h semantic dedup via embeddings
- Thread generation (LLM-first, deterministic fallback)
- X posting with dry-run mode when X credentials are absent
- Minimal admin API + CLI for monitoring/overrides

## Stack
- Node.js + TypeScript
- Prisma + PostgreSQL
- BullMQ + Redis (optional; direct scheduler mode supported)
- OpenAI (optional)
- X API via `twitter-api-v2`

## Setup
1. Start infra:
   ```bash
   docker compose up -d
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Configure env:
   ```bash
   cp .env.example .env
   ```
4. Apply DB migration and generate client:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Run
- API:
  ```bash
  npm run dev
  ```
- Scheduler (direct mode if no `REDIS_URL`):
  ```bash
  npm run scheduler
  ```
- BullMQ worker (requires Redis):
  ```bash
  npm run worker
  ```
- Admin CLI:
  ```bash
  npm run admin -- watching
  npm run admin -- force-publish <storyId>
  npm run admin -- force-skip <storyId>
  npm run admin -- errors
  ```

## Source and topic config
- Source list: `src/config/sources.yaml`
- Topic keyword map: `src/config/topics.ts`
- Domain allow/block rules: `src/config/domains.ts`

## Deploy notes
- Use managed PostgreSQL/Redis in production.
- Run scheduler as one instance; workers can scale horizontally.
- Keep X and LLM keys in secret manager (not in repo).
- If X keys are missing, service stores drafted stories as `draft` and logs tweets to console.

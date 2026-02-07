import express from "express";
import { prisma } from "./utils/prisma.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/admin/watching", async (_req, res) => {
  const stories = await prisma.story.findMany({ where: { status: "watching" }, include: { _count: { select: { sources: true } } } });
  res.json(stories.map((s) => ({ id: s.id, title: s.title, sourceCount: s._count.sources, updatedAt: s.updatedAt })));
});

app.post("/admin/force-publish/:id", async (req, res) => {
  const story = await prisma.story.update({ where: { id: req.params.id }, data: { status: "published", publishedAt: new Date() } });
  res.json(story);
});

app.post("/admin/force-skip/:id", async (req, res) => {
  const story = await prisma.story.update({ where: { id: req.params.id }, data: { status: "draft" } });
  res.json(story);
});

app.get("/admin/errors", async (_req, res) => {
  const runs = await prisma.jobRun.findMany({ where: { status: "failed" }, take: 20, orderBy: { startedAt: "desc" } });
  res.json(runs);
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});

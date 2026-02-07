import { prisma } from "../utils/prisma.js";

async function main() {
  const command = process.argv[2];
  if (command === "watching") {
    const stories = await prisma.story.findMany({ where: { status: "watching" }, include: { _count: { select: { sources: true } } } });
    stories.forEach((s) => console.log(`${s.id} | ${s.title} | sources=${s._count.sources}`));
    return;
  }

  if (command === "force-publish") {
    const id = process.argv[3];
    if (!id) throw new Error("Usage: npm run admin force-publish <storyId>");
    await prisma.story.update({ where: { id }, data: { status: "published", publishedAt: new Date() } });
    console.log(`Published ${id}`);
    return;
  }

  if (command === "force-skip") {
    const id = process.argv[3];
    if (!id) throw new Error("Usage: npm run admin force-skip <storyId>");
    await prisma.story.update({ where: { id }, data: { status: "draft" } });
    console.log(`Skipped ${id}`);
    return;
  }

  if (command === "errors") {
    const runs = await prisma.jobRun.findMany({ where: { status: "failed" }, take: 10, orderBy: { startedAt: "desc" } });
    runs.forEach((r) => console.log(`${r.startedAt.toISOString()} | ${JSON.stringify(r.logs)}`));
    return;
  }

  console.log("Commands: watching | force-publish <id> | force-skip <id> | errors");
}

void main().finally(() => prisma.$disconnect());

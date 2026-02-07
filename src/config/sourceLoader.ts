import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { FeedSource } from "../types.js";

export function loadSources(): FeedSource[] {
  const file = path.resolve("src/config/sources.yaml");
  const raw = fs.readFileSync(file, "utf8");
  const parsed = YAML.parse(raw);
  return parsed.sources as FeedSource[];
}

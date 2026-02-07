import axios from "axios";
import { JSDOM } from "jsdom";

export async function extractFullText(url: string): Promise<string | undefined> {
  try {
    const { data } = await axios.get<string>(url, {
      timeout: 15000,
      headers: { "User-Agent": "NewsTwitterBot/1.0" }
    });
    const dom = new JSDOM(data, { url });
    const paragraphs = Array.from(dom.window.document.querySelectorAll("article p, main p, p"))
      .map((p) => p.textContent?.trim() ?? "")
      .filter((t) => t.length > 40)
      .slice(0, 25);
    const combined = paragraphs.join(" ").replace(/\s+/g, " ").trim();
    return combined.slice(0, 5000) || undefined;
  } catch {
    return undefined;
  }
}

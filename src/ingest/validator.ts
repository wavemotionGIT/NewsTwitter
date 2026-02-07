import axios from "axios";
import robotsParser from "robots-parser";

const robotsCache = new Map<string, ReturnType<typeof robotsParser> | null>();

export async function isPubliclyAccessible(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.origin}/robots.txt`;
    let robots = robotsCache.get(parsed.origin);
    if (robots === undefined) {
      const { data } = await axios.get<string>(robotsUrl, { timeout: 7000, validateStatus: () => true });
      robots = typeof data === "string" ? robotsParser(robotsUrl, data) : null;
      robotsCache.set(parsed.origin, robots);
    }
    if (robots && !robots.isAllowed(url, "NewsTwitterBot/1.0")) return false;

    const head = await axios.get(url, { timeout: 12000, maxRedirects: 5, validateStatus: () => true });
    if (head.status >= 400) return false;

    const text = typeof head.data === "string" ? head.data.toLowerCase() : "";
    return !text.includes("subscribe to continue") && !text.includes("paywall");
  } catch {
    return false;
  }
}

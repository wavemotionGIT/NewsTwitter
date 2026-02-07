export const TOPIC_KEYWORDS: Record<string, string[]> = {
  macro: ["inflation", "cpi", "ppi", "fomc", "rate", "gdp", "unemployment", "treasury", "yield"],
  finance: ["earnings", "guidance", "sec", "bond", "equity", "liquidity", "bank"],
  crypto: ["bitcoin", "btc", "ethereum", "eth", "stablecoin", "etf", "exchange"],
  stocks: ["nasdaq", "s&p", "dow", "stock", "shares", "ticker"]
};

export function detectTopic(text: string): string {
  const lower = text.toLowerCase();
  for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return topic;
  }
  return "macro";
}

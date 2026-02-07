export const X_CHAR_LIMIT = 280;

export function splitLongText(text: string, limit = X_CHAR_LIMIT): string[] {
  if (text.length <= limit) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    const idx = remaining.lastIndexOf(" ", limit);
    const cut = idx > 50 ? idx : limit;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trim();
  }
  if (remaining.length) chunks.push(remaining);
  return chunks;
}

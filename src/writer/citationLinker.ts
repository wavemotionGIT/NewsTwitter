export function compactSources(urls: string[]): string[] {
  return Array.from(new Set(urls)).slice(0, 10);
}

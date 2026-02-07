export const DEFAULT_ALLOWLIST: string[] = [];
export const DEFAULT_BLOCKLIST: string[] = ["ft.com", "wsj.com", "bloomberg.com"];

export function isDomainAllowed(domain: string, allowlist: string[], blocklist: string[]): boolean {
  if (blocklist.includes(domain)) return false;
  if (!allowlist.length) return true;
  return allowlist.includes(domain);
}

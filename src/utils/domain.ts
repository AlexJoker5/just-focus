/**
 * Utilities for normalizing and validating website domains.
 */

/**
 * Normalizes a user-input domain or URL into a clean hostname.
 * e.g.:
 * "https://www.youtube.com/watch?v=123" -> "youtube.com"
 * "http://reddit.com/" -> "reddit.com"
 * "WWW.INSTAGRAM.COM" -> "instagram.com"
 */
export function normalizeDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();

  // Strip protocol if present
  if (cleaned.startsWith("http://")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("https://")) {
    cleaned = cleaned.slice(8);
  }

  // Strip path, query params, hash
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];

  // Strip port
  cleaned = cleaned.split(":")[0];

  // Strip leading 'www.'
  if (cleaned.startsWith("www.")) {
    cleaned = cleaned.slice(4);
  }

  return cleaned.trim();
}

/**
 * Validates whether a string is a plausible domain name.
 */
export function isValidDomain(input: string): boolean {
  const domain = normalizeDomain(input);
  if (!domain || domain.length < 3 || domain.length > 253) {
    return false;
  }

  // Simple domain regex: at least one label, dot, TLD of at least 2 chars
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
  return domainRegex.test(domain);
}

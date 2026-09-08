// ─── String Helpers ───────────────────────────────────────────────────────────

export function randomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function randomEmail(domain = 'test.example.com'): string {
  return `test.${randomString(6)}@${domain}`;
}

// ─── Price Helpers ────────────────────────────────────────────────────────────

export function parsePrice(text: string): number {
  const match = text.match(/\d+\.\d+/);
  return match ? parseFloat(match[0]) : 0;
}

// ─── Retry Helper ─────────────────────────────────────────────────────────────

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

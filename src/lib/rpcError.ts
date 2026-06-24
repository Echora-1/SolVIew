/** User-facing message shown when the RPC node is rate limiting requests. */
export const RATE_LIMIT_MESSAGE = 'RPC перегружен. Попробуйте позже.'

/**
 * Whether an error represents an RPC rate limit (HTTP 429).
 *
 * Some nodes return 413 (payload too large) with a "too many requests" body;
 * that is not transient, so it is explicitly excluded.
 */
export function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('429') && !message.includes('413')
}

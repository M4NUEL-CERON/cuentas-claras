import type { Texts } from '../i18n/texts'
import { ApiError } from './client'

/**
 * Turns a failed request into a sentence for the person using the app.
 * `known` maps HTTP statuses the caller expects (409, 400…) to a specific message.
 */
export function errorText(err: unknown, t: Texts, known: Partial<Record<number, string>> = {}): string {
  if (!(err instanceof ApiError)) return t.error
  if (err.status === 0) return t.offline
  return known[err.status] ?? t.error
}

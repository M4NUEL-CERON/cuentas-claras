// Thin client for the Spring Boot API. Every write returns the full updated group.
import type { Group, NewExpense } from './types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8090'

/** Free-plan servers sleep; a request slower than this probably means the API is waking up. */
const SLOW_AFTER_MS = 4000

/** status 0 means the request never got an answer (offline, CORS, server down). */
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}, onSlow?: () => void): Promise<T> {
  const slow = onSlow ? setTimeout(onSlow, SLOW_AFTER_MS) : undefined
  try {
    const res = await fetch(BASE_URL + path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } })
    const body = await res.json().catch(() => null)
    // errors are RFC 9457 problem details; `detail` is written to be shown to people
    if (!res.ok) throw new ApiError(res.status, body?.detail ?? res.statusText)
    return body as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError(0, 'offline')
  } finally {
    clearTimeout(slow)
  }
}

const groupPath = (code: string) => `/api/groups/${encodeURIComponent(code)}`
const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) })

export const api = {
  createGroup: (name: string, currency: string, members: string[], onSlow?: () => void) =>
    request<Group>('/api/groups', post({ name, currency, members }), onSlow),
  getGroup: (code: string, onSlow?: () => void) => request<Group>(groupPath(code), {}, onSlow),
  addMember: (code: string, name: string) => request<Group>(`${groupPath(code)}/members`, post({ name })),
  addExpense: (code: string, expense: NewExpense) => request<Group>(`${groupPath(code)}/expenses`, post(expense)),
  deleteExpense: (code: string, id: number) => request<Group>(`${groupPath(code)}/expenses/${id}`, { method: 'DELETE' }),
}

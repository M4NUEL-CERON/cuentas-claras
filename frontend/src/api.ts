// Thin client for the Spring Boot API. Every write returns the full updated group.
const API = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8090'

export type Member = { id: number; name: string }
export type Expense = { id: number; description: string; amount: number; payerId: number; participantIds: number[]; createdAt: string }
export type Balance = { memberId: number; paid: number; owed: number; net: number }
export type Transfer = { fromId: number; toId: number; amount: number }
export type Group = {
  code: string; name: string; currency: string; total: number
  members: Member[]; expenses: Expense[]; balances: Balance[]; settlements: Transfer[]
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Calls onSlow if the request takes long, which on the free plan means the server is waking up. */
async function call<T>(path: string, init: RequestInit = {}, onSlow?: () => void): Promise<T> {
  const slow = onSlow ? setTimeout(onSlow, 4000) : undefined
  try {
    const res = await fetch(API + path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } })
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, body?.detail ?? res.statusText)
    return body as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError(0, 'offline')
  } finally {
    clearTimeout(slow)
  }
}

export const api = {
  create: (name: string, currency: string, members: string[], onSlow?: () => void) =>
    call<Group>('/api/groups', { method: 'POST', body: JSON.stringify({ name, currency, members }) }, onSlow),
  get: (code: string, onSlow?: () => void) => call<Group>(`/api/groups/${encodeURIComponent(code)}`, {}, onSlow),
  addMember: (code: string, name: string) =>
    call<Group>(`/api/groups/${encodeURIComponent(code)}/members`, { method: 'POST', body: JSON.stringify({ name }) }),
  addExpense: (code: string, e: { description: string; amount: number; payerId: number; participantIds: number[] }) =>
    call<Group>(`/api/groups/${encodeURIComponent(code)}/expenses`, { method: 'POST', body: JSON.stringify(e) }),
  deleteExpense: (code: string, id: number) =>
    call<Group>(`/api/groups/${encodeURIComponent(code)}/expenses/${id}`, { method: 'DELETE' }),
}

/** Groups opened in this browser, newest first. A per-device convenience, never the source of truth. */
export type Recent = { code: string; name: string }
export function recentGroups(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem('groups') ?? '[]')
  } catch {
    return []
  }
}
export function rememberGroup(g: Recent) {
  try {
    const list = [g, ...recentGroups().filter((r) => r.code !== g.code)].slice(0, 8)
    localStorage.setItem('groups', JSON.stringify(list))
  } catch { /* storage blocked: the app still works, it just won't list the group */ }
}

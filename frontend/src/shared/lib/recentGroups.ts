// Groups opened in this browser, newest first. A per-device convenience, never the source of truth:
// storage can be blocked or cleared, so every access fails quietly.

export type RecentGroup = { code: string; name: string }

const KEY = 'groups'
const MAX = 8

export function recentGroups(): RecentGroup[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function rememberGroup(group: RecentGroup) {
  try {
    const list = [group, ...recentGroups().filter((g) => g.code !== group.code)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* storage blocked: the app still works, it just won't list the group */ }
}

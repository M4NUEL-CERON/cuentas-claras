import { useEffect, useState } from 'react'
import { api, ApiError } from '../../shared/api/client'
import type { Group } from '../../shared/api/types'
import { rememberGroup } from '../../shared/lib/recentGroups'

export type LoadStatus = 'loading' | 'waking' | 'ready' | 'missing' | 'offline'

/** Loads a group by code, remembers it in this browser, and exposes a setter for the group every write returns. */
export function useGroup(code: string) {
  const [group, setGroup] = useState<Group | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    api.getGroup(code, () => setStatus((s) => (s === 'loading' ? 'waking' : s)))
      .then((g) => {
        setGroup(g)
        setStatus('ready')
        rememberGroup({ code: g.code, name: g.name })
      })
      .catch((e) => setStatus(e instanceof ApiError && e.status === 404 ? 'missing' : 'offline'))
  }, [code])

  useEffect(() => {
    if (group) document.title = `${group.name} · Cuentas Claras`
    return () => { document.title = 'Cuentas Claras' }
  }, [group])

  return { group, setGroup, status }
}

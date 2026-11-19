// Two screens, so routing is just the path: "/" is home, "/g/<code>" is a group.
import { useEffect, useState } from 'react'

export const groupUrl = (code: string) => `/g/${code}`

function groupCodeFromPath(): string | null {
  return location.pathname.match(/^\/g\/([a-z0-9]+)\/?$/i)?.[1] ?? null
}

export function navigate(path: string) {
  history.pushState(null, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
  scrollTo({ top: 0 })
}

/** The group code in the URL, or null on the home page. Follows back/forward. */
export function useGroupRoute(): string | null {
  const [code, setCode] = useState(groupCodeFromPath)
  useEffect(() => {
    const onPop = () => setCode(groupCodeFromPath())
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])
  return code
}

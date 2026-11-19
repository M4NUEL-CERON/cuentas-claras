import { useState } from 'react'
import type { Texts } from '../../shared/i18n/texts'

/** The link is the key to the group, so sharing it is the main way in. */
export function ShareLink({ t }: { t: Texts }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked: the link is still in the address bar */ }
  }

  return (
    <div className="share">
      <button className="btn ghost" onClick={copy}>{copied ? t.group.copied : t.group.share}</button>
      <p className="hint">{t.group.shareHint}</p>
    </div>
  )
}

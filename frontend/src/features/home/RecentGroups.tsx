import { groupUrl, navigate } from '../../app/router'
import type { Texts } from '../../shared/i18n/texts'
import { recentGroups } from '../../shared/lib/recentGroups'

export function RecentGroups({ t }: { t: Texts }) {
  const groups = recentGroups()
  if (groups.length === 0) return null

  return (
    <nav className="recent" aria-labelledby="recent-title">
      <h3 id="recent-title">{t.recent.title}</h3>
      <ul>
        {groups.map((g) => (
          <li key={g.code}>
            <a href={groupUrl(g.code)} onClick={(e) => { e.preventDefault(); navigate(groupUrl(g.code)) }}>{g.name}</a>
          </li>
        ))}
      </ul>
      <p className="hint">{t.recent.hint}</p>
    </nav>
  )
}

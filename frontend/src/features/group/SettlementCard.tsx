import type { Group } from '../../shared/api/types'
import type { Texts } from '../../shared/i18n/texts'
import { Mascot } from '../../shared/ui/Mascot'
import type { Formatters } from './GroupLedger'

/** The answer the app exists for: who pays whom, and how much. */
export function SettlementCard({ group, t, format }: { group: Group; t: Texts; format: Formatters }) {
  return (
    <section className="card settle" aria-live="polite">
      <div className="settle-head">
        <h2>{t.group.settleTitle}</h2>
        <p className="total"><span>{t.group.total}</span> {format.money(group.total)}</p>
      </div>

      {group.expenses.length === 0 ? (
        <p className="empty">{t.group.noExpenses}</p>
      ) : group.settlements.length === 0 ? (
        <div className="clear">
          <Mascot className="clear-mascot jump" mood="party" />
          <p>{t.group.allClear}</p>
        </div>
      ) : (
        <ul className="transfers">
          {group.settlements.map((s) => (
            <li key={`${s.fromId}-${s.toId}`}>
              <strong>{format.nameOf(s.fromId)}</strong>
              <span className="arrow">{t.group.pays} →</span>
              <strong>{format.nameOf(s.toId)}</strong>
              <span className="amount">{format.money(s.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

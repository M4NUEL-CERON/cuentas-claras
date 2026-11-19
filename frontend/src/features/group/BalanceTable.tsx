import type { Group } from '../../shared/api/types'
import type { Texts } from '../../shared/i18n/texts'
import type { Formatters } from './GroupLedger'

export function BalanceTable({ group, t, format }: { group: Group; t: Texts; format: Formatters }) {
  return (
    <section className="card">
      <h2>{t.group.balances}</h2>
      <table className="balances">
        <thead>
          <tr>
            <td />
            <th scope="col">{t.group.paid}</th>
            <th scope="col">{t.group.share_}</th>
            <th scope="col">{t.group.net}</th>
          </tr>
        </thead>
        <tbody>
          {group.balances.map((b) => (
            <tr key={b.memberId}>
              <th scope="row">{format.nameOf(b.memberId)}</th>
              <td>{format.money(b.paid)}</td>
              <td>{format.money(b.owed)}</td>
              <td className={b.net > 0 ? 'pos' : b.net < 0 ? 'neg' : ''}>{b.net > 0 ? '+' : ''}{format.money(b.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

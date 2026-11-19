import { useMemo } from 'react'
import type { Group } from '../../shared/api/types'
import type { Texts } from '../../shared/i18n/texts'
import { formatMoney } from '../../shared/lib/money'
import { AddMemberForm } from './AddMemberForm'
import { BalanceTable } from './BalanceTable'
import { ExpenseForm } from './ExpenseForm'
import { ExpenseList } from './ExpenseList'
import { SettlementCard } from './SettlementCard'
import { ShareLink } from './ShareLink'

/** What every part of the group screen needs: the group, a way to replace it after a write, and formatters. */
export type LedgerProps = {
  group: Group
  onChange: (group: Group) => void
  t: Texts
}

export type Formatters = {
  money: (amount: number) => string
  nameOf: (memberId: number) => string
}

export function GroupLedger({ group, onChange, t }: LedgerProps) {
  const format = useMemo<Formatters>(() => {
    const names = new Map(group.members.map((m) => [m.id, m.name]))
    return {
      money: (amount) => formatMoney(amount, group.currency, t.locale),
      nameOf: (id) => names.get(id) ?? '?',
    }
  }, [group.members, group.currency, t.locale])

  const hasExpenses = group.expenses.length > 0

  return (
    <div className="wrap ledger">
      <header className="ledger-head">
        <div>
          <h1>{group.name}</h1>
          <p className="meta">{t.group.people(group.members.length)} · {group.currency}</p>
        </div>
        <ShareLink t={t} />
      </header>

      <div className="columns">
        <div className="col">
          <ExpenseForm group={group} onChange={onChange} t={t} />
          <AddMemberForm group={group} onChange={onChange} t={t} />
        </div>

        <div className="col">
          <SettlementCard group={group} t={t} format={format} />
          {hasExpenses && <BalanceTable group={group} t={t} format={format} />}
          {hasExpenses && <ExpenseList group={group} onChange={onChange} t={t} format={format} />}
        </div>
      </div>
    </div>
  )
}

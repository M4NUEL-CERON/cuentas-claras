import { useState } from 'react'
import { api } from '../../shared/api/client'
import type { Expense } from '../../shared/api/types'
import type { Formatters, LedgerProps } from './GroupLedger'

const CONFIRM_WINDOW_MS = 3000

/** Newest first. */
export function ExpenseList({ group, onChange, t, format }: LedgerProps & { format: Formatters }) {
  return (
    <section className="card">
      <h2>{t.group.expenses}</h2>
      <ul className="expenses">
        {[...group.expenses].reverse().map((e) => (
          <ExpenseItem key={e.id} expense={e} group={group} onChange={onChange} t={t} format={format} />
        ))}
      </ul>
    </section>
  )
}

/** Delete takes two clicks: the first arms the button for a few seconds, the second deletes. */
function ExpenseItem({ expense, group, onChange, t, format }: LedgerProps & { expense: Expense; format: Formatters }) {
  const [armed, setArmed] = useState(false)

  async function remove() {
    if (!armed) {
      setArmed(true)
      setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS)
      return
    }
    try {
      onChange(await api.deleteExpense(group.code, expense.id))
    } catch {
      setArmed(false)
    }
  }

  return (
    <li>
      <div>
        <strong>{expense.description}</strong>
        <span className="meta">{t.group.paidByShort(format.nameOf(expense.payerId))} · {t.group.splitAmong(expense.participantIds.length)}</span>
      </div>
      <span className="amount">{format.money(expense.amount)}</span>
      <button className={`btn text${armed ? ' danger' : ''}`} onClick={remove}>{armed ? t.group.confirmDelete : t.group.delete}</button>
    </li>
  )
}

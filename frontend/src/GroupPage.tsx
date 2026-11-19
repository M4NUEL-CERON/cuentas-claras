import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { api, rememberGroup, ApiError, type Group } from './api'
import { navigate } from './App'
import type { Texts } from './i18n'
import { Mascot } from './Mascot'
import { CURRENCIES, formatMoney, parseAmount } from './money'

export function GroupPage({ code, t }: { code: string; t: Texts }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [status, setStatus] = useState<'loading' | 'waking' | 'ready' | 'missing' | 'offline'>('loading')

  useEffect(() => {
    api.get(code, () => setStatus((s) => (s === 'loading' ? 'waking' : s)))
      .then((g) => { setGroup(g); setStatus('ready'); rememberGroup({ code: g.code, name: g.name }) })
      .catch((e) => setStatus(e instanceof ApiError && e.status === 404 ? 'missing' : 'offline'))
  }, [code])

  useEffect(() => {
    if (group) document.title = `${group.name} · Cuentas Claras`
    return () => { document.title = 'Cuentas Claras' }
  }, [group])

  if (status === 'loading' || status === 'waking') {
    return (
      <div className="wrap state" role="status">
        <Mascot className="state-mascot bob" mood="calm" />
        <p>{status === 'waking' ? t.waking : '…'}</p>
      </div>
    )
  }
  if (!group) {
    return (
      <div className="wrap state">
        <Mascot className="state-mascot" mood="calm" />
        <p>{status === 'missing' ? t.group.notFound : t.offline}</p>
        <button className="btn ghost" onClick={() => navigate('/')}>{t.group.home}</button>
      </div>
    )
  }
  return <Ledger group={group} setGroup={setGroup} t={t} />
}

function Ledger({ group, setGroup, t }: { group: Group; setGroup: (g: Group) => void; t: Texts }) {
  const money = (n: number) => formatMoney(n, group.currency, t.locale)
  const nameOf = useMemo(() => new Map(group.members.map((m) => [m.id, m.name])), [group.members])
  const [copied, setCopied] = useState(false)

  async function share() {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked: the link is still in the address bar */ }
  }

  return (
    <div className="wrap ledger">
      <header className="ledger-head">
        <div>
          <h1>{group.name}</h1>
          <p className="meta">{t.group.people(group.members.length)} · {group.currency}</p>
        </div>
        <div className="share">
          <button className="btn ghost" onClick={share}>{copied ? t.group.copied : t.group.share}</button>
          <p className="hint">{t.group.shareHint}</p>
        </div>
      </header>

      <div className="columns">
        <div className="col">
          <ExpenseForm group={group} setGroup={setGroup} t={t} />
          <AddMember group={group} setGroup={setGroup} t={t} />
        </div>

        <div className="col">
          <section className="card settle" aria-live="polite">
            <div className="settle-head">
              <h2>{t.group.settleTitle}</h2>
              <p className="total"><span>{t.group.total}</span> {money(group.total)}</p>
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
                    <strong>{nameOf.get(s.fromId)}</strong>
                    <span className="arrow">{t.group.pays} →</span>
                    <strong>{nameOf.get(s.toId)}</strong>
                    <span className="amount">{money(s.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {group.expenses.length > 0 && (
            <section className="card">
              <h2>{t.group.balances}</h2>
              <table className="balances">
                <thead>
                  <tr><th></th><th>{t.group.paid}</th><th>{t.group.share_}</th><th>{t.group.net}</th></tr>
                </thead>
                <tbody>
                  {group.balances.map((b) => (
                    <tr key={b.memberId}>
                      <th scope="row">{nameOf.get(b.memberId)}</th>
                      <td>{money(b.paid)}</td>
                      <td>{money(b.owed)}</td>
                      <td className={b.net > 0 ? 'pos' : b.net < 0 ? 'neg' : ''}>{b.net > 0 ? '+' : ''}{money(b.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {group.expenses.length > 0 && (
            <section className="card">
              <h2>{t.group.expenses}</h2>
              <ul className="expenses">
                {[...group.expenses].reverse().map((e) => (
                  <ExpenseRow key={e.id} expense={e} group={group} setGroup={setGroup} t={t} money={money} nameOf={nameOf} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function ExpenseForm({ group, setGroup, t }: { group: Group; setGroup: (g: Group) => void; t: Texts }) {
  const allIds = group.members.map((m) => m.id)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState(allIds[0])
  const [split, setSplit] = useState<number[]>(allIds)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // someone new joined the group: include them in the split by default
  const known = useRef(new Set(allIds))
  useEffect(() => {
    const fresh = allIds.filter((id) => !known.current.has(id))
    if (!fresh.length) return
    fresh.forEach((id) => known.current.add(id))
    setSplit((s) => [...s, ...fresh])
  }, [allIds.join()])

  const toggle = (id: number) => setSplit(split.includes(id) ? split.filter((x) => x !== id) : [...split, id])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const value = parseAmount(amount, group.currency)
    if (!description.trim()) return setError(t.group.description)
    if (value === null) return setError(t.group.badAmount(CURRENCIES[group.currency]))
    if (split.length === 0) return setError(t.group.pickSomeone)
    setBusy(true)
    setError('')
    try {
      setGroup(await api.addExpense(group.code, { description: description.trim(), amount: value, payerId, participantIds: allIds.filter((id) => split.includes(id)) }))
      setDescription('')
      setAmount('')
    } catch (err) {
      setError(err instanceof ApiError && err.status === 0 ? t.offline : err instanceof ApiError && err.status === 400 ? err.message : t.error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card add-expense" onSubmit={submit} noValidate>
      <h2>{t.group.addExpense}</h2>
      <label className="field">
        <span>{t.group.description}</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.group.descriptionPh} maxLength={80} />
      </label>
      <div className="row">
        <label className="field grow">
          <span>{t.group.amount} ({group.currency})</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder={CURRENCIES[group.currency] === 0 ? '90.000' : '12.50'} />
        </label>
        <label className="field grow">
          <span>{t.group.paidBy}</span>
          <select value={payerId} onChange={(e) => setPayerId(Number(e.target.value))}>
            {group.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
      </div>
      <fieldset className="field">
        <legend>{t.group.splitBetween}</legend>
        <div className="toggles">
          <button type="button" className="toggle all" aria-pressed={split.length === allIds.length}
            onClick={() => setSplit(split.length === allIds.length ? [] : allIds)}>{t.group.everyone}</button>
          {group.members.map((m) => (
            <button type="button" key={m.id} className="toggle" aria-pressed={split.includes(m.id)} onClick={() => toggle(m.id)}>{m.name}</button>
          ))}
        </div>
      </fieldset>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn primary" disabled={busy}>{busy ? t.group.saving : t.group.save}</button>
    </form>
  )
}

function AddMember({ group, setGroup, t }: { group: Group; setGroup: (g: Group) => void; t: Texts }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    if (group.members.some((m) => m.name.toLowerCase() === n.toLowerCase())) return setError(t.create.duplicate)
    try {
      setGroup(await api.addMember(group.code, n))
      setName('')
      setError('')
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t.create.duplicate : err instanceof ApiError && err.status === 0 ? t.offline : t.error)
    }
  }
  return (
    <form className="add-member" onSubmit={submit}>
      <label htmlFor="new-member">{t.group.addMember}</label>
      <div className="inline">
        <input id="new-member" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.group.addMemberPh} maxLength={30} />
        <button className="btn ghost small" disabled={!name.trim()}>+</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}

function ExpenseRow({ expense: e, group, setGroup, t, money, nameOf }: {
  expense: Group['expenses'][number]; group: Group; setGroup: (g: Group) => void; t: Texts
  money: (n: number) => string; nameOf: Map<number, string>
}) {
  const [confirm, setConfirm] = useState(false)
  async function remove() {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }
    try { setGroup(await api.deleteExpense(group.code, e.id)) } catch { setConfirm(false) }
  }
  return (
    <li>
      <div>
        <strong>{e.description}</strong>
        <span className="meta">{t.group.paidByShort(nameOf.get(e.payerId) ?? '?')} · {t.group.splitAmong(e.participantIds.length)}</span>
      </div>
      <span className="amount">{money(e.amount)}</span>
      <button className={`btn text${confirm ? ' danger' : ''}`} onClick={remove}>{confirm ? t.group.confirmDelete : t.group.delete}</button>
    </li>
  )
}

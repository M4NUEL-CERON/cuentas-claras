import { useEffect, useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../shared/api/client'
import { errorText } from '../../shared/api/errorText'
import { CURRENCIES, parseAmount } from '../../shared/lib/money'
import type { LedgerProps } from './GroupLedger'

export function ExpenseForm({ group, onChange, t }: LedgerProps) {
  const memberIds = group.members.map((m) => m.id)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState(memberIds[0])
  const [split, setSplit] = useState<number[]>(memberIds)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // someone new joined the group: include them in the split by default
  const known = useRef(new Set(memberIds))
  useEffect(() => {
    const fresh = memberIds.filter((id) => !known.current.has(id))
    if (!fresh.length) return
    fresh.forEach((id) => known.current.add(id))
    setSplit((s) => [...s, ...fresh])
  }, [memberIds.join()]) // eslint-disable-line react-hooks/exhaustive-deps

  const everyone = split.length === memberIds.length
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
      // keep join order so the backend hands leftover cents out the same way every time
      const participantIds = memberIds.filter((id) => split.includes(id))
      onChange(await api.addExpense(group.code, { description: description.trim(), amount: value, payerId, participantIds }))
      setDescription('')
      setAmount('')
    } catch (err) {
      // a 400 carries the API's own explanation ("COP amounts have no decimals")
      setError(errorText(err, t, { 400: err instanceof ApiError ? err.message : undefined }))
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
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal"
            placeholder={CURRENCIES[group.currency] === 0 ? '90.000' : '12.50'} />
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
          <button type="button" className="toggle all" aria-pressed={everyone} onClick={() => setSplit(everyone ? [] : memberIds)}>
            {t.group.everyone}
          </button>
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

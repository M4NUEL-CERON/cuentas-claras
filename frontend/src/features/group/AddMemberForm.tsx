import { useState, type FormEvent } from 'react'
import { api } from '../../shared/api/client'
import { errorText } from '../../shared/api/errorText'
import { sameName } from '../../shared/lib/names'
import type { LedgerProps } from './GroupLedger'

export function AddMemberForm({ group, onChange, t }: LedgerProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (group.members.some((m) => sameName(m.name, trimmed))) return setError(t.create.duplicate)
    try {
      onChange(await api.addMember(group.code, trimmed))
      setName('')
      setError('')
    } catch (err) {
      setError(errorText(err, t, { 409: t.create.duplicate }))
    }
  }

  return (
    <form className="add-member" onSubmit={submit}>
      <label htmlFor="new-member">{t.group.addMember}</label>
      <div className="inline">
        <input id="new-member" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.group.addMemberPh} maxLength={30} />
        <button className="btn ghost small" disabled={!name.trim()} aria-label={t.group.addMember}>+</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}

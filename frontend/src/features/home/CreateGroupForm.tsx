import { useState, type FormEvent } from 'react'
import { groupUrl, navigate } from '../../app/router'
import { api } from '../../shared/api/client'
import { errorText } from '../../shared/api/errorText'
import type { Texts } from '../../shared/i18n/texts'
import { CURRENCIES } from '../../shared/lib/money'
import { rememberGroup } from '../../shared/lib/recentGroups'
import { sameName } from '../../shared/lib/names'
import { MembersInput } from './MembersInput'

export function CreateGroupForm({ t }: { t: Texts }) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState(t.locale === 'es-CO' ? 'COP' : 'USD')
  const [members, setMembers] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [waking, setWaking] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    // a name still sitting in the box counts, people rarely press Enter on the last one
    const pending = draft.trim()
    const all = pending && !members.some((m) => sameName(m, pending)) ? [...members, pending] : members
    if (all.length < 2) return setError(t.create.minMembers)

    setBusy(true)
    setError('')
    try {
      const group = await api.createGroup(name.trim() || t.create.namePh, currency, all, () => setWaking(true))
      rememberGroup({ code: group.code, name: group.name })
      navigate(groupUrl(group.code))
    } catch (err) {
      setError(errorText(err, t))
    } finally {
      setBusy(false)
      setWaking(false)
    }
  }

  return (
    <form className="card create" onSubmit={submit} noValidate>
      <div className="create-head">
        <h2>{t.create.title}</h2>
        <p className="note">{t.create.note}</p>
      </div>

      <div className="row">
        <label className="field grow">
          <span>{t.create.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.create.namePh} maxLength={60} />
        </label>
        <label className="field">
          <span>{t.create.currency}</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {Object.keys(CURRENCIES).map((c) => <option key={c} value={c}>{c} · {t.create.currencies[c]}</option>)}
          </select>
        </label>
      </div>

      <MembersInput t={t} members={members} onMembersChange={setMembers} draft={draft} onDraftChange={setDraft} onError={setError} />

      <div className="tear" aria-hidden="true" />
      {error && <p className="error" role="alert">{error}</p>}
      {waking && <p className="hint" role="status">{t.waking}</p>}
      <div className="create-foot">
        <button className="btn primary" disabled={busy}>
          {busy ? t.create.creating : t.create.submit}
          {!busy && <span className="go" aria-hidden="true">→</span>}
        </button>
        <p className="hint">{t.create.later}</p>
      </div>
    </form>
  )
}

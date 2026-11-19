import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { api, recentGroups, rememberGroup, ApiError } from './api'
import { navigate } from './App'
import type { Texts } from './i18n'
import { Mascot } from './Mascot'
import { CURRENCIES } from './money'

export function Home({ t }: { t: Texts }) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState(t.locale === 'es-CO' ? 'COP' : 'USD')
  const [members, setMembers] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [waking, setWaking] = useState(false)
  const recent = recentGroups()

  function addDraft() {
    const n = draft.trim()
    if (!n) return
    if (members.some((m) => m.toLowerCase() === n.toLowerCase())) return setError(t.create.duplicate)
    setMembers([...members, n])
    setDraft('')
    setError('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addDraft()
    } else if (e.key === 'Backspace' && !draft && members.length) {
      setMembers(members.slice(0, -1))
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    // a name still sitting in the box counts, people rarely press Enter on the last one
    const pending = draft.trim()
    const all = pending && !members.some((m) => m.toLowerCase() === pending.toLowerCase()) ? [...members, pending] : members
    if (all.length < 2) return setError(t.create.minMembers)
    setBusy(true)
    setError('')
    try {
      const g = await api.create(name.trim() || t.create.namePh, currency, all, () => setWaking(true))
      rememberGroup({ code: g.code, name: g.name })
      navigate(`/g/${g.code}`)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 0 ? t.offline : t.error)
    } finally {
      setBusy(false)
      setWaking(false)
    }
  }

  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <h1>
            {t.hero.title1}
            <span>{t.hero.title2}</span>
          </h1>
          <p className="lede">{t.hero.lede}</p>
          <ul className="badges">
            {t.hero.badges.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
        <div className="hero-art">
          <p className="scribble">{t.hero.note}</p>
          <Mascot className="hero-mascot" />
        </div>
      </section>

      <section className="wrap">
        <form className="card create" onSubmit={submit} noValidate>
          <h2>{t.create.title}</h2>
          <div className="row">
            <label className="field grow">
              <span>{t.create.name}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.create.namePh} maxLength={60} />
            </label>
            <label className="field">
              <span>{t.create.currency}</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {Object.keys(CURRENCIES).map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className="field">
            <label htmlFor="member-input">{t.create.members}</label>
            <div className="chips-input">
              {members.map((m) => (
                <span className="chip" key={m}>
                  {m}
                  <button type="button" aria-label={t.create.remove(m)} onClick={() => setMembers(members.filter((x) => x !== m))}>×</button>
                </span>
              ))}
              <input id="member-input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey}
                placeholder={members.length ? '' : t.create.memberPh} maxLength={30} />
              <button type="button" className="btn ghost small" onClick={addDraft} disabled={!draft.trim()}>{t.create.add}</button>
            </div>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          {waking && <p className="hint" role="status">{t.waking}</p>}
          <button className="btn primary" disabled={busy}>{busy ? t.create.creating : t.create.submit}</button>
        </form>

        {recent.length > 0 && (
          <div className="recent">
            <h3>{t.recent.title}</h3>
            <ul>
              {recent.map((r) => (
                <li key={r.code}>
                  <a href={`/g/${r.code}`} onClick={(e) => { e.preventDefault(); navigate(`/g/${r.code}`) }}>{r.name}</a>
                </li>
              ))}
            </ul>
            <p className="hint">{t.recent.hint}</p>
          </div>
        )}
      </section>

      <section className="how wrap" id="como">
        <h2>{t.how.title}</h2>
        <ol>
          {t.how.steps.map(([title, text], i) => (
            <li key={title}>
              <span className="step">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

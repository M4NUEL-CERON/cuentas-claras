import type { KeyboardEvent } from 'react'
import type { Texts } from '../../shared/i18n/texts'
import { sameName } from '../../shared/lib/names'

type Props = {
  t: Texts
  members: string[]
  onMembersChange: (members: string[]) => void
  draft: string
  onDraftChange: (draft: string) => void
  onError: (message: string) => void
}

/** A text box that turns each name into a chip on Enter or comma; Backspace on an empty box removes the last one. */
export function MembersInput({ t, members, onMembersChange, draft, onDraftChange, onError }: Props) {
  function addDraft() {
    const name = draft.trim()
    if (!name) return
    if (members.some((m) => sameName(m, name))) return onError(t.create.duplicate)
    onMembersChange([...members, name])
    onDraftChange('')
    onError('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addDraft()
    } else if (e.key === 'Backspace' && !draft && members.length) {
      onMembersChange(members.slice(0, -1))
    }
  }

  return (
    <div className="field">
      <label htmlFor="member-input">{t.create.members}</label>
      <div className="chips-input">
        {members.map((m, i) => (
          <span className="chip" key={m}>
            <i className={`avatar a${i % 5}`} aria-hidden="true">{m[0].toUpperCase()}</i>
            {m}
            <button type="button" aria-label={t.create.remove(m)} onClick={() => onMembersChange(members.filter((x) => x !== m))}>×</button>
          </span>
        ))}
        <input id="member-input" value={draft} onChange={(e) => onDraftChange(e.target.value)} onKeyDown={onKeyDown}
          placeholder={members.length ? '' : t.create.memberPh} maxLength={30} />
        <button type="button" className="btn ghost small" onClick={addDraft} disabled={!draft.trim()}>{t.create.add}</button>
      </div>
    </div>
  )
}

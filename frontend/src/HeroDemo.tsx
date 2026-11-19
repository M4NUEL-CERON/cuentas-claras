import { useEffect, useState } from 'react'
import type { Texts } from './i18n'
import { Beans, Mascot } from './Mascot'
import { formatMoney } from './money'

// How long each step of the demo stays before the next one; the last step is the hold before it restarts.
const STEPS = [700, 1100, 1100, 1100, 1000, 1300, 4200]
const DONE = STEPS.length - 1

/** A receipt that fills itself in: expenses land, the total adds up, transfers appear, and Chocolo celebrates. */
export function HeroDemo({ t }: { t: Texts }) {
  const d = t.demo
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [step, setStep] = useState(still ? DONE : 0)
  const [round, setRound] = useState(0)
  const [cheer, setCheer] = useState(0)

  useEffect(() => {
    if (still) return
    const id = setTimeout(() => {
      if (step === DONE) { setStep(0); setRound((r) => r + 1) } else setStep(step + 1)
    }, STEPS[step])
    return () => clearTimeout(id)
  }, [step, still])

  // a click on Chocolo is its own little party
  useEffect(() => {
    if (!cheer) return
    const id = setTimeout(() => setCheer(0), 1600)
    return () => clearTimeout(id)
  }, [cheer])

  const money = (n: number) => formatMoney(n, d.currency, t.locale)
  const shown = d.items.slice(0, Math.min(step, d.items.length))
  const total = shown.reduce((s, [, , amount]) => s + amount, 0)
  const settled = step >= d.items.length + 1
  const party = step === DONE || cheer > 0

  return (
    <div className="hero-art">
      <p className="scribble">{t.hero.note}</p>
      <div className={`receipt${step === 0 ? ' fresh' : ''}`} key={round} aria-hidden="true">
        <div className="receipt-head">
          <b>{d.group}</b>
          <span className="faces">
            {d.members.map((m, i) => <i key={m} className={`avatar a${i}`}>{m[0]}</i>)}
          </span>
        </div>
        <ul className="lines">
          {d.items.map(([what, who, amount], i) => (
            <li key={what} className={i < shown.length ? 'on' : ''}>
              <span>{what}<small>{t.group.paidByShort(d.members[who])}</small></span>
              <b>{money(amount)}</b>
            </li>
          ))}
        </ul>
        <div className="sum">
          <span>{d.total}</span>
          <b>{money(total)}</b>
        </div>
        <div className="perf" />
        <p className="who">{t.group.settleTitle}</p>
        <ul className="moves">
          {d.moves.map(([from, to, amount]) => (
            <li key={from} className={settled ? 'on' : ''}>
              <i className={`avatar a${from}`}>{d.members[from][0]}</i>
              <span className="arrow-line" />
              <i className={`avatar a${to}`}>{d.members[to][0]}</i>
              <b>{money(amount)}</b>
            </li>
          ))}
        </ul>
        {step === DONE && <span className="stamp">{d.stamp}</span>}
      </div>
      {party && <Beans key={`${round}-${cheer}`} />}
      <button type="button" className="chocolo" aria-label={d.poke} title={d.poke} onClick={() => setCheer((c) => c + 1)}>
        <Mascot className={party ? 'jump' : ''} mood={party ? 'party' : 'happy'} follow />
      </button>
    </div>
  )
}

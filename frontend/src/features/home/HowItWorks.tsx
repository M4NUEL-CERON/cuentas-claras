import type { Texts } from '../../shared/i18n/texts'

export function HowItWorks({ t }: { t: Texts }) {
  return (
    <section className="how wrap" id="como" aria-labelledby="how-title">
      <h2 id="how-title">{t.how.title}</h2>
      <ol>
        {t.how.steps.map(([title, text], i) => (
          <li key={title}>
            <span className="step" aria-hidden="true">{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

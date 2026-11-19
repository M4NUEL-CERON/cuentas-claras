import type { Texts } from '../../shared/i18n/texts'
import { CreateGroupForm } from './CreateGroupForm'
import { HeroDemo } from './HeroDemo'
import { HowItWorks } from './HowItWorks'
import { RecentGroups } from './RecentGroups'

export function HomePage({ t }: { t: Texts }) {
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
        <HeroDemo t={t} />
      </section>

      <section className="wrap">
        <CreateGroupForm t={t} />
        <RecentGroups t={t} />
      </section>

      <HowItWorks t={t} />
    </>
  )
}

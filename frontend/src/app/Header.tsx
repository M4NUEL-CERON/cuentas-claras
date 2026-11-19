import type { Lang, Texts } from '../shared/i18n/texts'
import { Mascot } from '../shared/ui/Mascot'
import type { Theme } from './preferences'
import { navigate } from './router'

type Props = {
  t: Texts
  lang: Lang
  onLangChange: (lang: Lang) => void
  theme: Theme
  onThemeToggle: () => void
}

export function Header({ t, lang, onLangChange, theme, onThemeToggle }: Props) {
  const themeLabel = theme === 'dark' ? t.nav.light : t.nav.dark
  return (
    <header className="nav">
      <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
        <Mascot className="brand-mascot" />
        <span>cuentas<b>claras</b></span>
      </a>
      <div className="nav-tools">
        <button type="button" className="theme" aria-label={themeLabel} title={themeLabel} onClick={onThemeToggle}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="lang" role="group" aria-label="Idioma / Language">
          {(['es', 'en'] as const).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => onLangChange(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </header>
  )
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
)

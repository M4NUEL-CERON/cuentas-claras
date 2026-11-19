import { useEffect, useState } from 'react'
import { GroupPage } from './GroupPage'
import { Home } from './Home'
import { initialLang, texts, type Lang } from './i18n'
import { Mascot } from './Mascot'

const PORTFOLIO = 'https://manuelceron.vercel.app'
const REPO = 'https://github.com/M4NUEL-CERON/cuentas-claras'

// Two screens, so routing is just the path: "/" is home, "/g/<code>" is a group.
function codeFromPath() {
  return location.pathname.match(/^\/g\/([a-z0-9]+)\/?$/i)?.[1] ?? null
}

export function navigate(path: string) {
  history.pushState(null, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
  scrollTo({ top: 0 })
}

export function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [code, setCode] = useState(codeFromPath)
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  const t = texts[lang]

  useEffect(() => {
    const onPop = () => setCode(codeFromPath())
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch { /* not critical */ }
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1c1410' : '#fff6ea')
    try { localStorage.setItem('theme', theme) } catch { /* not critical */ }
  }, [theme])

  return (
    <>
      <header className="nav">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          <Mascot className="brand-mascot" />
          <span>cuentas<b>claras</b></span>
        </a>
        <div className="nav-tools">
          <button type="button" className="theme" aria-label={theme === 'dark' ? t.nav.light : t.nav.dark} title={theme === 'dark' ? t.nav.light : t.nav.dark}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
            )}
          </button>
          <div className="lang" role="group" aria-label="Idioma / Language">
            {(['es', 'en'] as const).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </header>

      <main>{code ? <GroupPage key={code} code={code} t={t} /> : <Home t={t} />}</main>

      <footer className="footer">
        <span>{t.footer.made} <a href={PORTFOLIO} target="_blank" rel="noreferrer">Manuel Cerón</a></span>
        <a href={REPO} target="_blank" rel="noreferrer">{t.footer.code}</a>
      </footer>
    </>
  )
}

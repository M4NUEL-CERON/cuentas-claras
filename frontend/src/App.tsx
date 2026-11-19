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

  return (
    <>
      <header className="nav">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          <Mascot className="brand-mascot" />
          <span>cuentas<b>claras</b></span>
        </a>
        <div className="lang" role="group" aria-label="Idioma / Language">
          {(['es', 'en'] as const).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
          ))}
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

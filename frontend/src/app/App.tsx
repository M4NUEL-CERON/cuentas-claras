import { GroupPage } from '../features/group/GroupPage'
import { HomePage } from '../features/home/HomePage'
import { Header } from './Header'
import { useLanguage, useTheme } from './preferences'
import { useGroupRoute } from './router'

const PORTFOLIO_URL = 'https://manuelceron.vercel.app'
const REPO_URL = 'https://github.com/M4NUEL-CERON/cuentas-claras'

export function App() {
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const groupCode = useGroupRoute()

  return (
    <>
      <Header t={t} lang={lang} onLangChange={setLang} theme={theme} onThemeToggle={toggleTheme} />

      <main>{groupCode ? <GroupPage key={groupCode} code={groupCode} t={t} /> : <HomePage t={t} />}</main>

      <footer className="footer">
        <span>{t.footer.made} <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer">Manuel Cerón</a></span>
        <a href={REPO_URL} target="_blank" rel="noreferrer">{t.footer.code}</a>
      </footer>
    </>
  )
}

// Language and theme: chosen once, remembered in this browser, mirrored onto <html>.
import { useEffect, useState } from 'react'
import { texts, type Lang } from '../shared/i18n/texts'

export type Theme = 'light' | 'dark'

const THEME_COLOR: Record<Theme, string> = { light: '#fff6ea', dark: '#1c1410' }

function save(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage blocked: the choice just won't persist */ }
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'es' || saved === 'en') return saved
  } catch { /* fall back to the browser language */ }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
    save('lang', lang)
  }, [lang])
  return { lang, setLang, t: texts[lang] }
}

/** index.html sets data-theme before first paint (saved choice or system setting); this takes over from there. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
    save('theme', theme)
  }, [theme])
  return { theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}

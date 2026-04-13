'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'ta', label: 'தமிழ்',    flag: '🇮🇳' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'ja', label: '日本語',    flag: '🇯🇵' },
]

type Translations = Record<string, unknown>

interface I18nContextType {
  lang: string
  setLang: (lang: string) => void
  t: (key: string, fallback?: string) => string
  flag: string
  label: string
}

function get(obj: unknown, path: string): string {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : ''
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en', setLang: () => {}, t: (k, f) => f || k, flag: '🇬🇧', label: 'English'
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('en')
  const [translations, setTranslations] = useState<Translations>({})

  const loadTranslations = useCallback(async (code: string) => {
    try {
      const mod = await import(`../i18n/${code}.json`)
      setTranslations(mod.default || mod)
    } catch {
      if (code !== 'en') {
        const mod = await import('../i18n/en.json')
        setTranslations(mod.default || mod)
      }
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('pm-toolkit-lang') || 'en'
    setLangState(saved)
    loadTranslations(saved)
  }, [loadTranslations])

  const setLang = useCallback((code: string) => {
    setLangState(code)
    localStorage.setItem('pm-toolkit-lang', code)
    loadTranslations(code)
  }, [loadTranslations])

  const t = useCallback((key: string, fallback?: string): string => {
    const val = get(translations, key)
    return val || fallback || key
  }, [translations])

  const current = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]

  return (
    <I18nContext.Provider value={{ lang, setLang, t, flag: current.flag, label: current.label }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

'use client'

import { useState } from 'react'
import TypesafeI18n from '@/lib/i18n/i18n-react'
import { isLocale, baseLocale } from '@/lib/i18n/i18n-util'
import { loadAllLocales } from '@/lib/i18n/i18n-util.sync'
import type { Locales } from '@/lib/i18n/i18n-types'

function detectInitialLocale(): Locales {
  if (typeof window === 'undefined') return baseLocale
  const stored = localStorage.getItem('locale')
  if (stored && isLocale(stored)) return stored
  const browser = navigator.language.slice(0, 2)
  if (isLocale(browser)) return browser
  return baseLocale
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale] = useState<Locales>(() => {
    // Load all locale dicts synchronously so setLocale() can switch freely
    loadAllLocales()
    return detectInitialLocale()
  })

  return <TypesafeI18n locale={locale}>{children}</TypesafeI18n>
}

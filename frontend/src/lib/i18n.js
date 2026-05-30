import { writable, derived } from 'svelte/store'
import { translations } from './translations.js'

const stored = localStorage.getItem('pp_lang') || 'de'

export const lang = writable(stored)

lang.subscribe(l => localStorage.setItem('pp_lang', l))

export const t = derived(lang, $lang =>
  key => translations[$lang]?.[key] ?? translations.de[key] ?? key
)

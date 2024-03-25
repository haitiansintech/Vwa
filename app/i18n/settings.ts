export const fallbacklang = 'en'
export const languages = [fallbacklang, 'ht']
export const defaultNS = 'translation'
export const cookieName = 'i18next'

export function getOptions(lang = fallbacklang, ns = defaultNS) {
  return {
    // debug: true,
    supportedlangs: languages,
    fallbacklang,
    lang,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  }
}
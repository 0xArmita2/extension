import EN from "./en/messages.json"
import zhHant from "./zh_Hant/messages.json"
import ptBR from "./pt_BR/messages.json"

interface ILang {
  title: string
}

const SUPPORT_LANGUAGES: { [id: string]: ILang } = {
  en: {
    title: "English",
  },
  zh_tw: {
    title: "中文(繁體)",
  },
  pt_br: {
    title: "Português",
  },
}

interface ILangOptions {
  value: string
  label: string
}

const getAvalableLanguages = (): ILangOptions[] =>
  Object.keys(SUPPORT_LANGUAGES).map((lang) => ({
    value: lang,
    label: SUPPORT_LANGUAGES[lang].title,
  }))

const getLanguageIndex = (lang: string): number =>
  Object.keys(SUPPORT_LANGUAGES).indexOf(lang)

const resources = {
  en: {
    translation: EN,
  },
  zh_tw: {
    translation: zhHant,
  },
  pt_br: {
    translation: ptBR,
  },
}

export { SUPPORT_LANGUAGES, getLanguageIndex, getAvalableLanguages, resources }

export default resources

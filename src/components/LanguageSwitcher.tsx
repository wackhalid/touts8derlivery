import { LANGUAGES, useLanguage } from '../lib/i18n'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
            lang === l.code ? 'bg-ink text-paper' : 'text-slate-soft hover:text-ink'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

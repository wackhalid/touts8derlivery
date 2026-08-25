import { getBusinessSettings } from '../lib/store'
import { useLanguage } from '../lib/i18n'

export default function Footer() {
  const biz = getBusinessSettings()
  const { t } = useLanguage()

  return (
    <footer className="border-t border-line bg-ink px-6 py-10 text-paper">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt={biz.business_name} className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-display text-lg font-semibold">{biz.business_name}</span>
        </div>
        <p className="mt-2 text-sm text-white/60">{biz.tagline}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">{t('footer_hours')}</div>
            <div className="mt-1 text-white/80">{biz.working_hours.open} – {biz.working_hours.close}</div>
            <div className="text-white/50">{biz.working_hours.days}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">{t('footer_areas')}</div>
            <div className="mt-1 text-white/80">{biz.service_areas.join(', ')}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a href={`tel:${biz.phone}`} className="text-sm text-white/70 hover:text-amber">{biz.phone}</a>
          <span className="text-white/30">·</span>
          <a href={`https://wa.me/${biz.whatsapp.replace('+', '')}`} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-amber">
            WhatsApp
          </a>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/40">
          © {new Date().getFullYear()} {biz.business_name}. {t('footer_rights')}
        </div>
      </div>
    </footer>
  )
}

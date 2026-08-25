import { Link } from 'react-router-dom'
import { getBusinessSettings } from '../../lib/store'
import Footer from '../../components/Footer'
import FloatingWhatsapp from '../../components/FloatingWhatsapp'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import Button from '../../components/Button'
import { useLanguage } from '../../lib/i18n'
import { whatsappLink } from '../../data/whatsappTemplates'

export default function Contact() {
  const biz = getBusinessSettings()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt={biz.business_name} className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-lg font-semibold">{biz.business_name}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-10">
        <h1 className="font-display text-2xl font-bold">{t('contact_title')}</h1>
        <p className="mt-2 text-slate-soft">{t('contact_body')}</p>

        <div className="mt-6 space-y-3">
          <a href={whatsappLink(biz.whatsapp, "Bonjour, j'ai une question concernant vos services.")} target="_blank" rel="noreferrer" className="block">
            <Button variant="secondary" className="w-full py-4 text-base">WhatsApp — {biz.whatsapp}</Button>
          </a>
          <a href={`tel:${biz.phone}`} className="block">
            <Button variant="ghost" className="w-full py-4 text-base">📞 {biz.phone}</Button>
          </a>
        </div>

        <div className="mt-8 rounded-xl border border-line bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-soft">{t('footer_hours')}</div>
          <div className="mt-1 font-semibold">{biz.working_hours.open} – {biz.working_hours.close}</div>
          <div className="text-sm text-slate-soft">{biz.working_hours.days}</div>
        </div>
        <div className="mt-3 rounded-xl border border-line bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-soft">{t('footer_areas')}</div>
          <div className="mt-1 font-semibold">{biz.service_areas.join(', ')}</div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsapp />
    </div>
  )
}

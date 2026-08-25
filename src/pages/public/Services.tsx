import { Link } from 'react-router-dom'
import { getBusinessSettings } from '../../lib/store'
import Footer from '../../components/Footer'
import FloatingWhatsapp from '../../components/FloatingWhatsapp'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import Button from '../../components/Button'
import { useLanguage } from '../../lib/i18n'
import { SERVICE_TYPE_DESCRIPTIONS, SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS, MISSION_SERVICE_TYPES } from '../../types'
import type { ServiceType } from '../../types'

const SERVICES: ServiceType[] = ['restaurant', 'supermarche', 'facture', 'pressing', 'marche', 'pharmacie', 'administration', 'general']

export default function Services() {
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
        <h1 className="font-display text-2xl font-bold">{t('services_title')}</h1>
        <p className="mt-1 text-sm text-slate-soft">{t('services_subtitle')}</p>

        <div className="mt-6 space-y-3">
          {SERVICES.map((s) => (
            <div key={s} className="flex gap-3 rounded-xl border border-line bg-white p-4">
              <span className="text-3xl">{SERVICE_TYPE_ICONS[s]}</span>
              <div>
                <div className="font-semibold">{SERVICE_TYPE_LABELS[s]}</div>
                <div className="mt-0.5 text-sm text-slate-soft">{SERVICE_TYPE_DESCRIPTIONS[s]}</div>
                {MISSION_SERVICE_TYPES.includes(s) && (
                  <div className="mt-2 inline-block rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
                    Achat/mission + livraison séparés
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link to="/request-delivery" className="mt-8 block">
          <Button className="w-full py-4 text-base">{t('cta_request')}</Button>
        </Link>
      </main>

      <Footer />
      <FloatingWhatsapp />
    </div>
  )
}

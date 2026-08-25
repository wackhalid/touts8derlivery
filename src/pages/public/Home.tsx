import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getBusinessSettings, estimatePriceForDistance } from '../../lib/store'
import Button from '../../components/Button'
import Footer from '../../components/Footer'
import FloatingWhatsapp from '../../components/FloatingWhatsapp'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useLanguage } from '../../lib/i18n'
import { SERVICE_TYPE_DESCRIPTIONS, SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS } from '../../types'
import type { ServiceType } from '../../types'
import { whatsappLink } from '../../data/whatsappTemplates'

const SERVICES: ServiceType[] = ['restaurant', 'supermarche', 'facture', 'pressing', 'marche', 'pharmacie', 'administration', 'general']

export default function Home() {
  const biz = getBusinessSettings()
  const { t } = useLanguage()
  const [calcDistance, setCalcDistance] = useState(6)
  const estimate = estimatePriceForDistance(calcDistance)

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt={biz.business_name} className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-lg font-semibold">{biz.business_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/services" className="text-sm font-medium text-slate-soft hover:text-ink">{t('nav_services')}</Link>
            <Link to="/track" className="text-sm font-medium text-slate-soft hover:text-ink">{t('nav_track')}</Link>
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-lg justify-end">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-12">
        {/* Hero */}
        <div className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-amber">{t('hero_kicker')}</div>
        <h1 className="font-display text-4xl font-bold leading-tight">{biz.tagline}</h1>
        <p className="mt-3 text-sm text-slate-soft">{t('hero_supporting')}</p>
        <p className="mt-4 text-slate-soft">{t('hero_body')}</p>

        <div className="mt-8 space-y-3">
          <Link to="/request-delivery">
            <Button className="w-full py-4 text-base">{t('cta_request')}</Button>
          </Link>
          <a href={whatsappLink(biz.whatsapp, 'Bonjour, je souhaite demander une livraison.')} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full py-4 text-base">{t('cta_whatsapp')}</Button>
          </a>
        </div>

        {/* How it works */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold">{t('how_it_works_title')}</h2>
          <div className="mt-4 space-y-3">
            <HowStep num="1️⃣" title={t('how_1_title')} body={t('how_1_body')} />
            <HowStep num="2️⃣" title={t('how_2_title')} body={t('how_2_body')} />
            <HowStep num="3️⃣" title={t('how_3_title')} body={t('how_3_body')} />
          </div>
        </section>

        {/* Services */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold">{t('services_title')}</h2>
          <p className="mt-1 text-sm text-slate-soft">{t('services_subtitle')}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {SERVICES.map((s) => (
              <div key={s} className="rounded-xl border border-line bg-white p-4">
                <div className="text-2xl">{SERVICE_TYPE_ICONS[s]}</div>
                <div className="mt-2 text-sm font-semibold">{SERVICE_TYPE_LABELS[s]}</div>
                <div className="mt-1 text-xs leading-snug text-slate-soft">{SERVICE_TYPE_DESCRIPTIONS[s]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold">{t('pricing_title')}</h2>
          <div className="mt-4 rounded-xl border border-ink bg-ink p-5 text-paper">
            <div className="text-xs uppercase tracking-wide text-white/50">{t('pricing_from')}</div>
            <div className="font-display text-3xl font-bold text-amber">{biz.currency === 'MAD' ? '20 DH' : `20 ${biz.currency}`}</div>
            <div className="mt-1 text-sm text-white/70">{t('pricing_upto')} · {t('pricing_extra')}</div>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-4">
            <div className="text-sm font-semibold">{t('pricing_calc_label')}</div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={20}
                value={calcDistance}
                onChange={(e) => setCalcDistance(Number(e.target.value))}
                className="flex-1 accent-amber"
              />
              <span className="w-16 shrink-0 rounded-lg bg-paper px-2 py-1 text-center font-mono text-sm">{calcDistance} km</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm text-slate-soft">{t('pricing_calc_fee')}</span>
              <span className="font-display text-xl font-bold">{estimate.total} {biz.currency}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-soft">{t('pricing_note')}</p>
        </section>

        {/* Why choose us */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold">{t('why_title')}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <WhyCard icon="🧍" text={t('why_1')} />
            <WhyCard icon="💬" text={t('why_2')} />
            <WhyCard icon="📍" text={t('why_3')} />
            <WhyCard icon="📱" text={t('why_4')} />
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-14 rounded-xl border border-line bg-white p-5 text-center">
          <div className="font-display text-lg font-bold">{t('contact_title')}</div>
          <p className="mt-1 text-sm text-slate-soft">{t('contact_body')}</p>
          <div className="mt-4 flex gap-3">
            <a href={`tel:${biz.phone}`} className="flex-1">
              <Button variant="ghost" className="w-full">{biz.phone}</Button>
            </a>
            <a href={whatsappLink(biz.whatsapp, 'Bonjour, j\'ai une question concernant vos services.')} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="secondary" className="w-full">WhatsApp</Button>
            </a>
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link to="/admin/login" className="text-xs text-slate-soft hover:text-ink">Espace livreur</Link>
        </div>
      </main>

      <Footer />
      <FloatingWhatsapp />
    </div>
  )
}

function HowStep({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-line bg-white p-4">
      <span className="text-2xl">{num}</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-slate-soft">{body}</div>
      </div>
    </div>
  )
}

function WhyCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

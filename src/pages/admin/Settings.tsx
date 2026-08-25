import { useState } from 'react'
import { getBusinessSettings, getPricingSettings, updateBusinessSettings, updatePricingSettings } from '../../lib/store'
import Button from '../../components/Button'

export default function Settings() {
  const [biz, setBiz] = useState(getBusinessSettings())
  const [pricing, setPricing] = useState(getPricingSettings())
  const [saved, setSaved] = useState(false)

  function saveBiz() {
    updateBusinessSettings(biz)
    flashSaved()
  }
  function savePricing() {
    updatePricingSettings(pricing)
    flashSaved()
  }
  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Réglages</h1>
      {saved && <div className="mt-3 rounded-lg bg-route/10 p-3 text-sm text-route">Enregistré.</div>}

      <section className="mt-5 rounded-xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Entreprise</h2>
        <div className="mt-3 space-y-3">
          <TextField label="Nom" value={biz.business_name} onChange={(v) => setBiz({ ...biz, business_name: v })} />
          <TextField label="Nom du livreur" value={biz.agent_name} onChange={(v) => setBiz({ ...biz, agent_name: v })} />
          <TextField label="Slogan" value={biz.tagline} onChange={(v) => setBiz({ ...biz, tagline: v })} />
          <TextField label="Téléphone" value={biz.phone} onChange={(v) => setBiz({ ...biz, phone: v })} />
          <TextField label="WhatsApp" value={biz.whatsapp} onChange={(v) => setBiz({ ...biz, whatsapp: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Ouverture"
              value={biz.working_hours.open}
              onChange={(v) => setBiz({ ...biz, working_hours: { ...biz.working_hours, open: v } })}
            />
            <TextField
              label="Fermeture"
              value={biz.working_hours.close}
              onChange={(v) => setBiz({ ...biz, working_hours: { ...biz.working_hours, close: v } })}
            />
          </div>
          <TextField
            label="Zones desservies (séparées par des virgules)"
            value={biz.service_areas.join(', ')}
            onChange={(v) => setBiz({ ...biz, service_areas: v.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
          <TextField label="Devise" value={biz.currency} onChange={(v) => setBiz({ ...biz, currency: v })} />
        </div>
        <Button onClick={saveBiz} className="mt-4 w-full">Enregistrer</Button>
      </section>

      <section className="mt-5 rounded-xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Tarification</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField label="Prix de base" value={pricing.base_price} onChange={(v) => setPricing({ ...pricing, base_price: v })} />
          <NumberField label="Prix minimum" value={pricing.min_price} onChange={(v) => setPricing({ ...pricing, min_price: v })} />
          <NumberField label="Km inclus" value={pricing.included_km} onChange={(v) => setPricing({ ...pricing, included_km: v })} />
          <NumberField label="Prix / km supp." value={pricing.price_per_km} onChange={(v) => setPricing({ ...pricing, price_per_km: v })} />
          <NumberField label="Supplément nuit" value={pricing.night_surcharge} onChange={(v) => setPricing({ ...pricing, night_surcharge: v })} />
          <NumberField label="Supplément urgence" value={pricing.urgent_surcharge} onChange={(v) => setPricing({ ...pricing, urgent_surcharge: v })} />
          <TextField label="Début nuit" value={pricing.night_start} onChange={(v) => setPricing({ ...pricing, night_start: v })} />
          <TextField label="Fin nuit" value={pricing.night_end} onChange={(v) => setPricing({ ...pricing, night_end: v })} />
        </div>
        <Button onClick={savePricing} className="mt-4 w-full">Enregistrer</Button>
      </section>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-soft">{label}</span>
      <input
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-soft">{label}</span>
      <input
        type="number"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </label>
  )
}

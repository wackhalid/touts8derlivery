import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createDeliveryRequest, getBusinessSettings, previewPrice, previewPriceFromPoints } from '../../lib/store'
import Button from '../../components/Button'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useLanguage } from '../../lib/i18n'
import { buildNewOrderMessageForAgent, whatsappLink } from '../../data/whatsappTemplates'
import { MISSION_SERVICE_TYPES, SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS } from '../../types'
import type { ServiceType } from '../../types'
import LocationField from '../../components/LocationField'
import type { GeoPoint } from '../../lib/geolocation'

const SERVICE_TYPES: ServiceType[] = ['restaurant', 'supermarche', 'facture', 'pressing', 'marche', 'pharmacie', 'administration', 'general', 'autre']

export default function RequestDelivery() {
  const navigate = useNavigate()
  const biz = getBusinessSettings()
  const { t } = useLanguage()

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_whatsapp: '',
    service_type: 'restaurant' as ServiceType,
    pickup_address: '',
    delivery_address: '',
    item_description: '',
    mission_details: '',
    pickup_date: new Date().toISOString().slice(0, 10),
    pickup_time_window: '',
    notes: '',
    is_urgent: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickupPoint, setPickupPoint] = useState<GeoPoint | null>(null)
  const [deliveryPoint, setDeliveryPoint] = useState<GeoPoint | null>(null)

  const needsMissionDetails = MISSION_SERVICE_TYPES.includes(form.service_type)
  const canPreview = (pickupPoint && deliveryPoint) || (form.pickup_address.trim().length > 3 && form.delivery_address.trim().length > 3)

  const price = useMemo(() => {
    if (!canPreview) return null
    if (pickupPoint && deliveryPoint) {
      return previewPriceFromPoints(pickupPoint, deliveryPoint, form.pickup_time_window || '12:00', form.is_urgent)
    }
    return previewPrice(form.pickup_address, form.delivery_address, form.pickup_time_window || '12:00', form.is_urgent)
  }, [form.pickup_address, form.delivery_address, form.pickup_time_window, form.is_urgent, canPreview, pickupPoint, deliveryPoint])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.customer_name || !form.customer_phone || !form.pickup_address || !form.delivery_address || !form.pickup_time_window) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
    setSubmitting(true)
    const delivery = createDeliveryRequest({
      ...form,
      customer_whatsapp: form.customer_whatsapp || form.customer_phone,
      pickup_lat: pickupPoint?.lat,
      pickup_lng: pickupPoint?.lng,
      delivery_lat: deliveryPoint?.lat,
      delivery_lng: deliveryPoint?.lng,
    })
    setSubmitting(false)

    // Send the order straight to the agent's WhatsApp, same pattern as
    // Atlas Drive Business — opens with the order pre-filled, ready to send.
    const agentMessage = buildNewOrderMessageForAgent(delivery)
    window.open(whatsappLink(biz.whatsapp, agentMessage), '_blank')

    navigate(`/order/${delivery.order_number}`)
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-sm text-slate-soft hover:text-ink">← {biz.business_name}</Link>
            <LanguageSwitcher />
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold">{t('cta_request')}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Nom complet *">
            <input className="input" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} placeholder="Votre nom" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone *">
              <input className="input" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} placeholder="+212 6 12 34 56 78" />
            </Field>
            <Field label="WhatsApp">
              <input className="input" value={form.customer_whatsapp} onChange={(e) => set('customer_whatsapp', e.target.value)} placeholder="Si différent" />
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-ink">Type de service *</span>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => set('service_type', type)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition ${
                    form.service_type === type ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-amber'
                  }`}
                >
                  <span className="text-lg">{SERVICE_TYPE_ICONS[type]}</span>
                  <span>{SERVICE_TYPE_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </div>

          <LocationField
            label="Où récupérer / où faire la course *"
            address={form.pickup_address}
            onAddressChange={(v) => set('pickup_address', v)}
            point={pickupPoint}
            onPointChange={setPickupPoint}
            placeholder="Ex : Pharmacie Guéliz, Restaurant X, Marché Jeliz..."
          />

          <LocationField
            label="Où livrer *"
            address={form.delivery_address}
            onAddressChange={(v) => set('delivery_address', v)}
            point={deliveryPoint}
            onPointChange={setDeliveryPoint}
            placeholder="Ex : Résidence Al Andalous, Guéliz"
          />

          <Field label="Qu'est-ce qu'il faut livrer / acheter / faire ?">
            <input className="input" value={form.item_description} onChange={(e) => set('item_description', e.target.value)} placeholder="Ex : Commande restaurant, ordonnance, facture Lydec..." />
          </Field>

          {needsMissionDetails && (
            <Field label="Détails de la mission">
              <textarea
                className="input min-h-[90px]"
                value={form.mission_details}
                onChange={(e) => set('mission_details', e.target.value)}
                placeholder="Ex : Acheter tomates, pommes de terre, oignons et carottes au marché."
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date *">
              <input type="date" className="input" value={form.pickup_date} onChange={(e) => set('pickup_date', e.target.value)} />
            </Field>
            <Field label="Heure souhaitée *">
              <input type="time" className="input" value={form.pickup_time_window} onChange={(e) => set('pickup_time_window', e.target.value)} />
            </Field>
          </div>

          <Field label="Instructions supplémentaires">
            <textarea className="input min-h-[70px]" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Étage, code porte, précisions..." />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
            <input type="checkbox" className="h-5 w-5 accent-amber" checked={form.is_urgent} onChange={(e) => set('is_urgent', e.target.checked)} />
            <div>
              <div className="text-sm font-semibold">Course urgente</div>
              <div className="text-xs text-slate-soft">Priorité sur les autres demandes</div>
            </div>
          </label>

          {price && (
            <div className="rounded-xl border border-ink bg-ink p-5 text-paper">
              <div className="text-xs uppercase tracking-wide text-white/50">Frais de livraison estimés</div>
              <div className="mt-1 font-display text-3xl font-bold text-amber">
                {price.total} <span className="text-base font-medium text-white/60">{biz.currency}</span>
              </div>
              <div className="mt-2 text-xs text-white/50">Distance estimée : {price.distance_km} km</div>
              {needsMissionDetails && (
                <div className="mt-2 rounded-lg bg-white/10 p-2 text-xs text-white/70">
                  Le coût des produits/achats est séparé et sera confirmé après la mission.
                </div>
              )}
            </div>
          )}

          {error && <div className="rounded-lg bg-alert/10 p-3 text-sm text-alert">{error}</div>}

          <Button type="submit" disabled={submitting} className="w-full py-4 text-base">
            {submitting ? 'Envoi...' : 'Confirmer la demande'}
          </Button>
          <p className="text-center text-xs text-slate-soft">Votre demande sera aussi envoyée sur WhatsApp pour confirmation rapide.</p>
        </form>
      </main>

      <style>{`.input { width: 100%; border: 1px solid #E6E6E6; background: white; border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.95rem; } .input:focus { outline: 2px solid #E8352B; border-color: transparent; }`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

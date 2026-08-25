import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBusinessSettings, getDeliveryByOrderNumber } from '../../lib/store'
import type { Delivery } from '../../types'
import { TRACKING_STEPS } from '../../types'
import Button from '../../components/Button'
import Footer from '../../components/Footer'
import { whatsappLink } from '../../data/whatsappTemplates'

export default function Track() {
  const { orderNumber: paramOrder } = useParams()
  const biz = getBusinessSettings()
  const [input, setInput] = useState(paramOrder ?? '')
  const [delivery, setDelivery] = useState<Delivery | undefined>(paramOrder ? getDeliveryByOrderNumber(paramOrder) : undefined)
  const [searched, setSearched] = useState(Boolean(paramOrder))

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setDelivery(getDeliveryByOrderNumber(input))
    setSearched(true)
  }

  const currentIndex = delivery ? TRACKING_STEPS.findIndex((s) => s.key === delivery.status) : -1

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="text-sm text-slate-soft hover:text-ink">← Accueil</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">Suivre ma course</h1>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-line bg-white px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            placeholder="MNM-2026-0001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit">Suivre</Button>
        </form>

        {searched && !delivery && (
          <div className="mt-6 rounded-xl bg-alert/10 p-4 text-sm text-alert">Aucune commande trouvée avec ce numéro.</div>
        )}

        {delivery && (
          <div className="mt-8">
            {delivery.status === 'cancelled' ? (
              <div className="rounded-xl border border-alert/30 bg-alert/10 p-5 text-center">
                <div className="font-semibold text-alert">Commande annulée</div>
                <div className="mt-1 text-sm text-alert/80">{delivery.order_number}</div>
              </div>
            ) : (
              <ol className="space-y-0">
                {TRACKING_STEPS.map((step, i) => {
                  const done = i <= currentIndex
                  const isLast = i === TRACKING_STEPS.length - 1
                  return (
                    <li key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${done ? 'border-route bg-route/10' : 'border-line bg-white text-slate-soft opacity-50'}`}>
                          {step.icon}
                        </div>
                        {!isLast && <div className={`w-0.5 flex-1 ${i < currentIndex ? 'bg-route' : 'bg-line'}`} style={{ minHeight: 32 }} />}
                      </div>
                      <div className={`pb-8 ${done ? '' : 'opacity-50'}`}>
                        <div className="font-semibold">{step.label}</div>
                        {i === currentIndex && <div className="text-xs text-route">Statut actuel</div>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}

            <div className="mt-2 rounded-xl border border-line bg-white p-4 text-sm">
              <div className="flex justify-between py-1"><span className="text-slate-soft">Commande</span><span className="font-mono font-medium">{delivery.order_number}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-soft">De</span><span className="text-right font-medium">{delivery.pickup_address}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-soft">Vers</span><span className="text-right font-medium">{delivery.delivery_address}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-soft">Frais de livraison</span><span className="font-medium">{delivery.price} {biz.currency}</span></div>
            </div>

            <div className="mt-3 rounded-xl border border-line bg-white p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-slate-soft">Votre livreur</div>
              <div className="mt-1 font-semibold">{biz.agent_name} — {biz.business_name}</div>
              <div className="mt-3 flex gap-2">
                <a href={`tel:${biz.phone}`} className="flex-1"><Button variant="ghost" className="w-full">Appeler</Button></a>
                <a href={whatsappLink(biz.whatsapp, `Bonjour, je souhaite suivre ma livraison ${delivery.order_number}.`)} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="secondary" className="w-full">WhatsApp</Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

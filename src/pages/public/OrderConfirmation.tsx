import { Link, useParams } from 'react-router-dom'
import { getBusinessSettings, getDeliveryByOrderNumber } from '../../lib/store'
import WaybillTicket from '../../components/WaybillTicket'
import Button from '../../components/Button'
import { buildNewOrderMessageForAgent, whatsappLink } from '../../data/whatsappTemplates'

export default function OrderConfirmation() {
  const { orderNumber = '' } = useParams()
  const biz = getBusinessSettings()
  const delivery = getDeliveryByOrderNumber(orderNumber)

  if (!delivery) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-slate-soft">Commande introuvable.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-ink underline">Retour à l'accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">✅</div>
          <h1 className="font-display text-2xl font-bold">Demande reçue</h1>
          <p className="mt-1 text-sm text-slate-soft">Un onglet WhatsApp s'est ouvert avec votre commande — envoyez le message pour confirmer rapidement.</p>
        </div>

        <WaybillTicket delivery={delivery} currency={biz.currency} />

        <a href={whatsappLink(biz.whatsapp, buildNewOrderMessageForAgent(delivery))} target="_blank" rel="noreferrer" className="mt-4 block">
          <Button variant="secondary" className="w-full py-4 text-base">Envoyer sur WhatsApp</Button>
        </a>

        <div className="mt-4 rounded-xl border border-line bg-white p-4 text-sm">
          <div className="flex justify-between py-1"><span className="text-slate-soft">Client</span><span className="font-medium">{delivery.customer_name}</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-soft">Date</span><span className="font-medium">{delivery.pickup_date} — {delivery.pickup_time_window}</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-soft">Détails</span><span className="font-medium">{delivery.item_description || '—'}</span></div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link to={`/track/${delivery.order_number}`} className="flex-1">
            <Button variant="ghost" className="w-full">Suivre ma commande</Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="ghost" className="w-full">Accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

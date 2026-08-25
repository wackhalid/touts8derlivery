import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getBusinessSettings,
  getDeliveryByOrderNumber,
  recordPayment,
  updateDeliveryStatus,
  updatePurchaseAmount,
} from '../../lib/store'
import type { DeliveryStatus, PaymentMethod, PaymentStatusType } from '../../types'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, SERVICE_TYPE_LABELS, STATUS_LABELS, STATUS_ORDER, MISSION_SERVICE_TYPES } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import WhatsappButton from '../../components/WhatsappButton'
import NavigateButton from '../../components/NavigateButton'
import { buildWhatsappMessage } from '../../data/whatsappTemplates'
import { mapsLinkFromPoint } from '../../lib/geolocation'

export default function OrderDetail() {
  const { orderNumber = '' } = useParams()
  const biz = getBusinessSettings()
  const [, forceRerender] = useState(0)
  const [purchaseInput, setPurchaseInput] = useState('')
  const delivery = getDeliveryByOrderNumber(orderNumber)

  if (!delivery) {
    return (
      <div>
        <Link to="/admin/orders" className="text-sm text-slate-soft">← Commandes</Link>
        <p className="mt-4 text-sm text-slate-soft">Commande introuvable.</p>
      </div>
    )
  }

  const currentIdx = STATUS_ORDER.indexOf(delivery.status)
  const nextStatus: DeliveryStatus | null = currentIdx >= 0 && currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null
  const needsMission = MISSION_SERVICE_TYPES.includes(delivery.service_type)

  function setStatus(status: DeliveryStatus) {
    updateDeliveryStatus(orderNumber, status)
    forceRerender((n) => n + 1)
  }

  function pay(method: PaymentMethod, status: PaymentStatusType) {
    recordPayment(orderNumber, method, status)
    forceRerender((n) => n + 1)
  }

  function savePurchase() {
    const amount = parseFloat(purchaseInput)
    if (!isNaN(amount)) {
      updatePurchaseAmount(orderNumber, amount)
      setPurchaseInput('')
      forceRerender((n) => n + 1)
    }
  }

  return (
    <div>
      <Link to="/admin/orders" className="text-sm text-slate-soft hover:text-ink">← Commandes</Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold">{delivery.order_number}</h1>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="mt-4 rounded-xl border border-line bg-white p-4 text-sm">
        <Row label="Service" value={SERVICE_TYPE_LABELS[delivery.service_type]} />
        <Row label="Client" value={delivery.customer_name} />
        <Row label="Téléphone" value={delivery.customer_phone} />
        <Row label="Départ" value={delivery.pickup_lat != null ? '📍 Position GPS partagée' : delivery.pickup_address} />
        <Row label="Arrivée" value={delivery.delivery_lat != null ? '📍 Position GPS partagée' : delivery.delivery_address} />
        <Row label="Détails" value={delivery.item_description || '—'} />
        {delivery.mission_details && <Row label="Mission" value={delivery.mission_details} />}
        <Row label="Date" value={`${delivery.pickup_date} — ${delivery.pickup_time_window}`} />
        <Row label="Distance" value={`${delivery.distance_km} km`} />
        <Row label="Frais de livraison" value={`${delivery.price} ${biz.currency}`} />
        {delivery.notes && <Row label="Notes" value={delivery.notes} />}
      </div>

      {needsMission && (
        <div className="mt-4 rounded-xl border border-amber/30 bg-amber/10 p-4">
          <div className="text-sm font-semibold">Montant des achats (séparé de la livraison)</div>
          {delivery.purchase_amount > 0 ? (
            <div className="mt-1 font-display text-xl font-bold">{delivery.purchase_amount} {biz.currency}</div>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
                placeholder="Montant en MAD"
                value={purchaseInput}
                onChange={(e) => setPurchaseInput(e.target.value)}
              />
              <Button variant="ghost" onClick={savePurchase}>Enregistrer</Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <NavigateButton
          address={delivery.pickup_address}
          label="Naviguer : départ"
          point={delivery.pickup_lat != null ? { lat: delivery.pickup_lat, lng: delivery.pickup_lng! } : null}
        />
        <NavigateButton
          address={delivery.delivery_address}
          label="Naviguer : client"
          point={delivery.delivery_lat != null ? { lat: delivery.delivery_lat, lng: delivery.delivery_lng! } : null}
        />
      </div>

      {delivery.status !== 'cancelled' && delivery.status !== 'delivered' && (
        <div className="mt-4 flex gap-3">
          {nextStatus && (
            <Button onClick={() => setStatus(nextStatus)} className="flex-1">Marquer : {STATUS_LABELS[nextStatus]}</Button>
          )}
          <Button variant="danger" onClick={() => setStatus('cancelled')}>Annuler</Button>
        </div>
      )}

      <div className="mt-4">
        <WhatsappButton phone={delivery.customer_phone} message={buildWhatsappMessage(delivery.status, delivery.customer_name, delivery.order_number)} />
      </div>

      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold">Paiement (frais de livraison)</h2>
        {delivery.payment ? (
          <div className="mt-2 rounded-xl border border-line bg-white p-4 text-sm">
            <Row label="Montant" value={`${delivery.payment.amount} ${biz.currency}`} />
            <Row label="Méthode" value={PAYMENT_METHOD_LABELS[delivery.payment.method]} />
            <Row label="Statut" value={PAYMENT_STATUS_LABELS[delivery.payment.status]} />
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => pay('cash', 'paid')}>Espèces — payé</Button>
            <Button variant="ghost" onClick={() => pay('transfer', 'paid')}>Virement — payé</Button>
            <Button variant="ghost" onClick={() => pay('cash', 'partial')}>Partiellement payé</Button>
            <Button variant="ghost" onClick={() => pay('cash', 'pending')}>À encaisser</Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-slate-soft">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

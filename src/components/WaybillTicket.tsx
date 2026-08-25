import type { Delivery } from '../types'
import { SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS } from '../types'
import StatusBadge from './StatusBadge'

export default function WaybillTicket({ delivery, currency = 'MAD' }: { delivery: Delivery; currency?: string }) {
  return (
    <div className="waybill flex items-stretch overflow-hidden shadow-lg">
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
          <span>{SERVICE_TYPE_ICONS[delivery.service_type]}</span>
          <span>{SERVICE_TYPE_LABELS[delivery.service_type]}</span>
        </div>
        <div className="mt-1 font-mono text-3xl font-semibold tracking-wide">{delivery.order_number}</div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/50">Départ</div>
            <div className="font-medium">{delivery.pickup_address}</div>
          </div>
          <div>
            <div className="text-white/50">Arrivée</div>
            <div className="font-medium">{delivery.delivery_address}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={delivery.status} />
          <span className="text-xs text-white/50">{delivery.distance_km} km</span>
        </div>
      </div>
      <div className="waybill-perf flex w-32 flex-col items-center justify-center gap-1 bg-black/20 p-4 text-center">
        <div className="text-xs text-white/50">Livraison</div>
        <div className="font-display text-2xl font-semibold text-amber">{delivery.price}</div>
        <div className="text-xs text-white/50">{currency}</div>
      </div>
    </div>
  )
}

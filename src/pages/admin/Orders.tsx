import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getBusinessSettings, listDeliveries } from '../../lib/store'
import type { DeliveryStatus } from '../../types'
import { STATUS_LABELS, SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS } from '../../types'
import type { ServiceType } from '../../types'
import StatusBadge from '../../components/StatusBadge'

const STATUS_FILTERS: (DeliveryStatus | 'all')[] = ['all', 'new', 'accepted', 'going_to_pickup', 'mission_in_progress', 'picked_up', 'on_the_way', 'delivered', 'cancelled']
const SERVICE_FILTERS: (ServiceType | 'all')[] = ['all', 'restaurant', 'supermarche', 'facture', 'pressing', 'marche', 'pharmacie', 'administration', 'general', 'autre']

export default function Orders() {
  const biz = getBusinessSettings()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DeliveryStatus | 'all'>('all')
  const [serviceType, setServiceType] = useState<ServiceType | 'all'>('all')
  const [date, setDate] = useState('')

  const orders = listDeliveries({ search, status, serviceType, date: date || undefined })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Commandes</h1>

      <div className="mt-4 space-y-3">
        <input
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          placeholder="Rechercher : numéro, nom, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <input type="date" className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          {date && <button onClick={() => setDate('')} className="text-xs text-slate-soft underline">Effacer</button>}
        </div>
        <select
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as ServiceType | 'all')}
        >
          {SERVICE_FILTERS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'Tous les services' : `${SERVICE_TYPE_ICONS[s]} ${SERVICE_TYPE_LABELS[s]}`}</option>
          ))}
        </select>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${status === s ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-slate-soft'}`}
            >
              {s === 'all' ? 'Toutes' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {orders.length === 0 && <div className="rounded-xl border border-line bg-white p-6 text-center text-sm text-slate-soft">Aucune commande trouvée.</div>}
        {orders.map((d) => (
          <Link key={d.id} to={`/admin/orders/${d.order_number}`} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 hover:border-ink/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">{SERVICE_TYPE_ICONS[d.service_type]}</span>
              <div>
                <div className="font-mono text-sm font-semibold">{d.order_number}</div>
                <div className="text-sm text-slate-soft">{d.customer_name} · {d.pickup_date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{d.price} {biz.currency}</span>
              <StatusBadge status={d.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { getBusinessSettings, listCustomers } from '../../lib/store'

export default function Customers() {
  const customers = listCustomers()
  const biz = getBusinessSettings()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Clients</h1>
      <p className="mt-1 text-sm text-slate-soft">Créés automatiquement à chaque demande de livraison.</p>

      <div className="mt-4 space-y-2">
        {customers.length === 0 && (
          <div className="rounded-xl border border-line bg-white p-6 text-center text-sm text-slate-soft">Aucun client pour le moment.</div>
        )}
        {customers.map((c) => (
          <div key={c.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-slate-soft">{c.phone}</div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-slate-soft">
              <span>{c.deliveries_count} livraison{c.deliveries_count !== 1 ? 's' : ''}</span>
              <span>{c.total_spent} {biz.currency} dépensés</span>
              {c.last_delivery_at && <span>Dernière : {new Date(c.last_delivery_at).toLocaleDateString('fr-FR')}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { getBusinessSettings, getDashboardStats, listDeliveries } from '../../lib/store'
import StatusBadge from '../../components/StatusBadge'
import { SERVICE_TYPE_ICONS } from '../../types'

export default function Dashboard() {
  const stats = getDashboardStats()
  const biz = getBusinessSettings()
  const active = listDeliveries().filter((d) => !['delivered', 'cancelled'].includes(d.status)).slice(0, 8)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <RevenueCard label="Aujourd'hui" value={stats.todayRevenue} currency={biz.currency} />
        <RevenueCard label="Cette semaine" value={stats.weekRevenue} currency={biz.currency} />
        <RevenueCard label="Ce mois" value={stats.monthRevenue} currency={biz.currency} />
      </div>
      <p className="mt-2 text-xs text-slate-soft">Frais de livraison uniquement — les achats clients sont suivis séparément.</p>

      {stats.todayPurchases > 0 && (
        <div className="mt-3 rounded-xl border border-amber/30 bg-amber/10 p-3 text-sm">
          <span className="font-semibold">Achats clients aujourd'hui :</span> {stats.todayPurchases} {biz.currency} (à ne pas confondre avec votre revenu)
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        <PipelineCard label="Nouvelles" count={stats.newCount} accent />
        <PipelineCard label="Acceptées" count={stats.acceptedCount} />
        <PipelineCard label="En cours" count={stats.inProgressCount} />
        <PipelineCard label="Livrées" count={stats.deliveredCount} good />
        <PipelineCard label="Annulées" count={stats.cancelledCount} bad />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">En cours</h2>
        <Link to="/admin/orders" className="text-sm font-medium text-slate-soft hover:text-ink">Tout voir →</Link>
      </div>

      <div className="mt-3 space-y-2">
        {active.length === 0 && (
          <div className="rounded-xl border border-line bg-white p-6 text-center text-sm text-slate-soft">Aucune commande en cours.</div>
        )}
        {active.map((d) => (
          <Link key={d.id} to={`/admin/orders/${d.order_number}`} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 hover:border-ink/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">{SERVICE_TYPE_ICONS[d.service_type]}</span>
              <div>
                <div className="font-mono text-sm font-semibold">{d.order_number}</div>
                <div className="text-sm text-slate-soft">{d.customer_name} · {d.pickup_time_window}</div>
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

function RevenueCard({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="text-xs text-slate-soft">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
      <div className="text-xs text-slate-soft">{currency}</div>
    </div>
  )
}

function PipelineCard({ label, count, accent, good, bad }: { label: string; count: number; accent?: boolean; good?: boolean; bad?: boolean }) {
  const color = accent ? 'text-amber' : good ? 'text-route' : bad ? 'text-alert' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-white p-3 text-center">
      <div className={`font-display text-xl font-bold ${color}`}>{count}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-slate-soft">{label}</div>
    </div>
  )
}

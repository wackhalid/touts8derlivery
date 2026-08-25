import type { DeliveryStatus } from '../types'
import { STATUS_LABELS } from '../types'

const styles: Record<DeliveryStatus, string> = {
  new: 'bg-amber/15 text-amber border-amber/30',
  accepted: 'bg-ink/5 text-ink border-ink/20',
  waiting_for_customer: 'bg-ink/5 text-ink border-ink/20',
  going_to_pickup: 'bg-ink/5 text-ink border-ink/20',
  mission_in_progress: 'bg-ink/5 text-ink border-ink/20',
  picked_up: 'bg-ink/5 text-ink border-ink/20',
  on_the_way: 'bg-ink/5 text-ink border-ink/20',
  delivered: 'bg-route/10 text-route border-route/30',
  cancelled: 'bg-alert/10 text-alert border-alert/30',
}

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

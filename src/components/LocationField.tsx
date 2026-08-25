import { useState } from 'react'
import { getCurrentPosition, mapsLinkFromPoint, type GeoPoint } from '../lib/geolocation'

interface Props {
  label: string
  address: string
  onAddressChange: (v: string) => void
  point: GeoPoint | null
  onPointChange: (p: GeoPoint | null) => void
  placeholder?: string
}

export default function LocationField({ label, address, onAddressChange, point, onPointChange, placeholder }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function shareLocation() {
    setLoading(true)
    setError(null)
    try {
      const p = await getCurrentPosition()
      onPointChange(p)
      onAddressChange('Position GPS partagée')
    } catch {
      setError("Impossible d'obtenir votre position. Vérifiez que la localisation est autorisée.")
    } finally {
      setLoading(false)
    }
  }

  function clearPoint() {
    onPointChange(null)
    onAddressChange('')
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {point ? (
        <div className="flex items-center justify-between rounded-xl border border-route/40 bg-route/10 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-route">📍 Position GPS partagée</div>
            <a href={mapsLinkFromPoint(point)} target="_blank" rel="noreferrer" className="text-xs text-route underline">
              Voir sur la carte
            </a>
          </div>
          <button type="button" onClick={clearPoint} className="text-xs font-medium text-slate-soft hover:text-ink">
            Modifier
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            className="input"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={shareLocation}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-2.5 text-sm font-medium text-ink hover:border-amber disabled:opacity-50"
          >
            📍 {loading ? 'Localisation...' : 'Partager ma position GPS'}
          </button>
          {error && <p className="text-xs text-alert">{error}</p>}
        </div>
      )}
    </div>
  )
}

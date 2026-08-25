import type { PricingSettings } from '../types'

/**
 * Straight-line (haversine) distance in km between two addresses.
 * v1 has no geocoding, so we derive a plausible distance deterministically
 * from the address text — this keeps the demo usable end-to-end.
 * Swap this for Google Distance Matrix once a Maps API key is added;
 * nothing else in the app needs to change.
 */
export function estimateDistanceKm(pickup: string, dropoff: string): number {
  const seed = (pickup + dropoff).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const km = 1 + (seed % 110) / 10 // ~1km to ~12km
  return Math.round(km * 10) / 10
}

/**
 * Real distance in km between two GPS points (haversine formula).
 * Used whenever both pickup and delivery locations were shared via the
 * free GPS pin — no API key needed, and far more accurate than the
 * text-based estimate above.
 */
export function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return Math.round(R * c * 10) / 10
}

export function isNightTime(timeWindow: string, night_start: string, night_end: string): boolean {
  const hourStr = timeWindow.split('-')[0].trim().split(':')[0]
  const hour = parseInt(hourStr, 10)
  if (isNaN(hour)) return false
  const startHour = parseInt(night_start.split(':')[0], 10)
  const endHour = parseInt(night_end.split(':')[0], 10)
  if (startHour > endHour) return hour >= startHour || hour < endHour
  return hour >= startHour && hour < endHour
}

export interface PriceBreakdown {
  distance_km: number
  base_price: number
  extra_km_charge: number
  night_surcharge: number
  urgent_surcharge: number
  subtotal_before_min: number
  total: number
  is_night: boolean
}

// Rule: base_price covers up to included_km. Beyond that, each additional
// km (rounded up) costs price_per_km. Example with defaults (20 DH / 5km / 5 DH per km):
// 0-5km = 20, 6km = 25, 7km = 30, 8km = 35, 9km = 40, 10km = 45.
export function calculatePrice(
  distanceKm: number,
  timeWindow: string,
  isUrgent: boolean,
  settings: PricingSettings
): PriceBreakdown {
  const isNight = isNightTime(timeWindow, settings.night_start, settings.night_end)
  const extraKm = Math.max(0, Math.ceil(distanceKm - settings.included_km))
  const extraKmCharge = extraKm * settings.price_per_km

  let subtotal = settings.base_price + extraKmCharge
  if (subtotal < settings.min_price) subtotal = settings.min_price

  const nightSurcharge = isNight ? settings.night_surcharge : 0
  const urgentSurcharge = isUrgent ? settings.urgent_surcharge : 0
  const total = subtotal + nightSurcharge + urgentSurcharge

  return {
    distance_km: distanceKm,
    base_price: settings.base_price,
    extra_km_charge: extraKmCharge,
    night_surcharge: nightSurcharge,
    urgent_surcharge: urgentSurcharge,
    subtotal_before_min: subtotal,
    total,
    is_night: isNight,
  }
}

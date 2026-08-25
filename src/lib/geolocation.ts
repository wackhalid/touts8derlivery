// Free GPS pin — no Google Maps API key needed. Uses the browser's built-in
// Geolocation API to get exact coordinates, then builds a plain Google Maps
// link from them (same "share position" pattern used in Atlas Drive Business).

export interface GeoPoint {
  lat: number
  lng: number
}

export function getCurrentPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée par ce navigateur.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

export function mapsLinkFromPoint(p: GeoPoint): string {
  return `https://www.google.com/maps?q=${p.lat},${p.lng}`
}

export function navigateLinkFromPoint(p: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
}

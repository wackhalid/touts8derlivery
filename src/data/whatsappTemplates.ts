import type { Delivery, DeliveryStatus } from '../types'
import { SERVICE_TYPE_LABELS, STATUS_LABELS } from '../types'
import { mapsLinkFromPoint } from '../lib/geolocation'

export const whatsappTemplates: Partial<Record<DeliveryStatus, string>> = {
  new: 'Bonjour {name}, votre demande {order_number} a bien été reçue. Nous vous confirmons rapidement.',
  accepted: 'Bonjour {name}, votre demande {order_number} a été acceptée. On s\'en occupe.',
  mission_in_progress: 'Bonjour {name}, la mission pour {order_number} est en cours.',
  picked_up: 'Bonjour {name}, votre colis pour {order_number} a été récupéré.',
  on_the_way: 'Bonjour {name}, votre livraison {order_number} est en route.',
  delivered: 'Bonjour {name}, votre livraison {order_number} a été effectuée. Merci d\'avoir choisi Tout S\'8 Delivery !',
  cancelled: 'Bonjour {name}, votre demande {order_number} a été annulée. N\'hésitez pas à nous contacter.',
}

export function buildWhatsappMessage(status: DeliveryStatus, name: string, orderNumber: string): string {
  const template = whatsappTemplates[status] ?? ''
  return template.replace('{name}', name).replace(/{order_number}/g, orderNumber)
}

export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9+]/g, '').replace(/^0/, '212')
  return `https://wa.me/${digits.replace('+', '')}?text=${encodeURIComponent(message)}`
}

// Sent TO the agent's WhatsApp the moment a customer submits a request —
// same pattern as Atlas Drive Business: the order lands directly in his
// WhatsApp chat, formatted and ready, no backend notification system needed.
export function buildNewOrderMessageForAgent(d: Delivery): string {
  const pickupLine = d.pickup_lat != null && d.pickup_lng != null
    ? `Départ : Position GPS partagée\n📍 ${mapsLinkFromPoint({ lat: d.pickup_lat, lng: d.pickup_lng })}`
    : `Départ : ${d.pickup_address}`
  const deliveryLine = d.delivery_lat != null && d.delivery_lng != null
    ? `Arrivée : Position GPS partagée\n📍 ${mapsLinkFromPoint({ lat: d.delivery_lat, lng: d.delivery_lng })}`
    : `Arrivée : ${d.delivery_address}`

  const lines = [
    `Nouvelle demande — ${d.order_number}`,
    `Service : ${SERVICE_TYPE_LABELS[d.service_type]}`,
    ``,
    `Client : ${d.customer_name}`,
    `Téléphone : ${d.customer_phone}`,
    ``,
    pickupLine,
    deliveryLine,
    d.item_description ? `Détails : ${d.item_description}` : '',
    d.mission_details ? `Mission : ${d.mission_details}` : '',
    ``,
    `Date : ${d.pickup_date} — ${d.pickup_time_window}`,
    `Distance estimée : ${d.distance_km} km`,
    `Frais de livraison : ${d.price} MAD`,
    d.notes ? `Notes : ${d.notes}` : '',
    ``,
    `Statut : ${STATUS_LABELS[d.status]}`,
  ]
  return lines.filter(Boolean).join('\n')
}

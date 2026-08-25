export type DeliveryStatus =
  | 'new'
  | 'accepted'
  | 'waiting_for_customer'
  | 'going_to_pickup'
  | 'mission_in_progress'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled'

export const STATUS_ORDER: DeliveryStatus[] = [
  'new',
  'accepted',
  'going_to_pickup',
  'mission_in_progress',
  'picked_up',
  'on_the_way',
  'delivered',
]

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
  new: 'Nouvelle demande',
  accepted: 'Acceptée',
  waiting_for_customer: 'En attente du client',
  going_to_pickup: 'En route vers le point de départ',
  mission_in_progress: 'Mission en cours',
  picked_up: 'Récupérée',
  on_the_way: 'En route vers vous',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

// Simplified timeline for the customer-facing tracking page.
export const TRACKING_STEPS: { key: DeliveryStatus; label: string; icon: string }[] = [
  { key: 'new', label: 'Demande reçue', icon: '📩' },
  { key: 'accepted', label: 'Livraison acceptée', icon: '✅' },
  { key: 'mission_in_progress', label: 'Mission en cours', icon: '🛵' },
  { key: 'picked_up', label: 'Colis récupéré', icon: '📦' },
  { key: 'on_the_way', label: 'En route', icon: '🛣️' },
  { key: 'delivered', label: 'Livré', icon: '🎉' },
]

export type PaymentMethod = 'cash' | 'transfer' | 'other'
export type PaymentStatusType = 'pending' | 'partial' | 'paid'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusType, string> = {
  pending: 'En attente',
  partial: 'Partiellement payé',
  paid: 'Payé',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  transfer: 'Virement',
  other: 'Autre',
}

export type ServiceType =
  | 'restaurant'
  | 'supermarche'
  | 'facture'
  | 'pressing'
  | 'marche'
  | 'pharmacie'
  | 'administration'
  | 'general'
  | 'autre'

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  restaurant: 'Restaurants',
  supermarche: 'Supermarchés',
  facture: 'Paiement de factures',
  pressing: 'Pressing',
  marche: 'Marché & légumes',
  pharmacie: 'Pharmacie',
  administration: 'Administrations',
  general: 'Livraison générale',
  autre: 'Autre',
}

export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  restaurant: 'Récupération de votre commande et livraison chez vous, encore chaude.',
  supermarche: "Vos courses achetées ou récupérées et livrées à votre porte.",
  facture: 'Le livreur se déplace pour régler une facture à votre place.',
  pressing: 'Vos vêtements récupérés chez vous, déposés au pressing, puis rapportés.',
  marche: 'Fruits, légumes et produits frais achetés au marché local et livrés.',
  pharmacie: 'Vos médicaments récupérés à la pharmacie et livrés rapidement.',
  administration: 'Une démarche administrative faite pour vous : dépôt, retrait de documents.',
  general: "Tout autre colis ou objet légal à livrer d'un point A à un point B.",
  autre: "Décrivez votre besoin, on s'en occupe.",
}

export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  restaurant: '🍔',
  supermarche: '🛒',
  facture: '💳',
  pressing: '👕',
  marche: '🥦',
  pharmacie: '💊',
  administration: '🏢',
  general: '📦',
  autre: '✨',
}

// Services where the agent needs to buy/pay something before delivering.
export const MISSION_SERVICE_TYPES: ServiceType[] = ['supermarche', 'marche', 'pharmacie', 'pressing', 'facture']

export interface PricingSettings {
  base_price: number
  included_km: number
  price_per_km: number
  min_price: number
  night_surcharge: number
  night_start: string
  night_end: string
  urgent_surcharge: number
}

export interface BusinessSettings {
  business_name: string
  logo_url?: string
  tagline: string
  agent_name: string
  phone: string
  whatsapp: string
  working_hours: { open: string; close: string; days: string }
  service_areas: string[]
  currency: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  notes?: string
  created_at: string
  deliveries_count: number
  total_spent: number
  last_delivery_at?: string
}

export interface Payment {
  id: string
  delivery_id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatusType
  paid_at?: string
}

export interface Delivery {
  id: string
  order_number: string
  customer_id?: string
  customer_name: string
  customer_phone: string
  customer_whatsapp: string
  service_type: ServiceType
  pickup_address: string
  pickup_lat?: number
  pickup_lng?: number
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  item_description: string
  mission_details?: string
  pickup_date: string
  pickup_time_window: string
  notes?: string
  distance_km: number
  price: number
  purchase_amount: number
  is_urgent: boolean
  is_night: boolean
  status: DeliveryStatus
  created_at: string
  updated_at: string
  payment?: Payment
}

export interface DeliveryRequestInput {
  customer_name: string
  customer_phone: string
  customer_whatsapp: string
  service_type: ServiceType
  pickup_address: string
  pickup_lat?: number
  pickup_lng?: number
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  item_description: string
  mission_details?: string
  pickup_date: string
  pickup_time_window: string
  notes?: string
  is_urgent: boolean
}

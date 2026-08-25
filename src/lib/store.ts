import type {
  BusinessSettings,
  Customer,
  Delivery,
  DeliveryRequestInput,
  DeliveryStatus,
  Payment,
  PaymentMethod,
  PaymentStatusType,
  PricingSettings,
} from '../types'
import { calculatePrice, estimateDistanceKm, haversineDistanceKm } from './pricing'

// ---------------------------------------------------------------------------
// This module is the ONLY place the rest of the app talks to for data.
// Today it's backed by localStorage so the whole flow works standalone.
// Once Supabase is wired (env keys set + schema.sql run), swap the bodies of
// these functions for `supabase.from(...)` calls — the signatures below are
// already shaped to match the schema, so pages won't need to change.
// ---------------------------------------------------------------------------

const LS_KEY = 'touts8_delivery_v1'

interface DB {
  business: BusinessSettings
  pricing: PricingSettings
  customers: Customer[]
  deliveries: Delivery[]
  orderSeq: number
}

function seed(): DB {
  return {
    business: {
      business_name: "Tout S'8 Delivery",
      tagline: 'Votre service de livraison et de courses à Marrakech',
      agent_name: "S'8",
      phone: '+212600000000',
      whatsapp: '+212600000000',
      working_hours: { open: '08:00', close: '21:00', days: 'Lun–Sam' },
      service_areas: ['Marrakech', 'Guéliz', 'Hivernage', 'Médina', 'Palmeraie', 'Targa'],
      currency: 'MAD',
    },
    pricing: {
      base_price: 20,
      included_km: 5,
      price_per_km: 5,
      min_price: 20,
      night_surcharge: 0,
      night_start: '22:00',
      night_end: '07:00',
      urgent_surcharge: 0,
    },
    customers: [],
    deliveries: [],
    orderSeq: 0,
  }
}

function load(): DB {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return seed()
    return JSON.parse(raw) as DB
  } catch {
    return seed()
  }
}

function save(db: DB) {
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

let db = load()

function persistAndReturn<T>(value: T): T {
  save(db)
  return value
}

// --- Business settings ------------------------------------------------

export function getBusinessSettings(): BusinessSettings {
  return db.business
}

export function updateBusinessSettings(patch: Partial<BusinessSettings>): BusinessSettings {
  db.business = { ...db.business, ...patch }
  return persistAndReturn(db.business)
}

// --- Pricing settings ---------------------------------------------------

export function getPricingSettings(): PricingSettings {
  return db.pricing
}

export function updatePricingSettings(patch: Partial<PricingSettings>): PricingSettings {
  db.pricing = { ...db.pricing, ...patch }
  return persistAndReturn(db.pricing)
}

// --- Order numbers --------------------------------------------------------

function nextOrderNumber(): string {
  db.orderSeq += 1
  const year = new Date().getFullYear()
  return `MNM-${year}-${String(db.orderSeq).padStart(4, '0')}`
}

// --- Price preview (used live on the request form, before submit) --------
// Purchase amount (groceries, pharmacy items, bill amount, etc.) is always
// kept separate from the delivery fee — see Delivery.purchase_amount.

export function previewPrice(pickup: string, dropoff: string, timeWindow: string, isUrgent: boolean) {
  const distance = estimateDistanceKm(pickup, dropoff)
  return calculatePrice(distance, timeWindow, isUrgent, db.pricing)
}

// Preferred when both locations were shared via GPS pin — real distance,
// no API key needed.
export function previewPriceFromPoints(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  timeWindow: string,
  isUrgent: boolean
) {
  const distance = haversineDistanceKm(pickup, dropoff)
  return calculatePrice(distance, timeWindow, isUrgent, db.pricing)
}

export function estimatePriceForDistance(distanceKm: number) {
  return calculatePrice(distanceKm, '12:00', false, db.pricing)
}

// --- Customers --------------------------------------------------------

function findOrCreateCustomer(name: string, phone: string): Customer {
  let c = db.customers.find((x) => x.phone === phone)
  if (!c) {
    c = {
      id: crypto.randomUUID(),
      name,
      phone,
      created_at: new Date().toISOString(),
      deliveries_count: 0,
      total_spent: 0,
    }
    db.customers.push(c)
  }
  return c
}

function recomputeCustomerStats(customerId: string) {
  const c = db.customers.find((x) => x.id === customerId)
  if (!c) return
  const orders = db.deliveries.filter((d) => d.customer_id === customerId)
  const delivered = orders.filter((d) => d.status === 'delivered')
  c.deliveries_count = delivered.length
  c.total_spent = delivered.reduce((sum, d) => sum + d.price, 0)
  c.last_delivery_at = orders.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.created_at
}

export function listCustomers(): Customer[] {
  return [...db.customers].sort((a, b) => (b.last_delivery_at ?? '').localeCompare(a.last_delivery_at ?? ''))
}

export function findCustomer(query: string): Customer[] {
  const q = query.toLowerCase()
  return db.customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
}

// --- Deliveries -----------------------------------------------------------

export function createDeliveryRequest(input: DeliveryRequestInput): Delivery {
  const hasBothPoints = input.pickup_lat != null && input.pickup_lng != null && input.delivery_lat != null && input.delivery_lng != null
  const breakdown = hasBothPoints
    ? previewPriceFromPoints(
        { lat: input.pickup_lat!, lng: input.pickup_lng! },
        { lat: input.delivery_lat!, lng: input.delivery_lng! },
        input.pickup_time_window,
        input.is_urgent
      )
    : previewPrice(input.pickup_address, input.delivery_address, input.pickup_time_window, input.is_urgent)
  const customer = findOrCreateCustomer(input.customer_name, input.customer_phone)

  const delivery: Delivery = {
    id: crypto.randomUUID(),
    order_number: nextOrderNumber(),
    customer_id: customer.id,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_whatsapp: input.customer_whatsapp || input.customer_phone,
    service_type: input.service_type,
    pickup_address: input.pickup_address,
    pickup_lat: input.pickup_lat,
    pickup_lng: input.pickup_lng,
    delivery_address: input.delivery_address,
    delivery_lat: input.delivery_lat,
    delivery_lng: input.delivery_lng,
    item_description: input.item_description,
    mission_details: input.mission_details,
    pickup_date: input.pickup_date,
    pickup_time_window: input.pickup_time_window,
    notes: input.notes,
    distance_km: breakdown.distance_km,
    price: breakdown.total,
    purchase_amount: 0,
    is_urgent: input.is_urgent,
    is_night: breakdown.is_night,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  db.deliveries.unshift(delivery)
  recomputeCustomerStats(customer.id)
  return persistAndReturn(delivery)
}

export function getDeliveryByOrderNumber(orderNumber: string): Delivery | undefined {
  return db.deliveries.find((d) => d.order_number.toLowerCase() === orderNumber.trim().toLowerCase())
}

export interface DeliveryFilters {
  status?: DeliveryStatus | 'all'
  serviceType?: string | 'all'
  search?: string
  date?: string
  dateFrom?: string
  dateTo?: string
}

export function listDeliveries(filters: DeliveryFilters = {}): Delivery[] {
  let results = [...db.deliveries]
  if (filters.status && filters.status !== 'all') {
    results = results.filter((d) => d.status === filters.status)
  }
  if (filters.serviceType && filters.serviceType !== 'all') {
    results = results.filter((d) => d.service_type === filters.serviceType)
  }
  if (filters.date) {
    results = results.filter((d) => d.pickup_date === filters.date)
  }
  if (filters.dateFrom) {
    results = results.filter((d) => d.pickup_date >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    results = results.filter((d) => d.pickup_date <= filters.dateTo!)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (d) =>
        d.order_number.toLowerCase().includes(q) ||
        d.customer_name.toLowerCase().includes(q) ||
        d.customer_phone.includes(q)
    )
  }
  return results.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function updateDeliveryStatus(orderNumber: string, status: DeliveryStatus): Delivery | undefined {
  const d = db.deliveries.find((x) => x.order_number === orderNumber)
  if (!d) return undefined
  d.status = status
  d.updated_at = new Date().toISOString()
  if (d.customer_id) recomputeCustomerStats(d.customer_id)
  persistAndReturn(d)
  return d
}

export function updatePurchaseAmount(orderNumber: string, amount: number): Delivery | undefined {
  const d = db.deliveries.find((x) => x.order_number === orderNumber)
  if (!d) return undefined
  d.purchase_amount = amount
  d.updated_at = new Date().toISOString()
  persistAndReturn(d)
  return d
}

// --- Payments ---------------------------------------------------------
// Payment covers the delivery fee only; purchase_amount (groceries, bills,
// pharmacy items) is tracked separately and is money owed for products,
// not the agent's delivery revenue.

export function recordPayment(orderNumber: string, method: PaymentMethod, status: PaymentStatusType): Delivery | undefined {
  const d = db.deliveries.find((x) => x.order_number === orderNumber)
  if (!d) return undefined
  const payment: Payment = {
    id: crypto.randomUUID(),
    delivery_id: d.id,
    amount: d.price,
    method,
    status,
    paid_at: status === 'paid' ? new Date().toISOString() : undefined,
  }
  d.payment = payment
  persistAndReturn(d)
  return d
}

// --- Revenue / dashboard aggregates ----------------------------------
// "Revenue" here means delivery fees only — purchase amounts are the
// customer's product money, passed through, not the agent's earnings.

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfWeek(d: Date) {
  const x = startOfDay(d)
  const day = x.getDay() === 0 ? 7 : x.getDay()
  x.setDate(x.getDate() - (day - 1))
  return x
}
function startOfMonth(d: Date) {
  const x = startOfDay(d)
  x.setDate(1)
  return x
}

export function getDashboardStats() {
  const now = new Date()
  const delivered = db.deliveries.filter((d) => d.status === 'delivered')
  const sumFeesSince = (since: Date) =>
    delivered.filter((d) => new Date(d.updated_at) >= since).reduce((sum, d) => sum + d.price, 0)
  const sumPurchasesSince = (since: Date) =>
    delivered.filter((d) => new Date(d.updated_at) >= since).reduce((sum, d) => sum + (d.purchase_amount || 0), 0)

  return {
    newCount: db.deliveries.filter((d) => d.status === 'new').length,
    acceptedCount: db.deliveries.filter((d) => d.status === 'accepted').length,
    inProgressCount: db.deliveries.filter((d) =>
      ['going_to_pickup', 'mission_in_progress', 'picked_up', 'on_the_way'].includes(d.status)
    ).length,
    deliveredCount: delivered.length,
    cancelledCount: db.deliveries.filter((d) => d.status === 'cancelled').length,
    todayCount: db.deliveries.filter((d) => d.pickup_date === now.toISOString().slice(0, 10)).length,
    todayRevenue: sumFeesSince(startOfDay(now)),
    weekRevenue: sumFeesSince(startOfWeek(now)),
    monthRevenue: sumFeesSince(startOfMonth(now)),
    totalRevenue: delivered.reduce((sum, d) => sum + d.price, 0),
    todayPurchases: sumPurchasesSince(startOfDay(now)),
    monthPurchases: sumPurchasesSince(startOfMonth(now)),
  }
}

// --- Dev convenience: seed a couple of demo orders on first load ---------

export function seedDemoDataIfEmpty() {
  if (db.deliveries.length > 0) return
  createDeliveryRequest({
    customer_name: 'Yassine Benali',
    customer_phone: '+212612345678',
    customer_whatsapp: '+212612345678',
    service_type: 'pharmacie',
    pickup_address: 'Pharmacie Guéliz, Avenue Mohammed V',
    delivery_address: 'Résidence Al Andalous, Guéliz',
    item_description: 'Ordonnance + médicaments',
    mission_details: 'Voir ordonnance jointe, pharmacie du quartier',
    pickup_date: new Date().toISOString().slice(0, 10),
    pickup_time_window: '11:00',
    is_urgent: false,
  })
  const first = 'MNM-' + new Date().getFullYear() + '-0001'
  updatePurchaseAmount(first, 85)
  updateDeliveryStatus(first, 'delivered')
  createDeliveryRequest({
    customer_name: 'Salma Idrissi',
    customer_phone: '+212661112233',
    customer_whatsapp: '+212661112233',
    service_type: 'marche',
    pickup_address: 'Marché Jeliz, Guéliz',
    delivery_address: 'Riad Kheirredine, Médina',
    item_description: 'Légumes et fruits de saison',
    mission_details: 'Tomates, oignons, pommes de terre, carottes — 2kg chacun',
    pickup_date: new Date().toISOString().slice(0, 10),
    pickup_time_window: '15:30',
    is_urgent: true,
  })
}

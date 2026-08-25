# Atlas Livraison — Architecture

One motorcycle courier, one dashboard. Built to expand to a fleet later without a rewrite.

## Stack
Vite + React + TypeScript + Tailwind + Supabase (Postgres + Auth) + Netlify — same stack as your other builds.

## Routes

Public:
- `/` — business profile page (logo, hours, areas, "Demander une livraison")
- `/request-delivery` — customer request form + live price estimate
- `/order/:orderNumber` — confirmation page shown right after a request is submitted
- `/track` — customer enters an order number and sees status
- `/track/:orderNumber` — direct link version (for WhatsApp messages)

Admin (auth-gated):
- `/admin/login`
- `/admin/dashboard` — pipeline: New / Accepted / Picked up / On the way / Delivered, + today/week/month revenue
- `/admin/orders` — searchable history with filters (date, status, customer, phone, order #)
- `/admin/orders/:orderNumber` — order detail, status changes, navigation links, WhatsApp buttons, payment recording
- `/admin/customers` — customer database (auto-built from orders)
- `/admin/settings` — pricing, business info, hours, areas, notification message templates

## Data model (Supabase / Postgres)

**business_settings** (single row)
id, business_name, logo_url, phone, whatsapp, tagline, working_hours (jsonb), service_areas (text[]), currency, updated_at

**pricing_settings** (single row)
id, base_price, price_per_km, min_price, included_km, extra_km_price, night_surcharge, night_start, night_end, urgent_surcharge, updated_at

**customers**
id, name, phone, created_at, notes
→ deliveries_count, total_spent, last_delivery_at are computed (view), not stored, so they never drift out of sync with the orders table.

**deliveries**
id, order_number (unique, e.g. DEL-2026-0001), customer_id (fk),
customer_name, customer_phone, pickup_address, pickup_lat, pickup_lng,
delivery_address, delivery_lat, delivery_lng, item_description,
pickup_date, pickup_time_window, notes,
distance_km, price, is_urgent, is_night,
status (enum: new, accepted, picked_up, on_the_way, delivered, cancelled),
created_at, updated_at

**delivery_status_history**
id, delivery_id (fk), status, changed_at, note

**payments**
id, delivery_id (fk), amount, method (cash, transfer, online, other), status (pending, paid), paid_at

**users** (admin accounts — backed by Supabase Auth; this table holds profile info only)
id (= auth.users id), full_name, phone, role

## Pricing formula (editable from Settings)

```
distance = haversine(pickup, delivery)  // km
price = base_price
       + max(0, distance - included_km) * price_per_km
if price < min_price: price = min_price
if is_night: price += night_surcharge
if is_urgent: price += urgent_surcharge
```

Google Maps Distance Matrix can later replace the haversine estimate for road-distance accuracy — the calculator function is isolated in `src/lib/pricing.ts` so swapping the distance source doesn't touch anything else.

## Status flow

`new → accepted → picked_up → on_the_way → delivered`, with `cancelled` reachable from any state before `delivered`. Every transition writes a row to `delivery_status_history` and is one tap in the dashboard.

## WhatsApp notifications (v1, no API)

Each status change surfaces a "Notifier client" button that opens `wa.me/<phone>?text=<encoded template>` with the right message pre-filled in FR/EN/Darija depending on business settings — no WhatsApp Business API needed yet. Templates live in `src/data/whatsappTemplates.ts` and are editable from Settings later.

## Build order (what's in this drop vs. next)

Included now: business profile, request form + price calculator, order confirmation, tracking page, admin login shell, dashboard pipeline, order detail with status changes + WhatsApp buttons + navigation links, settings for pricing. All wired to a typed data layer (`src/lib/store.ts`) currently backed by an in-memory/localStorage mock so the whole flow runs standalone in the browser today.

Next (needs your Supabase project): swap `src/lib/store.ts` internals for real Supabase calls against `schema.sql` — the function signatures are already shaped to match, so pages don't need to change. Also needs a Google Maps API key for real autocomplete + road distance (same blocker as Discover Leads).

Deferred per your spec: multi-driver, live GPS, online payments, SMS, WhatsApp API, ratings, delivery zones, analytics.

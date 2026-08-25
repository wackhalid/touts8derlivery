# Atlas Livraison

Private delivery management platform for a solo motorcycle courier. See `ARCHITECTURE.md` for the full route map, data model, and pricing formula.

## Run it locally

```bash
npm install
npm run dev
```

Works immediately with no setup — data is stored in the browser (localStorage) and seeded with two demo orders on first load, so you can test the whole flow (`/`, `/request-delivery`, `/track`, `/admin/login`) right away. Admin login accepts any email + a password of 4+ characters for now.

## Deploy to Netlify

Same as your other builds: `npm run build`, then deploy the `dist/` folder (or connect the repo directly to Netlify — build command `npm run build`, publish directory `dist`).

## Wiring up Supabase (when ready)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Replace the bodies of the functions in `src/lib/store.ts` with `supabase.from(...)` calls — the function signatures already match the schema, so no page needs to change.
5. Swap `src/lib/adminAuth.ts` for real `supabase.auth.signInWithPassword`.

## Adding Google Maps (when ready)

Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`, then in `src/lib/pricing.ts` replace `estimateDistanceKm` with a call to the Distance Matrix API, and add the Places Autocomplete widget to the address fields in `RequestDelivery.tsx`. Nothing else needs to change — every page reads distance/price through that one function.

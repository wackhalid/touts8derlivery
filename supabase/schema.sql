-- Tout S'8 Delivery — schema.sql
-- Run in Supabase SQL editor.

create extension if not exists "uuid-ossp";

create type delivery_status as enum (
  'new', 'accepted', 'waiting_for_customer', 'going_to_pickup',
  'mission_in_progress', 'picked_up', 'on_the_way', 'delivered', 'cancelled'
);

create type payment_method as enum ('cash', 'transfer', 'other');
create type payment_status as enum ('pending', 'partial', 'paid');

create type service_type as enum (
  'restaurant', 'supermarche', 'facture', 'pressing', 'marche', 'pharmacie', 'administration', 'general', 'autre'
);

create table business_settings (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null default 'Tout S''8 Delivery',
  logo_url text,
  tagline text default 'Votre service de livraison et de courses à Marrakech',
  agent_name text default 'S''8',
  phone text,
  whatsapp text,
  working_hours jsonb default '{"open":"08:00","close":"21:00","days":"Lun–Sam"}',
  service_areas text[] default array['Marrakech'],
  currency text default 'MAD',
  updated_at timestamptz default now()
);

create table pricing_settings (
  id uuid primary key default uuid_generate_v4(),
  base_price numeric not null default 20,
  included_km numeric not null default 5,
  price_per_km numeric not null default 5,
  min_price numeric not null default 20,
  night_surcharge numeric not null default 0,
  night_start time default '22:00',
  night_end time default '07:00',
  urgent_surcharge numeric not null default 0,
  updated_at timestamptz default now()
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null unique,
  notes text,
  created_at timestamptz default now()
);

create table deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_phone text not null,
  customer_whatsapp text not null,
  service_type service_type not null default 'autre',
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  delivery_address text not null,
  delivery_lat double precision,
  delivery_lng double precision,
  item_description text,
  mission_details text,
  pickup_date date not null,
  pickup_time_window text,
  notes text,
  distance_km numeric,
  price numeric not null,           -- delivery fee only
  purchase_amount numeric default 0, -- separate: cost of groceries/pharmacy/bill, confirmed after the mission
  is_urgent boolean default false,
  is_night boolean default false,
  status delivery_status not null default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table delivery_status_history (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid references deliveries(id) on delete cascade,
  status delivery_status not null,
  changed_at timestamptz default now(),
  note text
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid references deliveries(id) on delete cascade,
  amount numeric not null,          -- delivery fee payment only
  method payment_method default 'cash',
  status payment_status default 'pending',
  paid_at timestamptz
);

create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'agent'
);

create table services (
  id uuid primary key default uuid_generate_v4(),
  code service_type unique not null,
  label text not null,
  description text,
  icon text,
  requires_mission boolean default false,
  active boolean default true
);

-- Computed customer stats, always in sync with deliveries.
create view customer_stats as
select
  c.id, c.name, c.phone,
  count(d.id) filter (where d.status = 'delivered') as deliveries_count,
  coalesce(sum(d.price) filter (where d.status = 'delivered'), 0) as total_delivery_fees,
  coalesce(sum(d.purchase_amount) filter (where d.status = 'delivered'), 0) as total_purchases,
  max(d.created_at) as last_delivery_at
from customers c
left join deliveries d on d.customer_id = c.id
group by c.id, c.name, c.phone;

-- order_number sequence: MNM-<year>-<0001>
create sequence if not exists delivery_seq;
create or replace function next_order_number() returns text as $$
  select 'MNM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('delivery_seq')::text, 4, '0');
$$ language sql;

create or replace function log_status_change() returns trigger as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into delivery_status_history (delivery_id, status) values (new.id, new.status);
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_delivery_status
  before insert or update on deliveries
  for each row execute function log_status_change();

alter table deliveries enable row level security;
alter table customers enable row level security;
alter table payments enable row level security;
alter table delivery_status_history enable row level security;

create policy "public can create a delivery request" on deliveries
  for insert to anon with check (true);

create policy "public can track by order_number" on deliveries
  for select to anon using (true);

create policy "admin full access deliveries" on deliveries
  for all to authenticated using (true) with check (true);

create policy "admin full access customers" on customers
  for all to authenticated using (true) with check (true);

create policy "admin full access payments" on payments
  for all to authenticated using (true) with check (true);

create policy "admin read status history" on delivery_status_history
  for select to authenticated using (true);

-- =========================================================================
-- MATE CLUB BALIKPAPAN - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS & PROFILES TABLE
create table if not exists public.users (
  id text primary key,
  name text not null,
  phone text not null unique,
  email text,
  password text not null default 'player123',
  role text default 'player' check (role in ('player', 'admin', 'superadmin', 'referee', 'photographer')),
  preferred_position text default 'Pemain Lapangan',
  club_origin text default 'Komunitas MATE CLUB',
  jersey_number text default '10',
  caps int default 0,
  goals int default 0,
  mvp_count int default 0,
  status text default 'active' check (status in ('active', 'suspended', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. VENUES (MASTER LAPANGAN REKANAN)
create table if not exists public.venues (
  id text primary key,
  name text not null,
  location text not null,
  rate_per_hour numeric not null,
  player_slot_fee numeric not null default 50000,
  keeper_slot_fee numeric not null default 25000,
  image text,
  specs text,
  facilities text[] default array[]::text[],
  status text default 'active' check (status in ('active', 'maintenance', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. REFEREES (WASIT BERLISENSI PSSI)
create table if not exists public.referees (
  id text primary key,
  name text not null,
  license text not null,
  phone text not null,
  rate numeric not null default 150000,
  status text default 'active' check (status in ('active', 'off', 'inactive')),
  rating numeric default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PHOTOGRAPHERS (FOTOGRAFER MATCHDAY)
create table if not exists public.photographers (
  id text primary key,
  name text not null,
  category text not null,
  phone text not null,
  rate numeric not null default 100000,
  portfolio_url text,
  status text default 'active' check (status in ('active', 'off', 'inactive')),
  rating numeric default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. FACILITIES & SERVICES
create table if not exists public.facilities (
  id text primary key,
  name text not null,
  icon text not null default 'fa-check',
  category text not null check (category in ('match', 'venue')),
  badge_color text default '#3f72af',
  description text not null,
  is_default_match boolean default false,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. MATCHES (JADWAL PERTANDINGAN & SLOT GAME)
create table if not exists public.matches (
  id text primary key,
  type text not null check (type in ('fun_football', 'sparring', 'trofeo')),
  title text not null,
  date date not null,
  date_label text not null,
  time_slot text not null,
  field_id text references public.venues(id) on delete set null,
  referee_id text references public.referees(id) on delete set null,
  photographer_id text references public.photographers(id) on delete set null,
  player_fee numeric not null default 50000,
  keeper_fee numeric not null default 25000,
  slot_fee numeric not null default 50000,
  position_pricing jsonb default '{"GK": 25000, "DEF": 50000, "MID": 50000, "FWD": 50000, "ALL": 50000}'::jsonb,
  dp_required numeric not null default 50000,
  status text default 'open' check (status in ('open', 'confirmed', 'completed', 'cancelled')),
  level text default 'Medium / Menengah',
  level_badge text default '⚡ Medium',
  facilities text[] default array['Wasit Berlisensi PSSI', 'Dokumentasi Foto HD', 'Rompi Bersih', 'Air Mineral']::text[],
  total_slots int not null default 24,
  player_slots int not null default 22,
  gk_slots int not null default 2,
  max_roster_per_team int default 14,
  registered_players jsonb default '[]'::jsonb,
  team_a jsonb,
  team_b jsonb,
  match_stats jsonb,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. BOOKINGS (TRANSAKSI & TIKET PASS)
create table if not exists public.bookings (
  id text primary key,
  match_id text references public.matches(id) on delete cascade not null,
  player_name text not null,
  phone text not null,
  booking_type text default 'solo' check (booking_type in ('solo', 'team')),
  position text not null,
  jersey_size text default 'L',
  base_amount numeric not null,
  unique_code int default 0,
  amount numeric not null,
  payment_method text not null default 'qris',
  payment_status text default 'waiting_verification' check (payment_status in ('waiting_verification', 'paid', 'cancelled', 'refunded')),
  proof_image text,
  ticket_code text not null unique,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. SPONSORS (MITRA SPONSOR & KOLABORASI)
create table if not exists public.sponsors (
  id text primary key,
  name text not null,
  tier text default 'gold' check (tier in ('headline', 'platinum', 'gold', 'silver', 'partner')),
  category text not null,
  logo text not null,
  website_url text,
  promo_text text,
  status text default 'active' check (status in ('active', 'inactive')),
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. COMMUNITY POSTS (BERITA & ARTIKEL)
create table if not exists public.community_posts (
  id text primary key,
  title text not null,
  summary text not null,
  content text,
  category text default 'Tips & Taktik',
  author text default 'MATE CLUB Media',
  read_time text default '3 min baca',
  date date default current_date,
  image text,
  status text default 'active' check (status in ('active', 'draft', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. STANDINGS & CLUBS
create table if not exists public.standings_clubs (
  id text primary key,
  rank int not null,
  name text not null,
  logo text not null,
  played int default 0,
  won int default 0,
  drawn int default 0,
  lost int default 0,
  gf int default 0,
  ga int default 0,
  gd int default 0,
  points int default 0,
  form text[] default array['W','W','D']::text[],
  status text default 'active' check (status in ('active', 'inactive'))
);

-- 11. TOP PERFORMERS
create table if not exists public.top_performers (
  id text primary key,
  name text not null,
  club text not null,
  avatar text not null,
  goals int default 0,
  assists int default 0,
  mvp int default 0,
  caps int default 0,
  type text default 'striker',
  status text default 'active' check (status in ('active', 'inactive'))
);

-- 12. PAYMENT GATEWAYS (CONFIG)
create table if not exists public.payment_gateways (
  id text primary key,
  name text not null,
  provider text not null,
  status text default 'active' check (status in ('active', 'inactive')),
  mode text default 'production' check (mode in ('sandbox', 'production')),
  server_url text,
  merchant_id text,
  api_key text,
  qris_static text,
  webhook_url text,
  fee_bearer text default 'merchant',
  auto_settlement boolean default true,
  channels jsonb default '[]'::jsonb,
  bank_accounts jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. WHATSAPP GATEWAY (CONFIG)
create table if not exists public.whatsapp_gateways (
  id text primary key,
  provider text default 'waha',
  status text default 'connected',
  server_url text default 'http://localhost:3005',
  session_name text default 'default',
  api_key text default '',
  device_number text not null default '081251234567',
  admin_phone text not null default '081251234567',
  player_notify_enabled boolean default true,
  admin_notify_enabled boolean default true,
  templates jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
alter table public.users enable row level security;
alter table public.venues enable row level security;
alter table public.referees enable row level security;
alter table public.photographers enable row level security;
alter table public.facilities enable row level security;
alter table public.matches enable row level security;
alter table public.bookings enable row level security;
alter table public.sponsors enable row level security;
alter table public.community_posts enable row level security;
alter table public.standings_clubs enable row level security;
alter table public.top_performers enable row level security;
alter table public.payment_gateways enable row level security;
alter table public.whatsapp_gateways enable row level security;

-- PUBLIC READ & INSERT POLICIES
create policy "Allow all on users" on public.users for all using (true) with check (true);
create policy "Allow all on venues" on public.venues for all using (true) with check (true);
create policy "Allow all on referees" on public.referees for all using (true) with check (true);
create policy "Allow all on photographers" on public.photographers for all using (true) with check (true);
create policy "Allow all on facilities" on public.facilities for all using (true) with check (true);
create policy "Allow all on matches" on public.matches for all using (true) with check (true);
create policy "Allow all on bookings" on public.bookings for all using (true) with check (true);
create policy "Allow all on sponsors" on public.sponsors for all using (true) with check (true);
create policy "Allow all on community_posts" on public.community_posts for all using (true) with check (true);
create policy "Allow all on standings_clubs" on public.standings_clubs for all using (true) with check (true);
create policy "Allow all on top_performers" on public.top_performers for all using (true) with check (true);
create policy "Allow all on payment_gateways" on public.payment_gateways for all using (true) with check (true);
create policy "Allow all on whatsapp_gateways" on public.whatsapp_gateways for all using (true) with check (true);

-- REALTIME REPLICATION PUBLICATION
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.venues;
alter publication supabase_realtime add table public.facilities;
alter publication supabase_realtime add table public.sponsors;
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.payment_gateways;
alter publication supabase_realtime add table public.whatsapp_gateways;

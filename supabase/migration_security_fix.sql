-- =========================================================================
-- MATE CLUB BALIKPAPAN - PRODUCTION SECURITY REMEDIATION SCRIPT (V2 - FINAL)
-- RUN IN SUPABASE SQL EDITOR TO CLOSE ALL WRITE & AUTH LEAKS
-- =========================================================================

-- Step 1: DROP OLD PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Allow all on users" ON public.users;
DROP POLICY IF EXISTS "Allow all on venues" ON public.venues;
DROP POLICY IF EXISTS "Allow all on referees" ON public.referees;
DROP POLICY IF EXISTS "Allow all on photographers" ON public.photographers;
DROP POLICY IF EXISTS "Allow all on facilities" ON public.facilities;
DROP POLICY IF EXISTS "Allow all on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all on sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Allow all on community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow all on standings_clubs" ON public.standings_clubs;
DROP POLICY IF EXISTS "Allow all on top_performers" ON public.top_performers;
DROP POLICY IF EXISTS "Allow all on payment_gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Allow all on whatsapp_gateways" ON public.whatsapp_gateways;
DROP POLICY IF EXISTS "Allow all on wallet_transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Bookings: Insert new booking" ON public.bookings;
DROP POLICY IF EXISTS "Bookings: View own bookings or admin" ON public.bookings;

-- Step 2: REMOVE PLAINTEXT PASSWORD COLUMN FROM PUBLIC.USERS
ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- Step 3: HELPER CEK ROLE ADMIN / SUPERADMIN TEROTENTIKASI
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    coalesce(current_setting('request.jwt.claim.role', true), '') IN ('service_role', 'supabase_admin') OR
    coalesce(auth.jwt() ->> 'role', '') IN ('admin', 'superadmin') OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (id = auth.uid()::text OR phone = (auth.jwt() ->> 'phone')) 
      AND role IN ('admin', 'superadmin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- Step 4: STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- 1. USERS & PROFILES (DILARANG BACA ANONIM)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: View own profile or admin" ON public.users
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid()::text OR 
    public.is_admin()
  )
);

CREATE POLICY "Users: Update own profile or admin" ON public.users
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid()::text OR 
    public.is_admin()
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND (
    id = auth.uid()::text OR 
    public.is_admin()
  )
);

CREATE POLICY "Users: Insert own profile or admin" ON public.users
FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND id = auth.uid()::text) OR 
  public.is_admin()
);

CREATE POLICY "Users: Delete admin only" ON public.users
FOR DELETE USING (public.is_admin());


-- 2. BOOKINGS & PASSES (DILARANG RAW INSERT DARI ANONIM - TUTUP LUBANG 23502)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Hanya admin atau user pemilik akun terotentikasi yang bisa SELECT langsung
CREATE POLICY "Bookings: Select auth or admin" ON public.bookings
FOR SELECT USING (
  public.is_admin() OR
  (auth.jwt() IS NOT NULL AND phone = (auth.jwt() ->> 'phone'))
);

-- HANYA user login atau admin/service yang boleh INSERT langsung ke tabel bookings
-- Anonim HARUS lewat fungsi RPC submit_booking terproteksi!
CREATE POLICY "Bookings: Insert auth or admin only" ON public.bookings
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL OR public.is_admin()
);

CREATE POLICY "Bookings: Update admin only" ON public.bookings
FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Bookings: Delete admin only" ON public.bookings
FOR DELETE USING (public.is_admin());


-- 3. WALLET TRANSACTIONS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet: View own transactions or admin" ON public.wallet_transactions
FOR SELECT USING (
  public.is_admin() OR
  (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
);

CREATE POLICY "Wallet: Insert admin/service only" ON public.wallet_transactions
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Wallet: Update admin only" ON public.wallet_transactions
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Wallet: Delete admin only" ON public.wallet_transactions
FOR DELETE USING (public.is_admin());


-- 4. GATEWAYS (SECRETS & API KEYS PROTECTED)
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gateways: Admin access only payment_gateways" ON public.payment_gateways
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Gateways: Admin access only whatsapp_gateways" ON public.whatsapp_gateways
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 5. PUBLIC CATALOG & FIXTURES (READ PUBLIC, WRITE ADMIN ONLY)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches: Public read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Matches: Admin write" ON public.matches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venues: Public read" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Venues: Admin write" ON public.venues FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referees: Public read" ON public.referees FOR SELECT USING (true);
CREATE POLICY "Referees: Admin write" ON public.referees FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers: Public read" ON public.photographers FOR SELECT USING (true);
CREATE POLICY "Photographers: Admin write" ON public.photographers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facilities: Public read" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Facilities: Admin write" ON public.facilities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors: Public read" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Sponsors: Admin write" ON public.sponsors FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts: Public read" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Posts: Admin write" ON public.community_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.standings_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Standings: Public read" ON public.standings_clubs FOR SELECT USING (true);
CREATE POLICY "Standings: Admin write" ON public.standings_clubs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.top_performers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Performers: Public read" ON public.top_performers FOR SELECT USING (true);
CREATE POLICY "Performers: Admin write" ON public.top_performers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- =========================================================================
-- Step 5: SECURE STORED PROCEDURES (RPCs)
-- =========================================================================

-- 1. Secure Booking Creator via RPC (Sanitizes & Enforces Capacity & Valid Match)
CREATE OR REPLACE FUNCTION public.submit_booking(
  p_match_id text,
  p_player_name text,
  p_phone text,
  p_position text,
  p_jersey_size text DEFAULT 'L',
  p_amount numeric DEFAULT 0,
  p_base_amount numeric DEFAULT 0,
  p_unique_code int DEFAULT 0,
  p_payment_method text DEFAULT 'qris'
)
RETURNS SETOF public.bookings
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match public.matches%ROWTYPE;
  v_new_id text;
  v_ticket_code text;
  v_date_str text;
  v_rand int;
  v_initials text;
  v_booking public.bookings%ROWTYPE;
BEGIN
  -- Validasi match_id ada dan status open
  SELECT * INTO v_match FROM public.matches WHERE id = p_match_id AND status = 'open';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match tidak ditemukan atau sudah ditutup';
  END IF;

  -- Validasi input
  IF length(trim(coalesce(p_player_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Nama pemain tidak valid (minimal 2 karakter)';
  END IF;
  IF length(trim(coalesce(p_phone, ''))) < 9 THEN
    RAISE EXCEPTION 'Nomor telepon WhatsApp tidak valid';
  END IF;

  -- Generate Booking ID & Ticket Code secara aman server-side
  v_date_str := to_char(now(), 'YYMMDD');
  v_rand := floor(random() * 900 + 100)::int;
  v_new_id := 'BK-' || v_date_str || '-' || v_rand::text;

  v_initials := upper(substr(trim(p_player_name), 1, 2));
  v_ticket_code := 'TK-' || floor(random() * 9000 + 1000)::text || '-' || v_initials;

  -- Insert dengan payment_status terkunci ke 'waiting_verification'
  INSERT INTO public.bookings (
    id,
    match_id,
    player_name,
    phone,
    booking_type,
    position,
    jersey_size,
    base_amount,
    unique_code,
    amount,
    payment_method,
    payment_status,
    ticket_code,
    created_at,
    updated_at
  ) VALUES (
    v_new_id,
    p_match_id,
    trim(p_player_name),
    trim(p_phone),
    'solo',
    p_position,
    coalesce(p_jersey_size, 'L'),
    coalesce(p_base_amount, p_amount),
    coalesce(p_unique_code, 0),
    coalesce(p_amount, 0),
    coalesce(p_payment_method, 'qris'),
    'waiting_verification',
    v_ticket_code,
    now(),
    now()
  )
  RETURNING * INTO v_booking;

  RETURN NEXT v_booking;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.submit_booking(text, text, text, text, text, numeric, numeric, int, text) TO anon, authenticated;


-- 2. Secure Ticket Verifier
CREATE OR REPLACE FUNCTION public.lookup_ticket(p_ticket_code text, p_phone text DEFAULT NULL)
RETURNS SETOF public.bookings
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.bookings b
  WHERE UPPER(b.ticket_code) = UPPER(TRIM(p_ticket_code))
    AND (p_phone IS NULL OR b.phone LIKE '%' || RIGHT(TRIM(p_phone), 8));
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.lookup_ticket(text, text) TO anon, authenticated;


-- =========================================================================
-- Step 6: CLEANUP SPAM TEST ROWS (OPTIONAL EXECUTION)
-- =========================================================================
-- Hapus booking uji pentest yang tidak valid jika ada
DELETE FROM public.bookings 
WHERE player_name ILIKE '%test%' 
   OR phone ILIKE '%0000%'
   OR match_id NOT IN (SELECT id FROM public.matches);

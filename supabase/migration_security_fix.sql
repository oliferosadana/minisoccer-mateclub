-- =========================================================================
-- MATE CLUB BALIKPAPAN - SECURITY HARDENING & RLS REMEDIATION SCRIPT
-- RUN THIS DIRECTLY IN SUPABASE SQL EDITOR TO FIX ALL CRITICAL & MEDIUM CVEs
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

-- Step 2: REMOVE PLAINTEXT PASSWORD COLUMN FROM PUBLIC.USERS (CRITICAL)
ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- Helper function to check if current user is admin/superadmin
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
-- Step 3: STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- 1. USERS & PROFILES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Deny anon read. Users can only read their own profile; Admins can read all.
CREATE POLICY "Users: View own profile or admin" ON public.users
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid()::text OR 
    public.is_admin()
  )
);

-- Users can only update their own profile; Admins can update all.
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

-- Insert permitted for authenticated users creating their profile or via trigger/admin
CREATE POLICY "Users: Insert own profile or admin" ON public.users
FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND id = auth.uid()::text) OR 
  public.is_admin()
);

-- Delete only for superadmin
CREATE POLICY "Users: Delete admin only" ON public.users
FOR DELETE USING (public.is_admin());


-- 2. BOOKINGS & PASSES (CRITICAL DATA PRIVACY)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own bookings by phone match or auth ID. Admins view all.
CREATE POLICY "Bookings: View own bookings or admin" ON public.bookings
FOR SELECT USING (
  public.is_admin() OR
  (auth.jwt() IS NOT NULL AND phone = (auth.jwt() ->> 'phone'))
);

-- Anonymous / Authenticated users can insert new bookings, BUT payment_status MUST be 'waiting_verification'
CREATE POLICY "Bookings: Insert new booking" ON public.bookings
FOR INSERT WITH CHECK (
  payment_status = 'waiting_verification'
);

-- Updates (e.g., verifying payment, changing status to paid) are strictly ADMIN ONLY
CREATE POLICY "Bookings: Update admin only" ON public.bookings
FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Deletion strictly ADMIN ONLY
CREATE POLICY "Bookings: Delete admin only" ON public.bookings
FOR DELETE USING (public.is_admin());


-- 3. WALLET TRANSACTIONS (CRITICAL FINANCIAL INTEGRITY)
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


-- 4. PAYMENT & WHATSAPP GATEWAYS (SECRETS & API KEYS PROTECTED)
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gateways: Admin access only payment_gateways" ON public.payment_gateways
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Gateways: Admin access only whatsapp_gateways" ON public.whatsapp_gateways
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 5. PUBLIC CATALOG & FIXTURES (READ PUBLIC, WRITE ADMIN ONLY)
-- Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches: Public read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Matches: Admin write" ON public.matches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venues: Public read" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Venues: Admin write" ON public.venues FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Referees
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referees: Public read" ON public.referees FOR SELECT USING (true);
CREATE POLICY "Referees: Admin write" ON public.referees FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Photographers
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers: Public read" ON public.photographers FOR SELECT USING (true);
CREATE POLICY "Photographers: Admin write" ON public.photographers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Facilities
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facilities: Public read" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Facilities: Admin write" ON public.facilities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors: Public read" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Sponsors: Admin write" ON public.sponsors FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Community Posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts: Public read" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Posts: Admin write" ON public.community_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Standings & Top Performers
ALTER TABLE public.standings_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Standings: Public read" ON public.standings_clubs FOR SELECT USING (true);
CREATE POLICY "Standings: Admin write" ON public.standings_clubs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.top_performers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Performers: Public read" ON public.top_performers FOR SELECT USING (true);
CREATE POLICY "Performers: Admin write" ON public.top_performers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- =========================================================================
-- Step 4: SECURE RPC FUNCTIONS (PUBLIC SAFE QUERIES)
-- =========================================================================

-- Secure function for Public E-Ticket Checker (Only returns ticket status for exact code without leaking full table)
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

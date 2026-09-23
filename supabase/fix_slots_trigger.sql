-- =========================================================================
-- MATE CLUB BALIKPAPAN - AUTO SYNC SLOTS & REGISTERED PLAYERS (TRIGGER)
-- JALANKAN DI SUPABASE SQL EDITOR AGAR SLOT TIDAK KEMBALI 0
-- =========================================================================

-- 1. FUNGSI SINKRONISASI DATA PEMAIN TERDAFTAR KE TABEL MATCHES
CREATE OR REPLACE FUNCTION public.sync_match_registered_players(target_match_id text)
RETURNS void AS $$
DECLARE
  players_json jsonb;
BEGIN
  -- Ambil data pemain terdaftar dengan sanitasi (tanpa mengekspos nomor HP ke publik)
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'name', b.player_name,
    'pos', b.position,
    'jerseySize', coalesce(b.jersey_size, 'L'),
    'status', b.payment_status
  )), '[]'::jsonb)
  INTO players_json
  FROM public.bookings b
  WHERE b.match_id = target_match_id;

  -- Update kolom registered_players pada match terkait
  UPDATE public.matches
  SET registered_players = players_json
  WHERE id = target_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER OTOMATIS SAAT ADA BOOKING BARU / UPDATE / DELETE
CREATE OR REPLACE FUNCTION public.trg_sync_match_players()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.sync_match_registered_players(OLD.match_id);
    RETURN OLD;
  ELSE
    PERFORM public.sync_match_registered_players(NEW.match_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bookings_sync_players ON public.bookings;
CREATE TRIGGER trg_bookings_sync_players
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_match_players();

-- 3. EKSEKUSI SINKRONISASI SEKARANG UNTUK SEMUA JADWAL MATCH YANG ADA
DO $$
DECLARE
  m record;
BEGIN
  FOR m IN SELECT id FROM public.matches LOOP
    PERFORM public.sync_match_registered_players(m.id);
  END LOOP;
END $$;

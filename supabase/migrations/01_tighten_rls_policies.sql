-- ==============================================================================
-- DAILYBREAD & CYBERWRAP SUPABASE ROW-LEVEL SECURITY (RLS) TIGHTENING MIGRATION
-- Migration: 01_tighten_rls_policies.sql
-- Purpose: Tighten Row Level Security by replacing unrestricted public SELECT policies
--          with Service Role / Authenticated Admin access, aligning with the target architecture:
--          PUBLIC CLIENT -> DAILYBREAD SERVER API -> SUPABASE SERVICE ROLE -> DATABASE.
-- ==============================================================================

-- 1. ANALYTICS EVENTS (public.analytics_events)
-- Current vulnerability: "Allow public read analytics" allowed anyone with anon key to dump all visitor analytics.
-- Target: Public can INSERT analytics events; only authenticated admins or service_role can SELECT.

DO $$
BEGIN
  -- Drop overly permissive public read policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'analytics_events' 
      AND policyname = 'Allow public read analytics'
  ) THEN
    DROP POLICY "Allow public read analytics" ON public.analytics_events;
  END IF;
END $$;

-- Retain public anonymous insertion for client-side telemetry ingestion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'analytics_events' 
      AND policyname = 'Allow public insert analytics'
  ) THEN
    CREATE POLICY "Allow public insert analytics" ON public.analytics_events 
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow read access only to authenticated admin users (role = 'admin')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'analytics_events' 
      AND policyname = 'Allow authenticated admins read analytics'
  ) THEN
    CREATE POLICY "Allow authenticated admins read analytics" ON public.analytics_events
      FOR SELECT 
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      );
  END IF;
END $$;


-- 2. CYBERWRAP REWARDS (public.cyberwrap_rewards)
-- Current vulnerability: "Allow public read rewards" exposed all player cumulative scores.
-- Target: Drop public read. Server API uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) to read/write.
-- Authenticated admins can view rewards in the admin portal.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cyberwrap_rewards' 
      AND policyname = 'Allow public read rewards'
  ) THEN
    DROP POLICY "Allow public read rewards" ON public.cyberwrap_rewards;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cyberwrap_rewards' 
      AND policyname = 'Allow authenticated admins read rewards'
  ) THEN
    CREATE POLICY "Allow authenticated admins read rewards" ON public.cyberwrap_rewards
      FOR ALL
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      )
      WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      );
  END IF;
END $$;


-- 3. CYBERWRAP COUPONS (public.cyberwrap_coupons)
-- Current vulnerability: "Allow public read coupons" allowed arbitrary scraper to harvest valid coupon codes.
-- Target: Drop public read. Coupon validation and redemption are mediated securely by server endpoints
-- (/api/rewards/validate-coupon and /api/rewards/redeem-coupon) with service role key.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cyberwrap_coupons' 
      AND policyname = 'Allow public read coupons'
  ) THEN
    DROP POLICY "Allow public read coupons" ON public.cyberwrap_coupons;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cyberwrap_coupons' 
      AND policyname = 'Allow authenticated admins manage coupons'
  ) THEN
    CREATE POLICY "Allow authenticated admins manage coupons" ON public.cyberwrap_coupons
      FOR ALL
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      )
      WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      );
  END IF;
END $$;


-- 4. CYBERWRAP REWARD CLAIMS (public.cyberwrap_reward_claims)
-- Current vulnerability: "Allow public read claims" exposed all gameplay claim logs.
-- Target: Drop public read. Server handles score claims atomically with deduplication.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cyberwrap_reward_claims' 
      AND policyname = 'Allow public read claims'
  ) THEN
    DROP POLICY "Allow public read claims" ON public.cyberwrap_reward_claims;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cyberwrap_reward_claims' 
      AND policyname = 'Allow authenticated admins read claims'
  ) THEN
    CREATE POLICY "Allow authenticated admins read claims" ON public.cyberwrap_reward_claims
      FOR SELECT
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      );
  END IF;
END $$;

-- Verify RLS remains enabled on all tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyberwrap_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyberwrap_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyberwrap_reward_claims ENABLE ROW LEVEL SECURITY;

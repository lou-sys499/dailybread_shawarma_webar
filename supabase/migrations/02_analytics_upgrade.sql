-- ==============================================================================
-- DAILYBREAD & CYBERWRAP ANALYTICS UPGRADE MIGRATION
-- Migration: 02_analytics_upgrade.sql
-- Purpose:
-- 1. Safely add nullable columns to analytics_events (visitor_id, event_category, source, medium, referrer, page, path)
-- 2. Create analytics_visitors and analytics_sessions tables
-- 3. Add performance indexes on key query fields
-- 4. Enable RLS with public insert and authenticated admin select
-- ==============================================================================

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. UPGRADE analytics_events TABLE WITH NEW COLUMNS
ALTER TABLE public.analytics_events 
  ADD COLUMN IF NOT EXISTS visitor_id text NULL,
  ADD COLUMN IF NOT EXISTS event_category text NULL,
  ADD COLUMN IF NOT EXISTS source text NULL,
  ADD COLUMN IF NOT EXISTS medium text NULL,
  ADD COLUMN IF NOT EXISTS referrer text NULL,
  ADD COLUMN IF NOT EXISTS page text NULL,
  ADD COLUMN IF NOT EXISTS path text NULL;

-- 2. CREATE PERFORMANCE INDEXES ON analytics_events
CREATE INDEX IF NOT EXISTS analytics_events_visitor_id_idx ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_category_idx ON public.analytics_events(event_category);
CREATE INDEX IF NOT EXISTS analytics_events_source_idx ON public.analytics_events(source);
CREATE INDEX IF NOT EXISTS analytics_events_path_idx ON public.analytics_events(path);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON public.analytics_events(event);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_player_id_idx ON public.analytics_events(player_id);

-- 3. CREATE analytics_visitors TABLE
CREATE TABLE IF NOT EXISTS public.analytics_visitors (
  visitor_id text PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  first_source text NULL,
  first_medium text NULL,
  first_campaign text NULL,
  first_referrer text NULL,
  first_landing_page text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics_visitors
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen ON public.analytics_visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_source ON public.analytics_visitors(first_source);

-- 4. CREATE analytics_sessions TABLE
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  session_id text PRIMARY KEY,
  visitor_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  landing_page text NULL,
  source text NULL,
  medium text NULL,
  campaign text NULL,
  referrer text NULL,
  device_type text NULL,
  browser text NULL,
  os text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics_sessions
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_id ON public.analytics_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_source ON public.analytics_sessions(source);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_campaign ON public.analytics_sessions(campaign);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous insert/upsert for analytics ingestion via service role or public client
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_visitors' AND policyname = 'Allow public insert visitors'
  ) THEN
    CREATE POLICY "Allow public insert visitors" ON public.analytics_visitors FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_visitors' AND policyname = 'Allow public update visitors'
  ) THEN
    CREATE POLICY "Allow public update visitors" ON public.analytics_visitors FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_visitors' AND policyname = 'Allow authenticated read visitors'
  ) THEN
    CREATE POLICY "Allow authenticated read visitors" ON public.analytics_visitors FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_sessions' AND policyname = 'Allow public insert sessions'
  ) THEN
    CREATE POLICY "Allow public insert sessions" ON public.analytics_sessions FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_sessions' AND policyname = 'Allow public update sessions'
  ) THEN
    CREATE POLICY "Allow public update sessions" ON public.analytics_sessions FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_sessions' AND policyname = 'Allow authenticated read sessions'
  ) THEN
    CREATE POLICY "Allow authenticated read sessions" ON public.analytics_sessions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

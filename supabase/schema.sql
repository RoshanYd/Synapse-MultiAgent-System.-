-- ============================================================
-- Synapse Analytics Engine — Supabase Database Schema
-- Execute this in the Supabase SQL Editor (https://app.supabase.com)
-- ============================================================

-- 1. Enable the uuid-ossp extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the competitor_metrics table
CREATE TABLE IF NOT EXISTS competitor_metrics (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    business_niche  TEXT NOT NULL,
    company_name    TEXT NOT NULL,
    current_price   NUMERIC(12, 2) NOT NULL,
    sentiment_score NUMERIC(5, 4) NOT NULL,  -- range: -1.0000 to 1.0000
    predicted_next_price NUMERIC(12, 2) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE competitor_metrics ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for the anon role (development)
--    SELECT: anyone can read all rows
CREATE POLICY "Allow public read access"
    ON competitor_metrics
    FOR SELECT
    TO anon
    USING (true);

--    INSERT: anyone can insert rows
CREATE POLICY "Allow public insert access"
    ON competitor_metrics
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 5. Enable Supabase Realtime replication on this table
--    This lets the frontend subscribe to INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE competitor_metrics;

-- ============================================================
-- Verification: Run these queries to confirm setup
-- SELECT * FROM competitor_metrics;
-- SELECT * FROM pg_publication_tables WHERE tablename = 'competitor_metrics';
-- ============================================================

-- ============================================================
-- Synapse Analytics Engine — Migration 03
-- Niche Launchpad Engine Tables
-- Execute this in the Supabase SQL Editor
-- ============================================================

-- 1. Create industry_templates table
CREATE TABLE IF NOT EXISTS industry_templates (
    id SERIAL PRIMARY KEY,
    category_keyword TEXT NOT NULL UNIQUE,
    steps_json JSONB NOT NULL
);

-- Seed data for industry_templates
INSERT INTO industry_templates (category_keyword, steps_json) VALUES
('saas', '["Phase 1: Validation - Conduct 50 user interviews", "Phase 1: Validation - Build Landing Page & Collect Emails", "Phase 2: MVP Build - Develop Core Loop & Auth", "Phase 2: MVP Build - Integrate Stripe Billing", "Phase 3: Beta Launch - Onboard Waitlist Users", "Phase 3: Beta Launch - Setup Automated Email Sequences", "Phase 4: Scaling - Launch on ProductHunt", "Phase 4: Scaling - Setup Affiliate/Referral Program"]'),
('ecommerce', '["Phase 1: Research - Analyze Top 3 Competitor Funnels", "Phase 1: Research - Finalize Manufacturer/Supplier Agreements", "Phase 2: Setup - Configure Shopify/WooCommerce Backend", "Phase 2: Setup - Optimize Product Photography & Copy", "Phase 3: Pre-Launch - Build Social Media Teaser Campaign", "Phase 3: Pre-Launch - Setup Abandoned Cart Flows", "Phase 4: Go Live - Launch Facebook & Instagram Ads", "Phase 4: Go Live - Initiate Influencer Seeding"]'),
('agency', '["Phase 1: Foundation - Define High-Ticket Irresistible Offer", "Phase 1: Foundation - Identify Exact Buyer Persona", "Phase 2: Funnel - Build VSL (Video Sales Letter) Landing Page", "Phase 2: Funnel - Connect Calendly & CRM Automation", "Phase 3: Outreach - Scrape Target Leads", "Phase 3: Outreach - Launch Cold Email & LinkedIn Campaigns", "Phase 4: Fulfillment - Onboard First 3 Beta Clients", "Phase 4: Fulfillment - Extract Case Studies for Social Proof"]')
ON CONFLICT (category_keyword) DO UPDATE SET steps_json = EXCLUDED.steps_json;

-- 2. Create launch_blueprints table
CREATE TABLE IF NOT EXISTS launch_blueprints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    niche TEXT NOT NULL,
    recommended_price NUMERIC(12, 2) NOT NULL,
    fixed_costs NUMERIC(12, 2),
    break_even_volume NUMERIC(12, 2),
    roadmap_progress JSONB
);

-- 3. Enable RLS
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_blueprints ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for anon (development)
DROP POLICY IF EXISTS "Allow public read access templates" ON industry_templates;
CREATE POLICY "Allow public read access templates" ON industry_templates FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public all access blueprints" ON launch_blueprints;
CREATE POLICY "Allow public all access blueprints" ON launch_blueprints FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. Enable Realtime replication (Safely)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'launch_blueprints'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE launch_blueprints;
    END IF;
END $$;

-- Run this script in the Supabase SQL Editor to add the historical_prices JSONB column
ALTER TABLE competitor_metrics ADD COLUMN IF NOT EXISTS historical_prices JSONB;

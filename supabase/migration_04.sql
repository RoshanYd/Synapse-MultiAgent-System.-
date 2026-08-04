-- Migration 04: Add min_price and max_price for Automated Pricing Tier Extraction

-- Add the new columns
ALTER TABLE competitor_metrics ADD COLUMN IF NOT EXISTS min_price NUMERIC(12, 2);
ALTER TABLE competitor_metrics ADD COLUMN IF NOT EXISTS max_price NUMERIC(12, 2);

-- Backfill existing data with the current simulated price
UPDATE competitor_metrics
SET min_price = current_price,
    max_price = current_price
WHERE min_price IS NULL;

-- Make them NOT NULL for future inserts (optional, but good practice if we always provide a fallback)
ALTER TABLE competitor_metrics ALTER COLUMN min_price SET NOT NULL;
ALTER TABLE competitor_metrics ALTER COLUMN max_price SET NOT NULL;

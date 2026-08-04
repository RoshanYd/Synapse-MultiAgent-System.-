-- Run this script in the Supabase SQL Editor to add the website URL column
ALTER TABLE competitor_metrics ADD COLUMN IF NOT EXISTS website_url TEXT;

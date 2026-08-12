-- migration_04_auth.sql

-- 1. Clear existing data to enforce NOT NULL constraint on user_id safely
TRUNCATE TABLE competitor_metrics;

-- 2. Add user_id column linking to Supabase auth.users
ALTER TABLE competitor_metrics
ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE competitor_metrics ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Users can only SELECT their own data
CREATE POLICY "Users can view own competitors" 
ON competitor_metrics FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only INSERT their own data
CREATE POLICY "Users can insert own competitors" 
ON competitor_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own data
CREATE POLICY "Users can delete own competitors" 
ON competitor_metrics FOR DELETE 
USING (auth.uid() = user_id);

-- Users can only UPDATE their own data (if needed)
CREATE POLICY "Users can update own competitors" 
ON competitor_metrics FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

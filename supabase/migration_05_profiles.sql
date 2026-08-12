-- migration_05_profiles.sql

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create username_changes table to track edits for rate limiting
CREATE TABLE IF NOT EXISTS username_changes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE username_changes ENABLE ROW LEVEL SECURITY;

-- 4. Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Policies for username_changes
CREATE POLICY "Users can view their own changes" 
ON username_changes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own changes" 
ON username_changes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

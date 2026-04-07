-- APEX Driver — Supabase Tables Migration
-- Run this in your Supabase SQL Editor (same project as APEX Tech Pro)
-- All tables prefixed with driver_ to avoid conflicts

-- Driver Profiles
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  diag_count INTEGER DEFAULT 0,
  diag_month TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON driver_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON driver_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Driver Vehicles
CREATE TABLE IF NOT EXISTS driver_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  mileage INTEGER,
  vin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles" ON driver_vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON driver_vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON driver_vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON driver_vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Driver Diagnostic History
CREATE TABLE IF NOT EXISTS driver_diag_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES driver_vehicles(id) ON DELETE SET NULL,
  vehicle TEXT,
  summary TEXT,
  messages JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_diag_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON driver_diag_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON driver_diag_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Driver Glove Box (document storage)
CREATE TABLE IF NOT EXISTS driver_glove_box (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES driver_vehicles(id) ON DELETE SET NULL,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_glove_box ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own docs" ON driver_glove_box
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own docs" ON driver_glove_box
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own docs" ON driver_glove_box
  FOR DELETE USING (auth.uid() = user_id);

-- Driver Scores (gamified maintenance tracking)
CREATE TABLE IF NOT EXISTS driver_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES driver_vehicles(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0,
  history JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON driver_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON driver_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON driver_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role bypass for webhook operations
CREATE POLICY "Service role full access profiles" ON driver_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access history" ON driver_diag_history
  FOR ALL USING (auth.role() = 'service_role');

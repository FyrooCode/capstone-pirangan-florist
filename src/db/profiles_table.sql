-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table in public schema with cascading delete
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear any existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "New users can create their profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" 
  ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow new users to insert their profile
CREATE POLICY "New users can create their profile" 
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow service role (admin) to manage all profiles
CREATE POLICY "Service role can manage all profiles" 
  ON public.profiles
  USING (auth.role() = 'service_role' OR auth.role() = 'supabase_admin');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role, supabase_admin;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);
